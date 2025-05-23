"use client"; // Add this line
import AllCard from "./AllCards"; // Or AllCard.tsx, ensure consistency
import FilterButtons from "./FilterButtons";
import Header from "./Header";

export default function AnalysisComp() {
    return (
        <div className="flex w-full flex-col bg-[#fcfbf8] lg:pl-64 lg:mr-8 overflow-y-auto hide-scrollbar p-4 mb-16 lg:mb-0  lg:p-6">
            <div className="lg:ml-12">
                <Header />
            </div>
            <div>
                <FilterButtons />
            </div>
            <div>
                <AllCard /> {/* This renders client components that use the context */}
            </div>
        </div>
    );
}