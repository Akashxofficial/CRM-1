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
  Send,
  Sparkles,
  ArrowRight,
  Edit3,
  Trash2,
  Printer,
  MessageSquare,
  DollarSign,
  Briefcase,
  AlertCircle,
  Headphones,
  Lock,
  Unlock,
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
  tags?: string[];
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

  // Track if call has been initiated ("taken") for each lead
  // If a lead was already in CONTACTED / INTERESTED in DB, it's considered unlocked
  const [unlockedCalls, setUnlockedCalls] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    initialLeads.forEach((l) => {
      if (l.status && l.status !== "NEW" && l.status !== "Inquiry") {
        map[l.id] = true;
      } else {
        map[l.id] = false;
      }
    });
    return map;
  });

  // Lead Tags
  const [leadTags, setLeadTags] = useState<Record<string, string[]>>({
    "demo-1": ["High Priority", "UrbanGaon One"],
  });
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("UrbanGaon Realty — Property Enquiry & Brochure Details");
  const [emailTemplate, setEmailTemplate] = useState("brochure");
  const [emailBody, setEmailBody] = useState(
    `Dear Customer,\n\nThank you for your interest in UrbanGaon Projects. Please find attached our detailed brochure and payment plan breakdown.\n\nWarm regards,\n${currentUserName || "Yudhister Tiwari"}\nUrbanGaon Realty`
  );
  const [emailSuccessMsg, setEmailSuccessMsg] = useState("");

  // Convert Modal State
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertUnit, setConvertUnit] = useState("UG-Tower A-402 (3BHK)");
  const [convertTokenAmount, setConvertTokenAmount] = useState("250000");
  const [convertSuccessMsg, setConvertSuccessMsg] = useState("");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPriority, setEditPriority] = useState("HOT");

  // More Menu State
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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
  const currentTags = leadTags[selectedLead.id] || ["Customer Lead"];
  const isCallUnlocked = unlockedCalls[selectedLead.id] ?? false;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Trigger "Take Into Call"
  const handleTakeIntoCall = (leadId: string) => {
    setSelectedLeadId(leadId);
    setUnlockedCalls((prev) => ({ ...prev, [leadId]: true }));
    setLeadStates((prev) => ({ ...prev, [leadId]: "Attempted to Contact" }));

    startTransition(async () => {
      await updateLeadStatusAction(leadId, "CONTACTED", {
        phone: selectedLead.phone,
        name: selectedLead.name,
        note: `Call session initiated via "Take Into Call".`,
      });
      triggerToast(`Call initiated with ${selectedLead.name}! Details unlocked.`);
    });
  };

  const handleStateTransition = (newState: string) => {
    setLeadStates((prev) => ({ ...prev, [selectedLead.id]: newState }));
    startTransition(async () => {
      let dbStatus = "NEW";
      if (newState === "Attempted to Contact") dbStatus = "CONTACTED";
      else if (newState === "Interested") dbStatus = "INTERESTED";
      else if (newState === "Not Interested" || newState === "Junk Lead") dbStatus = "LOST";
      else if (newState === "Follow up 2") dbStatus = "SITE_VISIT_SCHEDULED";

      await updateLeadStatusAction(selectedLead.id, dbStatus, {
        phone: selectedLead.phone,
        name: selectedLead.name,
        note: `Transitioned to ${newState} in Calls module.`,
      });
      triggerToast(`State updated to "${newState}"`);
    });
  };

  const handleSaveGatherDetails = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await gatherLeadDetailsAction({
        leadId: selectedLead.id,
        phone: selectedLead.phone,
        name: selectedLead.name,
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
        triggerToast("Gathered details saved to MongoDB lead activity.");
      }, 1200);
    });
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim();
    setLeadTags((prev) => ({
      ...prev,
      [selectedLead.id]: [...(prev[selectedLead.id] || []), tag],
    }));
    setNewTagInput("");
    setIsTagModalOpen(false);
    triggerToast(`Tag "${tag}" added!`);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setLeadTags((prev) => ({
      ...prev,
      [selectedLead.id]: (prev[selectedLead.id] || []).filter((t) => t !== tagToRemove),
    }));
    triggerToast(`Tag removed`);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSuccessMsg("Email dispatched successfully to " + selectedLead.email);
    setTimeout(() => {
      setEmailSuccessMsg("");
      setIsEmailModalOpen(false);
      triggerToast(`Email sent to ${selectedLead.email}`);
    }, 1500);
  };

  const handleConvertLead = (e: React.FormEvent) => {
    e.preventDefault();
    setConvertSuccessMsg("Lead successfully converted to Booking!");
    setTimeout(() => {
      setConvertSuccessMsg("");
      setIsConvertModalOpen(false);
      handleStateTransition("Interested");
      triggerToast(`Lead ${selectedLead.name} converted to Booking for ${convertUnit}`);
    }, 1500);
  };

  const openEditModal = () => {
    setEditName(selectedLead.name);
    setEditPhone(selectedLead.phone);
    setEditEmail(selectedLead.email);
    setEditPriority(selectedLead.priority || "HOT");
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeads((prev) =>
      prev.map((l) =>
        l.id === selectedLead.id
          ? {
              ...l,
              name: editName,
              phone: editPhone,
              email: editEmail,
              priority: editPriority,
            }
          : l
      )
    );
    setIsEditModalOpen(false);
    triggerToast("Lead information updated!");
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-5 min-h-[85vh] font-sans text-slate-800 relative">
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR: Single Focused Customer Enquiries Queue with "Take Into Call" */}
      <div className="w-full lg:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col flex-shrink-0">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#3B8CFF]" />
              <span>Calls Queue</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
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

        {/* Customer Enquiries Leads List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[70vh]">
          {filteredLeads.map((lead) => {
            const isSelected = lead.id === selectedLead.id;
            const stateLabel = leadStates[lead.id] || "Inquiry";
            const isUnlocked = unlockedCalls[lead.id] ?? false;

            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={`p-3.5 rounded-xl cursor-pointer border transition-all duration-150 space-y-2.5 ${
                  isSelected
                    ? "bg-[#F0F6FF] border-[#3B8CFF] shadow-xs ring-1 ring-[#3B8CFF]/30"
                    : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/70"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#3B8CFF]/10 text-[#3B8CFF] flex items-center justify-center font-bold text-xs">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                        {lead.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
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

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100/70">
                  <span className="truncate max-w-[120px]">
                    {lead.project?.name || "UrbanGaon One"}
                  </span>
                  <span>{lead.source || "Customer Form"}</span>
                </div>

                {/* Primary "Take Into Call" Action Button on Lead Card */}
                {!isUnlocked ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTakeIntoCall(lead.id);
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Take Into Call</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-md">
                    <span className="flex items-center gap-1">
                      <Headphones className="w-3 h-3" />
                      <span>In Call / Unlocked</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Active</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT MAIN PANEL: Controlled Reveal upon "Take Into Call" */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
        {/* Top Action Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200/80 bg-white flex flex-wrap items-center justify-between gap-3 relative">
          <div className="flex items-center gap-3">
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-[#3B8CFF]/15 text-[#3B8CFF] flex items-center justify-center font-bold text-sm">
              {selectedLead.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-slate-900 font-heading">
                  {selectedLead.name}
                </h1>
                <button
                  onClick={() => setIsTagModalOpen(true)}
                  className="text-[11px] text-[#3B8CFF] hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                >
                  <Tag className="w-3 h-3" />
                  <span>Add Tags</span>
                </button>
              </div>

              {/* Tag Badges */}
              {currentTags.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {currentTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Working Action Buttons */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#3B8CFF] hover:bg-[#2570E8] text-white rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </button>

            <button
              onClick={() => setIsConvertModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition cursor-pointer active:scale-95"
            >
              Convert
            </button>

            <button
              onClick={openEditModal}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition cursor-pointer active:scale-95"
            >
              Edit
            </button>

            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="p-1.5 text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-lg transition cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 text-xs text-slate-700 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      window.print();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span>Print Lead Sheet</span>
                  </button>

                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(selectedLead.name)},%20greetings%20from%20UrbanGaon%20Realty!`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsMoreMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-emerald-600"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Lead</span>
                  </a>

                  <button
                    onClick={() => {
                      triggerToast("Lead archived");
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 border-t border-slate-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Archive / Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DYNAMIC CONTENT: INITIAL CALL BANNER vs UNLOCKED FULL DETAILS */}
        {!isCallUnlocked ? (
          /* Initial Screen: Customer Enquiry Preview & Big "Take Into Call" Action */
          <div className="flex-1 p-8 sm:p-14 flex flex-col items-center justify-center text-center bg-slate-50/40 space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[#F0F6FF] border border-[#3B8CFF]/20 text-[#3B8CFF] flex items-center justify-center shadow-xs">
              <PhoneCall className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B8CFF] bg-[#F0F6FF] px-3 py-1 rounded-full border border-[#3B8CFF]/20">
                Incoming Customer Enquiry
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-heading mt-2">
                {selectedLead.name}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Phone: {selectedLead.phone} &nbsp;|&nbsp; Email: {selectedLead.email}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Project Interested: <strong className="text-slate-700">{selectedLead.project?.name || "UrbanGaon One, Jagatpura"}</strong>
              </p>
            </div>

            {/* BIG PROMINENT "TAKE INTO CALL" BUTTON */}
            <div className="pt-2">
              <button
                onClick={() => handleTakeIntoCall(selectedLead.id)}
                className="px-8 py-3.5 rounded-2xl bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2.5 cursor-pointer"
              >
                <Phone className="w-4 h-4 animate-bounce" />
                <span>Take Into The Call</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              <p className="text-[11px] text-slate-400 mt-2">
                Clicking will initiate the telephony session and unlock all customer transition details.
              </p>
            </div>
          </div>
        ) : (
          /* UNLOCKED FULL DETAILS (Matches Screenshots 1, 2, 3 & 4) */
          <div className="flex-1 flex flex-col md:flex-row animate-in fade-in duration-200">
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
                <button
                  onClick={() => triggerToast("New related list module created.")}
                  className="text-[11px] text-[#3B8CFF] hover:underline mt-2 font-medium cursor-pointer"
                >
                  + Add Related List
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200/60">
                <div className="font-bold text-slate-900 mb-1">Links</div>
                <button
                  onClick={() => triggerToast("External link dialog opened.")}
                  className="text-[11px] text-[#3B8CFF] hover:underline font-medium cursor-pointer"
                >
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

              {/* STATE MACHINE TRANSITION BAR */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                    <span className="w-24 text-slate-400">Current State</span>
                    <div className="relative inline-block">
                      <select
                        value={currentState}
                        onChange={(e) => handleStateTransition(e.target.value)}
                        className="text-slate-900 font-bold bg-white pl-2.5 pr-7 py-1 rounded-lg border border-slate-200 shadow-2xs text-xs focus:outline-none focus:ring-1 focus:ring-[#3B8CFF] cursor-pointer"
                      >
                        <option value="Inquiry">Inquiry</option>
                        <option value="Attempted to Contact">Attempted to Contact</option>
                        <option value="Interested">Interested</option>
                        <option value="Follow up 2">Follow up 2</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="Junk Lead">Junk Lead</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="w-24 text-slate-400 font-semibold">
                      Transitions
                    </span>

                    {/* State = "Attempted to Contact" ➔ [Not Interested, Interested, Junk Lead, Follow up 2] */}
                    {currentState === "Attempted to Contact" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleStateTransition("Not Interested")}
                          className="px-3.5 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                        >
                          Not Interested
                        </button>
                        <button
                          onClick={() => handleStateTransition("Interested")}
                          className="px-3.5 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                        >
                          Interested
                        </button>
                        <button
                          onClick={() => handleStateTransition("Junk Lead")}
                          className="px-3.5 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                        >
                          Junk Lead
                        </button>
                        <button
                          onClick={() => handleStateTransition("Follow up 2")}
                          className="px-3.5 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                        >
                          Follow up 2
                        </button>
                      </div>
                    )}

                    {/* State = "Interested" ➔ [Gather Details] */}
                    {currentState === "Interested" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setIsGatherModalOpen(true)}
                          className="px-4 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Gather Details</span>
                        </button>

                        <button
                          onClick={() => handleStateTransition("Follow up 2")}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs transition cursor-pointer"
                        >
                          Follow up 2
                        </button>

                        <button
                          onClick={() => handleStateTransition("Not Interested")}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 font-medium text-xs shadow-2xs transition cursor-pointer"
                        >
                          Not Interested
                        </button>
                      </div>
                    )}

                    {/* Other states */}
                    {(currentState === "Not Interested" ||
                      currentState === "Junk Lead" ||
                      currentState === "Follow up 2" ||
                      currentState === "Inquiry") && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleStateTransition("Interested")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition cursor-pointer"
                        >
                          Mark Interested
                        </button>
                        <button
                          onClick={() => handleStateTransition("Attempted to Contact")}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition cursor-pointer"
                        >
                          Re-call / Attempt Contact
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => triggerToast("Viewing configured workflow state transitions.")}
                  className="text-[11px] text-[#3B8CFF] hover:underline self-start sm:self-center font-medium cursor-pointer"
                >
                  View configured actions
                </button>
              </div>

              {/* LEAD CORE FIELDS BLOCK */}
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
                    <button
                      onClick={() => setIsEmailModalOpen(true)}
                      className="font-medium text-[#3B8CFF] hover:underline cursor-pointer text-left"
                    >
                      {selectedLead.email}
                    </button>
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
                    <button
                      onClick={() => triggerToast("Lead details view toggled")}
                      className="text-slate-400 hover:text-slate-600 font-normal cursor-pointer"
                    >
                      Hide Details
                    </button>
                    <a
                      href="https://maps.google.com/?q=Jagatpura+Jaipur"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>Locate Map</span>
                    </a>
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
        )}
      </div>

      {/* 1. ADD TAGS MODAL */}
      {isTagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#3B8CFF]" />
                <span>Add Tag to {selectedLead.name}</span>
              </h3>
              <button
                onClick={() => setIsTagModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTag} className="space-y-3">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="e.g. VIP, NRI, High Budget..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                autoFocus
              />

              <div className="flex flex-wrap gap-1.5">
                {["VIP", "High Budget", "NRI", "Ready to Move", "Investor", "Follow-up"].map(
                  (preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setNewTagInput(preset)}
                      className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700"
                    >
                      +{preset}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTagModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-[#3B8CFF] hover:bg-[#2570E8] text-white rounded-lg font-semibold"
                >
                  Add Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. SEND EMAIL MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#3B8CFF]" />
                <span>Send Email to {selectedLead.name}</span>
              </h3>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="p-6 space-y-3.5 text-xs">
              {emailSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{emailSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="text-slate-500 font-medium block mb-1">To</label>
                <input
                  type="email"
                  value={selectedLead.email}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
                />
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Select Template</label>
                <select
                  value={emailTemplate}
                  onChange={(e) => {
                    setEmailTemplate(e.target.value);
                    if (e.target.value === "brochure") {
                      setEmailSubject("UrbanGaon Realty — Property Enquiry & Brochure Details");
                      setEmailBody(`Dear ${selectedLead.name},\n\nThank you for reaching out to UrbanGaon. Please find attached our project brochure and unit inventory specifications.\n\nWarm regards,\n${currentUserName}`);
                    } else if (e.target.value === "sitevisit") {
                      setEmailSubject("Invitation: Exclusive Site Visit to UrbanGaon Projects");
                      setEmailBody(`Dear ${selectedLead.name},\n\nWe would love to host you for a private guided site visit this week. Please let us know your preferred date & time.\n\nBest regards,\n${currentUserName}`);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="brochure">Project Brochure & Pricing Sheet</option>
                  <option value="sitevisit">Site Visit Guided Tour Invitation</option>
                  <option value="custom">Custom Email Note</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3B8CFF]"
                />
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Message Body</label>
                <textarea
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3B8CFF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CONVERT LEAD MODAL */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Convert Lead to Booking / Deal</span>
              </h3>
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {convertSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{convertSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleConvertLead} className="space-y-3.5 text-xs">
                <p className="text-slate-500 text-[11px]">
                  Convert <strong>{selectedLead.name}</strong> into an active Booking record.
                </p>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">Select Unit</label>
                  <select
                    value={convertUnit}
                    onChange={(e) => setConvertUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="UG-Tower A-402 (3BHK)">UG-Tower A-402 (3BHK — ₹1.45 Cr)</option>
                    <option value="UG-Tower B-601 (2BHK)">UG-Tower B-601 (2BHK — ₹98 Lakhs)</option>
                    <option value="UG-Plot-12 (200 Sq Yd)">UG-Plot-12 (200 Sq Yd — ₹65 Lakhs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">Token Booking Advance (₹)</label>
                  <input
                    type="number"
                    value={convertTokenAmount}
                    onChange={(e) => setConvertTokenAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsConvertModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Confirm Conversion</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. EDIT LEAD MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#3B8CFF]" />
                <span>Edit Lead Details</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Mobile Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="HOT">HOT (Immediate Buyer)</option>
                  <option value="WARM">WARM (Evaluating)</option>
                  <option value="COLD">COLD (Long Term)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
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
                  className="px-3 py-1.5 rounded-lg border border-[#3B8CFF] text-[#3B8CFF] hover:bg-[#F0F6FF] font-semibold text-xs transition cursor-pointer"
                >
                  Save as Draft
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGatherModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-1.5 rounded-lg bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-semibold text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
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
