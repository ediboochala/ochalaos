'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WORKOUT_TYPES = ['Upper', 'Cardio', 'Lower', 'Active Recovery', 'Full Body', 'Outdoor', 'REST'];

const HEALTH_CHECKS = [
  'Drank water before coffee this morning',
  'Had a high-protein breakfast',
  'Took a movement break at 11am',
  'No caffeine after 2pm',
];

export default function HealthPage() {
  const { state, update, toast } = useApp();
  const [mealRating, setMealRating] = useState('');
  const [healthChecks, setHealthChecks] = useState<boolean[]>(HEALTH_CHECKS.map(() => false));

  const toggleWorkout = (i: number) => {
    if (i === 6) return; // REST day
    const next = [...state.workouts];
    next[i] = !next[i];
    update({ workouts: next });
    toast(next[i] ? `${WORKOUT_TYPES[i]} workout logged ✓` : 'Workout unmarked');
  };

  const workoutCount = state.workouts.filter((v, i) => v && i !== 6).length;
  const healthScore = Math.round((workoutCount / 5 * 40) + (Math.min(state.sleep / 8, 1) * 40) + (mealRating === 'Excellent' ? 20 : mealRating === 'Good' ? 10 : 0));

  return (
    <div className="g2">
      <div>
        {/* Week workout tracker */}
        <div className="card mb-16">
          <div className="sec-title mb-12">Weekly Workout Tracker</div>
          <div className="week-grid" id="week-grid">
            {DAYS.map((d, i) => (
              <div key={d} className="week-day">
                <div className="wd-label">{d}</div>
                <div
                  className={`wd-cell${i === 6 ? ' rest' : state.workouts[i] ? ' done' : ''}`}
                  onClick={() => toggleWorkout(i)}
                  title={WORKOUT_TYPES[i]}
                >
                  {WORKOUT_TYPES[i].split(' ')[0].substring(0, 3)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text2)' }}>
            {workoutCount}/5 workouts completed this week
          </div>
        </div>

        {/* Water tracker */}
        <div className="card mb-16">
          <div className="sec-title mb-12">Hydration</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 40, fontWeight: 800, color: 'var(--teal)' }}>
              {state.water}L
            </span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Target: 3L</span>
          </div>
          <div className="prog-track mb-12">
            <div className="prog-fill prog-fill-teal" style={{ width: Math.min((state.water / 3) * 100, 100) + '%' }} />
          </div>
          <div className="flex gap-8">
            <button className="btn btn-ghost btn-sm" onClick={() => update({ water: Math.max(0, state.water - 0.5) })}>−500ml</button>
            <button className="btn btn-primary btn-sm" onClick={() => update({ water: Math.min(6, state.water + 0.5) })}>+500ml</button>
          </div>
        </div>

        {/* Nutrition */}
        <div className="card">
          <div className="sec-title mb-12">Nutrition Today</div>
          <div style={{ padding: 10, background: 'var(--bg3)', borderRadius: 'var(--r-sm)' }}>
            <div className="text-sm font-bold mb-6">Meal quality today</div>
            <div className="flex gap-8">
              {['Excellent', 'Good', 'Poor'].map(r => (
                <button
                  key={r}
                  className={`btn btn-sm${mealRating === r ? ' btn-primary' : ' btn-ghost'}`}
                  style={{ flex: 1 }}
                  onClick={() => { setMealRating(r); toast('Meal quality: ' + r + ' logged'); }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        {/* Sleep tracker */}
        <div className="card mb-16">
          <div className="sec-title mb-12">Sleep Tracker</div>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 56, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: 'var(--accent2)' }}>{state.sleep}h</div>
            <div className="col-muted text-sm">Last night&apos;s sleep</div>
            <div className="flex gap-8 mt-16" style={{ justifyContent: 'center' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => update({ sleep: Math.max(4, state.sleep - 0.5) })}>−30 min</button>
              <button className="btn btn-ghost btn-sm" onClick={() => update({ sleep: Math.min(12, state.sleep + 0.5) })}>+30 min</button>
            </div>
          </div>
          <div className="prog-track">
            <div className="prog-fill prog-fill-teal" style={{ width: Math.min((state.sleep / 9) * 100, 100) + '%' }} />
          </div>
          <div className="flex gap-8 mt-16">
            <div className="stat-card" style={{ flex: 1, padding: 10 }}>
              <div className="stat-label">Bed time</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>10:00 pm</div>
            </div>
            <div className="stat-card" style={{ flex: 1, padding: 10 }}>
              <div className="stat-label">Wake time</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>5:30 am</div>
            </div>
          </div>
        </div>

        {/* Health score + checks */}
        <div className="card">
          <div className="sec-title mb-12">Weekly Health Score</div>
          <div style={{ fontSize: 64, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: 'var(--teal)', textAlign: 'center', padding: '16px 0' }}>
            {healthScore || '—'}
          </div>
          <div className="text-sm col-muted" style={{ textAlign: 'center' }}>Based on workouts, sleep, and nutrition</div>
          <hr className="divider" />
          <div className="check-list">
            {HEALTH_CHECKS.map((label, i) => (
              <div key={i} className={`check-item${healthChecks[i] ? ' done' : ''}`} onClick={() => {
                const n = [...healthChecks]; n[i] = !n[i]; setHealthChecks(n);
              }}>
                <div className="check-box">{healthChecks[i] ? '✓' : ''}</div>
                <div className="check-label text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
