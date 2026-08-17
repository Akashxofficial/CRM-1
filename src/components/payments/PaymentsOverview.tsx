"use client";

import { useState, useTransition } from "react";
import {
  CreditCard,
  Search,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  Download,
  DollarSign,
  Printer,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generateDemandLetterAction } from "@/actions/payments-actions";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { PrintableDemandLetter } from "./PrintableDemandLetter";
import Link from "next/link";

interface Props {
  schedules: any[];
  ageingReport: any;
  projects: any[];
  userRole: string;
}

export function PaymentsOverview({
  schedules,
  ageingReport,
  projects,
  userRole,
}: Props) {
  const [activeTab, setActiveTab] = useState<"schedules" | "ageing">("schedules");
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [activePaymentSchedule, setActivePaymentSchedule] = useState<any | null>(null);
  const [activeDemandSchedule, setActiveDemandSchedule] = useState<any | null>(null);

  const [isPending, startTransition] = useTransition();

  const filteredSchedules = schedules.filter((s) => {
    if (selectedProjectId !== "ALL" && s.booking.projectId !== selectedProjectId) return false;
    if (selectedStatus !== "ALL" && s.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = s.booking.bookingNumber.toLowerCase().includes(q);
      const matchName = s.booking.lead?.name.toLowerCase().includes(q);
      const matchUnit = s.booking.unit?.unitNumber.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchUnit) return false;
    }
    return true;
  });

  const handleGenerateDemand = (scheduleId: string) => {
    startTransition(async () => {
      const res = await generateDemandLetterAction(scheduleId);
      if (res.success) {
        setActiveDemandSchedule(res.schedule);
      }
    });
  };

  const exportCSV = () => {
    const headers = ["Booking #", "Customer", "Unit", "Milestone", "%", "Due Amount", "Due Date", "Status"];
    const rows = filteredSchedules.map((s) => [
      `"${s.booking.bookingNumber}"`,
      `"${s.booking.lead?.name || ""}"`,
      `"${s.booking.unit?.unitNumber || ""}"`,
      `"${s.milestoneName}"`,
      `"${s.percentage}"`,
      `"${s.dueAmount}"`,
      `"${formatDate(s.dueDate)}"`,
      `"${s.status}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `urbangaon_milestones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-slate-900 tracking-normal flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#3B8CFF]" /> Payments & Milestone Demands
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch formal Demand Letters upon slab completion, issue payment receipts, and manage overdue ageing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("schedules")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "schedules"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Milestone Demands
            </button>
            <button
              onClick={() => setActiveTab("ageing")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "ageing"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Overdue Ageing Report
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* TAB 1: Milestone Schedules */}
      {activeTab === "schedules" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Booking #, Buyer or Unit #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="w-48">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="ALL">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="w-36">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Customer & Booking</th>
                    <th className="p-4">Unit & Project</th>
                    <th className="p-4">Milestone</th>
                    <th className="p-4">Due Amount</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Demand Notice</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSchedules.map((s) => {
                    const isPaid = s.status === "PAID";
                    const isOverdue = s.status === "OVERDUE";

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-4">
                          <Link
                            href={`/bookings/${s.booking.id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-sky-500 block"
                          >
                            {s.booking.lead?.name}
                          </Link>
                          <span className="text-[11px] text-slate-400 font-mono">#{s.booking.bookingNumber}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            Unit {s.booking.unit?.unitNumber}
                          </span>
                          <span className="text-slate-400 text-[11px] block">{s.booking.project?.name}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-slate-900 dark:text-white">{s.milestoneName}</span>
                          <span className="text-slate-400 text-[11px] block">{s.percentage}% of agreement</span>
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">
                          {formatCurrency(s.dueAmount)}
                        </td>
                        <td className="p-4 text-slate-500">{formatDate(s.dueDate)}</td>
                        <td className="p-4">
                          {s.demandLetterSent ? (
                            <button
                              onClick={() => {
                                setActiveDemandSchedule({ ...s, booking: s.booking });
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-1 hover:bg-amber-100 transition"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Notice</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerateDemand(s.id)}
                              disabled={isPending || isPaid}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-40 transition"
                            >
                              Dispatch Demand
                            </button>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              isPaid
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                : isOverdue
                                ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {!isPaid ? (
                            <button
                              onClick={() => setActivePaymentSchedule(s)}
                              className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition"
                            >
                              Record Payment
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-semibold">Cleared ✓</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Overdue Ageing Report */}
      {activeTab === "ageing" && (
        <div className="space-y-6">
          {/* Summary KPI */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border border-slate-800 text-white shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Total Overdue Dues
            </span>
            <div className="text-3xl font-extrabold mt-1">
              {formatCurrency(ageingReport.grandTotal)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Broken down into 30-day ageing delinquency brackets.
            </p>
          </div>

          {/* 4 Ageing Brackets */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase text-amber-500">0 - 30 Days Overdue</span>
              <div className="text-xl font-bold mt-2 text-slate-900 dark:text-white">
                {formatCurrency(ageingReport.bracket_0_30.totalAmount)}
              </div>
              <p className="text-xs text-slate-400 mt-1">{ageingReport.bracket_0_30.count} Demands</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase text-orange-500">31 - 60 Days Overdue</span>
              <div className="text-xl font-bold mt-2 text-slate-900 dark:text-white">
                {formatCurrency(ageingReport.bracket_31_60.totalAmount)}
              </div>
              <p className="text-xs text-slate-400 mt-1">{ageingReport.bracket_31_60.count} Demands</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase text-rose-500">61 - 90 Days Overdue</span>
              <div className="text-xl font-bold mt-2 text-slate-900 dark:text-white">
                {formatCurrency(ageingReport.bracket_61_90.totalAmount)}
              </div>
              <p className="text-xs text-slate-400 mt-1">{ageingReport.bracket_61_90.count} Demands</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase text-red-600">90+ Days Critical</span>
              <div className="text-xl font-bold mt-2 text-slate-900 dark:text-white">
                {formatCurrency(ageingReport.bracket_90_plus.totalAmount)}
              </div>
              <p className="text-xs text-slate-400 mt-1">{ageingReport.bracket_90_plus.count} Demands</p>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {activePaymentSchedule && (
        <RecordPaymentModal
          isOpen={true}
          onClose={() => setActivePaymentSchedule(null)}
          schedule={activePaymentSchedule}
          bookingId={activePaymentSchedule.bookingId}
        />
      )}

      {/* Printable Demand Letter Modal */}
      {activeDemandSchedule && (
        <PrintableDemandLetter
          isOpen={true}
          onClose={() => setActiveDemandSchedule(null)}
          schedule={activeDemandSchedule}
          booking={activeDemandSchedule.booking}
        />
      )}
    </div>
  );
}
