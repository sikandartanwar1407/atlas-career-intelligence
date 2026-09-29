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
    <div className="w-full bg-[#ffffff] border border-[#e5e2dc] rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-sm">
      <div className="w-14 h-14 rounded-full bg-[#f6f3ed] flex items-center justify-center text-[#6b4ea6] mb-4">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-[#0d1f18] mb-2">{title}</h3>
      <p className="font-body-md text-body-md text-[#424845] max-w-md mb-6">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to={ctaLink}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0d1f18] text-white hover:bg-[#22382f] rounded font-title-md text-title-md transition-all shadow-sm"
        >
          <span>{ctaText}</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
        {secondaryText && secondaryLink && (
          <Link
            to={secondaryLink}
            className="px-4 py-2 text-[#424845] hover:text-[#0d1f18] font-title-md text-title-md transition-colors"
          >
            {secondaryText}
          </Link>
        )}
      </div>
    </div>
  );
};
