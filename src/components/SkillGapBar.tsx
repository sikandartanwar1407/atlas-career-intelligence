import React, { useState, useEffect } from 'react';
import { PriorityLevel } from '../types/atlas';
import { useReducedMotion } from './motion/Motion';

interface SkillGapBarProps {
  current: number;
  threshold: number;
  gap: number;
  priority: PriorityLevel;
  showLabels?: boolean;
}

export const SkillGapBar: React.FC<SkillGapBarProps> = ({
  current,
  threshold,
  gap,
  priority,
  showLabels = true
}) => {
  const reducedMotion = useReducedMotion();

  // Determine color according to priority
  let fillColor = 'bg-[#6b4ea6]';
  let deficitColor = 'bg-[#6b4ea6]/20';
  let textDeltaColor = 'text-[#0d1f18]';

  if (priority === 'HIGH PRIORITY') {
    fillColor = 'bg-[#ba1a1a]';
    deficitColor = 'bg-[#ba1a1a]/20';
    textDeltaColor = 'text-[#ba1a1a]';
  } else if (priority === 'LOW PRIORITY') {
    fillColor = 'bg-[#4f6359]';
    deficitColor = 'bg-[#d2e7dc]';
    textDeltaColor = 'text-[#4f6359]';
  }

  const currentPercent = Math.min(Math.max(current, 0), 100);
  const thresholdPercent = Math.min(Math.max(threshold, 0), 100);
  const [animatedCurrent, setAnimatedCurrent] = useState(reducedMotion ? currentPercent : 0);

  useEffect(() => {
    if (reducedMotion) {
      setAnimatedCurrent(currentPercent);
      return;
    }
    const timer = setTimeout(() => {
      setAnimatedCurrent(currentPercent);
    }, 50);
    return () => clearTimeout(timer);
  }, [currentPercent, reducedMotion]);

  const deficitWidth = Math.max(thresholdPercent - animatedCurrent, 0);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="relative w-full h-3 bg-[#e5e2dc] rounded-full overflow-visible flex items-center">
        {/* Current score fill */}
        <div
          className={`h-full ${fillColor} rounded-l-full transition-all duration-700 ease-out`}
          style={{ width: `${animatedCurrent}%` }}
        />

        {/* Deficit Span Highlight (if deficit exists) */}
        {deficitWidth > 0 && (
          <div
            className={`absolute top-0 bottom-0 ${deficitColor} transition-all duration-700 ease-out`}
            style={{
              left: `${animatedCurrent}%`,
              width: `${deficitWidth}%`
            }}
          />
        )}

        {/* Target Benchmark Notch Pin */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
          style={{ left: `${thresholdPercent}%` }}
          title={`Target Benchmark: ${threshold}%`}
        >
          <div className="w-1 h-5 bg-[#0d1f18] rounded-full shadow-xs" />
          <div className="hidden sm:block absolute -top-6 px-1.5 py-0.5 bg-[#0d1f18] text-white rounded text-[10px] font-bold whitespace-nowrap shadow-xs">
            {threshold}%
          </div>
        </div>
      </div>

      {showLabels && (
        <div className="flex justify-between items-center text-[11px] font-label-sm text-[#737874] mt-0.5">
          <span>Current: {currentPercent}%</span>
          <span className={`font-semibold ${textDeltaColor}`}>
            {gap > 0 ? `Deficit: -${gap} pts` : 'Target Met'}
          </span>
          <span className="text-[#0d1f18] font-medium">Role Threshold: {thresholdPercent}%</span>
        </div>
      )}
    </div>
  );
};
