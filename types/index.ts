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

export type Habit = {
  id: string;
  name: string;
  icon: string;
  reason: string | null;
  frequencyDays: string[];
  type: 'CHECK_IN' | 'COUNT' | 'TIME';
  target: number | null;
  targetUnit: string | null;
  timeOfDay: string | null;
  reminderTime: string | null;
};