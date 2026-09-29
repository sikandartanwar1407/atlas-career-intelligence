import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#f6f3ed] border-t border-[#e5e2dc] py-6 mt-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 font-label-sm text-label-sm text-[#737874] uppercase tracking-wider">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6b4ea6]"></span>
            Continuous Empirical Calibration Active
          </span>
          <span className="hidden sm:inline-block text-[#c2c8c3]">•</span>
          <span className="hidden sm:inline">Session Telemetry: Synchronized</span>
          <span className="hidden md:inline-block text-[#c2c8c3]">•</span>
          <Link to="/reassessment" className="text-[#6b4ea6] hover:underline normal-case font-medium">
            Run Reassessment
          </Link>
          <span className="hidden sm:inline-block text-[#c2c8c3]">•</span>
          <Link to="/employer" className="text-[#0d1f18] hover:underline normal-case font-medium">
            Employer Portal
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-label-sm text-[11px] normal-case text-[#737874]">
            © 2025 ATLAS Career Intelligence Platform. Deterministic scoring architecture.
          </span>
        </div>
      </div>
    </footer>
  );
};
