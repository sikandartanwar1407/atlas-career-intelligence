import React, { useEffect, useState, useRef } from 'react';

/**
 * Hook to detect if the user has requested reduced motion in system preferences
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReduced;
}

/**
 * Animated numeric counter that smoothly interpolates from 0 to the target value
 */
interface AnimatedNumberProps {
  value: number;
  durationMs?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  durationMs = 600,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = '',
}) => {
  const reducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(reducedMotion ? value : 0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    const start = prevValueRef.current;
    const end = value;
    const startTime = performance.now();

    let animationFrameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Easing function: easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        prevValueRef.current = end;
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      prevValueRef.current = value;
    };
  }, [value, durationMs, reducedMotion]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue);

  return (
    <span className={`inline-block tabular-nums transition-colors duration-200 ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

/**
 * Smoothly animated progress bar that expands from 0 to value on mount or change
 */
interface AnimatedProgressBarProps {
  value: number; // 0 to 100
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  durationMs?: number;
  delayMs?: number;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  className = 'w-full h-2',
  trackClassName = 'bg-[#e5e2dc] rounded-full overflow-hidden',
  fillClassName = 'bg-[#6b4ea6] rounded-full',
  durationMs = 600,
  delayMs = 60,
}) => {
  const reducedMotion = useReducedMotion();
  const [width, setWidth] = useState(reducedMotion ? Math.min(Math.max(value, 0), 100) : 0);

  useEffect(() => {
    if (reducedMotion) {
      setWidth(Math.min(Math.max(value, 0), 100));
      return;
    }

    const timer = setTimeout(() => {
      setWidth(Math.min(Math.max(value, 0), 100));
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs, reducedMotion]);

  return (
    <div className={`${className} ${trackClassName}`}>
      <div
        className={`h-full ${fillClassName} transition-all ease-out`}
        style={{
          width: `${width}%`,
          transitionDuration: `${durationMs}ms`,
        }}
      />
    </div>
  );
};

/**
 * Page transition wrapper for smooth subtle route entrance
 */
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={`w-full ${
        reducedMotion ? '' : 'animate-fade-in-up'
      } ${className}`}
      style={{
        animationDuration: '280ms',
        animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  );
};

/**
 * Staggered container for card groups (reveals child items in sequence)
 */
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerMs?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerMs = 45,
  className = '',
}) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const delay = index * staggerMs;
        const existingStyle = (child.props as any).style || {};

        return React.cloneElement(child as React.ReactElement<any>, {
          className: `${(child.props as any).className || ''} animate-fade-in-up`,
          style: {
            ...existingStyle,
            animationDuration: '320ms',
            animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            animationDelay: `${delay}ms`,
            animationFillMode: 'both',
          },
        });
      })}
    </div>
  );
};

/**
 * Subtle progressive reveal wrapper
 */
interface FadeInProps {
  children: React.ReactNode;
  delayMs?: number;
  durationMs?: number;
  direction?: 'up' | 'down' | 'none';
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delayMs = 0,
  durationMs = 300,
  direction = 'up',
  className = '',
}) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const animationClass =
    direction === 'up'
      ? 'animate-fade-in-up'
      : direction === 'down'
      ? 'animate-fade-in-down'
      : 'animate-fade-in';

  return (
    <div
      className={`${animationClass} ${className}`}
      style={{
        animationDuration: `${durationMs}ms`,
        animationDelay: `${delayMs}ms`,
        animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  );
};
