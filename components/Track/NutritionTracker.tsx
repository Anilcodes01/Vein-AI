"use client";
import { NutritionLog, NutritionEntry } from '../../app/lib/types'; 
import ProgressCircle from './ProgressCircle';
import { DailyTotals } from '@/lib/types';
import { NutritionTrackerProps } from '@/lib/types';
import { 
  Utensils, Cookie, Loader2, AlertCircle, 
  FileText, Calendar, Database, Search, 
  Clock, Flame, Droplet, ChevronsRight, Coffee, UtensilsCrossed, Drumstick
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
          const logDateStr = new Date(log.date).toISOString().split('T')[0];
          return logDateStr === selectedDate;
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
  const targetWaterMl = targetWaterLiters * 1000;

  const isOverallLoading = loading || dashboardLoading;
  const overallError = error || dashboardError; 

  const showProgressCircles = !isOverallLoading && !overallError &&
    (targetCalories > 0 || targetProtein > 0 || targetFat > 0 || targetCarbs > 0 || targetWaterMl > 0);

  // Get meal icon based on mealtime
  const getMealIcon = (mealtime: any) => {
    switch(mealtime?.toLowerCase()) {
      case 'breakfast': return <Coffee className="w-4 h-4" />;
      case 'lunch': return <UtensilsCrossed className="w-4 h-4" />;
      case 'dinner': return <Drumstick className="w-4 h-4" />;
      case 'snack': return <Cookie className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (isOverallLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
          <span className="text-gray-500">Loading nutrition data...</span>
        </div>
      </div>
    );
  }

  if (overallError) {
    return (
      <div className="w-full mt-8 p-6 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800/30">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="font-medium">{overallError}</span>
        </div>
      </div>
    );
  }

  const currentLog = nutritionLogs.find(log => {
    const logDateStr = new Date(log.date).toISOString().split('T')[0];
    return logDateStr === selectedDate;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header with date selector */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-medium text-gray-800 dark:text-gray-100">
          Nutrition Tracker
        </h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Date display */}
      <div className="text-center text-gray-600 dark:text-gray-300 text-lg font-light mb-6">
        {formatDisplayDate(selectedDate)}
      </div>

      {/* Progress Circles */}
      {showProgressCircles && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-6 flex items-center">
            <Database className="w-4 h-4 mr-2 text-blue-500" />
            Daily Progress
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            <ProgressCircle value={dailyTotals.calories} maxValue={targetCalories} label="Calories" unit="kcal" color="text-rose-500" />
            <ProgressCircle value={dailyTotals.protein} maxValue={targetProtein} label="Protein" unit="g" color="text-blue-500" />
            <ProgressCircle value={dailyTotals.carbs} maxValue={targetCarbs} label="Carbs" unit="g" color="text-green-500" />
            <ProgressCircle value={dailyTotals.fat} maxValue={targetFat} label="Fat" unit="g" color="text-amber-500" />
            {targetWaterMl > 0 && (
              <ProgressCircle value={dailyTotals.water} maxValue={targetWaterMl} label="Water" unit="ml" color="text-cyan-500" />
            )}
          </div>
        </div>
      )}

      {/* No Goals Set Message */}
      {!showProgressCircles && !isOverallLoading && !overallError && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Database className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">No Nutrition Goals Set</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">Set your nutritional goals in your profile to track your daily progress here.</p>
        </div>
      )}

      {/* Meal entries section */}
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          Today's Entries
        </h2>

        {/* No Entries Message */}
        {(!currentLog || currentLog.entries.length === 0) && !loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">No Entries Found</h3>
            <p className="text-gray-500 dark:text-gray-400">No nutrition entries found for {formatDisplayDate(selectedDate)}.</p>
          </div>
        ) : (
          // Nutrition Entries List
          currentLog && currentLog.entries.length > 0 && (
            <div className="space-y-4">
              {currentLog.entries.map((entry: NutritionEntry) => (
                <div 
                  key={entry.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        {getMealIcon(entry.mealtime)}
                      </div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                        {entry.mealtime || 'Uncategorized'}
                      </h3>
                    </div>
                    <div className="ml-auto flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(entry.time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{entry.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center text-rose-500 mb-1">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Calories</div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{entry.calories ?? 0}</div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center text-blue-500 mb-1">
                          <TbMeat className="w-4 h-4" />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Protein</div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{entry.protein ?? 0}g</div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center text-green-500 mb-1">
                          <Cookie className="w-4 h-4" />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Carbs</div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{entry.carbs ?? 0}g</div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center text-amber-500 mb-1">
                          <PiGrains className="w-4 h-4" />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Fat</div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{entry.fat ?? 0}g</div>
                      </div>
                      
                      {entry.waterMl != null && entry.waterMl > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                          <div className="flex items-center justify-center text-cyan-500 mb-1">
                            <Droplet className="w-4 h-4" />
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Water</div>
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{entry.waterMl}ml</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center mt-2">
                      <Database className="w-3 h-3 mr-1" />
                      Added via {entry.source ? entry.source.replace(/_/g, ' ') : 'Unknown'} at{' '}
                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}