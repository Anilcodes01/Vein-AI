"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { useNutrition } from "../../contexts/NutritionContext";
import { useDashboard } from "../../contexts/DashboardContext";
import NutrientCard from "./NutritionCard";
import MotivationalQuote from "./MotivationlQuote";

export default function DashboardComp() {
  const { data: session } = useSession();
  
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refreshData: refreshDashboardData,
  } = useDashboard();

  const {
    nutritionLogs,
    loading: nutritionLoading,
    error: nutritionError,
    selectedDate,
    fetchNutritionData,
  } = useNutrition();

  useEffect(() => {
    const checkScreenSize = () => {};
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const isLoading = dashboardLoading || nutritionLoading;
  const combinedError = dashboardError || nutritionError;

  const currentDayConsumed = useMemo(() => {
    const todayLog = nutritionLogs.find(log => {
        const logDateStr = new Date(log.date).toISOString().split("T")[0];
        return logDateStr === selectedDate;
    });

    if (todayLog) {
      return {
        calories: todayLog.totalCalories || 0,
        protein: todayLog.totalProtein || 0,
        water: todayLog.totalWaterMl || 0,
        carbs: todayLog.totalCarbs || 0,
        fat: todayLog.totalFat || 0,
      };
    }
    return { calories: 0, protein: 0, water: 0, carbs: 0, fat: 0 };
  }, [nutritionLogs, selectedDate]);

  const nutritionalTargets = useMemo(() => {
    if (!dashboardData) {
      return { calories: 0, protein: 0, water: 0, carbs: 0, fat: 0 };
    }
    return {
      calories: dashboardData.calorieIntake || 0,
      protein: dashboardData.proteinIntake || 0,
      water: dashboardData.waterIntake || 0,
      carbs: dashboardData.carbsIntake || 0,
      fat: dashboardData.fatIntake || 0,
    };
  }, [dashboardData]);

  const handleRefreshAllData = () => {
    refreshDashboardData();
    fetchNutritionData(selectedDate);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (combinedError) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="text-red-500 text-center p-4">
            <p>Error loading data: {combinedError}</p>
            <button
                onClick={handleRefreshAllData}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Try Again
            </button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative flex-1 h-full overflow-y-auto bg-[#fcfbf8] md:pl-64 flex flex-col items-center">
      <div className="max-w-4xl w-full rounded-2xl p-4 md:p-8 pt-6 pb-6">
        <div className="flex flex-col items-center justify-center mb-6 md:mb-8">
          <div className="flex lg:mt-16 gap-2 md:gap-4">
            <h1 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-black mb-2">
              Hello, {session?.user.name}
            </h1>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">👋</h1>
          </div>
         <p className="hidden md:block text-base md:text-lg text-gray-700 font-medium text-center">
  Welcome to Vein AI, your personal health and wellness assistant
</p>
           <p className="text-sm text-gray-600 mt-1">
            Showing data for: {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="mb-6">
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            <NutrientCard
              label="Calories"
              iconSrc="/calories.png"
              consumed={currentDayConsumed.calories}
              target={Number(nutritionalTargets.calories)}
              unit="kcal"
              gradientFrom="from-orange-400"
              gradientTo="to-pink-500"
              iconBgColor="bg-orange-100"
            />
            <NutrientCard
              label="Protein"
              iconSrc="/protein.png"
              consumed={currentDayConsumed.protein}
              target={Number(nutritionalTargets.protein)}
              unit="g"
              gradientFrom="from-blue-400"
              gradientTo="to-indigo-500"
              iconBgColor="bg-blue-100"
            />
            <NutrientCard
              label="Water"
              iconSrc="/glass-of-water.png"
              consumed={currentDayConsumed.water}
              target={Number(nutritionalTargets.water)}
              unit="ml"
              gradientFrom="from-cyan-400"
              gradientTo="to-blue-500"
              iconBgColor="bg-cyan-100"
            />
            <NutrientCard
              label="Carbs"
              iconSrc="/carbohydrates.png"
              consumed={currentDayConsumed.carbs}
              target={Number(nutritionalTargets.carbs)}
              unit="g"
              gradientFrom="from-yellow-400"
              gradientTo="to-amber-500"
              iconBgColor="bg-yellow-100"
            />
            <NutrientCard
              label="Fats"
              iconSrc="/trans-fat.png"
              consumed={currentDayConsumed.fat}
              target={Number(nutritionalTargets.fat)}
              unit="g"
              gradientFrom="from-purple-400"
              gradientTo="to-violet-500"
              iconBgColor="bg-purple-100"
            />
          </div>
        </div>

        {/* <div className="mb-6">
          <MotivationalQuote />
        </div> */}
      </div>

      <p className="text-xs text-gray-600 text-center py-4">
        Vein AI - Track your nutrition and wellness journey
      </p>

      <div className="absolute top-4 md:top-8 right-4 md:right-8">
      </div>
    </main>
  );
}