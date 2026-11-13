'use client';
import { useState } from 'react';
import ReactionTest from '@/components/games/ReactionTest';
import MemoryMatch from '@/components/games/MemoryMatch';
import TicTacToe from '@/components/games/TicTacToe';
import MathSprint from '@/components/games/MathSprint';

const GAMES = [
  { id: 'reaction', label: 'Reaction Test', icon: '⚡', desc: 'How fast are your reflexes?' },
  { id: 'memory',   label: 'Memory Match',  icon: '🧩', desc: 'Find all the matching pairs' },
  { id: 'ttt',      label: 'Tic-Tac-Toe',   icon: '🎮', desc: 'Beat the computer' },
  { id: 'math',     label: 'Math Sprint',   icon: '🧮', desc: '60 seconds, how many can you solve?' },
] as const;

type GameId = typeof GAMES[number]['id'];

export default function ArcadePage() {
  const [tab, setTab] = useState<GameId>('reaction');
  const active = GAMES.find(g => g.id === tab)!;

  return (
    <div>
      <div className="card mb-16">
        <div className="sec-title mb-4">🕹️ Arcade — Take a Breather</div>
        <div className="sec-sub" style={{ marginTop: -6 }}>
          Quick games to reset your brain between focus sessions. Your best scores are saved to your profile.
        </div>
      </div>

      <div className="arcade-tabs">
        {GAMES.map(g => (
          <button
            key={g.id}
            className={`arcade-tab${tab === g.id ? ' active' : ''}`}
            onClick={() => setTab(g.id)}
          >
            <span>{g.icon}</span> {g.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="sec-header">
          <div>
            <div className="sec-title">{active.icon} {active.label}</div>
            <div className="sec-sub">{active.desc}</div>
          </div>
        </div>
        {tab === 'reaction' && <ReactionTest />}
        {tab === 'memory'   && <MemoryMatch />}
        {tab === 'ttt'      && <TicTacToe />}
        {tab === 'math'     && <MathSprint />}
      </div>
    </div>
  );
}
