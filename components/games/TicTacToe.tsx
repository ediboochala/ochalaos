'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';

type Cell = 'X' | 'O' | null;

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winner(board: Cell[]): { player: Cell; line: number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }
  return null;
}

function pickComputerMove(board: Cell[]): number {
  const empty = board.map((v, i) => (v === null ? i : -1)).filter(i => i >= 0);
  // Win if possible
  for (const i of empty) {
    const copy = [...board]; copy[i] = 'O';
    if (winner(copy)?.player === 'O') return i;
  }
  // Block player's win
  for (const i of empty) {
    const copy = [...board]; copy[i] = 'X';
    if (winner(copy)?.player === 'X') return i;
  }
  if (board[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter(i => board[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return empty[Math.floor(Math.random() * empty.length)];
}

export default function TicTacToe() {
  const { state, update, toast, playSound, celebrate } = useApp();
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [locked, setLocked] = useState(false);

  const result = winner(board);
  const isDraw = !result && board.every(c => c !== null);
  const gs = state.gameScores;

  const recordResult = (outcome: 'win' | 'loss' | 'draw') => {
    const patch =
      outcome === 'win' ? { ticTacToeWins: gs.ticTacToeWins + 1 } :
      outcome === 'loss' ? { ticTacToeLosses: gs.ticTacToeLosses + 1 } :
      { ticTacToeDraws: gs.ticTacToeDraws + 1 };
    update({ gameScores: { ...gs, ...patch } });
    if (outcome === 'win') celebrate('You win! 🎉');
    else if (outcome === 'loss') { toast('Computer wins this round'); playSound('error'); }
    else { toast("It's a draw"); playSound('click'); }
  };

  const play = (i: number) => {
    if (board[i] || result || isDraw || locked || turn !== 'X') return;
    const next = [...board]; next[i] = 'X';
    setBoard(next);
    const w = winner(next);
    if (w) { recordResult('win'); return; }
    if (next.every(c => c !== null)) { recordResult('draw'); return; }

    setTurn('O');
    setLocked(true);
    setTimeout(() => {
      const ci = pickComputerMove(next);
      const next2 = [...next]; next2[ci] = 'O';
      setBoard(next2);
      const w2 = winner(next2);
      if (w2) recordResult('loss');
      else if (next2.every(c => c !== null)) recordResult('draw');
      setTurn('X');
      setLocked(false);
    }, 450);
  };

  const reset = () => { setBoard(Array(9).fill(null)); setTurn('X'); setLocked(false); };

  const status = result
    ? (result.player === 'X' ? 'You won! 🎉' : 'Computer won')
    : isDraw ? "It's a draw" : (turn === 'X' ? 'Your turn (X)' : "Computer's turn...");

  return (
    <div>
      <div className="text-center mb-16" style={{ fontWeight: 600 }}>{status}</div>
      <div className="ttt-grid">
        {board.map((cell, i) => (
          <div
            key={i}
            className={`ttt-cell${cell === 'X' ? ' x' : cell === 'O' ? ' o' : ''}${result?.line.includes(i) ? ' win' : ''}${cell ? ' filled' : ''}`}
            onClick={() => play(i)}
          >
            {cell}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-16 mt-16 text-sm col-muted">
        <span>Wins: <strong className="col-green">{gs.ticTacToeWins}</strong></span>
        <span>Losses: <strong className="col-coral">{gs.ticTacToeLosses}</strong></span>
        <span>Draws: <strong>{gs.ticTacToeDraws}</strong></span>
      </div>
      {(result || isDraw) && (
        <div className="text-center mt-16">
          <button className="btn btn-primary btn-sm" onClick={reset}>Play again</button>
        </div>
      )}
    </div>
  );
}
