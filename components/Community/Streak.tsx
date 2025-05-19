"use client";

import React, { useState, useEffect } from "react";
import { FaFire } from "react-icons/fa";

interface StreakData {
  current: number;
  longest: number;
  lastUpdated: string | null;
}

const StreakDisplay: React.FC = () => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isStreakActiveToday, setIsStreakActiveToday] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchStreakData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/streak/water");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch streak data: ${response.statusText}`
          );
        }
        const data: StreakData = await response.json();
        setStreakData(data);

        if (data.lastUpdated) {
          try {
            const lastUpdatedDate = new Date(data.lastUpdated);
            const startOfTodayLocal = new Date();
            startOfTodayLocal.setHours(0, 0, 0, 0);

            const lastUpdatedLocalYear = lastUpdatedDate.getFullYear();
            const lastUpdatedLocalMonth = lastUpdatedDate.getMonth();
            const lastUpdatedLocalDate = lastUpdatedDate.getDate();

            const todayLocalYear = startOfTodayLocal.getFullYear();
            const todayLocalMonth = startOfTodayLocal.getMonth();
            const todayLocalDate = startOfTodayLocal.getDate();

            if (
              lastUpdatedLocalYear === todayLocalYear &&
              lastUpdatedLocalMonth === todayLocalMonth &&
              lastUpdatedLocalDate === todayLocalDate
            ) {
              setIsStreakActiveToday(true);
            } else {
              setIsStreakActiveToday(false);
            }
          } catch (parseError) {
            console.error("Error parsing lastUpdated date:", parseError);
            setIsStreakActiveToday(false);
          }
        } else {
          setIsStreakActiveToday(false);
        }
      } catch (err: any) {
        console.error("Error fetching streak:", err);
        setError(err.message || "Could not load streak information.");
        setStreakData(null);
        setIsStreakActiveToday(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreakData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full min-w-[16rem] h-20 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl shadow-md animate-pulse">
        <p className="text-gray-500 dark:text-gray-300">Loading streak...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full min-w-[16rem] h-20 bg-red-50/50 dark:bg-red-800/50 rounded-xl shadow-md">
        <p className="text-sm text-red-600 dark:text-red-300 p-2 text-center">Error: {error}</p>
      </div>
    );
  }

  if (!streakData) {
    return (
      <div className="flex items-center justify-center w-full min-w-[16rem] h-20 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl shadow-md">
        <p className="text-gray-500 dark:text-gray-300">No streak data available.</p>
      </div>
    );
  }

  const bgGradient =
    isStreakActiveToday && streakData.current > 0
      ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-800/30 dark:to-blue-700/30"
      : "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-600/30";

  const fireColor =
    isStreakActiveToday && streakData.current > 0
      ? "text-amber-500"
      : "text-gray-400 dark:text-gray-500";

  return (
    <div
      className={`w-full px-4 py-3 ${bgGradient} rounded-xl shadow-md transition-all hover:shadow-lg duration-300`}
    >
      <div className="flex items-center justify-center gap-3">
        <FaFire
          size={24}
          className={`${fireColor} transition-colors duration-300 ${
            isStreakActiveToday && streakData.current > 0 ? "animate-pulse" : ""
          }`}
          aria-label={
            isStreakActiveToday && streakData.current > 0
              ? "Streak Active Today"
              : "Streak Inactive Today"
          }
        />
        <span className="text-xl text-gray-800 dark:text-gray-200">
          {streakData.current} Day{streakData.current !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
};

export default StreakDisplay;