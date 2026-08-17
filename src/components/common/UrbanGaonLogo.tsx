import React from "react";
import Image from "next/image";

interface Props {
  variant?: "full" | "icon" | "badge";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTagline?: boolean;
}

export function UrbanGaonLogo({
  variant = "full",
  size = "md",
  className = "",
  showTagline = true,
}: Props) {
  if (variant === "icon") {
    const sizeClasses = {
      sm: "w-7 h-7",
      md: "w-9 h-9",
      lg: "w-11 h-11",
      xl: "w-14 h-14",
    }[size];

    return (
      <div className={`relative flex-shrink-0 rounded-full overflow-hidden shadow-xs ${sizeClasses} ${className}`}>
        <img
          src="/urbangaon-icon.png"
          alt="UrbanGaon"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Full Logo (Icon + UrbanGaon + a perfect balance)
  const heightClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
    xl: "h-16",
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/urbangaon-logo.png"
        alt="UrbanGaon — a perfect balance"
        className={`${heightClasses} w-auto object-contain`}
      />
    </div>
  );
}
