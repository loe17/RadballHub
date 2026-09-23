import React from 'react';
import type { Exercise } from '../types';

interface PrintExerciseA4Props {
  exercise: Exercise;
}

export const PrintExerciseA4: React.FC<PrintExerciseA4Props> = ({ exercise }) => {
  const printImage = (exercise.media && exercise.media.length > 0)
    ? (exercise.media.find((m) => m.type === 'image')?.url || exercise.image_path)
    : exercise.image_path;

  return (
    <div className="a4-print-page bg-white text-slate-900 p-6 flex flex-col justify-between box-border">
      
      {/* 1. Header & Basis-Metadaten */}
      <header className="border-b-2 border-slate-900 pb-3 mb-3">
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="badge-print px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
              {exercise.category}
            </span>
            <span className="badge-print px-2 py-0.5 text-xs font-bold">
              {exercise.duration_minutes} Min. Dauer
            </span>
            <span className="badge-print px-2 py-0.5 text-xs font-semibold">
              {exercise.age_groups.map((a) => a.label).join(', ')}
            </span>
            {exercise.author_name && (
              <span className="badge-print px-2 py-0.5 text-xs font-semibold bg-slate-100">
                Autor: {exercise.author_name}
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-slate-500">RadballHub #EX-{exercise.id}</span>
        </div>

        <h1 className="text-2xl font-black mt-2 text-slate-950 tracking-tight">
          {exercise.title}
        </h1>
      </header>

      {/* 2. Bild / Skizze (Oben platziert) */}
      <div className="print-image-container w-full bg-slate-50 rounded mb-3 flex items-center justify-center overflow-hidden">
        {printImage ? (
          <img
            src={printImage}
            alt={exercise.title}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-slate-400 text-sm italic">
            Keine grafische Skizze hinterlegt
          </div>
        )}
      </div>

      {/* 3. Zweispaltiger Content-Bereich: Ablauf vs. Material & Muskeln */}
      <div className="grid grid-cols-3 gap-5 flex-1 overflow-hidden">
        
        {/* Linke Spalte (2/3): Ablauf & Durchführung */}
        <section className="col-span-2 overflow-hidden flex flex-col">
          <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-900 mb-1 border-b border-slate-300 pb-0.5">
            Ablauf & Trainingsdurchführung:
          </h2>
          <div className="text-[9.5pt] leading-relaxed text-slate-800 whitespace-pre-line text-justify flex-1 overflow-hidden pr-2">
            {exercise.description}
          </div>
        </section>

        {/* Rechte Spalte (1/3): Material, Muskeln, Zirkel */}
        <aside className="col-span-1 border-l border-slate-200 pl-4 flex flex-col gap-3 text-[9pt]">
          
          {/* Benötigtes Material */}
          <div>
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-900 mb-0.5">
              Material:
            </h3>
            <p className="text-slate-700 leading-snug">
              {exercise.material || 'Kein spezielles Material erforderlich'}
            </p>
          </div>

          {/* Belastete Zonen */}
          <div>
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-900 mb-1">
              Beanspruchte Zonen:
            </h3>
            <div className="flex flex-wrap gap-1">
              {exercise.muscle_groups.map((mg) => (
                <span key={mg.name} className="badge-print px-1.5 py-0.5 text-[8pt] font-semibold">
                  {mg.name} {mg.intensity === 'primary' ? '★ (Primär)' : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Zirkel-Box (Falls Zirkelübung) */}
          {exercise.circuit && (
            <div className="border border-slate-900 bg-slate-50 p-2.5 rounded">
              <h3 className="text-xs uppercase font-black text-slate-900 mb-1">
                Zirkel-Parameter:
              </h3>
              <ul className="space-y-0.5 font-medium text-slate-800">
                <li>Belastung: <strong>{exercise.circuit.work_duration_seconds}s</strong></li>
                <li>Pause: <strong>{exercise.circuit.pause_duration_seconds}s</strong></li>
                <li>Runden: <strong>{exercise.circuit.rounds}x</strong></li>
                {exercise.circuit.station_number && (
                  <li>Station: <strong>{exercise.circuit.station_number}</strong></li>
                )}
              </ul>
              {exercise.circuit.setup_notes && (
                <p className="mt-1 text-[8pt] text-slate-600 italic">
                  Hinweis: {exercise.circuit.setup_notes}
                </p>
              )}
            </div>
          )}

        </aside>
      </div>

      {/* 4. Footer */}
      <footer className="border-t border-slate-300 pt-2 mt-2 text-[8pt] text-slate-500 flex justify-between items-center">
        <span>RadballHub – Ausgedruckt für den Hallenbetrieb</span>
        <span>DIN A4 – Seite 1 von 1</span>
      </footer>

    </div>
  );
};
