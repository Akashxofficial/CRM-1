"use client";

import { useState, useTransition } from "react";
import {
  CalendarCheck,
  Building,
  User,
  CreditCard,
  FileText,
  KeyRound,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { generateDemandLetterAction } from "@/actions/payments-actions";
import { updateDocumentStatusAction } from "@/actions/documents-actions";
import { PrintableBookingConfirmation } from "./PrintableBookingConfirmation";
import { RecordPaymentModal } from "@/components/payments/RecordPaymentModal";
import { PrintableDemandLetter } from "@/components/payments/PrintableDemandLetter";
import { PrintableReceipt } from "@/components/payments/PrintableReceipt";
import Link from "next/link";

interface Props {
  booking: any;
  userRole: string;
}

export function BookingDetailView({ booking, userRole }: Props) {
  const [activeTab, setActiveTab] = useState<"payments" | "documents" | "possession">("payments");

  // Modals
  const [isBookingDocOpen, setIsBookingDocOpen] = useState(false);
  const [activePaymentSchedule, setActivePaymentSchedule] = useState<any | null>(null);
  const [activeDemandSchedule, setActiveDemandSchedule] = useState<any | null>(null);
  const [activeReceiptTx, setActiveReceiptTx] = useState<any | null>(null);

  const [isPending, startTransition] = useTransition();

  // Financial aggregates
  const totalPaid = booking.transactions?.reduce((acc: number, t: any) => acc + t.amountPaid, 0) || 0;
  const progressPercent = Math.min(100, Math.round((totalPaid / booking.agreementValue) * 100));

  const handleGenerateDemand = (scheduleId: string) => {
    startTransition(async () => {
      const res = await generateDemandLetterAction(scheduleId);
      if (res.success) {
        setActiveDemandSchedule(res.schedule);
      }
    });
  };

  const handleDocStatusChange = (docId: string, status: string) => {
    startTransition(async () => {
      await updateDocumentStatusAction({ docId, status });
      window.location.reload();
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Booking Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-bold text-sky-400">
              Booking Portfolio
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                booking.status === "CONFIRMED"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {booking.status}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold mt-1 tracking-tight font-heading">
            Booking #{booking.bookingNumber} — {booking.lead?.name}
          </h1>

          <p className="text-xs text-slate-300 mt-1 flex flex-wrap gap-4">
            <span>Project: <strong>{booking.project?.name}</strong></span>
            <span>Unit: <strong>{booking.unit?.unitNumber} ({booking.unit?.type})</strong></span>
            <span>Tower: <strong>{booking.unit?.tower?.name}</strong></span>
            <span>Date: <strong>{formatDate(booking.bookingDate)}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsBookingDocOpen(true)}
            className="px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm border border-white/10 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Booking Letter
          </button>
        </div>
      </div>

      {/* Financial Summary & Progress Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Agreement Value</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(booking.agreementValue)}
          </div>
          <p className="text-xs text-slate-400 mt-1">{booking.paymentPlan?.name || "Standard CLP Plan"}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Cleared Collections</span>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {formatCurrency(totalPaid)}
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1">{progressPercent}% of Agreement Paid</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Outstanding Balance Due</span>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            {formatCurrency(Math.max(0, booking.agreementValue - totalPaid))}
          </div>
          <p className="text-xs text-slate-400 mt-1">Across remaining milestones</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Assigned Sales Agent</span>
          <div className="mt-2 text-base font-bold text-slate-900 dark:text-white">
            {booking.salesAgent?.name || "Direct Sale"}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Approved by: {booking.approvedBy?.name || "Auto / Pending"}
          </p>
        </div>
      </div>

      {/* Tabs: Milestone Payments vs Post-Sales Documents vs Possession */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("payments")}
          className={`py-3 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === "payments"
              ? "border-sky-500 text-sky-500"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Payment Milestones ({booking.schedules?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`py-3 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === "documents"
              ? "border-sky-500 text-sky-500"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Post-Sales Paperwork ({booking.documents?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("possession")}
          className={`py-3 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === "possession"
              ? "border-sky-500 text-sky-500"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Possession & Handover
        </button>
      </div>

      {/* TAB 1: Payment Milestones */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Milestone Schedule & Demand Dispatch
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Milestone</th>
                    <th className="p-4">% Due</th>
                    <th className="p-4">Due Amount</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Demand Letter</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {booking.schedules?.map((s: any) => {
                    const isPaid = s.status === "PAID";
                    const isOverdue = s.status === "OVERDUE";

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">
                          {s.milestoneName}
                        </td>
                        <td className="p-4 font-mono font-semibold text-slate-600 dark:text-slate-300">
                          {s.percentage}%
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">
                          {formatCurrency(s.dueAmount)}
                        </td>
                        <td className="p-4 text-slate-500">{formatDate(s.dueDate)}</td>
                        <td className="p-4">
                          {s.demandLetterSent ? (
                            <button
                              onClick={() => setActiveDemandSchedule(s)}
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
                          {!isPaid && (
                            <button
                              onClick={() => setActivePaymentSchedule(s)}
                              className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition"
                            >
                              Record Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Receipts History */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Cleared Payment Receipts ({booking.transactions?.length || 0})
            </h2>
            <div className="space-y-2.5">
              {booking.transactions?.map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">Receipt #{tx.receiptNumber}</span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        {tx.mode}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Ref: {tx.referenceNo} • Bank: {tx.bankName || "Direct"} • {formatDate(tx.paymentDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(tx.amountPaid)}
                    </span>
                    <button
                      onClick={() => setActiveReceiptTx(tx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
                      title="Print Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Post-Sales Paperwork Checklist */}
      {activeTab === "documents" && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Post-Sales Legal Documentation Checklist
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track lifecycle: Allotment Letter → Sale Agreement → KYC → OC/CC → Sale Deed
            </p>
          </div>

          <div className="space-y-3">
            {booking.documents?.map((doc: any) => {
              const isVerified = doc.status === "VERIFIED" || doc.status === "REGISTERED";

              return (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${
                        isVerified
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                      }`}
                    >
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {doc.title}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Status: <strong>{doc.status}</strong> • Updated: {formatDate(doc.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={doc.status}
                      onChange={(e) => handleDocStatusChange(doc.id, e.target.value)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="GENERATED">Generated</option>
                      <option value="UPLOADED">Uploaded Signed Copy</option>
                      <option value="VERIFIED">Verified & Approved</option>
                      <option value="REGISTERED">Legally Registered</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Possession & Snag Clearance */}
      {activeTab === "possession" && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Possession & Key Handover Readiness
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect unit defects, record meter readings, and issue Possession Handover Certificate.
              </p>
            </div>
            <Link
              href="/possession"
              className="px-3.5 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm"
            >
              Open Possession Module →
            </Link>
          </div>

          {booking.possession ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Possession Status:</span>
                <span className="font-bold text-emerald-500">{booking.possession.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Inspection Scheduled:</span>
                <span className="text-slate-200">{formatDate(booking.possession.scheduledDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Electricity Meter:</span>
                <span className="text-slate-200 font-mono">{booking.possession.electricityMeterNo || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Water Meter:</span>
                <span className="text-slate-200 font-mono">{booking.possession.waterMeterNo || "N/A"}</span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              Possession is not yet scheduled for this booking.
            </div>
          )}
        </div>
      )}

      {/* Printable Booking Document Modal */}
      <PrintableBookingConfirmation
        isOpen={isBookingDocOpen}
        onClose={() => setIsBookingDocOpen(false)}
        booking={booking}
      />

      {/* Record Payment Modal */}
      {activePaymentSchedule && (
        <RecordPaymentModal
          isOpen={true}
          onClose={() => setActivePaymentSchedule(null)}
          schedule={activePaymentSchedule}
          bookingId={booking.id}
        />
      )}

      {/* Printable Demand Letter Modal */}
      {activeDemandSchedule && (
        <PrintableDemandLetter
          isOpen={true}
          onClose={() => setActiveDemandSchedule(null)}
          schedule={activeDemandSchedule}
          booking={booking}
        />
      )}

      {/* Printable Receipt Modal */}
      {activeReceiptTx && (
        <PrintableReceipt
          isOpen={true}
          onClose={() => setActiveReceiptTx(null)}
          transaction={activeReceiptTx}
          booking={booking}
        />
      )}
    </div>
  );
}
