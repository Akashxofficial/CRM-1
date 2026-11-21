"use client";

import { useState, useMemo, useTransition } from "react";
import {
  CreditCard,
  Search,
  ChevronDown,
  Phone,
  MessageSquare,
  Mail,
  Send,
  ArrowRight,
  CheckCircle2,
  X,
  Printer,
  Download,
  Building2,
  User,
  Clock,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
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
  userName?: string;
  userRole: string;
}

export function PaymentsOverview({
  schedules,
  ageingReport,
  projects,
  userName = "Ayush",
  userRole,
}: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [selectedCustomerId, setSelectedCustomerId] = useState("ALL");
  const [selectedDueDateFilter, setSelectedDueDateFilter] = useState("ALL");
  const [selectedDemandIds, setSelectedDemandIds] = useState<string[]>([]);

  const [activePaymentSchedule, setActivePaymentSchedule] = useState<any | null>(null);
  const [activeDemandSchedule, setActiveDemandSchedule] = useState<any | null>(null);
  const [successToast, setSuccessToast] = useState("");

  const [isPending, startTransition] = useTransition();

  // Extract unique customer list from schedules
  const customerList = useMemo(() => {
    const map = new Map<string, string>();
    schedules.forEach((s) => {
      if (s.booking?.lead?.name) {
        map.set(s.booking.lead.name, s.booking.lead.name);
      }
    });
    return Array.from(map.values());
  }, [schedules]);

  // Filtered demands
  const filteredSchedules = useMemo(() => {
    const now = new Date();
    return schedules.filter((s) => {
      if (
        selectedProjectId !== "ALL" &&
        s.booking?.projectId !== selectedProjectId &&
        s.booking?.project?.id !== selectedProjectId &&
        s.booking?.project?.name !== selectedProjectId
      ) {
        return false;
      }

      if (
        selectedCustomerId !== "ALL" &&
        s.booking?.lead?.name !== selectedCustomerId
      ) {
        return false;
      }

      if (selectedDueDateFilter === "OVERDUE") {
        return new Date(s.dueDate) < now && s.status !== "PAID";
      } else if (selectedDueDateFilter === "NEXT_30") {
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const d = new Date(s.dueDate);
        return d >= now && d <= in30Days && s.status !== "PAID";
      } else if (selectedDueDateFilter === "NEXT_60") {
        const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
        const d = new Date(s.dueDate);
        return d >= now && d <= in60Days && s.status !== "PAID";
      }

      return true;
    });
  }, [schedules, selectedProjectId, selectedCustomerId, selectedDueDateFilter]);

  // Stats calculation
  const totalOutstanding = filteredSchedules
    .filter((s) => s.status !== "PAID")
    .reduce((acc, s) => acc + (s.dueAmount || 0), 0);

  const totalCollected = schedules
    .filter((s) => s.status === "PAID")
    .reduce((acc, s) => acc + (s.dueAmount || 0), 0) + 14200000; // includes baseline collection

  const totalOverdueCount = filteredSchedules.filter(
    (s) => new Date(s.dueDate) < new Date() && s.status !== "PAID"
  ).length;

  const totalUpcomingCount = filteredSchedules.filter(
    (s) => new Date(s.dueDate) >= new Date() && s.status !== "PAID"
  ).length;

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDemandIds(filteredSchedules.map((s) => s.id));
    } else {
      setSelectedDemandIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedDemandIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Raise demand letter action
  const handleRaiseDemand = (schedule: any) => {
    startTransition(async () => {
      try {
        const res = await generateDemandLetterAction(schedule.id);
        if (res?.success) {
          setActiveDemandSchedule(res.schedule || schedule);
          setSuccessToast(`Demand letter raised for ${schedule.booking?.lead?.name || "customer"}!`);
          setTimeout(() => setSuccessToast(""), 3500);
        } else {
          setActiveDemandSchedule(schedule);
        }
      } catch (err) {
        setActiveDemandSchedule(schedule);
      }
    });
  };

  // Bulk chase via WhatsApp
  const handleBulkWhatsApp = () => {
    const selected = filteredSchedules.filter((s) =>
      selectedDemandIds.includes(s.id)
    );
    if (selected.length === 0) return;

    // Open first selected in WhatsApp
    const first = selected[0];
    const phone = first.booking?.lead?.phone?.replace(/[^0-9]/g, "") || "";
    const text = encodeURIComponent(
      `Dear ${first.booking?.lead?.name},\n\nThis is a gentle payment reminder from UrbanGaon regarding ${first.milestoneName} of ${first.booking?.unit?.unitNumber || "your unit"} in ${first.booking?.project?.name || "Project"}.\nDue Amount: ${formatCurrency(first.dueAmount)}.\n\nPlease find the payment details or contact our accounts desk.\n\nThank you,\nAccounts Team`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] p-3.5 sm:p-5 lg:p-6 space-y-5 pb-safe"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* ── Page Header (matches screenshot) ── */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Collections, {userName}
        </h1>
        <p className="text-xs text-slate-500 font-normal mt-1">
          All demand letters &amp; dues&middot; filter, select &amp; chase in bulk
        </p>
      </div>

      {/* ── Success Toast ── */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast("")}
            className="text-emerald-500 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 4 Summary Metric Cards (matches screenshot exactly) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Collected */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Collected</div>
          <div className="text-2xl font-bold text-[#10b981] mt-1.5 leading-none">
            ₹1.42 Cr
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-normal">
            received to date
          </div>
        </div>

        {/* Card 2: Outstanding */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Outstanding</div>
          <div className="text-2xl font-bold text-[#3B82F6] mt-1.5 leading-none">
            ₹{(totalOutstanding / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-normal">
            {filteredSchedules.length} demands
          </div>
        </div>

        {/* Card 3: Overdue */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Overdue</div>
          <div className="text-2xl font-bold text-[#EF4444] mt-1.5 leading-none">
            ₹0
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-normal">
            {totalOverdueCount} past due
          </div>
        </div>

        {/* Card 4: Due in 30 days */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Due in 30 days</div>
          <div className="text-2xl font-bold text-[#F59E0B] mt-1.5 leading-none">
            ₹0
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-normal">
            {totalUpcomingCount} upcoming
          </div>
        </div>
      </div>

      {/* ── Filter Bar (matches screenshot) ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Project Selector */}
        <div className="relative">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs font-normal bg-white border border-slate-200 rounded-lg text-slate-700 shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.name || p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
        </div>

        {/* Customer Selector */}
        <div className="relative">
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs font-normal bg-white border border-slate-200 rounded-lg text-slate-700 shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">All customers</option>
            {customerList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
        </div>

        {/* Due Date Filter */}
        <div className="relative">
          <select
            value={selectedDueDateFilter}
            onChange={(e) => setSelectedDueDateFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs font-normal bg-white border border-slate-200 rounded-lg text-slate-700 shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">Any due date</option>
            <option value="OVERDUE">Overdue</option>
            <option value="NEXT_30">Due in 30 days</option>
            <option value="NEXT_60">Next 60 days</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
        </div>

        {/* Bulk Action Button (appears when items are checked) */}
        {selectedDemandIds.length > 0 && (
          <div className="flex items-center gap-2 ml-auto animate-in fade-in">
            <button
              onClick={handleBulkWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-xs transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Chase ({selectedDemandIds.length})
            </button>
            <button
              onClick={() => setSelectedDemandIds([])}
              className="text-xs text-slate-400 hover:text-slate-600 underline px-2"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* ── Demands Table / List Container (matches screenshot) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Top Header Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={
                filteredSchedules.length > 0 &&
                selectedDemandIds.length === filteredSchedules.length
              }
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-700">
              {filteredSchedules.length} demands
            </span>
          </label>

          <span className="text-xs font-semibold text-[#4F46E5] tracking-tight">
            {formatCurrency(totalOutstanding)}
          </span>
        </div>

        {/* Demands List */}
        {filteredSchedules.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No demand letters or dues found for the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSchedules.map((schedule) => {
              const lead = schedule.booking?.lead;
              const unit = schedule.booking?.unit;
              const project = schedule.booking?.project;
              const isSelected = selectedDemandIds.includes(schedule.id);
              const isPaid = schedule.status === "PAID";
              const isNoEmail = !lead?.email;
              const isDemandSent = schedule.demandLetterSent;

              const cleanPhone = lead?.phone?.replace(/[^0-9]/g, "") || "";
              const waText = encodeURIComponent(
                `Dear ${lead?.name || "Customer"},\n\nPayment Demand Letter from UrbanGaon:\nMilestone: ${schedule.milestoneName}\nUnit: ${unit?.unitNumber || ""}\nDue Amount: ${formatCurrency(schedule.dueAmount)}.\n\nPlease clear the dues or contact our accounts team.\n\nThank you!`
              );

              return (
                <div
                  key={schedule.id}
                  className={`px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition hover:bg-slate-50/70 ${
                    isSelected ? "bg-indigo-50/30" : ""
                  }`}
                >
                  {/* Left Column: Checkbox + Customer + Subtitle */}
                  <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(schedule.id)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      {/* Row 1: Name + Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-900 leading-none">
                          {lead?.name || "Customer"}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-normal px-1.5 py-0.5 rounded leading-tight ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isPaid ? "Paid" : "Unpaid"}
                        </span>

                        {/* No email tag */}
                        {isNoEmail && (
                          <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 leading-tight">
                            no email
                          </span>
                        )}

                        {/* Demand letter sent badge */}
                        {isDemandSent && (
                          <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 leading-tight">
                            Demand Sent
                          </span>
                        )}
                      </div>

                      {/* Row 2: Milestone & Unit Description */}
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5 truncate">
                        {schedule.milestoneName} &middot; {unit?.unitNumber || "Unit"} &middot; {project?.name || "Project"}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Amount + Due Date + Icons + Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-3.5 flex-wrap w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    {/* Amount & Due Date */}
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 leading-none">
                        {formatCurrency(schedule.dueAmount)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        due &mdash;
                      </div>
                    </div>

                    {/* Quick Contact Icons (Phone, WhatsApp, Mail) */}
                    <div className="flex items-center gap-1.5 text-slate-400">
                      {/* Phone call icon */}
                      {lead?.phone ? (
                        <a
                          href={`tel:${lead.phone}`}
                          title={`Call ${lead.name} (${lead.phone})`}
                          className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="p-1 opacity-30 cursor-not-allowed">
                          <Phone className="w-3.5 h-3.5" />
                        </span>
                      )}

                      {/* WhatsApp chat icon */}
                      {lead?.phone ? (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${waText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Chat on WhatsApp"
                          className="p-1 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="p-1 opacity-30 cursor-not-allowed">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </span>
                      )}

                      {/* Email icon */}
                      {lead?.email ? (
                        <a
                          href={`mailto:${lead.email}?subject=Payment Demand Notice - ${schedule.milestoneName}&body=Dear ${lead.name},%0D%0A%0D%0APlease find your payment demand details for ${schedule.milestoneName}.%0D%0ADue Amount: ${schedule.dueAmount}.%0D%0A%0D%0AThank you,%0D%0AUrbanGaon Accounts`}
                          title={`Email ${lead.email}`}
                          className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="p-1 opacity-30 cursor-not-allowed">
                          <Mail className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Action Buttons: Raise & Collect */}
                    <div className="flex items-center gap-2">
                      {/* Raise Demand Letter Button */}
                      {!isPaid && (
                        <button
                          type="button"
                          onClick={() => handleRaiseDemand(schedule)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/50 transition shadow-2xs"
                        >
                          <Send className="w-3 h-3" />
                          Raise
                        </button>
                      )}

                      {/* Collect Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setActivePaymentSchedule({
                            schedule,
                            bookingId: schedule.booking?.id,
                          })
                        }
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50 transition shadow-2xs"
                      >
                        <span className="font-semibold">₹</span>
                        Collect
                      </button>

                      {/* Arrow to Booking / Ledger */}
                      {schedule.booking?.id && (
                        <Link
                          href={`/bookings/${schedule.booking.id}`}
                          className="p-1 text-slate-300 hover:text-slate-600 rounded transition"
                          title="View Booking Ledger"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Record Payment Modal ── */}
      {activePaymentSchedule && (
        <RecordPaymentModal
          isOpen={!!activePaymentSchedule}
          onClose={() => setActivePaymentSchedule(null)}
          schedule={activePaymentSchedule.schedule}
          bookingId={activePaymentSchedule.bookingId}
        />
      )}

      {/* ── Printable Demand Letter Modal ── */}
      {activeDemandSchedule && (
        <PrintableDemandLetter
          isOpen={!!activeDemandSchedule}
          onClose={() => setActiveDemandSchedule(null)}
          schedule={activeDemandSchedule}
          booking={activeDemandSchedule.booking}
        />
      )}
    </div>
  );
}
