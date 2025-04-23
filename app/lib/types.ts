
export type NutritionLog = {
    id: string;
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    totalWaterMl: number;
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


  export interface NutritionState {
    nutritionLogs: NutritionLog[];
    loading: boolean;
    error: string | null;
    selectedDate: string;
    isSubmitting: boolean; 
    submitError: string | null;
    isDeleting: boolean;       // <-- Add this
  deleteError: string | null; 
  }
  
  // Define the shape of the actions
  export interface NutritionActions {
    fetchNutritionData: (date: string) => Promise<void>;
    addNutritionEntry: (data: {
      input: string;
      mealTime: string;
      timestamp: string;
      date: string; // Explicitly pass date needed for submission
    }) => Promise<void>;
    changeSelectedDate: (newDate: string) => void;
    deleteNutritionEntry: (entryId: string) => Promise<void>;
  }