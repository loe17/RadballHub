import { analyzeFatigueConflicts } from './fatigueDetector.ts';
import type { TrainingPlanItem } from '../types/index.ts';

// Test 1: Kollision gleicher primärer Muskel (Core -> Core)
const itemsCollision: TrainingPlanItem[] = [
  {
    id: '1',
    exercise: {
      id: 1,
      title: 'Plank Core',
      slug: 'plank-core',
      category: 'home_workout',
      duration_minutes: 5,
      description: 'Test',
      status: 'approved',
      age_groups: [],
      muscle_groups: [{ id: 4, code: 'core', name: 'Rumpf / Bauch', body_region: 'core', intensity: 'primary' }],
    },
    custom_pause_seconds: 60,
    sort_order: 1,
  },
  {
    id: '2',
    exercise: {
      id: 2,
      title: 'Crunches Dynamisch',
      slug: 'crunches-dynamisch',
      category: 'home_workout',
      duration_minutes: 5,
      description: 'Test',
      status: 'approved',
      age_groups: [],
      muscle_groups: [{ id: 4, code: 'core', name: 'Rumpf / Bauch', body_region: 'core', intensity: 'primary' }],
    },
    custom_pause_seconds: 60,
    sort_order: 2,
  },
];

const warnings1 = analyzeFatigueConflicts(itemsCollision, 60);
if (warnings1.length !== 1 || warnings1[0].severity !== 'critical') {
  console.error('❌ Test 1 fehlgeschlagen!');
  process.exit(1);
}
console.log('✅ Test 1 (Direkte primäre Kollision) erfolgreich bestanden:', warnings1[0].message);

// Test 2: Keine Kollision (Oberarme -> Oberschenkel)
const itemsNoCollision: TrainingPlanItem[] = [
  {
    id: '1',
    exercise: {
      id: 1,
      title: 'Schlagtechnik Arme',
      slug: 'schlagtechnik-arme',
      category: 'technik',
      duration_minutes: 5,
      description: 'Test',
      status: 'approved',
      age_groups: [],
      muscle_groups: [{ id: 1, code: 'arms', name: 'Oberarme', body_region: 'upper_body', intensity: 'primary' }],
    },
    custom_pause_seconds: 60,
    sort_order: 1,
  },
  {
    id: '2',
    exercise: {
      id: 2,
      title: 'Sprint Beine',
      slug: 'sprint-beine',
      category: 'kondition',
      duration_minutes: 5,
      description: 'Test',
      status: 'approved',
      age_groups: [],
      muscle_groups: [{ id: 5, code: 'thighs', name: 'Oberschenkel', body_region: 'lower_body', intensity: 'primary' }],
    },
    custom_pause_seconds: 60,
    sort_order: 2,
  },
];

const warnings2 = analyzeFatigueConflicts(itemsNoCollision, 60);
if (warnings2.length !== 0) {
  console.error('❌ Test 2 fehlgeschlagen!');
  process.exit(1);
}
console.log('✅ Test 2 (Keine Kollision) erfolgreich bestanden.');

// Test 3: Sekundäre Vorbelastung bei kurzer Pause (<90s)
const itemsSecondary: TrainingPlanItem[] = [
  {
    id: '1',
    exercise: {
      id: 1,
      title: 'Konditionssprint',
      slug: 'konditionssprint',
      category: 'kondition',
      duration_minutes: 5,
      description: 'Test',
      status: 'approved',
      age_groups: [],
      muscle_groups: [{ id: 6, code: 'calves', name: 'Waden', body_region: 'lower_body', intensity: 'secondary' }],
    },
    custom_pause_seconds: 45, // < 90s Pause
    sort_order: 1,
  },
  {
    id: '2',
    exercise: {
      id: 2,
      title: 'Wadensprünge',
      slug: 'wadenspruenge',
      category: 'zirkel',
      duration_minutes: 5,
      description: 'Test',
      status: 'approved',
      age_groups: [],
      muscle_groups: [{ id: 6, code: 'calves', name: 'Waden', body_region: 'lower_body', intensity: 'primary' }],
    },
    custom_pause_seconds: 60,
    sort_order: 2,
  },
];

const warnings3 = analyzeFatigueConflicts(itemsSecondary, 60);
if (warnings3.length !== 1 || warnings3[0].severity !== 'moderate') {
  console.error('❌ Test 3 fehlgeschlagen!');
  process.exit(1);
}
console.log('✅ Test 3 (Sekundäre Vorbelastung bei kurzer Pause) erfolgreich bestanden:', warnings3[0].message);

console.log('\n🎉 Alle Unit-Tests für den Belastungs-Validierungsalgorithmus erfolgreich bestanden!');
