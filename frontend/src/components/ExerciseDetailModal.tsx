import React from 'react';
import { 
  X, 
  Clock, 
  User, 
  Printer, 
  Plus, 
  Check, 
  MessageSquare, 
  Zap, 
  Send 
} from 'lucide-react';
import type { Exercise } from '../types';
import { useTrainingPlanStore } from '../store/useTrainingPlanStore';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onPrintA4: (exercise: Exercise) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onPrintA4,
}) => {
  const addExercise = useTrainingPlanStore((state) => state.addExercise);
  const items = useTrainingPlanStore((state) => state.items);

  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const [feedbackText, setFeedbackText] = React.useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = React.useState(false);

  if (!isOpen || !exercise) return null;

  const isInPlan = items.some((item) => item.exercise.id === exercise.id);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    // Simulation / API-Trigger
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackOpen(false);
      setFeedbackText('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-900/60">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md">
                {exercise.category}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                <Clock className="w-3.5 h-3.5" />
                {exercise.duration_minutes} Min.
              </span>
              {exercise.author_name && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                  <User className="w-3 h-3 text-slate-400" />
                  Autor: <strong className="text-slate-800 dark:text-white">{exercise.author_name}</strong>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {exercise.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollbarer Hauptinhalt */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          
          {/* Bild oder Video */}
          <div className="w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
            {exercise.video_url ? (
              <div className="aspect-video w-full">
                <iframe
                  src={exercise.video_url}
                  title={exercise.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : exercise.image_path ? (
              <div className="max-h-80 w-full flex items-center justify-center bg-slate-950">
                <img
                  src={exercise.image_path}
                  alt={exercise.title}
                  className="max-h-80 w-full object-contain"
                />
              </div>
            ) : null}
          </div>

          {/* Ablauf & Durchführung */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
              Ablauf & Beschreibung
            </h3>
            <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              {exercise.description}
            </div>
          </div>

          {/* Zwei-Spalten-Grid: Material & Muskelzonen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Material */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1.5">
                Benötigtes Material
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {exercise.material || 'Kein spezielles Material erforderlich.'}
              </p>
            </div>

            {/* Muskelgruppen & Altersklassen */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1">
                  Beanspruchte Zonen
                </h4>
                <div className="flex flex-wrap gap-1">
                  {exercise.muscle_groups.map((mg) => (
                    <span
                      key={mg.name}
                      className={`inline-block px-2 py-0.5 text-xs rounded font-medium ${
                        mg.intensity === 'primary'
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {mg.name} {mg.intensity === 'primary' ? '★' : ''}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1">
                  Zielgruppe / Alter
                </h4>
                <div className="flex flex-wrap gap-1">
                  {exercise.age_groups.map((ag) => (
                    <span
                      key={ag.code}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded"
                    >
                      {ag.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Zirkel-Box falls vorhanden */}
          {exercise.circuit && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1 mb-2">
                <Zap className="w-4 h-4" />
                Zirkel-Metadaten
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xs">
                  <span className="block text-[11px] text-slate-500">Belastung</span>
                  <strong className="text-sm font-bold text-slate-900 dark:text-white">{exercise.circuit.work_duration_seconds}s</strong>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xs">
                  <span className="block text-[11px] text-slate-500">Pause</span>
                  <strong className="text-sm font-bold text-slate-900 dark:text-white">{exercise.circuit.pause_duration_seconds}s</strong>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xs">
                  <span className="block text-[11px] text-slate-500">Runden</span>
                  <strong className="text-sm font-bold text-slate-900 dark:text-white">{exercise.circuit.rounds}x</strong>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xs">
                  <span className="block text-[11px] text-slate-500">Station</span>
                  <strong className="text-sm font-bold text-slate-900 dark:text-white">{exercise.circuit.station_number || '-'}</strong>
                </div>
              </div>
              {exercise.circuit.setup_notes && (
                <p className="mt-2 text-xs text-purple-800 dark:text-purple-300">
                  <strong>Aufbauhinweis:</strong> {exercise.circuit.setup_notes}
                </p>
              )}
            </div>
          )}

          {/* Feedback-Formular Toggle */}
          <div className="pt-2">
            {!feedbackOpen ? (
              <button
                onClick={() => setFeedbackOpen(true)}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Änderungshinweis oder Feedback zu dieser Übung mitteilen
              </button>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Feedback / Korrekturvorschlag für die Moderation
                  </h5>
                  <button
                    type="button"
                    onClick={() => setFeedbackOpen(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Abbrechen
                  </button>
                </div>

                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Beschreibe deinen Änderungsvorschlag oder melde Fehler (z. B. fehlendes Material, unklare Beschreibung)..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
                  required
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Hinweis senden
                  </button>
                </div>

                {feedbackSubmitted && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    Vielen Dank! Dein Feedback wurde an den Moderator übermittelt.
                  </p>
                )}
              </form>
            )}
          </div>

        </div>

        {/* Footer Aktionen */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-3">
          <button
            onClick={() => onPrintA4(exercise)}
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Als DIN-A4 Seite drucken
          </button>

          <button
            onClick={() => {
              addExercise(exercise);
              onClose();
            }}
            className={`flex items-center gap-1.5 py-2.5 px-5 rounded-xl font-bold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 ${
              isInPlan
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isInPlan ? (
              <>
                <Check className="w-4 h-4" />
                Im Plan ({items.filter(i => i.exercise.id === exercise.id).length}x)
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Zum Trainingsplan hinzufügen
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
