"use client";

import { useState, useEffect } from "react";
import { Search, User, Building, FileCheck, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    leads: any[];
    units: any[];
    bookings: any[];
  }>({ leads: [], units: [], bookings: [] });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // toggle search
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ leads: [], units: [], bookings: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.leads.length + results.units.length + results.bookings.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, phone numbers, unit numbers, bookings... (e.g. 'Amitabh', 'A-102', '98450')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-base"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-sky-500" />}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded"
          >
            ESC
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-6">
          {!query.trim() && (
            <div className="py-8 text-center text-slate-400 text-sm">
              Type to search leads, inventory units, bookings or phone numbers...
            </div>
          )}

          {query.trim() && totalResults === 0 && !loading && (
            <div className="py-8 text-center text-slate-400 text-sm">
              No results found for &ldquo;<span className="text-slate-200 font-semibold">{query}</span>&rdquo;
            </div>
          )}

          {/* Leads Results */}
          {results.leads.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <User className="w-3.5 h-3.5" /> Leads ({results.leads.length})
              </div>
              <div className="space-y-1.5">
                {results.leads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/leads?id=${lead.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition group"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-sky-500 transition">
                        {lead.name}
                      </div>
                      <div className="text-xs text-slate-500 flex gap-2">
                        <span>{lead.phone}</span>
                        <span>•</span>
                        <span>{lead.project?.name}</span>
                        <span>•</span>
                        <span className="font-medium text-amber-600">{lead.status}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Units Results */}
          {results.units.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <Building className="w-3.5 h-3.5" /> Inventory Units ({results.units.length})
              </div>
              <div className="space-y-1.5">
                {results.units.map((unit) => (
                  <Link
                    key={unit.id}
                    href={`/inventory?unit=${unit.unitNumber}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition group"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-sky-500 transition">
                        Unit {unit.unitNumber} ({unit.type} • {unit.areaSqft} sqft)
                      </div>
                      <div className="text-xs text-slate-500 flex gap-2">
                        <span>{unit.project?.name}</span>
                        <span>•</span>
                        <span>Floor {unit.floor}</span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-600">{formatCurrency(unit.totalCost)}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        unit.status === "AVAILABLE"
                          ? "bg-emerald-100 text-emerald-700"
                          : unit.status === "HELD"
                          ? "bg-amber-100 text-amber-700"
                          : unit.status === "BOOKED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {unit.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bookings Results */}
          {results.bookings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <FileCheck className="w-3.5 h-3.5" /> Bookings ({results.bookings.length})
              </div>
              <div className="space-y-1.5">
                {results.bookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition group"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-sky-500 transition">
                        #{booking.bookingNumber} — {booking.lead.name}
                      </div>
                      <div className="text-xs text-slate-500 flex gap-2">
                        <span>Unit {booking.unit.unitNumber}</span>
                        <span>•</span>
                        <span>{formatCurrency(booking.agreementValue)}</span>
                        <span>•</span>
                        <span className="font-medium text-sky-600">{booking.status}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
