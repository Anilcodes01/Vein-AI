"use client"; 

import Sidebar from "@/components/Landing/Sidebar"; 
import DashboardComp from "@/components/Dashboard/DashboardComp";
import Appbar from "@/components/Landing/Appbar";  
import ReportComp from "@/components/Report/ReportComp";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50"> 
      <Appbar /> 
      <div className="flex flex-1 relative overflow-hidden"> 
        <Sidebar />
        <ReportComp />
      </div>
    </div>
  );
}