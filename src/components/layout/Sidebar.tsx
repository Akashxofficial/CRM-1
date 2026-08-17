"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  ListFilter,
  Users,
  Briefcase,
  PhoneCall,
  CreditCard,
  Trophy,
  FileSpreadsheet,
  BarChart3,
  Send,
  Settings,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";
import { SessionUser, ROLE_LABELS } from "@/lib/rbac";
import { logoutAction } from "@/actions/auth-actions";
import { RoleSwitcherModal } from "./RoleSwitcherModal";

interface Props {
  user: SessionUser;
  onCloseMobile?: () => void;
}

export function Sidebar({ user, onCloseMobile }: Props) {
  const pathname = usePathname();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const roleBadge = ROLE_LABELS[user.role] || ROLE_LABELS.ADMIN;

  const initials = user.organizationName
    ? user.organizationName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "DB";

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Today",
      href: "/today",
      icon: Calendar,
    },
    {
      name: "Builders",
      href: "/builders",
      icon: Building2,
    },
    {
      name: "Listings",
      href: "/listings",
      icon: ListFilter,
    },
    {
      name: "Leads",
      href: "/leads",
      icon: Users,
    },
    {
      name: "Deals",
      href: "/bookings",
      icon: Briefcase,
    },
    {
      name: "Calls",
      href: "/calls",
      icon: PhoneCall,
    },
    {
      name: "Collections",
      href: "/payments",
      icon: CreditCard,
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: Trophy,
    },
    {
      name: "Incentive Sheets",
      href: "/incentives",
      icon: FileSpreadsheet,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
    },
    {
      name: "Outreach",
      href: "/outreach",
      icon: Send,
    },
  ];

  return (
    <>
      <aside className="w-60 h-full bg-[#131633] text-slate-300 flex flex-col flex-shrink-0 select-none shadow-xl border-r border-[#1e2246]">
        {/* Top Header: Organization & Role */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#1f244e]">
          <div className="flex items-center gap-3 min-w-0">
            {/* Circle Avatar Badge DB */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3B8CFF] to-[#6366F1] flex items-center justify-center text-white font-bold text-xs shadow-md shadow-[#3B8CFF]/25 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-white text-xs tracking-tight truncate block">
                {user.organizationName || "Demo Broker Co"}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block capitalize truncate">
                {roleBadge.label}
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg lg:hidden transition"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Role Switcher Pill */}
        <div className="px-3 py-1.5 mx-3 my-2 rounded-xl bg-[#1c2045] border border-[#282e61] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="text-[10px] font-semibold text-slate-300 truncate">
              {roleBadge.label}
            </span>
          </div>
          <button
            onClick={() => setRoleModalOpen(true)}
            className="text-[9px] font-bold text-[#60A5FA] hover:text-[#93C5FD] transition flex items-center gap-1 uppercase tracking-wider flex-shrink-0"
          >
            <Sparkles className="w-2.5 h-2.5" /> Switch
          </button>
        </div>

        {/* Navigation Items (Matching Vastu CRM exactly) */}
        <nav className="flex-1 px-2.5 py-1 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#3B8CFF] text-white shadow-md shadow-[#3B8CFF]/30"
                    : "text-slate-400 hover:text-white hover:bg-[#1c2045]/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile & Settings (Matching Vastu CRM) */}
        <div className="p-3 border-t border-[#1f244e] bg-[#0f1129] space-y-2">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              pathname === "/settings"
                ? "bg-[#3B8CFF] text-white"
                : "text-slate-400 hover:text-white hover:bg-[#1c2045]/60"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </Link>

          <div className="pt-2 border-t border-[#1f244e] flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-white truncate">
              {user.name}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        currentRole={user.role}
        currentName={user.name}
      />
    </>
  );
}
