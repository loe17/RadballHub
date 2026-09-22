import React from 'react';
import type { TrainingPlanItem } from '../types';
import { PrintExerciseA4 } from './PrintExerciseA4';

interface PrintPlanA4Props {
  planTitle: string;
  planDescription?: string;
  items: TrainingPlanItem[];
  defaultPauseSeconds: number;
  totalDurationFormatted: string;
}

export const PrintPlanA4: React.FC<PrintPlanA4Props> = ({
  planTitle,
  planDescription,
  items,
  defaultPauseSeconds,
  totalDurationFormatted,
}) => {
  return (
    <div className="print-only hidden print:block text-slate-900 bg-white">
      
      {/* SEITE 1: Deckblatt & Übersicht / Zeitplan */}
      <div className="a4-print-page bg-white p-8 flex flex-col justify-between box-border">
        
        {/* Header */}
        <header className="border-b-2 border-slate-900 pb-4 mb-4">
          <div className="flex justify-between items-center text-xs font-mono text-slate-500">
            <span>RadballHub – Trainingsplan-Export</span>
            <span>Datum: {new Date().toLocaleDateString('de-DE')}</span>
          </div>
          <h1 className="text-3xl font-black mt-2 text-slate-950 tracking-tight">
            {planTitle}
          </h1>
          {planDescription && (
            <p className="text-xs text-slate-700 mt-1 italic">
              {planDescription}
            </p>
          )}
          <div className="mt-2 text-xs font-semibold text-blue-700">
            Gesamtzeit: {totalDurationFormatted} ({items.length} Übungen)
          </div>
        </header>

        {/* Ablauf-Tabelle */}
        <div className="flex-1 overflow-hidden">
          <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
            Übersicht & Zeitplan der Trainingseinheit:
          </h2>

          <table className="w-full text-left text-[9pt] border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-100">
                <th className="py-1.5 px-2 w-8">#</th>
                <th className="py-1.5 px-2">Übung</th>
                <th className="py-1.5 px-2">Kategorie</th>
                <th className="py-1.5 px-2">Dauer</th>
                <th className="py-1.5 px-2">Pause</th>
                <th className="py-1.5 px-2">Primäre Zonen</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const primaryMuscles = item.exercise.muscle_groups
                  .filter((m) => m.intensity === 'primary')
                  .map((m) => m.name)
                  .join(', ');

                const pause = item.custom_pause_seconds ?? defaultPauseSeconds;

                return (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="py-2 px-2 font-bold">{idx + 1}.</td>
                    <td className="py-2 px-2">
                      <div className="font-bold">{item.exercise.title}</div>
                      {item.exercise.author_name && (
                        <div className="text-[8pt] text-slate-500">
                          Autor: {item.exercise.author_name}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2 uppercase text-[8pt] font-semibold">
                      {item.exercise.category}
                    </td>
                    <td className="py-2 px-2 font-semibold">
                      {item.custom_duration_minutes ?? item.exercise.duration_minutes} Min.
                    </td>
                    <td className="py-2 px-2 text-slate-600">
                      {idx < items.length - 1 ? `${pause}s` : '-'}
                    </td>
                    <td className="py-2 px-2 text-slate-700">
                      {primaryMuscles || 'Ganzkörper'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Trainer-Notizen Notizfeld */}
        <div className="border border-slate-300 p-3 rounded mt-4">
          <h3 className="text-xs uppercase font-bold text-slate-800 mb-1">
            Trainer-Notizen für die Halle:
          </h3>
          <div className="h-16 border-b border-dotted border-slate-300"></div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-300 pt-2 mt-4 text-[8pt] text-slate-500 flex justify-between">
          <span>RadballHub Trainingsplattform</span>
          <span>Seite 1 von {items.length + 1} (Übersicht)</span>
        </footer>

      </div>

      {/* SEITEN 2..N: Jede gewählte Übung auf exakt 1 A4-Seite */}
      {items.map((item) => (
        <div key={item.id}>
          <PrintExerciseA4 exercise={item.exercise} />
        </div>
      ))}

    </div>
  );
};
