import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  X,
  Printer,
  Save,
  Trash2,
  AlertTriangle,
  Clock,
  Dumbbell,
  FolderHeart,
  Edit2,
  Check,
} from 'lucide-react';
import { useTrainingPlanStore } from '../store/useTrainingPlanStore';
import { SortablePlanItem } from './SortablePlanItem';
import { analyzeFatigueConflicts } from '../utils/fatigueDetector';

interface PlanDrawerProps {
  onPrintFullPlan: () => void;
  openSavedPlansModal: () => void;
}

export const PlanDrawer: React.FC<PlanDrawerProps> = ({
  onPrintFullPlan,
  openSavedPlansModal,
}) => {
  const isDrawerOpen = useTrainingPlanStore((state) => state.isDrawerOpen);
  const setDrawerOpen = useTrainingPlanStore((state) => state.setDrawerOpen);
  const items = useTrainingPlanStore((state) => state.items);
  const activePlanTitle = useTrainingPlanStore((state) => state.activePlanTitle);
  const setPlanTitle = useTrainingPlanStore((state) => state.setPlanTitle);
  const activePlanId = useTrainingPlanStore((state) => state.activePlanId);
  const defaultPauseSeconds = useTrainingPlanStore((state) => state.defaultPauseSeconds);
  const reorderItems = useTrainingPlanStore((state) => state.reorderItems);
  const removeExercise = useTrainingPlanStore((state) => state.removeExercise);
  const updateItemPause = useTrainingPlanStore((state) => state.updateItemPause);
  const clearCurrentPlan = useTrainingPlanStore((state) => state.clearCurrentPlan);
  const saveCurrentPlan = useTrainingPlanStore((state) => state.saveCurrentPlan);
  const getTotalDurationFormatted = useTrainingPlanStore((state) => state.getTotalDurationFormatted);

  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [tempTitle, setTempTitle] = React.useState(activePlanTitle);
  const [saveSuccessMsg, setSaveSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTempTitle(activePlanTitle);
  }, [activePlanTitle]);

  // Sensoren für Drag and Drop (Mouse & Touch-optimiert)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Verhindert ungewolltes Ziehen bei Klick
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      reorderItems(oldIndex, newIndex);
    }
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      setPlanTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleSaveToAccount = () => {
    saveCurrentPlan(tempTitle.trim());
    setSaveSuccessMsg(`Trainingsplan "${tempTitle.trim()}" im Account gesichert!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Ermüdungs-Validierung in Echtzeit berechnen
  const fatigueWarnings = React.useMemo(() => {
    return analyzeFatigueConflicts(items, defaultPauseSeconds);
  }, [items, defaultPauseSeconds]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end print:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full border-l border-slate-200 dark:border-slate-800 z-10 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex-1 min-w-0 pr-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  autoFocus
                  className="w-full text-base font-bold bg-white dark:bg-slate-800 border border-blue-500 rounded px-2 py-1 text-slate-900 dark:text-white outline-hidden"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {activePlanTitle}
                </h3>
                <Edit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0" />
              </div>
            )}
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {activePlanId ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Im Account gespeichert
                </span>
              ) : (
                <span>Neuer Entwurf</span>
              )}
              <span>•</span>
              <span>{items.length} Übungen</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={openSavedPlansModal}
              title="Meine gespeicherten Pläne aufrufen"
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <FolderHeart className="w-5 h-5 text-rose-500" />
            </button>

            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Erfolgsmeldung */}
        {saveSuccessMsg && (
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border-b border-emerald-200 dark:border-emerald-900">
            <Check className="w-4 h-4" />
            {saveSuccessMsg}
          </div>
        )}

        {/* Liste mit Drag and Drop */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400 dark:text-slate-500">
              <Dumbbell className="w-12 h-12 mb-3 stroke-[1.5]" />
              <p className="font-semibold text-sm">Noch keine Übungen im Plan</p>
              <p className="text-xs mt-1 max-w-xs">
                Klicke im Übungskatalog auf "Zum Plan", um diesen Trainingsplan zusammenzustellen.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item, index) => {
                  // Prüfen, ob für dieses Item eine Ermüdungswarnung vorliegt
                  const warning = fatigueWarnings.find((w) => w.itemIndex === index);

                  return (
                    <React.Fragment key={item.id}>
                      {/* Ermüdungswarnung (falls 2 aufeinanderfolgende Übungen kollidieren) */}
                      {warning && (
                        <div
                          className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 animate-pulse ${
                            warning.severity === 'critical'
                              ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-900 text-red-700 dark:text-red-300'
                              : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-900 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div className="flex-1 leading-tight">
                            <span className="font-bold block mb-0.5">
                              {warning.severity === 'critical' ? 'Ermüdungsrisiko!' : 'Vorbelastungshinweis:'}
                            </span>
                            {warning.message}
                          </div>
                        </div>
                      )}

                      <SortablePlanItem
                        item={item}
                        index={index}
                        onRemove={removeExercise}
                        onUpdatePause={updateItemPause}
                        defaultPauseSeconds={defaultPauseSeconds}
                      />
                    </React.Fragment>
                  );
                })}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer & Aktionen */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 space-y-3">
            
            {/* Summen-Berechnung */}
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Gesamtdauer:
              </span>
              <strong className="text-slate-900 dark:text-white text-sm">
                {getTotalDurationFormatted()}
              </strong>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSaveToAccount}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                Im Account speichern
              </button>

              <button
                onClick={onPrintFullPlan}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 active:scale-95"
              >
                <Printer className="w-4 h-4" />
                Drucken (DIN-A4)
              </button>
            </div>

            <div className="flex justify-between items-center pt-1 text-[11px]">
              <button
                onClick={clearCurrentPlan}
                className="text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Plan leeren
              </button>
              <span className="text-slate-400">Übungen per Drag & Drop verschiebbar</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
