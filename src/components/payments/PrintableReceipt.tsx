"use client";

import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Printer, X, CheckCircle2 } from "lucide-react";

interface Props {
  transaction: any;
  booking: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PrintableReceipt({ transaction, booking, isOpen, onClose }: Props) {
  if (!isOpen || !transaction || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Action Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Official Payment Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document */}
        <div className="p-8 overflow-y-auto print-page font-sans space-y-6">
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {booking.project?.organization?.name || "Skyline Realty & Infrastructure"}
              </h1>
              <p className="text-xs text-slate-600">RERA Reg: {booking.project?.reraNumber}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                PAYMENT RECEIPT
              </span>
              <div className="text-sm font-bold text-slate-900 mt-1">Receipt #{transaction.receiptNumber}</div>
              <p className="text-[11px] text-slate-500">{formatDate(transaction.paymentDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Received From:</span>
              <strong className="text-slate-900 text-sm block">{booking.lead?.name}</strong>
              <p className="text-slate-500">Phone: {booking.lead?.phone}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Against Unit / Booking:</span>
              <strong className="text-slate-900 text-sm block">Unit {booking.unit?.unitNumber}</strong>
              <p className="text-slate-500">Booking #{booking.bookingNumber}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <div className="flex justify-between border-b border-emerald-200 pb-2">
              <span className="text-slate-600">Amount Received:</span>
              <strong className="text-emerald-700 text-lg font-black">{formatCurrency(transaction.amountPaid)}</strong>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Payment Mode:</span>
              <strong>{transaction.mode}</strong>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Transaction Reference / UTR:</span>
              <span className="font-mono font-bold">{transaction.referenceNo}</span>
            </div>
            {transaction.bankName && (
              <div className="flex justify-between text-slate-700">
                <span>Bank:</span>
                <span>{transaction.bankName}</span>
              </div>
            )}
          </div>

          <div className="pt-8 grid grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <p className="text-[10px] text-slate-400">Computer-generated receipt, valid without physical seal.</p>
            </div>
            <div className="border-t border-slate-300 pt-2 text-right">
              <p className="font-bold text-slate-900">Authorized Accounts Signatory</p>
              <p className="text-[10px] text-slate-500">{booking.project?.organization?.name || "UrbanGaon Developers"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
