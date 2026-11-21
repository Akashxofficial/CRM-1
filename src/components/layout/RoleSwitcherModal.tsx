"use client";

import { useState, useTransition } from "react";
import { UserRole } from "@/lib/rbac";
import { switchDemoRoleAction } from "@/actions/auth-actions";
import {
  ShieldCheck,
  Users,
  User,
  Landmark,
  FileText,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

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
    email: "admin@urbangaon.com",
  },
  {
    role: "SALES_MANAGER",
    title: "Sales Manager",
    subtitle: "Team leads, pipeline velocity, hold & booking approvals",
    icon: Users,
    color: "from-blue-600 to-cyan-600",
    email: "manager@urbangaon.com",
  },
  {
    role: "SALES_AGENT",
    title: "Sales Agent",
    subtitle: "Personal leads, daily follow-ups, unit holds & customer conversion",
    icon: User,
    color: "from-emerald-600 to-teal-600",
    email: "agent@urbangaon.com",
  },
  {
    role: "ACCOUNTS",
    title: "Accounts / Finance",
    subtitle: "Milestones, payment receipts, demand letters & overdue ageing",
    icon: Landmark,
    color: "from-amber-500 to-orange-600",
    email: "finance@urbangaon.com",
  },
  {
    role: "POST_SALES",
    title: "Post-Sales / Legal",
    subtitle: "Allotment, agreement, KYC, OC/CC, snags & possession handover",
    icon: FileText,
    color: "from-rose-500 to-pink-600",
    email: "legal@urbangaon.com",
  },
];

export function RoleSwitcherModal({ currentRole, currentName, isOpen, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  if (!isOpen) return null;

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    startTransition(async () => {
      await switchDemoRoleAction(role);
      onClose();
      window.location.reload();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[calc(100dvh-2rem)]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#1A57BD] to-[#3B8CFF] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h2 className="text-lg font-bold font-heading">
                Switch Persona / Stakeholder Role
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition text-sm"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-100 mt-1.5">
            Experience UrbanGaon CRM from any stakeholder&apos;s perspective with 1-click role swapping.
          </p>
        </div>

        {/* Roles List */}
        <div className="p-4 sm:p-6 space-y-2.5 overflow-y-auto max-h-[60vh]">
          {ROLES_CONFIG.map((item) => {
            const Icon = item.icon;
            const isCurrent = currentRole === item.role;
            const isSelected = selectedRole === item.role && isPending;

            return (
              <button
                key={item.role}
                onClick={() => handleSelectRole(item.role)}
                disabled={isPending}
                className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between group ${
                  isCurrent
                    ? "bg-[#F0F6FF] border-[#3B8CFF] ring-2 ring-[#3B8CFF]/20"
                    : "bg-[#F8FAFC] border-slate-200 hover:border-[#3B8CFF]/60 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm font-heading">
                        {item.title}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3B8CFF] text-white">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5 max-w-xs">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 ml-2">
                  {isSelected ? (
                    <Loader2 className="w-5 h-5 text-[#3B8CFF] animate-spin" />
                  ) : isCurrent ? (
                    <CheckCircle2 className="w-5 h-5 text-[#3B8CFF]" />
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-[#3B8CFF] transition">
                      Select →
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Active user: <strong className="text-slate-700">{currentName}</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
