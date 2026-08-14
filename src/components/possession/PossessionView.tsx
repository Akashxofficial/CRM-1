"use client";

import { useState, useTransition } from "react";
import {
  KeyRound,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Printer,
  Loader2,
  Calendar,
  Building,
  User,
  Check,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  schedulePossessionAction,
  addSnagItemAction,
  updateSnagStatusAction,
  completeHandoverAction,
} from "@/actions/possession-actions";
import { PrintablePossessionCertificate } from "./PrintablePossessionCertificate";

interface Props {
  possessions: any[];
  bookingsWithoutPossession: any[];
  projects: any[];
  userRole: string;
}

export function PossessionView({
  possessions,
  bookingsWithoutPossession,
  projects,
  userRole,
}: Props) {
  const [selectedPossession, setSelectedPossession] = useState<any | null>(possessions[0] || null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  // New snag form
  const [isSnagFormOpen, setIsSnagFormOpen] = useState(false);
  const [snagCategory, setSnagCategory] = useState("ELECTRICAL");
  const [snagDesc, setSnagDesc] = useState("");
  const [snagLocation, setSnagLocation] = useState("Living Room");

  // Schedule possession modal
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(bookingsWithoutPossession[0]?.id || "");
  const [scheduledDate, setScheduledDate] = useState("");

  const [isPending, startTransition] = useTransition();

  const handleAddSnag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPossession || !snagDesc.trim()) return;

    startTransition(async () => {
      await addSnagItemAction({
        possessionId: selectedPossession.id,
        category: snagCategory,
        description: snagDesc,
        location: snagLocation,
      });
      setSnagDesc("");
      setIsSnagFormOpen(false);
      window.location.reload();
    });
  };

  const handleSnagStatusToggle = (snagId: string, currentStatus: string) => {
    const next = currentStatus === "RESOLVED" ? "OPEN" : "RESOLVED";
    startTransition(async () => {
      await updateSnagStatusAction(snagId, next);
      window.location.reload();
    });
  };

  const handleCompleteHandover = () => {
    if (!selectedPossession) return;
    startTransition(async () => {
      await completeHandoverAction({
        possessionId: selectedPossession.id,
        handoverChecklistJson: selectedPossession.handoverChecklistJson || "[]",
      });
      window.location.reload();
    });
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !scheduledDate) return;

    startTransition(async () => {
      await schedulePossessionAction({
        bookingId: selectedBookingId,
        scheduledDate,
      });
      setIsScheduleOpen(false);
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-heading flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-sky-500" /> Possession Handover & Snag Tracking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Conduct pre-handover defect inspections, rectify snags, verify utility meters, and issue official Possession Certificates.
          </p>
        </div>

        {bookingsWithoutPossession.length > 0 && (
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="px-4 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> Schedule Handover Inspection
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Possession List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Handover Pipeline ({possessions.length})
          </h2>

          {possessions.length === 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
              No possessions scheduled yet.
            </div>
          )}

          {possessions.map((p) => {
            const isSelected = selectedPossession?.id === p.id;
            const openSnags = p.snags?.filter((s: any) => s.status === "OPEN" || s.status === "IN_PROGRESS").length || 0;
            const isHandedOver = p.status === "HANDED_OVER";

            return (
              <button
                key={p.id}
                onClick={() => setSelectedPossession(p)}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 shadow-md ring-2 ring-sky-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      Unit {p.booking?.unit?.unitNumber} — {p.booking?.lead?.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {p.booking?.project?.name} • #{p.booking?.bookingNumber}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isHandedOver
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Scheduled: {formatDate(p.scheduledDate)}</span>
                  {openSnags > 0 ? (
                    <span className="font-bold text-rose-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {openSnags} open snags
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Snags cleared
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Possession Detail & Snag Tracker */}
        {selectedPossession ? (
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Handover Inspection: Unit {selectedPossession.booking?.unit?.unitNumber}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customer: <strong>{selectedPossession.booking?.lead?.name}</strong> ({selectedPossession.booking?.lead?.phone})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCertificateOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-white/10 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Possession Certificate
                </button>

                {selectedPossession.status !== "HANDED_OVER" && (
                  <button
                    onClick={handleCompleteHandover}
                    disabled={isPending}
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md flex items-center gap-1.5 transition"
                  >
                    {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Complete Handover ✓</span>
                  </button>
                )}
              </div>
            </div>

            {/* Utility Meters */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Electricity Meter</span>
                <strong className="text-slate-900 dark:text-white font-mono text-sm">{selectedPossession.electricityMeterNo || "BESCOM-LT-8891223"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Water Meter</span>
                <strong className="text-slate-900 dark:text-white font-mono text-sm">{selectedPossession.waterMeterNo || "BWSSB-WT-441299"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Piped Gas Meter</span>
                <strong className="text-slate-900 dark:text-white font-mono text-sm">{selectedPossession.gasMeterNo || "GAIL-GAS-110022"}</strong>
              </div>
            </div>

            {/* Snags & Defects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Defect / Snag List ({selectedPossession.snags?.length || 0})
                </h3>
                <button
                  onClick={() => setIsSnagFormOpen(!isSnagFormOpen)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-500 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Snag Item
                </button>
              </div>

              {/* Snag Form */}
              {isSnagFormOpen && (
                <form onSubmit={handleAddSnag} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Category
                      </label>
                      <select
                        value={snagCategory}
                        onChange={(e) => setSnagCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="ELECTRICAL">Electrical (Switches/Wiring)</option>
                        <option value="PLUMBING">Plumbing (Taps/Drainage)</option>
                        <option value="PAINTING">Painting & Touchups</option>
                        <option value="CARPENTRY">Carpentry & Doors/Windows</option>
                        <option value="CIVIL">Civil / Tile Work</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Master Bedroom Balcony"
                        value={snagLocation}
                        onChange={(e) => setSnagLocation(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Defect Description *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Minor paint scuff near sliding glass frame"
                      value={snagDesc}
                      onChange={(e) => setSnagDesc(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSnagFormOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-4 py-1.5 text-xs font-semibold bg-sky-600 text-white rounded-xl shadow-sm"
                    >
                      Add Snag
                    </button>
                  </div>
                </form>
              )}

              {/* Snags List */}
              <div className="space-y-2.5">
                {selectedPossession.snags?.length === 0 && (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No snags reported. Unit is defect-free and ready for handover.
                  </p>
                )}

                {selectedPossession.snags?.map((snag: any) => {
                  const isResolved = snag.status === "RESOLVED" || snag.status === "VERIFIED";

                  return (
                    <div
                      key={snag.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleSnagStatusToggle(snag.id, snag.status)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                            isResolved
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 dark:border-slate-600 hover:border-slate-400"
                          }`}
                        >
                          {isResolved && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <span className={`font-bold ${isResolved ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}>
                            {snag.description}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {snag.category} • Location: {snag.location || "Unit Interior"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isResolved
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        {snag.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center text-slate-400 text-sm">
            Select a possession item from the list to view snags and handover details.
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Schedule Possession Inspection
            </h2>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Select Booking *
                </label>
                <select
                  required
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {bookingsWithoutPossession.map((b) => (
                    <option key={b.id} value={b.id}>
                      #{b.bookingNumber} — {b.lead?.name} (Unit {b.unit?.unitNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Inspection Date *
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-3 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-bold bg-sky-600 text-white rounded-xl shadow-md"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Certificate Modal */}
      {selectedPossession && (
        <PrintablePossessionCertificate
          possession={selectedPossession}
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
        />
      )}
    </div>
  );
}
