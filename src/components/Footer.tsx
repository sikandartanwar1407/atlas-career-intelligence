import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#FAF7F2] border-t border-[#E5E7EB] py-8 mt-20 relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#6B7280]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[#18283D] font-medium">Continuous Calibration Active</span>
          </span>
          <span className="hidden sm:inline-block text-[#6B7280]/40">•</span>
          <span className="hidden sm:inline text-[#6B7280]">Telemetry: Synchronized</span>
          <span className="hidden md:inline-block text-[#6B7280]/40">•</span>
          <Link to="/reassessment" className="text-[#8B6F5A] hover:text-[#18283D] transition-colors font-medium">
            Run Reassessment
          </Link>
          <span className="hidden sm:inline-block text-[#6B7280]/40">•</span>
          <Link to="/employer" className="text-[#8B6F5A] hover:text-[#18283D] transition-colors font-medium">
            Employer Portal
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-[#6B7280]">
            © 2025 ATLAS Career Intelligence Platform. Deterministic scoring architecture.
          </span>
        </div>
      </div>
    </footer>
  );
};
