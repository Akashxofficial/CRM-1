"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  Calendar,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit,
  Download,
  Eye,
  Sparkles,
} from "lucide-react";
import { SnagRecord, deleteSnagRecord, updateSnagRecord } from "@/actions/snag-actions";

interface Props {
  initialSnags: SnagRecord[];
  userRole?: string;
}

export function SnagsListView({ initialSnags, userRole = "ADMIN" }: Props) {
  const router = useRouter();
  const [snags, setSnags] = useState<SnagRecord[]>(initialSnags);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  // Filter snags
  const filteredSnags = snags.filter((s) => {
    if (selectedStatus !== "ALL" && s.status !== selectedStatus) return false;
    if (selectedPriority !== "ALL" && s.priority !== selectedPriority) return false;
    if (selectedCategory !== "ALL" && s.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = s.subject.toLowerCase().includes(q);
      const matchDeal = (s.dealName || "").toLowerCase().includes(q);
      const matchUnit = (s.unitNumber || "").toLowerCase().includes(q);
      const matchCustomer = (s.customer || "").toLowerCase().includes(q);
      const matchReported = (s.reportedBy || "").toLowerCase().includes(q);
      if (!matchSubject && !matchDeal && !matchUnit && !matchCustomer && !matchReported) {
        return false;
      }
    }
    return true;
  });

  // KPI calculations
  const totalCount = snags.length;
  const loggedCount = snags.filter((s) => s.status === "Logged" || s.status === "Open").length;
  const inProgressCount = snags.filter((s) => s.status === "In Progress").length;
  const resolvedCount = snags.filter((s) => s.status === "Resolved" || s.status === "Verified" || s.status === "Closed").length;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this snag record?")) return;
    startTransition(async () => {
      await deleteSnagRecord(id);
      setSnags((prev) => prev.filter((s) => s.id !== id));
    });
  };

  const handleStatusChange = (id: string, newStatus: any, e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await updateSnagRecord(id, { status: newStatus });
      setSnags((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    });
  };

  const exportCSV = () => {
    const headers = [
      "ID",
      "Subject",
      "Deal Name",
      "Unit #",
      "Category",
      "Sub Category",
      "Priority",
      "Status",
      "Raised By",
      "Assign To",
      "Target Date",
      "Origin",
    ];
    const rows = filteredSnags.map((s) => [
      `"${s.id}"`,
      `"${s.subject.replace(/"/g, '""')}"`,
      `"${(s.dealName || "").replace(/"/g, '""')}"`,
      `"${s.unitNumber || ""}"`,
      `"${s.category || ""}"`,
      `"${s.subCategory || ""}"`,
      `"${s.priority || ""}"`,
      `"${s.status}"`,
      `"${s.raisedBy || ""}"`,
      `"${s.assignTo || ""}"`,
      `"${s.targetClosureDate || ""}"`,
      `"${s.snagOrigin}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `urbangaon_snags_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <ClipboardCheck className="w-6 h-6 text-[#1F69FF]" />
              <span>Snag Module</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1F69FF] font-semibold border border-blue-200">
              Quality & Inspection
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track site inspections, punch lists, defect remediation, and handover closure logs in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/snags/create"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#1F69FF] hover:bg-[#1557DC] text-white rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Snag Module</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Total Snags</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all active units</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-rose-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Logged / Open
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{loggedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Pending contractor action</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-amber-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            In Progress
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{inProgressCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Work underway on site</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Resolved / Closed
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ready for final verification</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search snags by subject, unit, deal, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-xl focus:outline-none focus:border-[#1F69FF] focus:bg-white transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F8FAFC] border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#1F69FF]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Logged">Logged</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Verified">Verified</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Priority */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F8FAFC] border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#1F69FF]"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F8FAFC] border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#1F69FF]"
          >
            <option value="ALL">All Categories</option>
            <option value="Civil Work">Civil Work</option>
            <option value="Plumbing & Sanitary">Plumbing & Sanitary</option>
            <option value="Electrical & Fixtures">Electrical & Fixtures</option>
            <option value="Painting & Polish">Painting & Polish</option>
            <option value="Carpentry & Doors">Carpentry & Doors</option>
            <option value="Flooring & Tiling">Flooring & Tiling</option>
          </select>
        </div>
      </div>

      {/* Snag Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#F8FAFC] border-b border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Subject & Details</th>
                <th className="py-3 px-4">Deal / Unit</th>
                <th className="py-3 px-4">Category & Location</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assignee & Origin</th>
                <th className="py-3 px-4">Target Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSnags.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-3">
                      <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-slate-700">No Snag Records Found</p>
                      <p className="text-xs text-slate-400">
                        {searchQuery ? "Try refining your search query or filters." : "Create your first snag module entry to start tracking defects."}
                      </p>
                      <Link
                        href="/snags/create"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#1F69FF] text-white rounded-xl shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Snag Module</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSnags.map((snag) => {
                  const priorityColor =
                    snag.priority === "Critical"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : snag.priority === "High"
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : snag.priority === "Medium"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-600 border-slate-200";

                  const statusColor =
                    snag.status === "Logged"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : snag.status === "In Progress"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : snag.status === "Awaiting Material"
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : snag.status === "Ready for Recheck"
                      ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                      : snag.status === "Resolved" || snag.status === "Verified"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : snag.status === "Closed"
                      ? "bg-slate-100 text-slate-700 border-slate-200"
                      : "bg-blue-50 text-blue-700 border-blue-200";

                  const raisedDate = snag.raisedOn ? new Date(snag.raisedOn) : new Date(snag.createdAt);
                  const agingDays = Math.max(0, Math.floor((Date.now() - raisedDate.getTime()) / (1000 * 60 * 60 * 24)));

                  return (
                    <tr
                      key={snag.id}
                      onClick={() => router.push(`/snags/create?id=${snag.id}`)}
                      className="hover:bg-blue-50/30 transition cursor-pointer group"
                    >
                      {/* Subject & Description */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 group-hover:text-[#1F69FF] transition">
                            {snag.subject}
                          </span>
                          {snag.inspectionType && snag.inspectionType !== "-None-" && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                snag.inspectionType === "Pre Handover"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : "bg-teal-50 text-teal-700 border-teal-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  snag.inspectionType === "Pre Handover" ? "bg-indigo-500" : "bg-teal-500"
                                }`}
                              />
                              {snag.inspectionType}
                            </span>
                          )}
                        </div>
                        {snag.snagDescription && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-xs">
                            {snag.snagDescription}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Owner: {snag.snagOwner}
                        </div>
                      </td>

                      {/* Deal / Unit */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{snag.unitNumber || "General Unit"}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                          {snag.dealName || snag.customerDealName || "Direct Site"}
                        </div>
                      </td>

                      {/* Category & Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {snag.category && snag.category !== "None" ? snag.category : "General"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {snag.locationInUnit && snag.locationInUnit !== "None"
                            ? snag.locationInUnit
                            : "Entire Unit"}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${priorityColor}`}
                        >
                          {snag.priority && snag.priority !== "-None-" ? snag.priority : "Medium"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              snag.status === "Logged"
                                ? "bg-red-500"
                                : snag.status === "In Progress"
                                ? "bg-amber-500"
                                : snag.status === "Resolved" || snag.status === "Verified"
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                            }`}
                          />
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}
                          >
                            {snag.status}
                          </span>
                        </div>
                      </td>

                      {/* Assignee & Origin */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 truncate max-w-[150px]">
                          {snag.assignTo && snag.assignTo !== "None" ? snag.assignTo : "Unassigned"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Origin: {snag.snagOrigin}
                        </div>
                      </td>

                      {/* Target Date & Aging Days */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-semibold">
                          {snag.targetClosureDate
                            ? new Date(snag.targetClosureDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "--"}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Age: <span className="font-medium text-slate-600">{agingDays} {agingDays === 1 ? "day" : "days"}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {snag.status !== "Resolved" && snag.status !== "Closed" && (
                            <button
                              type="button"
                              title="Mark Resolved"
                              onClick={(e) => handleStatusChange(snag.id, "Resolved", e)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            href={`/snags/create?id=${snag.id}`}
                            className="p-1.5 text-slate-500 hover:text-[#1F69FF] hover:bg-blue-50 rounded-lg transition"
                            title="Edit Snag"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            title="Delete Snag"
                            onClick={(e) => handleDelete(snag.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
