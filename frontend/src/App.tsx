import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  RotateCcw,
  Layers
} from 'lucide-react';
import type { Exercise, User } from './types';
import { 
  INITIAL_EXERCISES, 
  INITIAL_AGE_GROUPS, 
  INITIAL_MUSCLE_GROUPS,
  fetchExercisesApi,
  authMeApi,
  authLogoutApi
} from './services/api';
import { Header } from './components/Header';
import { ExerciseCard } from './components/ExerciseCard';
import { ExerciseDetailModal } from './components/ExerciseDetailModal';
import { PlanDrawer } from './components/PlanDrawer';
import { SavedPlansModal } from './components/SavedPlansModal';
import { SubmissionModal } from './components/SubmissionModal';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { PrintExerciseA4 } from './components/PrintExerciseA4';
import { PrintPlanA4 } from './components/PrintPlanA4';
import { useTrainingPlanStore } from './store/useTrainingPlanStore';

export function App() {
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [currentTab, setCurrentTab] = useState<'catalog' | 'plans' | 'moderation'>('catalog');

  // Benutzer-Authentifizierung
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

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

  // Darkmode & Speicherung im Browser
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('radballhub_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const planItems = useTrainingPlanStore((state) => state.items);
  const activePlanTitle = useTrainingPlanStore((state) => state.activePlanTitle);
  const defaultPauseSeconds = useTrainingPlanStore((state) => state.defaultPauseSeconds);
  const getTotalDurationFormatted = useTrainingPlanStore((state) => state.getTotalDurationFormatted);

  // Initialer Datenabruf
  const loadExercises = () => {
    fetchExercisesApi().then((data) => {
      if (data && data.length > 0) {
        setExercises(data);
      }
    });
  };

  useEffect(() => {
    loadExercises();
    authMeApi().then((user) => {
      setCurrentUser(user);
    });
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('radballhub_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('radballhub_theme', 'light');
    }
  }, [isDark]);

  const handleLogout = async () => {
    await authLogoutApi();
    setCurrentUser(null);
  };

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
      
      {/* Zentraler Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openSubmissionModal={() => setIsSubmissionOpen(true)}
        openSavedPlansModal={() => setIsSavedPlansOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAdminModal={() => setIsAdminOpen(true)}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:hidden">
        
        {/* Schlichter, sachlicher Titelbereich ohne Werbesprüche */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Radball-Übungskatalog
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Übungen durchsuchen, Trainingspläne zusammenstellen und für das Training in der Halle drucken.
          </p>
        </div>

        {/* Filter- & Suchleiste */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mb-8 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Volltextsuche */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Übung, Ablauf, Material oder Autor suchen..."
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
                <option value="ausdauer">Ausdauer</option>
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

          {/* Erweiterte Filter-Zeile: Muskelgruppen & Reset */}
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
            <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-40" />
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
        existingExercises={exercises}
      />

      {/* Anmelde- & Registrierungsmodal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => setCurrentUser(u)}
      />

      {/* Administrator-Verwaltungsmodal (Benutzer & Backups) */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
        onExercisesUpdated={loadExercises}
      />

      {/* 
        DRUCK-CONTAINER (Wird ausschließlich im Browser-Druckauftrag @media print gerendert) 
      */}
      <div className="print-container hidden print:block">
        {singlePrintExercise && (
          <PrintExerciseA4 exercise={singlePrintExercise} />
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

    </div>
  );
}

export default App;
