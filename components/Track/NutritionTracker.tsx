"use client";
import { NutritionLog, NutritionEntry } from '../../app/lib/types';
import ProgressCircle from './ProgressCircle';
import { DailyTotals } from '@/lib/types';
import { NutritionTrackerProps } from '@/lib/types';
import {
  Utensils, Cookie, Loader2, AlertCircle,
  Calendar, Database, Search,
  Clock, Flame, Droplet, Coffee, UtensilsCrossed, Drumstick
} from 'lucide-react';
import { TbMeat } from "react-icons/tb";
import { PiGrains } from "react-icons/pi";


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


  const calculateDailyTotals = (logs: NutritionLog[]): DailyTotals => {
      const todayLogs = logs.filter(log => {

          try {
              const logDateLocal = new Date(log.date).toLocaleDateString();
              const selectedDateLocal = new Date(selectedDate + 'T00:00:00').toLocaleDateString();
              return logDateLocal === selectedDateLocal;
          } catch {

              const logDateStr = new Date(log.date).toISOString().split('T')[0];
              return logDateStr === selectedDate;
          }
      });

      return todayLogs.reduce(
          (totals, log) => {
              log.entries.forEach((entry: NutritionEntry) => {
                  totals.calories += entry.calories || 0;
                  totals.protein += entry.protein || 0;
                  totals.fat += entry.fat || 0;
                  totals.carbs += entry.carbs || 0;
                  totals.water += entry.waterMl || 0;
              });
              return totals;
          },
          { calories: 0, protein: 0, fat: 0, carbs: 0, water: 0 }
      );
  };

  const dailyTotals = calculateDailyTotals(nutritionLogs);


  const targetCalories = parseFloat(dashboardData?.calorieIntake as string || '0') || 0;
  const targetProtein = parseFloat(dashboardData?.proteinIntake as string || '0') || 0;
  const targetFat = parseFloat(dashboardData?.fatIntake as string || '0') || 0;
  const targetCarbs = parseFloat(dashboardData?.carbsIntake as string || '0') || 0;

  const targetWaterLiters = parseInt(dashboardData?.waterIntake as string || '0', 10) || 0;
  const targetWaterMl = targetWaterLiters ;


  const isOverallLoading = loading || dashboardLoading;
  const overallError = error || dashboardError;

  const showProgressCircles = !isOverallLoading && !overallError &&
    (targetCalories > 0 || targetProtein > 0 || targetFat > 0 || targetCarbs > 0 || targetWaterMl > 0);


  const getMealIcon = (mealtime: any) => {
    switch(mealtime?.toLowerCase()) {
      case 'breakfast': return <Coffee className="w-5 h-5 text-orange-500" />;
      case 'lunch': return <UtensilsCrossed className="w-5 h-5 text-green-500" />;
      case 'dinner': return <Drumstick className="w-5 h-5 text-purple-500" />;
      case 'snack': return <Cookie className="w-5 h-5 text-yellow-500" />;
      default: return <Utensils className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDisplayDate = (dateString: string): string => {
      const date = new Date(dateString + 'T00:00:00');
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
  };



  if (isOverallLoading) {
    return (
      <div className="flex justify-center items-center h-64 w-4xl ml-36 mx-auto mt-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <span className="text-gray-600 dark:text-gray-400">Loading nutrition data...</span>
        </div>
      </div>
    );
  }

  if (overallError) {
    return (
      <div className="w-4xl ml-36 mx-auto mt-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700/50">
        <div className="flex items-start text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <div>
             <h3 className="font-semibold mb-1">Error Loading Data</h3>
             <p className="text-sm">{overallError}</p>
          </div>
        </div>
      </div>
    );
  }


  const currentLog = nutritionLogs.find(log => {
     try {
        const logDateLocal = new Date(log.date).toLocaleDateString();
        const selectedDateLocal = new Date(selectedDate + 'T00:00:00').toLocaleDateString();
        return logDateLocal === selectedDateLocal;
     } catch {
        const logDateStr = new Date(log.date).toISOString().split('T')[0];
        return logDateStr === selectedDate;
     }
  });

  return (

    <div className="w-4xl ml-36  mx- px-0 md:px-4 py-6 space-y-8">

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <h1 className="text-2xl font-medium text-gray-800 dark:text-gray-100">
          Nutrition Tracker
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
            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm text-gray-700 dark:text-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div className="text-center text-gray-600 dark:text-gray-300 text-lg font-light mb-6">
        {formatDisplayDate(selectedDate)}
      </div>


      {showProgressCircles && (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700/50">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            Daily Summary
          </h2>
          <div className="flex flex-wrap justify-around gap-x-4 gap-y-6">
            {targetCalories > 0 && <ProgressCircle value={dailyTotals.calories} maxValue={targetCalories} label="Calories" unit="kcal" color="text-rose-500" />}
            {targetProtein > 0 && <ProgressCircle value={dailyTotals.protein} maxValue={targetProtein} label="Protein" unit="g" color="text-blue-500" />}
            {targetCarbs > 0 && <ProgressCircle value={dailyTotals.carbs} maxValue={targetCarbs} label="Carbs" unit="g" color="text-green-500" />}
            {targetFat > 0 && <ProgressCircle value={dailyTotals.fat} maxValue={targetFat} label="Fat" unit="g" color="text-amber-500" />}
            {targetWaterMl > 0 && <ProgressCircle value={dailyTotals.water} maxValue={targetWaterMl} label="Water" unit="ml" color="text-cyan-500" />}
          </div>
        </div>
      )}


      {!showProgressCircles && !isOverallLoading && !overallError && (
         <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow p-6 text-center border border-gray-200 dark:border-gray-700/50">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Database className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Set Your Goals</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm">Track your progress against daily targets. Set your calorie, macro, and water goals in your Profile to enable the summary view.</p>

        </div>
      )}


      <div>
      <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          Today's Entries
        </h2>


        {(!currentLog || currentLog.entries.length === 0) ? (
          <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow p-8 text-center border border-gray-200 dark:border-gray-700/50">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">No Entries Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Use the input above to log your first meal or drink for {formatDisplayDate(selectedDate)}.</p>
          </div>
        ) : (

          <div className="space-y-4">
            {currentLog.entries.map((entry: NutritionEntry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow duration-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
                   <div className="flex items-center space-x-3">
                     {getMealIcon(entry.mealtime)}
                     <h3 className="font-semibold text-base text-gray-800 dark:text-gray-200 capitalize">
                       {entry.mealtime || 'Uncategorized'}
                     </h3>
                   </div>
                   <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                     <Clock className="w-3.5 h-3.5 mr-1.5" />
                     {new Date(entry.time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                   </div>
                 </div>

                <div className="p-4 space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{entry.description}</p>


                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">

                       <div className="bg-gray-100 dark:bg-gray-700/50 rounded-md p-2.5 flex flex-col items-center">
                         <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 mb-0.5">
                           <Flame className="w-3.5 h-3.5" />
                           <span className="font-medium">Calories</span>
                         </div>
                         <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{entry.calories ?? 0}</span>
                         <span className="text-gray-500 dark:text-gray-400">kcal</span>
                       </div>

                       <div className="bg-gray-100 dark:bg-gray-700/50 rounded-md p-2.5 flex flex-col items-center">
                         <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 mb-0.5">
                           <TbMeat className="w-3.5 h-3.5" />
                           <span className="font-medium">Protein</span>
                         </div>
                         <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{entry.protein ?? 0}</span>
                          <span className="text-gray-500 dark:text-gray-400">g</span>
                       </div>

                       <div className="bg-gray-100 dark:bg-gray-700/50 rounded-md p-2.5 flex flex-col items-center">
                         <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mb-0.5">
                           <Cookie className="w-3.5 h-3.5" />
                           <span className="font-medium">Carbs</span>
                         </div>
                         <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{entry.carbs ?? 0}</span>
                          <span className="text-gray-500 dark:text-gray-400">g</span>
                       </div>

                       <div className="bg-gray-100 dark:bg-gray-700/50 rounded-md p-2.5 flex flex-col items-center">
                         <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 mb-0.5">
                           <PiGrains className="w-3.5 h-3.5" />
                           <span className="font-medium">Fat</span>
                         </div>
                         <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{entry.fat ?? 0}</span>
                          <span className="text-gray-500 dark:text-gray-400">g</span>
                       </div>

                       {entry.waterMl != null && entry.waterMl > 0 && (
                         <div className="bg-gray-100 dark:bg-gray-700/50 rounded-md p-2.5 flex flex-col items-center col-span-2 sm:col-span-1">
                           <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 mb-0.5">
                             <Droplet className="w-3.5 h-3.5" />
                             <span className="font-medium">Water</span>
                           </div>
                           <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{entry.waterMl}</span>
                           <span className="text-gray-500 dark:text-gray-400">ml</span>
                         </div>
                       )}
                    </div>


                  <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center pt-2 border-t border-gray-100 dark:border-gray-700/50">
                    <Database className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    Logged via {entry.source ? entry.source.replace(/_/g, ' ') : 'System'} at{' '}
                    {new Date(entry.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
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