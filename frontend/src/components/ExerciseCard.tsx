import { Clock, User, Plus, Check, Printer, Eye, Zap, Image as ImageIcon } from 'lucide-react';
import type { Exercise } from '../types';
import { useTrainingPlanStore } from '../store/useTrainingPlanStore';

interface ExerciseCardProps {
  exercise: Exercise;
  onOpenDetail: (exercise: Exercise) => void;
  onPrintDirect: (exercise: Exercise) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  technik: { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', label: 'Technik' },
  taktik: { bg: 'bg-indigo-100 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300', label: 'Taktik' },
  kondition: { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300', label: 'Kondition' },
  ausdauer: { bg: 'bg-teal-100 dark:bg-teal-950/60', text: 'text-teal-800 dark:text-teal-300', label: 'Ausdauer' },
  home_workout: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', label: 'Home-Workout' },
  zirkel: { bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', label: 'Zirkelübung' },
};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onOpenDetail,
  onPrintDirect,
}) => {
  const addExercise = useTrainingPlanStore((state) => state.addExercise);
  const items = useTrainingPlanStore((state) => state.items);

  const isInPlan = items.some((item) => item.exercise.id === exercise.id);
  const catStyle = CATEGORY_COLORS[exercise.category] || CATEGORY_COLORS.technik;

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all overflow-hidden">
      
      {/* 1. Bildbereich mit Kategorie- und Dauer-Overlay */}
      <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-900 overflow-hidden cursor-pointer" onClick={() => onOpenDetail(exercise)}>
        {exercise.image_path ? (
          <img
            src={exercise.image_path}
            alt={exercise.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-slate-400 dark:text-slate-600 font-medium text-sm">
            Keine Skizze vorhanden
          </div>
        )}

        {/* Kategorie-Badge oben links */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${catStyle.bg} ${catStyle.text} backdrop-blur-md shadow-sm`}>
            {catStyle.label}
          </span>
        </div>

        {/* Dauer oben rechts */}
        <div className="absolute top-2.5 right-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/75 text-white backdrop-blur-md shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            {exercise.duration_minutes} Min.
          </span>
        </div>

        {/* Medienanzahl falls mehrere Medien */}
        {exercise.media && exercise.media.length > 1 && (
          <div className="absolute bottom-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-900/75 text-white backdrop-blur-md shadow">
              <ImageIcon className="w-3 h-3" />
              {exercise.media.length} Medien
            </span>
          </div>
        )}

        {/* Zirkel-Hinweis falls Kategorie Zirkel */}
        {exercise.circuit && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-600 text-white shadow">
              <Zap className="w-3 h-3" />
              {exercise.circuit.work_duration_seconds}s / {exercise.circuit.pause_duration_seconds}s ({exercise.circuit.rounds}x)
            </span>
          </div>
        )}
      </div>

      {/* 2. Content */}
      <div className="flex flex-col flex-1 p-4">
        
        {/* Titel */}
        <h3 
          onClick={() => onOpenDetail(exercise)}
          className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
        >
          {exercise.title}
        </h3>

        {/* Optionaler Autor */}
        {exercise.author_name && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <User className="w-3.5 h-3.5" />
            <span>Autor: <strong className="text-slate-700 dark:text-slate-300">{exercise.author_name}</strong></span>
          </div>
        )}

        {/* Altersklassen Pills */}
        <div className="flex flex-wrap gap-1 mt-2.5">
          {exercise.age_groups.slice(0, 3).map((ag) => (
            <span
              key={ag.code}
              className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 rounded"
            >
              {ag.label}
            </span>
          ))}
          {exercise.age_groups.length > 3 && (
            <span className="text-[10px] font-semibold text-slate-400 self-center">
              +{exercise.age_groups.length - 3}
            </span>
          )}
        </div>

        {/* Muskelgruppen Pills */}
        <div className="flex flex-wrap gap-1 mt-2">
          {exercise.muscle_groups.map((mg) => (
            <span
              key={mg.name}
              className={`inline-block px-1.5 py-0.5 text-[10px] rounded font-medium ${
                mg.intensity === 'primary'
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {mg.name} {mg.intensity === 'primary' ? '★' : ''}
            </span>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-3" />

        {/* 3. Action Buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <button
            onClick={() => addExercise(exercise)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold text-xs transition-all ${
              isInPlan
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-95'
            }`}
          >
            {isInPlan ? (
              <>
                <Check className="w-4 h-4" />
                <span>Im Plan ({items.filter(i => i.exercise.id === exercise.id).length}x)</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Zum Plan</span>
              </>
            )}
          </button>

          <button
            onClick={() => onPrintDirect(exercise)}
            title="Direkt als DIN-A4 Seite drucken"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenDetail(exercise)}
            title="Details & Ablauf anzeigen"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
