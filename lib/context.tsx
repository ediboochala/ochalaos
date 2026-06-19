'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, loadState, saveState, computeDay, todayKey } from './store';

interface Ctx {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  toast: (msg: string, duration?: number) => void;
  toastMsg: string;
  toastVisible: boolean;
  notifyPermission: NotificationPermission | 'unsupported';
  requestNotifyPermission: () => Promise<void>;
}

const AppCtx = createContext<Ctx | null>(null);

function sendBrowserNotif(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [notifyPermission, setNotifyPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');

  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  // Tracks which notifications have already fired today to avoid duplicates
  const sentRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifyPermission(Notification.permission);
    }
    // Recompute day on mount
    setState(prev => {
      const day = computeDay(prev.startDate, prev.targetDuration);
      if (day === prev.day) return prev;
      const next = { ...prev, day };
      saveState(next);
      return next;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Notification interval: fire once per minute ──────────────────────────
  useEffect(() => {
    const check = () => {
      if (!state.notifications.enabled) return;
      const now = new Date();
      const hhmm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const today = todayKey();

      if (state.notifications.morningReminder && hhmm === state.notifications.morningTime) {
        const key = `morning-${today}`;
        if (!sentRef.current[key]) {
          sentRef.current[key] = true;
          sendBrowserNotif('Good morning! 🌅', "Time to start your day. Check your tasks and begin your routine.");
        }
      }

      if (state.notifications.missedTaskAlerts && hhmm === state.notifications.missedTaskTime) {
        const key = `missed-${today}`;
        if (!sentRef.current[key]) {
          const incomplete = state.dailyTasks.filter(t => t.date === today && !t.done);
          if (incomplete.length > 0) {
            sentRef.current[key] = true;
            sendBrowserNotif(
              `${incomplete.length} task${incomplete.length > 1 ? 's' : ''} incomplete ⚠️`,
              "Don't let the day slip — finish your remaining tasks."
            );
          }
        }
      }

      if (state.notifications.streakAlerts && now.getHours() === 23 && now.getMinutes() === 0) {
        const key = `streak-${today}`;
        if (!sentRef.current[key]) {
          const allDone = state.customPillars.every(p => state.pillars[p.id]);
          if (!allDone) {
            sentRef.current[key] = true;
            sendBrowserNotif("Streak at risk 🔥", "You haven't completed all pillars today. Don't break the chain!");
          }
        }
      }

      if (state.notifications.weeklyReview) {
        const isSunday = now.getDay() === 0;
        const key = `review-${today}`;
        if (isSunday && hhmm === '20:00' && !sentRef.current[key]) {
          sentRef.current[key] = true;
          sendBrowserNotif('Weekly Review time 📊', "It's Sunday — reflect on your week and plan ahead.");
        }
      }
    };

    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [state.notifications, state.dailyTasks, state.pillars, state.customPillars]);

  // ── Core update function ──────────────────────────────────────────────────
  const update = useCallback((patch: Partial<AppState>) => {
    setState(prev => {
      const next = { ...prev, ...patch };

      // Overwork detection: fires when sessions update crosses the threshold
      if (patch.sessions && next.notifications.overworkAlerts) {
        const today = todayKey();
        const todayMins = next.sessions
          .filter(s => s.date === today)
          .reduce((sum, s) => sum + s.mins, 0);
        const threshold = next.notifications.overworkThresholdHours * 60;
        const key = `overwork-${today}`;

        if (todayMins >= threshold && !sentRef.current[key]) {
          sentRef.current[key] = true;
          const hrs = Math.round(todayMins / 60);
          sendBrowserNotif(
            `Overwork detected 😴`,
            `You've logged ${hrs}h of focused work today. Take a proper break!`
          );
          // Delayed toast so it shows after state settles
          setTimeout(() => {
            setToastMsg(`You've been working ${hrs}h — take a break!`);
            setToastVisible(true);
            toastTimer.current = setTimeout(() => setToastVisible(false), 4000);
          }, 50);
        }
      }

      saveState(next);
      return next;
    });
  }, []);

  const toast = useCallback((msg: string, duration = 2500) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), duration);
  }, []);

  const requestNotifyPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifyPermission(perm);
    if (perm === 'granted') {
      sendBrowserNotif('Notifications enabled ✓', 'You will now receive smart reminders from your system.');
    }
  }, []);

  return (
    <AppCtx.Provider value={{ state, update, toast, toastMsg, toastVisible, notifyPermission, requestNotifyPermission }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
