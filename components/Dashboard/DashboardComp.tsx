"use client";
import { useDashboard } from "../../contexts/DashboardContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StreakDisplay from "../Community/Streak";

export default function DashboardComp() {
  const { data: session } = useSession();
  const { data, loading, error, refreshData } = useDashboard();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] md:pl-64   md:pt-0 items-center pt-12 md:justify-center min-h-screen  md:p-6">
      <div className="max-w-4xl w-full rounded-2xl p-4 md:p-8">
        <div className="flex flex-col items-center justify-center mb-6 md:mb-8">
          <div className="flex gap-2 md:gap-4">
            <h1 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
              Hello, {session?.user.name}
            </h1>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">👋</h1>
          </div>
          <p className="text-base md:text-lg text-gray-700 font-medium text-center">
            Welcome to Vein AI, your personal health and wellness assistant
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg md:text-xl text-center font-semibold text-gray-800 mb-4">
            Today's Nutrition Overview
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
            {/* Calories Card */}
            <div className="transform hover:scale-105 transition-transform duration-300 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-orange-400 to-pink-500 h-2"></div>
              <div className="p-3 md:p-4 flex flex-col items-center">
                <div className="p-2 md:p-3 bg-orange-100 rounded-full mb-2 md:mb-3">
                  <img
                    src="/calories.png"
                    height={24}
                    width={24}
                    alt="Calories"
                    className="h-5 w-5 md:h-6 md:w-6"
                  />
                </div>
                <p className="text-xl md:text-3xl font-bold text-gray-800">
                  {data.calorieIntake}
                  <span className="text-sm md:text-lg">K</span>
                </p>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                  Calories
                </p>
              </div>
            </div>

            {/* Protein Card */}
            <div className="transform hover:scale-105 transition-transform duration-300 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2"></div>
              <div className="p-3 md:p-4 flex flex-col items-center">
                <div className="p-2 md:p-3 bg-blue-100 rounded-full mb-2 md:mb-3">
                  <img
                    src="/protein.png"
                    height={24}
                    width={24}
                    alt="Protein"
                    className="h-5 w-5 md:h-6 md:w-6"
                  />
                </div>
                <p className="text-xl md:text-3xl font-bold text-gray-800">
                  {data.proteinIntake}
                  <span className="text-sm md:text-lg">g</span>
                </p>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                  Protein
                </p>
              </div>
            </div>

            {/* Water Card */}
            <div className="transform hover:scale-105 transition-transform duration-300 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2"></div>
              <div className="p-3 md:p-4 flex flex-col items-center">
                <div className="p-2 md:p-3 bg-blue-100 rounded-full mb-2 md:mb-3">
                  <img
                    src="/glass-of-water.png"
                    height={24}
                    width={24}
                    alt="Water"
                    className="h-5 w-5 md:h-6 md:w-6"
                  />
                </div>
                <p className="text-xl md:text-3xl font-bold text-gray-800">
                  {data.waterIntake}
                  <span className="text-sm md:text-lg">ml</span>
                </p>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                  Water
                </p>
              </div>
            </div>

            {/* Carbs Card */}
            <div className="transform hover:scale-105 transition-transform duration-300 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2"></div>
              <div className="p-3 md:p-4 flex flex-col items-center">
                <div className="p-2 md:p-3 bg-amber-100 rounded-full mb-2 md:mb-3">
                  <img
                    src="/carbohydrates.png"
                    height={24}
                    width={24}
                    alt="Carbs"
                    className="h-5 w-5 md:h-6 md:w-6"
                  />
                </div>
                <p className="text-xl md:text-3xl font-bold text-gray-800">
                  {data.carbsIntake}
                  <span className="text-sm md:text-lg">g</span>
                </p>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                  Carbs
                </p>
              </div>
            </div>

            {/* Fat Card */}
            <div className="transform hover:scale-105 transition-transform duration-300 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 col-span-2 md:col-span-1">
              <div className="bg-gradient-to-r from-purple-400 to-violet-500 h-2"></div>
              <div className="p-3 md:p-4 flex flex-col items-center">
                <div className="p-2 md:p-3 bg-purple-100 rounded-full mb-2 md:mb-3">
                  <img
                    src="/trans-fat.png"
                    height={24}
                    width={24}
                    alt="Fat"
                    className="h-5 w-5 md:h-6 md:w-6"
                  />
                </div>
                <p className="text-xl md:text-3xl font-bold text-gray-800">
                  {data.fatIntake}
                  <span className="text-sm md:text-lg">g</span>
                </p>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                  Fats
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Button Container: Hidden on mobile (default), flex row on medium screens and up */}
        <div className="hidden md:flex md:flex-row justify-center gap-3 md:gap-4 mt-6">
          <button
            onClick={() => router.push("/reports")}
            className="px-4 md:px-6 cursor-pointer py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg transition-shadow duration-300"
          >
            View Detailed Report
          </button>
          <button
            onClick={refreshData}
            className="px-4 md:px-6 cursor-pointer py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white font-medium rounded-full hover:shadow-lg transition-shadow duration-300"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-4">
        Vein AI - Track your nutrition and wellness journey
      </p>

      <div className=" absolute top-0 right-8 mt-16">
        <StreakDisplay />
       </div>
    </div>
  );
}