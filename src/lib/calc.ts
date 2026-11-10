/**
 * 3well domain calculations — pure functions, no I/O.
 * Semua hasil adalah ESTIMASI. Lihat PRD §10.
 */

export type Goal = 'cut' | 'bulk' | 'maintain';
export type Pace = 'gentle' | 'standard';
export type FormulaParam = 'male' | 'female' | 'skip';
export type ActivityLevel = 'sitting' | 'light' | 'moderate' | 'very';

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sitting: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
};

export interface ProfileInput {
  age: number;
  heightCm: number;
  weightKg: number;
  formula: FormulaParam;
  activity: ActivityLevel;
  goal: Goal;
  pace: Pace;
  targetWeightKg?: number | null;
}

export interface Plan {
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  proteinRange: [number, number];
  carbsG: number;
  fatG: number;
  weeklyRateKg: number; // signed, planned
  warnings: string[];
}

/** kcal/day adjustment presets (moderate by design; review with domain expert before release) */
const ADJUST: Record<Goal, Record<Pace, number>> = {
  cut: { gentle: -300, standard: -500 },
  bulk: { gentle: 200, standard: 300 },
  maintain: { gentle: 0, standard: 0 },
};

/** Rough energy-density used ONLY to describe a planned pace; not a physiological law. */
export const KCAL_PER_KG_APPROX = 7700;

export const LIMITS = {
  age: [18, 90],
  heightCm: [130, 230],
  weightKg: [35, 300],
} as const;

export function validateProfile(p: Partial<ProfileInput>): Record<string, string> {
  const e: Record<string, string> = {};
  const chk = (k: keyof typeof LIMITS, label: string) => {
    const v = p[k] as number | undefined;
    const [lo, hi] = LIMITS[k];
    if (v == null || !Number.isFinite(v)) e[k] = `${label} wajib diisi`;
    else if (v < lo || v > hi) e[k] = `${label} perlu di antara ${lo}–${hi}`;
  };
  chk('age', 'Usia');
  chk('heightCm', 'Tinggi');
  chk('weightKg', 'Berat');
  if (p.targetWeightKg != null && Number.isFinite(p.targetWeightKg)) {
    const [lo, hi] = LIMITS.weightKg;
    if (p.targetWeightKg < lo || p.targetWeightKg > hi) e.targetWeightKg = `Target berat perlu di antara ${lo}–${hi}`;
  }
  return e;
}

export function bmr(weightKg: number, heightCm: number, age: number, formula: FormulaParam): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  // 'skip' uses midpoint of the two coefficients (lower certainty, labelled in UI)
  const offset = formula === 'male' ? 5 : formula === 'female' ? -161 : -78;
  return base + offset;
}

export function buildPlan(p: ProfileInput): Plan {
  const b = bmr(p.weightKg, p.heightCm, p.age, p.formula);
  const tdee = b * ACTIVITY_FACTORS[p.activity];
  const warnings: string[] = [];
  let calories = tdee + ADJUST[p.goal][p.pace];

  // Guardrail: never recommend below estimated BMR or an absolute floor.
  const floor = Math.max(b, 1200);
  if (p.goal === 'cut' && calories < floor) {
    calories = floor;
    warnings.push('Rekomendasi dibatasi agar tidak terlalu rendah. Untuk defisit lebih besar, konsultasikan dengan tenaga profesional.');
  }

  const weeklyRateKg = ((calories - tdee) * 7) / KCAL_PER_KG_APPROX;

  if (p.targetWeightKg != null && Number.isFinite(p.targetWeightKg)) {
    if (p.goal === 'cut' && p.targetWeightKg >= p.weightKg)
      warnings.push('Target berat tidak lebih rendah dari berat sekarang — mungkin goal Maintain lebih cocok?');
    if (p.goal === 'bulk' && p.targetWeightKg <= p.weightKg)
      warnings.push('Target berat tidak lebih tinggi dari berat sekarang — mungkin goal Maintain lebih cocok?');
    const bmi = p.targetWeightKg / (p.heightCm / 100) ** 2;
    if (bmi < 18.5)
      warnings.push('Target berat ini berada di bawah rentang yang umumnya dianggap sehat. Pertimbangkan berdiskusi dengan tenaga kesehatan.');
  }

  const perKg = p.goal === 'cut' ? 2.0 : 1.8;
  const proteinG = Math.round(p.weightKg * perKg / 5) * 5;
  const proteinRange: [number, number] = [Math.round(p.weightKg * 1.6), Math.round(p.weightKg * 2.2)];
  const fatG = Math.round((calories * 0.27) / 9);
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));

  return {
    bmr: b,
    tdee,
    calories: Math.round(calories / 10) * 10,
    proteinG,
    proteinRange,
    carbsG,
    fatG,
    weeklyRateKg,
    warnings,
  };
}

/** Warning for a user-entered custom target (non-judgmental). */
export function customTargetWarning(calories: number, bmrKcal: number): string | null {
  if (!Number.isFinite(calories) || calories <= 0) return 'Masukkan target kalori yang valid.';
  if (calories < Math.max(1200, bmrKcal * 0.9))
    return 'Target ini cukup rendah dibanding estimasi kebutuhan dasarmu. Pertimbangkan target yang lebih longgar atau diskusikan dengan profesional.';
  if (calories > 6000) return 'Target ini sangat tinggi — pastikan angkanya benar.';
  return null;
}

// ─────────────────────────── Dates ───────────────────────────

export function localDate(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dayNum(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

export function addDays(date: string, n: number): string {
  const t = (dayNum(date) + n) * 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

// ─────────────────────────── Weight ───────────────────────────

export interface WeightEntry {
  date: string; // local YYYY-MM-DD
  kg: number;
  note?: string;
  updatedAt: number;
}

export function validWeight(kg: number): string | null {
  if (!Number.isFinite(kg)) return 'Masukkan angka berat yang valid';
  if (kg < LIMITS.weightKg[0] || kg > LIMITS.weightKg[1]) return `Berat perlu di antara ${LIMITS.weightKg[0]}–${LIMITS.weightKg[1]} kg`;
  return null;
}

/** One official entry per local date: same date → update. */
export function upsertWeight(list: WeightEntry[], entry: WeightEntry): WeightEntry[] {
  const out = list.filter((w) => w.date !== entry.date);
  out.push(entry);
  return out.sort((a, b) => (a.date < b.date ? -1 : 1));
}

export interface SmoothPoint {
  date: string;
  kg: number;
  avg: number;
  n: number;
}

/** Day-based trailing average over existing measurements only — no imputed values. */
export function movingAverage(list: WeightEntry[], window = 7): SmoothPoint[] {
  const sorted = [...list].sort((a, b) => (a.date < b.date ? -1 : 1));
  return sorted.map((w) => {
    const end = dayNum(w.date);
    const inWin = sorted.filter((x) => {
      const d = dayNum(x.date);
      return d <= end && d > end - window;
    });
    const avg = inWin.reduce((s, x) => s + x.kg, 0) / inWin.length;
    return { date: w.date, kg: w.kg, avg, n: inWin.length };
  });
}

/** Avg of measurements within (end-window, end]. null if none. */
export function windowAvg(list: WeightEntry[], end: string, window = 7): number | null {
  const e = dayNum(end);
  const xs = list.filter((w) => {
    const d = dayNum(w.date);
    return d <= e && d > e - window;
  });
  return xs.length ? xs.reduce((s, x) => s + x.kg, 0) / xs.length : null;
}

/** Trend change: 7-day avg ending `end` vs 7-day avg ending `end - days`. */
export function trendChange(list: WeightEntry[], end: string, days = 7): number | null {
  const now = windowAvg(list, end);
  const prev = windowAvg(list, addDays(end, -days));
  return now == null || prev == null ? null : now - prev;
}

// ─────────────────────────── Forecast ───────────────────────────

export type Confidence = 'low' | 'medium' | 'high';

export type Forecast =
  | { state: 'scenario'; reason: string; center: number | null; lo: number | null; hi: number | null }
  | { state: 'unreliable'; reason: string }
  | {
      state: 'early' | 'trend';
      center: number;
      lo: number;
      hi: number;
      slopePerWeek: number;
      confidence: Confidence;
      n: number;
      spanDays: number;
      base: number;
      computedAt: number;
    };

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Theil–Sen robust slope (kg/day). */
export function theilSen(pts: { x: number; y: number }[]): { slope: number; spread: number } {
  const slopes: number[] = [];
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[j].x - pts[i].x;
      if (dx !== 0) slopes.push((pts[j].y - pts[i].y) / dx);
    }
  if (!slopes.length) return { slope: 0, spread: Infinity };
  const s = [...slopes].sort((a, b) => a - b);
  const q = (p: number) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return { slope: median(slopes), spread: (q(0.75) - q(0.25)) / 1.35 };
}

export const FORECAST_MIN = { trendN: 10, trendSpan: 14, earlyN: 4, earlySpan: 7 };

export function forecast(
  list: WeightEntry[],
  today: string,
  opts: { horizon?: number; plannedWeeklyKg?: number; lookback?: number; now?: number } = {},
): Forecast {
  const horizon = opts.horizon ?? 30;
  const lookback = opts.lookback ?? 42;
  const recent = list.filter((w) => dayNum(w.date) > dayNum(today) - lookback && dayNum(w.date) <= dayNum(today));
  const n = recent.length;
  const span = n ? dayNum(recent[recent.length - 1].date) - dayNum(recent[0].date) : 0;

  const scenario = (reason: string): Forecast => {
    const last = list.length ? list[list.length - 1].kg : null;
    if (last == null || opts.plannedWeeklyKg == null) return { state: 'scenario', reason, center: null, lo: null, hi: null };
    const c = last + (opts.plannedWeeklyKg / 7) * horizon;
    const w = 1.2 + Math.abs(opts.plannedWeeklyKg) * 1.5;
    return { state: 'scenario', reason, center: c, lo: c - w / 2, hi: c + w / 2 };
  };

  const isTrend = n >= FORECAST_MIN.trendN && span >= FORECAST_MIN.trendSpan;
  const isEarly = n >= FORECAST_MIN.earlyN && span >= FORECAST_MIN.earlySpan;
  if (!isEarly) return scenario(`Butuh minimal ${FORECAST_MIN.earlyN} kali timbang dalam ${FORECAST_MIN.earlySpan}+ hari untuk melihat arah awal.`);

  const smooth = movingAverage(recent);
  const pts = smooth.map((p) => ({ x: dayNum(p.date), y: p.avg }));
  const { slope, spread } = theilSen(pts);
  const slopeWeek = slope * 7;
  if (Math.abs(slopeWeek) > 1.5 || !Number.isFinite(spread))
    return { state: 'unreliable', reason: 'Tren belum stabil — perubahan terlihat terlalu cepat untuk diproyeksikan dengan jujur.' };

  // residual noise of raw weigh-ins around the robust line
  const x0 = pts[pts.length - 1].x;
  const base = median(pts.map((p) => p.y + slope * (x0 - p.x)));
  const resid = recent.map((w) => w.kg - (base + slope * (dayNum(w.date) - x0)));
  const sd = Math.sqrt(resid.reduce((s, r) => s + r * r, 0) / Math.max(1, resid.length - 1));

  const center = base + slope * horizon;
  const slopeErr = (spread / Math.sqrt(n)) * horizon;
  let half = Math.max(0.4, 1.0 * sd + 1.96 * slopeErr + 0.02 * horizon);
  if (!isTrend) half *= 1.6;

  let confidence: Confidence = 'low';
  if (isTrend && n >= 20 && span >= 28 && sd < 0.6) confidence = 'high';
  else if (isTrend && n >= 12 && span >= 21) confidence = 'medium';

  return {
    state: isTrend ? 'trend' : 'early',
    center,
    lo: center - half,
    hi: center + half,
    slopePerWeek: slopeWeek,
    confidence,
    n,
    spanDays: span,
    base,
    computedAt: opts.now ?? Date.now(),
  };
}

// ─────────────────────────── Food ───────────────────────────

export interface Nutrients {
  kcal: number;
  p: number | null;
  c: number | null;
  f: number | null;
}

export type FoodSource = 'curated' | 'label' | 'user' | 'estimate';

export interface FoodItemSnapshot {
  id: string;
  foodId: string | null;
  name: string;
  source: FoodSource;
  /** nutrients per `baseG` grams (or per 1 serving if baseG = null) */
  per: Nutrients;
  baseG: number | null;
  qty: number; // grams if baseG, else servings
  portionLabel?: string;
  meal: MealType;
  date: string;
  createdAt: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export function scaleNutrients(per: Nutrients, baseG: number | null, qty: number): Nutrients {
  const k = baseG ? qty / baseG : qty;
  const m = (v: number | null) => (v == null ? null : v * k);
  return { kcal: per.kcal * k, p: m(per.p), c: m(per.c), f: m(per.f) };
}

export function itemNutrients(i: FoodItemSnapshot): Nutrients {
  return scaleNutrients(i.per, i.baseG, i.qty);
}

/** Sum; `unknown` counts entries whose macro is null so UI can say "+ ? g". */
export function sumNutrients(items: FoodItemSnapshot[]) {
  const t = { kcal: 0, p: 0, c: 0, f: 0, unknown: 0 };
  for (const i of items) {
    const n = itemNutrients(i);
    t.kcal += n.kcal;
    if (n.p == null || n.c == null || n.f == null) t.unknown++;
    t.p += n.p ?? 0;
    t.c += n.c ?? 0;
    t.f += n.f ?? 0;
  }
  return t;
}

// ─────────────────────────── Workout ───────────────────────────

export interface WSet {
  id: string;
  reps: number;
  kg: number;
  done: boolean;
  rpe?: number | null;
}

export interface WExercise {
  id: string;
  exId: string;
  name: string;
  muscle: string;
  kind: 'resistance' | 'cardio';
  sets: WSet[];
  cardioMin?: number;
}

export type Intensity = 'light' | 'moderate' | 'vigorous';

export interface Session {
  id: string;
  name: string;
  date: string;
  startedAt: number;
  endedAt: number | null;
  pausedMs: number;
  pausedAt: number | null;
  intensity: Intensity;
  activity: MetKey;
  exercises: WExercise[];
}

export function validSet(reps: number, kg: number): string | null {
  if (!Number.isFinite(reps) || reps <= 0 || !Number.isInteger(reps)) return 'Reps harus bilangan bulat lebih dari 0';
  if (reps > 100) return 'Reps maksimal 100';
  if (!Number.isFinite(kg) || kg < 0) return 'Beban tidak boleh negatif';
  if (kg > 600) return 'Beban terlalu besar — cek lagi';
  return null;
}

export function setVolume(s: WSet): number {
  return s.done && s.kg > 0 ? s.kg * s.reps : 0;
}

export function exerciseVolume(e: WExercise): number {
  return e.sets.reduce((a, s) => a + setVolume(s), 0);
}

export function sessionVolume(s: Session): number {
  return s.exercises.reduce((a, e) => a + exerciseVolume(e), 0);
}

export function completedSets(s: Session): number {
  return s.exercises.reduce((a, e) => a + e.sets.filter((x) => x.done).length, 0);
}

/** Epley, only shown for 1–12 reps with load. */
export function e1rm(kg: number, reps: number): number | null {
  if (kg <= 0 || reps < 1 || reps > 12) return null;
  return reps === 1 ? kg : kg * (1 + reps / 30);
}

/** Active time = elapsed minus paused; handles current pause. */
export function activeMs(s: Pick<Session, 'startedAt' | 'endedAt' | 'pausedMs' | 'pausedAt'>, now = Date.now()): number {
  const end = s.endedAt ?? now;
  const curPause = s.pausedAt != null ? end - s.pausedAt : 0;
  return Math.max(0, end - s.startedAt - s.pausedMs - curPause);
}

/**
 * Approximate MET values, mapped from 2024 Adult Compendium categories.
 * Values must be verified against the Compendium before production release.
 */
export const MET = {
  lift_light: { label: 'Angkat beban — ringan', met: 3.5 },
  lift_moderate: { label: 'Angkat beban — sedang', met: 5.0 },
  lift_vigorous: { label: 'Angkat beban — berat', met: 6.0 },
  circuit: { label: 'Circuit training', met: 8.0 },
  walk: { label: 'Jalan kaki santai', met: 3.5 },
  incline_walk: { label: 'Treadmill incline walk', met: 6.0 },
  cycling: { label: 'Sepeda statis (sedang)', met: 6.8 },
  running: { label: 'Lari (~10 km/j)', met: 9.8 },
  swimming: { label: 'Renang (sedang)', met: 5.8 },
} as const;
export type MetKey = keyof typeof MET;

export function grossKcal(met: number, kg: number, minutes: number): number {
  return (met * 3.5 * kg / 200) * minutes;
}
export function incrementalKcal(met: number, kg: number, minutes: number): number {
  return (Math.max(met - 1, 0) * 3.5 * kg / 200) * minutes;
}

export interface KcalEstimate {
  available: boolean;
  lo: number;
  hi: number;
  confidence: 'low' | 'low–medium' | 'medium';
  note: string;
}

/**
 * Range = incremental over resting (with rest-period discount) .. gross over active time.
 * Lifting assumes ~60–100% of active time is working vs resting.
 */
export function estimateActivityKcal(activity: MetKey, bodyKg: number, activeMinutes: number): KcalEstimate {
  if (!Number.isFinite(activeMinutes) || activeMinutes < 5 || !bodyKg)
    return { available: false, lo: 0, hi: 0, confidence: 'low', note: 'Durasi belum cukup untuk estimasi energi.' };
  const met = MET[activity].met;
  const lifting = activity.startsWith('lift') || activity === 'circuit';
  const lo = incrementalKcal(met, bodyKg, activeMinutes * (lifting ? 0.6 : 0.9));
  const hi = grossKcal(met, bodyKg, activeMinutes);
  return {
    available: true,
    lo: Math.round(lo / 10) * 10,
    hi: Math.round(hi / 10) * 10,
    confidence: lifting ? 'low–medium' : 'medium',
    note: `Estimasi populasi (MET ${met}), berat ${bodyKg.toFixed(1)} kg, ${Math.round(activeMinutes)} menit aktif.`,
  };
}

// ─────────────────────────── Weekly review ───────────────────────────

export interface WeeklyReview {
  eligible: boolean;
  reason?: string;
  weighIns: number;
  foodDays: number;
  avgKcal: number | null;
  proteinDays: number;
  sessions: number;
  sets: number;
  avgNow: number | null;
  avgPrev: number | null;
  observedWeekly: number | null;
  plannedWeekly: number;
  recommendation: 'keep' | 'review' | 'adjust' | null;
  adjustKcal: number;
  message: string;
}

export function weeklyReview(args: {
  today: string;
  weights: WeightEntry[];
  food: FoodItemSnapshot[];
  sessions: Session[];
  goal: Goal;
  plannedWeeklyKg: number;
  proteinTarget: number;
}): WeeklyReview {
  const { today, weights, food, sessions, goal, plannedWeeklyKg, proteinTarget } = args;
  const t = dayNum(today);
  const inWeek = (d: string) => dayNum(d) > t - 7 && dayNum(d) <= t;
  const weighIns = weights.filter((w) => inWeek(w.date)).length;
  const byDay = new Map<string, FoodItemSnapshot[]>();
  for (const f of food) if (inWeek(f.date)) byDay.set(f.date, [...(byDay.get(f.date) ?? []), f]);
  const foodDays = byDay.size;
  const totals = [...byDay.values()].map(sumNutrients);
  const avgKcal = totals.length ? totals.reduce((s, x) => s + x.kcal, 0) / totals.length : null;
  const proteinDays = totals.filter((x) => x.p >= proteinTarget * 0.9).length;
  const wk = sessions.filter((s) => s.endedAt && inWeek(s.date));
  const sets = wk.reduce((a, s) => a + completedSets(s), 0);
  const avgNow = windowAvg(weights, today);
  const avgPrev = windowAvg(weights, addDays(today, -7));
  const observedWeekly = avgNow != null && avgPrev != null ? avgNow - avgPrev : null;

  const base = { weighIns, foodDays, avgKcal, proteinDays, sessions: wk.length, sets, avgNow, avgPrev, observedWeekly, plannedWeekly: plannedWeeklyKg, adjustKcal: 0 };

  if (weighIns < 3 || foodDays < 4 || observedWeekly == null) {
    return {
      ...base,
      eligible: false,
      reason: 'Belum cukup data untuk review mingguan. Butuh ≥3 kali timbang minggu ini, catatan makan di ≥4 hari, dan data minggu sebelumnya.',
      recommendation: null,
      message: 'Belum cukup data — tidak apa-apa, lanjutkan mencatat sebisanya.',
    };
  }

  let recommendation: WeeklyReview['recommendation'] = 'keep';
  let adjustKcal = 0;
  let message = 'Tren bergerak sesuai arah rencana. Pertahankan rencana saat ini.';
  const tol = 0.15;
  if (goal === 'cut' && observedWeekly > -tol * 0.5) {
    if (foodDays < 6) {
      recommendation = 'review';
      message = 'Tren belum turun. Sebelum mengubah target, coba cek porsi & kelengkapan catatan makan.';
    } else {
      recommendation = 'adjust';
      adjustKcal = -100;
      message = 'Tren belum turun meski catatan makan cukup lengkap. Pertimbangkan penyesuaian kecil (~100 kcal) — atau tunggu satu minggu lagi untuk konfirmasi.';
    }
  } else if (goal === 'bulk' && observedWeekly < tol * 0.5) {
    recommendation = 'adjust';
    adjustKcal = 100;
    message = 'Tren belum naik. Pertimbangkan tambahan kecil (~100 kcal) dan perhatikan tren kekuatan sebagai konteks.';
  } else if (goal === 'maintain' && Math.abs(observedWeekly) > 0.35) {
    recommendation = 'adjust';
    adjustKcal = observedWeekly > 0 ? -100 : 100;
    message = 'Tren bergerak lebih dari biasanya untuk maintenance. Pertimbangkan penyesuaian kecil, atau tunggu satu minggu lagi.';
  } else if (goal === 'cut' && observedWeekly < -1.0) {
    recommendation = 'adjust';
    adjustKcal = 100;
    message = 'Tren turun lebih cepat dari rencana. Pertimbangkan menambah sedikit asupan agar lebih berkelanjutan.';
  }
  return { ...base, eligible: true, recommendation, adjustKcal, message };
}

// ─────────────────────────── Format ───────────────────────────

export const fmt = {
  kcal: (n: number) => Math.round(n).toLocaleString('id-ID'),
  kg: (n: number) => n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  g: (n: number) => Math.round(n).toLocaleString('id-ID'),
  signed: (n: number, d = 1) => (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d }),
};

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
