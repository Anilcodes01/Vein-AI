interface NutrientCardProps {
  label: string;
  iconSrc: string;
  consumed: number;
  target: number;
  unit: string;
  gradientFrom: string;
  gradientTo: string;
  iconBgColor: string;
}

export default function NutrientCard({
  label,
  iconSrc,
  consumed,
  target,
  unit,
  gradientFrom,
  gradientTo,
  iconBgColor,
}: NutrientCardProps): React.ReactElement {
  const actualTarget = target || 0;
  const actualConsumed = consumed || 0;
  
  const progressPercentage = actualTarget > 0 
    ? Math.min(Math.round((actualConsumed / actualTarget) * 100), 100) 
    : 0;
  
  const isTargetMet = actualConsumed >= actualTarget && actualTarget > 0;
  const remaining = Math.max(0, actualTarget - actualConsumed);
  
  let displayUnitSuffix = unit;
  if (label.toLowerCase() === 'calories') {
    displayUnitSuffix = 'kcal';
  }
  
  return (
    <div className="transform hover:scale-105 transition-transform duration-300  rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col justify-between h-48 relative">
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} h-1`}></div>
      
      <div className="p-4 flex flex-col items-center h-full z-10 relative">
        <div className={`p-3 ${iconBgColor} rounded-full mb-2`}>
          <img
            src={iconSrc}
            height={24}
            width={24}
            alt={label}
            className="h-6 w-6"
          />
        </div>
        
        <p className="text-2xl font-bold text-gray-800">
          {actualConsumed.toLocaleString(undefined, { 
            maximumFractionDigits: label.toLowerCase() === 'calories' ? 0 : 1 
          })}
          <span className="text-base align-baseline ml-1">{displayUnitSuffix}</span>
        </p>
        
        <p className={`text-xs font-medium ${isTargetMet ? 'text-green-600' : 'text-gray-500'} uppercase tracking-wide mt-1`}>
          {label}
        </p>
        
        {actualTarget > 0 ? (
          <div className="mt-2 w-full">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">
                {isTargetMet ? 'Target met!' : `${remaining.toLocaleString()} ${displayUnitSuffix} left`}
              </span>
              <span className="text-gray-500 font-medium">{progressPercentage}%</span>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${isTargetMet ? 'bg-green-500' : `bg-gradient-to-r ${gradientFrom} ${gradientTo}`}`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-400 mt-2 text-center">
              {`${actualConsumed.toLocaleString()} / ${actualTarget.toLocaleString()} ${displayUnitSuffix}`}
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-2">No target set</p>
        )}
      </div>
      
      {/* Enhanced water filling effect with improved waves */}
      <div 
        className={`absolute bottom-0 left-0 w-full overflow-hidden transition-all duration-1000 ease-out ${isTargetMet ? 'bg-green-100' : 'bg-blue-100'}`}
        style={{ 
          height: `${progressPercentage}%`,
          opacity: progressPercentage > 0 ? 0.3 : 0,
        }}
      >
        {/* Water base color with gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: actualTarget > 0
              ? `linear-gradient(0deg, rgba(0, 100, 200, 0.4) 0%, rgba(0, 150, 255, 0.5) 100%)`
              : 'none',
          }}
        ></div>
        
        {/* Primary wave animation */}
        <div 
          className="absolute -top-4 left-0 w-full h-8"
          style={{
            background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath fill='rgba(255,255,255,0.6)' d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25' /%3E%3Cpath fill='rgba(255,255,255,0.6)' d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='.5' /%3E%3Cpath fill='rgba(255,255,255,0.6)' d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' /%3E%3C/svg%3E\")",
            backgroundSize: "1200px 100%",
            animation: "waveAnimation 20s linear infinite",
          }}
        ></div>
        
        {/* Secondary wave animation (slower, different direction) */}
        <div 
          className="absolute -top-4 left-0 w-full h-8"
          style={{
            background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath fill='rgba(255,255,255,0.4)' d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' /%3E%3C/svg%3E\")",
            backgroundSize: "1200px 100%",
            animation: "reverseWaveAnimation 15s linear infinite",
          }}
        ></div>
        
        {/* Light reflection */}
        <div 
          className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-white to-transparent"
          style={{ opacity: 0.2 }}
        ></div>
        
        {/* Bubbles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white opacity-20"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                bottom: `${Math.random() * 20}%`,
                left: `${Math.random() * 100}%`,
                animation: `bubble ${Math.random() * 5 + 3}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* CSS animations for waves and bubbles */}
      <style jsx>{`
        @keyframes waveAnimation {
          0% {
            background-position-x: 0;
          }
          100% {
            background-position-x: 1200px;
          }
        }
        
        @keyframes reverseWaveAnimation {
          0% {
            background-position-x: 1200px;
          }
          100% {
            background-position-x: 0;
          }
        }
        
        @keyframes bubble {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-50px) scale(1.2);
            opacity: 0.4;
          }
          100% {
            transform: translateY(-100px) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}