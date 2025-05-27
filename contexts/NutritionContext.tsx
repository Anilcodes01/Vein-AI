"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  NutritionLog,
  NutritionEntry,
  ExerciseEntry, 
  NutritionActions,
  NutritionState,
} from "@/app/lib/types";

interface NutritionContextValue extends NutritionState, NutritionActions {}

const NutritionContext = createContext<NutritionContextValue | undefined>(
  undefined
);

interface NutritionProviderProps {
  children: ReactNode;
}

export const NutritionProvider: React.FC<NutritionProviderProps> = ({
  children,
}) => {
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
          entries: (Array.isArray(log.entries) ? log.entries : [])
            .filter((entry) => entry && entry.id)
            .sort(
              (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
            ),
          exerciseEntry: (Array.isArray(log.exerciseEntry) 
            ? log.exerciseEntry
            : []
          )
            .filter((exEntry) => exEntry && exEntry.id)
            .sort(
              (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
            ),
          totalCaloriesBurned: log.totalCaloriesBurned || 0,
        }));
      setNutritionLogs(validatedData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown fetch error occurred"
      );
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
            const details = errorData.details
              ? ` Details: ${errorData.details}`
              : "";
            const suggestion = errorData.suggestion
              ? ` Suggestion: ${errorData.suggestion}`
              : "";
            errorMsg = `${errorMsg}${details}${suggestion}`;
          } catch (e) {}
          throw new Error(errorMsg);
        }

        const result = await response.json();

        if (!result || !result.success || !result.entry || !result.entry.id) {
          throw new Error(
            "Received invalid data from server after nutrition submission."
          );
        }

        const newNutritionEntry = result.entry as NutritionEntry;
        const updatedLogFromServer = result.updatedLog as NutritionLog;

        setNutritionLogs((prevLogs) => {
          const logIndex = prevLogs.findIndex((log) => {
            try {
              const logDate = new Date(log.date);
              const entryDateObj = new Date(data.date + "T00:00:00Z");
              return (
                logDate.getUTCFullYear() === entryDateObj.getUTCFullYear() &&
                logDate.getUTCMonth() === entryDateObj.getUTCMonth() &&
                logDate.getUTCDate() === entryDateObj.getUTCDate()
              );
            } catch (dateError) {
              console.error("Date comparison error in addNutritionEntry:", dateError);
              return false;
            }
          });

          let updatedLogs = [...prevLogs];

          if (logIndex > -1) {
            const targetLog = updatedLogs[logIndex];
            updatedLogs[logIndex] = {
                ...targetLog,
                ...updatedLogFromServer, 
                entries: (updatedLogFromServer.entries || [])
                  .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
                exerciseEntry: (updatedLogFromServer.exerciseEntry || [])
                  .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
            };
          } else {
            const newLog: NutritionLog = {
              ...updatedLogFromServer,
              id: updatedLogFromServer.id || `new-log-${Date.now()}`,
              userId: updatedLogFromServer.userId || "",
              date: new Date(data.date + "T00:00:00Z").toISOString(),
              entries: (updatedLogFromServer.entries || [newNutritionEntry]) 
                .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
              exerciseEntry: (updatedLogFromServer.exerciseEntry || [])
                .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
            };
            updatedLogs.push(newLog);
            updatedLogs.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          }
          return updatedLogs;
        });
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "An unknown submission error occurred"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [] 
  );

  const addExerciseEntry = useCallback(
    async (data: {
      description: string;
      timestamp: string;
      date: string;
    }) => {
      setIsSubmitting(true);
      setSubmitError(null);
      setDeleteError(null);

      try {
        const response = await fetch("/api/Track/workout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: data.description,
            timestamp: data.timestamp,
            date: data.date,
          }),
        });

        if (!response.ok) {
          let errorMsg = `Failed to save exercise entry (Status: ${response.status})`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorData.message || errorMsg;
            const details = errorData.details
              ? ` Details: ${errorData.details}`
              : "";
            const suggestion = errorData.suggestion
              ? ` Suggestion: ${errorData.suggestion}`
              : "";
            errorMsg = `${errorMsg}${details}${suggestion}`;
          } catch (_) {}
          throw new Error(errorMsg);
        }

        const result = await response.json();

        if (!result || !result.success || !result.entry || !result.entry.id) {
          throw new Error(
            "Received invalid data from server after exercise submission."
          );
        }

        const newExerciseEntry = result.entry as ExerciseEntry;
        const updatedLogFromServer = result.updatedLog as NutritionLog;

        setNutritionLogs((prevLogs) => {
          const logIndex = prevLogs.findIndex((log) => {
             try {
                const logDate = new Date(log.date);
                const entryDateObj = new Date(data.date + "T00:00:00Z");
                return (
                    logDate.getUTCFullYear() === entryDateObj.getUTCFullYear() &&
                    logDate.getUTCMonth() === entryDateObj.getUTCMonth() &&
                    logDate.getUTCDate() === entryDateObj.getUTCDate()
                );
            } catch (dateError) {
                console.error("Date comparison error in addExerciseEntry:", dateError);
                return false;
            }
          });

          let updatedLogs = [...prevLogs];

          if (logIndex > -1) {
            const targetLog = updatedLogs[logIndex];
             updatedLogs[logIndex] = {
                ...targetLog,
                ...updatedLogFromServer,
                entries: (updatedLogFromServer.entries || targetLog.entries || [])
                  .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
                exerciseEntry: (updatedLogFromServer.exerciseEntry || [])
                  .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
            };
          } else {
            const newLog: NutritionLog = {
                ...updatedLogFromServer,
                id: updatedLogFromServer.id || `new-log-ex-${Date.now()}`,
                userId: updatedLogFromServer.userId || "",
                date: new Date(data.date + "T00:00:00Z").toISOString(),
                entries: (updatedLogFromServer.entries || []) 
                    .sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
                exerciseEntry: (updatedLogFromServer.exerciseEntry || [newExerciseEntry])
                    .sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
           
            };
            updatedLogs.push(newLog);
            updatedLogs.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          }
          return updatedLogs;
        });
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "An unknown exercise submission error occurred"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const deleteNutritionEntry = useCallback(
    async (entryId: string) => {
      setIsDeleting(true);
      setDeleteError(null);
      setSubmitError(null);

      const originalLogs = JSON.parse(JSON.stringify(nutritionLogs)); 

      setNutritionLogs((prevLogs) =>
        prevLogs.map((log) => {
          const entryIndex = log.entries.findIndex((e) => e.id === entryId);
          if (entryIndex > -1) {
            const entryToRemove = log.entries[entryIndex];
            return {
              ...log,
              entries: log.entries.filter((e) => e.id !== entryId),
              totalCalories: (log.totalCalories || 0) - (entryToRemove.calories || 0),
              totalProtein: (log.totalProtein || 0) - (entryToRemove.protein || 0),
              totalFat: (log.totalFat || 0) - (entryToRemove.fat || 0),
              totalCarbs: (log.totalCarbs || 0) - (entryToRemove.carbs || 0),
              totalWaterMl: (log.totalWaterMl || 0) - (entryToRemove.waterMl || 0),
              updatedAt: new Date().toISOString(),
            };
          }
          return log;
        }).filter(log => log.entries.length > 0 || (log.exerciseEntry ?? []).length > 0 || (log.entries.length === 0 && (log.exerciseEntry ?? []).length === 0 && log.id.startsWith('new-log'))) // Temp allow new empty logs
      );


      try {
        const response = await fetch("/api/Track/deleteTrack", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entryId, type: "nutrition" }), 
        });

        if (!response.ok) {
          let errorMsg = `Failed to delete nutrition entry (Status: ${response.status})`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.error || errorMsg;
          } catch (_) {}
          setNutritionLogs(originalLogs); 
          throw new Error(errorMsg);
        }

        const result = await response.json();
        const updatedLogFromServer = result.updatedLog as NutritionLog;

        if (result.logDeleted) {

            setNutritionLogs(prevLogs => prevLogs.filter(l => l.id !== result.deletedLogId));
             if (nutritionLogs.find(l => l.id === result.deletedLogId)?.date === selectedDate) {
                fetchNutritionData(selectedDate); 
            }
        } else if (updatedLogFromServer && updatedLogFromServer.id) {
          setNutritionLogs((prevLogs) => {
            const logIndex = prevLogs.findIndex(
              (l) => l.id === updatedLogFromServer.id
            );
            if (logIndex > -1) {
              const newLogsState = [...prevLogs];
              newLogsState[logIndex] = {
                ...updatedLogFromServer,
                entries: (updatedLogFromServer.entries || []).sort(
                  (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
                ),
                exerciseEntry: (
                  updatedLogFromServer.exerciseEntry || []
                ).sort(
                  (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
                ),
              };
              return newLogsState;
            }
            fetchNutritionData(selectedDate);
            return prevLogs;
          });
        } else {
          fetchNutritionData(selectedDate);
        }
      } catch (error) {
        setNutritionLogs(originalLogs); 
        setDeleteError(
          error instanceof Error
            ? error.message
            : "An unknown deletion error occurred"
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [nutritionLogs, selectedDate, fetchNutritionData]
  );

  const deleteExerciseEntry = useCallback(
    async (entryId: string) => {
      setIsDeleting(true);
      setDeleteError(null);
      setSubmitError(null);

      const originalLogs = JSON.parse(JSON.stringify(nutritionLogs));
    
      setNutritionLogs((prevLogs) =>
        prevLogs.map((log) => {
          const exerciseEntries = Array.isArray(log?.exerciseEntry) ? log?.exerciseEntry : [];
          const entryIndex = exerciseEntries.findIndex((e) => e.id === entryId);
          if (entryIndex > -1) {
            const entryToRemove = exerciseEntries[entryIndex];
            return {
              ...log,
              exerciseEntry: (exerciseEntries).filter((e) => e.id !== entryId),
              totalCaloriesBurned: (log.totalCaloriesBurned || 0) - (entryToRemove.caloriesBurned || 0),
              updatedAt: new Date().toISOString(),
            };
          }
          return log;
        }).filter(log => log.entries.length > 0 || (log.exerciseEntry ?? []).length > 0 || (log.entries.length === 0 && (log.exerciseEntry ?? []).length === 0 && log.id.startsWith('new-log')))
      );

      try {
        const response = await fetch("/api/Track/deleteTrack", { 
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entryId, type: "exercise" }), 
        });

        if (!response.ok) {
          let errorMsg = `Failed to delete exercise entry (Status: ${response.status})`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.error || errorMsg;
          } catch (_) {}
          setNutritionLogs(originalLogs);
          throw new Error(errorMsg);
        }
        
        const result = await response.json();
        const updatedLogFromServer = result.updatedLog as NutritionLog;

        if (result.logDeleted) {
            setNutritionLogs(prevLogs => prevLogs.filter(l => l.id !== result.deletedLogId));
            if (nutritionLogs.find(l => l.id === result.deletedLogId)?.date === selectedDate) {
                fetchNutritionData(selectedDate);
            }
        } else if (updatedLogFromServer && updatedLogFromServer.id) {
          setNutritionLogs((prevLogs) => {
            const logIndex = prevLogs.findIndex(
              (l) => l.id === updatedLogFromServer.id
            );
            if (logIndex > -1) {
              const newLogsState = [...prevLogs];
              newLogsState[logIndex] = {
                ...updatedLogFromServer,
                entries: (updatedLogFromServer.entries || []).sort(
                  (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
                ),
                exerciseEntry: (
                  updatedLogFromServer.exerciseEntry || []
                ).sort(
                  (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
                ),
              };
              return newLogsState;
            }
            fetchNutritionData(selectedDate);
            return prevLogs;
          });
        } else {
          fetchNutritionData(selectedDate);
        }
      } catch (error) {
        setNutritionLogs(originalLogs); 
        setDeleteError(
          error instanceof Error
            ? error.message
            : "An unknown exercise deletion error occurred"
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [nutritionLogs, selectedDate, fetchNutritionData]
  );


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
    addExerciseEntry, 
    changeSelectedDate,
    isDeleting,
    deleteError,
    deleteNutritionEntry,
    deleteExerciseEntry,
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