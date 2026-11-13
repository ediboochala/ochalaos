'use client';
import { useApp } from '@/lib/context';
import { formatMs } from '@/lib/store';

export default function StopwatchPage() {
  const { stopwatch, stopwatchStart, stopwatchPause, stopwatchReset, stopwatchLap, stopwatchLogSession } = useApp();
  const { running, elapsedMs, laps } = stopwatch;

  const tenths = Math.floor((elapsedMs % 1000) / 100);
  const main = formatMs(elapsedMs);

  // Splits between consecutive laps, used to highlight the fastest/slowest
  const splits = laps.map((t, i) => t - (laps[i - 1] ?? 0));
  const fastestIdx = splits.length > 1 ? splits.indexOf(Math.min(...splits)) : -1;
  const slowestIdx = splits.length > 1 ? splits.indexOf(Math.max(...splits)) : -1;

  return (
    <div className="g2">
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="sec-title mb-16">Stopwatch</div>

        <div className={`sw-ring${running ? ' running' : ''}`}>
          <div className="sw-display">
            {main}<span className="sw-ms">.{tenths}</span>
          </div>
        </div>

        <div className="sw-controls mt-16">
          {!running ? (
            <button className="btn btn-primary" onClick={stopwatchStart}>
              ▶ {elapsedMs > 0 ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={stopwatchPause}>⏸ Pause</button>
          )}
          <button className="btn btn-ghost" onClick={stopwatchLap} disabled={!running}>🚩 Lap</button>
          <button
            className="btn btn-danger"
            onClick={stopwatchReset}
            disabled={elapsedMs === 0 && laps.length === 0}
          >
            ↺ Reset
          </button>
        </div>

        {elapsedMs > 0 && (
          <button
            className="btn btn-ghost btn-sm mt-16"
            onClick={() => stopwatchLogSession('Stopwatch session')}
          >
            💾 Log as focus session
          </button>
        )}

        <div className="text-xs col-muted mt-16">
          Keeps running even if you switch pages — a live timer shows in the top bar.
        </div>
      </div>

      <div className="card">
        <div className="sec-header">
          <div>
            <div className="sec-title">Laps</div>
            <div className="sec-sub">{laps.length} recorded</div>
          </div>
        </div>

        {laps.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 0' }}>
            <div className="empty-icon">🚩</div>
            <div className="empty-title">No laps yet</div>
            <div className="empty-sub">Start the stopwatch and tap Lap to record splits.</div>
          </div>
        ) : (
          <div className="sw-laps">
            {[...laps].reverse().map((t, ri) => {
              const i = laps.length - 1 - ri;
              const split = t - (laps[i - 1] ?? 0);
              const cls = i === fastestIdx ? 'fastest' : i === slowestIdx ? 'slowest' : '';
              return (
                <div key={i} className={`sw-lap-row ${cls}`}>
                  <div className="sw-lap-num">#{i + 1}</div>
                  <div className="sw-lap-time">{formatMs(t)}</div>
                  <div className="sw-lap-diff">+{formatMs(split)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
