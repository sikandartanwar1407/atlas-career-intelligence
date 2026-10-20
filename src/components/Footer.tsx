import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#080B16] border-t border-white/[0.06] py-8 mt-20 relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#94A3B8]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[#F1F5F9] font-medium">Continuous Calibration Active</span>
          </span>
          <span className="hidden sm:inline-block text-white/20">•</span>
          <span className="hidden sm:inline text-white/60">Telemetry: Synchronized</span>
          <span className="hidden md:inline-block text-white/20">•</span>
          <Link to="/reassessment" className="text-[#A78BFA] hover:text-white transition-colors font-medium">
            Run Reassessment
          </Link>
          <span className="hidden sm:inline-block text-white/20">•</span>
          <Link to="/employer" className="text-[#38BDF8] hover:text-white transition-colors font-medium">
            Employer Portal
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-[#64748B]">
            © 2025 ATLAS Career Intelligence Platform. Deterministic scoring architecture.
          </span>
        </div>
      </div>
    </footer>
  );
};
