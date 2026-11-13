'use client';
import { useApp } from '@/lib/context';
import { ACHIEVEMENTS } from '@/lib/achievements';

export default function AchievementsPage() {
  const { state } = useApp();
  const unlocked = state.unlockedAchievements;
  const pct = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  return (
    <div>
      <div className="card mb-16">
        <div className="sec-header">
          <div>
            <div className="sec-title">🎖️ Achievements</div>
            <div className="sec-sub">{unlocked.length} of {ACHIEVEMENTS.length} unlocked</div>
          </div>
          <span className="badge" style={{ background: 'var(--accent-glow2)', color: 'var(--accent2)' }}>{pct}%</span>
        </div>
        <div className="prog-track"><div className="prog-fill" style={{ width: pct + '%' }} /></div>
      </div>

      <div className="ach-grid">
        {ACHIEVEMENTS.map(a => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <div key={a.id} className={`ach-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
              <div className="ach-icon">{isUnlocked ? a.icon : '🔒'}</div>
              <div className="ach-name">{a.name}</div>
              <div className="ach-desc">{isUnlocked ? a.desc : '???'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
