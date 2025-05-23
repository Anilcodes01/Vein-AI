import React, { useState } from "react";

export default function FilterButtons() {
    const [viewMode, setViewMode] = useState("Nutrition");
    const [timeFrame, setTimeFrame] = useState("Month");

    return <div className="flex  flex-col">
  <div className="flex gap-10  lg:ml-12 border-b border-gray-100 mt-4 font-bold">
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

         <div className="flex justify-around lg:ml-16 p-1 rounded-2xl bg-[#f4f0e7] mt-4 font-bold">
          <button
            onClick={() => setTimeFrame("Week")}
            className={`${
              timeFrame === "Week"
                ? "bg-white shadow-xs text-black border-[#f3c652]"
                : "border-none text-[#9a844b]"
            } w-full rounded-2xl cursor-pointer py-2 transition duration-300`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeFrame("Month")}
            className={`${
              timeFrame === "Month"
                ? "bg-white shadow-xs text-black border-[#f3c652]"
                : "border-none text-[#9a844b]"
            } w-full  rounded-2xl cursor-pointer py-2 transition duration-300`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeFrame("Year")}
            className={`${
              timeFrame === "Year"
                ? "bg-white shadow-xs text-black border-[#f3c652]"
                : "border-none text-[#9a844b]"
            } w-full  rounded-2xl cursor-pointer py-2 transition duration-300`}
          >
            Year
          </button>
        </div>
    </div>
}