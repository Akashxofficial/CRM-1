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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Accounts Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#163C7A] via-[#1A57BD] to-[#3B8CFF] text-white shadow-md border border-[#1A57BD]/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B9D5FF]">
              <Landmark className="w-4 h-4" /> Finance & Dues Management
            </div>
            <h1 className="text-xl lg:text-2xl font-semibold mt-1 tracking-normal font-sans">
              Accounts Dashboard — <span className="font-normal text-slate-100">{userName}</span>
            </h1>
            <p className="text-xs text-slate-100 mt-1 max-w-xl">
              Dispatch demand letters, track milestone collections, clear customer receipts, and analyze ageing dues.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/payments"
              className="px-4 py-2 text-xs font-semibold bg-white text-[#1A57BD] hover:bg-slate-50 rounded-xl shadow-md transition"
            >
              Generate Demand Letters
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Collections</span>
          <div className="mt-2 text-2xl font-semibold text-emerald-600">{formatCurrency(metrics.totalCollected)}</div>
          <p className="text-xs text-slate-500 mt-1">Bank receipts cleared</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Overdue Dues</span>
          <div className="mt-2 text-2xl font-semibold text-rose-600">{formatCurrency(metrics.totalDue)}</div>
          <p className="text-xs text-rose-600 font-medium mt-1">Ageing demands pending</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Agreed Sales Portfolio</span>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(metrics.totalSalesValue)}</div>
          <p className="text-xs text-slate-500 mt-1">Total contract value</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Recovery Ratio</span>
          <div className="mt-2 text-2xl font-semibold text-[#3B8CFF]">
            {Math.round((metrics.totalCollected / (metrics.totalSalesValue || 1)) * 100)}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Overall realized collections</p>
        </div>
      </div>
    </div>
  );
}
