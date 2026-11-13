// lib/achievements.ts
import { AppState } from './store';

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  desc: string;
  check: (s: AppState) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-pillar',    icon: '👣', name: 'First Step',        desc: 'Complete your first pillar of the day',        check: s => Object.values(s.heatmap).some(v => v > 0) || Object.values(s.pillars).some(Boolean) },
  { id: 'perfect-day',     icon: '✨', name: 'Perfect Day',        desc: 'Complete every pillar in a single day',        check: s => s.customPillars.length > 0 && s.customPillars.every(p => s.pillars[p.id]) },
  { id: 'streak-3',        icon: '🔥', name: 'Warming Up',         desc: 'Reach a 3-day streak',                          check: s => s.streak >= 3 },
  { id: 'streak-7',        icon: '🔥', name: 'Week Warrior',       desc: 'Reach a 7-day streak',                          check: s => s.streak >= 7 },
  { id: 'streak-30',       icon: '🏅', name: 'Iron Will',          desc: 'Reach a 30-day streak',                         check: s => s.streak >= 30 },
  { id: 'streak-100',      icon: '💎', name: 'Unstoppable',        desc: 'Reach a 100-day streak',                        check: s => s.streak >= 100 },
  { id: 'sessions-1',      icon: '🎯', name: 'First Focus',        desc: 'Complete your first focus session',            check: s => s.sessions.length >= 1 },
  { id: 'sessions-10',     icon: '🧠', name: 'Deep Diver',         desc: 'Complete 10 focus sessions',                    check: s => s.sessions.length >= 10 },
  { id: 'sessions-50',     icon: '🚀', name: 'Focus Master',       desc: 'Complete 50 focus sessions',                    check: s => s.sessions.length >= 50 },
  { id: 'goal-add',        icon: '🧭', name: 'Goal Setter',        desc: 'Create your first goal',                        check: s => s.goals.length > 0 },
  { id: 'goal-complete',   icon: '🏆', name: 'Goal Crusher',       desc: 'Reach 100% on a goal',                          check: s => s.goals.some(g => g.target > 0 && g.current >= g.target) },
  { id: 'gratitude-5',     icon: '🙏', name: 'Grateful Heart',     desc: 'Log 5 gratitude entries',                       check: s => s.gratitudeLog.length >= 5 },
  { id: 'gratitude-30',    icon: '🌻', name: 'Gratitude Guru',     desc: 'Log 30 gratitude entries',                      check: s => s.gratitudeLog.length >= 30 },
  { id: 'halfway',         icon: '⚡', name: 'Halfway There',      desc: 'Reach the midpoint of your journey',           check: s => s.day >= Math.ceil(s.targetDuration / 2) },
  { id: 'journey-complete',icon: '👑', name: 'Journey Complete',   desc: 'Reach the final day of your journey',           check: s => s.day >= s.targetDuration },
  { id: 'review-1',        icon: '📊', name: 'Reflective',         desc: 'Complete your first weekly review',             check: s => s.reviews.length >= 1 },
  { id: 'stopwatch-1',     icon: '⏱️', name: 'Timekeeper',         desc: 'Log a session from the Stopwatch',             check: s => s.stopwatchSessions >= 1 },
  { id: 'arcade-1',        icon: '🕹️', name: 'Arcade Fan',         desc: 'Play a game in the Arcade',                     check: s => {
      const g = s.gameScores;
      return g.reactionBestMs != null || g.memoryBestMoves != null || g.mathBestScore > 0 ||
        (g.ticTacToeWins + g.ticTacToeLosses + g.ticTacToeDraws) > 0;
    } },
  { id: 'reaction-fast',   icon: '⚡', name: 'Lightning Reflexes', desc: 'React in under 250ms in the Reaction Test',    check: s => s.gameScores.reactionBestMs != null && s.gameScores.reactionBestMs < 250 },
  { id: 'tictactoe-win',   icon: '🎮', name: 'Strategist',         desc: 'Win a game of Tic-Tac-Toe',                     check: s => s.gameScores.ticTacToeWins >= 1 },
  { id: 'memory-win',      icon: '🧩', name: 'Sharp Mind',         desc: 'Complete a game of Memory Match',               check: s => s.gameScores.memoryBestMoves != null },
  { id: 'math-20',         icon: '🧮', name: 'Number Cruncher',    desc: 'Score 20+ in Math Sprint',                      check: s => s.gameScores.mathBestScore >= 20 },
];

/** Returns the ids of every achievement currently satisfied by the given state. */
export function computeUnlocked(s: AppState): string[] {
  return ACHIEVEMENTS.filter(a => a.check(s)).map(a => a.id);
}
