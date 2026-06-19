'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';

const QUESTIONS = [
  {
    num: '01',
    text: 'How well did I take care of myself this week?',
    fields: [
      { key: 'health',    label: 'Health & energy',     placeholder: 'Workouts, sleep, nutrition, stress levels...' },
      { key: 'recovery',  label: 'Rest & recovery',     placeholder: 'Did you truly switch off? Quality of downtime...' },
    ],
    multi: false,
  },
  {
    num: '02',
    text: 'What did I accomplish and produce this week?',
    fields: [
      { key: 'create',  label: 'Key outputs / work done', placeholder: 'List every meaningful thing you produced or completed...' },
    ],
    multi: true,
  },
  {
    num: '03',
    text: 'What did I learn — and can I apply it?',
    fields: [
      { key: 'learn', label: 'Skills, insights, knowledge gained', placeholder: 'Specific things you learned. Could you explain it to someone else?' },
    ],
    multi: true,
  },
  {
    num: '04',
    text: 'How did I progress on my goals?',
    fields: [
      { key: 'goals',   label: 'Goal progress this week',        placeholder: 'Which goals moved forward? Which stalled? Be specific...' },
      { key: 'outreach', label: 'Actions toward bigger targets', placeholder: 'Networking, outreach, applications, projects — real moves...' },
    ],
    multi: false,
  },
  {
    num: '05',
    text: 'Where did I fall short — and why exactly?',
    fields: [
      { key: 'short', label: 'Honest diagnosis', placeholder: 'No self-blame. Identify the root cause: energy, clarity, system, distraction...' },
    ],
    multi: true,
  },
  {
    num: '06',
    text: 'What does next week require from me specifically?',
    fields: [
      { key: 'next', label: 'Top 3 priorities', placeholder: 'Three clear, concrete priorities. Not a wish list — a commitment.' },
    ],
    multi: true,
  },
];

type FormState = Record<string, string>;

const emptyForm = (): FormState =>
  Object.fromEntries(QUESTIONS.flatMap(q => q.fields.map(f => [f.key, ''])));

export default function ReviewPage() {
  const { state, update, toast } = useApp();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saved, setSaved] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const wordCount = Object.values(form).join(' ').trim().split(/\s+/).filter(Boolean).length;
  const filled = QUESTIONS.filter(q => q.fields.some(f => form[f.key].trim())).length;

  const save = () => {
    const empty = QUESTIONS.every(q => q.fields.every(f => !form[f.key].trim()));
    if (empty) { toast('Fill in at least one answer'); return; }
    const review = {
      date:     new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      health:   form.health ?? '',
      recovery: form.recovery ?? '',
      create:   form.create ?? '',
      learn:    form.learn ?? '',
      goals:    form.goals ?? '',
      outreach: form.outreach ?? '',
      short:    form.short ?? '',
      next:     form.next ?? '',
    };
    update({ reviews: [...state.reviews, review] });
    setSaved(true);
    toast('Weekly review saved ✓');
    setTimeout(() => {
      setForm(emptyForm());
      setSaved(false);
    }, 1500);
  };

  return (
    <div>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="card-accent mb-20" style={{ padding: '22px 28px' }}>
        <div className="flex items-center gap-16">
          <div>
            <div className="font-sora" style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              Weekly Review
            </div>
            <div className="text-sm col-muted" style={{ lineHeight: 1.6 }}>
              Every Sunday · 20–30 minutes · Compound interest of self-awareness.
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: 'var(--accent2)' }}>
              {filled}/{QUESTIONS.length}
            </div>
            <div className="text-xs col-muted">sections filled</div>
          </div>
        </div>
        <div className="prog-track mt-12" style={{ height: 5 }}>
          <div className="prog-fill" style={{ width: `${Math.round((filled / QUESTIONS.length) * 100)}%` }} />
        </div>
      </div>

      <div className="g2 mb-16">
        {/* ── Questions left ───────────────────────────────────────── */}
        <div>
          <div className="card mb-16">
            {QUESTIONS.slice(0, 3).map((q, qi) => (
              <div key={q.num} className="review-q">
                <div className="review-q-num">Question {q.num}</div>
                <div className="review-q-text">{q.text}</div>
                {q.fields.map(f => (
                  <div key={f.key} style={{ marginBottom: 10 }}>
                    {q.fields.length > 1 && <div className="input-label">{f.label}</div>}
                    {q.multi || q.fields.length === 1 ? (
                      <textarea
                        value={form[f.key]}
                        onChange={set(f.key)}
                        placeholder={f.placeholder}
                        rows={3}
                      />
                    ) : (
                      <input type="text" value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder} />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Questions right ──────────────────────────────────────── */}
        <div>
          <div className="card mb-16">
            {QUESTIONS.slice(3).map((q) => (
              <div key={q.num} className="review-q">
                <div className="review-q-num">Question {q.num}</div>
                <div className="review-q-text">{q.text}</div>
                {q.fields.map(f => (
                  <div key={f.key} style={{ marginBottom: 10 }}>
                    {q.fields.length > 1 && <div className="input-label">{f.label}</div>}
                    {q.multi || q.fields.length === 1 ? (
                      <textarea
                        value={form[f.key]}
                        onChange={set(f.key)}
                        placeholder={f.placeholder}
                        rows={3}
                      />
                    ) : (
                      <input type="text" value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder} />
                    )}
                  </div>
                ))}
              </div>
            ))}

            <div className="flex items-center gap-12" style={{ marginTop: 8 }}>
              <button
                className={`btn btn-primary w-full`}
                style={{ justifyContent: 'center' }}
                onClick={save}
                disabled={saved}
              >
                {saved ? '✓ Saved!' : 'Save Weekly Review'}
              </button>
              <div className="text-xs col-muted" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                ~{wordCount} words
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Past reviews ─────────────────────────────────────────────── */}
      {state.reviews.length > 0 && (
        <div className="card">
          <div className="sec-header">
            <div>
              <div className="sec-title">Past Reviews</div>
              <div className="sec-sub">{state.reviews.length} review{state.reviews.length !== 1 ? 's' : ''} saved</div>
            </div>
          </div>
          <div>
            {state.reviews.slice().reverse().map((r, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 0',
                  borderBottom: i < state.reviews.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent)', flexShrink: 0, marginTop: 5,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{r.date}</div>
                  {(r.create || r.learn || r.goals) && (
                    <div className="text-xs col-muted" style={{ lineHeight: 1.55 }}>
                      {(r.create || r.goals || r.learn)
                        ? (r.create || r.goals || r.learn).slice(0, 90) + ((r.create || r.goals || r.learn).length > 90 ? '…' : '')
                        : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
