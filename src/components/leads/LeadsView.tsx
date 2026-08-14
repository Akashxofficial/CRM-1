"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  LayoutGrid,
  List,
  Phone,
  Building,
  User,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AddLeadModal } from "./AddLeadModal";
import { LeadDrawer } from "./LeadDrawer";

interface Props {
  initialLeads: any[];
  projects: any[];
  users: any[];
  units: any[];
  userRole: string;
}

const STAGES = [
  { key: "NEW", label: "New Enquiries", color: "border-sky-500 bg-sky-500/10 text-sky-500" },
  { key: "CONTACTED", label: "Contacted", color: "border-indigo-500 bg-indigo-500/10 text-indigo-500" },
  { key: "SITE_VISIT_SCHEDULED", label: "Visit Scheduled", color: "border-purple-500 bg-purple-500/10 text-purple-500" },
  { key: "SITE_VISIT_DONE", label: "Visit Completed", color: "border-cyan-500 bg-cyan-500/10 text-cyan-500" },
  { key: "NEGOTIATION", label: "Negotiation / Hold", color: "border-amber-500 bg-amber-500/10 text-amber-500" },
  { key: "BOOKED", label: "Booked", color: "border-emerald-500 bg-emerald-500/10 text-emerald-500" },
  { key: "LOST", label: "Lost", color: "border-rose-500 bg-rose-500/10 text-rose-500" },
];

export function LeadsView({ initialLeads, projects, users, units, userRole }: Props) {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [selectedSource, setSelectedSource] = useState("ALL");
  const [selectedAgentId, setSelectedAgentId] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeLead, setActiveLead] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter leads
  const filteredLeads = initialLeads.filter((l) => {
    if (selectedProjectId !== "ALL" && l.projectId !== selectedProjectId) return false;
    if (selectedSource !== "ALL" && l.source !== selectedSource) return false;
    if (selectedAgentId !== "ALL" && l.assignedToId !== selectedAgentId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = l.name.toLowerCase().includes(q);
      const matchPhone = l.phone.toLowerCase().includes(q);
      const matchEmail = l.email?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ["Name", "Phone", "Email", "Project", "Status", "Source", "Assigned Agent", "Budget Range"];
    const rows = filteredLeads.map((l) => [
      `"${l.name}"`,
      `"${l.phone}"`,
      `"${l.email || ""}"`,
      `"${l.project?.name || ""}"`,
      `"${l.status}"`,
      `"${l.source}"`,
      `"${l.assignedTo?.name || "Unassigned"}"`,
      `"${formatCurrency(l.budgetMin)} - ${formatCurrency(l.budgetMax)}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `propcrm_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-slate-900 tracking-normal flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3B8CFF]" /> Full-Funnel Leads CRM
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture enquiries, track activity timelines, and convert hot negotiations into confirmed bookings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Capture Lead
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search lead by name, phone or email..."
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

        <div className="w-36">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="ALL">All Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Portal">Portal</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Channel Partner">Channel Partner</option>
          </select>
        </div>

        {userRole !== "SALES_AGENT" && (
          <div className="w-44">
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="ALL">All Sales Agents</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage.key);

            return (
              <div
                key={stage.key}
                className="w-72 flex-shrink-0 bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[70vh]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      {stage.label}
                    </h2>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {stageLeads.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No leads in this stage
                    </div>
                  )}

                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setActiveLead(lead)}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-sky-500 dark:hover:border-sky-500 cursor-pointer transition group"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-sky-500 transition">
                          {lead.name}
                        </span>
                        {lead.priority === "HOT" && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            🔥 HOT
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {lead.phone}
                      </div>

                      <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>{lead.interestedType || "Residential"}</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(lead.budgetMax)}
                        </span>
                      </div>

                      {lead.interestedUnit && (
                        <div className="mt-2 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          Unit: {lead.interestedUnit.unitNumber} ({lead.interestedUnit.tower?.name})
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{lead.assignedTo?.name?.split(" ")[0] || "Unassigned"}</span>
                        <span>{lead.activities?.length || 0} activities</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabular List View */}
      {viewMode === "table" && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Project & Type</th>
                  <th className="p-4">Budget Range</th>
                  <th className="p-4">Funnel Status</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Assigned Agent</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setActiveLead(lead)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{lead.name}</div>
                      <div className="text-slate-400 text-[11px]">{lead.phone} • {lead.email || "No email"}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white">{lead.project?.name}</div>
                      <div className="text-slate-400 text-[11px]">{lead.interestedType || "Any"}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(lead.budgetMin)} - {formatCurrency(lead.budgetMax)}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{lead.source}</td>
                    <td className="p-4 text-slate-500">{lead.assignedTo?.name || "Unassigned"}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLead(lead);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 dark:bg-sky-950/50 rounded-lg"
                      >
                        Manage →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Cockpit Drawer */}
      {activeLead && (
        <LeadDrawer
          lead={activeLead}
          onClose={() => setActiveLead(null)}
          availableUnits={units}
        />
      )}

      {/* Capture Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        projects={projects}
        users={users}
      />
    </div>
  );
}
