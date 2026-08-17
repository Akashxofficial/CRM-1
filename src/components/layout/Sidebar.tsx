"use client";

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
  X,
} from "lucide-react";
import { SessionUser, ROLE_LABELS } from "@/lib/rbac";
import { logoutAction } from "@/actions/auth-actions";

interface Props {
  user: SessionUser;
  onCloseMobile?: () => void;
}

export function Sidebar({ user, onCloseMobile }: Props) {
  const pathname = usePathname();
  const roleBadge = ROLE_LABELS[user.role] || ROLE_LABELS.ADMIN;

  const initials = user.organizationName
    ? user.organizationName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "UG";

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
      name: "Projects",
      href: "/projects",
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
    <aside className="w-64 h-full bg-white text-slate-700 flex flex-col flex-shrink-0 select-none shadow-sm border-r border-slate-200/90 font-sans">
      {/* Top Header: Organization & Role */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Official UrbanGaon Logo Icon */}
          <img
            src="/urbangaon-icon.png"
            alt="UrbanGaon"
            className="w-9 h-9 rounded-full object-contain flex-shrink-0 shadow-xs"
          />
          <div className="min-w-0">
            <span className="font-bold text-slate-900 text-sm tracking-tight truncate block font-heading">
              UrbanGaon Realty
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

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
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

      {/* Bottom Profile & Settings */}
      <div className="p-3.5 border-t border-slate-100 bg-[#F8FAFC] space-y-2">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
            pathname === "/settings"
              ? "bg-[#3B8CFF] text-white font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>

        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-900 truncate">
            {user.name}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
