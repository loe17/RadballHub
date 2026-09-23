import React from 'react';
import { 
  Layers, 
  FolderHeart, 
  PlusCircle, 
  Sun, 
  Moon, 
  ShoppingCart,
  Menu,
  X,
  LogIn,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import type { User } from '../types';
import { useTrainingPlanStore } from '../store/useTrainingPlanStore';

interface HeaderProps {
  currentTab: 'catalog' | 'plans' | 'moderation';
  setCurrentTab: (tab: 'catalog' | 'plans' | 'moderation') => void;
  openSubmissionModal: () => void;
  openSavedPlansModal: () => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenAdminModal: () => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  openSubmissionModal,
  openSavedPlansModal,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenAdminModal,
  isDark,
  setIsDark,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const items = useTrainingPlanStore((state) => state.items);
  const toggleDrawer = useTrainingPlanStore((state) => state.toggleDrawer);

  return (
    <header className="app-header sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Nur der Schriftzug ohne Hantel und ohne Zusatz Trainingsplattform */}
          <div 
            className="flex items-center cursor-pointer select-none py-1" 
            onClick={() => setCurrentTab('catalog')}
          >
            <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">
              Radball<span className="text-blue-600 dark:text-blue-400">Hub</span>
            </span>
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

            {/* Admin-Bereich: Verwaltung & Datensicherung (nur für Admins sichtbar) */}
            {currentUser && currentUser.role === 'admin' && (
              <button
                onClick={onOpenAdminModal}
                className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Verwaltung
              </button>
            )}
          </nav>

          {/* Right Action Icons: Login/User, Theme Toggle & Plan Drawer */}
          <div className="flex items-center gap-2">
            
            {/* Benutzer-Status (Desktop) */}
            <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1">
              {currentUser ? (
                <div className="flex items-center gap-2 text-xs">
                  <div className="text-right">
                    <span className="block font-bold text-slate-900 dark:text-white leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="inline-block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'coach' ? 'Trainer' : 'Mitglied'}
                    </span>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Abmelden"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Anmelden
                </button>
              )}
            </div>

            {/* Darkmode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Zum Hellen Modus wechseln' : 'Zum Dunklen Modus wechseln'}
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
          {currentUser ? (
            <div className="p-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-white">
                  Angemeldet als {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  Rolle: {currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'coach' ? 'Trainer' : 'Mitglied'}
                </span>
              </div>
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg"
              >
                Abmelden
              </button>
            </div>
          ) : (
            <button
              onClick={() => { onOpenAuthModal(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 mb-2"
            >
              <LogIn className="w-4 h-4" /> Anmelden / Registrieren
            </button>
          )}

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
          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={() => { onOpenAdminModal(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <ShieldCheck className="w-4 h-4 text-blue-500" /> Verwaltung & Datensicherung
            </button>
          )}
        </div>
      )}
    </header>
  );
};
