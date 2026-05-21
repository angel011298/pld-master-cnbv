"use client";

/**
 * AnimatedBorderButton
 *
 * Wraps any button in a rotating conic-gradient "light sweep" border.
 * The spinning gradient sits behind a 1.5 px inset gap so the glow
 * appears to orbit around the button edge.
 *
 * Usage:
 *   <AnimatedBorderButton
 *     variant="cyan"
 *     wrapperClassName="rounded-full"
 *     className="bg-black text-white px-8 py-4 rounded-full font-bold"
 *     onClick={...}
 *   >
 *     Click me
 *   </AnimatedBorderButton>
 */

import { motion } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const CONIC: Record<string, string> = {
  cyan:   "conic-gradient(from 0deg, transparent 20%, #06B6D4 42%, #A5F3FC 50%, #06B6D4 58%, transparent 80%)",
  indigo: "conic-gradient(from 0deg, transparent 20%, #6366F1 42%, #C7D2FE 50%, #6366F1 58%, transparent 80%)",
  blue:   "conic-gradient(from 0deg, transparent 20%, #2563EB 42%, #93C5FD 50%, #2563EB 58%, transparent 80%)",
  gold:   "conic-gradient(from 0deg, transparent 20%, #F59E0B 42%, #FEF9C3 50%, #F59E0B 58%, transparent 80%)",
  violet: "conic-gradient(from 0deg, transparent 20%, #7C3AED 42%, #DDD6FE 50%, #7C3AED 58%, transparent 80%)",
};

export type AnimatedBorderVariant = keyof typeof CONIC;

export interface AnimatedBorderButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Glow color. Default: "cyan" */
  variant?: AnimatedBorderVariant;
  /** Extra classes on the outer wrapper div */
  wrapperClassName?: string;
  /** Seconds per full revolution. Default: 3.5 */
  speed?: number;
}

export const AnimatedBorderButton = forwardRef<
  HTMLButtonElement,
  AnimatedBorderButtonProps
>(
  (
    {
      children,
      variant = "cyan",
      wrapperClassName,
      speed = 3.5,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        className={cn("relative overflow-hidden p-[1.5px]", wrapperClassName)}
      >
        {/* Rotating conic gradient — sits behind the 1.5 px gap */}
        <motion.div
          className="absolute inset-[-100%] pointer-events-none"
          style={{ background: CONIC[variant] }}
          animate={{ rotate: 360 }}
          transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        />

        {/* The actual button */}
        <button
          ref={ref}
          className={cn(
            "relative z-10 flex items-center justify-center gap-2",
            "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        >
          {children}
        </button>
      </motion.div>
    );
  }
);

AnimatedBorderButton.displayName = "AnimatedBorderButton";
