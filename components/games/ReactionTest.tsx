'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '@/lib/context';

type Phase = 'idle' | 'waiting' | 'ready' | 'early' | 'result';

export default function ReactionTest() {
  const { state, update, playSound, celebrate } = useApp();
  const [phase, setPhase] = useState<Phase>('idle');
  const [resultMs, setResultMs] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyAtRef = useRef<number>(0);

  const best = state.gameScores.reactionBestMs;

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const start = useCallback(() => {
    setPhase('waiting');
    setResultMs(null);
    const delay = 1000 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      readyAtRef.current = Date.now();
      setPhase('ready');
    }, delay);
  }, []);

  const handleClick = () => {
    if (phase === 'idle' || phase === 'result' || phase === 'early') { start(); return; }
    if (phase === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhase('early');
      playSound('error');
      return;
    }
    if (phase === 'ready') {
      const ms = Date.now() - readyAtRef.current;
      setResultMs(ms);
      setPhase('result');
      const isBest = best === null || ms < best;
      update({ gameScores: { ...state.gameScores, reactionBestMs: isBest ? ms : best } });
      if (isBest) celebrate(`New best reaction time: ${ms}ms 🎉`);
      else playSound('success');
    }
  };

  const label =
    phase === 'idle'    ? 'Click to start' :
    phase === 'waiting' ? 'Wait for green...' :
    phase === 'ready'   ? 'CLICK NOW!' :
    phase === 'early'   ? 'Too soon! Click to retry' :
    `Click to try again`;

  const cls =
    phase === 'ready' ? 'reaction-go' :
    phase === 'early' ? 'reaction-ready' :
    'reaction-wait';

  return (
    <div>
      <div className={`reaction-box ${cls}`} onClick={handleClick}>
        {phase === 'result' && resultMs !== null && (
          <div className="reaction-result-num col-accent">{resultMs}<span style={{ fontSize: 16 }}> ms</span></div>
        )}
        <div style={{ fontSize: 15, fontWeight: 600 }}>{label}</div>
      </div>
      <div className="flex justify-between mt-16 text-sm col-muted">
        <span>Best: {best != null ? `${best} ms` : '—'}</span>
        <span>Average human: ~250 ms</span>
      </div>
    </div>
  );
}
