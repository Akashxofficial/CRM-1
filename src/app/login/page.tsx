"use client";

import { useState, useTransition } from "react";
import { switchDemoRoleAction } from "@/actions/auth-actions";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@urbangaon.com");
  const [password, setPassword] = useState("urbangaon@123");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
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

  const featureCards = [
    { title: "Inventory", subtitle: "Track every unit" },
    { title: "Leads", subtitle: "Full-funnel CRM" },
    { title: "Bookings", subtitle: "One click conversion" },
    { title: "Payments", subtitle: "Demand letters & dues" },
    { title: "Post-Sales Docs", subtitle: "Allotment & agreements" },
    { title: "Possession", subtitle: "Snags & handover" },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans">
      {/* Left Column: Hero & Product Pillars */}
      <div className="lg:w-1/2 p-8 lg:p-14 flex flex-col justify-between relative bg-[#131633] text-white">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white font-bold text-sm shadow-md">
              <span className="text-white text-base">✦</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white font-heading">
              UrbanGaon
            </span>
          </div>

          {/* Headline & Description */}
          <div className="mt-12 lg:mt-16 max-w-lg">
            <h1 className="text-3xl lg:text-[42px] font-bold tracking-tight text-white leading-tight font-heading">
              Real Estate CRM <br />
              for Modern Developers
            </h1>
            <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
              From first enquiry to final possession — inventory, leads, bookings, payments, and post-sales documentation in one place.
            </p>
          </div>
        </div>

        {/* Feature Cards Grid (2x3) */}
        <div className="mt-12 grid grid-cols-2 gap-3 max-w-md">
          {featureCards.map((feat) => (
            <div
              key={feat.title}
              className="p-3.5 rounded-2xl bg-[#1c2045]/70 border border-[#2b3164]/70 shadow-sm"
            >
              <div className="text-xs font-bold text-white font-heading">{feat.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{feat.subtitle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Clean White Form */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-heading">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@urbangaon.com"
                className="w-full px-4 py-3 rounded-xl bg-[#F0F6FF] border border-blue-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-[#F0F6FF] border border-blue-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm font-medium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] font-bold text-white shadow-md shadow-[#4F46E5]/25 flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm mt-2"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Helper Credentials info */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-900 block">Default Demo Credentials:</span>
            <div className="flex justify-between">
              <span>Email:</span>
              <code className="font-bold text-[#4F46E5]">demo@urbangaon.com</code>
            </div>
            <div className="flex justify-between">
              <span>Password:</span>
              <code className="font-bold text-slate-800">urbangaon@123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
