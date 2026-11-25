"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Mail,
  TrendingUp,
  Sparkles,
  Award,
  Calendar,
  Flame,
  Globe,
  Share2,
  ExternalLink,
  Target,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { UrbanGaonEnquiryModal } from "./UrbanGaonEnquiryModal";
import { LeadDrawer } from "./LeadDrawer";

interface Props {
  initialLeads: any[];
  projects: any[];
  users: any[];
  units: any[];
  userRole: string;
}

const STAGES = [
  { key: "NEW", label: "New Enquiries", color: "border-sky-500 bg-sky-500/10 text-sky-500", badgeClass: "bg-sky-50 text-sky-700 border-sky-200" },
  { key: "CONTACTED", label: "Contacted", color: "border-indigo-500 bg-indigo-500/10 text-indigo-500", badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { key: "SITE_VISIT_SCHEDULED", label: "Visit Scheduled", color: "border-purple-500 bg-purple-500/10 text-purple-500", badgeClass: "bg-purple-50 text-purple-700 border-purple-200" },
  { key: "SITE_VISIT_DONE", label: "Visit Completed", color: "border-cyan-500 bg-cyan-500/10 text-cyan-500", badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { key: "NEGOTIATION", label: "Negotiation / Hold", color: "border-amber-500 bg-amber-500/10 text-amber-500", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "BOOKED", label: "Booked / Won", color: "border-emerald-500 bg-emerald-500/10 text-emerald-500", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "LOST", label: "Lost / Dropped", color: "border-rose-500 bg-rose-500/10 text-rose-500", badgeClass: "bg-rose-50 text-rose-700 border-rose-200" },
];

export function LeadsView({ initialLeads, projects, users, units, userRole }: Props) {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>(initialLeads);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [selectedStageTab, setSelectedStageTab] = useState<string>("ALL");
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [selectedSource, setSelectedSource] = useState("ALL");
  const [selectedAgentId, setSelectedAgentId] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeLead, setActiveLead] = useState<any | null>(null);
  const [selectedFormLead, setSelectedFormLead] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  // Real-time background sync for incoming Website contact form leads (every 30s when idle)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && !isAddModalOpen && !activeLead) {
        router.refresh();
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [router, isAddModalOpen, activeLead]);

  const handleManualSync = () => {
    setIsSyncing(true);
    router.refresh();
    setTimeout(() => setIsSyncing(false), 700);
  };

  const openLeadEnquiryForm = (lead: any) => {
    setActiveLead(null);
    setSelectedFormLead(lead);
    setIsAddModalOpen(true);
  };

  const openNewLeadForm = () => {
    setActiveLead(null);
    setSelectedFormLead(null);
    setIsAddModalOpen(true);
  };

  const handleLeadSaved = (savedLead: any) => {
    setLeads((prev) => {
      const exists = prev.some((l) => l.id === savedLead.id);
      if (exists) {
        return prev.map((l) => (l.id === savedLead.id ? { ...l, ...savedLead } : l));
      }
      return [savedLead, ...prev];
    });
    if (selectedFormLead && savedLead.id === selectedFormLead.id) {
      setSelectedFormLead(savedLead);
    }
    router.refresh();
  };

  // Status badge styling helper strictly calibrated for real estate sales funnel
  const getLeadStatusBadge = (status: string) => {
    switch (status) {
      case "BOOKED":
        return {
          label: "Booked / Won",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "NEGOTIATION":
        return {
          label: "In Negotiation",
          className: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "SITE_VISIT_DONE":
        return {
          label: "Visit Completed",
          className: "bg-cyan-50 text-cyan-700 border-cyan-200",
        };
      case "SITE_VISIT_SCHEDULED":
        return {
          label: "Visit Scheduled",
          className: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "CONTACTED":
        return {
          label: "Contacted",
          className: "bg-indigo-50 text-indigo-700 border-indigo-200",
        };
      case "NEW":
        return {
          label: "New Enquiry",
          className: "bg-sky-50 text-sky-700 border-sky-200",
        };
      case "LOST":
        return {
          label: "Lost / Dropped",
          className: "bg-rose-50 text-rose-700 border-rose-200",
        };
      default:
        return {
          label: status,
          className: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  // Source attribution styling helper
  const getSourceBadge = (source: string) => {
    const s = (source || "Website").toLowerCase();
    if (s.includes("google") || s.includes("ad")) {
      return {
        label: source || "Google Ads",
        icon: Target,
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };
    }
    if (s.includes("referral")) {
      return {
        label: source,
        icon: Users,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    if (s.includes("walk")) {
      return {
        label: source,
        icon: Building,
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    if (s.includes("partner") || s.includes("channel")) {
      return {
        label: source,
        icon: Share2,
        className: "bg-purple-50 text-purple-700 border-purple-200",
      };
    }
    if (s.includes("portal")) {
      return {
        label: source,
        icon: ExternalLink,
        className: "bg-cyan-50 text-cyan-700 border-cyan-200",
      };
    }
    return {
      label: source || "Website",
      icon: Globe,
      className: "bg-slate-50 text-slate-700 border-slate-200",
    };
  };

  // Filter leads across all pipeline dimensions
  const filteredLeads = leads.filter((l) => {
    if (selectedStageTab !== "ALL" && l.status !== selectedStageTab) return false;
    if (selectedProjectId !== "ALL" && l.projectId !== selectedProjectId) return false;
    if (selectedSource !== "ALL" && l.source !== selectedSource) return false;
    if (selectedAgentId !== "ALL" && l.assignedToId !== selectedAgentId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = l.name?.toLowerCase().includes(q);
      const matchPhone = l.phone?.toLowerCase().includes(q);
      const matchEmail = l.email?.toLowerCase().includes(q);
      const matchProject = l.project?.name?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchProject) return false;
    }
    return true;
  });

  // Calculate Executive Funnel Metrics
  const totalLeads = leads.length;
  const newLeadsCount = leads.filter((l) => l.status === "NEW").length;
  const hotProspects = leads.filter((l) => ["NEGOTIATION", "SITE_VISIT_DONE"].includes(l.status) || l.priority === "HOT").length;
  const siteVisits = leads.filter((l) => ["SITE_VISIT_SCHEDULED", "SITE_VISIT_DONE"].includes(l.status)).length;
  const bookedCount = leads.filter((l) => l.status === "BOOKED").length;
  const totalPipelineBudget = leads.reduce((acc, curr) => acc + (curr.budgetMax || 0), 0);

  const exportCSV = () => {
    const headers = ["Lead Name", "Phone", "Email", "Project", "Preference", "Pipeline Stage", "Priority", "Source", "Assigned Agent", "Budget Range"];
    const rows = filteredLeads.map((l) => [
      `"${l.name}"`,
      `"${l.phone}"`,
      `"${l.email || ""}"`,
      `"${l.project?.name || ""}"`,
      `"${l.interestedType || ""}"`,
      `"${l.status}"`,
      `"${l.priority || "MEDIUM"}"`,
      `"${l.source}"`,
      `"${l.assignedTo?.name || "Unassigned"}"`,
      `"${formatCurrency(l.budgetMin)} - ${formatCurrency(l.budgetMax)}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `urbangaon_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3B8CFF]" /> Full-Funnel Leads CRM
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture enquiries, track activity timelines, and convert hot negotiations into confirmed bookings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${viewMode === "table"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${viewMode === "kanban"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={handleManualSync}
            className="px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Sync incoming Website leads"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#3B8CFF] ${isSyncing ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
          </button>

          <button
            onClick={openNewLeadForm}
            className="px-4 py-2 text-xs font-bold bg-[#3B8CFF] hover:bg-blue-600 active:scale-95 text-white rounded-xl shadow-sm shadow-[#3B8CFF]/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Capture Lead
          </button>
        </div>
      </div>

      {/* CEO Executive Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Pipeline Leads
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalLeads}</div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> {newLeadsCount} New Enquiries
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Hot Prospects
            </span>
            <div className="text-2xl font-black text-amber-600 mt-0.5">{hotProspects}</div>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5">
              High Intent & Negotiation
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Site Visits
            </span>
            <div className="text-2xl font-black text-[#3B8CFF] mt-0.5">{siteVisits}</div>
            <span className="text-[11px] text-blue-600 font-medium mt-0.5">
              Scheduled & Completed
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#3B8CFF]">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pipeline Volume
            </span>
            <div className="text-xl font-black text-emerald-600 mt-0.5">
              {formatCurrency(totalPipelineBudget)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5">
              {bookedCount} Converted / Won
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>


      {/* Quick Stage Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 touch-pan-x scrollbar-none">
        <button
          onClick={() => setSelectedStageTab("ALL")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${selectedStageTab === "ALL"
            ? "bg-[#3B8CFF] text-white shadow-2xs"
            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
        >
          <span>All Leads</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${selectedStageTab === "ALL" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}>
            {totalLeads}
          </span>
        </button>

        {STAGES.map((stage) => {
          const count = leads.filter((l) => l.status === stage.key).length;
          const isActive = selectedStageTab === stage.key;

          return (
            <button
              key={stage.key}
              onClick={() => setSelectedStageTab(stage.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${isActive
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
            >
              <span>{stage.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search leads by name, phone, email or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#3B8CFF]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="w-48">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
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
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
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
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
            >
              <option value="ALL">All Sales Agents</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabular List View - Wide, Executive Full-Funnel Leads Table */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[1100px]">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 min-w-[240px]">Lead / Prospect</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Contact & WhatsApp</th>
                  <th className="py-3.5 px-4 min-w-[170px]">Project & Preference</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Budget Range</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Pipeline Stage</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Source</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Assigned Agent</th>
                  <th className="py-3.5 px-4 w-14 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <UserCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">No leads found</p>
                      <p className="text-[11px] mt-1 text-slate-400">
                        Try changing your filters or capture a new lead into the pipeline.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const badge = getLeadStatusBadge(lead.status);
                    const sourceBadge = getSourceBadge(lead.source);
                    const SourceIcon = sourceBadge.icon;
                    const cleanPhone = (lead.phone || "").replace(/\D/g, "");
                    const isHot = lead.priority === "HOT";

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => openLeadEnquiryForm(lead)}
                        className="hover:bg-slate-50/80 transition cursor-pointer group"
                      >
                        {/* Lead / Prospect Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#3B8CFF]/10 text-[#3B8CFF] font-bold flex items-center justify-center flex-shrink-0 text-xs">
                              {lead.name?.charAt(0) || "L"}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 group-hover:text-[#3B8CFF] transition block truncate">
                                  {lead.name}
                                </span>
                                {isHot && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 flex-shrink-0">
                                    <Flame className="w-2.5 h-2.5 fill-rose-500" /> HOT
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block truncate">
                                Enquired: {lead.createdAt ? formatDate(lead.createdAt) : "Recent"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact & WhatsApp */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${lead.phone}`}
                                className="font-semibold text-slate-800 hover:text-[#3B8CFF] flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{lead.phone}</span>
                              </a>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${cleanPhone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                >
                                  WA
                                </a>
                              )}
                            </div>
                            {lead.email ? (
                              <a
                                href={`mailto:${lead.email}`}
                                className="text-[11px] text-slate-500 hover:underline flex items-center gap-1 truncate max-w-[180px]"
                              >
                                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{lead.email}</span>
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-300" /> No email
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Project & Preference */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lead.project?.name || "UrbanGaon One"}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {lead.interestedType || (lead.interestedUnit ? `Unit: ${lead.interestedUnit.unitNumber}` : "3BHK")}
                          </div>
                        </td>

                        {/* Budget Range */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900">
                            {formatCurrency(lead.budgetMax || 0)}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            From {formatCurrency(lead.budgetMin || 0)}
                          </div>
                        </td>

                        {/* Pipeline Stage */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.className}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {badge.label}
                          </span>
                        </td>

                        {/* Source Attribution */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${sourceBadge.className}`}
                          >
                            <SourceIcon className="w-3 h-3" />
                            <span>{sourceBadge.label}</span>
                          </span>
                        </td>

                        {/* Assigned Agent */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lead.assignedTo?.name || "Rahul Verma (Senior Sales Agent)"}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openLeadEnquiryForm(lead)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                            title="Open Prefilled Enquiry Form"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === "kanban" && (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-6 touch-pan-x snap-x scroll-pl-3 sm:scroll-pl-0 -mx-3.5 sm:mx-0 px-3.5 sm:px-0">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage.key);

            return (
              <div
                key={stage.key}
                className="w-[80vw] sm:w-72 md:w-80 flex-shrink-0 snap-start bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 flex flex-col max-h-[75vh]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                      {stage.label}
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => openLeadEnquiryForm(lead)}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-[#3B8CFF]/50 transition cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#3B8CFF] transition truncate">
                            {lead.name}
                          </h3>
                          {lead.priority === "HOT" && (
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 flex-shrink-0">
                              <Flame className="w-2 h-2 fill-rose-500" /> HOT
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-2.5 h-2.5" />
                          {lead.source}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{lead.phone}</span>
                      </div>

                      {lead.project && (
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{lead.project.name}</span>
                        </div>
                      )}

                      <div className="mt-2 text-xs font-medium text-slate-600 flex items-center justify-between">
                        <span>Budget:</span>
                        <span className="font-semibold text-emerald-600">
                          {formatCurrency(lead.budgetMax)}
                        </span>
                      </div>

                      {lead.interestedUnit && (
                        <div className="mt-2 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                          Unit: {lead.interestedUnit.unitNumber} ({lead.interestedUnit.tower?.name})
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
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

      {/* Lead Cockpit Drawer */}
      {activeLead && (
        <LeadDrawer
          lead={activeLead}
          onClose={() => setActiveLead(null)}
          availableUnits={units}
        />
      )}

      {/* UrbanGaon Customer Enquiry Form Modal (Prefilled & Auto-Synced when a lead is clicked) */}
      <UrbanGaonEnquiryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedFormLead(null);
        }}
        projects={projects}
        agents={users}
        initialLead={selectedFormLead}
        userRole={userRole}
        onLeadSaved={handleLeadSaved}
        onOpenPipeline={
          selectedFormLead
            ? () => {
                const target = selectedFormLead;
                setIsAddModalOpen(false);
                setSelectedFormLead(null);
                setActiveLead(target);
              }
            : undefined
        }
      />
    </div>
  );
}
