export type HabitType = "CHECK_IN" | "COUNT" | "TIME";
export type TimeOfDay = "ANY" | "MORNING" | "AFTERNOON" | "EVENING";
export const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export interface HabitFormData {
  name: string;
  reason: string;
  icon: string;
  type: HabitType;
  target?: number;
  targetUnit?: string;
  frequencyDays: string[];
  timeOfDay: TimeOfDay;
  hasReminder: boolean;
  reminderTime?: string;
  duration: number;
}

export type AddHabitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onHabitCreated: () => void;
};

export interface Habit {
  id: string;
  name: string;
  reason?: string;
  icon: string;
  type: HabitType;
  target?: number;
  targetUnit?: string;
  frequencyDays: string[];
  timeOfDay: 'ANY' | 'MORNING' | 'AFTERNOON' | 'EVENING';
  startDate: string; 
  endDate?: string;
  completions: HabitCompletion[];
  currentStreak: number;
  longestStreak: number;
}

export type HabitCompletion = {
  date: string; 
};