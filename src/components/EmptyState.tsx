import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryText?: string;
  secondaryLink?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'info',
  title,
  description,
  ctaText,
  ctaLink,
  secondaryText,
  secondaryLink
}) => {
  return (
    <div className="w-full glass-panel border border-white/10 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-xl relative overflow-hidden">
      <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 shadow-sm">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="font-headline-md text-xl sm:text-2xl text-white font-bold mb-2 tracking-tight">{title}</h3>
      <p className="font-body-md text-sm sm:text-base text-[#94A3B8] max-w-md mb-6 leading-relaxed">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to={ctaLink}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-all shadow-sm btn-interactive"
        >
          <span>{ctaText}</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
        {secondaryText && secondaryLink && (
          <Link
            to={secondaryLink}
            className="px-4 py-2.5 text-[#94A3B8] hover:text-white rounded-xl text-sm font-medium transition-colors border border-white/5 hover:border-white/10 bg-white/[0.02]"
          >
            {secondaryText}
          </Link>
        )}
      </div>
    </div>
  );
};
