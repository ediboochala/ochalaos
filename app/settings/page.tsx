'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import {
  clearState,
  GOAL_TEMPLATES,
  GOAL_CATEGORY_LABELS,
  GOAL_CATEGORY_COLORS,
  GoalCategory,
  Goal,
  CustomPillar,
  DEFAULT_PILLARS,
  PILLAR_ICONS,
  PILLAR_COLORS,
  generateId,
  autoInitials,
} from '@/lib/store';

type Tab = 'profile' | 'goals' | 'pillars' | 'notifications' | 'system';

// ── Icon picker ───────────────────────────────────────────────────────────────
function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn btn-ghost btn-sm"
        style={{ fontSize: 20, width: 42, height: 42, padding: 0 }}
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        {value || '❓'}
      </button>
      {open && (
        <div className="icon-picker-popup">
          {PILLAR_ICONS.map(icon => (
            <button
              key={icon}
              type="button"
              className="icon-opt"
              onClick={() => { onChange(icon); setOpen(false); }}
            >
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Pillar editor row ─────────────────────────────────────────────────────────
function PillarRow({
  pillar,
  onUpdate,
  onDelete,
  canDelete,
}: {
  pillar: CustomPillar;
  onUpdate: (p: CustomPillar) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="pillar-edit-row">
      <div className="pillar-edit-header" onClick={() => setExpanded(e => !e)}>
        <span style={{ fontSize: 20 }}>{pillar.icon}</span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{pillar.name || 'Unnamed pillar'}</span>
        <span className="text-xs col-muted">{pillar.time}</span>
        <span style={{ marginLeft: 8, color: 'var(--text3)' }}>{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div className="pillar-edit-body">
          <div className="flex gap-8 mb-10" style={{ alignItems: 'center' }}>
            <IconPicker value={pillar.icon} onChange={v => onUpdate({ ...pillar, icon: v })} />
            <div style={{ flex: 1 }}>
              <div className="input-label">Name</div>
              <input
                value={pillar.name}
                onChange={e => onUpdate({ ...pillar, name: e.target.value })}
                placeholder="Pillar name"
              />
            </div>
          </div>
          <div className="input-label">Description</div>
          <input
            value={pillar.desc}
            onChange={e => onUpdate({ ...pillar, desc: e.target.value })}
            placeholder="Short description"
            style={{ marginBottom: 10 }}
          />
          <div className="input-label">Time / Schedule</div>
          <input
            value={pillar.time}
            onChange={e => onUpdate({ ...pillar, time: e.target.value })}
            placeholder="e.g. 6:00 – 7:30 am"
            style={{ marginBottom: 10 }}
          />
          <div className="input-label">Color accent</div>
          <div className="flex gap-8 mb-10">
            {PILLAR_COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                className="color-swatch"
                style={{
                  background: c.value,
                  border: pillar.color === c.value ? '2px solid var(--accent)' : '2px solid transparent',
                }}
                title={c.label}
                onClick={() => onUpdate({ ...pillar, color: c.value })}
              />
            ))}
          </div>
          {canDelete && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--coral)', marginTop: 4 }}
              onClick={onDelete}
            >
              Remove pillar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Goal row ──────────────────────────────────────────────────────────────────
function GoalRow({ goal, onUpdate, onDelete }: {
  goal: Goal;
  onUpdate: (g: Goal) => void;
  onDelete: () => void;
}) {
  const colors = GOAL_CATEGORY_COLORS[goal.category];
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  return (
    <div className="goal-row">
      <div style={{ flex: 1 }}>
        <div className="flex items-center gap-8 mb-6">
          <span className="badge" style={{ background: colors.bg, color: colors.color }}>
            {GOAL_CATEGORY_LABELS[goal.category]}
          </span>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{goal.name}</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="prog-track" style={{ flex: 1 }}>
            <div className="prog-fill" style={{ width: pct + '%', background: colors.color }} />
          </div>
          <span className="text-xs col-muted">{goal.current}/{goal.target} {goal.unit}</span>
        </div>
        <div className="flex gap-6 mt-8">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: '3px 10px' }}
            onClick={() => onUpdate({ ...goal, current: Math.max(0, goal.current - 1) })}
          >−</button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: '3px 10px' }}
            onClick={() => onUpdate({ ...goal, current: goal.current + 1 })}
          >+</button>
          <input
            type="number"
            min={0}
            value={goal.current}
            onChange={e => onUpdate({ ...goal, current: Number(e.target.value) })}
            style={{ width: 60, padding: '3px 8px', fontSize: 12 }}
          />
        </div>
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        style={{ color: 'var(--coral)', marginLeft: 12, alignSelf: 'flex-start' }}
        onClick={onDelete}
      >
        ✕
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { state, update, toast, notifyPermission, requestNotifyPermission } = useApp();
  const [tab, setTab] = useState<Tab>('profile');

  // ── Profile local state ───────────────────────────────────────────────────
  const [name, setName] = useState(state.userName);
  const [initials, setInitials] = useState(state.userInitials);
  const [profession, setProfession] = useState(state.profession);
  const [location, setLocation] = useState(state.location);
  const [startDate, setStartDate] = useState(state.startDate);
  const [targetDuration, setTargetDuration] = useState(state.targetDuration.toString());

  useEffect(() => {
    setName(state.userName);
    setInitials(state.userInitials);
    setProfession(state.profession);
    setLocation(state.location);
    setStartDate(state.startDate);
    setTargetDuration(state.targetDuration.toString());
  }, [state.userName, state.userInitials, state.profession, state.location, state.startDate, state.targetDuration]);

  const saveProfile = () => {
    const dur = Math.max(7, Math.min(3650, parseInt(targetDuration, 10) || 90));
    const auto = initials || autoInitials(name);
    update({ userName: name.trim(), userInitials: auto, profession, location, startDate, targetDuration: dur });
    toast('Profile saved ✓');
  };

  // ── Goals ────────────────────────────────────────────────────────────────
  const [showTemplates, setShowTemplates] = useState(false);
  const [filterCat, setFilterCat] = useState<GoalCategory | 'all'>('all');
  const [customGoal, setCustomGoal] = useState({ name: '', category: 'custom' as GoalCategory, target: '', unit: '' });

  const addGoalFromTemplate = (t: typeof GOAL_TEMPLATES[0]) => {
    const already = state.goals.some(g => g.name === t.name);
    if (already) { toast('Goal already added'); return; }
    const goal: Goal = { id: generateId(), name: t.name, category: t.category, target: t.target, current: 0, unit: t.unit, isCustom: false };
    update({ goals: [...state.goals, goal] });
    toast('Goal added ✓');
  };

  const addCustomGoal = () => {
    if (!customGoal.name.trim()) { toast('Enter a goal name'); return; }
    const target = parseFloat(customGoal.target) || 1;
    const goal: Goal = { id: generateId(), name: customGoal.name.trim(), category: customGoal.category, target, current: 0, unit: customGoal.unit.trim() || 'units', isCustom: true };
    update({ goals: [...state.goals, goal] });
    setCustomGoal({ name: '', category: 'custom', target: '', unit: '' });
    toast('Custom goal added ✓');
  };

  const updateGoal = (updated: Goal) => {
    update({ goals: state.goals.map(g => g.id === updated.id ? updated : g) });
  };

  const deleteGoal = (id: string) => {
    update({ goals: state.goals.filter(g => g.id !== id) });
    toast('Goal removed');
  };

  // ── Pillars ───────────────────────────────────────────────────────────────
  const updatePillar = (updated: CustomPillar) => {
    const newPillars = state.customPillars.map(p => p.id === updated.id ? updated : p);
    update({ customPillars: newPillars });
  };

  const deletePillar = (id: string) => {
    const newPillars = state.customPillars.filter(p => p.id !== id);
    const newPillarChecks = { ...state.pillars };
    delete newPillarChecks[id];
    update({ customPillars: newPillars, pillars: newPillarChecks });
    toast('Pillar removed');
  };

  const addPillar = () => {
    const id = generateId();
    const newPillar: CustomPillar = { id, icon: '⭐', name: 'New Pillar', desc: 'Description', time: 'Set time', category: 'personal', color: '#7B6FFF22' };
    update({ customPillars: [...state.customPillars, newPillar], pillars: { ...state.pillars, [id]: false } });
    toast('Pillar added — edit below');
  };

  const resetPillars = () => {
    if (!confirm('Reset pillars to the defaults?')) return;
    const defaultChecks: Record<string, boolean> = {};
    DEFAULT_PILLARS.forEach(p => { defaultChecks[p.id] = false; });
    update({ customPillars: DEFAULT_PILLARS, pillars: defaultChecks });
    toast('Pillars reset to defaults ✓');
  };

  // ── Notifications ─────────────────────────────────────────────────────────
  const n = state.notifications;
  const setNotif = (patch: Partial<typeof n>) => update({ notifications: { ...n, ...patch } });

  // ── System ────────────────────────────────────────────────────────────────
  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Data exported ✓');
  };

  const resetSystem = () => {
    if (!confirm('Reset all data? This cannot be undone.')) return;
    clearState();
    window.location.reload();
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'profile',       label: 'Profile',        icon: '👤' },
    { key: 'goals',         label: 'Goals',          icon: '🎯' },
    { key: 'pillars',       label: 'Pillars',        icon: '🧱' },
    { key: 'notifications', label: 'Notifications',  icon: '🔔' },
    { key: 'system',        label: 'System',         icon: '⚙️' },
  ];

  const filteredTemplates = filterCat === 'all'
    ? GOAL_TEMPLATES
    : GOAL_TEMPLATES.filter(t => t.category === filterCat);

  const categories = Array.from(new Set(GOAL_TEMPLATES.map(t => t.category))) as GoalCategory[];

  return (
    <div className="settings-layout">
      {/* ── Tab navigation ─────────────────────────────────────────────── */}
      <div className="settings-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`settings-tab-btn${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab content ────────────────────────────────────────────────── */}
      <div className="settings-content">

        {/* ─ Profile ────────────────────────────────────────────────────── */}
        {tab === 'profile' && (
          <div className="g2">
            <div>
              <div className="card mb-16">
                <div className="sec-title mb-16">Your Profile</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'linear-gradient(135deg,var(--accent),var(--teal))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 700, color: '#fff',
                  }}>
                    {(initials || autoInitials(name) || '?')}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{name || 'No name set'}</div>
                    <div className="text-xs col-muted">{profession || 'No profession set'}</div>
                  </div>
                </div>
                <hr className="divider" />
                <div className="input-label">Display name</div>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ marginBottom: 12 }} />
                <div className="input-label">Initials (auto-computed if blank)</div>
                <input value={initials} onChange={e => setInitials(e.target.value.toUpperCase().slice(0, 3))} placeholder={autoInitials(name) || 'e.g. JD'} style={{ marginBottom: 12 }} />
                <div className="input-label">Profession / Lifestyle</div>
                <input value={profession} onChange={e => setProfession(e.target.value)} placeholder="e.g. Software Engineer, Student, Entrepreneur..." style={{ marginBottom: 12 }} />
                <div className="input-label">Location (optional)</div>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" style={{ marginBottom: 16 }} />
                <button className="btn btn-primary btn-sm" onClick={saveProfile}>Save profile</button>
              </div>
            </div>

            <div>
              <div className="card">
                <div className="sec-title mb-16">Journey Settings</div>
                <div className="input-label">Start date</div>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ marginBottom: 12 }} />
                <div className="input-label">Target duration (days)</div>
                <input
                  type="number"
                  min={7} max={3650}
                  value={targetDuration}
                  onChange={e => setTargetDuration(e.target.value)}
                  style={{ marginBottom: 4 }}
                />
                <div className="text-xs col-muted mb-16">
                  {parseInt(targetDuration, 10) >= 7
                    ? `≈ ${Math.round(parseInt(targetDuration, 10) / 7)} weeks · ${Math.round(parseInt(targetDuration, 10) / 30)} months`
                    : 'Minimum 7 days'}
                </div>
                <div className="flex gap-8 mb-16">
                  {[30, 60, 90, 180, 365].map(d => (
                    <button
                      key={d}
                      type="button"
                      className={`btn btn-sm ${targetDuration === d.toString() ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setTargetDuration(d.toString())}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary btn-sm" onClick={saveProfile}>Save settings</button>
              </div>
            </div>
          </div>
        )}

        {/* ─ Goals ──────────────────────────────────────────────────────── */}
        {tab === 'goals' && (
          <div className="g2">
            <div>
              <div className="card mb-16">
                <div className="sec-header">
                  <div>
                    <div className="sec-title">Active Goals</div>
                    <div className="sec-sub">{state.goals.length} goal{state.goals.length !== 1 ? 's' : ''} tracking</div>
                  </div>
                </div>
                {state.goals.length === 0 ? (
                  <div className="text-sm col-muted" style={{ padding: '12px 0' }}>
                    No goals yet. Add from templates or create a custom goal.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {state.goals.map(g => (
                      <GoalRow key={g.id} goal={g} onUpdate={updateGoal} onDelete={() => deleteGoal(g.id)} />
                    ))}
                  </div>
                )}
              </div>

              {/* Custom goal form */}
              <div className="card">
                <div className="sec-title mb-12">Create Custom Goal</div>
                <div className="input-label">Goal name</div>
                <input
                  value={customGoal.name}
                  onChange={e => setCustomGoal(g => ({ ...g, name: e.target.value }))}
                  placeholder="e.g. Read every day"
                  style={{ marginBottom: 10 }}
                />
                <div className="input-label">Category</div>
                <select
                  value={customGoal.category}
                  onChange={e => setCustomGoal(g => ({ ...g, category: e.target.value as GoalCategory }))}
                  style={{ marginBottom: 10 }}
                >
                  {Object.entries(GOAL_CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <div className="flex gap-8">
                  <div style={{ flex: 1 }}>
                    <div className="input-label">Target</div>
                    <input
                      type="number"
                      min={1}
                      value={customGoal.target}
                      onChange={e => setCustomGoal(g => ({ ...g, target: e.target.value }))}
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div style={{ flex: 2 }}>
                    <div className="input-label">Unit</div>
                    <input
                      value={customGoal.unit}
                      onChange={e => setCustomGoal(g => ({ ...g, unit: e.target.value }))}
                      placeholder="e.g. pages/day, sessions"
                    />
                  </div>
                </div>
                <button className="btn btn-primary btn-sm mt-12" onClick={addCustomGoal}>
                  + Add Custom Goal
                </button>
              </div>
            </div>

            {/* Template picker */}
            <div>
              <div className="card">
                <div className="sec-header mb-12">
                  <div>
                    <div className="sec-title">Goal Templates</div>
                    <div className="sec-sub">Pick from {GOAL_TEMPLATES.length} presets</div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowTemplates(s => !s)}
                  >
                    {showTemplates ? 'Hide' : 'Browse'}
                  </button>
                </div>

                {showTemplates && (
                  <>
                    {/* Category filter */}
                    <div className="flex gap-6 mb-12" style={{ flexWrap: 'wrap' }}>
                      <button
                        className={`btn btn-sm ${filterCat === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilterCat('all')}
                      >All</button>
                      {categories.map(c => {
                        const col = GOAL_CATEGORY_COLORS[c];
                        return (
                          <button
                            key={c}
                            className={`btn btn-sm ${filterCat === c ? 'btn-primary' : 'btn-ghost'}`}
                            style={filterCat === c ? {} : { color: col.color }}
                            onClick={() => setFilterCat(c)}
                          >
                            {GOAL_CATEGORY_LABELS[c]}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {filteredTemplates.map((t, i) => {
                        const col = GOAL_CATEGORY_COLORS[t.category];
                        const alreadyAdded = state.goals.some(g => g.name === t.name);
                        return (
                          <div key={i} className="template-row">
                            <div style={{ flex: 1 }}>
                              <span className="badge" style={{ background: col.bg, color: col.color, marginRight: 8 }}>
                                {GOAL_CATEGORY_LABELS[t.category]}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</span>
                              <span className="text-xs col-muted" style={{ marginLeft: 8 }}>
                                {t.target} {t.unit}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              disabled={alreadyAdded}
                              style={{ color: alreadyAdded ? 'var(--text3)' : 'var(--accent2)' }}
                              onClick={() => addGoalFromTemplate(t)}
                            >
                              {alreadyAdded ? '✓ Added' : '+ Add'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─ Pillars ────────────────────────────────────────────────────── */}
        {tab === 'pillars' && (
          <div className="g2">
            <div>
              <div className="card mb-16">
                <div className="sec-header mb-12">
                  <div>
                    <div className="sec-title">Your Pillars</div>
                    <div className="sec-sub">{state.customPillars.length} daily habit{state.customPillars.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="flex gap-8">
                    <button className="btn btn-ghost btn-sm" onClick={resetPillars}>Reset</button>
                    <button className="btn btn-primary btn-sm" onClick={addPillar}>+ Add</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {state.customPillars.map(p => (
                    <PillarRow
                      key={p.id}
                      pillar={p}
                      onUpdate={updatePillar}
                      onDelete={() => deletePillar(p.id)}
                      canDelete={state.customPillars.length > 1}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="card">
                <div className="sec-title mb-12">About Pillars</div>
                <div className="text-sm col-muted" style={{ lineHeight: 1.7 }}>
                  <p style={{ marginBottom: 10 }}>
                    <strong style={{ color: 'var(--text)' }}>Pillars</strong> are your core daily habits or focus areas. Each one represents a non-negotiable block of your day.
                  </p>
                  <p style={{ marginBottom: 10 }}>
                    Check them off each day to maintain your streak and track your consistency on the activity map.
                  </p>
                  <p>
                    You can customize the name, icon, description, scheduled time, and color accent of each pillar to fit any lifestyle or profession.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─ Notifications ──────────────────────────────────────────────── */}
        {tab === 'notifications' && (
          <div className="g2">
            <div>
              <div className="card mb-16">
                <div className="sec-title mb-4">Browser Notifications</div>
                <div className="text-sm col-muted mb-16" style={{ lineHeight: 1.6 }}>
                  Enable browser notifications to receive smart reminders, overwork alerts, and streak warnings.
                </div>

                {notifyPermission === 'unsupported' && (
                  <div className="notice notice-warn mb-12">
                    Your browser does not support notifications.
                  </div>
                )}
                {notifyPermission === 'denied' && (
                  <div className="notice notice-warn mb-12">
                    Notifications are blocked in your browser. Allow them in browser settings to enable this feature.
                  </div>
                )}
                {notifyPermission === 'default' && (
                  <button className="btn btn-primary btn-sm mb-16" onClick={requestNotifyPermission}>
                    🔔 Enable Browser Notifications
                  </button>
                )}
                {notifyPermission === 'granted' && (
                  <div className="notice notice-ok mb-12">✓ Browser notifications are enabled</div>
                )}

                <div className="setting-row">
                  <div>
                    <div className="setting-label">All notifications</div>
                    <div className="setting-desc">Master switch for all alerts</div>
                  </div>
                  <div
                    className={`toggle${n.enabled ? ' on' : ''}`}
                    onClick={() => setNotif({ enabled: !n.enabled })}
                  />
                </div>
              </div>

              <div className="card">
                <div className="sec-title mb-12">Smart Reminders</div>

                <div className="setting-row">
                  <div>
                    <div className="setting-label">Morning reminder</div>
                    <div className="setting-desc">Start-of-day prompt at your chosen time</div>
                  </div>
                  <div className="flex items-center gap-8">
                    <input
                      type="time"
                      value={n.morningTime}
                      onChange={e => setNotif({ morningTime: e.target.value })}
                      style={{ width: 90, fontSize: 12 }}
                      disabled={!n.enabled || !n.morningReminder}
                    />
                    <div
                      className={`toggle${n.morningReminder ? ' on' : ''}`}
                      onClick={() => setNotif({ morningReminder: !n.morningReminder })}
                    />
                  </div>
                </div>

                <div className="setting-row">
                  <div>
                    <div className="setting-label">Missed task alert</div>
                    <div className="setting-desc">Notifies if tasks are incomplete at set time</div>
                  </div>
                  <div className="flex items-center gap-8">
                    <input
                      type="time"
                      value={n.missedTaskTime}
                      onChange={e => setNotif({ missedTaskTime: e.target.value })}
                      style={{ width: 90, fontSize: 12 }}
                      disabled={!n.enabled || !n.missedTaskAlerts}
                    />
                    <div
                      className={`toggle${n.missedTaskAlerts ? ' on' : ''}`}
                      onClick={() => setNotif({ missedTaskAlerts: !n.missedTaskAlerts })}
                    />
                  </div>
                </div>

                <div className="setting-row">
                  <div>
                    <div className="setting-label">Streak protection</div>
                    <div className="setting-desc">Alerts at 11pm if pillars are incomplete</div>
                  </div>
                  <div
                    className={`toggle${n.streakAlerts ? ' on' : ''}`}
                    onClick={() => setNotif({ streakAlerts: !n.streakAlerts })}
                  />
                </div>

                <div className="setting-row">
                  <div>
                    <div className="setting-label">Weekly review prompt</div>
                    <div className="setting-desc">Sunday 8pm reminder to review your week</div>
                  </div>
                  <div
                    className={`toggle${n.weeklyReview ? ' on' : ''}`}
                    onClick={() => setNotif({ weeklyReview: !n.weeklyReview })}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="card mb-16">
                <div className="sec-title mb-12">Overwork Detection</div>
                <div className="text-sm col-muted mb-12" style={{ lineHeight: 1.6 }}>
                  Detects when your focus sessions exceed a daily threshold and recommends a break.
                </div>
                <div className="setting-row">
                  <div>
                    <div className="setting-label">Overwork alerts</div>
                    <div className="setting-desc">Monitor daily session total</div>
                  </div>
                  <div
                    className={`toggle${n.overworkAlerts ? ' on' : ''}`}
                    onClick={() => setNotif({ overworkAlerts: !n.overworkAlerts })}
                  />
                </div>
                <div className="input-label mt-12">Daily work limit (hours)</div>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={n.overworkThresholdHours}
                  onChange={e => setNotif({ overworkThresholdHours: Math.max(1, Math.min(16, parseInt(e.target.value, 10) || 8)) })}
                  style={{ marginBottom: 4 }}
                  disabled={!n.overworkAlerts}
                />
                <div className="text-xs col-muted">
                  Alert fires once when cumulative focus time reaches {n.overworkThresholdHours}h in a day.
                </div>
              </div>

              <div className="card">
                <div className="sec-title mb-12">Behavior Tips</div>
                <div className="text-sm col-muted" style={{ lineHeight: 1.8 }}>
                  <strong style={{ color: 'var(--text)' }}>How smart reminders work:</strong>
                  <ul style={{ paddingLeft: 16, marginTop: 8 }}>
                    <li>Notifications only fire while this app is open in the browser</li>
                    <li>Each alert fires at most once per day to avoid fatigue</li>
                    <li>Overwork detection is based on Focus Mode session logs</li>
                    <li>All timing is based on your local device clock</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─ System ─────────────────────────────────────────────────────── */}
        {tab === 'system' && (
          <div className="g2">
            <div>
              <div className="card mb-16">
                <div className="sec-title mb-12">About This System</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--bg3)', borderRadius: 'var(--r-sm)', marginBottom: 16 }}>
                  <div className="logo-icon" style={{ width: 44, height: 44, fontSize: 16 }}>OS</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>Personal OS</div>
                    <div className="text-xs col-muted">v2.0 · Universal Productivity System</div>
                  </div>
                  <span className="badge f-right" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>v2.0</span>
                </div>
                <div className="text-sm col-muted" style={{ lineHeight: 1.7 }}>
                  A universal personal operating system. Set your duration, define your habits, track your goals — and become your best self, on your own terms.
                </div>
                <hr className="divider" />
                <div className="text-xs col-muted" style={{ lineHeight: 1.8 }}>
                  Runs fully offline in your browser using localStorage<br />
                  Day {state.day} of {state.targetDuration} · Streak: {state.streak} days<br />
                  {state.goals.length} goals · {state.customPillars.length} pillars · {state.sessions.length} sessions logged
                </div>
              </div>
            </div>

            <div>
              <div className="card">
                <div className="sec-title mb-12">Data Management</div>
                <div className="setting-row">
                  <div>
                    <div className="setting-label">Export data</div>
                    <div className="setting-desc">Download all progress as JSON</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={exportData}>Export</button>
                </div>
                <div className="setting-row">
                  <div>
                    <div className="setting-label">Reset system</div>
                    <div className="setting-desc">Erase all data and start fresh</div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--coral)' }}
                    onClick={resetSystem}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
