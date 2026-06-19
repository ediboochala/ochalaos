'use client';
import { useApp } from '@/lib/context';
import { currentPhase, GOAL_CATEGORY_COLORS, GOAL_CATEGORY_LABELS } from '@/lib/store';

const PHASE_DEFS = [
  {
    num: 1,
    label: 'Foundation',
    icon: '🏗',
    color: 'var(--accent2)',
    bg:   'rgba(123,111,255,0.12)',
    border: 'rgba(123,111,255,0.2)',
    universalItems: [
      'Established a consistent daily routine',
      'Completed first full week of all pillars',
      'Set up all goals and started tracking',
      'Built momentum — at least 7-day streak',
      'First weekly review completed',
    ],
  },
  {
    num: 2,
    label: 'Momentum',
    icon: '🚀',
    color: 'var(--teal)',
    bg:   'rgba(45,212,191,0.1)',
    border: 'rgba(45,212,191,0.2)',
    universalItems: [
      'Routine feels natural, not forced',
      'Significant progress on primary goals',
      'Identified and fixed 2+ weak habits',
      'Consistent 21+ day streak achieved',
      'Visible results in key goal areas',
    ],
  },
  {
    num: 3,
    label: 'Power',
    icon: '👑',
    color: 'var(--amber)',
    bg:   'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.2)',
    universalItems: [
      'Habits feel like part of identity',
      'All major goals at 80%+ completion',
      'System runs without external accountability',
      'Ready to define the next journey',
      'Measurable transformation achieved',
    ],
  },
];

export default function MilestonesPage() {
  const { state, update, toast } = useApp();
  const phase = currentPhase(state.day, state.targetDuration);
  const third = Math.ceil(state.targetDuration / 3);

  const toggle = (i: number) => {
    const next = [...(state.milestoneChecks ?? [])];
    // Ensure array is long enough
    while (next.length <= i) next.push(false);
    next[i] = !next[i];
    update({ milestoneChecks: next });
    if (next[i]) toast('Milestone achieved! 🏆');
  };

  const checks = state.milestoneChecks ?? [];
  const totalChecked = checks.filter(Boolean).length;
  const totalMilestones = PHASE_DEFS[0].universalItems.length;

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="card-accent mb-24" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div>
            <div className="font-sora" style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
              Your {state.targetDuration}-Day Victory Conditions
            </div>
            <div className="text-sm col-muted" style={{ lineHeight: 1.6 }}>
              Three phases. Each one builds on the last. Hit them in order — that&apos;s the compound effect.
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
            <div className="font-sora" style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent2)' }}>
              {totalChecked}/{totalMilestones}
            </div>
            <div className="text-xs col-muted mt-4">{totalChecked === totalMilestones ? '✓ Phase 1 complete' : `Phase ${phase.num}: ${phase.label}`}</div>
          </div>
        </div>
        <div className="prog-track" style={{ height: 8 }}>
          <div className="prog-fill" style={{ width: `${Math.round((totalChecked / totalMilestones) * 100)}%` }} />
        </div>
        <div className="text-xs col-muted mt-6">
          Day {state.day} · Phase {phase.num}: {phase.label}
        </div>
      </div>

      {/* ── Phase Cards ───────────────────────────────────────────────── */}
      <div className="g3 mb-24">
        {PHASE_DEFS.map(p => {
          const phaseStart = (p.num - 1) * third + 1;
          const phaseEnd = Math.min(p.num * third, state.targetDuration);
          const isActive = phase.num === p.num;
          const isLocked = phase.num < p.num;
          const isDone   = phase.num > p.num;

          // Pull goal names for this phase from user's goals
          const goalSlice = state.goals.slice((p.num - 1) * 2, p.num * 2);

          return (
            <div
              key={p.num}
              className={`milestone${isLocked ? ' locked' : ''}`}
              style={{
                borderColor: isActive ? p.border : undefined,
                background: isActive ? p.bg : undefined,
              }}
            >
              {isLocked && <div className="lock-overlay">🔒</div>}
              <div className="flex items-center gap-8 mb-12">
                <span style={{ fontSize: 22 }}>{p.icon}</span>
                <div>
                  <div className="milestone-phase" style={{ color: p.color }}>Phase {p.num} · Days {phaseStart}–{phaseEnd}</div>
                  <div className="milestone-title">{p.label}</div>
                </div>
                {isDone && (
                  <span className="badge f-right" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>✓ Done</span>
                )}
                {isActive && (
                  <span className="badge f-right" style={{ background: p.bg, color: p.color }}>Active</span>
                )}
              </div>

              <ul className="milestone-list">
                {p.universalItems.map(item => <li key={item}>{item}</li>)}
              </ul>

              {goalSlice.length > 0 && (
                <>
                  <hr className="divider" />
                  <div className="text-xs col-muted mb-8" style={{ textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>
                    Your goals this phase
                  </div>
                  {goalSlice.map(g => {
                    const col = GOAL_CATEGORY_COLORS[g.category];
                    const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                    return (
                      <div key={g.id} style={{ marginBottom: 8 }}>
                        <div className="flex items-center gap-6 mb-4">
                          <span className="badge" style={{ background: col.bg, color: col.color }}>{GOAL_CATEGORY_LABELS[g.category]}</span>
                          <span className="text-xs">{g.name}</span>
                          <span className="text-xs col-muted f-right">{pct}%</span>
                        </div>
                        <div className="prog-track" style={{ height: 4 }}>
                          <div className="prog-fill" style={{ width: pct + '%', background: col.color }} />
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Phase 1 Checklist ─────────────────────────────────────────── */}
      <div className="card">
        <div className="sec-header">
          <div>
            <div className="sec-title">Phase 1 — Foundation Checklist</div>
            <div className="sec-sub">Mark each win as you achieve it — {totalChecked}/{totalMilestones} done</div>
          </div>
        </div>
        <div className="check-list">
          {PHASE_DEFS[0].universalItems.map((item, i) => (
            <div
              key={i}
              className={`check-item${checks[i] ? ' done' : ''}`}
              onClick={() => toggle(i)}
            >
              <div className="check-box">{checks[i] ? '✓' : ''}</div>
              <div className="check-label">{item}</div>
              {checks[i] && <span className="badge" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>Achieved</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
