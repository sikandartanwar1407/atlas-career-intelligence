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
  let fillColor = 'bg-[#18283D]';
  let deficitColor = 'bg-[#18283D]/15 border-l border-r border-[#18283D]/30';
  let textDeltaColor = 'text-[#8B6F5A]';

  if (priority === 'HIGH PRIORITY') {
    fillColor = 'bg-rose-600';
    deficitColor = 'bg-rose-500/20 border-l border-r border-rose-400/30';
    textDeltaColor = 'text-rose-600';
  } else if (priority === 'LOW PRIORITY') {
    fillColor = 'bg-[#8B6F5A]';
    deficitColor = 'bg-[#8B6F5A]/20 border-l border-r border-[#8B6F5A]/30';
    textDeltaColor = 'text-[#8B6F5A]';
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
      <div className="relative w-full h-3 bg-[#E5E7EB] border border-[#E5E7EB] rounded-full overflow-visible flex items-center">
        {/* Current score fill */}
        <div
          className={`h-full ${fillColor} rounded-full transition-all duration-700 ease-out`}
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
          <div className="w-1.5 h-5 bg-[#18283D] rounded-full shadow-sm" />
          <div className="hidden sm:block absolute -top-6 px-1.5 py-0.5 bg-[#18283D] border border-[#18283D] text-[#FAF7F2] rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-md">
            {threshold}%
          </div>
        </div>
      </div>

      {showLabels && (
        <div className="flex justify-between items-center text-[11px] font-mono text-[#6B7280] mt-0.5">
          <span>Current: <strong className="text-[#18283D]">{currentPercent}%</strong></span>
          <span className={`font-semibold ${textDeltaColor}`}>
            {gap > 0 ? `Deficit: -${gap} pts` : 'Target Met'}
          </span>
          <span>Target: <strong className="text-[#8B6F5A]">{thresholdPercent}%</strong></span>
        </div>
      )}
    </div>
  );
};
