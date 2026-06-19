'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { todayKey, GratitudeEntry } from '@/lib/store';

// ── Curated morning quotes — gratitude, not hustle ────────────────────────────
const MORNING_QUOTES: [string, string][] = [
  ['Gratitude turns what we have into enough.', 'Melody Beattie'],
  ['When you arise in the morning, think of what a precious privilege it is to be alive — to breathe, to think, to enjoy, to love.', 'Marcus Aurelius'],
  ['This is a wonderful day. I\'ve never seen this one before.', 'Maya Angelou'],
  ['Joy is the simplest form of gratitude.', 'Karl Barth'],
  ['Enough is a feast.', 'Buddhist Proverb'],
  ['The world is full of magic things, patiently waiting for our senses to grow sharper.', 'W.B. Yeats'],
  ['Gratitude makes sense of our past, brings peace for today, and creates a vision for tomorrow.', 'Melody Beattie'],
  ['In ordinary life we hardly realize that we receive a great deal more than we give.', 'Dietrich Bonhoeffer'],
  ['Start where you are. Use what you have. Do what you can.', 'Arthur Ashe'],
  ['There is always something to be grateful for.', 'Rhonda Byrne'],
  ['Gratitude is the healthiest of all human emotions.', 'Zig Ziglar'],
  ['The roots of all goodness lie in the soil of appreciation for goodness.', 'Dalai Lama'],
  ['Acknowledging the good that you already have in your life is the foundation for all abundance.', 'Eckhart Tolle'],
  ['Feeling gratitude and not expressing it is like wrapping a present and not giving it.', 'William Arthur Ward'],
  ['The more grateful I am, the more beauty I see.', 'Mary Davis'],
];

// ── Curated evening quotes — reflection, peace, restoration ──────────────────
const EVENING_QUOTES: [string, string][] = [
  ['Let what is heavy today leave you light tonight.', 'Unknown'],
  ['Every day you wake up is a chance to get better. You showed up. That matters.', 'Unknown'],
  ['Rest is not idleness. It is the work that makes tomorrow possible.', 'John Lubbock'],
  ['Count your blessings, not your troubles.', 'Willie Nelson'],
  ['At the end of each day, be grateful you made it through.', 'Unknown'],
  ['Sleep in peace. You gave this day what you had, and that was enough.', 'Unknown'],
  ['Tonight, let go of what didn\'t happen. Hold on to what did.', 'Unknown'],
  ['You have done enough. You are enough. Rest now.', 'Unknown'],
  ['The day is done. What you built with it — even quietly — was real.', 'Unknown'],
  ['A grateful heart is a beginning of greatness. It expresses humility.', 'James E. Faust'],
  ['Gratitude at the end of the day is a lamp that turns the day\'s work into light.', 'Unknown'],
  ['Even on the hard days, there was something. Find it. Hold it. Rest.', 'Unknown'],
  ['Tonight\'s rest is tomorrow\'s strength. You\'ve earned it.', 'Unknown'],
  ['The secret of getting ahead is getting started. You started today. That\'s something.', 'Mark Twain'],
  ['Be thankful for what you have; you\'ll end up having more.', 'Oprah Winfrey'],
];

// ── Personal message builder ──────────────────────────────────────────────────
function buildMorningMessage(name: string, day: number, streak: number, duration: number): string {
  const firstName = name.trim().split(' ')[0] || 'friend';
  if (streak >= 30) {
    return `${firstName}, ${streak} consecutive days of showing up. Before the world asks anything of you this morning — pause here and feel what you already carry.`;
  }
  if (streak >= 14) {
    return `Two weeks strong, ${firstName}. Day ${day} of your ${duration}-day journey. Before you conquer anything today, let's begin with what's already good.`;
  }
  if (streak >= 7) {
    return `Seven days in a row, ${firstName}. That's not coincidence — that's character. Day ${day}. Let's begin with gratitude, not a to-do list.`;
  }
  if (day === 1) {
    return `This is your Day 1, ${firstName}. Every great journey starts with a single morning. Begin it here, with what you're grateful for.`;
  }
  if (day <= 7) {
    return `${firstName}, Day ${day}. These early days are building your foundation. Before the day demands everything from you, take one intentional moment right here.`;
  }
  return `${firstName}, it's Day ${day} of your ${duration}-day journey. Before anything else — before tasks, goals, or the noise of the world — begin with this.`;
}

function buildEveningMessage(
  name: string,
  day: number,
  pillarsCompleted: number,
  totalPillars: number
): string {
  const firstName = name.trim().split(' ')[0] || 'friend';
  const allDone = totalPillars > 0 && pillarsCompleted === totalPillars;
  const partialDone = pillarsCompleted > 0 && !allDone;

  if (allDone) {
    return `${firstName}, Day ${day} is sealed. Every pillar — every single one — done. That's not small. Close the day the way you opened it: with intention.`;
  }
  if (partialDone) {
    return `Day ${day} is behind you, ${firstName}. ${pillarsCompleted} of ${totalPillars} pillars done. However far you got, this moment is yours. End it well.`;
  }
  return `The day is closing, ${firstName}. Whatever today held — the wins, the stumbles, the quiet moments — it's enough to end with grace. Close Day ${day} here.`;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function GratitudeCard() {
  const { state, update, toast } = useApp();
  const [hour, setHour] = useState<number | null>(null);
  const [mode, setMode] = useState<'morning' | 'evening' | null>(null);
  const [morningText, setMorningText] = useState('');
  const [intentionText, setIntentionText] = useState('');
  const [eveningText, setEveningText] = useState('');
  const [winText, setWinText] = useState('');
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const today = todayKey();

  // Determine time mode client-side only (avoids hydration mismatch)
  useEffect(() => {
    const h = new Date().getHours();
    setHour(h);
    // Morning: midnight–noon | Evening: 5pm–midnight
    if (h < 12) setMode('morning');
    else if (h >= 17) setMode('evening');
    else setMode(null);
  }, []);

  // Load any saved entry for today
  const todayEntry: GratitudeEntry | undefined =
    (state.gratitudeLog ?? []).find(e => e.date === today);

  useEffect(() => {
    if (!todayEntry) return;
    setMorningText(todayEntry.morningGratitude ?? '');
    setIntentionText(todayEntry.morningIntention ?? '');
    setEveningText(todayEntry.eveningGratitude ?? '');
    setWinText(todayEntry.eveningWin ?? '');
  }, [todayEntry]);

  // Nothing to show mid-day or after dismissal
  if (mode === null || dismissed || hour === null) return null;

  const isMorning = mode === 'morning';
  const isEvening = mode === 'evening';

  // Check if this section is already fully saved
  const morningSaved = !!todayEntry?.morningGratitude;
  const eveningSaved = !!todayEntry?.eveningGratitude;
  const sectionSaved = isMorning ? morningSaved : eveningSaved;

  // Quote — rotate by day number for consistency
  const quotePool = isMorning ? MORNING_QUOTES : EVENING_QUOTES;
  const [quote, quoteAuthor] = quotePool[state.day % quotePool.length];

  // Personal messages
  const pillarsCompleted = state.customPillars.filter(p => state.pillars[p.id]).length;
  const personalMessage = isMorning
    ? buildMorningMessage(state.userName, state.day, state.streak, state.targetDuration)
    : buildEveningMessage(state.userName, state.day, pillarsCompleted, state.customPillars.length);

  const handleSave = () => {
    const existing: GratitudeEntry = todayEntry ?? {
      date: today,
      morningGratitude: '', morningIntention: '',
      eveningGratitude: '', eveningWin: '',
    };
    const updated: GratitudeEntry = isMorning
      ? { ...existing, morningGratitude: morningText.trim(), morningIntention: intentionText.trim() }
      : { ...existing, eveningGratitude: eveningText.trim(), eveningWin: winText.trim() };

    const filtered = (state.gratitudeLog ?? []).filter(e => e.date !== today);
    update({ gratitudeLog: [...filtered, updated] });
    setSaved(true);
    setEditing(false);
    toast(isMorning ? 'Morning gratitude saved ✓' : 'Evening gratitude saved ✓');
  };

  return (
    <div className={`gratitude-card gratitude-${mode}`}>
      {/* Dismiss */}
      <button
        className="gratitude-dismiss"
        onClick={() => setDismissed(true)}
        title="Dismiss"
      >✕</button>

      {/* Header */}
      <div className="gratitude-header">
        <span className="gratitude-icon">{isMorning ? '🌅' : '🌙'}</span>
        <div>
          <div className="gratitude-title">
            {isMorning ? 'Morning Gratitude' : 'Evening Gratitude'}
          </div>
          <div className="gratitude-subtitle">{personalMessage}</div>
        </div>
      </div>

      {/* The quote — centrepiece */}
      <div className="gratitude-quote-block">
        <div className="gratitude-quote-mark">"</div>
        <blockquote className="gratitude-quote">{quote}</blockquote>
        <div className="gratitude-quote-author">— {quoteAuthor}</div>
      </div>

      {/* Already saved state — show what they wrote */}
      {sectionSaved && !editing && !saved ? (
        <div className="gratitude-saved-view">
          <div className="gratitude-saved-label">
            {isMorning ? '✓ You set your morning intention' : '✓ You closed the day with gratitude'}
          </div>
          {isMorning && (
            <>
              {todayEntry?.morningGratitude && (
                <div className="gratitude-entry-row">
                  <span className="gratitude-entry-key">Grateful for</span>
                  <span className="gratitude-entry-val">"{todayEntry.morningGratitude}"</span>
                </div>
              )}
              {todayEntry?.morningIntention && (
                <div className="gratitude-entry-row">
                  <span className="gratitude-entry-key">Today's intention</span>
                  <span className="gratitude-entry-val">"{todayEntry.morningIntention}"</span>
                </div>
              )}
            </>
          )}
          {isEvening && (
            <>
              {todayEntry?.eveningWin && (
                <div className="gratitude-entry-row">
                  <span className="gratitude-entry-key">What went well</span>
                  <span className="gratitude-entry-val">"{todayEntry.eveningWin}"</span>
                </div>
              )}
              {todayEntry?.eveningGratitude && (
                <div className="gratitude-entry-row">
                  <span className="gratitude-entry-key">Grateful for</span>
                  <span className="gratitude-entry-val">"{todayEntry.eveningGratitude}"</span>
                </div>
              )}
            </>
          )}
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 12, fontSize: 12 }}
            onClick={() => setEditing(true)}
          >
            Edit response
          </button>
        </div>
      ) : saved ? (
        /* Post-save confirmation */
        <div className="gratitude-confirm">
          <div className="gratitude-confirm-icon">{isMorning ? '☀️' : '🌙'}</div>
          <div className="gratitude-confirm-text">
            {isMorning
              ? 'Beautiful. You\'ve set your intention. Now go make it real.'
              : 'The day is closed with grace. Rest well.'}
          </div>
        </div>
      ) : (
        /* Entry form */
        <div className="gratitude-form">
          {isMorning ? (
            <>
              <div className="gratitude-field">
                <label className="gratitude-label">Right now, I\'m grateful for…</label>
                <textarea
                  className="gratitude-textarea"
                  placeholder="Something specific — a person, a moment, a feeling, a simple fact…"
                  value={morningText}
                  onChange={e => setMorningText(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="gratitude-field">
                <label className="gratitude-label">My intention for today is…</label>
                <textarea
                  className="gratitude-textarea"
                  placeholder="One word, one sentence, or a feeling you want to carry through the day…"
                  value={intentionText}
                  onChange={e => setIntentionText(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          ) : (
            <>
              <div className="gratitude-field">
                <label className="gratitude-label">What went well today?</label>
                <textarea
                  className="gratitude-textarea"
                  placeholder="Something that happened — big or small. A conversation, a decision, a moment of clarity…"
                  value={winText}
                  onChange={e => setWinText(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="gratitude-field">
                <label className="gratitude-label">Tonight, I\'m grateful for…</label>
                <textarea
                  className="gratitude-textarea"
                  placeholder="Let it be honest. Let it be specific. Whatever rises when you get quiet…"
                  value={eveningText}
                  onChange={e => setEveningText(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-12" style={{ marginTop: 16 }}>
            <button
              className={`btn btn-sm gratitude-save-btn`}
              onClick={handleSave}
              disabled={isMorning ? !morningText.trim() : !eveningText.trim()}
            >
              {isMorning ? 'Set my intention' : 'Close the day'}
            </button>
            <span className="text-xs col-muted">
              {isMorning ? 'Takes 30 seconds. Worth it.' : 'End with intention.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
