'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Lead } from '@/lib/store';

const STATUS_COLORS: Record<Lead['status'], { bg: string; color: string }> = {
  lead:      { bg: 'rgba(96,165,250,0.15)',  color: 'var(--blue)' },
  contacted: { bg: 'rgba(245,158,11,0.15)',  color: 'var(--amber)' },
  convo:     { bg: 'rgba(123,111,255,0.15)', color: 'var(--accent2)' },
  closed:    { bg: 'rgba(52,211,153,0.15)',  color: 'var(--green)' },
};

const AVATAR_COLORS = ['#7B6FFF','#2DD4BF','#F59E0B','#F87171','#34D399'];

export default function ClientsPage() {
  const { state, update, toast } = useApp();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<Lead['status']>('lead');

  const addLead = () => {
    if (!name.trim()) return;
    const lead: Lead = { name: name.trim(), status, date: new Date().toLocaleDateString() };
    update({ leads: [...state.leads, lead] });
    setName('');
    toast('Lead added ✓');
  };

  const removeLead = (i: number) => {
    const next = [...state.leads];
    next.splice(i, 1);
    update({ leads: next });
  };

  const updateLeadStatus = (i: number, newStatus: Lead['status']) => {
    const next = state.leads.map((l, idx) => idx === i ? { ...l, status: newStatus } : l);
    update({ leads: next });
    toast(`Status updated to ${newStatus}`);
  };

  const counts = {
    lead:      state.leads.filter(l => l.status === 'lead').length,
    contacted: state.leads.filter(l => l.status === 'contacted').length,
    convo:     state.leads.filter(l => l.status === 'convo').length,
    closed:    state.leads.filter(l => l.status === 'closed').length,
  };

  return (
    <div>
      {/* Pipeline overview */}
      <div className="g4 mb-24">
        {(['lead','contacted','convo','closed'] as Lead['status'][]).map(s => (
          <div key={s} className="stat-card">
            <div className="stat-label">{s === 'convo' ? 'In conversation' : s.charAt(0).toUpperCase() + s.slice(1)}</div>
            <div className="stat-value" style={{ color: STATUS_COLORS[s].color }}>{counts[s]}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        <div>
          {/* Add lead */}
          <div className="card mb-16">
            <div className="sec-title mb-12">Add Lead / Prospect</div>
            <div className="input-label">Name or Company</div>
            <input
              type="text"
              placeholder="e.g. Kemi Adebayo · Brand Consultant"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ marginBottom: 10 }}
              onKeyDown={e => e.key === 'Enter' && addLead()}
            />
            <div className="input-label">Status</div>
            <select value={status} onChange={e => setStatus(e.target.value as Lead['status'])} style={{ marginBottom: 12 }}>
              <option value="lead">Lead</option>
              <option value="contacted">Contacted</option>
              <option value="convo">In Conversation</option>
              <option value="closed">Closed</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={addLead}>Add to Pipeline</button>
          </div>

          {/* Outreach tracker */}
          <div className="card">
            <div className="sec-title mb-12">Daily Outreach Goal</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="text-sm">Messages sent today</span>
              <span style={{ fontWeight: 700, color: 'var(--accent2)', fontFamily: 'Sora, sans-serif', fontSize: 20 }}>{state.outreach}/5</span>
            </div>
            <div className="prog-track mb-12">
              <div className="prog-fill" style={{ width: Math.min((state.outreach / 5) * 100, 100) + '%' }} />
            </div>
            <div className="flex gap-8">
              <button className="btn btn-primary btn-sm" onClick={() => {
                if (state.outreach >= 5) { toast('Daily goal reached! 🎯'); return; }
                update({ outreach: state.outreach + 1 });
                toast(`Outreach logged (${state.outreach + 1}/5)`);
              }}>Log Outreach</button>
              <button className="btn btn-ghost btn-sm" onClick={() => update({ outreach: 0 })}>Reset</button>
            </div>
          </div>
        </div>

        {/* Lead list */}
        <div>
          <div className="card">
            <div className="sec-header">
              <div><div className="sec-title">Pipeline</div><div className="sec-sub">{state.leads.length} prospects tracked</div></div>
            </div>
            {state.leads.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>No leads yet. Add your first prospect above.</div>
            ) : (
              state.leads.map((l, i) => (
                <div key={i} className="outreach-item">
                  <div className="or-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {l.name.charAt(0)}
                  </div>
                  <div className="or-body">
                    <div className="or-name">{l.name}</div>
                    <div className="or-detail">Added {l.date}</div>
                  </div>
                  <select
                    value={l.status}
                    onChange={e => updateLeadStatus(i, e.target.value as Lead['status'])}
                    style={{
                      background: STATUS_COLORS[l.status].bg,
                      color: STATUS_COLORS[l.status].color,
                      border: 'none', borderRadius: 10, padding: '3px 8px',
                      fontSize: 10, fontWeight: 700, cursor: 'pointer',
                      width: 'auto', alignSelf: 'center',
                    }}
                  >
                    <option value="lead">Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="convo">In Conversation</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button onClick={() => removeLead(i)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, padding: 4 }}>×</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
