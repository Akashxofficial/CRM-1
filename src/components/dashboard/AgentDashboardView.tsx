"use client";

import { formatCurrency } from "@/lib/utils";
import { User, CheckSquare, Clock, Phone, Calendar, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

interface Props {
  data: any;
}

export function AgentDashboardView({ data }: Props) {
  const { metrics, myTasks, recentLeads, userName } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Agent Welcome */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <User className="w-4 h-4" /> Sales Agent Workspace
            </div>
            <h1 className="text-2xl font-extrabold mt-1 tracking-tight font-heading">
              Hello, {userName}
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Your daily cockpit for lead follow-ups, client site visits, unit holds, and 1-click booking closures.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/leads?action=new"
              className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Walk-in Lead
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Pending Tasks & Calls</span>
          <div className="mt-2 text-2xl font-bold text-amber-500">{myTasks.length} Tasks</div>
          <p className="text-xs text-slate-500 mt-1">Follow-ups scheduled</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">My Active Hot Leads</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{metrics.activeLeads} Leads</div>
          <p className="text-xs text-blue-600 font-medium mt-1">Assigned to you</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">My Bookings This Month</span>
          <div className="mt-2 text-2xl font-bold text-emerald-600">3 Bookings</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">Target: 4 Bookings (75%)</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Available Inventory</span>
          <div className="mt-2 text-2xl font-bold text-sky-600">{metrics.availableUnits} Units</div>
          <p className="text-xs text-slate-500 mt-1">Ready for client pitching</p>
        </div>
      </div>

      {/* Today Tasks & My Active Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Follow-up Tasks */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" /> My Tasks & Reminders
            </h2>
          </div>
          <div className="space-y-3">
            {myTasks.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No pending tasks for today!</p>
            )}
            {myTasks.map((t: any) => (
              <div
                key={t.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{t.lead?.name} ({t.lead?.phone})</p>
                  <span className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Due: {new Date(t.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <Link
                  href={`/leads?id=${t.leadId}`}
                  className="p-2 text-xs font-semibold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-lg hover:bg-sky-200 transition"
                >
                  Action →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* My Leads Quick List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">My Active Leads</h2>
            <Link href="/leads" className="text-xs font-semibold text-sky-600">View Pipeline →</Link>
          </div>
          <div className="space-y-2.5">
            {recentLeads.slice(0, 5).map((lead: any) => (
              <Link
                key={lead.id}
                href={`/leads?id=${lead.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border border-slate-100 dark:border-slate-800"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{lead.name}</span>
                  <p className="text-xs text-slate-400">{lead.phone} • {lead.project?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    {lead.status}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
