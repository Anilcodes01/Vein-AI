"use client";

import React, { useState, useEffect } from "react";
import StreakDisplay from "@/components/Community/Streak";
import Users from "@/components/Community/Users";
import Appbar from "@/components/Landing/Appbar";
import Sidebar from "@/components/Landing/Sidebar";

function useLocalStorage(key: string, initialValue: any) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          setStoredValue(
            event.newValue ? JSON.parse(event.newValue) : initialValue
          );
        } catch (error) {
          console.error(error);
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    try {
      const item = window.localStorage.getItem(key);
      const currentValue = item ? JSON.parse(item) : initialValue;
      if (JSON.stringify(currentValue) !== JSON.stringify(storedValue)) {
        setStoredValue(currentValue);
      }
    } catch (error) {
      console.error(error);
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, initialValue, storedValue]);

  return storedValue;
}

const PageContent = () => {
  const sidebarCollapsed = useLocalStorage("sidebarCollapsed", false);

  const mainContentPaddingLeft = sidebarCollapsed ? "md:pl-20" : "md:pl-64";

  return (
    <main
      className={`flex-grow pt-16 ${mainContentPaddingLeft} transition-all duration-300 ease-in-out`}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <div className="w-full xl:flex-grow">
            <Users />
          </div>

          <div className="w-full xl:w-72 xl:flex-shrink-0 mt-6 xl:mt-0">
            <div className="xl:sticky xl:top-[calc(4rem+1rem)] bg-white/30 dark:bg-gray-900/30 backdrop-blur-md border border-white/40 dark:border-gray-700/50 p-4 rounded-xl shadow-lg">
              <StreakDisplay />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default function CommunityPage() {
  return (
    <div className="flex flex-col bg-[#fcfbf8] dark:from-gray-800 dark:to-slate-900 min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Appbar />
      </div>

      <Sidebar />

      <PageContent />
    </div>
  );
}
