"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setVisible(true);
    setProgress(25);

    // Smoothly increment progress to 75% while waiting
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 80) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 80;
        }
        return prev + 15;
      });
    }, 150);
  };

  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);

    // Fade out smoothly after reaching 100%
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setProgress(0);
      }, 200);
    }, 200);
  };

  // Complete progress whenever route finishes changing
  useEffect(() => {
    completeProgress();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (
        target &&
        target.href &&
        target.href.startsWith(window.location.origin) &&
        !target.target &&
        !target.hasAttribute("download") &&
        target.pathname !== window.location.pathname
      ) {
        startProgress();
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* 2.5px slim subtle loading line */}
      <div
        className="h-[2.5px] bg-[#3B8CFF] transition-all ease-out duration-300 rounded-r-full"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
