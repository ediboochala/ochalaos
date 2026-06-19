'use client';
import { useApp } from '@/lib/context';

export default function Toast() {
  const { toastMsg, toastVisible } = useApp();

  // Pick icon from message content
  const icon =
    toastMsg.includes('✓') || toastMsg.includes('saved') || toastMsg.includes('complete') ? '✓' :
    toastMsg.includes('🏆') ? '🏆' :
    toastMsg.includes('🔥') ? '🔥' :
    toastMsg.includes('⚠') || toastMsg.includes('break') ? '⚠️' :
    toastMsg.includes('removed') || toastMsg.includes('reset') ? '🗑' :
    'ℹ';

  return (
    <div className={`toast${toastVisible ? ' show' : ''}`} role="status" aria-live="polite">
      <div className="toast-icon">{icon}</div>
      <span style={{ flex: 1 }}>{toastMsg.replace(/[✓🏆🔥⚠️]/g, '').trim()}</span>
    </div>
  );
}
