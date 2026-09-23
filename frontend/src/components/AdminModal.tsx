import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Download, 
  Upload, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import type { User } from '../types';
import { adminGetUsersApi, adminUpdateUserRoleApi, adminImportBackupApi } from '../services/api';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onExercisesUpdated?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ 
  isOpen, 
  onClose, 
  currentUser,
  onExercisesUpdated 
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'backup'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState<string | null>(null);

  // Backup Import State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'users') {
      loadUsers();
    }
  }, [isOpen, activeTab]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    setUserError(null);
    try {
      const data = await adminGetUsersApi();
      setUsers(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUserError(err.message);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUserError(null);
    setUserSuccess(null);
    try {
      await adminUpdateUserRoleApi(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as User['role'] } : u))
      );
      setUserSuccess('Benutzerrolle erfolgreich aktualisiert.');
      setTimeout(() => setUserSuccess(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUserError(err.message);
      }
    }
  };

  const handleDownloadBackupZip = () => {
    window.location.href = '/api/admin/export-zip';
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setImporting(true);
    setImportResult(null);
    setImportError(null);

    try {
      const res = await adminImportBackupApi(selectedFile);
      setImportResult(res.message);
      setSelectedFile(null);
      if (onExercisesUpdated) {
        onExercisesUpdated();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setImportError(err.message);
      } else {
        setImportError('Import fehlgeschlagen.');
      }
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen || !currentUser || currentUser.role !== 'admin') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Verwaltung & Datensicherung
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Nur für Administratoren zugänglich
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab-Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> Benutzer & Rollen
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" /> Datensicherung (Export & Import)
          </button>
        </div>

        {/* Inhalt */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hier können Sie registrierten Mitgliedern Trainer- oder Administrator-Rechte zuweisen.
                </p>
                <button
                  onClick={loadUsers}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Aktualisieren
                </button>
              </div>

              {userError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{userError}</span>
                </div>
              )}

              {userSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{userSuccess}</span>
                </div>
              )}

              {loadingUsers ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  Benutzer werden geladen...
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">E-Mail</th>
                        <th className="p-3">Rolle</th>
                        <th className="p-3">Rolle anpassen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">
                            {u.name}
                            {u.id === currentUser.id && (
                              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded font-normal">
                                Sie
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300 font-mono">
                            {u.email}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'admin'
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                  : u.role === 'coach'
                                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {u.role === 'admin' ? 'Administrator' : u.role === 'coach' ? 'Trainer' : 'Mitglied'}
                            </span>
                          </td>
                          <td className="p-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              disabled={u.id === currentUser.id}
                              className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-hidden disabled:opacity-40"
                            >
                              <option value="admin">Administrator</option>
                              <option value="coach">Trainer</option>
                              <option value="member">Mitglied</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              
              {/* Export Box */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Sicherung herunterladen (Export)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Erstellt ein vollständiges ZIP-Archiv aller freigegebenen Übungen inklusive Bildern, Skizzen und einer strukturierten Datei (JSON & CSV).
                </p>
                <button
                  type="button"
                  onClick={handleDownloadBackupZip}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Katalog als ZIP herunterladen
                </button>
              </div>

              {/* Import Box */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Sicherung wiederherstellen (Import)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Laden Sie eine zuvor gesicherte Datei (z. B. <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">exercises.json</code>) hoch, um Übungen wiederherzustellen.
                </p>

                {importError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{importError}</span>
                  </div>
                )}

                {importResult && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{importResult}</span>
                  </div>
                )}

                <form onSubmit={handleImportSubmit} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="backup-file-input"
                      accept=".json"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="backup-file-input"
                      className="cursor-pointer px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <FileCheck className="w-4 h-4 text-slate-400" />
                      {selectedFile ? selectedFile.name : 'Sicherungsdatei (.json) auswählen'}
                    </label>

                    <button
                      type="submit"
                      disabled={!selectedFile || importing}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-40"
                    >
                      {importing ? (
                        'Wird importiert...'
                      ) : (
                        <>
                          <Upload className="w-4 h-4" /> Sicherung jetzt einspielen
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
