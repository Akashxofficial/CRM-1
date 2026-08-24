"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  User,
  Building,
  AtSign,
  Settings2,
  Calendar,
  Clock,
  Upload,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  X,
  Search,
  IndianRupee,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { createSnagRecord, SnagRecord } from "@/actions/snag-actions";

interface Props {
  deals?: any[];
  users?: any[];
  initialValues?: Partial<SnagRecord>;
  isEditMode?: boolean;
}

const CATEGORY_SUB_CATEGORIES: Record<string, string[]> = {
  "Civil Work": [
    "Wall Plaster & Cracks",
    "Brickwork / Masonry Defect",
    "Slab / Beam Irregularity",
    "Skirting & Grouting Gap",
    "Expansion Joint Gap",
  ],
  "Plumbing & Sanitary": [
    "Under-Counter Leakage",
    "Faucet / Mixer Defect",
    "Drainage Clog / Low Slope",
    "Sanitary Fixture Loose",
    "Geyser Inlet Pressure Drop",
    "Waterproofing & Seepage",
  ],
  "Electrical & Fixtures": [
    "Switchboard & Wiring",
    "MCB / Dimmer Tripping",
    "Earthing / Current Leak",
    "Light Point Missing / Broken",
    "Intercom / Bell Point Fault",
  ],
  "Painting & Polish": [
    "Ceiling Paint",
    "Wall Paint Flaking",
    "Color Shade Variation",
    "Primer Unevenness",
    "Wood Polish Roughness",
  ],
  "Carpentry & Doors": [
    "Door Shutter Alignment",
    "Lock / Handle Jam",
    "Window Glass Slider Noise",
    "Wardrobe Hinge Loose",
    "Cabinet Beading Gap",
  ],
  "Flooring & Tiling": [
    "Hollow Sound Under Tiles",
    "Chipped / Scratched Tile",
    "Grouting Discoloration",
    "Tile Level Variation",
  ],
  "Waterproofing": [
    "Balcony Edge Seepage",
    "Toilet Floor Wet Patch",
    "External Wall Dampness",
    "Terrace Joint Leak",
  ],
  "External / Balcony": [
    "Railing Alignment / Rust",
    "Safety Grill Loose",
    "Rainwater Spout Blocked",
    "Glass Balustrade Chip",
  ],
  "HVAC / Ventilation": [
    "AC Copper Piping Choke",
    "Exhaust Duct Obstruction",
    "Drain Pipe Slant Issue",
  ],
  "Hardware & Fittings": [
    "Tower Bolt Stuck",
    "Magnetic Door Stopper Broken",
    "Handle Finish Tarnished",
  ],
};

export function CreateSnagView({ deals = [], users = [], initialValues, isEditMode = false }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State (Cleaned of duplicates)
  const [formData, setFormData] = useState({
    // Basic Information
    dealName: initialValues?.dealName || "",
    inspectionType: initialValues?.inspectionType || "-None-",
    unitNumber: initialValues?.unitNumber || "",
    type: initialValues?.type || "-None-",
    snagOrigin: initialValues?.snagOrigin || "-None-",
    relatedTo: initialValues?.relatedTo || "",
    phone: initialValues?.phone || "",
    snagOwner: initialValues?.snagOwner || "Yudhister Tiwari",
    subject: initialValues?.subject || "",
    reportedBy: initialValues?.reportedBy || "Yudhister Tiwari",
    email: initialValues?.email || "",
    customer: initialValues?.customer || "",

    // Issue Details
    category: initialValues?.category || "None",
    subCategory: initialValues?.subCategory || "-None-",
    snagDescription: initialValues?.snagDescription || "",
    locationInUnit: initialValues?.locationInUnit || "None",
    priority: initialValues?.priority || "-None-",
    issue: initialValues?.issue || "-None-", // Blocker / Critical Defect?

    // Assignment & SLA Timeline
    raisedBy: initialValues?.raisedBy || "Yudhister Tiwari",
    assignTo: initialValues?.assignTo || "Yudhister Tiwari",
    raisedOnDate: initialValues?.raisedOn ? initialValues.raisedOn.split("T")[0] : new Date().toISOString().slice(0, 10),
    raisedOnTime: initialValues?.raisedOn && initialValues.raisedOn.includes("T") ? initialValues.raisedOn.split("T")[1]?.slice(0, 5) : "10:00",
    targetClosureDate: initialValues?.targetClosureDate || "",
    slaTimeline: initialValues?.slaTimeline || "7 Days",

    // Executive Value Additions
    estimatedCost: initialValues?.estimatedCost || 0,
    notifyCustomer: initialValues?.notifyCustomer ?? true,

    // Resolution
    status: initialValues?.status || ("Logged" as const),
    rootCause: initialValues?.rootCause || "",
    reopenCount: initialValues?.reopenCount || 0,
    closureRemarks: initialValues?.closureRemarks || "",
    closureProof: initialValues?.closureProof || "",
  });

  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [closureFileName, setClosureFileName] = useState(initialValues?.closureProof || "");

  // Auto-fill when Deal is selected
  const handleSelectDeal = (deal: any) => {
    setFormData((prev) => ({
      ...prev,
      dealName: `${deal.lead?.name || "Customer"} - ${deal.unit?.unitNumber || "Unit"} (${deal.project?.name || "Project"})`,
      unitNumber: deal.unit?.unitNumber || prev.unitNumber,
      customer: deal.lead?.name || prev.customer,
      phone: deal.lead?.phone || prev.phone,
      email: deal.lead?.email || prev.email,
    }));
    setDealModalOpen(false);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "category") {
        next.subCategory = "-None-";
      }
      return next;
    });
  };

  // Helper to set SLA timeline and auto-calculate target date
  const handleSetSLA = (days: number, label: string) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    setFormData((prev) => ({
      ...prev,
      slaTimeline: label,
      targetClosureDate: target.toISOString().slice(0, 10),
    }));
  };

  const handleSubmit = (saveAndNew: boolean = false) => {
    // Validate mandatory fields: Subject and Snag Module Origin
    if (!formData.subject.trim()) {
      alert("Subject is mandatory. Please enter a subject for the snag.");
      return;
    }
    if (!formData.snagOrigin || formData.snagOrigin === "-None-") {
      alert("Snag Module Origin is mandatory. Please select an origin.");
      return;
    }

    startTransition(async () => {
      const raisedOnCombined = formData.raisedOnDate
        ? `${formData.raisedOnDate}T${formData.raisedOnTime || "10:00"}`
        : new Date().toISOString();

      const payload = {
        dealName: formData.dealName,
        inspectionType: formData.inspectionType,
        unitNumber: formData.unitNumber,
        type: formData.type,
        snagOrigin: formData.snagOrigin,
        relatedTo: formData.relatedTo,
        phone: formData.phone,
        snagOwner: formData.snagOwner,
        subject: formData.subject,
        reportedBy: formData.reportedBy,
        email: formData.email,
        customer: formData.customer,
        category: formData.category,
        subCategory: formData.subCategory,
        snagDescription: formData.snagDescription,
        locationInUnit: formData.locationInUnit,
        priority: formData.priority,
        issue: formData.issue,
        raisedBy: formData.raisedBy,
        assignTo: formData.assignTo,
        raisedOn: raisedOnCombined,
        targetClosureDate: formData.targetClosureDate,
        slaTimeline: formData.slaTimeline,
        estimatedCost: Number(formData.estimatedCost) || 0,
        notifyCustomer: Boolean(formData.notifyCustomer),
        status: formData.status as any,
        rootCause: formData.rootCause,
        reopenCount: Number(formData.reopenCount) || 0,
        closureRemarks: formData.closureRemarks,
        closureProof: closureFileName,
      };

      const result = await createSnagRecord(payload);
      if (result.success) {
        if (saveAndNew) {
          setToastMessage("Snag created successfully! Ready for next record.");
          setFormData({
            dealName: "",
            inspectionType: "-None-",
            unitNumber: "",
            type: "-None-",
            snagOrigin: "-None-",
            relatedTo: "",
            phone: "",
            snagOwner: "Yudhister Tiwari",
            subject: "",
            reportedBy: "Yudhister Tiwari",
            email: "",
            customer: "",
            category: "None",
            subCategory: "-None-",
            snagDescription: "",
            locationInUnit: "None",
            priority: "-None-",
            issue: "-None-",
            raisedBy: "Yudhister Tiwari",
            assignTo: "Yudhister Tiwari",
            raisedOnDate: new Date().toISOString().slice(0, 10),
            raisedOnTime: "10:00",
            targetClosureDate: "",
            slaTimeline: "7 Days",
            estimatedCost: 0,
            notifyCustomer: true,
            status: "Logged",
            rootCause: "",
            reopenCount: 0,
            closureRemarks: "",
            closureProof: "",
          });
          setClosureFileName("");
          setTimeout(() => setToastMessage(null), 3000);
        } else {
          router.push("/snags");
        }
      } else {
        alert(result.error || "Failed to save snag record");
      }
    });
  };

  const subCategoryOptions =
    formData.category && CATEGORY_SUB_CATEGORIES[formData.category]
      ? CATEGORY_SUB_CATEGORIES[formData.category]
      : [];

  return (
    <div className="space-y-6 font-sans text-slate-800 antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card / Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Title & Breadcrumbs */}
        <div>
          <div className="text-[12px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer flex items-center gap-1">
            <span onClick={() => router.push("/snags")}>Snag Module</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? "Edit Snag Module" : "Create Snag Module"}
            </h1>
            <button
              type="button"
              onClick={() => alert("Form layout customized and synchronized with UrbanGaon theme.")}
              className="text-xs font-semibold text-[#1F69FF] hover:underline cursor-pointer"
            >
              Edit Page Layout
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/snags")}
            disabled={isPending}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition shadow-2xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isPending}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition shadow-2xs cursor-pointer"
          >
            Save and New
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isPending}
            className="px-5 py-2 text-xs font-bold text-white bg-[#1F69FF] hover:bg-[#1557DC] rounded-lg transition shadow-sm cursor-pointer"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="bg-white rounded-xl shadow-2xs border border-slate-200/90 p-6 sm:p-8 space-y-10">
        {/* ========================================================
            SECTION 1: BASIC INFORMATION
        ======================================================== */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>Basic Information</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 text-xs">
            {/* Left Column */}
            <div className="space-y-3.5">
              {/* Deal Name (Deduplicated with auto unit binding) */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Deal / Booking</label>
                <div className="col-span-2 relative flex items-center">
                  <input
                    type="text"
                    value={formData.dealName}
                    onChange={(e) => handleFieldChange("dealName", e.target.value)}
                    placeholder="Select or enter Deal / Project"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setDealModalOpen(true)}
                    title="Browse Deals / Bookings"
                    className="absolute right-1.5 p-1 text-slate-400 hover:text-[#1F69FF] rounded transition cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inspection Type (Indigo for Pre Handover, Teal for Post Handover - Perfectly synced with UrbanGaon CRM) */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Inspection Type</label>
                <div className="col-span-2 relative flex items-center">
                  {/* Sync Brand Indicator Dot */}
                  <div className="absolute left-2.5 z-10 pointer-events-none">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        formData.inspectionType === "Pre Handover"
                          ? "bg-indigo-600 shadow-xs ring-2 ring-indigo-200"
                          : formData.inspectionType === "Post Handover"
                          ? "bg-teal-600 shadow-xs ring-2 ring-teal-200"
                          : "bg-slate-300"
                      }`}
                    />
                  </div>
                  <select
                    value={formData.inspectionType}
                    onChange={(e) => handleFieldChange("inspectionType", e.target.value)}
                    className={`w-full bg-white border rounded pl-7 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 transition ${
                      formData.inspectionType === "Pre Handover"
                        ? "text-indigo-800 border-indigo-300 bg-indigo-50/40 focus:border-indigo-500 focus:ring-indigo-500/20"
                        : formData.inspectionType === "Post Handover"
                        ? "text-teal-800 border-teal-300 bg-teal-50/40 focus:border-teal-500 focus:ring-teal-500/20"
                        : "text-slate-800 border-slate-300 focus:border-[#1F69FF] focus:ring-[#1F69FF]/30"
                    }`}
                  >
                    <option value="-None-" className="text-slate-800 font-normal">-None-</option>
                    <option value="Pre Handover" className="text-indigo-700 font-semibold bg-indigo-50">Pre Handover</option>
                    <option value="Post Handover" className="text-teal-700 font-semibold bg-teal-50">Post Handover</option>
                  </select>
                </div>
              </div>

              {/* Unit Number */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Unit Number</label>
                <div className="col-span-2 relative flex items-center">
                  <input
                    type="text"
                    value={formData.unitNumber}
                    onChange={(e) => handleFieldChange("unitNumber", e.target.value)}
                    placeholder="e.g. M-201, T1-402"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30 pr-8"
                  />
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Type */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Type</label>
                <div className="col-span-2">
                  <select
                    value={formData.type}
                    onChange={(e) => handleFieldChange("type", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  >
                    <option value="-None-">-None-</option>
                    <option value="Problem">Problem</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Questions">Questions</option>
                  </select>
                </div>
              </div>

              {/* Snag Module Origin (MANDATORY with RED Indicator) */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-700 font-semibold text-right pr-2">
                  Snag Module Origin
                </label>
                <div className="col-span-2 relative flex items-center">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l pointer-events-none" />
                  <select
                    value={formData.snagOrigin}
                    onChange={(e) => handleFieldChange("snagOrigin", e.target.value)}
                    className="w-full bg-white border border-slate-300 pl-3 pr-3 py-1.5 text-xs text-slate-800 rounded focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30 border-l-red-500"
                  >
                    <option value="-None-">-None-</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="Web">Web</option>
                  </select>
                </div>
              </div>

              {/* Related To */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Related To</label>
                <div className="col-span-2 relative flex items-center">
                  <input
                    type="text"
                    value={formData.relatedTo}
                    onChange={(e) => handleFieldChange("relatedTo", e.target.value)}
                    placeholder="Related handover or audit"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30 pr-8"
                  />
                  <Settings2 className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Phone */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Phone</label>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3.5">
              {/* Snag Module Owner */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Snag Module Owner</label>
                <div className="col-span-2 relative flex items-center">
                  <select
                    value={formData.snagOwner}
                    onChange={(e) => handleFieldChange("snagOwner", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30 pr-8"
                  >
                    <option value="Yudhister Tiwari">Yudhister Tiwari</option>
                  </select>
                  <User className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Subject (MANDATORY with RED Indicator) */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-700 font-semibold text-right pr-2">Subject</label>
                <div className="col-span-2 relative flex items-center">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l pointer-events-none" />
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleFieldChange("subject", e.target.value)}
                    placeholder="e.g. Master Bedroom Wall Hairline Cracks"
                    className="w-full bg-white border border-slate-300 pl-3 pr-3 py-1.5 text-xs text-slate-800 rounded focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30 border-l-red-500"
                  />
                </div>
              </div>

              {/* Reported By */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Reported By</label>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={formData.reportedBy}
                    onChange={(e) => handleFieldChange("reportedBy", e.target.value)}
                    placeholder="e.g. Yudhister Tiwari"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Email</label>
                <div className="col-span-2">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  />
                </div>
              </div>

              {/* Customer */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Customer</label>
                <div className="col-span-2 relative flex items-center">
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => handleFieldChange("customer", e.target.value)}
                    placeholder="Customer name"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30 pr-8"
                  />
                  <AtSign className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 2: ISSUE DETAILS
        ======================================================== */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Issue Details</span>
            <span className="text-[11px] font-normal text-slate-400">Defect classification & severity</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 text-xs">
            {/* Left Column */}
            <div className="space-y-3.5">
              {/* Category */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Category</label>
                <div className="col-span-2">
                  <select
                    value={formData.category}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  >
                    <option value="None">None</option>
                    <option value="Civil Work">Civil Work</option>
                    <option value="Plumbing & Sanitary">Plumbing & Sanitary</option>
                    <option value="Electrical & Fixtures">Electrical & Fixtures</option>
                    <option value="Painting & Polish">Painting & Polish</option>
                    <option value="Carpentry & Doors">Carpentry & Doors</option>
                    <option value="Flooring & Tiling">Flooring & Tiling</option>
                    <option value="Waterproofing">Waterproofing</option>
                    <option value="External / Balcony">External / Balcony</option>
                    <option value="HVAC / Ventilation">HVAC / Ventilation</option>
                    <option value="Hardware & Fittings">Hardware & Fittings</option>
                  </select>
                </div>
              </div>

              {/* Sub Category */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Sub Category</label>
                <div className="col-span-2">
                  <select
                    value={formData.subCategory}
                    onChange={(e) => handleFieldChange("subCategory", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  >
                    <option value="-None-">-None-</option>
                    {subCategoryOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Snag Description */}
              <div className="grid grid-cols-3 items-start gap-3">
                <label className="text-slate-600 font-medium text-right pr-2 pt-1.5">Snag Description</label>
                <div className="col-span-2">
                  <textarea
                    rows={3}
                    value={formData.snagDescription}
                    onChange={(e) => handleFieldChange("snagDescription", e.target.value)}
                    placeholder="Detailed notes on the snag/defect observed on site..."
                    className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30 resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3.5">
              {/* Location in Unit */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Location in Unit</label>
                <div className="col-span-2">
                  <select
                    value={formData.locationInUnit}
                    onChange={(e) => handleFieldChange("locationInUnit", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  >
                    <option value="None">None</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Master Bedroom">Master Bedroom</option>
                    <option value="Bedroom 2">Bedroom 2</option>
                    <option value="Bedroom 3">Bedroom 3</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Balcony">Balcony</option>
                    <option value="Bathroom 1 (Master)">Bathroom 1 (Master)</option>
                    <option value="Bathroom 2 (Common)">Bathroom 2 (Common)</option>
                    <option value="Utility Area">Utility Area</option>
                    <option value="Entrance Foyer">Entrance Foyer</option>
                    <option value="Terrace">Terrace</option>
                    <option value="Passage / Lobby">Passage / Lobby</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Priority</label>
                <div className="col-span-2">
                  <select
                    value={formData.priority}
                    onChange={(e) => handleFieldChange("priority", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  >
                    <option value="-None-">-None-</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Blocker / Critical Defect? (Yes / No) */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Blocker / Critical?</label>
                <div className="col-span-2">
                  <select
                    value={formData.issue}
                    onChange={(e) => handleFieldChange("issue", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  >
                    <option value="-None-">-None-</option>
                    <option value="Yes">Yes (Blocks Handover)</option>
                    <option value="No">No (Minor / Rectifiable)</option>
                  </select>
                </div>
              </div>

              {/* Executive Addition: Estimated Repair Cost (₹) */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2 flex items-center justify-end gap-1">
                  <span>Est. Repair Cost</span>
                </label>
                <div className="col-span-2 relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-xs font-semibold">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={formData.estimatedCost || ""}
                    onChange={(e) => handleFieldChange("estimatedCost", parseFloat(e.target.value) || 0)}
                    placeholder="0 (Back-charge tracking)"
                    className="w-full bg-white border border-slate-300 rounded pl-7 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 3: ASSIGNMENT & SLA TIMELINE
        ======================================================== */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Assignment & SLA Timeline</span>
            <span className="text-[11px] font-normal text-slate-400">Ownership & resolution deadlines</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 text-xs">
            {/* Left Column */}
            <div className="space-y-3.5">
              {/* Raised By */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Raised By</label>
                <div className="col-span-2 relative flex items-center">
                  <select
                    value={formData.raisedBy}
                    onChange={(e) => handleFieldChange("raisedBy", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30 pr-8"
                  >
                    <option value="Yudhister Tiwari">Yudhister Tiwari</option>
                  </select>
                  <User className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Assign To */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Assign To</label>
                <div className="col-span-2 relative flex items-center">
                  <select
                    value={formData.assignTo}
                    onChange={(e) => handleFieldChange("assignTo", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30 pr-8"
                  >
                    <option value="Yudhister Tiwari">Yudhister Tiwari</option>
                  </select>
                  <User className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3.5">
              {/* Raised On (Date + Time) */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Raised On</label>
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={formData.raisedOnDate}
                    onChange={(e) => handleFieldChange("raisedOnDate", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  />
                  <select
                    value={formData.raisedOnTime}
                    onChange={(e) => handleFieldChange("raisedOnTime", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="09:30">09:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="01:00">01:00 PM</option>
                    <option value="02:00">02:00 PM</option>
                    <option value="03:00">03:00 PM</option>
                    <option value="04:00">04:00 PM</option>
                    <option value="05:00">05:00 PM</option>
                    <option value="06:00">06:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Target Closure Date with Smart SLA Timeline Helpers */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Target Date (SLA)</label>
                <div className="col-span-2 space-y-1.5">
                  <input
                    type="date"
                    value={formData.targetClosureDate}
                    onChange={(e) => handleFieldChange("targetClosureDate", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  />
                  {/* Smart SLA presets */}
                  <div className="flex items-center gap-1.5 pt-0.5 text-[10px]">
                    <span className="text-slate-400 font-medium">Quick SLA:</span>
                    <button
                      type="button"
                      onClick={() => handleSetSLA(1, "24 Hours")}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                    >
                      ⚡ 24h
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetSLA(3, "3 Days")}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                    >
                      ⏱️ 3d
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetSLA(7, "7 Days")}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                    >
                      📅 7d
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetSLA(15, "15 Days")}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                    >
                      🗓️ 15d
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 4: RESOLUTION & CLIENT NOTIFICATIONS
        ======================================================== */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Resolution & Proof</span>
            <span className="text-[11px] font-normal text-slate-400">Quality sign-off & remediation remarks</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 text-xs">
            {/* Left Column */}
            <div className="space-y-3.5">
              {/* Status (with Red/Orange/Green dot indicator) */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Status</label>
                <div className="col-span-2 relative flex items-center">
                  <div className="absolute left-2.5 z-10">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        formData.status === "Logged"
                          ? "bg-red-500 shadow-xs"
                          : formData.status === "Open"
                          ? "bg-blue-500"
                          : formData.status === "In Progress"
                          ? "bg-amber-500"
                          : formData.status === "Resolved"
                          ? "bg-emerald-500"
                          : formData.status === "Verified"
                          ? "bg-purple-500"
                          : "bg-slate-400"
                      }`}
                    />
                  </div>
                  <select
                    value={formData.status}
                    onChange={(e) => handleFieldChange("status", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded pl-7 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  >
                    <option value="Logged">Logged</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Verified">Verified</option>
                    <option value="Closed">Closed</option>
                    <option value="Reopened">Reopened</option>
                  </select>
                </div>
              </div>

              {/* Root Cause */}
              <div className="grid grid-cols-3 items-start gap-3">
                <label className="text-slate-600 font-medium text-right pr-2 pt-1.5">Root Cause</label>
                <div className="col-span-2">
                  <textarea
                    rows={2}
                    value={formData.rootCause}
                    onChange={(e) => handleFieldChange("rootCause", e.target.value)}
                    placeholder="Root cause of the defect..."
                    className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30 resize-y"
                  />
                </div>
              </div>

              {/* Reopen Count */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Reopen Count</label>
                <div className="col-span-2">
                  <input
                    type="number"
                    min={0}
                    value={formData.reopenCount}
                    onChange={(e) => handleFieldChange("reopenCount", parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3.5">
              {/* Closure Remarks */}
              <div className="grid grid-cols-3 items-start gap-3">
                <label className="text-slate-600 font-medium text-right pr-2 pt-1.5">Closure Remarks</label>
                <div className="col-span-2">
                  <textarea
                    rows={2}
                    value={formData.closureRemarks}
                    onChange={(e) => handleFieldChange("closureRemarks", e.target.value)}
                    placeholder="Action taken or comments on closure..."
                    className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#1F69FF] focus:ring-1 focus:ring-[#1F69FF]/30 resize-y"
                  />
                </div>
              </div>

              {/* Closure Proof (Choose File with clear preview) */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-slate-600 font-medium text-right pr-2">Closure Proof</label>
                <div className="col-span-2">
                  <label className="flex items-center justify-between border border-slate-300 rounded px-3 py-1.5 bg-white hover:bg-slate-50 cursor-pointer text-xs text-slate-700 transition">
                    <span className="truncate max-w-[180px] text-slate-500">
                      {closureFileName || "Choose site photo / document"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setClosureFileName(file.name);
                        }
                      }}
                    />
                  </label>
                  {closureFileName && (
                    <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      <span className="truncate">📎 Attached: {closureFileName}</span>
                      <button
                        type="button"
                        onClick={() => setClosureFileName("")}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Executive Addition: WhatsApp Notification Toggle */}
              <div className="grid grid-cols-3 items-center gap-3 pt-1">
                <label className="text-slate-600 font-medium text-right pr-2">WhatsApp Alert</label>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.notifyCustomer}
                      onChange={(e) => handleFieldChange("notifyCustomer", e.target.checked)}
                      className="w-4 h-4 text-[#1F69FF] rounded border-slate-300 focus:ring-[#1F69FF]"
                    />
                    <span className="text-[11px] text-slate-600 font-medium">
                      Notify customer on WhatsApp when snag is resolved 📱
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Toolbar & View Switcher */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">Create Form Views</span>
            <div className="relative">
              <select className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-semibold text-slate-800 appearance-none pr-7 focus:outline-none focus:border-[#1F69FF]">
                <option>Standard View</option>
                <option>Compact View</option>
                <option>Detailed QA View</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert("Custom form pages allow you to drag-and-drop custom fields.")}
            className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            Create a custom form page
          </button>
        </div>

        {/* Bottom Save / Cancel buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/snags")}
            disabled={isPending}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition shadow-2xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isPending}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition shadow-2xs cursor-pointer"
          >
            Save and New
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isPending}
            className="px-5 py-2 text-xs font-bold text-white bg-[#1F69FF] hover:bg-[#1557DC] rounded-lg transition shadow-sm cursor-pointer"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Deal Selection Modal */}
      {dealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#1F69FF]" />
                Select Deal / Booking
              </h3>
              <button
                type="button"
                onClick={() => setDealModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2 max-h-80 overflow-y-auto">
              {deals.length === 0 ? (
                <div className="space-y-2">
                  <div
                    onClick={() =>
                      handleSelectDeal({
                        lead: { name: "Dr. Arvind Swamy", phone: "+91 98450 33221", email: "arvind.swamy@example.com" },
                        unit: { unitNumber: "M-201", type: "4BHK Villa" },
                        project: { name: "Skyline Meadows" },
                      })
                    }
                    className="p-3 border border-slate-200 rounded-xl hover:border-[#1F69FF] hover:bg-blue-50/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">Dr. Arvind Swamy (M-201)</div>
                      <div className="text-[11px] text-slate-500">Skyline Meadows • 4BHK Villa • +91 98450 33221</div>
                    </div>
                    <span className="text-xs font-bold text-[#1F69FF]">Select</span>
                  </div>

                  <div
                    onClick={() =>
                      handleSelectDeal({
                        lead: { name: "Mr. Rajesh Kumar Sharma", phone: "+91 98765 43210", email: "rajesh.sharma@example.com" },
                        unit: { unitNumber: "T1-402", type: "3BHK Luxury" },
                        project: { name: "UrbanGaon Skyline" },
                      })
                    }
                    className="p-3 border border-slate-200 rounded-xl hover:border-[#1F69FF] hover:bg-blue-50/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">Mr. Rajesh Kumar Sharma (T1-402)</div>
                      <div className="text-[11px] text-slate-500">UrbanGaon Skyline • 3BHK Luxury • +91 98765 43210</div>
                    </div>
                    <span className="text-xs font-bold text-[#1F69FF]">Select</span>
                  </div>

                  <div
                    onClick={() =>
                      handleSelectDeal({
                        lead: { name: "Aakash Kumar Test", phone: "+91 99898 98989", email: "aakash.test@urbangaon.com" },
                        unit: { unitNumber: "B-304", type: "3BHK Premium" },
                        project: { name: "UrbanGaon Luxury Phase 1" },
                      })
                    }
                    className="p-3 border border-slate-200 rounded-xl hover:border-[#1F69FF] hover:bg-blue-50/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">Aakash Kumar Test (B-304)</div>
                      <div className="text-[11px] text-slate-500">UrbanGaon Luxury Phase 1 • 3BHK Premium • +91 99898 98989</div>
                    </div>
                    <span className="text-xs font-bold text-[#1F69FF]">Select</span>
                  </div>
                </div>
              ) : (
                deals.map((d: any) => (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDeal(d)}
                    className="p-3 border border-slate-200 rounded-xl hover:border-[#1F69FF] hover:bg-blue-50/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">
                        {d.lead?.name || "Customer"} ({d.unit?.unitNumber || "Unit"})
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {d.project?.name || "Project"} • {d.unit?.type || "Unit"} • {d.lead?.phone || ""}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#1F69FF]">Select</span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setDealModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
