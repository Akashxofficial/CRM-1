"use client";

import { useState, useTransition } from "react";
import {
  CalendarCheck,
  Search,
  Plus,
  FileText,
  CheckCircle,
  Building,
  User,
  ArrowRight,
  Sparkles,
  Download,
  Loader2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { approveBookingAction } from "@/actions/bookings-actions";
import Link from "next/link";
import { BookingConversionWizard } from "./BookingConversionWizard";

interface Props {
  initialBookings: any[];
  projects: any[];
  leads: any[];
  availableUnits: any[];
  paymentPlans: any[];
  userRole: string;
}

export function BookingsListView({
  initialBookings,
  projects,
  leads,
  availableUnits,
  paymentPlans,
  userRole,
}: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  const filteredBookings = initialBookings.filter((b) => {
    if (selectedProjectId !== "ALL" && b.projectId !== selectedProjectId) return false;
    if (selectedStatus !== "ALL" && b.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = b.bookingNumber.toLowerCase().includes(q);
      const matchLead = b.lead?.name.toLowerCase().includes(q);
      const matchUnit = b.unit?.unitNumber.toLowerCase().includes(q);
      if (!matchNum && !matchLead && !matchUnit) return false;
    }
    return true;
  });

  const handleApprove = (bookingId: string) => {
    startTransition(async () => {
      await approveBookingAction(bookingId);
      window.location.reload();
    });
  };

  const exportCSV = () => {
    const headers = ["Booking #", "Customer", "Phone", "Project", "Unit", "Agreement Value", "Token Received", "Status", "Sales Agent", "Date"];
    const rows = filteredBookings.map((b) => [
      `"${b.bookingNumber}"`,
      `"${b.lead?.name || ""}"`,
      `"${b.lead?.phone || ""}"`,
      `"${b.project?.name || ""}"`,
      `"${b.unit?.unitNumber || ""}"`,
      `"${b.agreementValue}"`,
      `"${b.bookingAmountReceived}"`,
      `"${b.status}"`,
      `"${b.salesAgent?.name || "Direct"}"`,
      `"${formatDate(b.bookingDate)}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `urbangaon_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <CalendarCheck className="w-5 h-5 text-[#3B8CFF]" /> Bookings & Agreement Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed unit sales, milestone payment schedules, and post-sales documentation tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> 1-Click New Booking
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Booking #, Customer name or Unit #..."
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
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROVISIONAL">Provisional</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Booking #</th>
                <th className="p-4">Buyer / Customer</th>
                <th className="p-4">Unit & Project</th>
                <th className="p-4">Agreement Value</th>
                <th className="p-4">Booking Token</th>
                <th className="p-4">Status</th>
                <th className="p-4">Sales Agent</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    No bookings found. Convert a lead to create a booking!
                  </td>
                </tr>
              )}
              {filteredBookings.map((b) => {
                const isConfirmed = b.status === "CONFIRMED";

                return (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-4">
                      <Link
                        href={`/bookings/${b.id}`}
                        className="font-bold text-sky-600 hover:text-sky-500 font-mono text-sm block"
                      >
                        #{b.bookingNumber}
                      </Link>
                      <span className="text-[10px] text-slate-400">{formatDate(b.bookingDate)}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{b.lead?.name}</div>
                      <div className="text-slate-400 text-[11px]">{b.lead?.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        Unit {b.unit?.unitNumber} ({b.unit?.type})
                      </div>
                      <div className="text-slate-400 text-[11px]">{b.project?.name} • {b.unit?.tower?.name}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">
                      {formatCurrency(b.agreementValue)}
                    </td>
                    <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(b.bookingAmountReceived)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          isConfirmed
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {b.salesAgent?.name || "Direct / Admin"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isConfirmed && (userRole === "ADMIN" || userRole === "SALES_MANAGER") && (
                          <button
                            onClick={() => handleApprove(b.id)}
                            disabled={isPending}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                          >
                            Approve
                          </button>
                        )}

                        <Link
                          href={`/bookings/${b.id}`}
                          className="px-3 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Wizard Modal */}
      <BookingConversionWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        leads={leads}
        availableUnits={availableUnits}
        paymentPlans={paymentPlans}
      />
    </div>
  );
}
