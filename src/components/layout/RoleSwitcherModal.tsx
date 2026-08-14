"use client";

import { useState, useTransition } from "react";
import { UserRole, ROLE_LABELS } from "@/lib/rbac";
import { switchDemoRoleAction } from "@/actions/auth-actions";
import { ShieldCheck, User, Users, Landmark, FileText, Check, Loader2 } from "lucide-react";

interface Props {
  currentRole: UserRole;
  currentName: string;
  isOpen: boolean;
  onClose: () => void;
}

const ROLES_CONFIG: Array<{
  role: UserRole;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  email: string;
}> = [
  {
    role: "ADMIN",
    title: "Admin / CEO",
    subtitle: "Full control — all projects, financials, users & executive reports",
    icon: ShieldCheck,
    color: "from-purple-600 to-indigo-600",
    email: "admin@propcrm.io",
  },
  {
    role: "SALES_MANAGER",
    title: "Sales Manager",
    subtitle: "Team leads, pipeline velocity, hold & booking approvals",
    icon: Users,
    color: "from-blue-600 to-cyan-600",
    email: "manager@propcrm.io",
  },
  {
    role: "SALES_AGENT",
    title: "Sales Agent",
    subtitle: "Personal leads, daily follow-ups, unit holds & customer conversion",
    icon: User,
    color: "from-emerald-600 to-teal-600",
    email: "agent@propcrm.io",
  },
  {
    role: "ACCOUNTS",
    title: "Accounts / Finance",
    subtitle: "Milestones, payment receipts, demand letters & overdue ageing",
    icon: Landmark,
    color: "from-amber-500 to-orange-600",
    email: "finance@propcrm.io",
  },
  {
    role: "POST_SALES",
    title: "Post-Sales / Legal",
    subtitle: "Allotment, agreement, KYC, OC/CC, snags & possession handover",
    icon: FileText,
    color: "from-rose-500 to-pink-600",
    email: "legal@propcrm.io",
  },
];

export function RoleSwitcherModal({ currentRole, currentName, isOpen, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  if (!isOpen) return null;

  const handleSwitch = (role: UserRole) => {
    setSelectedRole(role);
    startTransition(async () => {
      await switchDemoRoleAction(role);
      window.location.reload();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-[#163C7A] via-[#1A57BD] to-[#3B8CFF] text-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#B9D5FF]">
                Multi-Role Demo Switcher
              </span>
              <h2 className="text-lg sm:text-xl font-semibold mt-0.5">Switch User Persona & RBAC View</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition text-sm"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-100 mt-1.5">
            Experience PropCRM from any stakeholder&apos;s perspective with 1-click role swapping.
          </p>
        </div>

        {/* Roles List */}
        <div className="p-4 sm:p-6 space-y-2.5 overflow-y-auto">
          {ROLES_CONFIG.map((item) => {
            const Icon = item.icon;
            const isCurrent = currentRole === item.role;
            const isSelected = selectedRole === item.role && isPending;

            return (
              <button
                key={item.role}
                onClick={() => handleSwitch(item.role)}
                disabled={isPending}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                  isCurrent
                    ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 ring-2 ring-sky-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${item.color} shadow-sm`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">
                          Active Role
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.subtitle}
                    </p>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      {item.email}
                    </span>
                  </div>
                </div>

                <div>
                  {isSelected ? (
                    <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 group-hover:text-slate-600">Switch →</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
