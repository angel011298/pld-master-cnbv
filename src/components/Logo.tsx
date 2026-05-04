import * as React from "react";
import { cn } from "@/lib/utils";

type LogoVariant = "full" | "isotype" | "mono-black" | "mono-white";

interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: LogoVariant;
  /** Pixel height. The width scales by aspect ratio. */
  size?: number;
  /** Override aria-label (default: "Certifik PLD"). */
  label?: string;
}

const ASPECT: Record<LogoVariant, number> = {
  full: 240 / 56,
  isotype: 1,
  "mono-black": 240 / 56,
  "mono-white": 240 / 56,
};

/**
 * Brand mark (Check inside Node ring) + Certifik wordmark.
 * - `full` for marketing & navbar
 * - `isotype` for collapsed sidebar / favicon (square)
 * - `mono-black` for PDFs / Excel headers
 * - `mono-white` for dark surfaces (footer / inverse)
 */
export function Logo({
  variant = "full",
  size = 28,
  label = "Certifik PLD",
  className,
  ...rest
}: LogoProps) {
  const ratio = ASPECT[variant];
  const width = Math.round(size * ratio);

  return (
    <span
      role="img"
      aria-label={label}
      className={cn("inline-flex items-center", className)}
      style={{ height: size, width }}
      {...rest}
    >
      {variant === "full" && (
        <svg viewBox="0 0 240 56" fill="none" width={width} height={size}>
          <rect x="6" y="14" width="28" height="28" rx="6" fill="#0B0D10" />
          <g fill="#004FAE">
            <circle cx="13" cy="21" r="1.6" />
            <circle cx="20" cy="21" r="1.6" />
            <circle cx="27" cy="21" r="1.6" />
            <circle cx="13" cy="28" r="1.6" />
          </g>
          <rect x="17" y="26" width="11" height="4" rx="2" fill="#FFFFFF" />
          <g fill="#004FAE">
            <circle cx="13" cy="35" r="1.6" />
            <circle cx="20" cy="35" r="1.6" />
            <circle cx="27" cy="35" r="1.6" />
          </g>
          <text
            x="46"
            y="32"
            fontFamily="var(--font-geist-sans), Geist, sans-serif"
            fontSize="20"
            fontWeight="700"
            letterSpacing="-0.6"
            fill="#000000"
          >
            Certifik
          </text>
          <text
            x="46"
            y="46"
            fontFamily="var(--font-geist-sans), Geist, sans-serif"
            fontSize="9"
            fontWeight="600"
            letterSpacing="2.6"
            fill="#6B7280"
          >
            PLD · CNBV
          </text>
        </svg>
      )}

      {variant === "isotype" && (
        <svg viewBox="0 0 64 64" fill="none" width={size} height={size}>
          <rect x="2" y="2" width="60" height="60" rx="14" fill="#0B0D10" />
          <g fill="#004FAE">
            <circle cx="20" cy="20" r="3.5" />
            <circle cx="32" cy="20" r="3.5" />
            <circle cx="44" cy="20" r="3.5" />
            <circle cx="20" cy="32" r="3.5" />
            <circle cx="20" cy="44" r="3.5" />
            <circle cx="32" cy="44" r="3.5" />
            <circle cx="44" cy="44" r="3.5" />
          </g>
          <rect x="28" y="28" width="20" height="8" rx="4" fill="#FFFFFF" />
        </svg>
      )}

      {(variant === "mono-black" || variant === "mono-white") && (
        <svg viewBox="0 0 240 56" fill="none" width={width} height={size}>
          <rect
            x="6"
            y="14"
            width="28"
            height="28"
            rx="6"
            fill={variant === "mono-black" ? "#000000" : "#FFFFFF"}
          />
          <g fill={variant === "mono-black" ? "#FFFFFF" : "#000000"}>
            <circle cx="13" cy="21" r="1.6" />
            <circle cx="20" cy="21" r="1.6" />
            <circle cx="27" cy="21" r="1.6" />
            <circle cx="13" cy="28" r="1.6" />
            <circle cx="13" cy="35" r="1.6" />
            <circle cx="20" cy="35" r="1.6" />
            <circle cx="27" cy="35" r="1.6" />
          </g>
          <rect
            x="17"
            y="26"
            width="11"
            height="4"
            rx="2"
            fill={variant === "mono-black" ? "#FFFFFF" : "#000000"}
          />
          <text
            x="46"
            y="32"
            fontFamily="var(--font-geist-sans), Geist, sans-serif"
            fontSize="20"
            fontWeight="700"
            letterSpacing="-0.6"
            fill={variant === "mono-black" ? "#000000" : "#FFFFFF"}
          >
            Certifik
          </text>
          <text
            x="46"
            y="46"
            fontFamily="var(--font-geist-sans), Geist, sans-serif"
            fontSize="9"
            fontWeight="600"
            letterSpacing="2.6"
            fill={variant === "mono-black" ? "#6B7280" : "#9BA3AF"}
          >
            PLD · CNBV
          </text>
        </svg>
      )}
    </span>
  );
}

export default Logo;
