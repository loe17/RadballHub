import type { Exercise, AgeGroup, MuscleGroup, User } from '../types';

export const INITIAL_AGE_GROUPS: AgeGroup[] = [
  { id: 1, code: 'beginner', label: 'Anfänger', sort_order: 10 },
  { id: 2, code: 'u11', label: 'ab U11', sort_order: 20 },
  { id: 3, code: 'u13', label: 'ab U13', sort_order: 30 },
  { id: 4, code: 'u15', label: 'ab U15', sort_order: 40 },
  { id: 5, code: 'u17', label: 'ab U17', sort_order: 50 },
  { id: 6, code: 'u19', label: 'ab U19', sort_order: 60 },
  { id: 7, code: 'elite', label: 'ab Elite', sort_order: 70 },
  { id: 8, code: 'all', label: 'für alle', sort_order: 80 },
  { id: 9, code: 'advanced', label: 'Fortgeschrittene', sort_order: 90 },
  { id: 10, code: 'pro', label: 'Profis', sort_order: 100 },
];

export const INITIAL_MUSCLE_GROUPS: MuscleGroup[] = [
  { id: 1, code: 'arms', name: 'Oberarme (Bizeps / Trizeps)', body_region: 'upper_body', sort_order: 10 },
  { id: 2, code: 'chest', name: 'Brust', body_region: 'upper_body', sort_order: 20 },
  { id: 3, code: 'upper_back', name: 'Oberer Rücken & Schultern', body_region: 'upper_body', sort_order: 30 },
  { id: 4, code: 'core', name: 'Rumpf / Bauch', body_region: 'core', sort_order: 40 },
  { id: 5, code: 'thighs', name: 'Oberschenkel (Quadrizeps / Hamstrings)', body_region: 'lower_body', sort_order: 50 },
  { id: 6, code: 'calves', name: 'Waden', body_region: 'lower_body', sort_order: 60 },
];

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 1,
    title: 'Präzisions-Drehschlag aus der Kurve',
    slug: 'praezisions-drehschlag-aus-der-kurve',
    author_name: 'Bundestrainer Radball',
    category: 'technik',
    duration_minutes: 10,
    material: '2 Radballräder, 4 Bälle, 1 Tor, Hütchen',
    description: `1. Spieler fährt mit moderatem Tempo von der Außenlinie in Richtung Tor.
2. In einem Radius von ca. 3 Metern um den Torkreis erfolgt die dynamische Gewichtsverlagerung auf das Hinterrad.
3. Drehschlag mit gezielter Schlagflächenrotation des Vorderrads in die lange Torecke.
4. Fokus liegt auf stabiler Lenkerhaltung und sauberem Nachdrücken aus den Schultern.
5. 5 Durchgänge von links, 5 von rechts.`,
    image_path: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
    video_url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    status: 'approved',
    created_at: '2026-09-20T10:00:00Z',
    age_groups: [
      { id: 4, code: 'u15', label: 'ab U15', sort_order: 40 },
      { id: 5, code: 'u17', label: 'ab U17', sort_order: 50 },
      { id: 6, code: 'u19', label: 'ab U19', sort_order: 60 },
      { id: 7, code: 'elite', label: 'ab Elite', sort_order: 70 },
      { id: 9, code: 'advanced', label: 'Fortgeschrittene', sort_order: 90 },
    ],
    muscle_groups: [
      { id: 1, code: 'arms', name: 'Oberarme (Bizeps / Trizeps)', body_region: 'upper_body', intensity: 'primary' },
      { id: 3, code: 'upper_back', name: 'Oberer Rücken & Schultern', body_region: 'upper_body', intensity: 'secondary' },
      { id: 4, code: 'core', name: 'Rumpf / Bauch', body_region: 'core', intensity: 'secondary' },
    ],
  },
  {
    id: 2,
    title: '2-gegen-1 Umschaltspiel & Torhüter-Entscheidung',
    slug: '2-gegen-1-umschaltspiel-torhueter-entscheidung',
    author_name: 'Lukas M. (Trainer A-Lizenz)',
    category: 'taktik',
    duration_minutes: 15,
    material: 'Volles Spielfeld, 1 Tor, Bälle, Markierungshütchen',
    description: `1. Angreifer A und B starten an der Mittellinie im Schnellangriff.
2. Verteidiger startet an der Torkreislinie und muss die Passlinie zustellen, ohne die Ecke aufzugeben.
3. Angreifer müssen durch schnelles Doppelpass-Spiel oder Körpertäuschung den Verteidiger binden.
4. Abschluss erfolgt innerhalb von maximal 8 Sekunden nach Balleroberung.
5. Rollentausch nach je 3 Angriffen.`,
    image_path: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80',
    status: 'approved',
    created_at: '2026-09-20T11:00:00Z',
    age_groups: [
      { id: 5, code: 'u17', label: 'ab U17', sort_order: 50 },
      { id: 6, code: 'u19', label: 'ab U19', sort_order: 60 },
      { id: 7, code: 'elite', label: 'ab Elite', sort_order: 70 },
    ],
    muscle_groups: [
      { id: 5, code: 'thighs', name: 'Oberschenkel (Quadrizeps / Hamstrings)', body_region: 'lower_body', intensity: 'primary' },
      { id: 4, code: 'core', name: 'Rumpf / Bauch', body_region: 'core', intensity: 'secondary' },
    ],
  },
  {
    id: 3,
    title: 'Hochintensiver Antritt & Radball-Sprint',
    slug: 'hochintensiver-antritt-radball-sprint',
    author_name: 'Athletikteam Radsport',
    category: 'kondition',
    duration_minutes: 12,
    material: 'Radballrad, Stoppuhr, 4 Markierungsteller',
    description: `1. Stillstand auf dem Rad an der Grundlinie (Balance-Halt).
2. Auf Pfiff maximaler Antritt über die gesamte Hallenlänge (14 Meter).
3. Vollbremsung mit Vorderrad-Querstellen vor der Bande.
4. 180-Grad-Wende auf dem Hinterrad und sofortiger Rücksprint.
5. 6 Serien mit je 45 Sekunden Pause.`,
    image_path: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    status: 'approved',
    created_at: '2026-09-21T09:30:00Z',
    age_groups: [
      { id: 4, code: 'u15', label: 'ab U15', sort_order: 40 },
      { id: 5, code: 'u17', label: 'ab U17', sort_order: 50 },
      { id: 6, code: 'u19', label: 'ab U19', sort_order: 60 },
      { id: 8, code: 'all', label: 'für alle', sort_order: 80 },
    ],
    muscle_groups: [
      { id: 5, code: 'thighs', name: 'Oberschenkel (Quadrizeps / Hamstrings)', body_region: 'lower_body', intensity: 'primary' },
      { id: 6, code: 'calves', name: 'Waden', body_region: 'lower_body', intensity: 'primary' },
      { id: 4, code: 'core', name: 'Rumpf / Bauch', body_region: 'core', intensity: 'secondary' },
    ],
  },
  {
    id: 4,
    title: 'Stabi-Core: Unterarmstütz mit dynamischer Rotation',
    slug: 'stabi-core-unterarmstuetz-dynamische-rotation',
    author_name: 'Physio-Team Radsport',
    category: 'home_workout',
    duration_minutes: 8,
    material: 'Gymnastikmatte, optional leichter Radball-Lenker',
    description: `1. Ausgangsposition ist der klassische Unterarmstütz (Plank).
2. Der Körper bildet von den Fersen bis zum Kopf eine gerade Linie, Bauchnabel aktiv nach innen ziehen.
3. Im 3-Sekunden-Takt wird ein Arm gelöst und eine horizontale Rotationsbewegung (wie beim Lenken unter Druck) simuliert.
4. 45 Sekunden Belastung pro Seite, 3 Durchgänge.`,
    image_path: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
    status: 'approved',
    created_at: '2026-09-21T14:15:00Z',
    age_groups: [
      { id: 1, code: 'beginner', label: 'Anfänger', sort_order: 10 },
      { id: 8, code: 'all', label: 'für alle', sort_order: 80 },
      { id: 9, code: 'advanced', label: 'Fortgeschrittene', sort_order: 90 },
    ],
    muscle_groups: [
      { id: 4, code: 'core', name: 'Rumpf / Bauch', body_region: 'core', intensity: 'primary' },
      { id: 3, code: 'upper_back', name: 'Oberer Rücken & Schultern', body_region: 'upper_body', intensity: 'secondary' },
    ],
  },
  {
    id: 5,
    title: 'Zirkel: Explosive Jump-Squats & Oberschenkel-Power',
    slug: 'zirkel-explosive-jump-squats',
    author_name: 'Athletikverband',
    category: 'zirkel',
    duration_minutes: 6,
    material: 'Springseil, Stoppuhr, Markierung',
    description: `1. Tiefe Kniebeuge mit geradem Rücken, Oberschenkel parallel zum Boden.
2. Explosiver Strecksprung nach oben mit maximaler Kniestreckung.
3. Sanfte Landung auf den Fußballen und direkte Abfederung in die nächste Wiederholung.
4. Konzentration auf saubere Beinachse (Knie kippen nicht nach innen).`,
    image_path: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800&auto=format&fit=crop&q=80',
    status: 'approved',
    created_at: '2026-09-21T15:00:00Z',
    circuit: {
      work_duration_seconds: 45,
      pause_duration_seconds: 15,
      rounds: 3,
      station_number: 'Station 1',
      setup_notes: 'Freier Hallenbereich, min. 2m Abstand zu Hallenwänden.',
    },
    age_groups: [
      { id: 5, code: 'u17', label: 'ab U17', sort_order: 50 },
      { id: 6, code: 'u19', label: 'ab U19', sort_order: 60 },
      { id: 7, code: 'elite', label: 'ab Elite', sort_order: 70 },
    ],
    muscle_groups: [
      { id: 5, code: 'thighs', name: 'Oberschenkel (Quadrizeps / Hamstrings)', body_region: 'lower_body', intensity: 'primary' },
      { id: 6, code: 'calves', name: 'Waden', body_region: 'lower_body', intensity: 'secondary' },
    ],
  },
  {
    id: 6,
    title: 'Zirkel: Medizinball-Slam & Rumpf-Rotation',
    slug: 'zirkel-medizinball-slam-rumpf-rotation',
    author_name: 'Konditionstrainer E.',
    category: 'zirkel',
    duration_minutes: 6,
    material: '3kg bis 5kg Slam Ball / Medizinball',
    description: `1. Schulterbreiter Stand mit leicht gebeugten Knien.
2. Ball mit beiden Händen explosiv über den Kopf führen und mit voller Kraft vor die Füße auf den Hallenboden schmettern.
3. Ball im Rebound aufnehmen, Körper drehen und seitlich rotieren.
4. Kräftigt Rumpf, Bauch und oberen Rücken für harte Schlagbälle.`,
    image_path: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    status: 'approved',
    created_at: '2026-09-21T16:00:00Z',
    circuit: {
      work_duration_seconds: 40,
      pause_duration_seconds: 20,
      rounds: 3,
      station_number: 'Station 2',
      setup_notes: 'Mattenunterlage schont den Hallenboden bei harten Slams.',
    },
    age_groups: [
      { id: 5, code: 'u17', label: 'ab U17', sort_order: 50 },
      { id: 6, code: 'u19', label: 'ab U19', sort_order: 60 },
      { id: 8, code: 'all', label: 'für alle', sort_order: 80 },
    ],
    muscle_groups: [
      { id: 4, code: 'core', name: 'Rumpf / Bauch', body_region: 'core', intensity: 'primary' },
      { id: 3, code: 'upper_back', name: 'Oberer Rücken & Schultern', body_region: 'upper_body', intensity: 'primary' },
      { id: 2, code: 'chest', name: 'Brust', body_region: 'upper_body', intensity: 'secondary' },
    ],
  },
];

const API_BASE = '/api';

export async function fetchExercisesApi(): Promise<Exercise[]> {
  try {
    const res = await fetch(`${API_BASE}/exercises`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.exercises)) {
      return data.exercises;
    }
  } catch {
    // Fallback auf lokale Demo-Daten bei fehlender API-Verbindung
  }
  return INITIAL_EXERCISES;
}

export async function submitExerciseApi(formData: FormData): Promise<{ success: boolean; message: string; id?: number }> {
  const res = await fetch(`${API_BASE}/exercises`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Fehler beim Einreichen der Übung');
  }
  return data;
}

// -------------------------------------------------------------
// Authentifizierung & Benutzerverwaltung API
// -------------------------------------------------------------
export async function authMeApi(): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/auth?action=me`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success && data.user ? data.user : null;
  } catch {
    return null;
  }
}

export async function authLoginApi(login: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth?action=login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Ungültige Anmeldedaten');
  }
  return data.user;
}

export async function authRegisterApi(name: string, email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth?action=register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Registrierung fehlgeschlagen');
  }
  return data.user;
}

export async function authLogoutApi(): Promise<void> {
  await fetch(`${API_BASE}/auth?action=logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function adminGetUsersApi(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/auth?action=users`, {
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Benutzer konnten nicht geladen werden');
  }
  return data.users;
}

export async function adminUpdateUserRoleApi(userId: number, role: string, isActive: boolean = true): Promise<void> {
  const res = await fetch(`${API_BASE}/auth?action=update_role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, role, is_active: isActive }),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Rolle konnte nicht aktualisiert werden');
  }
}

export async function adminImportBackupApi(file: File): Promise<{ success: boolean; message: string; imported: number }> {
  const formData = new FormData();
  formData.append('backup_file', file);
  const res = await fetch(`${API_BASE}/admin/import-backup`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Import der Datensicherung fehlgeschlagen');
  }
  return data;
}
