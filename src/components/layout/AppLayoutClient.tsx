"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/lib/rbac";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface Props {
  user: SessionUser;
  projects: any[];
  children: React.ReactNode;
}

export function AppLayoutClient({ user, projects, children }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Desktop Sidebar (hidden on < lg screens) */}
      <div className="hidden lg:flex flex-shrink-0 h-full w-64">
        <Sidebar user={user} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar */}
          <div className="relative z-50 w-72 max-w-[85vw] h-[100dvh] shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar user={user} onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F8FAFC]">
        <Navbar
          user={user}
          projects={projects}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 bg-[#F8FAFC] overscroll-y-contain pb-safe">
          <div className="max-w-7xl mx-auto w-full pb-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
