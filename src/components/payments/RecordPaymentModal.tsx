"use client";

import { useState, useTransition, useMemo, useRef, useEffect } from "react";
import {
  CreditCard,
  Loader2,
  Check,
  DollarSign,
  X,
  Building2,
  User,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowUpRight,
  Landmark,
  HardHat,
  ChevronDown,
  Search,
  CheckCheck,
  Tag,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { recordPaymentAction } from "@/actions/payments-actions";
import { URBANGAON_AXIO_CLP_STAGES, AxioCLPStage } from "@/lib/axio-clp-plan";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schedule: any;
  bookingId?: string;
}

export type PaymentStatusType =
  | "PAID"
  | "PARTIAL"
  | "PENDING"
  | "MILESTONE_REACHED"
  | "CHEQUE_CLEARING"
  | "OVERDUE";

const STATUS_CONFIGS: Record<
  PaymentStatusType,
  { label: string; short: string; badge: string; color: string; bg: string; icon: any; desc: string }
> = {
  PAID: {
    label: "Payment Received & Cleared",
    short: "Paid (Cleared)",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300",
    color: "bg-emerald-600 hover:bg-emerald-700 text-white",
    bg: "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
    icon: CheckCircle2,
    desc: "Full payment received from buyer. Official payment receipt will be generated.",
  },
  PARTIAL: {
    label: "Partial Payment Received",
    short: "Partial Payment",
    badge: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300",
    color: "bg-amber-600 hover:bg-amber-700 text-white",
    bg: "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20",
    icon: Clock,
    desc: "Part payment received. Remaining milestone balance will be tracked in ledger.",
  },
  PENDING: {
    label: "Payment Pending / Awaiting",
    short: "Pending",
    badge: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300",
    color: "bg-blue-600 hover:bg-blue-700 text-white",
    bg: "border-blue-500/40 bg-blue-50/40 dark:bg-blue-950/20",
    icon: Clock,
    desc: "Payment pending from buyer with scheduled follow-up reminder.",
  },
  MILESTONE_REACHED: {
    label: "Milestone Reached on Site",
    short: "Milestone Reached",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300",
    color: "bg-indigo-600 hover:bg-indigo-700 text-white",
    bg: "border-indigo-500/40 bg-indigo-50/40 dark:bg-indigo-950/20",
    icon: Building2,
    desc: "Construction milestone verified on site. Demand letter notice dispatched to buyer.",
  },
  CHEQUE_CLEARING: {
    label: "Cheque in Bank Clearing",
    short: "Cheque In-Clearing",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300",
    color: "bg-cyan-600 hover:bg-cyan-700 text-white",
    bg: "border-cyan-500/40 bg-cyan-50/40 dark:bg-cyan-950/20",
    icon: Landmark,
    desc: "Physical cheque logged and marked under bank clearance verification.",
  },
  OVERDUE: {
    label: "Payment Overdue / Delayed",
    short: "Overdue",
    badge: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300",
    color: "bg-rose-600 hover:bg-rose-700 text-white",
    bg: "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20",
    icon: AlertCircle,
    desc: "Due date elapsed without payment. Flagged for urgent collections chase.",
  },
};

export function RecordPaymentModal({ isOpen, onClose, schedule, bookingId: propBookingId }: Props) {
  const actualBookingId = propBookingId || schedule?.booking?.id || schedule?.bookingId || "demo-booking";
  const initialDueAmount = schedule?.dueAmount || 0;
  const initialPercentage = schedule?.percentage || 10;

  // Approximate total agreement value
  const estimatedAgreementVal = useMemo(() => {
    if (schedule?.booking?.agreementVal) return schedule.booking.agreementVal;
    if (initialDueAmount > 0 && initialPercentage > 0) {
      return (initialDueAmount / initialPercentage) * 100;
    }
    return 10000000; // 1 Cr fallback
  }, [schedule, initialDueAmount, initialPercentage]);

  // Match initial stage from 24 list
  const matchedInitialStage = useMemo(() => {
    if (!schedule?.milestoneName) return null;
    const lowerName = schedule.milestoneName.toLowerCase();
    return (
      URBANGAON_AXIO_CLP_STAGES.find(
        (s) =>
          lowerName.includes(s.stage.toLowerCase()) ||
          s.stage.toLowerCase().includes(lowerName) ||
          (schedule.milestoneCode && schedule.milestoneCode === s.code)
      ) || null
    );
  }, [schedule]);

  // Selected stage & dropdown open state
  const [selectedStageSrNo, setSelectedStageSrNo] = useState<number | "CURRENT">(
    matchedInitialStage ? matchedInitialStage.srNo : "CURRENT"
  );
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const [stageSearchQuery, setStageSearchQuery] = useState("");
  const [stageCategoryFilter, setStageCategoryFilter] = useState<"ALL" | "BOOKING" | "FOUNDATION" | "LOWER_SLAB" | "UPPER_SLAB">("ALL");

  const stageDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (stageDropdownRef.current && !stageDropdownRef.current.contains(event.target as Node)) {
        setIsStageDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeStageObj: AxioCLPStage | null = useMemo(() => {
    if (selectedStageSrNo === "CURRENT") return null;
    return URBANGAON_AXIO_CLP_STAGES.find((s) => s.srNo === selectedStageSrNo) || null;
  }, [selectedStageSrNo]);

  // Effective amounts & names
  const effectiveDueAmount = useMemo(() => {
    if (activeStageObj) {
      return Math.round((estimatedAgreementVal * activeStageObj.percentage) / 100);
    }
    return initialDueAmount;
  }, [activeStageObj, estimatedAgreementVal, initialDueAmount]);

  const effectiveMilestoneName = activeStageObj
    ? `Stage ${activeStageObj.srNo}: ${activeStageObj.stage}`
    : schedule?.milestoneName || "Milestone Due";

  const effectivePercentage = activeStageObj ? activeStageObj.percentage : initialPercentage;

  // Form states
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType>("PAID");
  const [amountPaid, setAmountPaid] = useState(effectiveDueAmount.toString());
  const [mode, setMode] = useState("NEFT");
  const [referenceNo, setReferenceNo] = useState(`UTR-${Math.floor(100000000 + Math.random() * 900000000)}`);
  const [bankName, setBankName] = useState("HDFC Bank Ltd.");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const [isPending, startTransition] = useTransition();
  const [receiptResult, setReceiptResult] = useState<{ receipt: string; status: string } | null>(null);

  // Customer & Unit info
  const customerName = schedule?.booking?.lead?.name || schedule?.leadName || "Valued Customer";
  const customerPhone = schedule?.booking?.lead?.phone || "";
  const unitNumber = schedule?.booking?.unit?.unitNumber || "Unit";
  const projectName = schedule?.booking?.project?.name || "UrbanGaon Axio";
  const bookingNumber = schedule?.booking?.bookingNumber || "BK-DEMO";

  // Balance calculation
  const parsedAmount = parseFloat(amountPaid) || 0;
  const balanceRemaining = Math.max(0, effectiveDueAmount - parsedAmount);

  // Filtered Stages for Dropdown
  const filteredStages = useMemo(() => {
    return URBANGAON_AXIO_CLP_STAGES.filter((s) => {
      if (stageCategoryFilter !== "ALL" && s.category !== stageCategoryFilter) {
        return false;
      }
      if (stageSearchQuery.trim()) {
        const q = stageSearchQuery.toLowerCase();
        return (
          s.stage.toLowerCase().includes(q) ||
          s.srNo.toString().includes(q) ||
          s.percentage.toString().includes(q)
        );
      }
      return true;
    });
  }, [stageCategoryFilter, stageSearchQuery]);

  // Stage select handler
  const handleSelectStage = (srNo: number | "CURRENT") => {
    setSelectedStageSrNo(srNo);
    setIsStageDropdownOpen(false);

    if (srNo === "CURRENT") {
      if (paymentStatus === "PAID") setAmountPaid(initialDueAmount.toString());
    } else {
      const stage = URBANGAON_AXIO_CLP_STAGES.find((s) => s.srNo === srNo);
      if (stage) {
        const newDue = Math.round((estimatedAgreementVal * stage.percentage) / 100);
        if (paymentStatus === "PAID") {
          setAmountPaid(newDue.toString());
        } else if (paymentStatus === "PARTIAL") {
          setAmountPaid((newDue / 2).toString());
        }
        setNotes((prev) =>
          prev ? prev : `Stage #${stage.srNo}: ${stage.stage} (${stage.percentage}%)`
        );
      }
    }
  };

  // Status change handler
  const handleStatusChange = (newStatus: PaymentStatusType) => {
    setPaymentStatus(newStatus);
    if (newStatus === "PAID") {
      setAmountPaid(effectiveDueAmount.toString());
      if (!referenceNo.startsWith("UTR-")) {
        setReferenceNo(`UTR-${Math.floor(100000000 + Math.random() * 900000000)}`);
      }
    } else if (newStatus === "PARTIAL") {
      setAmountPaid(Math.round(effectiveDueAmount / 2).toString());
    } else if (newStatus === "PENDING" || newStatus === "OVERDUE" || newStatus === "MILESTONE_REACHED") {
      setAmountPaid("0");
    } else if (newStatus === "CHEQUE_CLEARING") {
      setMode("CHEQUE");
      setAmountPaid(effectiveDueAmount.toString());
      setReferenceNo(`CHQ-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  };

  const handleAppendNote = (snippet: string) => {
    setNotes((prev) => (prev ? `${prev} • ${snippet}` : snippet));
  };

  if (!isOpen || !schedule) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await recordPaymentAction({
        scheduleId: schedule.id,
        bookingId: actualBookingId,
        amountPaid: parsedAmount,
        mode,
        referenceNo,
        bankName,
        paymentDate,
        paymentStatus,
        milestoneStatus: paymentStatus,
        milestoneStageName: effectiveMilestoneName,
        milestonePercentage: effectivePercentage,
        milestoneCode: activeStageObj?.code || schedule?.milestoneCode,
        notes,
      });

      if (res.success) {
        setReceiptResult({
          receipt: res.receiptNumber || "REC-SUCCESS",
          status: res.status || paymentStatus,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    });
  };

  const activeStatusCfg = STATUS_CONFIGS[paymentStatus];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh]">
        {/* ── Top Header ── */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400">
                  UrbanGaon Axio CLP
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  {bookingNumber}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Record Milestone &amp; Payment Entry
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Customer Context Badge ── */}
        <div className="px-6 pt-3 pb-1">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
                {customerName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-white truncate">
                  {customerName} {customerPhone && <span className="font-normal text-slate-400 text-[11px]">({customerPhone})</span>}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {unitNumber} &bull; {projectName}
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate-400">Milestone Due</div>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                {formatCurrency(effectiveDueAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          {receiptResult && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 flex-shrink-0" />
              <div>
                <div className="font-bold">Payment &amp; Milestone Updated!</div>
                <div className="text-[11px]">
                  Receipt <strong>#{receiptResult.receipt}</strong> issued &bull; Status: <strong>{receiptResult.status}</strong>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              SECTION 1: CUSTOM 24-STAGE AXIO CLP PICKER (Clean UI)
             ═════════════════════════════════════════════════════════ */}
          <div className="space-y-1.5" ref={stageDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <HardHat className="w-3.5 h-3.5 text-blue-600" />
                <span>Construction Stage (Axio 24-Stage CLP) *</span>
              </label>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md">
                {effectivePercentage}% of Unit Value
              </span>
            </div>

            {/* Custom Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsStageDropdownOpen(!isStageDropdownOpen)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 flex items-center justify-between gap-3 text-left transition shadow-xs focus:outline-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-extrabold text-xs flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800">
                  {selectedStageSrNo === "CURRENT" ? "★" : `#${selectedStageSrNo}`}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {effectiveMilestoneName}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {effectivePercentage}% Sales Value &bull; Due: <strong>{formatCurrency(effectiveDueAmount)}</strong>
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                  isStageDropdownOpen ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </button>

            {/* Custom Dropdown Menu (Clean, Well-Organized, Zero Clutter) */}
            {isStageDropdownOpen && (
              <div className="mt-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150 z-20">
                {/* Search & Category Tabs */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search stage (e.g. 1st Floor, Foundation, 5%)..."
                      value={stageSearchQuery}
                      onChange={(e) => setStageSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setStageCategoryFilter("ALL")}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                        stageCategoryFilter === "ALL"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      All (24)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStageCategoryFilter("BOOKING")}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                        stageCategoryFilter === "BOOKING"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      📋 Booking (1-2)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStageCategoryFilter("FOUNDATION")}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                        stageCategoryFilter === "FOUNDATION"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      🏗️ Foundation (3-4)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStageCategoryFilter("LOWER_SLAB")}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                        stageCategoryFilter === "LOWER_SLAB"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      🏢 Slabs 1-9 (5%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStageCategoryFilter("UPPER_SLAB")}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                        stageCategoryFilter === "UPPER_SLAB"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      🏬 Slabs 10-19 (2.5%)
                    </button>
                  </div>
                </div>

                {/* Stages List */}
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {/* Keep Current Option */}
                  <div
                    onClick={() => handleSelectStage("CURRENT")}
                    className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition text-xs ${
                      selectedStageSrNo === "CURRENT"
                        ? "bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center">
                        ★
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Original Milestone: {schedule.milestoneName}
                      </span>
                    </div>
                    {selectedStageSrNo === "CURRENT" && <CheckCheck className="w-4 h-4 text-blue-600" />}
                  </div>

                  {filteredStages.map((s) => {
                    const isSelected = selectedStageSrNo === s.srNo;
                    const stageDue = Math.round((estimatedAgreementVal * s.percentage) / 100);

                    return (
                      <div
                        key={s.srNo}
                        onClick={() => handleSelectStage(s.srNo)}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition text-xs ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-lg text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {s.srNo < 10 ? `0${s.srNo}` : s.srNo}
                          </span>
                          <div className="truncate">
                            <span className="font-bold">{s.stage}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {s.percentage}%
                          </span>
                          <span className="text-[11px] font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(stageDue)}
                          </span>
                          {isSelected && <CheckCheck className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ═════════════════════════════════════════════════════════
              SECTION 2: PAYMENT & CLEARANCE STATUS SELECTOR
             ═════════════════════════════════════════════════════════ */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Payment &amp; Clearance Status *
            </label>

            {/* Quick Status Pill Grid */}
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(STATUS_CONFIGS) as PaymentStatusType[]).map((st) => {
                const cfg = STATUS_CONFIGS[st];
                const isSelected = paymentStatus === st;
                const IconComponent = cfg.icon;

                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className={`p-2 rounded-xl text-left transition border-2 flex items-center gap-1.5 ${
                      isSelected
                        ? `${cfg.bg} border-current shadow-xs`
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-[11px] font-bold truncate">{cfg.short}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Status Explanation Card */}
            <div className={`p-2.5 rounded-xl border text-[11px] font-medium flex items-center gap-2 ${activeStatusCfg.bg}`}>
              <activeStatusCfg.icon className="w-4 h-4 flex-shrink-0" />
              <span>{activeStatusCfg.desc}</span>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════
              SECTION 3: AMOUNT & BALANCE BREAKDOWN
             ═════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase text-slate-500">
                  Amount Received (₹) *
                </label>
                {paymentStatus !== "PENDING" && paymentStatus !== "OVERDUE" && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAmountPaid(effectiveDueAmount.toString())}
                      className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                    >
                      100%
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmountPaid(Math.round(effectiveDueAmount / 2).toString())}
                      className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                    >
                      50%
                    </button>
                  </div>
                )}
              </div>
              <input
                type="number"
                required
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-extrabold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Remaining Balance
              </label>
              <div className="w-full px-3.5 py-2 text-sm font-extrabold rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between font-mono">
                <span className={balanceRemaining > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}>
                  {formatCurrency(balanceRemaining)}
                </span>
                <span className="text-[10px] font-sans font-semibold text-slate-400">
                  {balanceRemaining === 0 ? "Cleared" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════
              SECTION 4: PAYMENT MODE & TRANSACTION DATE
             ═════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Payment Mode *
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="NEFT">NEFT / RTGS Transfer</option>
                <option value="CHEQUE">Cheque / Demand Draft</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="NETBANKING">Net Banking Transfer</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="CASH">Cash Deposit</option>
                <option value="HOME_LOAN">Bank Home Loan Disbursement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Transaction Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════
              SECTION 5: BANK & REFERENCE NUMBER
             ═════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank, SBI, ICICI"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Reference / UTR / Cheque # *
              </label>
              <input
                type="text"
                required
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════
              SECTION 6: NOTES & QUICK CHIPS
             ═════════════════════════════════════════════════════════ */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase text-slate-500">
                Notes &amp; Internal Remarks
              </label>
              <span className="text-[10px] text-slate-400">Click to insert</span>
            </div>

            <textarea
              rows={2}
              placeholder="e.g. Cleared via buyer's SBI Home Loan disbursement / Axio slab casted & verified"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white mb-2"
            />

            {/* Quick Note Chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleAppendNote("Cleared via SBI Home Loan")}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
              >
                + SBI Home Loan
              </button>
              <button
                type="button"
                onClick={() => handleAppendNote("Cheque deposited for clearing")}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
              >
                + Cheque in clearing
              </button>
              <button
                type="button"
                onClick={() => handleAppendNote("Slab casted & verified on site")}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
              >
                + Slab Casted &amp; Verified
              </button>
              <button
                type="button"
                onClick={() => handleAppendNote("Buyer promised payment next week")}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
              >
                + Follow-up Next Week
              </button>
            </div>
          </div>

          {/* ── Footer Action Buttons ── */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className={`px-5 py-2.5 text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2 transition active:scale-[0.98] ${activeStatusCfg.color}`}
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {paymentStatus === "PAID" && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Issue Receipt &amp; Clear Milestone</span>
                </>
              )}
              {paymentStatus === "PARTIAL" && (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Record Partial Payment ({formatCurrency(parsedAmount)})</span>
                </>
              )}
              {paymentStatus === "PENDING" && (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Save Status as Payment Pending</span>
                </>
              )}
              {paymentStatus === "MILESTONE_REACHED" && (
                <>
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Mark Milestone Reached &amp; Demand Raised</span>
                </>
              )}
              {paymentStatus === "CHEQUE_CLEARING" && (
                <>
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Log Cheque for Clearance</span>
                </>
              )}
              {paymentStatus === "OVERDUE" && (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Mark Overdue &amp; Log Follow-up</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


