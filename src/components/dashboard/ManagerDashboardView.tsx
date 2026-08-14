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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Manager Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <Users className="w-4 h-4" /> Sales Head & Pipeline Command
            </div>
            <h1 className="text-2xl font-extrabold mt-1 tracking-tight font-heading">
              Sales Dashboard — {userName}
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Monitor team lead distribution, site visit completions, pending unit holds, and booking approvals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/bookings"
              className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md transition"
            >
              Approve Bookings
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Team Total Leads</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalLeads}</div>
          <p className="text-xs text-blue-600 font-medium mt-1">{metrics.activeLeads} in active pipeline</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Units on Hold (Negotiating)</span>
          <div className="mt-2 text-2xl font-bold text-amber-500">{metrics.heldUnits} Units</div>
          <p className="text-xs text-slate-500 mt-1">Active hold timers running</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Confirmed Bookings</span>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{metrics.totalBookings}</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">Total: {formatCurrency(metrics.totalSalesValue)}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Conversion Ratio</span>
          <div className="mt-2 text-2xl font-bold text-purple-600">
            {metrics.totalLeads > 0 ? Math.round((metrics.totalBookings / metrics.totalLeads) * 100) : 0}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Enquiry to booking closure</p>
        </div>
      </div>

      {/* Team Funnel & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Funnel */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Team Pipeline Velocity
          </h2>
          <div className="space-y-3">
            {funnelData.map((f: any) => (
              <div key={f.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{f.stage}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
                  {f.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Team Leads */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Enquiries</h2>
            <Link href="/leads" className="text-xs font-semibold text-sky-600">View All →</Link>
          </div>
          <div className="space-y-2.5">
            {recentLeads.map((lead: any) => (
              <Link
                key={lead.id}
                href={`/leads?id=${lead.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border border-slate-100 dark:border-slate-800"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{lead.name}</span>
                  <div className="text-[11px] text-slate-400 flex gap-2">
                    <span>{lead.phone}</span>
                    <span>•</span>
                    <span>Assigned: {lead.assignedTo?.name || "Unassigned"}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  {lead.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
