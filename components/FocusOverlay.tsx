'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { todayKey } from '@/lib/store';

// Global focus control exposed via window for easy invocation
declare global {
  interface Window {
    startFocus: (task: string, mins: number) => void;
  }
}

export default function FocusOverlay() {
  const { state, update, toast } = useApp();
  const [visible, setVisible] = useState(false);
  const [task, setTask] = useState('Deep Creative Work');
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const end = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVisible(false);
    const mins = Math.max(1, Math.round((total - remaining) / 60));
    const sess = { task, mins, date: todayKey() };
    update({ sessions: [...state.sessions, sess] });
    toast(`Session complete! ${mins} min logged ✓`);
  }, [remaining, total, task, state, update, toast]);

  const start = useCallback((taskName: string, mins: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const secs = mins * 60;
    setTask(taskName);
    setTotal(secs);
    setRemaining(secs);
    setPaused(false);
    setVisible(true);
  }, []);

  useEffect(() => {
    window.startFocus = start;
  }, [start]);

  useEffect(() => {
    if (!visible) return;
    intervalRef.current = setInterval(() => {
      if (!paused) {
        setRemaining(r => {
          if (r <= 1) { end(); return 0; }
          return r - 1;
        });
      }
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [visible, paused, end]);

  const fmt = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;

  if (!visible) return null;

  return (
    <div className="focus-overlay show">
      <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Focus Session
      </div>
      <div className="focus-task">{task}</div>
      <div className="focus-timer">{fmt(remaining)}</div>
      <div className="focus-bar-track" style={{ marginBottom: 40 }}>
        <div className="focus-bar" style={{ width: pct + '%' }} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => setPaused(p => !p)}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button className="btn btn-ghost" style={{ color: 'var(--coral)' }} onClick={end}>
          End Session
        </button>
      </div>
    </div>
  );
}
