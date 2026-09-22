import type { TrainingPlanItem, FatigueWarning } from '../types';

/**
 * Analysiert die Reihenfolge der Übungen im Trainingsplan-Warenkorb auf
 * Ermüdungsrisiken durch direkt aufeinanderfolgende Beanspruchung derselben Muskelgruppen.
 */
export function analyzeFatigueConflicts(
  items: TrainingPlanItem[],
  defaultPauseSeconds: number = 60
): FatigueWarning[] {
  const warnings: FatigueWarning[] = [];

  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1];
    const curr = items[i];

    // Muskelgruppen extrahieren
    const prevPrimary = prev.exercise.muscle_groups
      .filter((m) => m.intensity === 'primary')
      .map((m) => m.name);

    const currPrimary = curr.exercise.muscle_groups
      .filter((m) => m.intensity === 'primary')
      .map((m) => m.name);

    // 1. Kritische Kollision: Gleiche primäre Muskelgruppe direkt hintereinander
    const primaryCollisions = prevPrimary.filter((muscle) => currPrimary.includes(muscle));

    if (primaryCollisions.length > 0) {
      warnings.push({
        itemIndex: i,
        previousExerciseTitle: prev.exercise.title,
        currentExerciseTitle: curr.exercise.title,
        conflictingMuscles: primaryCollisions,
        severity: 'critical',
        message: `Hohes Ermüdungsrisiko: "${curr.exercise.title}" beansprucht dieselbe primäre Muskelgruppe (${primaryCollisions.join(', ')}) wie die vorherige Übung!`,
      });
      continue; // Weiter zur nächsten Prüfung
    }

    // 2. Moderate Warnung: Primär vs. Sekundär bei kurzer Pausenzeit (< 90s)
    const effectivePause = prev.custom_pause_seconds ?? defaultPauseSeconds;
    if (effectivePause < 90) {
      const prevAll = prev.exercise.muscle_groups.map((m) => m.name);
      const secondaryCollisions = currPrimary.filter((muscle) => prevAll.includes(muscle));

      if (secondaryCollisions.length > 0) {
        warnings.push({
          itemIndex: i,
          previousExerciseTitle: prev.exercise.title,
          currentExerciseTitle: curr.exercise.title,
          conflictingMuscles: secondaryCollisions,
          severity: 'moderate',
          message: `Erhöhte Vorbelastung: "${curr.exercise.title}" beansprucht ${secondaryCollisions.join(', ')} bei nur ${effectivePause}s Pause nach "${prev.exercise.title}".`,
        });
      }
    }
  }

  return warnings;
}
