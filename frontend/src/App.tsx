import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Dumbbell, 
  X, 
  Zap,
  RotateCcw
} from 'lucide-react';
import type { Exercise } from './types';
import { INITIAL_EXERCISES, INITIAL_AGE_GROUPS, INITIAL_MUSCLE_GROUPS } from './services/api';
import { Header } from './components/Header';
import { ExerciseCard } from './components/ExerciseCard';
import { ExerciseDetailModal } from './components/ExerciseDetailModal';
import { PlanDrawer } from './components/PlanDrawer';
import { SavedPlansModal } from './components/SavedPlansModal';
import { SubmissionModal } from './components/SubmissionModal';
import { PrintExerciseA4 } from './components/PrintExerciseA4';
import { PrintPlanA4 } from './components/PrintPlanA4';
import { useTrainingPlanStore } from './store/useTrainingPlanStore';

export function App() {
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [currentTab, setCurrentTab] = useState<'catalog' | 'plans' | 'moderation'>('catalog');

  // Filter & Suche
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');

  // Modals & Prints
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [isSavedPlansOpen, setIsSavedPlansOpen] = useState(false);
  const [singlePrintExercise, setSinglePrintExercise] = useState<Exercise | null>(null);
  const [isPrintingFullPlan, setIsPrintingFullPlan] = useState(false);

  // Darkmode & System Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const planItems = useTrainingPlanStore((state) => state.items);
  const activePlanTitle = useTrainingPlanStore((state) => state.activePlanTitle);
  const defaultPauseSeconds = useTrainingPlanStore((state) => state.defaultPauseSeconds);
  const getTotalDurationFormatted = useTrainingPlanStore((state) => state.getTotalDurationFormatted);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Drucken einer einzelnen Übung (DIN-A4 1 Seite)
  const handlePrintSingle = (exercise: Exercise) => {
    setSinglePrintExercise(exercise);
    setIsPrintingFullPlan(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Drucken des kompletten Trainingsplans (Mehrseitig)
  const handlePrintFullPlan = () => {
    setSinglePrintExercise(null);
    setIsPrintingFullPlan(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Neue Übungseingabe hinzufügen
  const handleExerciseSubmitted = (newExercise: Exercise) => {
    setExercises((prev) => [newExercise, ...prev]);
  };

  // Katalog-Backup als strukturierte JSON/CSV Datei herunterladen
  const handleDownloadBackup = () => {
    const backupData = {
      export_date: new Date().toISOString(),
      platform: 'RadballHub Trainingsplattform',
      total_exercises: exercises.length,
      exercises: exercises.map((ex) => ({
        ...ex,
        author: ex.author_name || 'k. A.',
      })),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radballhub_katalog_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter-Reset
  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedAgeGroup('all');
    setSelectedMuscle('all');
    setSelectedAuthor('');
  };

  // Gefilterte Übungen berechnen
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      // 1. Suche nach Titel, Beschreibung, Material oder Autor
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = ex.title.toLowerCase().includes(query);
        const matchesDesc = ex.description.toLowerCase().includes(query);
        const matchesMat = ex.material?.toLowerCase().includes(query) ?? false;
        const matchesAuthor = ex.author_name?.toLowerCase().includes(query) ?? false;
        if (!matchesTitle && !matchesDesc && !matchesMat && !matchesAuthor) return false;
      }

      // 2. Kategorie
      if (selectedCategory !== 'all' && ex.category !== selectedCategory) {
        return false;
      }

      // 3. Altersgruppe
      if (selectedAgeGroup !== 'all') {
        const hasAge = ex.age_groups.some(
          (ag) => ag.code === selectedAgeGroup || ag.label === selectedAgeGroup
        );
        if (!hasAge) return false;
      }

      // 4. Muskelgruppe
      if (selectedMuscle !== 'all') {
        const hasMuscle = ex.muscle_groups.some((mg) => mg.code === selectedMuscle);
        if (!hasMuscle) return false;
      }

      // 5. Autor
      if (selectedAuthor.trim()) {
        if (!ex.author_name?.toLowerCase().includes(selectedAuthor.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [exercises, search, selectedCategory, selectedAgeGroup, selectedMuscle, selectedAuthor]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* App Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openSubmissionModal={() => setIsSubmissionOpen(true)}
        openSavedPlansModal={() => setIsSavedPlansOpen(true)}
        handleDownloadBackup={handleDownloadBackup}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:hidden">
        
        {/* Banner / Hero */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white shadow-xl shadow-blue-900/10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-3">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Netcup Webhosting Edition • Modular & Touch-Optimiert
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Trainings- & Übungsplattform
            </h1>
            <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
              Erstelle strukturierte Radball-Trainingseinheiten, vermeide Überlastungen mit der intelligenten Belastungs-Validierung und drucke jede Übung exakt auf 1 DIN-A4 Seite für die Halle.
            </p>
          </div>
        </div>

        {/* Filter- & Suchleiste */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Volltextsuche */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Suche nach Titel, Ablauf, Material oder Autor..."
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter: Kategorie */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white outline-hidden focus:border-blue-500 font-medium"
              >
                <option value="all">Alle Kategorien</option>
                <option value="technik">Technik</option>
                <option value="taktik">Taktik</option>
                <option value="kondition">Kondition</option>
                <option value="home_workout">Home-Workout</option>
                <option value="zirkel">Zirkelübung</option>
              </select>
            </div>

            {/* Filter: Altersbereich */}
            <div>
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white outline-hidden focus:border-blue-500 font-medium"
              >
                <option value="all">Alle Altersklassen</option>
                {INITIAL_AGE_GROUPS.map((ag) => (
                  <option key={ag.code} value={ag.code}>
                    {ag.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Erweiterte Filter-Zeile: Muskelgruppen & Autor */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Muskelzone:
              </span>
              <button
                onClick={() => setSelectedMuscle('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedMuscle === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Alle
              </button>
              {INITIAL_MUSCLE_GROUPS.map((mg) => (
                <button
                  key={mg.code}
                  onClick={() => setSelectedMuscle(selectedMuscle === mg.code ? 'all' : mg.code)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    selectedMuscle === mg.code
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {mg.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {(selectedCategory !== 'all' || selectedAgeGroup !== 'all' || selectedMuscle !== 'all' || search) && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Filter zurücksetzen
              </button>
            )}
          </div>

        </div>

        {/* Ergebnis-Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Übungskatalog ({filteredExercises.length} Übungen)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Klicke auf eine Übung für Details & DIN-A4 Druckansicht
          </span>
        </div>

        {/* Übungs-Grid */}
        {filteredExercises.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <Dumbbell className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-40" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Keine passenden Übungen gefunden
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Versuche deine Filtereinstellungen zu lockern oder reiche eine neue Übung ein.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
            >
              Alle Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onOpenDetail={(ex) => setDetailExercise(ex)}
                onPrintDirect={handlePrintSingle}
              />
            ))}
          </div>
        )}

      </main>

      {/* Plan-Builder Drawer ("Warenkorb") */}
      <PlanDrawer
        onPrintFullPlan={handlePrintFullPlan}
        openSavedPlansModal={() => setIsSavedPlansOpen(true)}
      />

      {/* Übungsdetail-Modal */}
      <ExerciseDetailModal
        exercise={detailExercise}
        isOpen={Boolean(detailExercise)}
        onClose={() => setDetailExercise(null)}
        onPrintA4={handlePrintSingle}
      />

      {/* Gespeicherte Pläne Modal (Account-Verwaltung) */}
      <SavedPlansModal
        isOpen={isSavedPlansOpen}
        onClose={() => setIsSavedPlansOpen(false)}
      />

      {/* Neue Übung einreichen Modal */}
      <SubmissionModal
        isOpen={isSubmissionOpen}
        onClose={() => setIsSubmissionOpen(false)}
        onExerciseSubmitted={handleExerciseSubmitted}
      />

      {/* 
        DRUCK-CONTAINER (Wird nur im Browser-Druckauftrag @media print gerendert) 
      */}
      {singlePrintExercise && (
        <div className="hidden print:block">
          <PrintExerciseA4 exercise={singlePrintExercise} />
        </div>
      )}

      {isPrintingFullPlan && (
        <PrintPlanA4
          planTitle={activePlanTitle}
          items={planItems}
          defaultPauseSeconds={defaultPauseSeconds}
          totalDurationFormatted={getTotalDurationFormatted()}
        />
      )}

    </div>
  );
}

export default App;
