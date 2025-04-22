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
    changeSelectedDate,
  } = useNutrition();

  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboard();

  const handleTrackSubmit = async (data: {
    input: string;
    mealTime: string;
    timestamp: string;
  }) => {
    try {
        await addNutritionEntry({
            ...data,
            date: selectedDate,
        });
    } catch (e) {
        console.error("Submission failed in TrackComp:", e);
    }
  };

  const handleDateChange = (newDate: string) => {
    changeSelectedDate(newDate);
  };

  return (
    <div className="flex flex-col min-h-screen p-4 sm:p-6 md:ml-64">
      <div className="flex flex-col w-full max-w-4xl mx-auto">
        <TrackInput
          onSubmit={handleTrackSubmit}
          isSubmitting={isSubmitting}
        />

        {submitError && (
          <div className="mt-4 w-4xl ml-36 p-3 rounded-md bg-error/20 border border-error/30 text-error text-sm" role="alert">
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