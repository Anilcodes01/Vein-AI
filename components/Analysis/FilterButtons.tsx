"use client";
import React from "react";
import { useInsights } from "@/contexts/InsightsContext"; // Adjust path as needed

export default function FilterButtons() {
    const { viewMode, setViewMode, range, setRange: setContextRange } = useInsights();

    // Helper to map context range (lowercase) to button text (TitleCase)
    const getButtonTimeFrame = (apiRange: string) => {
        if (apiRange === 'weekly') return 'Week';
        if (apiRange === 'monthly') return 'Month';
        if (apiRange === 'yearly') return 'Year';
        return 'Week'; // Default
    }
    
    const currentTimeFrame = getButtonTimeFrame(range);


    return (
    <div className="flex  flex-col">
        <div className="flex gap-10 text-sm lg:text-base lg:ml-12 border-b border-gray-100 mt-4 font-bold">
            <button
                onClick={() => setViewMode("Overview")}
                className={`${
                viewMode === "Overview"
                    ? "border-b-4 text-black border-[#f3c652]"
                    : "border-none text-[#9a844b]"
                } cursor-pointer py-2 transition duration-300`}
            >
                Overview
            </button>
            <button
                onClick={() => setViewMode("Nutrition")}
                className={`${
                viewMode === "Nutrition"
                    ? "border-b-4 text-black border-[#f3c652]"
                    : "border-none text-[#9a844b]"
                } cursor-pointer py-2 transition duration-300`}
            >
                Nutrition
            </button>
            <button
                onClick={() => setViewMode("Activity")}
                className={`${
                viewMode === "Activity"
                    ? "border-b-4 text-black border-[#f3c652]"
                    : "border-none text-[#9a844b]"
                } cursor-pointer py-2 transition duration-300`}
            >
                Activity
            </button>
            </div>

            <div className="flex justify-around lg:ml-16 p-1 lg:text-base text-sm rounded-2xl bg-[#f4f0e7] mt-4 font-bold">
            <button
                onClick={() => setContextRange("Week")} // Pass 'Week', context will handle 'weekly'
                className={`${
                currentTimeFrame === "Week"
                    ? "bg-white shadow-xs text-black border-[#f3c652]"
                    : "border-none text-[#9a844b]"
                } w-full rounded-2xl cursor-pointer py-2 transition duration-300`}
            >
                Week
            </button>
            <button
                onClick={() => setContextRange("Month")}
                className={`${
                currentTimeFrame === "Month"
                    ? "bg-white shadow-xs text-black border-[#f3c652]"
                    : "border-none text-[#9a844b]"
                } w-full  rounded-2xl cursor-pointer py-2 transition duration-300`}
            >
                Month
            </button>
            <button
                onClick={() => setContextRange("Year")}
                className={`${
                currentTimeFrame === "Year"
                    ? "bg-white shadow-xs text-black border-[#f3c652]"
                    : "border-none text-[#9a844b]"
                } w-full  rounded-2xl cursor-pointer py-2 transition duration-300`}
            >
                Year
            </button>
            </div>
        </div>
    );
}