import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TrainingPlan, TrainingPlanItem, Exercise } from '../types';

interface TrainingPlanState {
  // Aktiver Plan im Drawer / Builder
  activePlanId: number | null;
  activePlanTitle: string;
  activePlanDescription: string;
  defaultPauseSeconds: number;
  items: TrainingPlanItem[];

  // Gespeicherte Pläne im Account
  savedPlans: TrainingPlan[];

  // Drawer UI State
  isDrawerOpen: boolean;

  // Aktionen für den aktiven Plan
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  setPlanTitle: (title: string) => void;
  setPlanDescription: (desc: string) => void;
  setDefaultPauseSeconds: (seconds: number) => void;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (itemId: string) => void;
  reorderItems: (oldIndex: number, newIndex: number) => void;
  updateItemPause: (itemId: string, pauseSeconds: number | null) => void;
  updateItemDuration: (itemId: string, durationMinutes: number | null) => void;
  clearCurrentPlan: () => void;

  // Account Multi-Plan Aktionen
  saveCurrentPlan: (customTitle?: string) => number;
  loadSavedPlan: (planId: number) => void;
  duplicatePlan: (planId: number) => number;
  deleteSavedPlan: (planId: number) => void;
  toggleFavoritePlan: (planId: number) => void;

  // Berechnete Summen
  getTotalExerciseMinutes: () => number;
  getTotalPauseSeconds: () => number;
  getTotalDurationFormatted: () => string;
}

// Initialer Demo-Plan im Account
const initialSavedPlans: TrainingPlan[] = [
  {
    id: 1,
    title: 'Saisonauftakt U17: Schnellkraft & Schlagtechnik',
    description: 'Intensiver 45-Minuten-Plan zur Vorbereitung auf die Spieltagsserie.',
    is_favorite: true,
    default_pause_between_exercises_seconds: 60,
    last_used_at: new Date().toISOString(),
    items: [],
  },
  {
    id: 2,
    title: 'Mittwochs-Zirkel: Core & Oberschenkel',
    description: 'Hallen-Workout zur Steigerung der Radbeherrschung und Kraftausdauer.',
    is_favorite: false,
    default_pause_between_exercises_seconds: 90,
    last_used_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    items: [],
  }
];

export const useTrainingPlanStore = create<TrainingPlanState>()(
  persist(
    (set, get) => ({
      activePlanId: null,
      activePlanTitle: 'Neuer Trainingsplan',
      activePlanDescription: '',
      defaultPauseSeconds: 60,
      items: [],
      savedPlans: initialSavedPlans,
      isDrawerOpen: false,

      setDrawerOpen: (open) => set({ isDrawerOpen: open }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      setPlanTitle: (title) => set({ activePlanTitle: title }),
      setPlanDescription: (desc) => set({ activePlanDescription: desc }),
      setDefaultPauseSeconds: (seconds) => set({ defaultPauseSeconds: seconds }),

      addExercise: (exercise) => {
        const newItem: TrainingPlanItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          exercise,
          custom_duration_minutes: exercise.duration_minutes,
          custom_pause_seconds: null,
          sort_order: get().items.length + 1,
        };
        set((state) => ({
          items: [...state.items, newItem],
          isDrawerOpen: true, // Automatisch Drawer öffnen beim Hinzufügen
        }));
      },

      removeExercise: (itemId) => {
        set((state) => ({
          items: state.items
            .filter((item) => item.id !== itemId)
            .map((item, idx) => ({ ...item, sort_order: idx + 1 })),
        }));
      },

      reorderItems: (oldIndex, newIndex) => {
        set((state) => {
          const newItems = [...state.items];
          const [movedItem] = newItems.splice(oldIndex, 1);
          newItems.splice(newIndex, 0, movedItem);
          return {
            items: newItems.map((item, idx) => ({ ...item, sort_order: idx + 1 })),
          };
        });
      },

      updateItemPause: (itemId, pauseSeconds) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, custom_pause_seconds: pauseSeconds } : item
          ),
        }));
      },

      updateItemDuration: (itemId, durationMinutes) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, custom_duration_minutes: durationMinutes } : item
          ),
        }));
      },

      clearCurrentPlan: () => {
        set({
          activePlanId: null,
          activePlanTitle: 'Neuer Trainingsplan',
          activePlanDescription: '',
          items: [],
        });
      },

      // Speichert aktuellen Plan im Benutzerkonto
      saveCurrentPlan: (customTitle) => {
        const state = get();
        const titleToSave = (customTitle || state.activePlanTitle).trim() || 'Unbenannter Trainingsplan';
        const nowIso = new Date().toISOString();

        if (state.activePlanId) {
          // Bestehenden Plan überschreiben
          set((s) => ({
            activePlanTitle: titleToSave,
            savedPlans: s.savedPlans.map((p) =>
              p.id === state.activePlanId
                ? {
                    ...p,
                    title: titleToSave,
                    description: s.activePlanDescription,
                    default_pause_between_exercises_seconds: s.defaultPauseSeconds,
                    last_used_at: nowIso,
                    items: [...s.items],
                  }
                : p
            ),
          }));
          return state.activePlanId;
        } else {
          // Neuen Plan erstellen
          const newId = Date.now();
          const newPlan: TrainingPlan = {
            id: newId,
            title: titleToSave,
            description: state.activePlanDescription,
            is_favorite: false,
            default_pause_between_exercises_seconds: state.defaultPauseSeconds,
            last_used_at: nowIso,
            created_at: nowIso,
            items: [...state.items],
          };

          set((s) => ({
            activePlanId: newId,
            activePlanTitle: titleToSave,
            savedPlans: [newPlan, ...s.savedPlans],
          }));
          return newId;
        }
      },

      loadSavedPlan: (planId) => {
        const state = get();
        const plan = state.savedPlans.find((p) => p.id === planId);
        if (plan) {
          const nowIso = new Date().toISOString();
          set((s) => ({
            activePlanId: plan.id,
            activePlanTitle: plan.title,
            activePlanDescription: plan.description || '',
            defaultPauseSeconds: plan.default_pause_between_exercises_seconds || 60,
            items: [...plan.items],
            isDrawerOpen: true,
            savedPlans: s.savedPlans.map((p) =>
              p.id === planId ? { ...p, last_used_at: nowIso } : p
            ),
          }));
        }
      },

      duplicatePlan: (planId) => {
        const state = get();
        const source = state.savedPlans.find((p) => p.id === planId);
        if (!source) return 0;

        const newId = Date.now();
        const nowIso = new Date().toISOString();
        const clonedPlan: TrainingPlan = {
          ...source,
          id: newId,
          title: `Kopie von ${source.title}`,
          is_favorite: false,
          created_at: nowIso,
          last_used_at: nowIso,
          items: source.items.map((item) => ({
            ...item,
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          })),
        };

        set((s) => ({
          savedPlans: [clonedPlan, ...s.savedPlans],
        }));
        return newId;
      },

      deleteSavedPlan: (planId) => {
        set((s) => ({
          savedPlans: s.savedPlans.filter((p) => p.id !== planId),
          activePlanId: s.activePlanId === planId ? null : s.activePlanId,
        }));
      },

      toggleFavoritePlan: (planId) => {
        set((s) => ({
          savedPlans: s.savedPlans.map((p) =>
            p.id === planId ? { ...p, is_favorite: !p.is_favorite } : p
          ),
        }));
      },

      getTotalExerciseMinutes: () => {
        return get().items.reduce(
          (acc, item) => acc + (item.custom_duration_minutes ?? item.exercise.duration_minutes),
          0
        );
      },

      getTotalPauseSeconds: () => {
        const state = get();
        if (state.items.length <= 1) return 0;
        // Pausen zwischen den Übungen (für N Übungen gibt es N-1 Zwischenpausen)
        return state.items.slice(0, -1).reduce(
          (acc, item) => acc + (item.custom_pause_seconds ?? state.defaultPauseSeconds),
          0
        );
      },

      getTotalDurationFormatted: () => {
        const exMinutes = get().getTotalExerciseMinutes();
        const pauseSeconds = get().getTotalPauseSeconds();
        const totalMinutes = Math.round(exMinutes + pauseSeconds / 60);
        return `${totalMinutes} Min. (${exMinutes} Min. Übung + ${Math.round(pauseSeconds / 60)} Min. Pause)`;
      },
    }),
    {
      name: 'radballhub_training_plan_storage',
    }
  )
);
