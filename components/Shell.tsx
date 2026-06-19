'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { autoInitials, currentPhase } from '@/lib/store';
import Toast from './Toast';
import FocusOverlay from './FocusOverlay';

const navItems = [
  { href: '/',           label: 'Dashboard',      icon: '⚡', group: 'Core' },
  { href: '/daily',      label: 'Daily OS',        icon: '🗓', group: 'Core', badge: true },
  { href: '/focus',      label: 'Focus Mode',      icon: '🎯', group: 'Core' },
  { href: '/skills',     label: 'Skill Matrix',    icon: '📐', group: 'Development' },
  { href: '/clients',    label: 'Client Pipeline', icon: '🤝', group: 'Development' },
  { href: '/health',     label: 'Health Tracker',  icon: '💪', group: 'Development' },
  { href: '/milestones', label: 'Milestones',      icon: '🏆', group: 'System' },
  { href: '/review',     label: 'Weekly Review',   icon: '📊', group: 'System' },
  { href: '/settings',   label: 'Settings',        icon: '⚙️', group: 'System' },
];

const groups = ['Core', 'Development', 'System'];

const pageTitles: Record<string, string> = {
  '/':           'Dashboard',
  '/daily':      'Daily OS',
  '/focus':      'Focus Mode',
  '/skills':     'Skill Matrix',
  '/clients':    'Client Pipeline',
  '/health':     'Health Tracker',
  '/milestones': 'Milestones',
  '/review':     'Weekly Review',
  '/settings':   'Settings',
};

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useApp();

  const displayName = state.userName || 'My System';
  const initials = state.userInitials || autoInitials(state.userName) || 'OS';
  const phase = currentPhase(state.day, state.targetDuration);
  const dayPct = Math.round((state.day / state.targetDuration) * 100);

  const incompletePillars = state.customPillars.filter(p => !state.pillars[p.id]).length;

  return (
    <div className="app">
      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="logo-area">
          <div className="logo-mark">
            <div className="logo-icon">OS</div>
            <div>
              <div className="logo-text">Personal<span>OS</span></div>
              <div className="logo-sub">Goal &amp; Habit System</div>
            </div>
          </div>
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{displayName}</div>
              <div className="user-status">● Active · Day {state.day}</div>
            </div>
          </div>
        </div>

        <nav className="nav-section">
          {groups.map(group => (
            <div key={group}>
              <div className="nav-label">{group}</div>
              {navItems
                .filter(n => n.group === group)
                .map(n => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`nav-item${pathname === n.href ? ' active' : ''}`}
                  >
                    <span className="nav-icon">{n.icon}</span>
                    {n.label}
                    {n.badge && incompletePillars > 0 && (
                      <span className="nav-badge">{incompletePillars}</span>
                    )}
                  </Link>
                ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="day-counter">
            <div>
              <div className="dc-label">Day {state.day} of {state.targetDuration}</div>
              <div className="dc-sub">Phase {phase.num}: {phase.label}</div>
            </div>
            <div className="dc-value">{dayPct}%</div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <main className="main">
        <div className="topbar">
          <div className="topbar-title">{pageTitles[pathname] ?? 'PersonalOS'}</div>
          <div className="topbar-right">
            <div className="streak-chip">🔥 <span>{state.streak}</span> day streak</div>
            <div className="phase-chip">⚡ Phase {phase.num}: {phase.label}</div>
          </div>
        </div>

        <div className="content">
          {children}
        </div>
      </main>

      <Toast />
      <FocusOverlay />
    </div>
  );
}
