"use client";
import { Flame, Droplet, Cookie, Dumbbell } from "lucide-react";
import { TbMeat } from "react-icons/tb";
import { PiGrains } from "react-icons/pi";

interface ProgressCircleProps {
  value: number;
  maxValue: number;
  label: string;
  unit: string;
  color: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  maxValue,
  label,
  unit,
  color,
}) => {
  const percentage =
    maxValue > 0 ? Math.min(Math.round((value / maxValue) * 100), 100) : 0;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const gradientMap = {
    "text-rose-500": "calories-gradient",
    "text-blue-500": "protein-gradient",
    "text-green-500": "carbs-gradient",
    "text-amber-500": "fat-gradient",
    "text-cyan-500": "water-gradient",
    "text-purple-500": "exercise-gradient", 
  };

  const gradientId =
    gradientMap[color as keyof typeof gradientMap] || "default-gradient";

  const getIcon = () => {
    switch (label.toLowerCase()) {
      case "calories":
        return <Flame className="w-4 h-4" />;
      case "protein":
        return <TbMeat className="w-4 h-4" />;
      case "carbs":
        return <Cookie className="w-4 h-4" />;
      case "fat":
        return <PiGrains className="w-4 h-4" />;
      case "water":
        return <Droplet className="w-4 h-4" />;
      case "burned":
        return <Dumbbell className="w-4 h-4" />
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >

          <defs>
            <linearGradient
              id="calories-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#ff9a9e" />
              <stop offset="100%" stopColor="#ff5252" />
            </linearGradient>
            <linearGradient
              id="protein-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#64b3f4" />
              <stop offset="100%" stopColor="#0088ff" />
            </linearGradient>
            <linearGradient
              id="carbs-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#88d3ce" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <linearGradient id="fat-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffd980" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient
              id="water-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#0ed2f7" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient
              id="exercise-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e7e7e7"
            strokeWidth="16"
            className="text-base-200 dark:text-base-"
          />

          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold">{percentage}%</span>
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center">
        <div className={`flex items-center gap-1 ${color}`}>
          {getIcon()}
          <span className="font-medium">{label}</span>
        </div>
        <div className="text-sm mt-1">
          <span className="font-semibold">{value}</span>
          <span className="text-base-content/60">
            /{maxValue} {unit}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCircle;
