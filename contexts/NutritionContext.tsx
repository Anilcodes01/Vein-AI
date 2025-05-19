"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { NutritionLog, NutritionEntry, NutritionActions, NutritionState } from "@/app/lib/types"; 
interface NutritionContextValue extends NutritionState, NutritionActions {}
const NutritionContext = createContext<NutritionContextValue | undefined>(undefined);
interface NutritionProviderProps {
  children: ReactNode;
}

export const NutritionProvider: React.FC<NutritionProviderProps> = ({ children }) => {
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); 
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchNutritionData = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    setSubmitError(null); 
    setDeleteError(null);
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
      const validatedData = (Array.isArray(data) ? data : data ? [data] : [])
        .filter((log) => log && log.id)
        .map((log) => ({
          ...log,
          entries: (Array.isArray(log.entries) ? log.entries : []).filter(
            (entry) => entry && entry.id
          ),
        }));
      setNutritionLogs(validatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown fetch error occurred");
      setNutritionLogs([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
     if (selectedDate) {
      fetchNutritionData(selectedDate);
    }
  }, [selectedDate, fetchNutritionData]);

  const addNutritionEntry = useCallback(
    async (data: {
      input: string;
      mealTime: string;
      timestamp: string;
      date: string; 
    }) => {
      setIsSubmitting(true);
      setSubmitError(null);
      setDeleteError(null);

      try {
        const response = await fetch("/api/Track/chatTrack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: data.input,
            mealtime: data.mealTime,
            timestamp: data.timestamp,
            date: data.date, 
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
                    const entryDateObj = new Date(data.date + 'T00:00:00Z');
                    return logDate.getUTCFullYear() === entryDateObj.getUTCFullYear() &&
                           logDate.getUTCMonth() === entryDateObj.getUTCMonth() &&
                           logDate.getUTCDate() === entryDateObj.getUTCDate();
                } catch (dateError) {
                    console.error("Date comparison error:", dateError);
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
                       totalCalories: result.updatedLog?.totalCalories ?? targetLog.totalCalories + (newEntry.calories ?? 0),
                       totalProtein: result.updatedLog?.totalProtein ?? targetLog.totalProtein + (newEntry.protein ?? 0),
                       totalFat: result.updatedLog?.totalFat ?? targetLog.totalFat + (newEntry.fat ?? 0),
                       totalCarbs: result.updatedLog?.totalCarbs ?? targetLog.totalCarbs + (newEntry.carbs ?? 0),
                       totalWaterMl: result.updatedLog?.totalWaterMl ?? targetLog.totalWaterMl + (newEntry.waterMl ?? 0),
                       updatedAt: result.updatedLog?.updatedAt || new Date().toISOString(),
                   };
                }
                else if (result.updatedLog) {
                    updatedLogs[logIndex] = {
                       ...targetLog,
                       ...result.updatedLog 
                    };
                }
            } else {
                const newLog: NutritionLog = {
                    id: result.updatedLog?.id || `new-log-${Date.now()}`,
                    userId: result.updatedLog?.userId || '', 
                    date: new Date(data.date + 'T00:00:00Z').toISOString(),
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
        setSubmitError(
          error instanceof Error ? error.message : "An unknown submission error occurred"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );
 const deleteNutritionEntry = useCallback(async (entryId: string) => {
    setIsDeleting(true);
    setDeleteError(null);
    setSubmitError(null);

    const originalLogs = JSON.parse(JSON.stringify(nutritionLogs));
    let logIdOfDeletedEntry: string | null = null;
    let deletedEntryValues: Partial<NutritionEntry> = { calories: 0, protein: 0, fat: 0, carbs: 0, waterMl: 0 };

    setNutritionLogs((prevLogs) => {
      const newLogs = prevLogs.map(log => {
        const entryToRemove = log.entries.find(e => e.id === entryId);
        if (entryToRemove) {
          logIdOfDeletedEntry = log.id;
          deletedEntryValues = {
            calories: entryToRemove.calories || 0,
            protein: entryToRemove.protein || 0,
            fat: entryToRemove.fat || 0,
            carbs: entryToRemove.carbs || 0,
            waterMl: entryToRemove.waterMl || 0,
          };
          return {
            ...log,
            entries: log.entries.filter(e => e.id !== entryId),
            totalCalories: (log.totalCalories || 0) - (deletedEntryValues.calories || 0),
            totalProtein: (log.totalProtein || 0) - (deletedEntryValues.protein || 0),
            totalFat: (log.totalFat || 0) - (deletedEntryValues.fat || 0),
            totalCarbs: (log.totalCarbs || 0) - (deletedEntryValues.carbs || 0),
            totalWaterMl: (log.totalWaterMl || 0) - (deletedEntryValues.waterMl || 0),
            updatedAt: new Date().toISOString(), 
          };
        }
        return log;
      });
      return newLogs;
    });

    try {
      const response = await fetch("/api/Track/deleteTrack", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId }),
      });

      if (!response.ok) {
        let errorMsg = `Failed to delete entry (Status: ${response.status})`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (_) {}
        setNutritionLogs(originalLogs); 
        throw new Error(errorMsg);
      }

      const result = await response.json();
      const updatedLogFromServer = result.updatedLog as NutritionLog;

      if (updatedLogFromServer && updatedLogFromServer.id) {
        setNutritionLogs((prevLogs) => {
          const logIndex = prevLogs.findIndex(l => l.id === updatedLogFromServer.id);
          if (logIndex > -1) {
            const newLogsState = [...prevLogs];
            newLogsState[logIndex] = {
                ...updatedLogFromServer,
                entries: (updatedLogFromServer.entries || []).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
            };
            return newLogsState;
          } else if (logIdOfDeletedEntry) {
            fetchNutritionData(selectedDate);
            return prevLogs; 
          }
          return prevLogs;
        });
      } else {
        console.warn("Server did not return an updated log, or log was deleted. Consider re-fetching if totals seem off.");
        if (logIdOfDeletedEntry) {
            const logToCheck = nutritionLogs.find(l => l.id === logIdOfDeletedEntry);
            if (logToCheck && logToCheck.entries.length === 0) {
                fetchNutritionData(selectedDate);
            }
        }
      }
      console.log("Entry deleted successfully from server and local state updated.");

    } catch (error) {
      setNutritionLogs(originalLogs);
      setDeleteError(
        error instanceof Error ? error.message : "An unknown deletion error occurred"
      );
      console.error("Deletion failed:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [nutritionLogs, selectedDate, fetchNutritionData]);

  const changeSelectedDate = useCallback((newDate: string) => {
    setSelectedDate(newDate);
  }, []);

  const value: NutritionContextValue = {
    nutritionLogs,
    loading,
    error,
    selectedDate,
    isSubmitting,
    submitError,
    fetchNutritionData,
    addNutritionEntry,
    changeSelectedDate,
    isDeleting,      
    deleteError,  
    deleteNutritionEntry,
  };

  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  );
};
export const useNutrition = (): NutritionContextValue => {
  const context = useContext(NutritionContext);
  if (context === undefined) {
    throw new Error("useNutrition must be used within a NutritionProvider");
  }
  return context;
};