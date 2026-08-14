"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarCheck,
  CreditCard,
  FolderLock,
  KeyRound,
  BarChart3,
  LogOut,
  Sparkles,
  Building,
  X,
} from "lucide-react";
import { SessionUser, ROLE_LABELS, hasPermission } from "@/lib/rbac";
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

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: "Inventory Matrix",
      href: "/inventory",
      icon: Building2,
      show: true,
    },
    {
      name: "Leads & Pipeline",
      href: "/leads",
      icon: Users,
      show: true,
    },
    {
      name: "Bookings",
      href: "/bookings",
      icon: CalendarCheck,
      show: true,
    },
    {
      name: "Payments & Demands",
      href: "/payments",
      icon: CreditCard,
      show: hasPermission(user.role, "VIEW_PAYMENTS"),
    },
    {
      name: "Post-Sales & Docs",
      href: "/documents",
      icon: FolderLock,
      show: hasPermission(user.role, "MANAGE_POST_SALES_DOCS") || user.role === "ADMIN",
    },
    {
      name: "Possession & Snags",
      href: "/possession",
      icon: KeyRound,
      show: hasPermission(user.role, "MANAGE_POSSESSION") || user.role === "ADMIN",
    },
    {
      name: "Reports & Analytics",
      href: "/reports",
      icon: BarChart3,
      show: user.role === "ADMIN" || user.role === "SALES_MANAGER" || user.role === "ACCOUNTS",
    },
  ];

  return (
    <>
      <aside className="w-64 h-full bg-white text-slate-700 flex flex-col flex-shrink-0 border-r border-slate-200/90 select-none shadow-sm">
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3B8CFF] to-[#1A57BD] flex items-center justify-center text-white shadow-md shadow-[#3B8CFF]/20 group-hover:scale-105 transition">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight font-heading flex items-center gap-1.5">
                PropCRM
                <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.2 bg-[#F0F6FF] text-[#3B8CFF] rounded border border-[#B9D5FF]">
                  PRO
                </span>
              </span>
              <p className="text-[11px] text-slate-500 truncate max-w-[120px]">
                {user.organizationName}
              </p>
            </div>
          </Link>

          {/* Close button for Mobile Drawer */}
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

        {/* Role Persona Card */}
        <div className="p-3.5 mx-3 my-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Role Persona
            </span>
            <button
              onClick={() => setRoleModalOpen(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#3B8CFF] hover:text-[#1A57BD] transition"
            >
              <Sparkles className="w-3 h-3" /> Switch
            </button>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${roleBadge.badgeColor}`}>
              {roleBadge.label}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            Core Modules
          </div>
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[#3B8CFF] text-white shadow-sm shadow-[#3B8CFF]/30 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B8CFF] to-[#1A57BD] flex items-center justify-center text-white font-bold text-xs shadow-2xs flex-shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Role Switcher Modal inside Sidebar */}
      <RoleSwitcherModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        currentRole={user.role}
        currentName={user.name}
      />
    </>
  );
}
