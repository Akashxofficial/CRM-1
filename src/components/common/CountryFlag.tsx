import React, { useState } from "react";
import { getFlagUrl } from "@/lib/countries-data";

interface Props {
  iso: string;
  name?: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export function CountryFlag({
  iso,
  name = "Country Flag",
  className = "",
  size = "sm",
}: Props) {
  const [hasError, setHasError] = useState(false);

  const dimensionClasses = {
    xs: "w-4 h-3",
    sm: "w-5 h-3.5",
    md: "w-6 h-4",
    lg: "w-7 h-5",
  }[size];

  if (!iso || hasError) {
    return (
      <span className={`inline-block rounded-xs bg-slate-200 text-[10px] text-center font-bold text-slate-600 ${dimensionClasses} ${className}`}>
        {iso?.toUpperCase()?.slice(0, 2) || "🏳"}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center flex-shrink-0 overflow-hidden rounded-xs shadow-2xs border border-slate-200/80 bg-slate-50 ${dimensionClasses} ${className}`}>
      <img
        src={getFlagUrl(iso, 40)}
        alt={name}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </span>
  );
}
