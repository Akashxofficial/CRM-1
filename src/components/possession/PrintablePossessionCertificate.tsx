"use client";

import { formatDate } from "@/lib/utils";
import { Printer, X, KeyRound, CheckCircle2 } from "lucide-react";

interface Props {
  possession: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PrintablePossessionCertificate({ possession, isOpen, onClose }: Props) {
  if (!isOpen || !possession) return null;

  const handlePrint = () => {
    window.print();
  };

  const booking = possession.booking;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Action Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Official Certificate of Possession & Handover</span>
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
        <div className="p-8 lg:p-12 overflow-y-auto print-page font-serif space-y-6">
          <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold font-sans tracking-tight text-slate-900">
                {booking?.project?.organization?.name || "Skyline Realty & Infrastructure"}
              </h1>
              <p className="text-xs font-sans text-slate-600 mt-1">
                Project: {booking?.project?.name} • RERA Reg: {booking?.project?.reraNumber}
              </p>
            </div>
            <div className="text-right font-sans">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                POSSESSION CERTIFICATE
              </span>
              <div className="text-sm font-bold text-slate-900 mt-2">Doc Ref: POSS/{booking?.bookingNumber}</div>
              <p className="text-xs text-slate-600">Date: {formatDate(possession.actualDate || new Date())}</p>
            </div>
          </div>

          <div className="text-center font-sans py-4">
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">
              Certificate of Physical Possession & Key Handover
            </h2>
          </div>

          <div className="text-xs leading-relaxed text-slate-800 space-y-3 font-sans">
            <p>
              This is to certify that physical possession and keys for <strong>Unit {booking?.unit?.unitNumber}</strong> (
              {booking?.unit?.type}, Super Built-up Area: {booking?.unit?.areaSqft} sq.ft), located at{" "}
              <strong>{booking?.project?.name}</strong>, {booking?.project?.location}, has been officially handed over to the allottee(s):
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-sm text-slate-900">{booking?.lead?.name}</p>
              <p className="text-slate-600">Contact: {booking?.lead?.phone} | Email: {booking?.lead?.email || "N/A"}</p>
              <p className="text-slate-600">Booking Number: #{booking?.bookingNumber}</p>
            </div>
            <p>
              The allottee has inspected the premises, fixtures, fittings, and verified all snag items as rectified to satisfaction.
            </p>
          </div>

          {/* Meter Readings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-sans text-xs space-y-2">
            <span className="font-bold uppercase text-slate-700 text-[10px]">Verified Utility Meter Numbers:</span>
            <div className="grid grid-cols-3 gap-4 text-slate-700">
              <div>Electricity Meter: <strong>{possession.electricityMeterNo || "BESCOM-LT-8891223"}</strong></div>
              <div>Water Meter: <strong>{possession.waterMeterNo || "BWSSB-WT-441299"}</strong></div>
              <div>Piped Gas Meter: <strong>{possession.gasMeterNo || "GAIL-GAS-110022"}</strong></div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-12 grid grid-cols-2 gap-8 font-sans text-xs text-slate-700">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold">Allottee / Buyer Signature</p>
              <p className="text-[11px] text-slate-500">I have taken vacant physical possession & keys.</p>
            </div>
            <div className="border-t border-slate-400 pt-2 text-right">
              <p className="font-bold">Authorized Project Engineer / Handover Lead</p>
              <p className="text-[11px] text-slate-500">For {booking?.project?.organization?.name || "PropCRM Developers"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
