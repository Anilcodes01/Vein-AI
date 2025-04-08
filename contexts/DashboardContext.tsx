"use client";
import { createContext, ReactNode, useState, useEffect, useContext } from "react";
import { DashboardData, DashboardContextType } from "@/lib/types";
import { useSession } from "next-auth/react";
import axios from "axios";

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData>({
    calorieIntake: "",
    proteinIntake: "",
    fatIntake: "",
    waterIntake: "",
    carbsIntake: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchData = async (forceRefresh = false) => {
    if (!session) return;

    // Cache duration: 5 minutes (300000 ms)
    const cacheDuration = 5 * 60 * 1000;
    const now = Date.now();
    
    // Skip if data was recently fetched and not forcing refresh
    if (!forceRefresh && now - lastFetchTime < cacheDuration) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("/api/dash-data");
      const responseData = res.data.data || {};

      setData({
        calorieIntake: responseData.calorieIntake || "",
        proteinIntake: responseData.proteinIntake || "",
        waterIntake: responseData.waterIntake || "",
        fatIntake: responseData.fatIntake || "",
        carbsIntake: responseData.carbohydrateIntake || ""
      });
      setError(null);
      setLastFetchTime(now); // Update last fetch time
    } catch (error) {
      console.error("Error while fetching user Data...!", error);
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on mount and when session changes
  useEffect(() => {
    fetchData();
  }, [session]);

  return (
    <DashboardContext.Provider 
      value={{ 
        data, 
        loading, 
        error, 
        refreshData: () => fetchData(true) // Force refresh when manually triggered
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}