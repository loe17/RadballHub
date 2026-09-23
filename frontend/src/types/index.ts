export type ExerciseCategory = 'technik' | 'taktik' | 'kondition' | 'ausdauer' | 'home_workout' | 'zirkel';

export type ExerciseStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';

export type UserRole = 'admin' | 'coach' | 'member';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  created_at?: string;
}

export interface ExerciseMedia {
  id?: number;
  type: 'image' | 'video';
  url: string;
  sort_order: number;
  caption?: string | null;
}

export interface AgeGroup {
  id: number;
  code: string;
  label: string;
  sort_order: number;
}

export interface MuscleGroup {
  id: number;
  code: string;
  name: string;
  body_region: 'upper_body' | 'core' | 'lower_body' | 'full_body';
  sort_order?: number;
  intensity?: 'primary' | 'secondary';
}

export interface CircuitMetadata {
  work_duration_seconds: number;
  pause_duration_seconds: number;
  rounds: number;
  station_number?: string | null;
  setup_notes?: string | null;
}

export interface Exercise {
  id: number;
  title: string;
  slug: string;
  author_name?: string | null; // Optionaler Autor
  category: ExerciseCategory;
  duration_minutes: number;
  material?: string | null;
  description: string;
  image_path?: string | null;
  video_url?: string | null;
  media?: ExerciseMedia[];
  status: ExerciseStatus;
  created_at?: string;
  circuit?: CircuitMetadata | null;
  age_groups: AgeGroup[];
  muscle_groups: MuscleGroup[];
}

export interface TrainingPlanItem {
  id: string; // Unique String ID für @dnd-kit
  exercise: Exercise;
  custom_duration_minutes?: number | null;
  custom_pause_seconds?: number | null;
  custom_notes?: string | null;
  sort_order: number;
}

export interface TrainingPlan {
  id: number;
  title: string;
  description?: string | null;
  is_favorite: boolean;
  default_pause_between_exercises_seconds: number;
  last_used_at?: string | null;
  created_at?: string;
  items: TrainingPlanItem[];
  total_exercises?: number;
  total_exercise_minutes?: number;
  total_pause_seconds?: number;
}

export interface FatigueWarning {
  itemIndex: number;
  previousExerciseTitle: string;
  currentExerciseTitle: string;
  conflictingMuscles: string[];
  severity: 'critical' | 'moderate';
  message: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
