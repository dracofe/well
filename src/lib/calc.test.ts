import { describe, expect, it } from 'vitest';
import {
  activeMs, addDays, buildPlan, e1rm, estimateActivityKcal, forecast, movingAverage, scaleNutrients,
  sessionVolume, sumNutrients, upsertWeight, validSet, validWeight, validateProfile, weeklyReview,
  type FoodItemSnapshot, type Session, type WeightEntry, type ProfileInput,
} from './calc';

const base: ProfileInput = { age: 25, heightCm: 172, weightKg: 80, formula: 'male', activity: 'moderate', goal: 'cut', pace: 'standard' };

const series = (start: string, days: number, fn: (i: number) => number | null): WeightEntry[] => {
  const out: WeightEntry[] = [];
  for (let i = 0; i < days; i++) {
    const v = fn(i);
    if (v != null) out.push({ date: addDays(start, i), kg: v, updatedAt: i });
  }
  return out;
};

describe('F01 planner', () => {
  it('T01 cut is below maintenance', () => {
    const p = buildPlan(base);
    expect(p.calories).toBeLessThan(p.tdee);
    expect(p.weeklyRateKg).toBeLessThan(0);
  });
  it('T02 bulk is above maintenance', () => {
    const p = buildPlan({ ...base, goal: 'bulk' });
    expect(p.calories).toBeGreaterThan(p.tdee);
  });
  it('maintain is near maintenance', () => {
    const p = buildPlan({ ...base, goal: 'maintain' });
    expect(Math.abs(p.calories - p.tdee)).toBeLessThan(10);
  });
  it('T20 guardrail never recommends below BMR', () => {
    const p = buildPlan({ ...base, weightKg: 45, heightCm: 150, age: 60, formula: 'female', activity: 'sitting' });
    expect(p.calories).toBeGreaterThanOrEqual(Math.round(p.bmr / 10) * 10 - 10);
    expect(p.warnings.length).toBeGreaterThan(0);
  });
  it('flags low target BMI', () => {
    expect(buildPlan({ ...base, targetWeightKg: 50 }).warnings.join(' ')).toMatch(/rentang/);
  });
  it('validates unrealistic profile', () => {
    expect(Object.keys(validateProfile({ age: 12, heightCm: 500, weightKg: -3 }))).toHaveLength(3);
  });
});

describe('F02 weight', () => {
  it('T03 same-day update upserts', () => {
    let l: WeightEntry[] = [];
    l = upsertWeight(l, { date: '2026-11-10', kg: 80, updatedAt: 1 });
    l = upsertWeight(l, { date: '2026-11-10', kg: 79.6, updatedAt: 2 });
    expect(l).toHaveLength(1);
    expect(l[0].kg).toBe(79.6);
  });
  it('T04 gaps are not filled', () => {
    const l = series('2026-11-01', 10, (i) => (i >= 2 && i <= 6 ? null : 80));
    const ma = movingAverage(l);
    expect(ma).toHaveLength(5);
    expect(ma.every((p) => p.avg === 80)).toBe(true);
  });
  it('T14 rejects negative weight', () => {
    expect(validWeight(-5)).not.toBeNull();
    expect(validWeight(80)).toBeNull();
  });
});

describe('F03 forecast', () => {
  it('T05 two weigh-ins in 30 days → scenario, no confident prediction', () => {
    const f = forecast([{ date: '2026-10-15', kg: 80, updatedAt: 0 }, { date: '2026-11-09', kg: 79, updatedAt: 0 }], '2026-11-10', { plannedWeeklyKg: -0.45 });
    expect(f.state).toBe('scenario');
  });
  it('T06 stable weight → stable projection with uncertainty', () => {
    const l = series('2026-10-10', 30, (i) => 80 + (i % 3 === 0 ? 0.3 : i % 3 === 1 ? -0.3 : 0));
    const f = forecast(l, '2026-11-08');
    expect(f.state).toBe('trend');
    if (f.state === 'trend') {
      expect(Math.abs(f.center - 80)).toBeLessThan(0.5);
      expect(f.hi - f.lo).toBeGreaterThan(0.5);
    }
  });
  it('declining trend projects downward', () => {
    const l = series('2026-10-10', 28, (i) => 85 - i * 0.07);
    const f = forecast(l, '2026-11-06');
    expect(f.state).toBe('trend');
    if (f.state === 'trend') expect(f.center).toBeLessThan(83.2);
  });
  it('early data has wider band than trend', () => {
    const full = series('2026-10-10', 28, (i) => 85 - i * 0.05 + (i % 2 ? 0.3 : -0.3));
    const fT = forecast(full, '2026-11-06');
    const fE = forecast(full.slice(-8), '2026-11-06', { lookback: 8 });
    expect(fE.state).toBe('early');
    if (fT.state === 'trend' && fE.state === 'early') expect(fE.hi - fE.lo).toBeGreaterThan(fT.hi - fT.lo);
  });
  it('extreme slope → unreliable', () => {
    const l = series('2026-10-25', 15, (i) => 90 - i * 0.6);
    expect(forecast(l, '2026-11-08').state).toBe('unreliable');
  });
});

describe('F04 food', () => {
  it('T07 100 g → 150 g scales', () => {
    const n = scaleNutrients({ kcal: 130, p: 2.7, c: 28, f: 0.3 }, 100, 150);
    expect(n.kcal).toBeCloseTo(195);
    expect(n.p).toBeCloseTo(4.05);
  });
  it('T08 quick add keeps macros unknown', () => {
    const item: FoodItemSnapshot = { id: 'a', foodId: null, name: 'Quick', source: 'estimate', per: { kcal: 250, p: null, c: null, f: null }, baseG: null, qty: 1, meal: 'snack', date: '2026-11-10', createdAt: 0 };
    const t = sumNutrients([item]);
    expect(t.kcal).toBe(250);
    expect(t.unknown).toBe(1);
  });
});

describe('F06/F07 workout', () => {
  const mk = (over: Partial<Session> = {}): Session => ({
    id: 's', name: 'Push', date: '2026-11-10', startedAt: 0, endedAt: 54 * 60000, pausedMs: 0, pausedAt: null, intensity: 'moderate', activity: 'lift_moderate',
    exercises: [{ id: 'e', exId: 'bench', name: 'Bench Press', muscle: 'Dada', kind: 'resistance', sets: [1, 2, 3].map((i) => ({ id: String(i), reps: 8, kg: 40, done: true })) }],
    ...over,
  });
  it('T10 bench 3×8×40 = 960 kg', () => expect(sessionVolume(mk())).toBe(960));
  it('incomplete sets excluded from volume', () => {
    const s = mk();
    s.exercises[0].sets[2].done = false;
    expect(sessionVolume(s)).toBe(640);
  });
  it('T11 no duration → unavailable', () => expect(estimateActivityKcal('lift_moderate', 80, 0).available).toBe(false));
  it('T13 pause is excluded', () => {
    expect(activeMs({ startedAt: 0, endedAt: 60 * 60000, pausedMs: 10 * 60000, pausedAt: null })).toBe(50 * 60000);
    expect(activeMs({ startedAt: 0, endedAt: null, pausedMs: 0, pausedAt: 30 * 60000 }, 40 * 60000)).toBe(30 * 60000);
  });
  it('different activities differ for equal time', () => {
    const a = estimateActivityKcal('walk', 80, 30), b = estimateActivityKcal('running', 80, 30);
    expect(b.hi).toBeGreaterThan(a.hi);
    expect(a.lo).toBeLessThan(a.hi);
  });
  it('T14 invalid reps/load blocked', () => {
    expect(validSet(0, 40)).not.toBeNull();
    expect(validSet(8, -1)).not.toBeNull();
    expect(validSet(2.5, 40)).not.toBeNull();
    expect(validSet(8, 40)).toBeNull();
  });
  it('e1rm limited to 1–12 reps', () => {
    expect(e1rm(100, 5)).toBeCloseTo(116.67, 1);
    expect(e1rm(100, 20)).toBeNull();
  });
});

describe('F09 weekly review', () => {
  it('not enough data → no conclusion', () => {
    const r = weeklyReview({ today: '2026-11-10', weights: [], food: [], sessions: [], goal: 'cut', plannedWeeklyKg: -0.45, proteinTarget: 150 });
    expect(r.eligible).toBe(false);
    expect(r.recommendation).toBeNull();
  });
});
