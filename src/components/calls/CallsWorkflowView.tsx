"use client";

import { useState, useTransition } from "react";
import {
  Phone,
  PhoneCall,
  Mail,
  User,
  Clock,
  CheckCircle,
  Tag,
  Share2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Calendar,
  Layers,
  MapPin,
  X,
  FileText,
  Building,
  Check,
} from "lucide-react";
import { updateLeadStatusAction, gatherLeadDetailsAction } from "@/actions/leads-actions";
import Link from "next/link";

interface LeadItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  interestedType?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  priority?: string | null;
  createdAt?: Date | string;
  assignedTo?: { name: string } | null;
  project?: { name: string; location?: string } | null;
  activities?: any[];
}

interface Props {
  initialLeads: LeadItem[];
  currentUserName: string;
}

export function CallsWorkflowView({ initialLeads, currentUserName }: Props) {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    initialLeads[0]?.id || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Active Lead State Transition
  // States: "Inquiry" | "Attempted to Contact" | "Interested" | "Not Interested" | "Junk Lead" | "Follow up 2"
  const [leadStates, setLeadStates] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialLeads.forEach((l) => {
      if (l.status === "INTERESTED") map[l.id] = "Interested";
      else if (l.status === "CONTACTED" || l.status === "Attempted to Contact")
        map[l.id] = "Attempted to Contact";
      else if (l.status === "LOST" || l.status === "Not Interested")
        map[l.id] = "Not Interested";
      else map[l.id] = "Inquiry";
    });
    return map;
  });

  // Gather Details Modal State
  const [isGatherModalOpen, setIsGatherModalOpen] = useState(false);
  const [annualIncome, setAnnualIncome] = useState("-None-");
  const [purposeOfPurchase, setPurposeOfPurchase] = useState("Investment");
  const [livingStatus, setLivingStatus] = useState("-None-");
  const [purchaseTimeline, setPurchaseTimeline] = useState("-None-");
  const [budgetRange, setBudgetRange] = useState("-None-");
  const [housingStyle, setHousingStyle] = useState("-None-");
  const [notes, setNotes] = useState("");
  const [gatherSuccessMsg, setGatherSuccessMsg] = useState("");

  const selectedLead =
    leads.find((l) => l.id === selectedLeadId) ||
    leads[0] || {
      id: "demo-1",
      name: "aakash akash",
      email: "a@g.com",
      phone: "9989898989",
      source: "Customer Form",
      status: "Inquiry",
      assignedTo: { name: currentUserName || "Yudhister Tiwari" },
      project: { name: "UrbanGaon One, Jagatpura" },
    };

  const currentState = leadStates[selectedLead.id] || "Inquiry";

  const handleStateTransition = (newState: string) => {
    setLeadStates((prev) => ({ ...prev, [selectedLead.id]: newState }));
    startTransition(async () => {
      let dbStatus = "NEW";
      if (newState === "Attempted to Contact") dbStatus = "CONTACTED";
      else if (newState === "Interested") dbStatus = "INTERESTED";
      else if (newState === "Not Interested" || newState === "Junk Lead") dbStatus = "LOST";
      else if (newState === "Follow up 2") dbStatus = "SITE_VISIT_SCHEDULED";

      await updateLeadStatusAction(selectedLead.id, dbStatus);
    });
  };

  const handleSaveGatherDetails = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await gatherLeadDetailsAction({
        leadId: selectedLead.id,
        annualIncome,
        purposeOfPurchase,
        livingStatus,
        purchaseTimeline,
        budgetRange,
        housingStyle,
        notes,
      });

      setGatherSuccessMsg("Lead details gathered & saved successfully!");
      setTimeout(() => {
        setGatherSuccessMsg("");
        setIsGatherModalOpen(false);
      }, 1200);
    });
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-5 min-h-[85vh] font-sans text-slate-800">
      {/* LEFT SIDEBAR: Real-time Inquiries & Calls Queue */}
      <div className="w-full lg:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col flex-shrink-0">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#3B8CFF]" />
              <span>Calls Queue</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {leads.length} Customer Enquiries
            </p>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F0F6FF] text-[#3B8CFF] rounded-full border border-[#3B8CFF]/20">
            Live
          </span>
        </div>

        {/* Search */}
        <div className="relative my-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lead or phone..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
          />
        </div>

        {/* Leads List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[70vh]">
          {filteredLeads.map((lead) => {
            const isSelected = lead.id === selectedLead.id;
            const stateLabel = leadStates[lead.id] || "Inquiry";

            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={`p-3 rounded-xl cursor-pointer border transition-all duration-150 ${
                  isSelected
                    ? "bg-[#F0F6FF] border-[#3B8CFF] shadow-xs"
                    : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/70"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#3B8CFF]/10 text-[#3B8CFF] flex items-center justify-center font-bold text-xs">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                        {lead.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {lead.phone}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      stateLabel === "Interested"
                        ? "bg-emerald-100 text-emerald-700"
                        : stateLabel === "Attempted to Contact"
                        ? "bg-amber-100 text-amber-700"
                        : stateLabel === "Not Interested" || stateLabel === "Junk Lead"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {stateLabel}
                  </span>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100/70">
                  <span className="truncate max-w-[120px]">
                    {lead.project?.name || "UrbanGaon One"}
                  </span>
                  <span>{lead.source || "Website"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT MAIN DETAIL & STATE TRANSITION PANEL (Matches Screenshots 1, 2, 3) */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
        {/* Top Action Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200/80 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-[#3B8CFF]/15 text-[#3B8CFF] flex items-center justify-center font-bold text-sm">
              {selectedLead.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 font-heading">
                  {selectedLead.name}
                </h1>
                <button className="text-[11px] text-[#3B8CFF] hover:underline flex items-center gap-0.5">
                  <Tag className="w-3 h-3" />
                  <span>Add Tags</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`mailto:${selectedLead.email}`}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#3B8CFF] hover:bg-[#2570E8] text-white rounded-lg transition shadow-xs flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </a>
            <button className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition">
              Convert
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition">
              Edit
            </button>
            <button className="p-1.5 text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-lg transition">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Related List mini-sidebar */}
          <div className="w-full md:w-44 p-4 border-b md:border-b-0 md:border-r border-slate-200/70 bg-[#F8FAFC] text-xs space-y-4 flex-shrink-0">
            <div>
              <div className="font-bold text-slate-900 mb-2">Related List</div>
              <ul className="space-y-1 text-slate-600">
                <li className="px-2 py-1 rounded-md hover:bg-white cursor-pointer font-medium text-slate-900 bg-white shadow-2xs">
                  Notes
                </li>
                <li className="px-2 py-1 rounded-md hover:bg-white cursor-pointer">
                  Open Activities
                </li>
                <li className="px-2 py-1 rounded-md hover:bg-white cursor-pointer">
                  Closed Activities
                </li>
                <li className="px-2 py-1 rounded-md hover:bg-white cursor-pointer">
                  Invited Meetings
                </li>
                <li className="px-2 py-1 rounded-md hover:bg-white cursor-pointer flex items-center justify-between">
                  <span>Emails</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
                    1
                  </span>
                </li>
                <li className="px-2 py-1 rounded-md hover:bg-white cursor-pointer">
                  Attachments
                </li>
              </ul>
              <button className="text-[11px] text-[#3B8CFF] hover:underline mt-2 font-medium">
                + Add Related List
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200/60">
              <div className="font-bold text-slate-900 mb-1">Links</div>
              <button className="text-[11px] text-[#3B8CFF] hover:underline font-medium">
                + Add Link
              </button>
            </div>
          </div>

          {/* Main Detail Area */}
          <div className="flex-1 p-5 space-y-5 overflow-y-auto">
            {/* Overview / Timeline Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button className="px-3.5 py-1 text-xs font-bold text-slate-900 bg-slate-100 rounded-full border border-slate-200 shadow-2xs">
                Overview
              </button>
              <button className="px-3.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 rounded-full">
                Timeline
              </button>
            </div>

            {/* STATE MACHINE TRANSITION BAR (Screenshot 1, 2, 3) */}
            <div className="p-4 rounded-xl border border-slate-200/90 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <span className="w-24 text-slate-400">Current State</span>
                  <span className="text-slate-900 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    {currentState}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="w-24 text-slate-400 font-semibold">
                    Transitions
                  </span>

                  {/* STEP 1: Current State = "Inquiry" ➔ Transition: [Take Into Call] */}
                  {currentState === "Inquiry" && (
                    <button
                      onClick={() => handleStateTransition("Attempted to Contact")}
                      className="px-4 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Take Into Call</span>
                    </button>
                  )}

                  {/* STEP 2: Current State = "Attempted to Contact" ➔ Transitions: [Not Interested, Interested, Junk Lead, Follow up 2] */}
                  {currentState === "Attempted to Contact" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleStateTransition("Not Interested")}
                        className="px-3.5 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold text-xs shadow-xs transition"
                      >
                        Not Interested
                      </button>
                      <button
                        onClick={() => handleStateTransition("Interested")}
                        className="px-3.5 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold text-xs shadow-xs transition"
                      >
                        Interested
                      </button>
                      <button
                        onClick={() => handleStateTransition("Junk Lead")}
                        className="px-3.5 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold text-xs shadow-xs transition"
                      >
                        Junk Lead
                      </button>
                      <button
                        onClick={() => handleStateTransition("Follow up 2")}
                        className="px-3.5 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold text-xs shadow-xs transition"
                      >
                        Follow up 2
                      </button>
                    </div>
                  )}

                  {/* STEP 3: Current State = "Interested" ➔ Transition: [Gather Details] */}
                  {currentState === "Interested" && (
                    <button
                      onClick={() => setIsGatherModalOpen(true)}
                      className="px-4 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Gather Details</span>
                    </button>
                  )}

                  {/* Other states (Not Interested / Junk / Followup) */}
                  {(currentState === "Not Interested" ||
                    currentState === "Junk Lead" ||
                    currentState === "Follow up 2") && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium italic">
                        State logged: {currentState}
                      </span>
                      <button
                        onClick={() => handleStateTransition("Attempted to Contact")}
                        className="text-xs text-[#3B8CFF] hover:underline font-semibold"
                      >
                        Re-call / Change
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button className="text-[11px] text-[#3B8CFF] hover:underline self-start sm:self-center font-medium">
                View configured actions
              </button>
            </div>

            {/* LEAD CORE FIELDS BLOCK (Screenshot 1, 2, 3) */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-3.5 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-xs">
                <div className="flex items-center">
                  <span className="w-36 text-slate-400 font-medium">Lead Owner</span>
                  <span className="font-semibold text-slate-900">
                    {selectedLead.assignedTo?.name || currentUserName || "Yudhister Tiwari"}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="w-36 text-slate-400 font-medium">Email</span>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="font-medium text-[#3B8CFF] hover:underline"
                  >
                    {selectedLead.email}
                  </a>
                </div>

                <div className="flex items-center">
                  <span className="w-36 text-slate-400 font-medium">Mobile</span>
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <span>{selectedLead.phone}</span>
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition"
                      title="Direct Dial"
                    >
                      <Phone className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-36 text-slate-400 font-medium">Lead Status</span>
                  <span className="font-semibold text-slate-900">
                    {currentState}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="w-36 text-slate-400 font-medium">
                    Scheduling site visit
                  </span>
                  <span className="text-slate-400">—</span>
                </div>
              </div>
            </div>

            {/* Basic Information section */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 pb-2 border-b border-slate-200">
                <span>Basic Information</span>
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-slate-600 font-normal">
                    Hide Details
                  </button>
                  <button className="px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700">
                    Locate Map
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Project Preference</span>
                  <span className="font-medium text-slate-800">
                    {selectedLead.project?.name || "UrbanGaon One, Jagatpura"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Source</span>
                  <span className="font-medium text-slate-800">
                    {selectedLead.source || "Customer Enquiry Form"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 4: GATHER DETAILS POPUP MODAL (Screenshot 4) */}
      {isGatherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Gather Details
              </h2>
              <button
                type="button"
                onClick={() => setIsGatherModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab */}
            <div className="px-6 pt-3 border-b border-slate-200/80">
              <span className="inline-block pb-2 border-b-2 border-[#3B8CFF] text-xs font-bold text-slate-900">
                Notes, Attachments & Fields
              </span>
            </div>

            {/* Form Fields with red accent indicator (Screenshot 4) */}
            <form onSubmit={handleSaveGatherDetails} className="p-6 space-y-4 text-xs">
              {gatherSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{gatherSuccessMsg}</span>
                </div>
              )}

              {/* Annual Income */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="text-right sm:text-right text-slate-600 font-medium pr-3">
                  Annual Income
                </label>
                <div className="sm:col-span-2 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-md" />
                  <select
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3B8CFF] cursor-pointer"
                  >
                    <option value="-None-">-None-</option>
                    <option value="Upto 10 Lakhs">Upto 10 Lakhs</option>
                    <option value="10-50 Lakhs">10-50 Lakhs</option>
                    <option value="More than 50 Lakhs">More than 50 Lakhs</option>
                    <option value="Prefer not to disclose">Prefer not to disclose</option>
                  </select>
                </div>
              </div>

              {/* Purpose of Purchase */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="text-right sm:text-right text-slate-600 font-medium pr-3">
                  Purpose of Purchase
                </label>
                <div className="sm:col-span-2 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-md" />
                  <select
                    value={purposeOfPurchase}
                    onChange={(e) => setPurposeOfPurchase(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3B8CFF] cursor-pointer"
                  >
                    <option value="-None-">-None-</option>
                    <option value="Investment">Investment</option>
                    <option value="End Use">End Use</option>
                  </select>
                </div>
              </div>

              {/* Current living Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="text-right sm:text-right text-slate-600 font-medium pr-3">
                  Current living Status
                </label>
                <div className="sm:col-span-2 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-md" />
                  <select
                    value={livingStatus}
                    onChange={(e) => setLivingStatus(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3B8CFF] cursor-pointer"
                  >
                    <option value="-None-">-None-</option>
                    <option value="Own">Own</option>
                    <option value="Rent">Rent</option>
                    <option value="Rented">Rented</option>
                  </select>
                </div>
              </div>

              {/* Purchase Timelines */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="text-right sm:text-right text-slate-600 font-medium pr-3">
                  Purchase Timelines
                </label>
                <div className="sm:col-span-2 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-md" />
                  <select
                    value={purchaseTimeline}
                    onChange={(e) => setPurchaseTimeline(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3B8CFF] cursor-pointer"
                  >
                    <option value="-None-">-None-</option>
                    <option value="With in 1 Month">With in 1 Month</option>
                    <option value="1-3 Months">1-3 Months</option>
                    <option value="6-12 Months">6-12 Months</option>
                  </select>
                </div>
              </div>

              {/* What is your overall budget range */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="text-right sm:text-right text-slate-600 font-medium pr-3">
                  What is your overall budget range
                </label>
                <div className="sm:col-span-2 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-md" />
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3B8CFF] cursor-pointer"
                  >
                    <option value="-None-">-None-</option>
                    <option value="<₹50 Lakhs">&lt;₹50 Lakhs</option>
                    <option value="₹50 Lakhs-₹1 Crore">₹50 Lakhs-₹1 Crore</option>
                    <option value=">₹1 Crore">&gt;₹1 Crore</option>
                    <option value="Prefer not to disclose">Prefer not to disclose</option>
                  </select>
                </div>
              </div>

              {/* Desired Housing Style */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="text-right sm:text-right text-slate-600 font-medium pr-3">
                  Desired Housing Style
                </label>
                <div className="sm:col-span-2 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-md" />
                  <select
                    value={housingStyle}
                    onChange={(e) => setHousingStyle(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3B8CFF] cursor-pointer"
                  >
                    <option value="-None-">-None-</option>
                    <option value="Plot">Plot</option>
                    <option value="2/3 BHK">2/3 BHK</option>
                    <option value="Serviced Apartment">Serviced Apartment</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 pt-1">
                <label className="text-right sm:text-right text-slate-600 font-medium pr-3">
                  Notes
                </label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a note"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#3B8CFF]"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGatherModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#3B8CFF] text-[#3B8CFF] hover:bg-[#F0F6FF] font-semibold text-xs transition"
                >
                  Save as Draft
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGatherModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold text-xs transition shadow-xs disabled:opacity-50"
                  >
                    {isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
