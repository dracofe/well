import { useEffect, useState } from 'preact/hooks';
import {
  addDays, buildPlan, localDate, uid, upsertWeight,
  type FoodItemSnapshot, type ProfileInput, type Session, type WeightEntry,
} from './calc';
import { FOODS, type Food } from '../data/foods';
import { EXERCISES } from '../data/exercises';

export interface Target {
  effectiveFrom: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  plannedWeeklyKg: number;
  bmr: number;
  tdee: number;
  custom: boolean;
  mode: 'fixed';
}

export interface State {
  v: 1;
  onboarded: boolean;
  profile: ProfileInput | null;
  targets: Target[];
  weights: WeightEntry[];
  food: FoodItemSnapshot[];
  favorites: string[];
  customFoods: Food[];
  sessions: Session[];
  active: Session | null;
  incomplete: Record<string, boolean>;
  prefs: { hideWeight: boolean; name: string };
}

const KEY = '3well:v1';

const empty = (): State => ({
  v: 1, onboarded: false, profile: null, targets: [], weights: [], food: [], favorites: [],
  customFoods: [], sessions: [], active: null, incomplete: {}, prefs: { hideWeight: false, name: '' },
});

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch { /* storage unavailable */ }
  return empty();
}

let state: State = load();
const subs = new Set<() => void>();
let saveTimer: number | undefined;

function persist() {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota / private mode */ }
  }, 120);
}

export function getState() { return state; }

export function setState(fn: (s: State) => Partial<State>) {
  state = { ...state, ...fn(state) };
  persist();
  subs.forEach((f) => f());
}

export function useStore<T>(sel: (s: State) => T): T {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((n) => n + 1);
    subs.add(f);
    return () => { subs.delete(f); };
  }, []);
  return sel(state);
}

// ───────── selectors ─────────

export function targetFor(s: State, date: string): Target | null {
  let t: Target | null = null;
  for (const x of s.targets) if (x.effectiveFrom <= date && (!t || x.effectiveFrom >= t.effectiveFrom)) t = x;
  return t ?? s.targets[0] ?? null;
}

export function latestWeight(s: State): WeightEntry | null {
  return s.weights.length ? s.weights[s.weights.length - 1] : null;
}

// ───────── actions ─────────

export function completeOnboarding(profile: ProfileInput, override?: { calories: number; proteinG: number }) {
  const plan = buildPlan(profile);
  const today = localDate();
  const t: Target = {
    effectiveFrom: today,
    calories: override?.calories ?? plan.calories,
    proteinG: override?.proteinG ?? plan.proteinG,
    carbsG: plan.carbsG, fatG: plan.fatG,
    plannedWeeklyKg: plan.weeklyRateKg, bmr: plan.bmr, tdee: plan.tdee,
    custom: !!override && override.calories !== plan.calories, mode: 'fixed',
  };
  setState((s) => ({
    onboarded: true,
    profile,
    targets: [...s.targets.filter((x) => x.effectiveFrom !== today), t],
    weights: s.weights.length ? s.weights : upsertWeight([], { date: today, kg: profile.weightKg, updatedAt: Date.now() }),
  }));
}

/** New target version from today; past days keep their own targets. */
export function updateTarget(patch: Partial<Target>) {
  const today = localDate();
  setState((s) => {
    const cur = targetFor(s, today);
    if (!cur) return {};
    const t = { ...cur, ...patch, effectiveFrom: today };
    return { targets: [...s.targets.filter((x) => x.effectiveFrom !== today), t].sort((a, b) => (a.effectiveFrom < b.effectiveFrom ? -1 : 1)) };
  });
}

export function logWeight(date: string, kg: number, note?: string) {
  setState((s) => ({ weights: upsertWeight(s.weights, { date, kg, note, updatedAt: Date.now() }) }));
}
export function deleteWeight(date: string) {
  setState((s) => ({ weights: s.weights.filter((w) => w.date !== date) }));
}

export function addFood(item: Omit<FoodItemSnapshot, 'id' | 'createdAt'>) {
  setState((s) => ({ food: [...s.food, { ...item, id: uid(), createdAt: Date.now() }] }));
}
export function updateFood(id: string, patch: Partial<FoodItemSnapshot>) {
  setState((s) => ({ food: s.food.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
}
export function removeFood(id: string) {
  setState((s) => ({ food: s.food.filter((f) => f.id !== id) }));
}
export function toggleFavorite(foodId: string) {
  setState((s) => ({ favorites: s.favorites.includes(foodId) ? s.favorites.filter((x) => x !== foodId) : [foodId, ...s.favorites] }));
}
export function copyDay(from: string, to: string) {
  setState((s) => ({
    food: [...s.food, ...s.food.filter((f) => f.date === from).map((f) => ({ ...f, id: uid(), date: to, createdAt: Date.now() }))],
  }));
}
export function addCustomFood(f: Food) {
  setState((s) => ({ customFoods: [f, ...s.customFoods.filter((x) => x.id !== f.id)] }));
}

// workouts
export function startSession(sess: Session) { setState(() => ({ active: sess })); }
export function patchActive(fn: (a: Session) => Session) {
  setState((s) => (s.active ? { active: fn(s.active) } : {}));
}
export function finishActive(): Session | null {
  const a = state.active;
  if (!a) return null;
  const now = Date.now();
  const done: Session = {
    ...a,
    pausedMs: a.pausedMs + (a.pausedAt != null ? now - a.pausedAt : 0),
    pausedAt: null,
    endedAt: now,
    exercises: a.exercises.map((e) => ({ ...e, sets: e.sets.filter((x) => x.done) })).filter((e) => e.sets.length || e.kind === 'cardio'),
  };
  setState((s) => ({ active: null, sessions: [...s.sessions, done] }));
  return done;
}
export function discardActive() { setState(() => ({ active: null })); }
export function deleteSession(id: string) { setState((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })); }

export function lastPerformance(exId: string): { reps: number; kg: number }[] | null {
  for (let i = state.sessions.length - 1; i >= 0; i--) {
    const e = state.sessions[i].exercises.find((x) => x.exId === exId);
    if (e && e.sets.length) return e.sets.map((x) => ({ reps: x.reps, kg: x.kg }));
  }
  return null;
}

export function exportJSON(): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), app: '3well', data: state }, null, 2);
}

export function exportCSV(): string {
  const rows = [['type', 'date', 'name', 'value', 'kcal', 'protein_g', 'carbs_g', 'fat_g']];
  for (const w of state.weights) rows.push(['weight', w.date, '', String(w.kg), '', '', '', '']);
  for (const f of state.food) {
    const k = f.baseG ? f.qty / f.baseG : f.qty;
    const m = (v: number | null) => (v == null ? 'unknown' : (v * k).toFixed(1));
    rows.push(['food', f.date, f.name, `${f.qty}${f.baseG ? 'g' : ' porsi'}`, (f.per.kcal * k).toFixed(0), m(f.per.p), m(f.per.c), m(f.per.f)]);
  }
  for (const s of state.sessions)
    for (const e of s.exercises) for (const x of e.sets) rows.push(['set', s.date, e.name, `${x.reps}x${x.kg}kg`, '', '', '', '']);
  return rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
}

export function wipeAll() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  state = empty();
  subs.forEach((f) => f());
}

/** Demo dataset so charts/forecast can be explored right away. Clearly labelled in UI. */
export function seedDemo() {
  const profile: ProfileInput = { age: 26, heightCm: 172, weightKg: 88.6, formula: 'male', activity: 'moderate', goal: 'cut', pace: 'standard', targetWeightKg: 80 };
  const today = localDate();
  const start = addDays(today, -34);
  const plan = buildPlan(profile);
  const weights: WeightEntry[] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i <= 34; i++) {
    if (rnd() < 0.22 && i !== 34) continue; // missed days stay missing
    const kg = 88.6 - i * 0.062 + (rnd() - 0.5) * 0.9 + (i % 7 === 5 ? 0.35 : 0);
    weights.push({ date: addDays(start, i), kg: Math.round(kg * 10) / 10, updatedAt: Date.now() });
  }
  const pick = (id: string) => FOODS.find((f) => f.id === id);
  const food: FoodItemSnapshot[] = [];
  const day = [
    ['breakfast', 'oat', 40], ['breakfast', 'telur-rebus', 110], ['breakfast', 'kopi-susu', 250],
    ['lunch', 'nasi-merah', 150], ['lunch', 'dada-ayam', 140], ['lunch', 'tempe-goreng', 50], ['lunch', 'sayur-bayam', 150],
    ['dinner', 'nasi-putih', 120], ['dinner', 'ikan-bakar', 120], ['dinner', 'capcay', 200],
    ['snack', 'pisang', 100], ['snack', 'whey', 30],
  ] as const;
  for (let d = 13; d >= 0; d--) {
    const date = addDays(today, -d);
    if (d % 6 === 3) continue;
    day.forEach(([meal, id, g], j) => {
      const f = pick(id);
      if (!f || (d === 0 && (meal === 'dinner' || meal === 'snack'))) return;
      food.push({ id: uid(), foodId: f.id, name: f.name, source: f.source, per: { kcal: f.kcal, p: f.p, c: f.c, f: f.f }, baseG: 100, qty: g * (0.85 + ((d + j) % 4) * 0.08), meal, date, createdAt: Date.now() });
    });
  }
  const sessions: Session[] = [];
  const plans = [['Push Day', ['bench', 'incline-db', 'ohp', 'pushdown']], ['Pull Day', ['deadlift', 'row', 'latpull', 'curl']], ['Leg Day', ['squat', 'rdl', 'legpress', 'calf']]] as const;
  let k = 0;
  for (let d = 27; d >= 1; d -= 2) {
    if (d % 7 === 0) continue;
    const [name, ids] = plans[k % 3];
    const date = addDays(today, -d);
    const t0 = new Date(date + 'T18:00:00').getTime();
    const prog = Math.floor(k / 3) * 2.5;
    sessions.push({
      id: uid(), name, date, startedAt: t0, endedAt: t0 + (48 + (k % 3) * 5) * 60000, pausedMs: 0, pausedAt: null,
      intensity: 'moderate', activity: name === 'Leg Day' ? 'lift_vigorous' : 'lift_moderate',
      exercises: ids.map((id, i) => {
        const ex = EXERCISES.find((e) => e.id === id)!;
        const baseKg = { bench: 50, 'incline-db': 18, ohp: 32.5, pushdown: 25, deadlift: 90, row: 50, latpull: 45, curl: 12, squat: 70, rdl: 60, legpress: 120, calf: 60 }[id] ?? 20;
        return { id: uid(), exId: id, name: ex.name, muscle: ex.muscle, kind: 'resistance', sets: [0, 1, 2].map(() => ({ id: uid(), reps: i ? 10 : 8, kg: baseKg + (i ? prog / 2 : prog), done: true })) };
      }),
    });
    k++;
  }
  setState(() => ({
    onboarded: true, profile,
    targets: [{ effectiveFrom: start, calories: plan.calories, proteinG: plan.proteinG, carbsG: plan.carbsG, fatG: plan.fatG, plannedWeeklyKg: plan.weeklyRateKg, bmr: plan.bmr, tdee: plan.tdee, custom: false, mode: 'fixed' }],
    weights, food, sessions, favorites: ['nasi-merah', 'dada-ayam', 'telur-rebus', 'tempe-goreng'], prefs: { hideWeight: false, name: 'Demo' },
  }));
}
