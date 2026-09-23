import React, { useState, useMemo } from 'react';
import { 
  X, 
  Upload, 
  Clock, 
  User, 
  Send, 
  Zap, 
  CheckCircle2, 
  Video,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Tag
} from 'lucide-react';
import type { ExerciseCategory, Exercise, ExerciseMedia } from '../types';
import { INITIAL_AGE_GROUPS, INITIAL_MUSCLE_GROUPS } from '../services/api';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExerciseSubmitted: (newExercise: Exercise) => void;
  existingExercises?: Exercise[];
}

interface MediaDraftItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  file?: File;
  caption?: string;
}

const DEFAULT_STANDARD_MATERIALS = [
  'Radballräder',
  'Radbälle',
  'Hütchen / Pylonen',
  'Stoppuhr',
  'Langbank',
  'Tor',
  'Markierungshauben',
  'Sprungkasten',
  'Springseil',
  'Gymnastikmatte'
];

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
  onExerciseSubmitted,
  existingExercises = [],
}) => {
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('technik');
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [description, setDescription] = useState('');

  // Material-Verwaltung (Auswahl + Ergänzung)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [newMaterialInput, setNewMaterialInput] = useState('');

  // Medien (Bilder & Videos)
  const [mediaList, setMediaList] = useState<MediaDraftItem[]>([]);
  const [videoInputUrl, setVideoInputUrl] = useState('');
  const [imageInputUrl, setImageInputUrl] = useState('');

  // Altersbereiche
  const [selectedAgeGroupIds, setSelectedAgeGroupIds] = useState<number[]>([4, 5]);

  // Muskelgruppen mit Intensität
  const [selectedMuscles, setSelectedMuscles] = useState<Record<number, 'primary' | 'secondary'>>({
    4: 'primary', // Rumpf
  });

  // Zirkel-Felder
  const [workSeconds, setWorkSeconds] = useState<number>(45);
  const [pauseSeconds, setPauseSeconds] = useState<number>(15);
  const [rounds, setRounds] = useState<number>(3);
  const [stationNumber, setStationNumber] = useState('');
  const [setupNotes, setSetupNotes] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);

  // Alle verfügbaren Materialien aus bestehenden Übungen + Standard extrahieren
  const availableMaterials = useMemo(() => {
    const set = new Set<string>(DEFAULT_STANDARD_MATERIALS);
    existingExercises.forEach((ex) => {
      if (ex.material) {
        ex.material.split(',').forEach((m) => {
          const trimmed = m.trim();
          if (trimmed.length > 1) {
            set.add(trimmed);
          }
        });
      }
    });
    return Array.from(set).sort();
  }, [existingExercises]);

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

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const handleAddCustomMaterial = () => {
    const trimmed = newMaterialInput.trim();
    if (trimmed && !selectedMaterials.includes(trimmed)) {
      setSelectedMaterials((prev) => [...prev, trimmed]);
      setNewMaterialInput('');
    }
  };

  // Medien-Upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: MediaDraftItem[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      type: 'image',
      url: URL.createObjectURL(file),
      file,
      caption: file.name,
    }));

    setMediaList((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    const trimmed = imageInputUrl.trim();
    if (trimmed) {
      setMediaList((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'image',
          url: trimmed,
        },
      ]);
      setImageInputUrl('');
    }
  };

  const handleAddVideoUrl = () => {
    const trimmed = videoInputUrl.trim();
    if (trimmed) {
      setMediaList((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'video',
          url: trimmed,
        },
      ]);
      setVideoInputUrl('');
    }
  };

  const moveMediaItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mediaList.length) return;

    setMediaList((prev) => {
      const next = [...prev];
      const item = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = item;
      return next;
    });
  };

  const removeMediaItem = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
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

    const finalMedia: ExerciseMedia[] = mediaList.map((m, idx) => ({
      id: idx + 1,
      type: m.type,
      url: m.url,
      sort_order: idx,
      caption: m.caption || null,
    }));

    const firstImage = finalMedia.find((m) => m.type === 'image');
    const firstVideo = finalMedia.find((m) => m.type === 'video');

    const newExercise: Exercise = {
      id: Date.now(),
      title: title.trim(),
      slug: title.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000),
      author_name: authorName.trim() || null,
      category,
      duration_minutes: durationMinutes,
      material: selectedMaterials.length > 0 ? selectedMaterials.join(', ') : null,
      description: description.trim(),
      image_path: firstImage ? firstImage.url : (finalMedia[0]?.url || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80'),
      video_url: firstVideo ? firstVideo.url : null,
      media: finalMedia,
      status: 'pending_review',
      created_at: new Date().toISOString(),
      circuit:
        category === 'zirkel'
          ? {
              work_duration_seconds: workSeconds,
              pause_duration_seconds: pauseSeconds,
              rounds: rounds,
              station_number: stationNumber || null,
              setup_notes: setupNotes || null,
            }
          : null,
      age_groups: selectedAgeGroupObjects,
      muscle_groups: selectedMuscleObjects,
    };

    onExerciseSubmitted(newExercise);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/60">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Neue Radball-Übung einreichen
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Tragen Sie eine Übung für die Trainingssammlung ein.
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Übung erfolgreich eingereicht!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Die Übung wurde im System hinterlegt und kann von Trainern aufgerufen werden.
            </p>
            <button
              onClick={onClose}
              className="py-2 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
            >
              Fenster schließen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            
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
                placeholder="z. B. Torschuss-Präzision aus der Drehung"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Optionaler Autor & Kategorie & Dauer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    placeholder="z. B. Max Mustermann"
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
                  <option value="ausdauer">Ausdauer</option>
                  <option value="home_workout">Home-Workout</option>
                  <option value="zirkel">Zirkelübung</option>
                </select>
              </div>

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
            </div>

            {/* Zirkel-Felder falls Kategorie Zirkel */}
            {category === 'zirkel' && (
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300">
                  <Zap className="w-4 h-4" /> Zirkel-Einstellungen
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-0.5">Belastung (Sek.)</label>
                    <input
                      type="number"
                      value={workSeconds}
                      onChange={(e) => setWorkSeconds(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-0.5">Pause (Sek.)</label>
                    <input
                      type="number"
                      value={pauseSeconds}
                      onChange={(e) => setPauseSeconds(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-0.5">Runden</label>
                    <input
                      type="number"
                      value={rounds}
                      onChange={(e) => setRounds(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-0.5">Station (z.B. 1)</label>
                    <input
                      type="text"
                      value={stationNumber}
                      onChange={(e) => setStationNumber(e.target.value)}
                      placeholder="1"
                      className="w-full p-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-0.5">Hinweise zum Aufbau / Station</label>
                  <input
                    type="text"
                    value={setupNotes}
                    onChange={(e) => setSetupNotes(e.target.value)}
                    placeholder="z. B. 2m Abstand zur Wand..."
                    className="w-full p-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Benötigtes Material (Wiederverwendbare Auswahl + Ergänzung) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Benötigtes Material
                </label>
                <span className="text-[11px] text-slate-400">
                  Klicken zum Auswählen oder unten neues Material hinzufügen
                </span>
              </div>

              {/* Bereits ausgewähltes Material */}
              {selectedMaterials.length > 0 && (
                <div className="mb-2 p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 mr-1 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Ausgewählt:
                  </span>
                  {selectedMaterials.map((mat) => (
                    <span
                      key={mat}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-600 text-white shadow-xs"
                    >
                      {mat}
                      <button
                        type="button"
                        onClick={() => toggleMaterial(mat)}
                        className="hover:text-blue-200 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Vorschläge aus vorhandenen Übungen */}
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                {availableMaterials.map((mat) => {
                  const isSel = selectedMaterials.includes(mat);
                  return (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => toggleMaterial(mat)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isSel
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isSel ? '✓ ' : '+ '}
                      {mat}
                    </button>
                  );
                })}
              </div>

              {/* Neues Material hinzufügen */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newMaterialInput}
                  onChange={(e) => setNewMaterialInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomMaterial();
                    }
                  }}
                  placeholder="Neues Material eintragen (z. B. Schwenkmatte)..."
                  className="flex-1 text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddCustomMaterial}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Hinzufügen
                </button>
              </div>
            </div>

            {/* Beschreibung / Trainingsdurchführung */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Ablauf & Trainingsdurchführung *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="1. Aufbau der Übung...&#10;2. Durchführung & Bewegungsmuster...&#10;3. Coaching-Punkte für den Trainer..."
                className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Muskelgruppen */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Beanspruchte Muskelgruppen (Klick für Primär / Sekundär)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {INITIAL_MUSCLE_GROUPS.map((mg) => {
                  const intensity = selectedMuscles[mg.id];
                  return (
                    <button
                      key={mg.id}
                      type="button"
                      onClick={() => toggleMuscle(mg.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        intensity === 'primary'
                          ? 'bg-blue-600 text-white'
                          : intensity === 'secondary'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {mg.name} {intensity === 'primary' ? '★ (Primär)' : intensity === 'secondary' ? '(Sekundär)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Altersbereiche */}
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

            {/* Medien-Verwaltung: Mehrere Bilder und Videos mit Reihenfolge & Thumbnail */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Bilder & Videos zur Übung
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Das oberste Element in der Liste ist das offizielle Titelbild (Vorschaubild).
                  </span>
                </div>
              </div>

              {/* Eingabemöglichkeiten: Upload, Bild-URL, Video-URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Bilder hinzufügen */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Bilder / Skizzen hinzufügen
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="img-upload-input"
                      multiple
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="img-upload-input"
                      className="cursor-pointer flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Fotos / Skizzen wählen
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageInputUrl}
                      onChange={(e) => setImageInputUrl(e.target.value)}
                      placeholder="Oder Bild-Web-URL..."
                      className="flex-1 text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Videos hinzufügen */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Video-Link hinzufügen (YouTube / Vimeo / MP4)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={videoInputUrl}
                      onChange={(e) => setVideoInputUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddVideoUrl}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5" /> Video +
                    </button>
                  </div>
                </div>
              </div>

              {/* Liste der Medien mit Sortier-Knöpfen */}
              {mediaList.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Reihenfolge der Medien ({mediaList.length}):
                  </span>

                  <div className="space-y-1.5">
                    {mediaList.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                          idx === 0
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {item.type === 'image' ? (
                            <img
                              src={item.url}
                              alt="Vorschau"
                              className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                              <Video className="w-5 h-5" />
                            </div>
                          )}

                          <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              {idx === 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white">
                                  Titelbild
                                </span>
                              )}
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                                {item.caption || (item.type === 'image' ? `Bild #${idx + 1}` : 'Video-Link')}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 truncate block max-w-xs font-mono">
                              {item.url}
                            </span>
                          </div>
                        </div>

                        {/* Steuerungs-Knöpfe */}
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveMediaItem(idx, 'up')}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-600 dark:text-slate-300"
                            title="Nach oben verschieben"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === mediaList.length - 1}
                            onClick={() => moveMediaItem(idx, 'down')}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-600 dark:text-slate-300"
                            title="Nach unten verschieben"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMediaItem(idx)}
                            className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500"
                            title="Entfernen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
