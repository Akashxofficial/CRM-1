"use client";

import { useState } from "react";
import { Search, Plus, Sparkles, Building, Bell } from "lucide-react";
import { SessionUser, ROLE_LABELS } from "@/lib/rbac";
import { RoleSwitcherModal } from "./RoleSwitcherModal";
import { GlobalSearchModal } from "./GlobalSearchModal";
import Link from "next/link";

interface Props {
  user: SessionUser;
  projects: any[];
}

export function Navbar({ user, projects }: Props) {
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const roleBadge = ROLE_LABELS[user.role] || ROLE_LABELS.ADMIN;

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Project Selector & Search */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <Building className="w-4 h-4 text-sky-600" />
            <span>Active Projects: {projects.length}</span>
          </div>

          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition w-64 justify-between"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search CRM (Ctrl + K)</span>
            </div>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Actions, Role Badge & Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Action Button */}
          <Link
            href="/leads?action=new"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </Link>

          {/* Role Persona Switcher Pill */}
          <button
            onClick={() => setRoleModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Role: <strong className="text-slate-900 dark:text-white">{roleBadge.label}</strong>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          </button>

          {/* Notification Icon */}
          <div className="relative">
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500" />
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
