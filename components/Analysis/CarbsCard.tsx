"use client";
import React from "react";
import { useInsights } from "@/contexts/InsightsContext";
import ApexChart from "./DynamicApexCharts";
import { ApexOptions } from "apexcharts";

export default function CarbsCard() {
     const { data, loading, error, viewMode, range: contextRange } = useInsights();

     const renderContent = () => {
        if (viewMode !== 'Nutrition') {
            return <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-500">Select 'Nutrition' view for Carbs details.</p></div>;
        }
        if (loading) {
            return <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-500">Loading Carbs...</p></div>;
        }
        if (error) {
            return <div className="flex items-center justify-center h-full"><p className="text-sm text-red-500">Error: {error}</p></div>;
        }
        if (!data || !data.values.carbs || data.values.carbs.length === 0) {
            return <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-500">No Carbs data available.</p></div>;
        }

        const averageCarbs = data.averages.carbs.toFixed(0);
        
        let rangeDescription = "Average";
        if (contextRange === 'weekly') rangeDescription = "Last 7 Days";
        else if (contextRange === 'monthly') rangeDescription = "This Month";
        else if (contextRange === 'yearly') rangeDescription = "This Year";


        // Percentage change calculation would require previous period data
        // For now, it's a placeholder idea.
        // const percentageChange = "+10%"; // Example
        // const percentageColor = "text-green-500"; // Example

        const chartOptions: ApexOptions = {
            chart: {
                type: 'bar',
                height: '100%',
                width: '100%',
                toolbar: { show: false },
                 animations: {
                    enabled: true, // Keep animations for a smoother feel
                }
                // sparkline: { enabled: true }, // Crucial for minimalist appearance
            },
            plotOptions: {
                bar: {
                    columnWidth: '65%', // Adjust for bar thickness vs. gap
                    borderRadius: 0,    // Sharp corners as in image
                    dataLabels: {
                        position: 'top', // Ensure data labels are at the top
                    },
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function() {
                    // Custom HTML for the top line. Width is relative to the data label container.
                    return `<div style="height:1.5px; width:100%; background-color:#AEAAA2; margin:0 auto;"></div>`;
                },
                offsetY: -6, // Adjust this to position the line perfectly on the bar top
                style: {
                    // These are for text, which we don't have here, but good to set
                    fontSize: '1px',
                    colors: ["transparent"],
                },
                dropShadow: { enabled: false },
            },
            stroke: { 
                width: 0, // No outline/stroke on the bars themselves
            },
            fill: {
                colors: ['#f4f0e8'], // Light beige for the bar fill (from image)
                opacity: 1,
            },
            xaxis: {
                categories: data.labels,
                labels: {
                    show: true, // Ensure X-axis labels are shown
                    style: {
                        colors: ['#B0A18B'], // Brownish color for "Mon", "Tue" (from image)
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        fontWeight: 500,
                    },
                      offsetY: 2,
                },
                axisBorder: { show: false },
                axisTicks: { show: false },
                tooltip: { enabled: false }, // No tooltip on x-axis items
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
        const series = [{ name: 'Carbs', data: data.values.carbs }];

        return (
            <div className="w-full h-full flex flex-col"> {/* Main content wrapper */}
                {/* Text Section */}
                <div>
                    <p className="text-xs text-[#7f786a] font-medium">Carbs Intake</p>
                    <h2 className="text-3xl font-bold text-[#3a352f] my-0.5">{averageCarbs} g</h2>
                    <p className="text-xs text-[#a99667]">
                        {rangeDescription}
                       
                    </p>
                </div>

                {/* Chart Section */}
                <div className="mt-3 flex-grow" style={{ minHeight: '100px' }}> {/* Chart container, adjust minHeight */}
                    <ApexChart options={chartOptions} series={series} type="bar" height="100%" width="100%" />
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:h-[44vh] justify-between p-4 border  rounded-2xl border-[#ece5d6] items-center">
            {renderContent()}
        </div>
    );
}