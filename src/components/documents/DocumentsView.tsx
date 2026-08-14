"use client";

import { useState, useTransition } from "react";
import {
  FolderLock,
  Search,
  FileCheck,
  CheckCircle,
  Clock,
  Building,
  User,
  ArrowRight,
  Upload,
  Eye,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { updateDocumentStatusAction } from "@/actions/documents-actions";
import Link from "next/link";

interface Props {
  bookings: any[];
  projects: any[];
  userRole: string;
}

export function DocumentsView({ bookings, projects, userRole }: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredBookings = bookings.filter((b) => {
    if (selectedProjectId !== "ALL" && b.projectId !== selectedProjectId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = b.bookingNumber.toLowerCase().includes(q);
      const matchName = b.lead?.name.toLowerCase().includes(q);
      const matchUnit = b.unit?.unitNumber.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchUnit) return false;
    }
    return true;
  });

  const handleStatusUpdate = (docId: string, status: string) => {
    startTransition(async () => {
      await updateDocumentStatusAction({ docId, status });
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-heading flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-sky-500" /> Post-Sales Documentation & Legal Checklist
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track legal documentation progress: Allotment Letter → Sale Agreement → KYC Dossier → OC/CC → Sale Deed.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Booking #, Customer or Unit #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="w-48">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Documentation Checklist Cards */}
      <div className="space-y-4">
        {filteredBookings.map((b) => {
          const docs = b.documents || [];
          const completedCount = docs.filter(
            (d: any) => d.status === "VERIFIED" || d.status === "REGISTERED"
          ).length;
          const totalDocs = docs.length || 1;
          const percent = Math.round((completedCount / totalDocs) * 100);

          return (
            <div
              key={b.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
                      #{b.bookingNumber}
                    </span>
                    <span className="text-slate-300">•</span>
                    <strong className="text-slate-900 dark:text-white text-base">
                      {b.lead?.name}
                    </strong>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Unit {b.unit?.unitNumber} ({b.unit?.type}) • {b.project?.name} • {b.unit?.tower?.name}
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {percent}% Completed
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {completedCount} of {totalDocs} Verified
                    </span>
                  </div>
                  <div className="w-24 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full ${
                        percent === 100 ? "bg-emerald-500" : "bg-sky-500"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {docs.map((doc: any) => {
                  const isDone = doc.status === "VERIFIED" || doc.status === "REGISTERED";

                  return (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {doc.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Updated: {formatDate(doc.updatedAt)}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isDone
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                              : doc.status === "UPLOADED"
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                        <select
                          value={doc.status}
                          onChange={(e) => handleStatusUpdate(doc.id, e.target.value)}
                          disabled={isPending}
                          className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="GENERATED">Generated</option>
                          <option value="UPLOADED">Uploaded</option>
                          <option value="VERIFIED">Verified</option>
                          <option value="REGISTERED">Registered</option>
                        </select>

                        <button
                          onClick={() => handleStatusUpdate(doc.id, "VERIFIED")}
                          disabled={isPending || isDone}
                          className="text-[10px] font-bold text-sky-600 hover:text-sky-500 disabled:opacity-30"
                        >
                          Quick Verify ✓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
