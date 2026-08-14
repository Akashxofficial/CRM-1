"use client";

import { formatCurrency } from "@/lib/utils";
import { Landmark, AlertCircle, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
  data: any;
}

export function AccountsDashboardView({ data }: Props) {
  const { metrics, userName } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Accounts Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-900 via-slate-900 to-yellow-950 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Landmark className="w-4 h-4" /> Finance & Dues Management
            </div>
            <h1 className="text-2xl font-extrabold mt-1 tracking-tight font-heading">
              Accounts Dashboard — {userName}
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Dispatch demand letters, track milestone collections, clear customer receipts, and analyze ageing dues.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/payments"
              className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition"
            >
              Generate Demand Letters
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Collections</span>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{formatCurrency(metrics.totalCollected)}</div>
          <p className="text-xs text-slate-500 mt-1">Bank receipts cleared</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Overdue Dues</span>
          <div className="mt-2 text-2xl font-bold text-rose-600">{formatCurrency(metrics.totalDue)}</div>
          <p className="text-xs text-rose-600 font-medium mt-1">Ageing demands pending</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Agreed Sales Portfolio</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(metrics.totalSalesValue)}</div>
          <p className="text-xs text-slate-500 mt-1">Total contract value</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Bookings</span>
          <div className="mt-2 text-2xl font-bold text-sky-600">{metrics.totalBookings} Active</div>
          <p className="text-xs text-slate-500 mt-1">Generating milestones</p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Payment Milestones & Demand Letters
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Review upcoming construction-linked milestones and send formal demand notices.
          </p>
          <Link
            href="/payments"
            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-amber-500" />
              <div>
                <span className="font-semibold text-xs text-slate-900 dark:text-white">Milestone Schedules</span>
                <p className="text-[11px] text-slate-400">Generate Demand Letter PDFs</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Ageing Dues Report
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Detailed 0-30, 31-60, 61-90, 90+ days overdue analysis by customer and sales agent.
          </p>
          <Link
            href="/payments?tab=ageing"
            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <div>
                <span className="font-semibold text-xs text-slate-900 dark:text-white">View Ageing Dues</span>
                <p className="text-[11px] text-slate-400">Check Overdue Collection Buckets</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
