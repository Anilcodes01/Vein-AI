"use client";
import React from "react";
import { useInsights } from "@/contexts/InsightsContext";
import ApexChart from "./DynamicApexCharts"; // Corrected import name if needed
import { ApexOptions } from "apexcharts";

export default function CalorieCard() {
    const { data, loading, error, viewMode, range: contextRange } = useInsights();

    const renderContent = () => {
        if (viewMode !== 'Nutrition') {
            return <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-500">Select 'Nutrition' view for calorie details.</p></div>;
        }
        if (loading) {
            return <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-500">Loading Calories...</p></div>;
        }
        if (error) {
            return <div className="flex items-center justify-center h-full"><p className="text-sm text-red-500">Error: {error}</p></div>;
        }
        if (!data || !data.values.calories || data.values.calories.length === 0) {
            return <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-500">No calorie data available.</p></div>;
        }

        // console.log("Data for Calorie Card:", data); // For debugging labels

        const averageCalories = data.averages.calories.toFixed(0);
        
        let rangeDescription = "Average";
        if (contextRange === 'weekly') rangeDescription = "Last 7 Days";
        else if (contextRange === 'monthly') rangeDescription = "This Month";
        else if (contextRange === 'yearly') rangeDescription = "This Year";

        const chartOptions: ApexOptions = {
            chart: {
                type: 'bar',
                height: '100%',
                width: '100%',
                toolbar: { show: false },
                // sparkline: { enabled: true }, // REMOVE OR SET TO FALSE
                animations: {
                    enabled: true, // Keep animations for a smoother feel
                }
            },
            plotOptions: {
                bar: {
                    columnWidth: '65%',
                    borderRadius: 0,    
                    dataLabels: {
                        position: 'top', 
                    },
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function() {
                    return `<div style="height:1.5px; width:100%; background-color:#AEAAA2; margin:0 auto;"></div>`;
                },
                offsetY: -6, 
                style: {
                    fontSize: '1px',
                    colors: ["transparent"],
                },
                dropShadow: { enabled: false },
            },
            stroke: { 
                width: 0, 
            },
            fill: {
                colors: ['#f4f0e8'], 
                opacity: 1,
            },
            xaxis: {
                categories: data.labels, // Ensure data.labels is populated correctly
                labels: {
                    show: true, 
                    style: {
                        colors: ['#B0A18B'], 
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        fontWeight: 500, // Make them slightly bolder if needed
                    },
                    offsetY: 2, // Small offset to adjust vertical position if needed
                },
                axisBorder: { show: false },
                axisTicks: { show: false },
                tooltip: { enabled: false }, 
            },
            yaxis: { 
                show: false,
                labels: { show: false }, // Explicitly hide y-axis labels
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            grid: { 
                show: false,
                padding: { // Add padding to ensure labels are not cut off
                    top: 10, // Space for data labels line
                    right: 0,
                    bottom: 0, // Space for x-axis labels if needed
                    left: 0,
                }
            },
            tooltip: {
                enabled: true,
                y: { formatter: (val) => `${val.toFixed(0)} kcal` },
                style: { fontSize: '12px', fontFamily: 'inherit' },
                theme: 'light',
                custom: function({series, seriesIndex, dataPointIndex, w}) {
                    const val = w.globals.series[seriesIndex][dataPointIndex];
                    return `<div class="px-2.5 py-1.5 bg-white shadow-md rounded-md text-xs font-medium text-gray-700 border border-gray-200">` +
                           `${val.toFixed(0)} kcal` +
                           `</div>`;
                }
            },
            legend: {
                show: false // Explicitly hide legend
            },
        };
        const series = [{ name: 'Calories', data: data.values.calories }];

        return (
            <div className="w-full h-full flex flex-col">
                <div>
                    <p className="text-xs text-[#7f786a] font-medium">Calorie Intake</p>
                    <h2 className="text-3xl font-bold text-[#3a352f] my-0.5">{averageCalories} kcal</h2>
                    <p className="text-xs text-[#a99667]">
                        {rangeDescription}
                    </p>
                </div>
                <div className="mt-3 flex-grow" style={{ minHeight: '100px' }}>
                    <ApexChart options={chartOptions} series={series} type="bar" height="100%" width="100%" />
                </div>
            </div>
        );
    };
    
    return (
        // Removed bg color from here to let child text content dictate it, border for card outline
        <div className="p-4 border lg:h-[44vh] rounded-2xl border-[#e0dbd1] " > 
           {renderContent()}
        </div>
    );
}