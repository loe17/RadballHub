import React from 'react';
import { 
  X, 
  Upload, 
  Clock, 
  User, 
  Send, 
  Zap, 
  CheckCircle2, 
  Image as ImageIcon 
} from 'lucide-react';
import type { ExerciseCategory, Exercise } from '../types';
import { INITIAL_AGE_GROUPS, INITIAL_MUSCLE_GROUPS } from '../services/api';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExerciseSubmitted: (newExercise: Exercise) => void;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
  onExerciseSubmitted,
}) => {
  const [title, setTitle] = React.useState('');
  const [authorName, setAuthorName] = React.useState('');
  const [category, setCategory] = React.useState<ExerciseCategory>('technik');
  const [durationMinutes, setDurationMinutes] = React.useState<number>(10);
  const [material, setMaterial] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [videoUrl, setVideoUrl] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');

  // Altersbereiche
  const [selectedAgeGroupIds, setSelectedAgeGroupIds] = React.useState<number[]>([4, 5]);

  // Muskelgruppen mit Intensität
  const [selectedMuscles, setSelectedMuscles] = React.useState<Record<number, 'primary' | 'secondary'>>({
    4: 'primary', // Standard: Rumpf
  });

  // Zirkel-Felder
  const [workSeconds, setWorkSeconds] = React.useState<number>(45);
  const [pauseSeconds, setPauseSeconds] = React.useState<number>(15);
  const [rounds, setRounds] = React.useState<number>(3);
  const [stationNumber, setStationNumber] = React.useState('');
  const [setupNotes, setSetupNotes] = React.useState('');

  const [isSuccess, setIsSuccess] = React.useState(false);

  if (!isOpen) return null;

  const toggleAgeGroup = (id: number) => {
    setSelectedAgeGroupIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleMuscle = (id: number) => {
    setSelectedMuscles((prev) => {
      const next = { ...prev };
      if (next[id] === 'primary') {
        next[id] = 'secondary';
      } else if (next[id] === 'secondary') {
        delete next[id];
      } else {
        next[id] = 'primary';
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedAgeGroupObjects = INITIAL_AGE_GROUPS.filter((ag) =>
      selectedAgeGroupIds.includes(ag.id)
    );

    const selectedMuscleObjects = Object.entries(selectedMuscles).map(([idStr, intensity]) => {
      const mg = INITIAL_MUSCLE_GROUPS.find((m) => m.id === Number(idStr))!;
      return {
        ...mg,
        intensity,
      };
    });

    const newExercise: Exercise = {
      id: Date.now(),
      title: title.trim(),
      slug: title.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000),
      author_name: authorName.trim() || null,
      category,
      duration_minutes: durationMinutes,
      material: material.trim() || null,
      description: description.trim(),
      image_path: imageUrl.trim() || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
      video_url: videoUrl.trim() || null,
      status: 'pending_review',
      created_at: new Date().toISOString(),
      age_groups: selectedAgeGroupObjects,
      muscle_groups: selectedMuscleObjects,
      circuit: category === 'zirkel' ? {
        work_duration_seconds: workSeconds,
        pause_duration_seconds: pauseSeconds,
        rounds,
        station_number: stationNumber.trim() || null,
        setup_notes: setupNotes.trim() || null,
      } : null,
    };

    onExerciseSubmitted(newExercise);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Neue Übung einreichen
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wird nach Prüfung durch einen Moderator für den Katalog freigegeben
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

        {isSuccess ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Vielen Dank für deine Einreichung!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
              Die Übung wurde im System hinterlegt. Der zuständige Admin hat eine E-Mail-Benachrichtigung erhalten und schaltet sie in Kürze frei.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
            
            {/* Titel */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Titel der Übung *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z. B. 2-gegen-1 Konterspiel mit schnellem Torabschluss"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Grid: Autor & Kategorie */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Autor / Urheber (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="z. B. Max Mustermann / Verein X"
                    className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Kategorie *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
                >
                  <option value="technik">Technik</option>
                  <option value="taktik">Taktik</option>
                  <option value="kondition">Kondition</option>
                  <option value="home_workout">Allein / Home-Workout</option>
                  <option value="zirkel">Zirkelübung (Spezialmodus)</option>
                </select>
              </div>
            </div>

            {/* Grid: Dauer & Material */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Dauer (Minuten) *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Benötigtes Material
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="z. B. 2 Räder, 4 Bälle, Hütchen, Stoppuhr"
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Zirkel-Spezialfelder wenn Kategorie Zirkel */}
            {category === 'zirkel' && (
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300">
                  <Zap className="w-4 h-4" />
                  Zirkel-Parameter
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Belastung (Sek.)
                    </label>
                    <input
                      type="number"
                      value={workSeconds}
                      onChange={(e) => setWorkSeconds(Number(e.target.value))}
                      className="w-full text-sm p-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Pause (Sek.)
                    </label>
                    <input
                      type="number"
                      value={pauseSeconds}
                      onChange={(e) => setPauseSeconds(Number(e.target.value))}
                      className="w-full text-sm p-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Runden
                    </label>
                    <input
                      type="number"
                      value={rounds}
                      onChange={(e) => setRounds(Number(e.target.value))}
                      className="w-full text-sm p-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={stationNumber}
                      onChange={(e) => setStationNumber(e.target.value)}
                      placeholder="Stationsnummer (z. B. Station 1)"
                      className="w-full text-xs p-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={setupNotes}
                      onChange={(e) => setSetupNotes(e.target.value)}
                      placeholder="Aufbauhinweis (z. B. Mattenunterlage)"
                      className="w-full text-xs p-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Beschreibung / Ablauf */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Strukturierte Ablaufbeschreibung *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="1. Ausgangsposition...&#10;2. Dynamische Ausführung...&#10;3. Wichtige Trainer-Hinweise und Fehlerquellen..."
                className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Belastete Muskelgruppen mit Klick-Intensität */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Belastete Muskelzonen (Klick: Primär ★ / Sekundär / Abwählen)
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {INITIAL_MUSCLE_GROUPS.map((mg) => {
                  const intensity = selectedMuscles[mg.id];
                  return (
                    <button
                      key={mg.id}
                      type="button"
                      onClick={() => toggleMuscle(mg.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        intensity === 'primary'
                          ? 'bg-red-600 text-white shadow-xs'
                          : intensity === 'secondary'
                          ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {mg.name} {intensity === 'primary' ? '★ (Primär)' : intensity === 'secondary' ? '(Sekundär)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zielgruppen / Altersbereiche */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Geeignete Altersbereiche / Zielgruppen
              </label>
              <div className="flex flex-wrap gap-1.5">
                {INITIAL_AGE_GROUPS.map((ag) => {
                  const isSelected = selectedAgeGroupIds.includes(ag.id);
                  return (
                    <button
                      key={ag.id}
                      type="button"
                      onClick={() => toggleAgeGroup(ag.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {ag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bild & Video Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Bild-URL oder Upload (WebP)
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... (oder Dateiupload)"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Auf Netcup automatisch verlustfrei in WebP komprimiert.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Video-Link (YouTube / Vimeo Embed)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Abbrechen
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                Übung einreichen
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
