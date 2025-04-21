"use client";
import NutritionTracker from "./NutritionTracker";
import TrackInput from "./TrackInput";
import { useEffect, useState, useCallback } from "react";
import { useDashboard } from '@/contexts/DashboardContext';
import { NutritionLog, NutritionEntry } from "@/app/lib/types";
import { DashboardData } from "@/lib/types";

export default function TrackComp() {
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboard();

  const fetchNutritionData = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/Track/getTracks?date=${date}`);
      if (!response.ok) {
         let errorMsg = `Failed to fetch nutrition data (Status: ${response.status})`;
         try {
             const errorData = await response.json();
             errorMsg = errorData.message || errorData.error || errorMsg;
         } catch (_) {}
         throw new Error(errorMsg);
      }
      const data: NutritionLog[] = await response.json();
      const validatedData = (Array.isArray(data) ? data : (data ? [data] : []))
        .filter(log => log && log.id)
        .map(log => ({
            ...log,
            entries: (Array.isArray(log.entries) ? log.entries : []).filter(entry => entry && entry.id)
        }));
      setNutritionLogs(validatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setNutritionLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNutritionData(selectedDate);
  }, [selectedDate, fetchNutritionData]);

  const handleTrackSubmit = async (data: {
    input: string;
    mealTime: string;
    timestamp: string;
  }) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/Track/chatTrack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: data.input,
          mealtime: data.mealTime,
          timestamp: data.timestamp,
          date: selectedDate,
        }),
      });

      if (!response.ok) {
        let errorMsg = `Failed to save entry (Status: ${response.status})`;
         try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorData.message || errorMsg;
            const details = errorData.details ? ` Details: ${errorData.details}` : '';
            const suggestion = errorData.suggestion ? ` Suggestion: ${errorData.suggestion}` : '';
            errorMsg = `${errorMsg}${details}${suggestion}`;
         } catch (e) {}
        throw new Error(errorMsg);
      }

      const result = await response.json();

      if (!result || !result.success || !result.entry || !result.entry.id) {
          throw new Error("Received invalid data from server after submission.");
      }

      const newEntry = result.entry as NutritionEntry;

      setNutritionLogs((prevLogs) => {
          const logIndex = prevLogs.findIndex(log => {
              try {
                  const logDate = new Date(log.date);
                  const selectedLogDate = new Date(selectedDate + 'T00:00:00Z');
                  return logDate.getUTCFullYear() === selectedLogDate.getUTCFullYear() &&
                         logDate.getUTCMonth() === selectedLogDate.getUTCMonth() &&
                         logDate.getUTCDate() === selectedLogDate.getUTCDate();
              } catch (dateError) {
                  return false;
              }
          });

          let updatedLogs = [...prevLogs];

          if (logIndex > -1) {
              const targetLog = updatedLogs[logIndex];
              const entryExists = targetLog.entries.some(e => e.id === newEntry.id);
              if (!entryExists) {
                 updatedLogs[logIndex] = {
                     ...targetLog,
                     entries: [...targetLog.entries, newEntry].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
                 };
              }
          } else {
              const newLog: NutritionLog = {
                  id: result.updatedLog?.id || `new-log-${Date.now()}`,
                  userId: result.updatedLog?.userId || '',
                  date: new Date(selectedDate + 'T00:00:00Z').toISOString(),
                  entries: [newEntry].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
                  totalCalories: result.updatedLog?.totalCalories ?? newEntry.calories ?? 0,
                  totalProtein: result.updatedLog?.totalProtein ?? newEntry.protein ?? 0,
                  totalFat: result.updatedLog?.totalFat ?? newEntry.fat ?? 0,
                  totalCarbs: result.updatedLog?.totalCarbs ?? newEntry.carbs ?? 0,
                  totalWaterMl: result.updatedLog?.totalWaterMl ?? newEntry.waterMl ?? 0,
                  createdAt: result.updatedLog?.createdAt || new Date().toISOString(),
                  updatedAt: result.updatedLog?.updatedAt || new Date().toISOString(),
              };
              updatedLogs.push(newLog);
              updatedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          }

          return updatedLogs;
      });

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An unknown submission error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (newDate: string) => {
      setSelectedDate(newDate);
  };

  return (
    <div className="flex flex-col min-h-screen p-4 sm:p-6 ml-44 md:pl-64">
      <div className="flex flex-col w-full max-w-7xl mx-auto">
        <TrackInput onSubmit={handleTrackSubmit} isSubmitting={isSubmitting} />

        {submitError && (
          <div className="mt-4 md:ml-24 max-w-6xl p-3 rounded-md bg-error/20 border border-error/30 text-error text-sm" role="alert">
            <p><strong>Failed to add entry:</strong> {submitError}</p>
          </div>
        )}

        <NutritionTracker
          nutritionLogs={nutritionLogs}
          loading={loading && nutritionLogs.length === 0}
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