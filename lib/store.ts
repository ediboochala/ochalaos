// lib/store.ts

export type GoalCategory =
  | 'health' | 'fitness' | 'learning' | 'business'
  | 'creative' | 'personal' | 'career' | 'finance' | 'custom';

export interface CustomPillar {
  id: string;
  icon: string;
  name: string;
  desc: string;
  time: string;
  category: string;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  category: GoalCategory;
  target: number;
  current: number;
  unit: string;
  isCustom: boolean;
}

export interface DailyTask {
  id: string;
  label: string;
  category: string;
  tagBg: string;
  tagColor: string;
  done: boolean;
  date: string; // 'YYYY-MM-DD'
}

export interface GratitudeEntry {
  date: string;             // 'YYYY-MM-DD'
  morningGratitude: string; // what they're grateful for this morning
  morningIntention: string; // their intention for the day
  eveningGratitude: string; // what they're grateful for tonight
  eveningWin: string;       // what went well today
}

export interface NotificationSettings {
  enabled: boolean;
  morningReminder: boolean;
  morningTime: string;   // 'HH:MM'
  streakAlerts: boolean;
  weeklyReview: boolean;
  overworkAlerts: boolean;
  overworkThresholdHours: number;
  missedTaskAlerts: boolean;
  missedTaskTime: string; // 'HH:MM'
  sound: boolean;
}

export interface Lead {
  name: string;
  status: 'lead' | 'contacted' | 'convo' | 'closed';
  date: string;
}

export interface Session {
  task: string;
  mins: number;
  date: string;
}

export interface Review {
  date: string;
  health: string;
  recovery: string;
  create: string;
  learn: string;
  goals: string;
  outreach: string;
  short: string;
  next: string;
}

export interface AppState {
  // Identity
  userName: string;
  userInitials: string;
  profession: string;
  location: string;

  // System
  version: string;
  startDate: string;
  targetDuration: number; // days — user-defined, not limited to 90
  streak: number;
  day: number;

  // Pillars (user-defined habits)
  pillars: Record<string, boolean>;      // pillarId -> done today
  customPillars: CustomPillar[];

  // Goals
  goals: Goal[];

  // Legacy health tracking
  workouts: boolean[];
  water: number;
  sleep: number;

  // Skills
  skills: Record<string, number>;

  // Sessions & heatmap
  sessions: Session[];
  heatmap: Record<string, number>;

  // Daily tasks (persisted, date-keyed)
  dailyTasks: DailyTask[];

  // Gratitude journal (one entry per day)
  gratitudeLog: GratitudeEntry[];

  // Notifications
  notifications: NotificationSettings;

  // Misc
  leads: Lead[];
  reviews: Review[];
  milestoneChecks: boolean[];

  // Legacy fields preserved for backward compat
  outreach: number;
  portfolio: number;
}

// ─── DEFAULT PILLARS ─────────────────────────────────────────────────────────

export const DEFAULT_PILLARS: CustomPillar[] = [
  { id: 'morning',  icon: '🌅', name: 'Morning Routine',   desc: 'Activate · Hydrate · Plan',             time: '6:00 – 7:30 am',   category: 'personal',  color: '#7B6FFF22' },
  { id: 'deepwork', icon: '🎯', name: 'Deep Work',         desc: 'Focused · High-value · Undistracted',   time: '8:00 – 12:00 pm',  category: 'career',    color: '#60A5FA22' },
  { id: 'learning', icon: '📚', name: 'Learning & Growth', desc: 'Skills · Reading · Practice',           time: '1:00 – 2:00 pm',   category: 'learning',  color: '#2DD4BF22' },
  { id: 'fitness',  icon: '💪', name: 'Physical Activity', desc: 'Exercise · Movement · Health',          time: '5:00 – 6:00 pm',   category: 'fitness',   color: '#F59E0B22' },
  { id: 'evening',  icon: '🌙', name: 'Evening Wind-down', desc: 'Reflect · Journal · Rest',              time: '9:00 – 10:00 pm',  category: 'personal',  color: '#F8717122' },
];

// ─── GOAL TEMPLATES ───────────────────────────────────────────────────────────

export interface GoalTemplate {
  name: string;
  category: GoalCategory;
  target: number;
  unit: string;
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  // Health
  { name: 'Daily water intake',      category: 'health',   target: 8,    unit: 'glasses/day' },
  { name: 'Sleep target',            category: 'health',   target: 8,    unit: 'hours/night' },
  { name: 'Meditation sessions',     category: 'health',   target: 1,    unit: 'sessions/day' },
  // Fitness
  { name: 'Weekly workouts',         category: 'fitness',  target: 5,    unit: 'sessions/week' },
  { name: 'Daily steps',             category: 'fitness',  target: 8000, unit: 'steps/day' },
  { name: 'Calories burned',         category: 'fitness',  target: 500,  unit: 'kcal/day' },
  // Learning
  { name: 'Books to read',           category: 'learning', target: 12,   unit: 'books' },
  { name: 'Study hours',             category: 'learning', target: 2,    unit: 'hours/day' },
  { name: 'Practice sessions',       category: 'learning', target: 1,    unit: 'sessions/day' },
  { name: 'Courses completed',       category: 'learning', target: 3,    unit: 'courses' },
  // Business
  { name: 'Outreach messages',       category: 'business', target: 5,    unit: 'per day' },
  { name: 'Networking calls',        category: 'business', target: 3,    unit: 'per week' },
  { name: 'Client proposals sent',   category: 'business', target: 2,    unit: 'per week' },
  // Creative
  { name: 'Portfolio pieces',        category: 'creative', target: 10,   unit: 'pieces' },
  { name: 'Content published',       category: 'creative', target: 4,    unit: 'per week' },
  { name: 'Projects completed',      category: 'creative', target: 3,    unit: 'projects' },
  // Career
  { name: 'Skill certifications',    category: 'career',   target: 2,    unit: 'certifications' },
  { name: 'Job applications',        category: 'career',   target: 5,    unit: 'per week' },
  { name: 'Interview calls',         category: 'career',   target: 2,    unit: 'per week' },
  // Finance
  { name: 'Monthly revenue',         category: 'finance',  target: 5000, unit: '$/month' },
  { name: 'Monthly savings',         category: 'finance',  target: 1000, unit: '$/month' },
  { name: 'Expenses tracked',        category: 'finance',  target: 30,   unit: 'entries/month' },
  // Personal
  { name: 'Journal entries',         category: 'personal', target: 7,    unit: 'per week' },
  { name: 'Social connections',      category: 'personal', target: 3,    unit: 'per week' },
  { name: 'Acts of gratitude',       category: 'personal', target: 3,    unit: 'per day' },
];

export const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
  health:   'Health',
  fitness:  'Fitness',
  learning: 'Learning',
  business: 'Business',
  creative: 'Creative',
  personal: 'Personal',
  career:   'Career',
  finance:  'Finance',
  custom:   'Custom',
};

export const GOAL_CATEGORY_COLORS: Record<GoalCategory, { bg: string; color: string }> = {
  health:   { bg: 'rgba(52,211,153,0.12)',   color: 'var(--green)' },
  fitness:  { bg: 'rgba(45,212,191,0.12)',   color: 'var(--teal)' },
  learning: { bg: 'rgba(96,165,250,0.12)',   color: 'var(--blue)' },
  business: { bg: 'rgba(245,158,11,0.12)',   color: 'var(--amber)' },
  creative: { bg: 'rgba(123,111,255,0.15)',  color: 'var(--accent2)' },
  personal: { bg: 'rgba(248,113,113,0.12)',  color: 'var(--coral)' },
  career:   { bg: 'rgba(244,114,182,0.12)',  color: 'var(--pink)' },
  finance:  { bg: 'rgba(52,211,153,0.12)',   color: 'var(--green)' },
  custom:   { bg: 'rgba(123,111,255,0.15)',  color: 'var(--accent2)' },
};

export const PILLAR_ICONS = [
  '🌅','🌞','🎯','📚','📝','💪','🏃','🍎','💧','🧘',
  '🎨','💻','📊','🤝','💡','🌙','📖','✍️','🎵','🏋️',
  '🚀','⚡','🔑','🌱','🏆','💰','🔬','🎓','🧠','🏠',
  '🍽️','☕','🚶','🧹','📅','🛠️','🎭','💬','🌍','🔥',
];

export const PILLAR_COLORS = [
  { label: 'Purple',  value: '#7B6FFF22' },
  { label: 'Blue',    value: '#60A5FA22' },
  { label: 'Teal',    value: '#2DD4BF22' },
  { label: 'Amber',   value: '#F59E0B22' },
  { label: 'Coral',   value: '#F8717122' },
  { label: 'Green',   value: '#34D39922' },
  { label: 'Pink',    value: '#F472B622' },
];

// ─── DEFAULT STATE ────────────────────────────────────────────────────────────

export const defaultState: AppState = {
  userName: '',
  userInitials: '',
  profession: '',
  location: '',
  version: '2.0',
  startDate: new Date().toISOString().split('T')[0],
  targetDuration: 90,
  streak: 1,
  day: 1,
  pillars: { morning: false, deepwork: false, learning: false, fitness: false, evening: false },
  customPillars: DEFAULT_PILLARS,
  goals: [],
  workouts: [false, false, false, false, false, false, false],
  water: 0,
  sleep: 8,
  skills: {},
  sessions: [],
  heatmap: {},
  dailyTasks: [],
  gratitudeLog: [],
  notifications: {
    enabled: true,
    morningReminder: true,
    morningTime: '07:00',
    streakAlerts: true,
    weeklyReview: true,
    overworkAlerts: true,
    overworkThresholdHours: 8,
    missedTaskAlerts: true,
    missedTaskTime: '21:00',
    sound: false,
  },
  leads: [],
  reviews: [],
  milestoneChecks: [],
  outreach: 0,
  portfolio: 0,
};

// ─── PERSISTENCE ─────────────────────────────────────────────────────────────

const KEY = 'ochalaos_v2';
const KEY_LEGACY = 'ochalaos_v1';

export function loadState(): AppState {
  if (typeof window === 'undefined') return { ...defaultState };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      return { ...defaultState, ...parsed };
    }
    // Migrate from v1
    const legacy = localStorage.getItem(KEY_LEGACY);
    if (legacy) {
      const old = JSON.parse(legacy) as Record<string, unknown>;
      type OldPillars = { body?: boolean; deep?: boolean; skill?: boolean; biz?: boolean; rec?: boolean };
      const oldPillars = (old.pillars ?? {}) as OldPillars;
      const migrated: AppState = {
        ...defaultState,
        userName: 'Ochala',
        userInitials: 'OC',
        profession: 'Creative Professional',
        startDate: (old.startDate as string) ?? defaultState.startDate,
        targetDuration: 90,
        streak: (old.streak as number) ?? 1,
        day: (old.day as number) ?? 1,
        pillars: {
          morning: false,
          deepwork: oldPillars.deep ?? false,
          learning: oldPillars.skill ?? false,
          fitness: oldPillars.body ?? false,
          evening: oldPillars.rec ?? false,
        },
        workouts: (old.workouts as boolean[]) ?? defaultState.workouts,
        water: (old.water as number) ?? 0,
        sleep: (old.sleep as number) ?? 8,
        skills: (old.skills as Record<string, number>) ?? {},
        sessions: (old.sessions as Session[]) ?? [],
        heatmap: (old.heatmap as Record<string, number>) ?? {},
        leads: (old.leads as Lead[]) ?? [],
        reviews: (old.reviews as Review[]) ?? [],
        milestoneChecks: (old.milestoneChecks as boolean[]) ?? [],
        outreach: (old.outreach as number) ?? 0,
        portfolio: (old.portfolio as number) ?? 0,
      };
      saveState(migrated);
      return migrated;
    }
    return { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(KEY_LEGACY);
}

// ─── UTILITIES ────────────────────────────────────────────────────────────────

export function computeDay(startDate: string, targetDuration = 90): number {
  const start = new Date(startDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
  return Math.max(1, Math.min(targetDuration, diff));
}

export function getDateKey(startDate: string, dayOffset: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

export function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function autoInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function currentPhase(day: number, targetDuration: number): { label: string; num: number } {
  const third = Math.ceil(targetDuration / 3);
  if (day <= third) return { label: 'Foundation', num: 1 };
  if (day <= third * 2) return { label: 'Momentum', num: 2 };
  return { label: 'Power', num: 3 };
}
