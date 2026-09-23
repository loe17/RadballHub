import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  User, 
  Printer, 
  Plus, 
  Check, 
  Zap, 
  Video 
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

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  if (!isOpen || !exercise) return null;

  const isInPlan = items.some((item) => item.exercise.id === exercise.id);

  // Medien-Liste vorbereiten (entweder aus exercise.media oder Fallbacks)
  const mediaItems = (exercise.media && exercise.media.length > 0)
    ? exercise.media
    : [
        ...(exercise.image_path ? [{ id: 1, type: 'image' as const, url: exercise.image_path, sort_order: 0 }] : []),
        ...(exercise.video_url ? [{ id: 2, type: 'video' as const, url: exercise.video_url, sort_order: 1 }] : [])
      ];

  const currentMedia = mediaItems[activeMediaIndex] || mediaItems[0] || null;

  // Hilfsfunktion: YouTube URLs in Embed-URLs konvertieren
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('youtube.com/watch?v=', 'youtube.com/embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
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
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6">
          
          {/* Medien-Galerie */}
          {currentMedia && (
            <div className="space-y-2">
              <div className="w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                {currentMedia.type === 'video' ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={getEmbedUrl(currentMedia.url)}
                      title={exercise.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="max-h-80 w-full flex items-center justify-center">
                    <img
                      src={currentMedia.url}
                      alt={exercise.title}
                      className="max-h-80 w-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Galerie-Vorschaubilder falls mehrere Medien existieren */}
              {mediaItems.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
                  {mediaItems.map((m, idx) => (
                    <button
                      key={m.id || idx}
                      type="button"
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeMediaIndex === idx
                          ? 'border-blue-600 scale-105 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      {m.type === 'image' ? (
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center">
                          <Video className="w-5 h-5 text-red-400" />
                        </div>
                      )}
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-blue-600 text-[8px] text-white font-bold text-center">
                          Titel
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300 mb-2">
                <Zap className="w-4 h-4 text-purple-600" />
                Zirkel-Parameter: {exercise.circuit.station_number || 'Station'}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg text-center">
                  <span className="block text-slate-400 text-[10px]">Belastung</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {exercise.circuit.work_duration_seconds} Sek.
                  </span>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg text-center">
                  <span className="block text-slate-400 text-[10px]">Pause</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {exercise.circuit.pause_duration_seconds} Sek.
                  </span>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg text-center">
                  <span className="block text-slate-400 text-[10px]">Runden</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {exercise.circuit.rounds}x
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer-Aktionen */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={() => onPrintA4(exercise)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            DIN-A4 Druckblatt
          </button>

          <button
            onClick={() => addExercise(exercise)}
            className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 ${
              isInPlan
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {isInPlan ? (
              <>
                <Check className="w-4 h-4" /> Bereits im Trainingsplan
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Zum Trainingsplan hinzufügen
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
