"use client";

import { useState } from "react";
import { Search, Plus, Sparkles, Building, Bell, Menu } from "lucide-react";
import { SessionUser, ROLE_LABELS } from "@/lib/rbac";
import { RoleSwitcherModal } from "./RoleSwitcherModal";
import { GlobalSearchModal } from "./GlobalSearchModal";
import Link from "next/link";

interface Props {
  user: SessionUser;
  projects: any[];
  onToggleMobileMenu?: () => void;
}

export function Navbar({ user, projects, onToggleMobileMenu }: Props) {
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const roleBadge = ROLE_LABELS[user.role] || ROLE_LABELS.ADMIN;

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        {/* Left: Mobile Hamburger & Search */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu on Mobile */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden transition"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Active Projects Pill (Hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FAFC] text-slate-700 border border-slate-200 text-xs font-semibold">
            <Building className="w-3.5 h-3.5 text-[#3B8CFF]" />
            <span>Projects: {projects.length}</span>
          </div>

          {/* Search Trigger */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-[#F8FAFC] hover:bg-slate-100 rounded-xl border border-slate-200 transition w-36 sm:w-56 md:w-64 justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">Search CRM...</span>
            </div>
            <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 font-mono shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Actions, Role Badge & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action Button */}
          <Link
            href="/leads?action=new"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#3B8CFF] hover:bg-[#2570E8] text-white rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Lead</span>
          </Link>

          {/* Role Persona Switcher Pill */}
          <button
            onClick={() => setRoleModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100 transition"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-xs font-medium text-slate-600 hidden md:inline">
              Role: <strong className="text-slate-900">{roleBadge.label}</strong>
            </span>
            <span className="text-xs font-semibold text-slate-900 md:hidden">
              {roleBadge.label.split(" ")[0]}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#3B8CFF] flex-shrink-0" />
          </button>

          {/* Notification Icon */}
          <div className="relative">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3B8CFF]" />
            </button>
          </div>
        </div>
      </header>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        currentRole={user.role}
        currentName={user.name}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
