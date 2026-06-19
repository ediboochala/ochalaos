'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';

const SKILL_COLORS = [
  'var(--accent2)', 'var(--teal)', 'var(--blue)',
  'var(--coral)', 'var(--amber)', 'var(--green)', 'var(--pink)',
];

const UNIVERSAL_CHECKLIST = [
  'Can explain what I do in one clear sentence',
  'Have a concrete example of strong work I\'ve done',
  'Could teach this skill to a beginner',
  'Regularly practice and stay up to date',
  'Can identify exactly where my gaps are',
  'Have a plan to reach the next level',
  'Others have confirmed my competency in this',
];

const SKILL_SUGGESTIONS = [
  'Communication', 'Problem Solving', 'Leadership', 'Project Management',
  'Public Speaking', 'Writing', 'Data Analysis', 'Design Thinking',
  'Sales', 'Negotiation', 'Coding', 'Marketing', 'Finance',
  'Research', 'Coaching', 'Networking', 'Time Management', 'Strategy',
];

export default function SkillsPage() {
  const { state, update, toast } = useApp();
  const [checks, setChecks] = useState<boolean[]>(UNIVERSAL_CHECKLIST.map(() => false));
  const [newSkill, setNewSkill] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const skills = state.skills ?? {};
  const skillEntries = Object.entries(skills);

  const adjustSkill = (name: string, delta: number) => {
    const cur = skills[name] ?? 5;
    const next = Math.max(1, Math.min(10, cur + delta));
    update({ skills: { ...skills, [name]: next } });
    toast(`${name} → ${next}/10`);
  };

  const addSkill = (name?: string) => {
    const skillName = (name ?? newSkill).trim();
    if (!skillName) { toast('Enter a skill name'); return; }
    if (skills[skillName] !== undefined) { toast('Skill already exists'); return; }
    update({ skills: { ...skills, [skillName]: 5 } });
    setNewSkill('');
    setShowSuggestions(false);
    toast(`${skillName} added at level 5 ✓`);
  };

  const removeSkill = (name: string) => {
    if (!confirm(`Remove "${name}" from your skill matrix?`)) return;
    const next = { ...skills };
    delete next[name];
    update({ skills: next });
    toast(`${name} removed`);
  };

  const toggleCheck = (i: number) => {
    setChecks(c => { const n = [...c]; n[i] = !n[i]; return n; });
  };

  const avgLevel = skillEntries.length
    ? Math.round((skillEntries.reduce((s, [, v]) => s + v, 0) / skillEntries.length) * 10) / 10
    : 0;

  const getColor = (name: string) => SKILL_COLORS[Math.abs(name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % SKILL_COLORS.length];

  return (
    <div className="g2">
      <div>
        {/* ── Skill matrix ──────────────────────────────────────────── */}
        <div className="card mb-16">
          <div className="sec-header">
            <div>
              <div className="sec-title">Skill Matrix</div>
              <div className="sec-sub">
                {skillEntries.length > 0
                  ? `${skillEntries.length} skill${skillEntries.length !== 1 ? 's' : ''} · avg level ${avgLevel}`
                  : 'No skills yet — add your first below'}
              </div>
            </div>
          </div>

          {skillEntries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📐</div>
              <div className="empty-title">No skills tracked yet</div>
              <div className="empty-sub">Add skills you want to build, track, or improve.</div>
            </div>
          ) : (
            skillEntries.map(([name, score]) => {
              const color = getColor(name);
              return (
                <div key={name} className="skill-row">
                  <div className="skill-name">{name}</div>
                  <div className="skill-bar">
                    <div className="prog-track" style={{ margin: 0 }}>
                      <div
                        className="prog-fill"
                        style={{
                          width: (score / 10 * 100) + '%',
                          background: `linear-gradient(90deg, ${color}, var(--teal))`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="skill-score">{score}/10</div>
                  <div className="flex gap-4">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => adjustSkill(name, -1)}
                      disabled={score <= 1}
                    >−</button>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => adjustSkill(name, 1)}
                      disabled={score >= 10}
                    >+</button>
                    <button
                      className="btn btn-xs"
                      style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '4px 6px' }}
                      onClick={() => removeSkill(name)}
                      title="Remove skill"
                    >✕</button>
                  </div>
                </div>
              );
            })
          )}

          {/* Add skill form */}
          <div style={{ marginTop: skillEntries.length > 0 ? 16 : 0, borderTop: skillEntries.length > 0 ? '1px solid var(--border)' : 'none', paddingTop: skillEntries.length > 0 ? 14 : 0 }}>
            <div className="input-label">Add a skill</div>
            <div className="flex gap-8">
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={newSkill}
                  onChange={e => { setNewSkill(e.target.value); setShowSuggestions(e.target.value.length > 0); }}
                  onKeyDown={e => { if (e.key === 'Enter') addSkill(); if (e.key === 'Escape') setShowSuggestions(false); }}
                  placeholder="e.g. Leadership, Coding, Writing..."
                  onFocus={() => setShowSuggestions(false)}
                />
                {showSuggestions && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    background: 'var(--bg2)', border: '1px solid var(--border2)',
                    borderRadius: 'var(--r-sm)', zIndex: 20, maxHeight: 200, overflowY: 'auto',
                    boxShadow: 'var(--shadow-lg)',
                  }}>
                    {SKILL_SUGGESTIONS.filter(s => s.toLowerCase().includes(newSkill.toLowerCase())).map(s => (
                      <button
                        key={s}
                        className="btn btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, border: 'none', borderBottom: '1px solid var(--border)', fontSize: 13 }}
                        onClick={() => addSkill(s)}
                      >{s}</button>
                    ))}
                  </div>
                )}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => addSkill()}>Add</button>
            </div>
            {/* Quick-add suggestions */}
            <div className="flex gap-6 mt-10" style={{ flexWrap: 'wrap' }}>
              {SKILL_SUGGESTIONS.filter(s => skills[s] === undefined).slice(0, 6).map(s => (
                <button
                  key={s}
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => addSkill(s)}
                >+ {s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        {/* ── Skill audit ───────────────────────────────────────────── */}
        <div className="card mb-16">
          <div className="sec-title mb-4">Skill Audit Checklist</div>
          <div className="text-sm col-muted mb-12" style={{ lineHeight: 1.6 }}>
            Pick one skill and answer honestly. Real mastery passes all of these.
          </div>
          <div className="check-list">
            {UNIVERSAL_CHECKLIST.map((item, i) => (
              <div
                key={i}
                className={`check-item${checks[i] ? ' done' : ''}`}
                onClick={() => toggleCheck(i)}
              >
                <div className="check-box">{checks[i] ? '✓' : ''}</div>
                <div className="check-label text-sm">{item}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-8 mt-12 text-xs col-muted">
            <div className="prog-track" style={{ flex: 1 }}>
              <div
                className="prog-fill prog-fill-teal"
                style={{ width: `${Math.round((checks.filter(Boolean).length / checks.length) * 100)}%` }}
              />
            </div>
            {checks.filter(Boolean).length}/{checks.length} passed
          </div>
        </div>

        {/* ── Level guide ───────────────────────────────────────────── */}
        <div className="card">
          <div className="sec-title mb-12">Level Guide</div>
          {[
            { range: '1–3', label: 'Beginner',     desc: 'Basic awareness, limited practical experience.' },
            { range: '4–5', label: 'Developing',   desc: 'Can apply with guidance. Still learning the edge cases.' },
            { range: '6–7', label: 'Competent',    desc: 'Independent practitioner. Reliable output.' },
            { range: '8–9', label: 'Advanced',     desc: 'Deep expertise. Can teach and lead others.' },
            { range: '10',  label: 'Master',        desc: 'World-class. Others look to you as a reference.' },
          ].map(l => (
            <div key={l.range} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                background: 'var(--bg4)', color: 'var(--accent2)', flexShrink: 0, marginTop: 1,
              }}>{l.range}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{l.label}</div>
                <div className="text-xs col-muted">{l.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
