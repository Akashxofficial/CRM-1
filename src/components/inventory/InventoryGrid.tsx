"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Plus,
  Upload,
  RefreshCw,
  ChevronDown,
  MoreVertical,
  FileText,
  CheckCircle2,
  Home,
  IndianRupee,
  XCircle,
  EyeOff,
  Trash2,
  Clock,
  X,
  Loader2,
  ArrowRight,
  FileCheck,
  Building2,
} from "lucide-react";
import {
  holdUnitAction,
  releaseUnitAction,
  updateUnitStatusAction,
} from "@/actions/inventory-actions";
import Link from "next/link";
import { BulkImportModal } from "./BulkImportModal";
import { AddInventoryModal } from "./AddInventoryModal";
import { formatCurrency } from "@/lib/utils";

interface Props {
  projects: any[];
  initialUnits: any[];
  userRole: string;
  leads: any[];
}

/* ─── Color map exactly matching screenshot ─── */
const CARD_BG: Record<string, string> = {
  AVAILABLE: "#6366f1",   // indigo/purple
  HELD:      "#f59e0b",   // amber/orange
  BOOKED:    "#22c55e",   // green
  SOLD:      "#10b981",   // emerald
  BLOCKED:   "#ef4444",   // red
  CANCELLED: "#ef4444",
};

const SUMMARY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  AVAILABLE: { text: "#166534", bg: "#f0fdf4", border: "#bbf7d0" },
  HELD:      { text: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  BOOKED:    { text: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
  SOLD:      { text: "#14532d", bg: "#f0fdf4", border: "#86efac" },
  CANCELLED: { text: "#991b1b", bg: "#fff1f2", border: "#fecdd3" },
};

/* ─── Right Drawer ─── */
function UnitDrawer({
  unit,
  onClose,
  userRole,
  leads,
  onHold,
  onRelease,
  onStatusChange,
  isPending,
}: {
  unit: any;
  onClose: () => void;
  userRole: string;
  leads: any[];
  onHold: (unit: any) => void;
  onRelease: (id: string) => void;
  onStatusChange: (id: string, s: string) => void;
  isPending: boolean;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const bg = CARD_BG[unit.status] || "#6366f1";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[380px] max-w-full z-50 flex flex-col bg-white shadow-2xl border-l border-slate-200 animate-slide-in-right pb-safe">

        {/* Header colored strip */}
        <div className="p-5 text-white" style={{ backgroundColor: bg }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
                {unit.project?.name || "Project"}
              </p>
              <h2 className="text-2xl font-extrabold mt-0.5 tracking-tight">
                {unit.unitNumber}
              </h2>
              <p className="text-xs opacity-80 mt-1">
                {unit.tower?.name} &bull; Floor {unit.floor} &bull; {unit.type}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-full">
                {unit.status}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Specs Grid */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 mb-0.5">Super Built-up</p>
              <p className="font-bold text-slate-900 text-sm">{unit.areaSqft} sq.ft</p>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">Carpet Area</p>
              <p className="font-bold text-slate-900 text-sm">
                {unit.carpetAreaSqft || Math.round(unit.areaSqft * 0.8)} sq.ft
              </p>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">Base Rate / sqft</p>
              <p className="font-bold text-slate-900 text-sm">{formatCurrency(unit.baseRate)}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">Facing</p>
              <p className="font-bold text-slate-900 text-sm">{unit.facing || "—"}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">PLC Charges</p>
              <p className="font-bold text-slate-900 text-sm">{formatCurrency(unit.plcCharges || 0)}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">Parking</p>
              <p className="font-bold text-slate-900 text-sm">{formatCurrency(unit.parkingCharges || 0)}</p>
            </div>
          </div>

          {/* Total value */}
          <div
            className="rounded-xl p-4 flex items-center justify-between"
            style={{ backgroundColor: `${bg}15`, border: `1px solid ${bg}30` }}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: bg }}>
                Total Agreement Value
              </p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                {formatCurrency(unit.totalCost)}
              </p>
            </div>
          </div>

          {/* Hold info */}
          {unit.status === "HELD" && (
            <div className="rounded-xl p-3.5 bg-amber-50 border border-amber-200 text-xs text-amber-700">
              <p className="font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Currently On Hold
              </p>
              <p className="mt-1">
                Held by: <strong>{unit.heldBy?.name || "Agent"}</strong>
                {unit.heldUntil && (
                  <> until <strong>{new Date(unit.heldUntil).toLocaleString()}</strong></>
                )}
              </p>
            </div>
          )}

          {/* Booked info */}
          {unit.status === "BOOKED" && unit.booking && (
            <div className="rounded-xl p-3.5 bg-green-50 border border-green-200 text-xs text-green-700">
              <p className="font-bold flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" /> Booked Customer
              </p>
              <p className="mt-1">
                Customer: <strong>{unit.booking.lead?.name}</strong>
                {unit.booking.bookingNumber && <> (#{unit.booking.bookingNumber})</>}
              </p>
              <Link
                href={`/bookings/${unit.booking.id}`}
                className="mt-2 inline-block font-semibold underline text-green-600 hover:text-green-700"
              >
                View Booking & Payment Schedule →
              </Link>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-1">
            {unit.status === "AVAILABLE" && (
              <button
                onClick={() => { onClose(); setTimeout(() => onHold(unit), 60); }}
                className="w-full py-2.5 text-sm font-semibold rounded-xl border-2 text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100 transition flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" /> Hold Unit (48h)
              </button>
            )}

            {unit.status === "HELD" && (
              <button
                onClick={() => { onRelease(unit.id); onClose(); }}
                disabled={isPending}
                className="w-full py-2.5 text-sm font-semibold rounded-xl border-2 text-slate-700 border-slate-300 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Release Hold
              </button>
            )}

            {(unit.status === "AVAILABLE" || unit.status === "HELD") && (
              <Link
                href={`/bookings?unitId=${unit.id}`}
                className="w-full py-2.5 text-sm font-semibold rounded-xl text-white flex items-center justify-center gap-2 transition"
                style={{ backgroundColor: bg }}
              >
                1-Click Convert to Booking <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {userRole === "ADMIN" && (
              <button
                onClick={() => {
                  onStatusChange(unit.id, unit.status === "BLOCKED" ? "AVAILABLE" : "BLOCKED");
                  onClose();
                }}
                disabled={isPending}
                className="w-full py-2.5 text-sm font-semibold rounded-xl border-2 text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100 transition flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {unit.status === "BLOCKED" ? "Unblock Unit" : "Cancel Unit"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── 3-dot Context Menu ─── */
function UnitContextMenu({
  unit,
  userRole,
  onViewDetail,
  onHold,
  onRelease,
  onStatusChange,
  open,
  setOpen,
}: {
  unit: any;
  userRole: string;
  onViewDetail: (u: any) => void;
  onHold: (u: any) => void;
  onRelease: (id: string) => void;
  onStatusChange: (id: string, s: string) => void;
  open: boolean;
  setOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [alignLeft, setAlignLeft] = useState(false);

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // If button is close to left edge of screen (< 220px), align dropdown to left so it doesn't clip off-screen
      setAlignLeft(rect.left < 220);
    }
  }, [open]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const handleDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleDocClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, setOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/25 transition flex-shrink-0"
        title="Options"
      >
        <MoreVertical className="w-3.5 h-3.5 text-white" />
      </button>

      {open && (
        <div
          className={`absolute top-6 z-[100] bg-white rounded-xl shadow-2xl border border-slate-100/90 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100 ${
            alignLeft ? "left-0" : "right-0"
          }`}
          style={{ minWidth: 175 }}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem
            icon={<FileText className="w-3.5 h-3.5 text-slate-400" />}
            label="Cost Sheet"
            onClick={() => {
              setOpen(false);
              onViewDetail(unit);
            }}
          />

          <MenuItem
            icon={<RefreshCw className="w-3.5 h-3.5 text-blue-500" />}
            label="Mark as Resale"
            onClick={() => {
              setOpen(false);
              onRelease(unit.id);
            }}
          />

          <MenuItem
            icon={<IndianRupee className="w-3.5 h-3.5 text-emerald-500" />}
            label="Mark as Rent"
            onClick={() => {
              setOpen(false);
              onStatusChange(unit.id, "BOOKED");
            }}
          />

          <div className="my-1 border-t border-slate-100" />

          <MenuItem
            icon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
            label="Cancel Unit"
            danger
            onClick={() => {
              setOpen(false);
              onStatusChange(unit.id, "BLOCKED");
            }}
          />

          <MenuItem
            icon={<EyeOff className="w-3.5 h-3.5 text-amber-500" />}
            label="Mark Unavailable"
            onClick={() => {
              setOpen(false);
              onStatusChange(unit.id, "BLOCKED");
            }}
          />

          {userRole === "ADMIN" && (
            <>
              <div className="my-1 border-t border-slate-100" />
              <MenuItem
                icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                label="Delete Unit"
                danger
                onClick={() => {
                  setOpen(false);
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon, label, danger, onClick,
}: { icon: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition text-left ${
        danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {icon} {label}
    </button>
  );
}

/* ─── Individual Unit Card ─── */
function UnitCard({
  unit,
  userRole,
  onViewDetail,
  onHold,
  onRelease,
  onStatusChange,
}: {
  unit: any;
  userRole: string;
  onViewDetail: (u: any) => void;
  onHold: (u: any) => void;
  onRelease: (id: string) => void;
  onStatusChange: (id: string, s: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const bg = CARD_BG[unit.status] || "#6366f1";
  const customerName =
    unit.status === "BOOKED" && unit.booking?.lead?.name
      ? unit.booking.lead.name
      : unit.status === "HELD" && unit.heldBy?.name
      ? unit.heldBy.name
      : null;

  return (
    <div
      className={`relative rounded-xl cursor-pointer select-none transition-all duration-150 overflow-visible ${
        menuOpen ? "z-[100] shadow-2xl" : "z-0 hover:z-20 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
      }`}
      style={{ backgroundColor: bg, minHeight: 90 }}
      onClick={() => onViewDetail(unit)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between px-2.5 pt-2">
        <span className="text-[11px] font-bold text-white leading-tight truncate max-w-[70%]">
          {unit.unitNumber}
        </span>
        <div onClick={(e) => e.stopPropagation()}>
          <UnitContextMenu
            unit={unit}
            userRole={userRole}
            onViewDetail={onViewDetail}
            onHold={onHold}
            onRelease={onRelease}
            onStatusChange={onStatusChange}
            open={menuOpen}
            setOpen={setMenuOpen}
          />
        </div>
      </div>

      {/* Type badge */}
      <div className="px-2.5 mt-1.5">
        <span className="inline-block bg-white/25 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-tight">
          {unit.type}
        </span>
      </div>

      {/* Customer name */}
      {customerName && (
        <div className="px-2.5 mt-1">
          <span className="text-[10px] text-white/80 font-medium truncate block">
            {customerName}
          </span>
        </div>
      )}

      {/* Bottom — price dashes */}
      <div className="px-2.5 pb-2.5 mt-2 flex items-center justify-between">
        <span className="text-[10px] text-white/60">—</span>
        <span className="text-[10px] text-white/60">—</span>
      </div>
    </div>
  );
}

/* ─── Status Summary Card ─── */
function SummaryCard({
  label, count, status, active, onClick,
}: { label: string; count: number; status: string; active: boolean; onClick: () => void }) {
  const c = SUMMARY_COLORS[status] || SUMMARY_COLORS.AVAILABLE;
  return (
    <button
      onClick={onClick}
      className="flex-1 min-w-[100px] rounded-xl p-4 text-left transition-all border-2"
      style={{
        backgroundColor: c.bg,
        borderColor: active ? c.text : c.border,
        boxShadow: active ? `0 0 0 3px ${c.border}` : "none",
      }}
    >
      <div className="text-3xl font-extrabold leading-none" style={{ color: c.text }}>
        {count}
      </div>
      <div className="text-xs font-medium mt-1" style={{ color: c.text, opacity: 0.7 }}>
        {label}
      </div>
    </button>
  );
}

/* ─── Hold Modal ─── */
function HoldModal({
  unit, leads, onClose, onSubmit, isPending,
}: {
  unit: any; leads: any[]; onClose: () => void;
  onSubmit: (leadId: string, hours: number) => void; isPending: boolean;
}) {
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [holdHours, setHoldHours] = useState(48);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Hold Unit {unit.unitNumber}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Lock this unit from other agents while finalizing price negotiations.
        </p>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
            Link Prospect Lead (Optional)
          </label>
          <select
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
          >
            <option value="">Select an active lead...</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
            Hold Duration
          </label>
          <select
            value={holdHours}
            onChange={(e) => setHoldHours(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
          >
            <option value={24}>24 Hours</option>
            <option value={48}>48 Hours (Standard)</option>
            <option value={72}>72 Hours</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(selectedLeadId, holdHours)}
            disabled={isPending}
            className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-500 text-white rounded-xl shadow flex items-center gap-1.5 transition"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Confirm Hold
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export function InventoryGrid({ projects, initialUnits, userRole, leads }: Props) {
  // Default to "ALL" — avoids hiding real DB units when project IDs don't match demo fallback
  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("unitNumber");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const [drawerUnit, setDrawerUnit] = useState<any | null>(null);
  const [holdUnit, setHoldUnit] = useState<any | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Build real project list from actual units (handles demo vs real DB IDs)
  const projectsFromUnits = Array.from(
    new Map(
      initialUnits
        .filter((u) => u.project)
        .map((u) => [u.projectId, { id: u.projectId, name: u.project?.name || "Project" }])
    ).values()
  );

  // Merge with passed projects list, prefer real project metadata
  const allProjects = projectsFromUnits.length > 0
    ? projectsFromUnits
    : projects;

  const currentProject =
    selectedProjectId === "ALL"
      ? null
      : allProjects.find((p) => p.id === selectedProjectId) || null;

  // Filtered + sorted units
  const filteredUnits = initialUnits
    .filter((u) => {
      if (selectedProjectId !== "ALL" && u.projectId !== selectedProjectId) return false;
      if (selectedStatus !== "ALL" && u.status !== selectedStatus) return false;
      if (selectedType !== "ALL" && u.type !== selectedType) return false;
      if (searchQuery.trim() && !u.unitNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (minPrice && u.totalCost < parseFloat(minPrice)) return false;
      if (maxPrice && u.totalCost > parseFloat(maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.totalCost - b.totalCost;
      if (sortBy === "price_desc") return b.totalCost - a.totalCost;
      if (sortBy === "area") return b.areaSqft - a.areaSqft;
      return a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true });
    });

  // Stats (from all units, not filtered)
  const stats = {
    AVAILABLE: initialUnits.filter((u) => u.status === "AVAILABLE").length,
    HELD:      initialUnits.filter((u) => u.status === "HELD").length,
    BOOKED:    initialUnits.filter((u) => u.status === "BOOKED").length,
    SOLD:      initialUnits.filter((u) => u.status === "SOLD").length,
    CANCELLED: initialUnits.filter((u) => u.status === "BLOCKED" || u.status === "CANCELLED").length,
  };

  const handleRelease = useCallback((unitId: string) => {
    startTransition(async () => {
      await releaseUnitAction(unitId);
      window.location.reload();
    });
  }, []);

  const handleStatusChange = useCallback((unitId: string, newStatus: string) => {
    startTransition(async () => {
      await updateUnitStatusAction(unitId, newStatus);
      window.location.reload();
    });
  }, []);

  const handleHoldSubmit = useCallback((leadId: string, hours: number) => {
    if (!holdUnit) return;
    startTransition(async () => {
      await holdUnitAction(holdUnit.id, leadId || undefined, hours);
      setHoldUnit(null);
      window.location.reload();
    });
  }, [holdUnit]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-3.5 sm:p-5 lg:p-6 space-y-5">

      {/* ── Header (matches screenshot) ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight">
            Inventory
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {initialUnits.length} units &bull; {currentProject?.name || allProjects[0]?.name || "All Projects"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Project selector */}
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 text-sm font-medium bg-white border border-slate-200 rounded-xl text-slate-700 shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Projects</option>
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Upload icon */}
          {userRole === "ADMIN" && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition shadow-sm"
              title="Bulk Import CSV"
            >
              <Upload className="w-4 h-4" />
            </button>
          )}

          {/* Refresh icon */}
          <button
            onClick={() => window.location.reload()}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition shadow-sm"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Add Inventory button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" />
            Add Inventory
          </button>
        </div>
      </div>

      {/* ── Status Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {[
          { label: "Available", count: stats.AVAILABLE, status: "AVAILABLE", numColor: "#16a34a", bg: "#f0fdf4", border: "#dcfce7" },
          { label: "Hold",      count: stats.HELD,      status: "HELD",      numColor: "#d97706", bg: "#fffbeb", border: "#fef3c7" },
          { label: "Booked",    count: stats.BOOKED,    status: "BOOKED",    numColor: "#2563eb", bg: "#eff6ff", border: "#dbeafe" },
          { label: "Sold",      count: stats.SOLD,      status: "SOLD",      numColor: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
          { label: "Cancelled", count: stats.CANCELLED, status: "BLOCKED",   numColor: "#dc2626", bg: "#fff1f2", border: "#fecdd3" },
        ].map(({ label, count, status, numColor, bg, border }) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(selectedStatus === status ? "ALL" : status)}
            className="rounded-xl p-3 sm:p-4 text-left transition-all border"
            style={{
              backgroundColor: bg,
              borderColor: selectedStatus === status ? numColor : border,
              boxShadow: selectedStatus === status ? `0 0 0 2px ${border}` : "none",
            }}
          >
            {/* Number */}
            <span
              className="text-3xl sm:text-4xl font-extrabold leading-none block tracking-tight"
              style={{
                color: numColor,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {count}
            </span>
            {/* Label */}
            <span
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 400,
                color: "#94a3b8",
                marginTop: "0.5rem",
                letterSpacing: "0.01em",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {label}
            </span>
          </button>
        ))}
      </div>



      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search unit no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <SelectFilter value={selectedStatus} onChange={setSelectedStatus}
          options={[
            { value: "ALL", label: "All Status" },
            { value: "AVAILABLE", label: "Available" },
            { value: "HELD", label: "Hold" },
            { value: "BOOKED", label: "Booked" },
            { value: "SOLD", label: "Sold" },
            { value: "BLOCKED", label: "Cancelled" },
          ]} />

        <SelectFilter value={selectedType} onChange={setSelectedType}
          options={[
            { value: "ALL", label: "All Types" },
            { value: "PLOT", label: "Plot" },
            { value: "1BHK", label: "1 BHK" },
            { value: "2BHK", label: "2 BHK" },
            { value: "3BHK", label: "3 BHK" },
            { value: "4BHK", label: "4 BHK" },
            { value: "VILLA", label: "Villa" },
            { value: "PENTHOUSE", label: "Penthouse" },
          ]} />

        <input type="number" placeholder="Min ₹" value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-20 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none" />

        <input type="number" placeholder="Max ₹" value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-20 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none" />

        <div className="ml-auto">
          <SelectFilter value={sortBy} onChange={setSortBy}
            options={[
              { value: "unitNumber", label: "Sort: Unit no." },
              { value: "price_asc",  label: "Price: Low → High" },
              { value: "price_desc", label: "Price: High → Low" },
              { value: "area",       label: "Area: Largest" },
            ]} />
        </div>
      </div>

      {/* ── Unit Grid ── */}
      {filteredUnits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
          <p className="text-slate-400 text-sm font-medium">No units match the current filters.</p>
          <button
            onClick={() => { setSelectedStatus("ALL"); setSelectedType("ALL"); setSearchQuery(""); setMinPrice(""); setMaxPrice(""); }}
            className="mt-3 text-xs text-indigo-500 font-semibold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div
          className="grid gap-2.5"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(95px, 1fr))" }}
        >
          {filteredUnits.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              userRole={userRole}
              onViewDetail={setDrawerUnit}
              onHold={setHoldUnit}
              onRelease={handleRelease}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* ── Right Side Drawer ── */}
      {drawerUnit && (
        <UnitDrawer
          unit={drawerUnit}
          onClose={() => setDrawerUnit(null)}
          userRole={userRole}
          leads={leads}
          onHold={(u) => { setDrawerUnit(null); setHoldUnit(u); }}
          onRelease={handleRelease}
          onStatusChange={handleStatusChange}
          isPending={isPending}
        />
      )}

      {/* ── Hold Modal ── */}
      {holdUnit && (
        <HoldModal
          unit={holdUnit}
          leads={leads}
          onClose={() => setHoldUnit(null)}
          onSubmit={handleHoldSubmit}
          isPending={isPending}
        />
      )}

      {/* ── Bulk Import Modal ── */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        projects={projects}
      />

      {/* ── Add Inventory Modal ── */}
      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        projects={allProjects}
        selectedProjectId={selectedProjectId}
      />
    </div>
  );
}

/* ── Small reusable select ── */
function SelectFilter({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
    </div>
  );
}
