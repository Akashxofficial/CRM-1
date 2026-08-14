"use client";

import { useState, useTransition } from "react";
import { CreditCard, Loader2, Check, DollarSign, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { recordPaymentAction } from "@/actions/payments-actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schedule: any;
  bookingId: string;
}

export function RecordPaymentModal({ isOpen, onClose, schedule, bookingId }: Props) {
  const [amountPaid, setAmountPaid] = useState(schedule?.dueAmount?.toString() || "");
  const [mode, setMode] = useState("NEFT");
  const [referenceNo, setReferenceNo] = useState(`UTR-${Math.floor(100000000 + Math.random() * 900000000)}`);
  const [bankName, setBankName] = useState("HDFC Bank Ltd.");
  const [notes, setNotes] = useState("");

  const [isPending, startTransition] = useTransition();
  const [receiptResult, setReceiptResult] = useState<string | null>(null);

  if (!isOpen || !schedule) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await recordPaymentAction({
        scheduleId: schedule.id,
        bookingId,
        amountPaid: parseFloat(amountPaid) || 0,
        mode,
        referenceNo,
        bankName,
        notes,
      });

      if (res.success) {
        setReceiptResult(res.receiptNumber);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-[#3B8CFF]">
              Payment Entry
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mt-0.5">
              Record Milestone Payment
            </h2>
            <p className="text-xs text-slate-500">Milestone: {schedule.milestoneName}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {receiptResult && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Payment logged! Official Receipt <strong>#{receiptResult}</strong> issued.</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs flex justify-between">
            <span className="text-slate-400">Total Milestone Due:</span>
            <strong className="text-slate-900 dark:text-white">{formatCurrency(schedule.dueAmount)}</strong>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Amount Paid (₹) *
            </label>
            <input
              type="number"
              required
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Payment Mode *
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="NEFT">NEFT / RTGS</option>
                <option value="CHEQUE">Cheque / Demand Draft</option>
                <option value="UPI">UPI / NetBanking</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="CASH">Cash Deposit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Reference / UTR / Cheque Number *
            </label>
            <input
              type="text"
              required
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Cleared via buyer's SBI Home Loan disbursement"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Issue Receipt & Clear Milestone</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
