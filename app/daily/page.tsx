'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { DailyTask, generateId, todayKey } from '@/lib/store';

const DEFAULT_SCHEDULE = [
  { time: '5:30–6:00 am',   title: 'Wake & activate',       note: 'No phone 30 min. Water, stretch, set intention.',      icon: '🌅', color: 'var(--accent)' },
  { time: '6:00–7:30 am',   title: 'Morning routine',       note: 'Exercise, nutrition, grooming — non-negotiable block.', icon: '💪', color: 'var(--teal)' },
  { time: '7:30–8:00 am',   title: 'Daily planning sprint', note: '3 priorities for the day. Review goals. No socials.',   icon: '📋', color: 'var(--blue)' },
  { time: '8:00–12:00 pm',  title: 'Deep work block 1',     note: 'Best hours. Phone on silent. Maximum output.',          icon: '🎯', color: 'var(--accent)' },
  { time: '12:00–12:20 pm', title: 'Break — move body',     note: 'Walk, stretch, eyes off screen.',                       icon: '🚶', color: 'var(--green)' },
  { time: '12:20–1:00 pm',  title: 'Learning block',        note: 'Course, book, or deliberate practice.',                 icon: '📚', color: 'var(--teal)' },
  { time: '1:00–2:00 pm',   title: 'Lunch & real break',    note: 'Proper meal. Step away from workspace.',                icon: '🍽', color: 'var(--green)' },
  { time: '2:00–5:00 pm',   title: 'Deep work block 2',     note: 'Apply what you learned. Refine, produce, ship.',        icon: '✨', color: 'var(--accent)' },
  { time: '5:00–6:00 pm',   title: 'Physical activity',     note: 'Exercise session, sport, or long walk.',                icon: '🏃', color: 'var(--amber)' },
  { time: '6:00–8:30 pm',   title: 'Personal time',         note: 'Sacred. Do not let work bleed in.',                     icon: '🌆', color: 'var(--pink)' },
  { time: '8:30–9:30 pm',   title: 'Wind-down & journal',   note: '1 win, 1 lesson, 1 intention. Screen-off by 9:30.',     icon: '🌙', color: 'var(--coral)' },
  { time: '10:00 pm',       title: 'Lights out',            note: '7–9 hours. Sleep is a performance tool.',               icon: '😴', color: 'var(--text3)' },
];

const TASK_CATEGORIES = [
  { label: 'Health',    tagBg: 'var(--teal-bg)',    tagColor: 'var(--teal)' },
  { label: 'Deep Work', tagBg: 'var(--accent-glow)', tagColor: 'var(--accent2)' },
  { label: 'Skills',    tagBg: 'var(--blue-bg)',    tagColor: 'var(--blue)' },
  { label: 'Business',  tagBg: 'var(--amber-bg)',   tagColor: 'var(--amber)' },
  { label: 'Personal',  tagBg: 'var(--coral-bg)',   tagColor: 'var(--coral)' },
  { label: 'Other',     tagBg: 'var(--bg4)',         tagColor: 'var(--text2)' },
];

export default function DailyPage() {
  const { state, update, toast } = useApp();
  const today = todayKey();

  // ── Today's tasks from persisted state ─────────────────────────────────
  const todayTasks = useMemo(() => state.dailyTasks.filter(t => t.date === today), [state.dailyTasks, today]);
  const doneCount = todayTasks.filter(t => t.done).length;

  // ── New task form ───────────────────────────────────────────────────────
  const [newLabel, setNewLabel] = useState('');
  const [newCat, setNewCat] = useState(0); // index into TASK_CATEGORIES

  const toggleTask = (id: string) => {
    const updated = state.dailyTasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    update({ dailyTasks: updated });
  };

  const addTask = () => {
    const label = newLabel.trim();
    if (!label) { toast('Enter a task name'); return; }
    const cat = TASK_CATEGORIES[newCat];
    const task: DailyTask = {
      id: generateId(),
      label,
      category: cat.label,
      tagBg: cat.tagBg,
      tagColor: cat.tagColor,
      done: false,
      date: today,
    };
    update({ dailyTasks: [...state.dailyTasks, task] });
    setNewLabel('');
    toast('Task added ✓');
  };

  const deleteTask = (id: string) => {
    update({ dailyTasks: state.dailyTasks.filter(t => t.id !== id) });
  };

  const completeAll = () => {
    const updated = state.dailyTasks.map(t => t.date === today ? { ...t, done: true } : t);
    update({ dailyTasks: updated });
    toast('All tasks completed! 🎉');
  };

  // Seed tasks from pillars if today has none
  const seedFromPillars = () => {
    if (todayTasks.length > 0) { toast('Tasks already exist for today'); return; }
    const tasks: DailyTask[] = state.customPillars.map(p => ({
      id: generateId(),
      label: `Complete: ${p.name}`,
      category: p.category,
      tagBg: p.color,
      tagColor: 'var(--text)',
      done: false,
      date: today,
    }));
    update({ dailyTasks: [...state.dailyTasks, ...tasks] });
    toast(`${tasks.length} tasks seeded from pillars ✓`);
  };

  return (
    <div className="g2">
      {/* ── Schedule ──────────────────────────────────────────────────────── */}
      <div>
        <div className="card mb-16">
          <div className="sec-header">
            <div>
              <div className="sec-title">Today&apos;s Schedule</div>
              <div className="sec-sub">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="timeline">
            {DEFAULT_SCHEDULE.map((s, i) => (
              <div key={i} className="tl-item">
                <div className="tl-left">
                  <div className="tl-dot" style={{ background: s.color + '22', borderColor: s.color }}>{s.icon}</div>
                  {i < DEFAULT_SCHEDULE.length - 1 && <div className="tl-line" />}
                </div>
                <div className="tl-content">
                  <div className="tl-time">{s.time}</div>
                  <div className="tl-title">{s.title}</div>
                  <div className="tl-note">{s.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Task list ─────────────────────────────────────────────────────── */}
      <div>
        <div className="card mb-16">
          <div className="sec-header">
            <div>
              <div className="sec-title">Task List</div>
              <div className="sec-sub">{doneCount}/{todayTasks.length} done today</div>
            </div>
            <div className="flex gap-8">
              {todayTasks.length === 0 && (
                <button className="btn btn-ghost btn-sm" onClick={seedFromPillars}>
                  Seed from pillars
                </button>
              )}
              {todayTasks.length > 0 && (
                <button className="btn btn-primary btn-sm" onClick={completeAll}>
                  Complete all
                </button>
              )}
            </div>
          </div>

          {/* Task items */}
          <div className="check-list">
            {todayTasks.length === 0 ? (
              <div className="text-sm col-muted" style={{ padding: '8px 0' }}>
                No tasks for today. Add one below or seed from your pillars.
              </div>
            ) : (
              todayTasks.map(t => (
                <div
                  key={t.id}
                  className={`check-item${t.done ? ' done' : ''}`}
                >
                  <div className="check-box" onClick={() => toggleTask(t.id)}>
                    {t.done ? '✓' : ''}
                  </div>
                  <div className="check-label" onClick={() => toggleTask(t.id)} style={{ flex: 1 }}>
                    {t.label}
                  </div>
                  <span className="check-tag" style={{ background: t.tagBg, color: t.tagColor }}>
                    {t.category}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '2px 6px', color: 'var(--text3)', marginLeft: 4 }}
                    onClick={() => deleteTask(t.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add task form */}
          <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <div className="input-label">Add task</div>
            <div className="flex gap-8 mb-8">
              <input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addTask(); }}
                placeholder="What do you need to do?"
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary btn-sm" onClick={addTask}>+ Add</button>
            </div>
            <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
              {TASK_CATEGORIES.map((c, i) => (
                <button
                  key={c.label}
                  type="button"
                  className={`btn btn-sm ${newCat === i ? 'btn-primary' : 'btn-ghost'}`}
                  style={newCat !== i ? { color: c.tagColor } : {}}
                  onClick={() => setNewCat(i)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress summary */}
        {todayTasks.length > 0 && (
          <div className="card card-sm">
            <div className="text-sm col-muted mb-8">Today&apos;s completion</div>
            <div className="prog-track">
              <div
                className="prog-fill prog-fill-teal"
                style={{ width: `${Math.round((doneCount / todayTasks.length) * 100)}%` }}
              />
            </div>
            <div className="text-xs col-muted mt-6">
              {doneCount} of {todayTasks.length} tasks · {Math.round((doneCount / todayTasks.length) * 100)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
