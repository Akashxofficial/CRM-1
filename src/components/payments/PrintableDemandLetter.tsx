"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { Printer, X, FileText, AlertCircle } from "lucide-react";

interface Props {
  schedule: any;
  booking: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PrintableDemandLetter({ schedule, booking, isOpen, onClose }: Props) {
  if (!isOpen || !schedule || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Action Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Official Payment Demand Notice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Demand Letter Document */}
        <div className="p-8 lg:p-12 overflow-y-auto print-page font-serif space-y-6">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold font-sans tracking-tight text-slate-900">
                {booking.project?.organization?.name || "Skyline Realty & Infrastructure"}
              </h1>
              <p className="text-xs font-sans text-slate-600 mt-1">
                Site Office: {booking.project?.location}
              </p>
              <p className="text-xs font-sans text-slate-600">
                RERA Reg No: <strong>{booking.project?.reraNumber}</strong>
              </p>
            </div>
            <div className="text-right font-sans">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                DEMAND NOTICE
              </span>
              <div className="text-sm font-bold text-slate-900 mt-2">Ref: DEM/{booking.bookingNumber}/{schedule.milestoneCode}</div>
              <p className="text-xs text-slate-600">Date: {formatDate(new Date())}</p>
            </div>
          </div>

          {/* Customer & Unit Box */}
          <div className="grid grid-cols-2 gap-6 font-sans text-xs pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold uppercase text-slate-500 block mb-1 text-[10px]">To:</span>
              <p className="font-bold text-sm text-slate-900">{booking.lead?.name}</p>
              <p className="text-slate-600">Phone: {booking.lead?.phone}</p>
              <p className="text-slate-600">Email: {booking.lead?.email || "N/A"}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold uppercase text-slate-500 block mb-1 text-[10px]">Unit Allotted:</span>
              <p className="font-bold text-sm text-slate-900">
                Unit {booking.unit?.unitNumber} ({booking.unit?.type})
              </p>
              <p className="text-slate-600">{booking.project?.name} • {booking.unit?.tower?.name}</p>
              <p className="text-slate-600">Booking Ref: #{booking.bookingNumber}</p>
            </div>
          </div>

          {/* Letter Body */}
          <div className="text-xs leading-relaxed text-slate-800 space-y-3 font-sans">
            <p>Dear <strong>{booking.lead?.name}</strong>,</p>
            <p>
              We are pleased to inform you of the ongoing construction progress at <strong>{booking.project?.name}</strong>.
              As per the terms of your Allotment and Agreement for Sale, the construction milestone for{" "}
              <strong>&ldquo;{schedule.milestoneName}&rdquo;</strong> has been successfully achieved on site.
            </p>
            <p>
              Accordingly, the milestone installment of <strong>{schedule.percentage}%</strong> amounting to{" "}
              <strong>{formatCurrency(schedule.dueAmount)}</strong> is now payable on or before{" "}
              <strong>{formatDate(schedule.dueDate)}</strong>.
            </p>
          </div>

          {/* Demand Breakdown Table */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 font-sans text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-amber-200">
              <span className="font-semibold text-slate-700">Milestone Stage:</span>
              <strong className="text-slate-900">{schedule.milestoneName} ({schedule.percentage}%)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-amber-200">
              <span className="font-semibold text-slate-700">Total Agreed Unit Value:</span>
              <span className="text-slate-900">{formatCurrency(booking.agreementValue)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-amber-200">
              <span className="font-semibold text-slate-700">Due Date for Payment:</span>
              <strong className="text-rose-700">{formatDate(schedule.dueDate)}</strong>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span className="font-bold text-slate-900">Total Net Amount Payable:</span>
              <strong className="text-slate-900 font-extrabold text-base">{formatCurrency(schedule.dueAmount)}</strong>
            </div>
          </div>

          {/* Bank Payment Instructions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-sans text-xs space-y-1">
            <span className="font-bold uppercase text-slate-700 text-[10px] block mb-1">
              Designated Builder RERA Escrow Account Details:
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>Account Name: <strong>Skyline Realty Escrow A/c</strong></div>
              <div>Bank: <strong>HDFC Bank Ltd.</strong></div>
              <div>Account Number: <strong>50200088912234</strong></div>
              <div>IFSC Code: <strong>HDFC0001234</strong></div>
            </div>
          </div>

          {/* Signature */}
          <div className="pt-8 grid grid-cols-2 gap-8 font-sans text-xs text-slate-700">
            <div>
              <p className="text-[11px] text-slate-500">
                Please quote your Booking Number <strong>#{booking.bookingNumber}</strong> in NEFT / RTGS narration.
              </p>
            </div>
            <div className="border-t border-slate-400 pt-2 text-right">
              <p className="font-bold">Accounts & Collections Department</p>
              <p className="text-[11px] text-slate-500">{booking.project?.organization?.name || "UrbanGaon Infrastructure"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
