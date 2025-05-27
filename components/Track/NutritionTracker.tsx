"use client";
import {  NutritionEntry, ExerciseEntry, DailyTotals, NutritionTrackerProps } from '../../app/lib/types';
import ProgressCircle from './ProgressCircle';
import { useNutrition } from '@/contexts/NutritionContext';
import {
  Utensils, Cookie, Loader2, AlertCircle,
  Calendar, Database, Search,
  Clock, Flame, Droplet, Coffee, UtensilsCrossed, Drumstick,
  Trash2, Dumbbell
} from 'lucide-react';
import { TbMeat } from "react-icons/tb";
import { PiGrains } from "react-icons/pi";
import { useMemo } from 'react';


export default function NutritionTracker({
  nutritionLogs,
  loading,
  error,
  selectedDate,
  onDateChange,
  dashboardData,
  dashboardLoading,
  dashboardError
}: NutritionTrackerProps) {

  const { deleteNutritionEntry, deleteExerciseEntry, isDeleting, deleteError } = useNutrition();

  const currentLog = useMemo(() => nutritionLogs.find(log => {
    try {
       const logDate = new Date(log.date);
       const selectedDateObj = new Date(selectedDate + 'T00:00:00Z');
       return logDate.getUTCFullYear() === selectedDateObj.getUTCFullYear() &&
              logDate.getUTCMonth() === selectedDateObj.getUTCMonth() &&
              logDate.getUTCDate() === selectedDateObj.getUTCDate();
    } catch {
       const logDateStr = new Date(log.date).toISOString().split('T')[0];
       return logDateStr === selectedDate;
    }
  }), [nutritionLogs, selectedDate]);


  const dailyTotals: DailyTotals = useMemo(() => {
    if (!currentLog) {
      return { calories: 0, protein: 0, fat: 0, carbs: 0, water: 0, caloriesBurned: 0 };
    }
    return {
      calories: currentLog.totalCalories || 0,
      protein: currentLog.totalProtein || 0,
      fat: currentLog.totalFat || 0,
      carbs: currentLog.totalCarbs || 0,
      water: currentLog.totalWaterMl || 0,
      caloriesBurned: currentLog.totalCaloriesBurned || 0,
    };
  }, [currentLog]);


  const targetCalories = parseFloat(dashboardData?.calorieIntake as string || '0') || 0;
  const targetProtein = parseFloat(dashboardData?.proteinIntake as string || '0') || 0;
  const targetFat = parseFloat(dashboardData?.fatIntake as string || '0') || 0;
  const targetCarbs = parseFloat(dashboardData?.carbsIntake as string || '0') || 0;
  const targetWaterLiters = parseFloat(dashboardData?.waterIntake as string || '0') || 0;
  const targetWaterMl = targetWaterLiters;
  const targetCaloriesBurned = parseFloat(dashboardData?.caloriesBurned as string || '250') || 250; 


  const isOverallLoading = loading || dashboardLoading;
  const overallError = error || dashboardError;
  const showProgressCircles = !isOverallLoading && !overallError &&
    (targetCalories > 0 || targetProtein > 0 || targetFat > 0 || targetCarbs > 0 || targetWaterMl > 0 || targetCaloriesBurned > 0);


  const getEntryIcon = (entry: NutritionEntry | ExerciseEntry) => {
    if ('mealtime' in entry) {
      switch(entry.mealtime?.toLowerCase()) {
        case 'breakfast': return <Coffee className="w-5 h-5 text-orange-500" />;
        case 'lunch': return <UtensilsCrossed className="w-5 h-5 text-green-500" />;
        case 'dinner': return <Drumstick className="w-5 h-5 text-purple-500" />;
        case 'snack': return <Cookie className="w-5 h-5 text-yellow-500" />;
        default: return <Utensils className="w-5 h-5 text-gray-500" />;
      }
    } else {
      return <Dumbbell className="w-5 h-5 text-indigo-500" />;
    }
  };

  const formatDisplayDate = (dateString: string): string => {
      try {
          const date = new Date(dateString + 'T00:00:00Z');
          const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
          return date.toLocaleDateString('en-US', options);
      } catch {
          return "Invalid Date";
      }
  };

  const handleDeleteNutritionClick = async (entryId: string) => {
      if (isDeleting) return;
      try {
          await deleteNutritionEntry(entryId);
      } catch (e) {
          console.error("Delete nutrition entry failed in component:", e);
      }
  };

  const handleDeleteExerciseClick = async (entryId: string) => {
      if (isDeleting) return;
      try {
          await deleteExerciseEntry(entryId);
      } catch (e) {
          console.error("Delete exercise entry failed in component:", e);
      }
  };

  const allEntriesForDay = useMemo(() => {
    if (!currentLog) return [];
    const combined = [
      ...(currentLog.entries || []).map(e => ({ ...e, type: 'nutrition' as const })),
      ...(currentLog.exerciseEntry || []).map(e => ({ ...e, type: 'exercise' as const }))
    ];
    return combined.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [currentLog]);


  if (isOverallLoading) {
    return (
        <div className="md:ml-36 px-4 py-12 flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <span className="text-gray-600 dark:text-gray-400">Loading data...</span>
          </div>
        </div>
      );
  }

  if (overallError) {
     return (
      <div className="md:ml-36 px-4 py-12">
        <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700/50">
          <div className="flex items-start text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
               <h3 className="font-semibold mb-1 text-base sm:text-lg">Error Loading Data</h3>
               <p className="text-sm">{overallError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full mx-auto px-4 py-12 md:ml-36 space-y-6 sm:space-y-8">
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-gray-100">
            Daily Tracker
          </h1>
          <div className="relative">
            <label htmlFor="date-picker" className="sr-only">Select Date</label>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm text-gray-700 dark:text-gray-300 shadow-sm w-full sm:w-auto"
            />
          </div>
        </div>

        <div className="text-center text-gray-600 dark:text-gray-300 text-sm sm:text-base font-light mb-4 sm:mb-6">
          {formatDisplayDate(selectedDate)}
        </div>

      {showProgressCircles && (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700/50">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 sm:mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            Daily Summary
          </h2>
          <div className="flex flex-wrap justify-around gap-x-2 gap-y-4 sm:gap-x-4 sm:gap-y-6">
            {targetCalories > 0 && <ProgressCircle value={dailyTotals.calories} maxValue={targetCalories} label="Calories" unit="kcal" color="text-rose-500" />}
            {targetProtein > 0 && <ProgressCircle value={dailyTotals.protein} maxValue={targetProtein} label="Protein" unit="g" color="text-blue-500" />}
            {targetCarbs > 0 && <ProgressCircle value={dailyTotals.carbs} maxValue={targetCarbs} label="Carbs" unit="g" color="text-green-500" />}
            {targetFat > 0 && <ProgressCircle value={dailyTotals.fat} maxValue={targetFat} label="Fat" unit="g" color="text-amber-500" />}
            {targetWaterMl > 0 && <ProgressCircle value={dailyTotals.water} maxValue={targetWaterMl} label="Water" unit="ml" color="text-cyan-500" />}
            <ProgressCircle value={dailyTotals.caloriesBurned} maxValue={targetCaloriesBurned} label="Burned" unit="kcal" color="text-purple-500" />
          </div>
        </div>
      )}
       {!showProgressCircles && !isOverallLoading && !overallError && (
         <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow p-4 sm:p-6 text-center border border-gray-200 dark:border-gray-700/50">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Database className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-800 dark:text-gray-200">Set Your Goals or Log an Entry</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-xs sm:text-sm">Track your progress against daily targets. Set your calorie, macro, water, or burned calorie goals in your Profile to enable the summary view.</p>
        </div>
      )}

       {deleteError && (
          <div className="my-4 p-3 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 text-xs sm:text-sm" role="alert">
            <p><strong>Failed to delete entry:</strong> {deleteError}</p>
          </div>
        )}

      <div>
        <h2 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
          Today's Log
        </h2>

        {(allEntriesForDay.length === 0) ? (
           <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow p-6 sm:p-8 text-center border border-gray-200 dark:border-gray-700/50">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-700 dark:text-gray-300">No Entries Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Use the input above to log your first meal, drink, or exercise for {formatDisplayDate(selectedDate)}.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {allEntriesForDay.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow duration-200 hover:shadow-md"
              >
                 <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
                   <div className="flex items-center space-x-2 sm:space-x-3">
                     {getEntryIcon(entry)}
                     <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200 capitalize">
                       {entry.type === 'nutrition' ? (entry as NutritionEntry).mealtime || 'Uncategorized' : 'Exercise'}
                     </h3>
                   </div>
                   <div className="flex items-center space-x-2 sm:space-x-3">
                     <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                       <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                       {new Date(entry.time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                     </div>
                     <button
                       onClick={() => entry.type === 'nutrition' ? handleDeleteNutritionClick(entry.id) : handleDeleteExerciseClick(entry.id)}
                       disabled={isDeleting}
                       aria-label={`Delete ${entry.type} entry`}
                       title={`Delete ${entry.type} entry`}
                       className={`p-1 rounded-md text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-colors duration-150 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                         <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                     </button>
                   </div>
                 </div>

                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{entry.description}</p>

                  {entry.type === 'nutrition' && (
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 text-xs">
                       <div className="bg-gray-100 dark:bg-gray-700/50 rounded-md p-2 sm:p-2.5 flex flex-col items-center text-center">
                         <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 mb-0.5"> <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="font-medium text-[11px] sm:text-xs">Calories</span> </div>
                         <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{(entry as NutritionEntry).calories ?? 0}</span> <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">kcal</span>
                       </div>
                       <div className="bg-gray-100 dark:bg-gray-700/50 rounded-md p-2 sm:p-2.5 flex flex-col items-center text-center">
                         <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 mb-0.5"> <TbMeat className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="font-medium text-[11px] sm:text-xs">Protein</span> </div>
                         <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{(entry as NutritionEntry).protein ?? 0}</span> <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">g</span>
                       </div>
                       <div className="bg-gray-100 dark:bg-gray-700/50 rounded-md p-2 sm:p-2.5 flex flex-col items-center text-center">
                         <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mb-0.5"> <Cookie className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="font-medium text-[11px] sm:text-xs">Carbs</span> </div>
                         <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{(entry as NutritionEntry).carbs ?? 0}</span> <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">g</span>
                       </div>
                       <div className="bg-gray-100 dark:bg-gray-700/50 rounded-md p-2 sm:p-2.5 flex flex-col items-center text-center">
                         <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 mb-0.5"> <PiGrains className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="font-medium text-[11px] sm:text-xs">Fat</span> </div>
                         <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{(entry as NutritionEntry).fat ?? 0}</span> <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">g</span>
                       </div>
                       {(entry as NutritionEntry).waterMl != null && (entry as NutritionEntry).waterMl! > 0 && (
                         <div className="bg-gray-100 dark:bg-gray-700/50 rounded-md p-2 sm:p-2.5 flex flex-col items-center text-center col-span-2 sm:col-span-1 md:col-auto">
                           <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 mb-0.5"> <Droplet className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="font-medium text-[11px] sm:text-xs">Water</span> </div>
                           <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{(entry as NutritionEntry).waterMl}</span> <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">ml</span>
                         </div>
                       )}
                    </div>
                  )}

                  {entry.type === 'exercise' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
                        <div className="bg-gray-100 dark:bg-gray-700/50 rounded-md p-2 sm:p-2.5 flex flex-col items-center text-center">
                         <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 mb-0.5"> <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="font-medium text-[11px] sm:text-xs">Calories Burned</span> </div>
                         <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{(entry as ExerciseEntry).caloriesBurned ?? 0}</span> <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">kcal</span>
                       </div>
                       {(entry as ExerciseEntry).duration != null && Number((entry as ExerciseEntry).duration) > 0 && (
                         <div className="bg-gray-100 dark:bg-gray-700/50 rounded-md p-2 sm:p-2.5 flex flex-col items-center text-center">
                           <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 mb-0.5"> <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="font-medium text-[11px] sm:text-xs">Duration</span> </div>
                           <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{(entry as ExerciseEntry).duration}</span> <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">min</span>
                         </div>
                       )}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700/50">
                    <Database className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                    Logged via {entry.source ? entry.source.replace(/_/g, ' ') : 'System'} at{' '}
                    {new Date(entry.createdAt!).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}