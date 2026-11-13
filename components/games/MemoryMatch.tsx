'use client';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context';

const ICONS = ['🎯', '🚀', '⭐', '🔥', '💡', '🎨', '🎵', '🏆'];

interface Card { id: number; icon: string; matched: boolean; }

function shuffledDeck(): Card[] {
  const deck: Card[] = [...ICONS, ...ICONS].map((icon, i) => ({ id: i, icon, matched: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function MemoryMatch() {
  const { state, update, celebrate, playSound } = useApp();
  const [deck, setDeck] = useState<Card[]>(shuffledDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const lockRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, [running]);

  const newGame = () => {
    setDeck(shuffledDeck());
    setFlipped([]);
    setMoves(0);
    setSeconds(0);
    setRunning(false);
    setWon(false);
    lockRef.current = false;
  };

  const flip = (idx: number) => {
    if (lockRef.current) return;
    if (deck[idx].matched || flipped.includes(idx)) return;
    if (!running) setRunning(true);

    const next = [...flipped, idx];
    setFlipped(next);

    if (next.length === 2) {
      lockRef.current = true;
      setMoves(m => m + 1);
      const [a, b] = next;
      if (deck[a].icon === deck[b].icon) {
        setTimeout(() => {
          setDeck(d => d.map((c, i) => (i === a || i === b) ? { ...c, matched: true } : c));
          setFlipped([]);
          lockRef.current = false;
          playSound('click');
        }, 350);
      } else {
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 700);
      }
    }
  };

  useEffect(() => {
    if (deck.length > 0 && deck.every(c => c.matched) && !won) {
      setWon(true);
      setRunning(false);
      const gs = state.gameScores;
      const isBestMoves = gs.memoryBestMoves === null || moves < gs.memoryBestMoves;
      const isBestTime = gs.memoryBestSeconds === null || seconds < gs.memoryBestSeconds;
      update({
        gameScores: {
          ...gs,
          memoryBestMoves: isBestMoves ? moves : gs.memoryBestMoves,
          memoryBestSeconds: isBestTime ? seconds : gs.memoryBestSeconds,
        },
      });
      celebrate(`Solved in ${moves} moves, ${seconds}s!${isBestMoves ? ' 🏆 New best!' : ''}`);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [deck]);

  return (
    <div>
      <div className="flex justify-between items-center mb-16" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div className="flex gap-16 text-sm col-muted">
          <span>Moves: <strong className="col-accent">{moves}</strong></span>
          <span>Time: <strong className="col-accent">{seconds}s</strong></span>
          <span>Best: {state.gameScores.memoryBestMoves != null ? `${state.gameScores.memoryBestMoves} moves` : '—'}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={newGame}>↺ New Game</button>
      </div>
      <div className="memory-grid">
        {deck.map((card, i) => {
          const shown = card.matched || flipped.includes(i);
          return (
            <div
              key={card.id}
              className={`memory-card${shown ? ' flipped' : ''}${card.matched ? ' matched' : ''}`}
              onClick={() => flip(i)}
            >
              {shown ? card.icon : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}
