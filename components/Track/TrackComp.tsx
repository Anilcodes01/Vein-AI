"use client";
import NutritionTracker from "./NutritionTracker";
import TrackInput from "./TrackInput";
import { useDashboard } from '@/contexts/DashboardContext';
import { useNutrition } from "@/contexts/NutritionContext";
import { DashboardData } from "@/lib/types";

export default function TrackComp() {
  const {
    nutritionLogs,
    loading,
    error,
    selectedDate,
    isSubmitting,
    submitError,
    addNutritionEntry,
    addExerciseEntry,
    changeSelectedDate,
  } = useNutrition();

  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboard();

  const handleTrackSubmit = async (data: {
    input: string;
    mealTime: string;
    timestamp: string;
  }) => {
    try {
      if (data.mealTime.toLowerCase() === 'exercise') {
        await addExerciseEntry({ 
          description: data.input,
          timestamp: data.timestamp,
          date: selectedDate,
        });
      } else {
        await addNutritionEntry({
          input: data.input,
          mealTime: data.mealTime,
          timestamp: data.timestamp,
          date: selectedDate,
        });
      }
    } catch (e) {
      console.error("Submission failed in TrackComp wrapper:", e);
    }
  };

  const handleDateChange = (newDate: string) => {
    changeSelectedDate(newDate);
  };

  return (
    <div className="flex flex-col w-full overflow-y-auto bg-[#fcfbf8] dark:bg-gray-950 hide-scrollbar min-h-screen p-4 sm:p-6 ">
      <div className="flex flex-col w-full max-w-4xl mx-auto">
        <TrackInput
          onSubmit={handleTrackSubmit}
          isSubmitting={isSubmitting}
        />

        {submitError && (
          <div className="mt-4 w-full md:ml-36 max-w-4xl p-3 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 text-xs sm:text-sm" role="alert">
            <p><strong>Failed to add entry:</strong> {submitError}</p>
          </div>
        )}

        <NutritionTracker
          nutritionLogs={nutritionLogs}
          loading={loading}
          error={error}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          dashboardData={dashboardData as DashboardData | null} 
          dashboardLoading={dashboardLoading}
          dashboardError={dashboardError}
        />
      </div>
    </div>
  );
}