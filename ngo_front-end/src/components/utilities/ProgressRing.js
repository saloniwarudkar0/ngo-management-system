import React from 'react';

const ProgressRing = ({ progress = 80, size = 150, strokeWidth = 7, text = "5\nyears\nexp." }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform scale-x-[-1] -rotate-90">
        <circle
          className="text-gray-200 "
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-green-500 transform scale-x-[-1] -rotate-90"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap=""
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute right-9 top-5 flex items-center justify-center">
        <div className="text-right">
          {text.split('\n').map((line, index) => (
            <div key={index} className={index === 0 ? "text-3xl font-bold" : "text-sm"}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressRing;