export interface DailyTotals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  water: number;
  caloriesBurned: number; 
}
export interface DashboardData {
  calorieIntake?: string | number;
  proteinIntake?: string | number;
  fatIntake?: string | number;
  carbsIntake?: string | number;
  waterIntake?: string | number; 

  caloriesBurned?: string | number; 
 
}

export interface NutritionTrackerProps {
  nutritionLogs: NutritionLog[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
  onDateChange: (newDate: string) => void;
  dashboardData: DashboardData | null;
  dashboardLoading: boolean;
  dashboardError: string | null;
}
export type NutritionLog = {
    id: string;
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    totalWaterMl: number;
    totalCaloriesBurned?: number;
   exerciseEntry?: ExerciseEntry[];
    entries: NutritionEntry[];
    userId?: string;
    createdAt?: string;
  updatedAt?: string;
  };
  
  export type NutritionEntry = {
    id: string;
    time: string;
    mealtime: string;
    description: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    waterMl: number;
    source: string;
    createdAt: string;
    userId?: string;
  };
  export type ExerciseEntry = {
    id: string;
    time: string;
    description: string;
    duration: string;
    createdAt: string;
    updatedAt: string;
    caloriesBurned: number;
    source: string;
  
  }


 export interface NutritionState {
  nutritionLogs: NutritionLog[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
  isSubmitting: boolean;
  submitError: string | null;
  isDeleting: boolean;
  deleteError: string | null;
}
  
  export interface NutritionActions {
  fetchNutritionData: (date: string) => Promise<void>;
  addNutritionEntry: (data: {
    input: string;
    mealTime: string;
    timestamp: string;
    date: string;
  }) => Promise<void>;
  addExerciseEntry: (data: {
    description: string;
    timestamp: string;
    date: string;
  }) => Promise<void>;
  deleteNutritionEntry: (entryId: string) => Promise<void>;
  deleteExerciseEntry: (entryId: string) => Promise<void>;
  changeSelectedDate: (newDate: string) => void;
}