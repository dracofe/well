import type { MetKey } from '../lib/calc';

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equip: string;
  kind: 'resistance' | 'cardio';
}

export const EXERCISES: Exercise[] = [
  { id: 'bench', name: 'Bench Press', muscle: 'Dada', equip: 'Barbell', kind: 'resistance' },
  { id: 'incline-db', name: 'Incline Dumbbell Press', muscle: 'Dada', equip: 'Dumbbell', kind: 'resistance' },
  { id: 'ohp', name: 'Overhead Press', muscle: 'Bahu', equip: 'Barbell', kind: 'resistance' },
  { id: 'lateral', name: 'Lateral Raise', muscle: 'Bahu', equip: 'Dumbbell', kind: 'resistance' },
  { id: 'dips', name: 'Dips', muscle: 'Trisep', equip: 'Bodyweight', kind: 'resistance' },
  { id: 'pushdown', name: 'Triceps Pushdown', muscle: 'Trisep', equip: 'Cable', kind: 'resistance' },
  { id: 'deadlift', name: 'Deadlift', muscle: 'Punggung', equip: 'Barbell', kind: 'resistance' },
  { id: 'pullup', name: 'Pull-up', muscle: 'Punggung', equip: 'Bodyweight', kind: 'resistance' },
  { id: 'row', name: 'Barbell Row', muscle: 'Punggung', equip: 'Barbell', kind: 'resistance' },
  { id: 'latpull', name: 'Lat Pulldown', muscle: 'Punggung', equip: 'Cable', kind: 'resistance' },
  { id: 'curl', name: 'Biceps Curl', muscle: 'Bisep', equip: 'Dumbbell', kind: 'resistance' },
  { id: 'squat', name: 'Back Squat', muscle: 'Kaki', equip: 'Barbell', kind: 'resistance' },
  { id: 'rdl', name: 'Romanian Deadlift', muscle: 'Hamstring', equip: 'Barbell', kind: 'resistance' },
  { id: 'legpress', name: 'Leg Press', muscle: 'Kaki', equip: 'Machine', kind: 'resistance' },
  { id: 'lunge', name: 'Walking Lunge', muscle: 'Kaki', equip: 'Dumbbell', kind: 'resistance' },
  { id: 'calf', name: 'Calf Raise', muscle: 'Betis', equip: 'Machine', kind: 'resistance' },
  { id: 'plank', name: 'Plank (detik sebagai reps)', muscle: 'Core', equip: 'Bodyweight', kind: 'resistance' },
  { id: 'treadmill', name: 'Treadmill Incline Walk', muscle: 'Kardio', equip: 'Treadmill', kind: 'cardio' },
  { id: 'bike', name: 'Sepeda statis', muscle: 'Kardio', equip: 'Bike', kind: 'cardio' },
  { id: 'run', name: 'Lari', muscle: 'Kardio', equip: '—', kind: 'cardio' },
];

export interface Template { id: string; name: string; hint: string; activity: MetKey; ex: string[] }

export const TEMPLATES: Template[] = [
  { id: 'push', name: 'Push Day', hint: 'Dada · bahu · trisep', activity: 'lift_moderate', ex: ['bench', 'incline-db', 'ohp', 'lateral', 'pushdown'] },
  { id: 'pull', name: 'Pull Day', hint: 'Punggung · bisep', activity: 'lift_moderate', ex: ['deadlift', 'pullup', 'row', 'latpull', 'curl'] },
  { id: 'legs', name: 'Leg Day', hint: 'Quad · hamstring · betis', activity: 'lift_vigorous', ex: ['squat', 'rdl', 'legpress', 'lunge', 'calf'] },
  { id: 'upper', name: 'Upper', hint: 'Tubuh atas', activity: 'lift_moderate', ex: ['bench', 'row', 'ohp', 'latpull', 'curl', 'pushdown'] },
  { id: 'lower', name: 'Lower', hint: 'Tubuh bawah + core', activity: 'lift_moderate', ex: ['squat', 'rdl', 'lunge', 'calf', 'plank'] },
  { id: 'full', name: 'Full Body', hint: 'Compound utama', activity: 'lift_moderate', ex: ['squat', 'bench', 'row', 'ohp'] },
  { id: 'cardio', name: 'Cardio', hint: 'Incline walk / sepeda', activity: 'incline_walk', ex: ['treadmill'] },
];

export const exById = (id: string) => EXERCISES.find((e) => e.id === id);
