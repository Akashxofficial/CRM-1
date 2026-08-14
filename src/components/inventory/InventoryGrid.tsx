"use client";

import { useState, useTransition } from "react";
import {
  Building2,
  Search,
  Filter,
  Clock,
  CheckCircle,
  FileCheck,
  Lock,
  Plus,
  Upload,
  User,
  DollarSign,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { holdUnitAction, releaseUnitAction, updateUnitStatusAction } from "@/actions/inventory-actions";
import Link from "next/link";
import { BulkImportModal } from "./BulkImportModal";

interface Props {
  projects: any[];
  initialUnits: any[];
  userRole: string;
  leads: any[];
}

export function InventoryGrid({ projects, initialUnits, userRole, leads }: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "ALL");
  const [selectedTowerId, setSelectedTowerId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);

  // Hold dialog
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [holdHours, setHoldHours] = useState<number>(48);

  // Import dialog
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const towers = currentProject?.towers || [];

  // Filter units
  const filteredUnits = initialUnits.filter((u) => {
    if (selectedProjectId !== "ALL" && u.projectId !== selectedProjectId) return false;
    if (selectedTowerId !== "ALL" && u.towerId !== selectedTowerId) return false;
    if (selectedStatus !== "ALL" && u.status !== selectedStatus) return false;
    if (selectedType !== "ALL" && u.type !== selectedType) return false;
    if (searchQuery.trim() && !u.unitNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group by Tower -> Floor -> Units
  const unitsByTower: Record<string, Record<number, any[]>> = {};

  filteredUnits.forEach((unit) => {
    const tName = unit.tower?.name || "Tower 1";
    if (!unitsByTower[tName]) unitsByTower[tName] = {};
    if (!unitsByTower[tName][unit.floor]) unitsByTower[tName][unit.floor] = [];
    unitsByTower[tName][unit.floor].push(unit);
  });

  const handleHoldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;
    startTransition(async () => {
      await holdUnitAction(selectedUnit.id, selectedLeadId || undefined, holdHours);
      setIsHoldModalOpen(false);
      setSelectedUnit(null);
      window.location.reload();
    });
  };

  const handleRelease = (unitId: string) => {
    startTransition(async () => {
      await releaseUnitAction(unitId);
      setSelectedUnit(null);
      window.location.reload();
    });
  };

  const handleStatusChange = (unitId: string, newStatus: string) => {
    startTransition(async () => {
      await updateUnitStatusAction(unitId, newStatus);
      setSelectedUnit(null);
      window.location.reload();
    });
  };

  // Status stats
  const availableCount = filteredUnits.filter((u) => u.status === "AVAILABLE").length;
  const heldCount = filteredUnits.filter((u) => u.status === "HELD").length;
  const bookedCount = filteredUnits.filter((u) => u.status === "BOOKED").length;
  const soldCount = filteredUnits.filter((u) => u.status === "SOLD").length;
  const blockedCount = filteredUnits.filter((u) => u.status === "BLOCKED").length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-heading flex items-center gap-2">
            <Building2 className="w-6 h-6 text-sky-500" /> Interactive Inventory Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time tower & floor layout with 48h lead hold timers and 1-click booking integration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userRole === "ADMIN" && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5" /> Bulk Import CSV
            </button>
          )}

          <Link
            href="/bookings?action=new"
            className="px-3.5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Direct Booking
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Project Selector */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedTowerId("ALL");
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.location})
                </option>
              ))}
            </select>
          </div>

          {/* Tower Selector */}
          <div className="w-44">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tower</label>
            <select
              value={selectedTowerId}
              onChange={(e) => setSelectedTowerId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Towers</option>
              {towers.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Type Filter */}
          <div className="w-36">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Unit Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK">4 BHK</option>
              <option value="PENTHOUSE">Penthouse</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-36">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="HELD">Held</option>
              <option value="BOOKED">Booked</option>
              <option value="SOLD">Sold</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          {/* Search Unit Number */}
          <div className="w-48">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search Unit</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. A-102"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Status Legend Pills */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Legend:</span>
          <button
            onClick={() => setSelectedStatus(selectedStatus === "AVAILABLE" ? "ALL" : "AVAILABLE")}
            className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1.5 ${
              selectedStatus === "AVAILABLE" ? "ring-2 ring-emerald-500 bg-emerald-600 text-white" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Available ({availableCount})
          </button>

          <button
            onClick={() => setSelectedStatus(selectedStatus === "HELD" ? "ALL" : "HELD")}
            className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1.5 ${
              selectedStatus === "HELD" ? "ring-2 ring-amber-500 bg-amber-600 text-white" : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Held / Negotiating ({heldCount})
          </button>

          <button
            onClick={() => setSelectedStatus(selectedStatus === "BOOKED" ? "ALL" : "BOOKED")}
            className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1.5 ${
              selectedStatus === "BOOKED" ? "ring-2 ring-blue-500 bg-blue-600 text-white" : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Booked ({bookedCount})
          </button>

          <button
            onClick={() => setSelectedStatus(selectedStatus === "SOLD" ? "ALL" : "SOLD")}
            className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1.5 ${
              selectedStatus === "SOLD" ? "ring-2 ring-rose-500 bg-rose-600 text-white" : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Sold / Handed Over ({soldCount})
          </button>

          <button
            onClick={() => setSelectedStatus(selectedStatus === "BLOCKED" ? "ALL" : "BLOCKED")}
            className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1.5 ${
              selectedStatus === "BLOCKED" ? "ring-2 ring-slate-500 bg-slate-600 text-white" : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Blocked ({blockedCount})
          </button>
        </div>
      </div>

      {/* Visual Unit Matrix Grid */}
      <div className="space-y-8">
        {Object.entries(unitsByTower).map(([towerName, floorsMap]) => {
          // Sort floors descending (top floor first)
          const sortedFloors = Object.keys(floorsMap)
            .map(Number)
            .sort((a, b) => b - a);

          return (
            <div
              key={towerName}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-500" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {towerName}
                  </h2>
                </div>
                <span className="text-xs text-slate-400">
                  {Object.values(floorsMap).flat().length} Total Units
                </span>
              </div>

              {/* Floor Rows */}
              <div className="space-y-3">
                {sortedFloors.map((floorNum) => {
                  const unitsOnFloor = floorsMap[floorNum] || [];

                  return (
                    <div key={floorNum} className="flex items-center gap-4">
                      {/* Floor Indicator */}
                      <div className="w-16 flex-shrink-0 text-right pr-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                          Floor {floorNum}
                        </span>
                      </div>

                      {/* Units Row */}
                      <div className="flex-1 flex flex-wrap items-center gap-3">
                        {unitsOnFloor.map((unit) => {
                          const isHeld = unit.status === "HELD";
                          const isAvailable = unit.status === "AVAILABLE";
                          const isBooked = unit.status === "BOOKED";
                          const isSold = unit.status === "SOLD";

                          let badgeBg = "bg-slate-800 border-slate-700 text-slate-300";
                          if (isAvailable) badgeBg = "bg-emerald-600/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600/20";
                          if (isHeld) badgeBg = "bg-amber-600/10 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-600/20";
                          if (isBooked) badgeBg = "bg-blue-600/10 border-blue-500/30 text-blue-700 dark:text-blue-400 hover:bg-blue-600/20";
                          if (isSold) badgeBg = "bg-rose-600/10 border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-600/20";

                          return (
                            <button
                              key={unit.id}
                              onClick={() => setSelectedUnit(unit)}
                              className={`p-3 rounded-xl border text-left transition-all duration-150 relative group min-w-[130px] flex-1 max-w-[180px] shadow-sm hover:scale-[1.02] ${badgeBg}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-sm tracking-tight">
                                  {unit.unitNumber}
                                </span>
                                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                                  {unit.type}
                                </span>
                              </div>

                              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                <span>{unit.areaSqft} sqft</span>
                                <span>{unit.facing}</span>
                              </div>

                              <div className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                                {formatCurrency(unit.totalCost)}
                              </div>

                              {/* Hold Countdown Badge */}
                              {isHeld && unit.heldUntil && (
                                <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                  <Clock className="w-3 h-3 animate-pulse" />
                                  <span>Held by {unit.heldBy?.name?.split(" ")[0] || "Agent"}</span>
                                </div>
                              )}

                              {isBooked && unit.booking && (
                                <div className="mt-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 truncate">
                                  {unit.booking.lead?.name}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unit Detail Drawer / Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-sky-500">
                  Unit Specification & Pricing
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Unit {selectedUnit.unitNumber} ({selectedUnit.type})
                </h2>
                <p className="text-xs text-slate-400">{selectedUnit.project?.name} • {selectedUnit.tower?.name} • Floor {selectedUnit.floor}</p>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price & Cost Breakdown */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Super Built-up Area</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedUnit.areaSqft} sq.ft</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Carpet Area</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedUnit.carpetAreaSqft || selectedUnit.areaSqft * 0.8} sq.ft</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Base Rate / sqft</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{formatCurrency(selectedUnit.baseRate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Facing / Orientation</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedUnit.facing}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">PLC Charges</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{formatCurrency(selectedUnit.plcCharges)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Car Parking Charges</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{formatCurrency(selectedUnit.parkingCharges)}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs text-sky-600 dark:text-sky-400 uppercase font-bold tracking-wider">Total Agreement Value</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(selectedUnit.totalCost)}
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    selectedUnit.status === "AVAILABLE"
                      ? "bg-emerald-500 text-white"
                      : selectedUnit.status === "HELD"
                      ? "bg-amber-500 text-white"
                      : selectedUnit.status === "BOOKED"
                      ? "bg-blue-500 text-white"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {selectedUnit.status}
                </span>
              </div>

              {/* Status Specific Details */}
              {selectedUnit.status === "HELD" && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300">
                  <p className="font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Currently Held
                  </p>
                  <p className="mt-1">
                    Held by: <strong>{selectedUnit.heldBy?.name || "Agent"}</strong> until{" "}
                    <strong>{selectedUnit.heldUntil ? new Date(selectedUnit.heldUntil).toLocaleString() : "48h"}</strong>.
                  </p>
                </div>
              )}

              {selectedUnit.status === "BOOKED" && selectedUnit.booking && (
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-700 dark:text-blue-300">
                  <p className="font-bold flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" /> Booked Customer
                  </p>
                  <p className="mt-1">
                    Customer: <strong>{selectedUnit.booking.lead?.name}</strong> (#{selectedUnit.booking.bookingNumber})
                  </p>
                  <Link
                    href={`/bookings/${selectedUnit.booking.id}`}
                    className="mt-2 inline-block font-semibold underline text-sky-500 hover:text-sky-400"
                  >
                    View Full Booking & Payment Schedule →
                  </Link>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {selectedUnit.status === "HELD" && (
                  <button
                    onClick={() => handleRelease(selectedUnit.id)}
                    disabled={isPending}
                    className="px-3 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white rounded-xl transition"
                  >
                    Release Hold
                  </button>
                )}

                {userRole === "ADMIN" && (
                  <button
                    onClick={() => handleStatusChange(selectedUnit.id, selectedUnit.status === "BLOCKED" ? "AVAILABLE" : "BLOCKED")}
                    disabled={isPending}
                    className="px-3 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white rounded-xl transition"
                  >
                    {selectedUnit.status === "BLOCKED" ? "Unblock Unit" : "Block Unit"}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedUnit.status === "AVAILABLE" && (
                  <button
                    onClick={() => setIsHoldModalOpen(true)}
                    className="px-3.5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" /> Hold Unit (48h)
                  </button>
                )}

                {(selectedUnit.status === "AVAILABLE" || selectedUnit.status === "HELD") && (
                  <Link
                    href={`/bookings?unitId=${selectedUnit.id}`}
                    className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <span>1-Click Convert to Booking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hold Modal */}
      {isHoldModalOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Hold Unit {selectedUnit.unitNumber}
            </h2>
            <p className="text-xs text-slate-400">
              Lock unit from other agents while finalizing client price negotiations.
            </p>

            <form onSubmit={handleHoldSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Link Prospect Lead (Optional)
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Select an active lead...</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Hold Duration (Hours)
                </label>
                <select
                  value={holdHours}
                  onChange={(e) => setHoldHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value={24}>24 Hours</option>
                  <option value={48}>48 Hours (Standard)</option>
                  <option value={72}>72 Hours</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHoldModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import CSV Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        projects={projects}
      />
    </div>
  );
}
