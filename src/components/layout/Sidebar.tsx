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
    : "SR";

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
      href: "/projects",
      icon: Building2,
    },
    {
      name: "Listings",
      href: "/inventory",
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
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      <aside className="w-60 h-full bg-white text-slate-700 flex flex-col flex-shrink-0 select-none shadow-sm border-r border-slate-200/90">
        {/* Top Header: Organization & Role */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            {/* Circle Avatar Badge */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3B8CFF] to-[#1A57BD] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#3B8CFF]/20 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 text-sm tracking-tight truncate block font-heading">
                {user.organizationName || "Skyline Realty"}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block truncate">
                {roleBadge.label}
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Role Switcher Pill */}
        <div className="px-3 py-2 mx-3 my-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-[11px] font-semibold text-slate-700 truncate">
              {roleBadge.label}
            </span>
          </div>
          <button
            onClick={() => setRoleModalOpen(true)}
            className="text-[10px] font-bold text-[#3B8CFF] hover:text-[#1A57BD] transition flex items-center gap-1 uppercase tracking-wider flex-shrink-0"
          >
            <Sparkles className="w-3 h-3" /> Switch
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#3B8CFF] text-white shadow-sm shadow-[#3B8CFF]/25 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile & Sign Out */}
        <div className="p-3.5 border-t border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate block">
                {user.name}
              </span>
              <form action={logoutAction} className="mt-0.5">
                <button
                  type="submit"
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
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
