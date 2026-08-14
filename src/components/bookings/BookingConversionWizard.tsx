"use client";

import { useState, useTransition } from "react";
import {
  Sparkles,
  User,
  Building,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Loader2,
  X,
  FileCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { convertLeadToBookingAction } from "@/actions/bookings-actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  leads: any[];
  availableUnits: any[];
  paymentPlans: any[];
  preselectedLeadId?: string;
  preselectedUnitId?: string;
}

export function BookingConversionWizard({
  isOpen,
  onClose,
  leads,
  availableUnits,
  paymentPlans,
  preselectedLeadId,
  preselectedUnitId,
}: Props) {
  const [selectedLeadId, setSelectedLeadId] = useState(preselectedLeadId || leads[0]?.id || "");
  const [selectedUnitId, setSelectedUnitId] = useState(preselectedUnitId || availableUnits[0]?.id || "");
  const [selectedPlanId, setSelectedPlanId] = useState(paymentPlans[0]?.id || "");
  const [customValue, setCustomValue] = useState("");
  const [bookingToken, setBookingToken] = useState("500000");
  const [notes, setNotes] = useState("");

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const lead = leads.find((l) => l.id === selectedLeadId);
  const unit = availableUnits.find((u) => u.id === selectedUnitId);
  const plan = paymentPlans.find((p) => p.id === selectedPlanId);

  const agreementValue = customValue ? parseFloat(customValue) : unit?.totalCost || 0;

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedLeadId || !selectedUnitId) {
      setErrorMessage("Please select both a Lead and a Unit.");
      return;
    }

    startTransition(async () => {
      const res = await convertLeadToBookingAction({
        leadId: selectedLeadId,
        unitId: selectedUnitId,
        paymentPlanId: selectedPlanId || undefined,
        customAgreementValue: agreementValue,
        bookingAmountReceived: parseFloat(bookingToken) || 0,
        notes,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to convert booking");
      } else {
        window.location.href = `/bookings/${res.booking?.id}`;
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-[#163C7A] via-[#1A57BD] to-[#3B8CFF] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B9D5FF]">
              <Sparkles className="w-4 h-4" /> 1-Click Conversion Wizard
            </div>
            <h2 className="text-lg sm:text-xl font-semibold mt-0.5">Convert Lead to Confirmed Booking</h2>
            <p className="text-xs text-slate-100 mt-1">
              Auto-locks unit inventory, binds customer agreement value, and generates payment milestones.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConvert} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Step 1: Lead & Unit Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Select Lead / Buyer *
              </label>
              <select
                required
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Select Unit to Lock *
              </label>
              <select
                required
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.unitNumber} ({u.type} • {u.tower?.name} • {formatCurrency(u.totalCost)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Payment Plan Template */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Payment Plan Template *
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {paymentPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isDefault ? "(Project Default)" : ""}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">{plan?.description || "Milestone-linked plan"}</p>
          </div>

          {/* Step 3: Pricing & Token Received */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Agreement Value (₹)
              </label>
              <input
                type="number"
                value={agreementValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Calculated Base: {formatCurrency(unit?.totalCost)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Booking Token Received (₹) *
              </label>
              <input
                type="number"
                required
                value={bookingToken}
                onChange={(e) => setBookingToken(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Receipt REC-TOKEN will be issued automatically
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Booking Notes / Special Concessions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Free covered parking slot allotted, modular kitchen package included."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Conversion Summary Card */}
          <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Buyer:</span>
              <strong className="text-slate-900 dark:text-white">{lead?.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Unit Number:</span>
              <strong className="text-slate-900 dark:text-white">{unit?.unitNumber} ({unit?.type})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Agreement:</span>
              <strong className="text-slate-900 dark:text-white">{formatCurrency(agreementValue)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Booking Token:</span>
              <strong className="text-emerald-500">{formatCurrency(parseFloat(bookingToken))}</strong>
            </div>
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
              className="px-6 py-2.5 text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-2"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Complete Booking & Generate Schedule</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
