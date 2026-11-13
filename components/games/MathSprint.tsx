'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/lib/context';

function genProblem() {
  const ops = ['+', '-', '×'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = 0, b = 0;
  if (op === '×') {
    a = Math.floor(Math.random() * 12) + 1;
    b = Math.floor(Math.random() * 12) + 1;
  } else {
    a = Math.floor(Math.random() * 50) + 1;
    b = Math.floor(Math.random() * 50) + 1;
    if (op === '-' && b > a) [a, b] = [b, a];
  }
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { text: `${a} ${op} ${b}`, answer };
}

export default function MathSprint() {
  const { state, update, celebrate, playSound } = useApp();
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [problem, setProblem] = useState(genProblem);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const gs = state.gameScores;

  const finish = useCallback(() => {
    setActive(false);
    const isBest = score > gs.mathBestScore;
    const bestStreak = Math.max(gs.mathBestStreak, streak);
    update({ gameScores: { ...gs, mathBestScore: isBest ? score : gs.mathBestScore, mathBestStreak: bestStreak } });
    if (isBest && score > 0) celebrate(`New best score: ${score}! 🎉`);
    else playSound('complete');
  }, [score, streak, gs, update, celebrate, playSound]);

  // Keep a ref to the latest `finish` so the countdown effect below doesn't
  // need it as a dependency — otherwise every answer (which changes score)
  // would recreate `finish` and reset the in-flight 1s tick.
  const finishRef = useRef(finish);
  useEffect(() => { finishRef.current = finish; }, [finish]);

  useEffect(() => {
    if (!active) return;
    if (timeLeft <= 0) { finishRef.current(); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [active, timeLeft]);

  const start = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setInput('');
    setProblem(genProblem());
    setActive(true);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    const val = parseInt(input, 10);
    if (val === problem.answer) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      playSound('tick');
    } else {
      setStreak(0);
      playSound('error');
    }
    setProblem(genProblem());
    setInput('');
  };

  return (
    <div className="text-center">
      {!active ? (
        <div>
          <div className="col-muted mb-16" style={{ fontSize: 15 }}>60-second arithmetic sprint</div>
          <div className="flex justify-center gap-24 mb-16 text-sm col-muted">
            <span>Best score: <strong className="col-accent">{gs.mathBestScore}</strong></span>
            <span>Best streak: <strong className="col-amber">{gs.mathBestStreak}</strong></span>
          </div>
          <button className="btn btn-primary" onClick={start}>▶ Start Sprint</button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between mb-8 text-sm col-muted">
            <span>⏱ {timeLeft}s</span>
            <span>Score: <strong className="col-accent">{score}</strong></span>
            <span>Streak: <strong className="col-amber">{streak}</strong></span>
          </div>
          <div className="prog-track mb-16"><div className="prog-fill" style={{ width: (timeLeft / 60) * 100 + '%' }} /></div>
          <div className="math-prompt">{problem.text} = ?</div>
          <form onSubmit={submit}>
            <input
              ref={inputRef}
              className="math-input"
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
            />
          </form>
        </div>
      )}
    </div>
  );
}
