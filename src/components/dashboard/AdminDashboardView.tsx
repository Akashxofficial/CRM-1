"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Calendar,
  ChevronDown,
  Building,
  Users,
  CheckCircle2,
  PhoneCall,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface Props {
  data: any;
}

export function AdminDashboardView({ data }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [timeRange, setTimeRange] = useState("Last 6 months");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    metrics,
    callsMetrics = { callsToday: 0, connectedCalls: 0, connectionRate: 0, staleLeadsCount: 0 },
    funnelStages = [],
    leadSources = [],
    repLeaderboard = [],
    monthlySales = [],
    userName = "Demo",
  } = data;

  const timeRangeOptions = [
    "Today",
    "Last 7 days",
    "Last 30 days",
    "Last 3 months",
    "Last 6 months",
    "This Year",
    "All Time",
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header: Title & Time Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back, <strong className="font-semibold text-slate-700">{userName}</strong>
          </p>
        </div>

        {/* Date Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsTimeDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/90 shadow-2xs transition"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{timeRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {isTimeDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              {timeRangeOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setTimeRange(opt);
                    setIsTimeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-medium transition ${
                    timeRange === opt
                      ? "bg-[#F0F6FF] text-[#3B8CFF] font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: PERFORMANCE · LAST 6 MONTHS */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          Performance · {timeRange}
        </span>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Booked Value */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs min-w-0">
            <span className="text-xs font-medium text-slate-500">Booked Value</span>
            <div className="mt-2 text-lg sm:text-2xl lg:text-3xl font-bold text-emerald-500 tracking-tight font-heading truncate">
              {formatCurrency(metrics.totalSalesValue)}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {metrics.totalBookings} bookings
            </p>
          </div>

          {/* Pipeline Value */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs min-w-0">
            <span className="text-xs font-medium text-slate-500">Pipeline Value</span>
            <div className="mt-2 text-lg sm:text-2xl lg:text-3xl font-bold text-[#3B8CFF] tracking-tight font-heading truncate">
              {formatCurrency(metrics.pipelineValue)}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {metrics.openUnitsCount || 0} units open · now
            </p>
          </div>

          {/* Conversion */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs min-w-0">
            <span className="text-xs font-medium text-slate-500">Conversion</span>
            <div className="mt-2 text-lg sm:text-2xl lg:text-3xl font-bold text-amber-500 tracking-tight font-heading truncate">
              {metrics.conversionRate}%
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {metrics.totalBookings} of {metrics.totalLeads} leads
            </p>
          </div>

          {/* Avg Ticket Size */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs min-w-0">
            <span className="text-xs font-medium text-slate-500">Avg Ticket Size</span>
            <div className="mt-2 text-lg sm:text-2xl lg:text-3xl font-bold text-sky-500 tracking-tight font-heading truncate">
              {formatCurrency(metrics.avgTicketSize)}
            </div>
            <p className="mt-1 text-xs text-slate-400">per booking</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: CALLS · TODAY */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          Calls · Today
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Calls Today */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-medium text-slate-500">Calls Today</span>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-[#3B8CFF] tracking-tight font-heading">
              {callsMetrics.callsToday}
            </div>
            <p className="mt-1 text-xs text-slate-400">via Exotel or manual</p>
          </div>

          {/* Connection Rate */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-medium text-slate-500">Connection Rate</span>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-500 tracking-tight font-heading">
              {callsMetrics.connectionRate}%
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {callsMetrics.connectedCalls} connected
            </p>
          </div>

          {/* Not Called 3d+ */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-medium text-slate-500">Not Called 3d+</span>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-500 tracking-tight font-heading">
              {callsMetrics.staleLeadsCount}
            </div>
            <p className="mt-1 text-xs text-slate-400">active leads going stale</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: QUICK METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Leads */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs min-w-0">
          <span className="text-xs font-medium text-slate-500">Total Leads</span>
          <div className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-[#3B8CFF] tracking-tight font-heading truncate">
            {metrics.totalLeads}
          </div>
        </div>

        {/* Booked */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs min-w-0">
          <span className="text-xs font-medium text-slate-500">Booked</span>
          <div className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-500 tracking-tight font-heading truncate">
            {metrics.bookedUnits}
          </div>
        </div>

        {/* Total Units */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs min-w-0">
          <span className="text-xs font-medium text-slate-500">Total Units</span>
          <div className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-amber-500 tracking-tight font-heading truncate">
            {metrics.totalUnits}
          </div>
        </div>

        {/* Units Sold */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs min-w-0">
          <span className="text-xs font-medium text-slate-500">Units Sold</span>
          <div className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-sky-500 tracking-tight font-heading truncate">
            {metrics.soldUnits}
          </div>
        </div>
      </div>

      {/* SECTION 4: TWO-COLUMN ROW (Lead Funnel + Inventory Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Lead Funnel Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4 font-heading">
            Lead Funnel
          </h2>

          <div className="space-y-2">
            {funnelStages.map((stage: any) => {
              const isBooked = stage.key === "BOOKED";
              return (
                <div
                  key={stage.key}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                    isBooked
                      ? "bg-emerald-50/60 border-emerald-300/80 font-bold text-emerald-900"
                      : "bg-[#F8FAFC] border-slate-200/70 text-slate-700"
                  }`}
                >
                  <span className="font-medium">{stage.label}</span>
                  <span className={`font-bold ${isBooked ? "text-emerald-600" : "text-slate-800"}`}>
                    {stage.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Summary Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 font-heading">
                Inventory Summary
              </h2>
              <span className="text-[11px] text-slate-400 lowercase">current</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Available */}
              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#3B8CFF] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {metrics.availableUnits}
                </div>
                <span className="text-xs font-semibold text-blue-900">Available</span>
              </div>

              {/* Hold */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {metrics.heldUnits}
                </div>
                <span className="text-xs font-semibold text-amber-900">Hold</span>
              </div>

              {/* Booked */}
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {metrics.bookedUnits}
                </div>
                <span className="text-xs font-semibold text-emerald-900">Booked</span>
              </div>

              {/* Sold */}
              <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {metrics.soldUnits}
                </div>
                <span className="text-xs font-semibold text-teal-900">Sold</span>
              </div>

              {/* Cancelled / Blocked */}
              <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-100 flex items-center gap-3 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {metrics.blockedUnits || 0}
                </div>
                <span className="text-xs font-semibold text-rose-900">Cancelled / Blocked</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Live absorption across all active towers & project inventories.
          </p>
        </div>
      </div>

      {/* SECTION 5: TWO-COLUMN ROW (Lead Sources + Sales Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Lead Sources Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4 font-heading">
            Lead Sources
          </h2>

          <div className="space-y-4">
            {leadSources.map((src: any) => (
              <div key={src.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{src.name}</span>
                  <span className="text-slate-400 font-medium">
                    {src.count} — {src.percentage}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.max(8, src.percentage)}%` }}
                    className="h-full bg-[#3B8CFF] rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Trend Chart Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900 font-heading">
                Sales Trend
              </h2>
              <span className="text-[11px] text-slate-400 lowercase">by month · last 6 months</span>
            </div>

            <div className="h-44 w-full mt-2">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySales}>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis hide />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val)), "Sales Value"]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: "10px",
                        color: "#ffffff",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="sales" fill="#3B8CFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Loading sales trend...
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Total booked · last 6 months</span>
            <strong className="text-slate-900 font-bold font-heading">
              {formatCurrency(metrics.totalSalesValue)}
            </strong>
          </div>
        </div>
      </div>

      {/* SECTION 6: REP LEADERBOARD CARD */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 font-heading">
            Rep Leaderboard
          </h2>
          <span className="text-[11px] text-slate-400 lowercase">by booked value · last 6 months</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[500px]">
            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 pb-2">
              <tr>
                <th className="py-2.5 font-bold w-10">#</th>
                <th className="py-2.5 font-bold">REP</th>
                <th className="py-2.5 font-bold text-center">LEADS</th>
                <th className="py-2.5 font-bold text-center">BOOKED</th>
                <th className="py-2.5 font-bold text-right">VALUE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {repLeaderboard.map((rep: any, idx: number) => (
                <tr key={rep.name} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 font-bold text-slate-500">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-900">
                    {rep.name}
                  </td>
                  <td className="py-3 text-center text-slate-600 font-medium">
                    {rep.leads}
                  </td>
                  <td className="py-3 text-center text-slate-600 font-medium">
                    {rep.booked}
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900">
                    <div className="flex items-center justify-end gap-3">
                      <span>{formatCurrency(rep.value)}</span>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                        <div
                          style={{ width: `${Math.max(10, rep.percentage || 100)}%` }}
                          className="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
