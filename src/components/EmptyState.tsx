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
    <div className="w-full glass-panel border border-[#E5E7EB] rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-xl relative overflow-hidden">
      <div className="w-14 h-14 rounded-2xl bg-[#D8C3A5]/25 border border-[#D8C3A5] flex items-center justify-center text-[#8B6F5A] mb-4 shadow-sm">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="font-headline-md text-xl sm:text-2xl text-[#18283D] font-bold mb-2 tracking-tight">{title}</h3>
      <p className="font-body-md text-sm sm:text-base text-[#6B7280] max-w-md mb-6 leading-relaxed">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to={ctaLink}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] rounded-xl text-sm font-semibold transition-all shadow-sm btn-interactive"
        >
          <span>{ctaText}</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
        {secondaryText && secondaryLink && (
          <Link
            to={secondaryLink}
            className="px-4 py-2.5 text-[#6B7280] hover:text-[#18283D] rounded-xl text-sm font-medium transition-colors border border-[#E5E7EB] hover:border-[#18283D]/30 bg-[#FAF7F2]"
          >
            {secondaryText}
          </Link>
        )}
      </div>
    </div>
  );
};
