import React from 'react';
import { 
  FolderHeart, 
  X, 
  Play, 
  Copy, 
  Trash2, 
  Star, 
  Clock, 
  Plus, 
  Calendar,
  Check
} from 'lucide-react';
import { useTrainingPlanStore } from '../store/useTrainingPlanStore';

interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  isOpen,
  onClose,
}) => {
  const savedPlans = useTrainingPlanStore((state) => state.savedPlans);
  const activePlanId = useTrainingPlanStore((state) => state.activePlanId);
  const loadSavedPlan = useTrainingPlanStore((state) => state.loadSavedPlan);
  const duplicatePlan = useTrainingPlanStore((state) => state.duplicatePlan);
  const deleteSavedPlan = useTrainingPlanStore((state) => state.deleteSavedPlan);
  const toggleFavoritePlan = useTrainingPlanStore((state) => state.toggleFavoritePlan);
  const clearCurrentPlan = useTrainingPlanStore((state) => state.clearCurrentPlan);

  const [notification, setNotification] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoad = (id: number, title: string) => {
    loadSavedPlan(id);
    setNotification(`Plan "${title}" wurde geladen!`);
    setTimeout(() => {
      setNotification(null);
      onClose();
    }, 800);
  };

  const handleDuplicate = (id: number) => {
    const newId = duplicatePlan(id);
    if (newId) {
      setNotification('Plan wurde als Kopie dupliziert!');
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const handleCreateNew = () => {
    clearCurrentPlan();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Meine gespeicherten Trainingspläne
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Im Benutzerkonto abgelegte Trainingseinheiten mit individueller Übungsabfolge
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification */}
        {notification && (
          <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 border-b border-emerald-200 dark:border-emerald-900">
            <Check className="w-4 h-4" />
            {notification}
          </div>
        )}

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {savedPlans.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FolderHeart className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-sm">Noch keine Trainingspläne gespeichert</p>
              <p className="text-xs mt-1">
                Stelle Übungen im Warenkorb zusammen und speichere deinen Plan unter eigenem Namen.
              </p>
            </div>
          ) : (
            savedPlans.map((plan) => {
              const isActive = activePlanId === plan.id;
              const exerciseCount = plan.items?.length ?? 0;

              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'border-blue-500/60 bg-blue-50/40 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                          {plan.title}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white rounded">
                            Aktiv geladen
                          </span>
                        )}
                        <button
                          onClick={() => toggleFavoritePlan(plan.id)}
                          className="text-slate-300 hover:text-amber-400 dark:hover:text-amber-300 transition-colors"
                          title="Als Favorit markieren"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              plan.is_favorite ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {plan.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {plan.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          {exerciseCount} Übungen
                        </span>
                        {plan.last_used_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Zuletzt genutzt: {new Date(plan.last_used_at).toLocaleDateString('de-DE')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Aktionen pro Plan */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleLoad(plan.id, plan.title)}
                        className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                        title="Diesen Plan in den Builder laden"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Laden
                      </button>

                      <button
                        onClick={() => handleDuplicate(plan.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Als Vorlage duplizieren"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteSavedPlan(plan.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Plan löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Plus className="w-4 h-4" />
            Neuen leeren Plan beginnen
          </button>

          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
