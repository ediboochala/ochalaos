'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import {
  getDateKey,
  GOAL_CATEGORY_COLORS,
  GOAL_CATEGORY_LABELS,
  currentPhase,
  todayKey,
} from '@/lib/store';
import GratitudeCard from '@/components/GratitudeCard';

const quotes = [
  ['The secret of getting ahead is getting started.', 'Mark Twain'],
  ['Excellence is not a destination but a continuous journey.', 'Brian Tracy'],
  ['Your future self is watching you right now through memories.', 'Aubrey de Grey'],
  ["You don't rise to the level of your goals. You fall to the level of your systems.", 'James Clear'],
  ['Discipline is choosing between what you want now and what you want most.', 'Abraham Lincoln'],
  ['Success is the sum of small efforts repeated day in and day out.', 'Robert Collier'],
  ['What gets measured, gets managed.', 'Peter Drucker'],
  ['Small daily improvements over time lead to stunning results.', 'Robin Sharma'],
  ['We are what we repeatedly do. Excellence, then, is not an act, but a habit.', 'Aristotle'],
  ['The way to get started is to quit talking and begin doing.', 'Walt Disney'],
];

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCount(target: number, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

export default function DashboardPage() {
  const { state, update, toast } = useApp();
  const router = useRouter();
  const [qIdx, setQIdx] = useState(0);
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
    setQIdx(Math.floor(Math.random() * quotes.length));
  }, []);

  const isNewUser = !state.userName;

  const togglePillar = (id: string) => {
    const next = { ...state.pillars, [id]: !state.pillars[id] };
    const today = todayKey();
    const count = Object.values(next).filter(Boolean).length;
    update({ pillars: next, heatmap: { ...state.heatmap, [today]: count } });
    if (!state.pillars[id]) toast('Pillar completed ✓');
  };

  const pillarsCompleted = state.customPillars.filter(p => state.pillars[p.id]).length;
  const totalPillars = state.customPillars.length;
  const dayPct = Math.round((state.day / state.targetDuration) * 100);
  const phase = currentPhase(state.day, state.targetDuration);
  const displayName = state.userName || 'there';

  // Animated stat values
  const animDay = useCount(state.day);
  const animStreak = useCount(state.streak);
  const animDayPct = useCount(dayPct);

  // Heatmap
  const visibleDays = Math.min(state.targetDuration, 182);
  const cols = visibleDays <= 30 ? visibleDays : visibleDays <= 91 ? 13 : 26;
  const heatCells = Array.from({ length: visibleDays }, (_, i) => {
    const key = getDateKey(state.startDate, i);
    const val = state.heatmap[key] ?? 0;
    const isToday = i === state.day - 1;
    let bg = 'var(--bg4)';
    if (val >= (totalPillars || 5)) bg = 'var(--accent)';
    else if (val > 0) bg = 'rgba(123,111,255,0.38)';
    return { i, bg, isToday };
  });

  const topGoals = state.goals.slice(0, 4);

  // Dynamic phase progress
  const phaseDefs = [
    { num: 1, label: 'Foundation', color: 'var(--accent2)', bg: 'rgba(123,111,255,0.15)', fill: '' },
    { num: 2, label: 'Momentum',   color: 'var(--teal)',    bg: 'rgba(45,212,191,0.12)', fill: 'prog-fill-teal' },
    { num: 3, label: 'Power',      color: 'var(--amber)',   bg: 'rgba(245,158,11,0.12)', fill: 'prog-fill-amber' },
  ];

  return (
    <>
      {/* ── Onboarding banner ─────────────────────────────────────────── */}
      {isNewUser && (
        <div className="onboard-banner">
          <div className="onboard-icon">👋</div>
          <div className="onboard-body">
            <div className="onboard-title">Welcome! Let&apos;s set up your system.</div>
            <div className="onboard-sub">
              Add your name, set your timeline, and choose your goals — it only takes 2 minutes.
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ flexShrink: 0 }}
            onClick={() => router.push('/settings')}
          >
            Get started →
          </button>
        </div>
      )}

      {/* ── Gratitude Card (morning / evening) ───────────────────────── */}
      <GratitudeCard />

      {/* ── Welcome Hero ──────────────────────────────────────────────── */}
      <div className="welcome-hero">
        <div className="welcome-time">{greeting}</div>
        <div className="welcome-name">
          {displayName !== 'there' ? (
            <>Welcome back, <span>{displayName}.</span></>
          ) : (
            <>Your system is <span>running.</span></>
          )}
        </div>
        <div className="welcome-sub">
          Day <strong>{state.day}</strong> of <strong>{state.targetDuration}</strong> —
          Phase {phase.num}: {phase.label}. Consistency beats intensity.
        </div>
        <div className="welcome-stats">
          <div>
            <div className="ws-val col-accent">{pillarsCompleted}/{totalPillars}</div>
            <div className="ws-label">Pillars today</div>
          </div>
          <div>
            <div className="ws-val col-amber">{animStreak} 🔥</div>
            <div className="ws-label">Day streak</div>
          </div>
          <div>
            <div className="ws-val col-teal">{animDayPct}%</div>
            <div className="ws-label">Journey done</div>
          </div>
          <div>
            <div className="ws-val col-green">{state.goals.length}</div>
            <div className="ws-label">Active goals</div>
          </div>
        </div>
      </div>

      {/* ── Stat Row ──────────────────────────────────────────────────── */}
      <div className="g4 mb-24">
        <div className="stat-card">
          <div className="stat-label">Journey Progress</div>
          <div className="stat-value col-accent">{animDayPct}%</div>
          <div className="prog-track">
            <div className="prog-fill" style={{ width: dayPct + '%' }} />
          </div>
          <div className="stat-sub">Day {animDay} of {state.targetDuration}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Streak</div>
          <div className="stat-value col-amber">{animStreak} 🔥</div>
          <div className="stat-sub">
            {state.streak >= 7 ? 'On fire! Keep going' : 'Build the chain'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pillars Complete</div>
          <div className="stat-value col-teal">{pillarsCompleted}/{totalPillars}</div>
          {totalPillars > 0 && (
            <div className="prog-track">
              <div className="prog-fill prog-fill-teal" style={{ width: (pillarsCompleted / totalPillars * 100) + '%' }} />
            </div>
          )}
          <div className="stat-sub">
            {pillarsCompleted === totalPillars && totalPillars > 0 ? '🎉 All done!' : `${totalPillars - pillarsCompleted} remaining`}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Phase</div>
          <div className="stat-value" style={{ fontSize: 20, fontFamily: 'Sora, sans-serif', fontWeight: 800 }}>
            {phase.label}
          </div>
          <div className="stat-sub">Phase {phase.num} of 3</div>
        </div>
      </div>

      <div className="g2 mb-24">
        {/* ── Today's Pillars ───────────────────────────────────────── */}
        <div className="card">
          <div className="sec-header">
            <div>
              <div className="sec-title">Today&apos;s Pillars</div>
              <div className="sec-sub">
                {totalPillars === 0
                  ? 'No pillars — add some in Settings'
                  : `${pillarsCompleted} of ${totalPillars} completed`}
              </div>
            </div>
            {pillarsCompleted === totalPillars && totalPillars > 0 && (
              <span className="badge" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
                🎉 Perfect day
              </span>
            )}
          </div>

          {state.customPillars.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧱</div>
              <div className="empty-title">No pillars configured</div>
              <div className="empty-sub">Go to Settings → Pillars to add your daily habits.</div>
              <button className="btn btn-primary btn-sm" onClick={() => router.push('/settings')}>
                Set up pillars
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {state.customPillars.map(p => {
                const done = state.pillars[p.id];
                return (
                  <div key={p.id} className="pillar-card" onClick={() => togglePillar(p.id)}>
                    <div className="pillar-icon" style={{ background: p.color }}>{p.icon}</div>
                    <div className="pillar-body">
                      <div className="pillar-name">{p.name}</div>
                      <div className="pillar-desc">{p.desc}</div>
                      <div className="pillar-time">{p.time}</div>
                    </div>
                    <div className={`pillar-check${done ? ' checked' : ''}`}>{done ? '✓' : ''}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right column ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Goal progress */}
          {topGoals.length > 0 ? (
            <div className="card">
              <div className="sec-header mb-12">
                <div>
                  <div className="sec-title">Goal Progress</div>
                  <div className="sec-sub">{state.goals.length} active goal{state.goals.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
              {topGoals.map(g => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                const col = GOAL_CATEGORY_COLORS[g.category];
                return (
                  <div key={g.id} style={{ marginBottom: 14 }}>
                    <div className="flex items-center gap-8 mb-5">
                      <span className="badge" style={{ background: col.bg, color: col.color }}>
                        {GOAL_CATEGORY_LABELS[g.category]}
                      </span>
                      <span className="text-sm font-bold" style={{ flex: 1 }}>{g.name}</span>
                      <span className="text-xs col-muted">{g.current}/{g.target}</span>
                    </div>
                    <div className="prog-track">
                      <div className="prog-fill" style={{ width: pct + '%', background: col.color }} />
                    </div>
                  </div>
                );
              })}
              {state.goals.length > 4 && (
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => router.push('/settings')}>
                  View all {state.goals.length} goals →
                </button>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div className="empty-icon">🎯</div>
                <div className="empty-title">No goals yet</div>
                <div className="empty-sub">Add goals in Settings to track your progress here.</div>
                <button className="btn btn-primary btn-sm" onClick={() => router.push('/settings')}>
                  Add goals
                </button>
              </div>
            </div>
          )}

          {/* Phase milestones */}
          <div className="card">
            <div className="sec-header mb-12">
              <div>
                <div className="sec-title">Phase Milestones</div>
                <div className="sec-sub">{state.targetDuration}-day journey</div>
              </div>
            </div>
            {phaseDefs.map(m => {
              const third = Math.ceil(state.targetDuration / 3);
              const phaseStart = (m.num - 1) * third + 1;
              const phaseEnd = Math.min(m.num * third, state.targetDuration);
              const pct =
                phase.num > m.num ? 100 :
                phase.num < m.num ? 0 :
                Math.max(0, Math.round(((state.day - phaseStart) / (phaseEnd - phaseStart + 1)) * 100));
              return (
                <div key={m.num} style={{ marginBottom: 12 }}>
                  <div className="flex items-center gap-8 mb-5">
                    <span className="badge" style={{ background: m.bg, color: m.color }}>P{m.num}</span>
                    <span className="text-sm font-bold">{m.label}</span>
                    <span className="text-xs col-muted f-right">
                      {phase.num < m.num ? '🔒 Locked' : `${pct}%`}
                    </span>
                  </div>
                  <div className="prog-track">
                    <div className={`prog-fill ${m.fill}`} style={{ width: pct + '%' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quote + focus */}
          <div className="card">
            <div className="sec-title mb-10">Today&apos;s Quote</div>
            <div style={{
              fontSize: 13, color: 'var(--text2)', lineHeight: 1.75,
              fontStyle: 'italic',
              borderLeft: '2px solid var(--accent)', paddingLeft: 12,
            }}>
              &ldquo;{quotes[qIdx][0]}&rdquo;
            </div>
            <div className="text-xs col-muted mt-10">— {quotes[qIdx][1]}</div>
            <button
              className="btn btn-ghost btn-sm mt-12"
              onClick={() => setQIdx(i => (i + 1) % quotes.length)}
            >
              Next quote
            </button>
          </div>

          <div className="card card-sm">
            <div className="text-sm col-muted mb-8">Quick focus</div>
            <div className="flex gap-8">
              <button className="btn btn-primary btn-sm" onClick={() => window.startFocus?.('Deep Work', 25)}>
                🎯 25 min
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => window.startFocus?.('Deep Work', 50)}>
                🧠 50 min
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => window.startFocus?.('Learning', 90)}>
                📚 90 min
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Activity Heatmap ──────────────────────────────────────────── */}
      <div className="card">
        <div className="sec-header">
          <div>
            <div className="sec-title">Activity Map</div>
            <div className="sec-sub">
              {visibleDays < state.targetDuration
                ? `First ${visibleDays} of ${state.targetDuration} days shown`
                : `Full ${state.targetDuration}-day journey`}
            </div>
          </div>
          <span className="badge" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
            ● Day {state.day} active
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 4, marginTop: 8,
          }}
        >
          {heatCells.map(({ i, bg, isToday }) => (
            <div
              key={i}
              title={`Day ${i + 1}`}
              style={{
                aspectRatio: '1',
                borderRadius: 3,
                background: bg,
                border: `1.5px solid ${isToday ? 'var(--accent)' : 'transparent'}`,
                transition: 'transform 0.15s',
                cursor: 'default',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
            />
          ))}
        </div>
        <div className="flex gap-16 mt-14 text-xs col-muted">
          {[
            { label: 'No activity',  bg: 'var(--bg4)' },
            { label: 'Partial day',  bg: 'rgba(123,111,255,0.38)' },
            { label: 'Full day',     bg: 'var(--accent)' },
          ].map(l => (
            <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: l.bg, display: 'inline-block', flexShrink: 0 }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
