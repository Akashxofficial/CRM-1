"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatTime } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Building,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import Link from "next/link";

interface Props {
  data: any;
}

export function AdminDashboardView({ data }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { metrics, funnelData, topAgents, recentActivities, monthlySales, userName } = data;

  const totalInventory = metrics.totalUnits || 1;
  const soldPercent = Math.round((metrics.soldUnits / totalInventory) * 100);
  const bookedPercent = Math.round((metrics.bookedUnits / totalInventory) * 100);
  const heldPercent = Math.round((metrics.heldUnits / totalInventory) * 100);
  const availablePercent = Math.round((metrics.availableUnits / totalInventory) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#163C7A] via-[#1A57BD] to-[#3B8CFF] text-white shadow-lg shadow-[#3B8CFF]/15 border border-[#1A57BD]/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B9D5FF]">
              <ShieldCheck className="w-4 h-4" /> Executive Overview
            </div>
            <h1 className="text-xl lg:text-2xl font-semibold mt-1 tracking-normal font-sans">
              Welcome, <span className="font-normal text-slate-100">{userName}</span>
            </h1>
            <p className="text-sm text-slate-100 mt-1 max-w-xl">
              Track multi-project sales performance, live inventory absorption, milestone collections, and funnel velocity in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/inventory"
              className="px-4 py-2 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-xl backdrop-blur-sm border border-white/20 transition flex items-center gap-1.5"
            >
              <Building className="w-4 h-4" /> View Inventory
            </Link>
            <Link
              href="/leads"
              className="px-4 py-2 text-xs font-semibold bg-white text-[#1A57BD] hover:bg-slate-50 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" /> View Leads
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Value */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Sales Value</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(metrics.totalSalesValue)}
          </div>
          <div className="mt-1 flex items-center text-xs text-emerald-600 font-medium gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{metrics.totalBookings} Active Bookings</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Milestone Collections</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(metrics.totalCollected)}
          </div>
          <div className="mt-1 flex items-center text-xs text-slate-500">
            <span>Outstanding Dues: {formatCurrency(metrics.totalDue)}</span>
          </div>
        </div>

        {/* Active Pipeline Leads */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Active Leads Pipeline</span>
            <div className="p-2 rounded-xl bg-[#F0F6FF] text-[#3B8CFF]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {metrics.activeLeads} / {metrics.totalLeads}
          </div>
          <div className="mt-1 flex items-center text-xs text-slate-500">
            <span>{metrics.totalLeads - metrics.activeLeads} Converted / Closed</span>
          </div>
        </div>

        {/* Total Units Booked / Sold */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Absorption Rate</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {metrics.soldUnits + metrics.bookedUnits} / {metrics.totalUnits} Units
          </div>
          <div className="mt-1 flex items-center text-xs text-amber-600 font-medium">
            <span>{soldPercent + bookedPercent}% Sold or Under Booking</span>
          </div>
        </div>
      </div>

      {/* Charts Section: Monthly Sales Trend & Funnel Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Collections Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Booking Value vs Collections
              </h2>
              <p className="text-xs text-slate-400">
                Revenue generated from new agreements vs actual cash milestone inflow
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415520" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), ""]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "12px",
                      color: "#ffffff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="sales" name="Booking Value" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="collections" name="Collections" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-slate-500">
                Loading Sales Chart...
              </div>
            )}
          </div>
        </div>

        {/* Inventory Status Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Inventory Distribution
            </h2>
            <p className="text-xs text-slate-400 mb-6">Live unit status across all towers</p>

            {/* Stacked Bar Visualizer */}
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 mb-6">
              <div style={{ width: `${availablePercent}%` }} className="bg-emerald-500" title={`Available: ${availablePercent}%`} />
              <div style={{ width: `${heldPercent}%` }} className="bg-amber-500" title={`Held: ${heldPercent}%`} />
              <div style={{ width: `${bookedPercent}%` }} className="bg-blue-500" title={`Booked: ${bookedPercent}%`} />
              <div style={{ width: `${soldPercent}%` }} className="bg-rose-500" title={`Sold: ${soldPercent}%`} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Available</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {metrics.availableUnits} units ({availablePercent}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Held (Negotiating)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {metrics.heldUnits} units ({heldPercent}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Booked</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {metrics.bookedUnits} units ({bookedPercent}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Sold & Handed Over</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {metrics.soldUnits} units ({soldPercent}%)
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/inventory"
            className="mt-6 w-full py-2.5 text-center text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition block"
          >
            Open Interactive Unit Matrix →
          </Link>
        </div>
      </div>

      {/* Funnel Pipeline & Top Sales Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Full-Funnel Lead Pipeline */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Lead Funnel Conversion
              </h2>
              <p className="text-xs text-slate-400">
                Progression from initial enquiry to confirmed booking
              </p>
            </div>
            <Link
              href="/leads"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              View Pipeline →
            </Link>
          </div>

          <div className="space-y-3">
            {funnelData.map((stage: any) => {
              const maxLeads = metrics.totalLeads || 1;
              const pct = Math.round((stage.count / maxLeads) * 100);

              return (
                <div key={stage.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {stage.stage}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {stage.count} leads ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.max(5, pct)}%` }}
                      className={`h-full rounded-full ${
                        stage.key === "BOOKED"
                          ? "bg-emerald-500"
                          : stage.key === "NEGOTIATION"
                          ? "bg-blue-500"
                          : stage.key === "LOST"
                          ? "bg-rose-400"
                          : "bg-sky-500"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Agents & Leaderboard */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Sales Leaderboard
              </h2>
              <p className="text-xs text-slate-400">Top agents by booked volume & value</p>
            </div>
          </div>

          <div className="space-y-4">
            {topAgents.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No bookings recorded yet.</p>
            )}
            {topAgents.map((agent: any, idx: number) => (
              <div
                key={agent.name}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? "bg-amber-400 text-slate-900"
                        : idx === 1
                        ? "bg-slate-300 text-slate-800"
                        : "bg-amber-700/60 text-white"
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {agent.name}
                    </span>
                    <p className="text-xs text-slate-400">{agent.bookings} confirmed bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {formatCurrency(agent.value)}
                  </span>
                  <p className="text-[11px] text-emerald-600 font-medium">Top Performer</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline Stream */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Team Activities & Interactions
          </h2>
        </div>
        <div className="space-y-3">
          {recentActivities.map((act: any) => (
            <div
              key={act.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
            >
              <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white text-xs">
                    {act.lead?.name} — {act.title}
                  </span>
                  <span className="text-[11px] text-slate-400" suppressHydrationWarning>
                    {formatTime(act.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {act.notes}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Logged by: {act.performedBy?.name || "System"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
