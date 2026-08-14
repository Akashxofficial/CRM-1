"use client";

import { formatCurrency } from "@/lib/utils";
import { Users, CalendarCheck, CheckCircle2, UserCheck, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

interface Props {
  data: any;
}

export function ManagerDashboardView({ data }: Props) {
  const { metrics, funnelData, topAgents, recentLeads, userName } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Manager Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#163C7A] via-[#1A57BD] to-[#3B8CFF] text-white shadow-md border border-[#1A57BD]/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B9D5FF]">
              <Users className="w-4 h-4" /> Sales Head & Pipeline Command
            </div>
            <h1 className="text-xl lg:text-2xl font-semibold mt-1 tracking-normal font-sans">
              Sales Dashboard — <span className="font-normal text-slate-100">{userName}</span>
            </h1>
            <p className="text-xs text-slate-100 mt-1 max-w-xl">
              Monitor team lead distribution, site visit completions, pending unit holds, and booking approvals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/bookings"
              className="px-4 py-2 text-xs font-semibold bg-white text-[#1A57BD] hover:bg-slate-50 rounded-xl shadow-md transition"
            >
              Approve Bookings
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Team Total Leads</span>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{metrics.totalLeads}</div>
          <p className="text-xs text-[#3B8CFF] font-medium mt-1">{metrics.activeLeads} in active pipeline</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Units on Hold (Negotiating)</span>
          <div className="mt-2 text-2xl font-semibold text-amber-500">{metrics.heldUnits} Units</div>
          <p className="text-xs text-slate-500 mt-1">Active hold timers running</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Confirmed Bookings</span>
          <div className="mt-2 text-2xl font-semibold text-emerald-600">{metrics.totalBookings}</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">Total: {formatCurrency(metrics.totalSalesValue)}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Active Sales Agents</span>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{topAgents.length} Reps</div>
          <p className="text-xs text-slate-500 mt-1">Field & digital conversion</p>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Team Member Sales Conversion Leaderboard
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Agent Name</th>
                <th className="p-3">Bookings Locked</th>
                <th className="p-3">Total Value Realized</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topAgents.map((agent: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#F0F6FF] text-[#3B8CFF] flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    {agent.name}
                  </td>
                  <td className="p-3 text-slate-700 font-medium">{agent.bookings} Bookings</td>
                  <td className="p-3 font-semibold text-slate-900">{formatCurrency(agent.value)}</td>
                  <td className="p-3 text-right">
                    <Link
                      href="/leads"
                      className="text-[#3B8CFF] hover:underline font-semibold flex items-center gap-1 justify-end"
                    >
                      View Pipeline <ArrowRight className="w-3 h-3" />
                    </Link>
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
