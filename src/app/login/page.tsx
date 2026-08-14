"use client";

import { useState, useTransition } from "react";
import { switchDemoRoleAction } from "@/actions/auth-actions";
import { Building, ShieldCheck, Users, User, Landmark, FileText, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@propcrm.io");
  const [password, setPassword] = useState("password123");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleDemoLogin = (role: any, demoEmail: string) => {
    setError("");
    startTransition(async () => {
      const res = await switchDemoRoleAction(role);
      if (res.error) {
        setError(res.error);
      } else {
        window.location.href = "/dashboard";
      }
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      let role: any = "ADMIN";
      if (email.includes("manager")) role = "SALES_MANAGER";
      else if (email.includes("agent")) role = "SALES_AGENT";
      else if (email.includes("finance")) role = "ACCOUNTS";
      else if (email.includes("legal")) role = "POST_SALES";

      const res = await switchDemoRoleAction(role);
      if (res.error) {
        setError(res.error);
      } else {
        window.location.href = "/dashboard";
      }
    });
  };

  const demoAccounts = [
    { role: "ADMIN", name: "Admin / CEO", email: "admin@propcrm.io", icon: ShieldCheck, color: "border-purple-200 hover:border-purple-400 bg-purple-50/50 text-purple-700 hover:bg-purple-50" },
    { role: "SALES_MANAGER", name: "Sales Manager", email: "manager@propcrm.io", icon: Users, color: "border-blue-200 hover:border-blue-400 bg-blue-50/50 text-blue-700 hover:bg-blue-50" },
    { role: "SALES_AGENT", name: "Sales Agent", email: "agent@propcrm.io", icon: User, color: "border-emerald-200 hover:border-emerald-400 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50" },
    { role: "ACCOUNTS", name: "Accounts / Finance", email: "finance@propcrm.io", icon: Landmark, color: "border-amber-200 hover:border-amber-400 bg-amber-50/50 text-amber-700 hover:bg-amber-50" },
    { role: "POST_SALES", name: "Post-Sales / Legal", email: "legal@propcrm.io", icon: FileText, color: "border-rose-200 hover:border-rose-400 bg-rose-50/50 text-rose-700 hover:bg-rose-50" },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Left Column: Hero & Branding */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#163C7A] via-[#1A57BD] to-[#3B8CFF] text-white">
        {/* Background Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#0E254E]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#1A57BD] flex items-center justify-center shadow-lg font-bold">
              <Building className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white font-heading">
              PropCRM
            </span>
          </div>

          <div className="mt-16 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" /> Full Real Estate Lifecycle CRM
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Lead → Inventory → Booking → Possession
            </h1>
            <p className="mt-4 text-base text-slate-100 leading-relaxed">
              Engineered specifically for real estate builders and developer sales teams.
              Track tower inventory grids, streamline payment milestones, automate demand letters,
              and manage post-sales documentation seamlessly.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/15 flex flex-wrap items-center gap-8 text-xs text-white/80 relative z-10">
          <div>
            <p className="text-white font-bold text-lg">100%</p>
            <p>RBAC Enforced</p>
          </div>
          <div>
            <p className="text-white font-bold text-lg">1-Click</p>
            <p>Booking Conversion</p>
          </div>
          <div>
            <p className="text-white font-bold text-lg">Real-Time</p>
            <p>Inventory Hold Timers</p>
          </div>
        </div>
      </div>

      {/* Right Column: Instant Role Login & Credentials */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-slate-500 mt-1">
              Select any pre-configured demo role below for instant 1-click access:
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
              {error}
            </div>
          )}

          {/* 1-Click Demo Personas */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              ⚡ Instant 1-Click Demo Login:
            </span>
            {demoAccounts.map((account) => {
              const Icon = account.icon;
              return (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleDemoLogin(account.role, account.email)}
                  disabled={isPending}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all group ${account.color} shadow-2xs`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-2xs border border-slate-200/60 flex items-center justify-center text-slate-700 group-hover:text-[#3B8CFF] transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-[#3B8CFF] transition">
                        {account.name}
                      </div>
                      <div className="text-xs text-slate-500">{account.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-[#3B8CFF] transition">
                    <span>Log in</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 uppercase font-semibold">
              Or Manual Sign-In
            </span>
          </div>

          {/* Manual Form */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@vastucrm.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-sm shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-sm shadow-2xs"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-[#3B8CFF] hover:bg-[#2570E8] font-bold text-white shadow-md shadow-[#3B8CFF]/25 flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In to PropCRM</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Reference Product: <strong>app.vastucrm.com</strong> demo credentials (`demo@vastucrm.com` / `vastu@123`) are fully supported.
          </p>
        </div>
      </div>
    </div>
  );
}
