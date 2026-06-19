'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { todayKey } from '@/lib/store';

const DURATIONS = [
  { mins: 15,  label: '15 min',  sub: 'Quick burst' },
  { mins: 25,  label: '25 min',  sub: 'Pomodoro' },
  { mins: 45,  label: '45 min',  sub: 'Deep focus' },
  { mins: 90,  label: '90 min',  sub: 'Flow state' },
  { mins: 120, label: '2 hours', sub: 'Marathon' },
];

export default function FocusPage() {
  const { state, toast } = useApp();
  const [focusTask, setFocusTask] = useState('');
  const [duration, setDuration] = useState(25);

  const launch = () => {
    const task = focusTask.trim() || 'Deep Work';
    window.startFocus?.(task, duration);
  };

  // Dynamic quick-launch from user's pillars
  const pillarLaunches = state.customPillars.slice(0, 4).map(p => ({
    label: `${p.icon} ${p.name}`,
    task: p.name,
    mins: 45,
  }));

  const today = todayKey();
  const todayMins = state.sessions
    .filter(s => s.date === today)
    .reduce((sum, s) => sum + s.mins, 0);
  const todayHrs = (todayMins / 60).toFixed(1);
  const overworkThreshold = state.notifications.overworkThresholdHours;
  const overworkPct = Math.min(100, Math.round((todayMins / (overworkThreshold * 60)) * 100));

  return (
    <div className="g2">
      <div>
        {/* ── Start session ─────────────────────────────────────────── */}
        <div className="card mb-16">
          <div className="sec-title mb-16">Start a Focus Session</div>

          <div className="input-label">What are you working on?</div>
          <input
            type="text"
            placeholder="Describe your task or goal..."
            value={focusTask}
            onChange={e => setFocusTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && launch()}
            style={{ marginBottom: 16 }}
          />

          <div className="input-label">Duration</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
            {DURATIONS.map(d => (
              <button
                key={d.mins}
                className={`btn btn-sm${duration === d.mins ? ' btn-primary' : ' btn-ghost'}`}
                style={{ flexDirection: 'column', height: 56, gap: 2, padding: '6px 4px' }}
                onClick={() => setDuration(d.mins)}
              >
                <span style={{ fontSize: 13, fontWeight: 700 }}>{d.label}</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>{d.sub}</span>
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary w-full"
            style={{ justifyContent: 'center', height: 46 }}
            onClick={launch}
          >
            🎯 Launch Session — {DURATIONS.find(d => d.mins === duration)?.label}
          </button>
        </div>

        {/* ── Quick launch from pillars ──────────────────────────────── */}
        {pillarLaunches.length > 0 && (
          <div className="card">
            <div className="sec-title mb-12">Quick Launch</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {pillarLaunches.map(q => (
                <button
                  key={q.label}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', fontSize: 13 }}
                  onClick={() => window.startFocus?.(q.task, q.mins)}
                >
                  <span style={{ flex: 1, textAlign: 'left' }}>{q.label}</span>
                  <span className="text-xs col-muted">{q.mins} min</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        {/* ── Today's focus stats ────────────────────────────────────── */}
        <div className="card mb-16">
          <div className="sec-title mb-12">Today&apos;s Focus</div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div className="stat-card" style={{ flex: 1, textAlign: 'center' }}>
              <div className="stat-value col-accent" style={{ fontSize: 26 }}>{todayHrs}h</div>
              <div className="stat-sub">Focused today</div>
            </div>
            <div className="stat-card" style={{ flex: 1, textAlign: 'center' }}>
              <div className="stat-value col-teal" style={{ fontSize: 26 }}>
                {state.sessions.filter(s => s.date === today).length}
              </div>
              <div className="stat-sub">Sessions done</div>
            </div>
          </div>

          <div className="input-label">Daily work load ({overworkThreshold}h limit)</div>
          <div className="prog-track" style={{ height: 8 }}>
            <div
              className="prog-fill"
              style={{
                width: overworkPct + '%',
                background: overworkPct >= 100
                  ? 'linear-gradient(90deg, var(--coral), var(--amber))'
                  : overworkPct >= 75
                    ? 'linear-gradient(90deg, var(--amber), var(--teal))'
                    : 'linear-gradient(90deg, var(--accent), var(--teal))',
              }}
            />
          </div>
          <div className="text-xs col-muted mt-6">
            {overworkPct >= 100
              ? '⚠️ You\'ve hit your work limit — take a real break!'
              : overworkPct >= 75
                ? `Almost there — ${overworkThreshold - parseFloat(todayHrs)}h left`
                : `${overworkPct}% of daily limit`}
          </div>
        </div>

        {/* ── Session history ────────────────────────────────────────── */}
        <div className="card">
          <div className="sec-header">
            <div>
              <div className="sec-title">Session History</div>
              <div className="sec-sub">{state.sessions.length} total sessions</div>
            </div>
          </div>

          {state.sessions.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <div className="empty-icon">🎯</div>
              <div className="empty-title">No sessions yet</div>
              <div className="empty-sub">Start your first focus session above.</div>
            </div>
          ) : (
            <div>
              {[...state.sessions].reverse().slice(0, 12).map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '9px 0',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 13,
                    animation: `fadeUp 0.3s ease ${i * 30}ms both`,
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'var(--accent-glow)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
                  }}>🎯</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.task}</div>
                    <div className="text-xs col-muted">{s.date}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--accent2)', flexShrink: 0 }}>{s.mins} min</div>
                </div>
              ))}
              {state.sessions.length > 12 && (
                <div className="text-xs col-muted mt-8 text-center">
                  +{state.sessions.length - 12} earlier sessions
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
