// app/types.ts
export type NutritionLog = {
    id: string;
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    totalWaterMl: number;
    entries: NutritionEntry[];
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
  };