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
  let fillColor = 'bg-violet-600';
  let deficitColor = 'bg-violet-500/20 border-l border-r border-violet-400/30';
  let textDeltaColor = 'text-violet-400';

  if (priority === 'HIGH PRIORITY') {
    fillColor = 'bg-rose-600';
    deficitColor = 'bg-rose-500/20 border-l border-r border-rose-400/30';
    textDeltaColor = 'text-rose-400';
  } else if (priority === 'LOW PRIORITY') {
    fillColor = 'bg-teal-500';
    deficitColor = 'bg-teal-500/20 border-l border-r border-teal-400/30';
    textDeltaColor = 'text-teal-400';
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
      <div className="relative w-full h-3 bg-[#0D1224] border border-white/5 rounded-full overflow-visible flex items-center">
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
          <div className="w-1.5 h-5 bg-white rounded-full shadow-sm" />
          <div className="hidden sm:block absolute -top-6 px-1.5 py-0.5 bg-[#172039] border border-white/20 text-white rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-md">
            {threshold}%
          </div>
        </div>
      </div>

      {showLabels && (
        <div className="flex justify-between items-center text-[11px] font-mono text-[#94A3B8] mt-0.5">
          <span>Current: <strong className="text-white">{currentPercent}%</strong></span>
          <span className={`font-semibold ${textDeltaColor}`}>
            {gap > 0 ? `Deficit: -${gap} pts` : 'Target Met'}
          </span>
          <span>Target: <strong className="text-[#38BDF8]">{thresholdPercent}%</strong></span>
        </div>
      )}
    </div>
  );
};
