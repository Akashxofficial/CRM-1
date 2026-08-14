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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Agent Welcome */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#163C7A] via-[#1A57BD] to-[#3B8CFF] text-white shadow-md border border-[#1A57BD]/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B9D5FF]">
              <User className="w-4 h-4" /> Sales Agent Workspace
            </div>
            <h1 className="text-xl lg:text-2xl font-semibold mt-1 tracking-normal font-sans">
              Hello, <span className="font-normal text-slate-100">{userName}</span>
            </h1>
            <p className="text-xs text-slate-100 mt-1 max-w-xl">
              Your daily cockpit for lead follow-ups, client site visits, unit holds, and 1-click booking closures.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/leads?action=new"
              className="px-4 py-2 text-xs font-semibold bg-white text-[#1A57BD] hover:bg-slate-50 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Walk-in Lead
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Pending Tasks & Calls</span>
          <div className="mt-2 text-2xl font-semibold text-amber-500">{myTasks.length} Tasks</div>
          <p className="text-xs text-slate-500 mt-1">Follow-ups scheduled</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">My Active Hot Leads</span>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{metrics.activeLeads} Leads</div>
          <p className="text-xs text-[#3B8CFF] font-medium mt-1">Assigned to you</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">My Bookings This Month</span>
          <div className="mt-2 text-2xl font-semibold text-emerald-600">3 Bookings</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">Target: 4 Bookings (75%)</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Site Visits Completed</span>
          <div className="mt-2 text-2xl font-semibold text-slate-900">8 Completed</div>
          <p className="text-xs text-slate-500 mt-1">This month</p>
        </div>
      </div>

      {/* Follow-up Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#3B8CFF]" /> Today&apos;s Follow-up Agenda
            </h2>
            <span className="text-xs text-slate-400">{myTasks.length} Pending</span>
          </div>

          <div className="space-y-3">
            {myTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No pending tasks for today!</p>
            ) : (
              myTasks.map((task: any) => (
                <div key={task.id} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{task.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Client: <strong className="text-slate-700">{task.lead?.name}</strong> ({task.lead?.phone})
                    </div>
                  </div>
                  <Link
                    href={`/leads`}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 text-[#3B8CFF] hover:bg-slate-50 rounded-lg transition"
                  >
                    Action
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3B8CFF]" /> Recently Assigned Leads
            </h2>
            <Link href="/leads" className="text-xs font-semibold text-[#3B8CFF] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentLeads.slice(0, 4).map((lead: any) => (
              <div key={lead.id} className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">{lead.name}</div>
                  <div className="text-[11px] text-slate-500">{lead.phone} • {lead.interestedType || "Residential"}</div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#F0F6FF] text-[#3B8CFF] rounded-full border border-[#B9D5FF]">
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
