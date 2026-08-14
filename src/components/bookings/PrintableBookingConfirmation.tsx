"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { Printer, X, Building, CheckCircle2 } from "lucide-react";

interface Props {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PrintableBookingConfirmation({ booking, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Action Header - Hidden on Print */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Official Booking Confirmation Letter</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-8 lg:p-12 overflow-y-auto print-page font-serif space-y-6">
          {/* Builder Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold font-sans tracking-tight text-slate-900">
                {booking.project?.organization?.name || "Skyline Realty & Infrastructure"}
              </h1>
              <p className="text-xs font-sans text-slate-600 mt-1">
                Corporate Office: Prestige Tech Park, Marathahalli-Sarjapur Ring Rd, Bangalore 560103
              </p>
              <p className="text-xs font-sans text-slate-600">
                RERA Reg No: <strong>{booking.project?.reraNumber}</strong>
              </p>
            </div>
            <div className="text-right font-sans">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Booking Confirmation</span>
              <div className="text-xl font-bold text-sky-700 mt-0.5">#{booking.bookingNumber}</div>
              <p className="text-xs text-slate-600">Date: {formatDate(booking.bookingDate)}</p>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-2 gap-6 font-sans text-xs pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold uppercase text-slate-500 block mb-1 text-[10px]">Allottee Details:</span>
              <p className="font-bold text-sm text-slate-900">{booking.lead?.name}</p>
              <p className="text-slate-600">Phone: {booking.lead?.phone}</p>
              <p className="text-slate-600">Email: {booking.lead?.email || "N/A"}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold uppercase text-slate-500 block mb-1 text-[10px]">Allotted Property Unit:</span>
              <p className="font-bold text-sm text-slate-900">
                Unit {booking.unit?.unitNumber} ({booking.unit?.type})
              </p>
              <p className="text-slate-600">{booking.project?.name} • {booking.unit?.tower?.name}</p>
              <p className="text-slate-600">Floor: {booking.unit?.floor} | Area: {booking.unit?.areaSqft} sq.ft</p>
            </div>
          </div>

          {/* Letter Body */}
          <div className="text-xs leading-relaxed text-slate-800 space-y-3 font-sans">
            <p>Dear <strong>{booking.lead?.name}</strong>,</p>
            <p>
              We are delighted to confirm the provisional allotment of <strong>Unit {booking.unit?.unitNumber}</strong> at{" "}
              <strong>{booking.project?.name}</strong>, located at {booking.project?.location}.
            </p>
            <p>
              The Total Agreed Consideration Value for the unit is <strong>{formatCurrency(booking.agreementValue)}</strong> (Rupees{" "}
              {booking.agreementValue?.toLocaleString("en-IN")}). We acknowledge receipt of the initial booking amount of{" "}
              <strong>{formatCurrency(booking.bookingAmountReceived)}</strong>.
            </p>
          </div>

          {/* Payment Schedule Table */}
          <div className="space-y-2 font-sans text-xs">
            <span className="font-bold uppercase text-slate-600 text-[11px]">Agreed Milestone Payment Schedule:</span>
            <table className="w-full text-left border border-slate-200 text-xs">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2 border-b">Milestone</th>
                  <th className="p-2 border-b">% Due</th>
                  <th className="p-2 border-b">Due Amount</th>
                  <th className="p-2 border-b">Due Date</th>
                  <th className="p-2 border-b text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {booking.schedules?.map((s: any) => (
                  <tr key={s.id}>
                    <td className="p-2">{s.milestoneName}</td>
                    <td className="p-2 font-mono">{s.percentage}%</td>
                    <td className="p-2 font-bold">{formatCurrency(s.dueAmount)}</td>
                    <td className="p-2">{formatDate(s.dueDate)}</td>
                    <td className="p-2 text-right">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${s.status === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-12 grid grid-cols-2 gap-8 font-sans text-xs text-slate-700">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold">Customer Signature</p>
              <p className="text-[11px] text-slate-500">({booking.lead?.name})</p>
            </div>
            <div className="border-t border-slate-400 pt-2 text-right">
              <p className="font-bold">Authorized Signatory</p>
              <p className="text-[11px] text-slate-500">For {booking.project?.organization?.name || "PropCRM Developers"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
