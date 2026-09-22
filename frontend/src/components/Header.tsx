import React from 'react';
import { 
  Dumbbell, 
  Layers, 
  FolderHeart, 
  PlusCircle, 
  Download, 
  Sun, 
  Moon, 
  ShoppingCart,
  Menu,
  X
} from 'lucide-react';
import { useTrainingPlanStore } from '../store/useTrainingPlanStore';

interface HeaderProps {
  currentTab: 'catalog' | 'plans' | 'moderation';
  setCurrentTab: (tab: 'catalog' | 'plans' | 'moderation') => void;
  openSubmissionModal: () => void;
  openSavedPlansModal: () => void;
  handleDownloadBackup: () => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  openSubmissionModal,
  openSavedPlansModal,
  handleDownloadBackup,
  isDark,
  setIsDark,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const items = useTrainingPlanStore((state) => state.items);
  const toggleDrawer = useTrainingPlanStore((state) => state.toggleDrawer);

  return (
    <header className="app-header sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Titel */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('catalog')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                Radball<span className="text-blue-600 dark:text-blue-400">Hub</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                Trainingsplattform
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('catalog')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                currentTab === 'catalog'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              Übungskatalog
            </button>

            <button
              onClick={openSavedPlansModal}
              className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FolderHeart className="w-4 h-4 text-rose-500" />
              Meine Pläne
            </button>

            <button
              onClick={openSubmissionModal}
              className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-emerald-500" />
              Übung einreichen
            </button>

            <button
              onClick={handleDownloadBackup}
              title="Vollständiges ZIP-Backup des Übungskatalogs herunterladen"
              className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              Katalog-Backup (ZIP)
            </button>
          </nav>

          {/* Right Action Icons: Theme Toggle & Plan Drawer Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Zum Lightmode wechseln' : 'Zum Darkmode wechseln'}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Trainingsplan Drawer Button ("Warenkorb") */}
            <button
              onClick={toggleDrawer}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Trainingsplan</span>
              {items.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-white text-blue-600 rounded-full">
                  {items.length}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menü Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => { setCurrentTab('catalog'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Layers className="w-4 h-4 text-blue-500" /> Übungskatalog
          </button>
          <button
            onClick={() => { openSavedPlansModal(); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FolderHeart className="w-4 h-4 text-rose-500" /> Meine Trainingspläne
          </button>
          <button
            onClick={() => { openSubmissionModal(); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <PlusCircle className="w-4 h-4 text-emerald-500" /> Neue Übung einreichen
          </button>
          <button
            onClick={() => { handleDownloadBackup(); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Download className="w-4 h-4 text-indigo-500" /> Backup herunterladen (ZIP)
          </button>
        </div>
      )}
    </header>
  );
};
