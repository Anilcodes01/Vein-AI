import { NutritionLog } from "@/app/lib/types";
export type DashboardData = {
  calorieIntake: string;
  fatIntake: string;
  proteinIntake: string;
  waterIntake: string;
  carbsIntake: string;
};

export type DashboardContextType = {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
};
export type DailyTotals = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  water: number; // This remains in ml from entries
};
export interface TrackInputProps {
  onSubmit: (data: {
    input: string;
    mealTime: string;
    timestamp: string;
  }) => Promise<void>;
}
export interface ProgressCircleProps {
  value: number;
  maxValue: number;
  label: string;
  unit: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export interface NutritionEntry {
  id: string;
  time: string;
  mealtime: string;
  description: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  waterMl: number;
}

export interface TotalEntries {
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalWaterMl: number;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ApiResponse {
  response?: string;
  conversationId?: string;
}


export 
interface NutritionTrackerProps {
    nutritionLogs: NutritionLog[];
    loading: boolean;
    error: string | null;
    selectedDate: string;
    onDateChange: (date: string) => void;
    dashboardData: DashboardData | null; 
    dashboardLoading: boolean;
    dashboardError: string | null;
}

export 
interface TrackInputProps {
  onSubmit: (data: { input: string; mealTime: string; timestamp: string }) => Promise<void>;
  isSubmitting: boolean;
}


// src/lib/types.ts (or wherever you keep your types)

export interface CommunityUser {
  id: string;
  name: string | null;
  username: string | null;
  // --- Updated Streak Type ---
  streak: {
    current: number | null; // Current streak value
    longest: number | null; // Longest streak value (if needed later)
  } | null; // The whole streak object could be null
  // --- End Update ---
  image: string | null;
}