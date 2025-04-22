"use client";

import React, { useState, useEffect } from 'react';
import { FaFire } from 'react-icons/fa';

interface StreakData {
    current: number;
    longest: number;
    lastUpdated: string | null;
}

const StreakDisplay: React.FC = () => {
    const [streakData, setStreakData] = useState<StreakData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isStreakActiveToday, setIsStreakActiveToday] = useState<boolean>(false);

    useEffect(() => {
        const fetchStreakData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/streak/water');
                if (!response.ok) {
                    throw new Error(`Failed to fetch streak data: ${response.statusText}`);
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

                        if(lastUpdatedLocalYear === todayLocalYear &&
                           lastUpdatedLocalMonth === todayLocalMonth &&
                           lastUpdatedLocalDate === todayLocalDate) {
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
                setError(err.message || 'Could not load streak information.');
                setStreakData(null);
                setIsStreakActiveToday(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStreakData();
    }, []);

    // Render loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-64 h-20 mx-auto my-4 bg-gray-50 rounded-full shadow-md animate-pulse">
                <p className="text-gray-500">Loading streak...</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="flex items-center justify-center w-64 h-20 mx-auto my-4 bg-red-50 rounded-full shadow-md">
                <p className="text-sm text-red-500">Error: {error}</p>
            </div>
        );
    }

    // Render no data state
    if (!streakData) {
        return (
            <div className="flex items-center justify-center w-64 h-20 mx-auto my-4 bg-gray-50 rounded-full shadow-md">
                <p className="text-gray-500">No streak data available.</p>
            </div>
        );
    }

    // Determine the background gradient based on streak status
    const bgGradient = isStreakActiveToday && streakData.current > 0
        ? 'bg-gradient-to-r from-blue-50 to-blue-100' 
        : 'bg-gradient-to-r from-gray-50 to-gray-100';
    
    // Determine the fire icon color
    const fireColor = isStreakActiveToday && streakData.current > 0 
        ? 'text-amber-500' 
        : 'text-gray-300';

    // Status message
    const statusMessage = isStreakActiveToday && streakData.current > 0 
        ? "Goal met for today!" 
        : (streakData.current > 0 ? "Keep the streak going today!" : "Start your streak today!");

    return (
        <div className={`w-auto px-12 py-2 mx-auto my-4 ${bgGradient} rounded-full shadow-md transition-all hover:bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] duration-300 hover:shadow-lg`}>
          
            
            {/* Current streak with flame icon */}
            <div className="flex items-center justify-center gap-3">
                <FaFire 
                    size={24} 
                    className={`${fireColor} transition-colors duration-300 ${isStreakActiveToday && streakData.current > 0 ? 'animate-pulse' : ''}`}
                    aria-label={isStreakActiveToday && streakData.current > 0 ? 'Streak Active Today' : 'Streak Inactive Today'}
                />
                <span className="text-2xl font-bold text-gray-800">
                    {streakData.current} Day{streakData.current !== 1 ? 's' : ''}
                </span>
            </div>
            
            
            {/* Status message */}
            <p className="mt-2 text-xs italic text-center text-gray-600">
                {statusMessage}
            </p>
        </div>
    );
};

export default StreakDisplay;