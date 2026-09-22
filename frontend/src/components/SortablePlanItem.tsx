import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Clock, Pause, Zap } from 'lucide-react';
import type { TrainingPlanItem } from '../types';

interface SortablePlanItemProps {
  item: TrainingPlanItem;
  index: number;
  onRemove: (id: string) => void;
  onUpdatePause: (id: string, pause: number | null) => void;
  defaultPauseSeconds: number;
}

export const SortablePlanItem: React.FC<SortablePlanItemProps> = ({
  item,
  index,
  onRemove,
  onUpdatePause,
  defaultPauseSeconds,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  const currentPause = item.custom_pause_seconds ?? defaultPauseSeconds;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 p-3 transition-colors shadow-xs"
    >
      <div className="flex items-center gap-2">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 touch-none"
          title="Reihenfolge verschieben"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Positionsnummer */}
        <span className="w-5 text-center font-bold text-xs text-slate-400">
          {index + 1}.
        </span>

        {/* Thumbnail / Mini-Icon */}
        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
          {item.exercise.image_path ? (
            <img
              src={item.exercise.image_path}
              alt={item.exercise.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[10px] font-bold text-slate-400">
              EX
            </div>
          )}
        </div>

        {/* Titel & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              {item.exercise.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-0.5 font-medium">
              <Clock className="w-3 h-3" />
              {item.custom_duration_minutes ?? item.exercise.duration_minutes} Min.
            </span>
            {item.exercise.category === 'zirkel' && (
              <span className="inline-flex items-center gap-0.5 text-purple-600 dark:text-purple-400 font-semibold">
                <Zap className="w-3 h-3" /> Zirkel
              </span>
            )}
            {item.exercise.author_name && (
              <span className="truncate hidden sm:inline">
                von {item.exercise.author_name}
              </span>
            )}
          </div>
        </div>

        {/* Entfernen Button */}
        <button
          onClick={() => onRemove(item.id)}
          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Aus dem Trainingsplan entfernen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Pausenzeiten-Einstellung nach dieser Übung */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Pause className="w-3 h-3 text-blue-500" />
          Pause danach:
        </span>
        <div className="flex items-center gap-1">
          {[30, 60, 90, 120].map((sec) => (
            <button
              key={sec}
              onClick={() => onUpdatePause(item.id, sec)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                currentPause === sec
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
