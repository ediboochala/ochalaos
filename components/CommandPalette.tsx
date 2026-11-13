'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Cmd {
  id: string;
  icon: string;
  label: string;
  hint?: string;
  action: () => void;
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Cmd[] = [
    { id: 'nav-dashboard',    icon: '⚡',  label: 'Go to Dashboard',       action: () => router.push('/') },
    { id: 'nav-daily',        icon: '🗓',  label: 'Go to Daily OS',        action: () => router.push('/daily') },
    { id: 'nav-focus',        icon: '🎯',  label: 'Go to Focus Mode',      action: () => router.push('/focus') },
    { id: 'nav-stopwatch',    icon: '⏱️',  label: 'Go to Stopwatch',       action: () => router.push('/stopwatch') },
    { id: 'nav-arcade',       icon: '🕹️',  label: 'Go to Arcade',          action: () => router.push('/arcade') },
    { id: 'nav-skills',       icon: '📐',  label: 'Go to Skill Matrix',    action: () => router.push('/skills') },
    { id: 'nav-clients',      icon: '🤝',  label: 'Go to Client Pipeline', action: () => router.push('/clients') },
    { id: 'nav-health',       icon: '💪',  label: 'Go to Health Tracker',  action: () => router.push('/health') },
    { id: 'nav-milestones',   icon: '🏆',  label: 'Go to Milestones',      action: () => router.push('/milestones') },
    { id: 'nav-achievements', icon: '🎖️',  label: 'Go to Achievements',    action: () => router.push('/achievements') },
    { id: 'nav-review',       icon: '📊',  label: 'Go to Weekly Review',   action: () => router.push('/review') },
    { id: 'nav-settings',     icon: '⚙️',  label: 'Go to Settings',        action: () => router.push('/settings') },
    { id: 'action-focus25',   icon: '🎯',  label: 'Start a 25-min focus session', action: () => window.startFocus?.('Deep Work', 25) },
    { id: 'action-focus50',   icon: '🧠',  label: 'Start a 50-min focus session', action: () => window.startFocus?.('Deep Work', 50) },
    { id: 'action-export',    icon: '⬇️',  label: 'Export your data', hint: 'Settings → System', action: () => router.push('/settings') },
  ];

  const filtered = query.trim()
    ? commands.filter(c => c.label.toLowerCase().includes(query.trim().toLowerCase()))
    : commands;

  const run = useCallback((cmd: Cmd) => {
    cmd.action();
    setOpen(false);
    setQuery('');
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    const onOpenRequest = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-palette', onOpenRequest);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-command-palette', onOpenRequest);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(filtered.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[active]) run(filtered[active]); }
  };

  if (!open) return null;

  return (
    <div className="cmdk-overlay" onClick={() => setOpen(false)}>
      <div className="cmdk-panel" onClick={e => e.stopPropagation()}>
        <div className="cmdk-input-row">
          <span className="cmdk-icon">⌘</span>
          <input
            ref={inputRef}
            className="cmdk-input"
            placeholder="Search pages or run a command..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <span className="cmdk-esc">Esc</span>
        </div>
        <div className="cmdk-list">
          {filtered.length === 0 && <div className="cmdk-empty">No matches</div>}
          {filtered.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`cmdk-item${i === active ? ' active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => run(c)}
            >
              <span className="cmdk-item-icon">{c.icon}</span>
              <span className="cmdk-item-label">{c.label}</span>
              {c.hint && <span className="cmdk-item-hint">{c.hint}</span>}
            </button>
          ))}
        </div>
        <div className="cmdk-footer">
          <span>↑↓ Navigate</span><span>↵ Select</span><span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
