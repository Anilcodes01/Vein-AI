"use client";
import React from "react";
import { useInsights } from "@/contexts/InsightsContext";
import ApexChart from "./DynamicApexCharts"; // Ensure this matches your filename
import { ApexOptions } from "apexcharts";

export default function WaterCard() {
    const { data, loading, error, viewMode, range: contextRange } = useInsights();

    const renderContent = () => {
        if (viewMode !== 'Nutrition') {
            return <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-500">Select 'Nutrition' view for water details.</p></div>;
        }
        if (loading) {
            return <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-500">Loading Water...</p></div>;
        }
        if (error) {
            return <div className="flex items-center justify-center h-full"><p className="text-sm text-red-500">Error: {error}</p></div>;
        }
        if (!data || !data.values.water || data.values.water.length === 0) {
            return <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-500">No water data available.</p></div>;
        }

        const averageWater = data.averages.water.toFixed(0); // Display average, toFixed(0) for whole number
        
        let rangeDescription = "Average";
        if (contextRange === 'weekly') rangeDescription = "Last 7 Days";
        else if (contextRange === 'monthly') rangeDescription = "This Month";
        else if (contextRange === 'yearly') rangeDescription = "This Year";

        // Placeholder for percentage change, adapt as needed
        // const percentageChange = "+8%"; 
        // const percentageColor = "text-green-500";

        const chartOptions: ApexOptions = {
            chart: {
                type: 'area',
                height: '100%',
                width: '100%',
                toolbar: { show: false },
                animations: { enabled: true },
            },
            dataLabels: { enabled: false },
            stroke: {
                curve: 'smooth',
                width: 2.5,
                colors: ['#9A844B'], // Blue color for Water
            },
           fill: {
                type: 'gradient',
                colors: ['#D9D2C7'],
                gradient: {
                    
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 105]
    
                }
            },
            markers: {
                size: 0,
            },
            xaxis: {
                categories: data.labels,
                labels: {
                    show: true,
                    style: {
                        colors: ['#B0A18B'],
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        fontWeight: 500,
                    },
                    offsetY: 2,
                    trim: false,
                    hideOverlappingLabels: false,
                },
                axisBorder: { show: false },
                axisTicks: { show: false },
                tooltip: { enabled: false },
            },
            yaxis: {
                show: false,
                labels: { show: false },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            grid: {
                show: false,
                padding: {
                    top: 5,
                    right: 5,
                    bottom: 0,
                    left: 5,
                },
            },
            tooltip: {
                enabled: true,
                y: { formatter: (val) => `${val.toFixed(0)}ml` }, // Display water in ml, whole number
                style: { fontSize: '12px', fontFamily: 'inherit' },
                theme: 'light',
                 custom: function({series, seriesIndex, dataPointIndex, w}) {
                    const val = w.globals.series[seriesIndex][dataPointIndex];
                    return `<div class="px-2.5 py-1.5 bg-white shadow-md rounded-md text-xs font-medium text-gray-700 border border-gray-200">` +
                           `${val.toFixed(0)}ml` +
                           `</div>`;
                }
            },
            legend: { show: false },
        };
        const series = [{ name: 'Water', data: data.values.water }];

        return (
            <div className="w-full h-full flex flex-col">
                {/* Text Section */}
                <div>
                    <p className="text-xs text-[#7f786a] font-medium">Water Intake</p>
                    <h2 className="text-3xl font-bold text-[#3a352f] my-0.5">{averageWater}ml</h2>
                    <p className="text-xs text-[#a99667]">
                        {rangeDescription}
                        {/* {percentageChange && 
                            <span className={`${percentageColor} font-medium ml-1.5`}>{percentageChange}</span> 
                        } */}
                    </p>
                </div>

                {/* Chart Section */}
                <div className="mt-3 flex-grow" style={{ minHeight: '100px' }}>
                    <ApexChart options={chartOptions} series={series} type="area" height="100%" width="100%" />
                </div>
            </div>
        );
    };
    
    // Card container styling
    return (
        <div className="p-4 border lg:h-[44vh] rounded-2xl border-[#e0dbd1] "> 
           {renderContent()}
        </div>
    );
}