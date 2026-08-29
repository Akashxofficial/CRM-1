"use client";

import { useState } from "react";
import {
  ChevronLeft,
  Edit2,
  Mail,
  Send,
  Plus,
  Wand2,
  Trash2,
  CheckCircle2,
  Circle,
  Upload,
  FileText,
  ChevronRight,
  IndianRupee,
  Check,
  Building,
  Phone,
  User,
  Share2,
  Download,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RecordPaymentModal } from "@/components/payments/RecordPaymentModal";
import { PrintableDemandLetter } from "@/components/payments/PrintableDemandLetter";
import { PrintableReceipt } from "@/components/payments/PrintableReceipt";

interface MilestoneItem {
  id: string;
  index: number;
  title: string;
  status: "Unpaid" | "Partial" | "Paid";
  note?: string;
  amount: number;
  paidAmount?: number;
  dueAmount?: number;
  dueDate?: string;
  raised: boolean;
  emailed?: boolean;
}

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  date?: string;
}

interface Props {
  customer?: any;
  onBack?: () => void;
  onCustomerUpdate?: (updated: any) => void;
}

export function CustomerProfileDetailView({
  customer: initialCustomer,
  onBack,
  onCustomerUpdate,
}: Props) {
  // Default/Fallback Customer matching screenshot exactly: Pratik Gowardhane
  const [customer, setCustomer] = useState({
    id: initialCustomer?.id || "cust-pratik",
    name: initialCustomer?.name || "Pratik Gowardhane",
    phone: initialCustomer?.phone || "7045901129",
    email: initialCustomer?.email || "pratik291190@gmail.com",
    project: initialCustomer?.project?.name || "Vastu CRM",
    unit: initialCustomer?.interestedUnit?.unitNumber || "Plot 7",
    category: initialCustomer?.interestedType || "Plot",
    agreedPrice: initialCustomer?.budgetMax || 5000000,
    billingEmail: initialCustomer?.email || "pratik291190@gmail.com",
  });

  // Edit Modals
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isCostSheetModalOpen, setIsCostSheetModalOpen] = useState(false);

  // Form states for edits
  const [editName, setEditName] = useState(customer.name);
  const [editPhone, setEditPhone] = useState(customer.phone);
  const [editEmail, setEditEmail] = useState(customer.email);
  const [editBillingEmail, setEditBillingEmail] = useState(customer.billingEmail);

  // Payment Plan Milestones (Exact data from screenshot)
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    {
      id: "m-1",
      index: 1,
      title: "On Booking/Token",
      status: "Partial",
      amount: 5000000,
      paidAmount: 50000,
      dueAmount: 4950000,
      dueDate: "24 Aug 2026",
      raised: true,
      emailed: true,
    },
    {
      id: "m-2",
      index: 2,
      title: "On Foundation",
      status: "Unpaid",
      amount: 750000,
      raised: false,
    },
    {
      id: "m-3",
      index: 3,
      title: "On Slab / Structure",
      status: "Unpaid",
      amount: 1000000,
      raised: false,
    },
    {
      id: "m-4",
      index: 4,
      title: "On Brickwork",
      status: "Unpaid",
      amount: 750000,
      raised: false,
    },
    {
      id: "m-5",
      index: 5,
      title: "On Plaster / Finishing",
      status: "Unpaid",
      amount: 750000,
      raised: false,
    },
    {
      id: "m-6",
      index: 6,
      title: "On Possession",
      status: "Unpaid",
      amount: 500000,
      raised: false,
    },
    {
      id: "m-7",
      index: 7,
      title: "On Booking",
      status: "Partial",
      amount: 500000,
      paidAmount: 50000,
      dueAmount: 450000,
      raised: false,
    },
    {
      id: "m-8",
      index: 8,
      title: "On Agreement",
      status: "Unpaid",
      amount: 750000,
      raised: false,
    },
  ]);

  // Post Sale Checklist (Exact data from screenshot)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "c-1",
      title: "Allotment Letter Issued",
      completed: true,
      date: "25 Aug 2026",
    },
    {
      id: "c-2",
      title: "Agreement to Sale Signed",
      completed: true,
      date: "24 Aug 2026",
    },
    {
      id: "c-3",
      title: "Sale Deed / Registration Done",
      completed: true,
      date: "24 Aug 2026",
    },
    {
      id: "c-4",
      title: "OC / CC Received",
      completed: false,
    },
    {
      id: "c-5",
      title: "Key Handover / Possession Given",
      completed: false,
    },
  ]);

  // Document upload state
  const [docName, setDocName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([
    "Allotment Letter",
    "Agreement to Sale",
  ]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Active Payment Modal / Demand Letter
  const [payingMilestone, setPayingMilestone] = useState<MilestoneItem | null>(null);
  const [demandLetterMilestone, setDemandLetterMilestone] = useState<MilestoneItem | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Milestone financial aggregations
  const totalPlan = milestones.reduce((acc, m) => acc + m.amount, 0);
  const totalCollected = milestones.reduce((acc, m) => acc + (m.paidAmount || 0), 0);
  const totalBalance = totalPlan - totalCollected;

  // Checklist counts
  const completedCount = checklist.filter((c) => c.completed).length;
  const totalChecklist = checklist.length;

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nowCompleted = !item.completed;
          return {
            ...item,
            completed: nowCompleted,
            date: nowCompleted ? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : undefined,
          };
        }
        return item;
      })
    );
  };

  const handleSaveCustomerDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomer((prev) => ({
      ...prev,
      name: editName,
      phone: editPhone,
      email: editEmail,
    }));
    setIsEditingCustomer(false);
    showToast("Customer details updated successfully!");
  };

  const handleSaveBillingDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomer((prev) => ({
      ...prev,
      billingEmail: editBillingEmail,
    }));
    setIsEditingBilling(false);
    showToast("Billing email recipient updated!");
  };

  const handlePaySubmit = (amountPaid: number) => {
    if (!payingMilestone) return;
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === payingMilestone.id) {
          const currentPaid = (m.paidAmount || 0) + amountPaid;
          const remaining = Math.max(0, m.amount - currentPaid);
          return {
            ...m,
            paidAmount: currentPaid,
            dueAmount: remaining,
            status: remaining === 0 ? "Paid" : "Partial",
          };
        }
        return m;
      })
    );
    setPayingMilestone(null);
    showToast(`Payment of ${formatCurrency(amountPaid)} recorded successfully!`);
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    setUploadedDocs((prev) => [docName.trim(), ...prev]);
    setDocName("");
    setSelectedFile(null);
    setUploadSuccess(true);
    showToast("Document uploaded and saved to dossier!");
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    showToast("Milestone removed from plan.");
  };

  return (
    <div className="space-y-5 font-sans animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header: Back Button & Customer Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 transition shadow-2xs cursor-pointer"
          aria-label="Go Back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none font-heading">
            {customer.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {customer.project} • {customer.unit}
          </p>
        </div>
      </div>

      {/* Main Grid: 2 Column Layout (Left: Customer Details, Billing, Payment Plan, Documents | Right: Booking Summary, Unit & Cost Sheet, Post-Sale Checklist) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Customer Details Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 font-heading">Customer Details</h2>
              <button
                onClick={() => setIsEditingCustomer(true)}
                className="text-xs font-semibold text-[#3B8CFF] hover:text-[#2570E8] flex items-center gap-1 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Name</span>
                <span className="text-xs font-bold text-slate-900 block">{customer.name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Phone</span>
                <span className="text-xs font-bold text-slate-900 block">{customer.phone}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-slate-400 block mb-0.5">Email</span>
                <span className="text-xs font-bold text-slate-900 block">{customer.email}</span>
              </div>
            </div>
          </div>

          {/* 2. Billing Recipients Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900 font-heading">Billing Recipients</h2>
              </div>
              <button
                onClick={() => setIsEditingBilling(true)}
                className="text-xs font-semibold text-[#3B8CFF] hover:text-[#2570E8] flex items-center gap-1 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">To</span>
              <span className="font-bold text-slate-900">{customer.billingEmail}</span>
            </div>
          </div>

          {/* 3. Payment Plan Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-heading">Payment Plan</h2>

            {/* Total Plan / Collected / Balance Bar */}
            <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Total Plan</span>
                <span className="text-sm sm:text-base font-black text-slate-900 block mt-0.5">
                  {formatCurrency(totalPlan)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Collected</span>
                <span className="text-sm sm:text-base font-black text-emerald-600 block mt-0.5">
                  {formatCurrency(totalCollected)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Balance</span>
                <span className="text-sm sm:text-base font-black text-rose-600 block mt-0.5">
                  {formatCurrency(totalBalance)}
                </span>
              </div>
            </div>

            {/* Milestones List */}
            <div className="divide-y divide-slate-100">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/60 -mx-2 px-2 rounded-xl transition"
                >
                  {/* Left: Index & Milestone Title + Details */}
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-xs font-semibold text-slate-400 w-4 text-center mt-0.5">
                      {m.index}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{m.title}</span>
                        {m.status === "Partial" ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Partial
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            Unpaid
                          </span>
                        )}
                        {!m.raised && (
                          <span className="text-[11px] text-slate-400">• not raised</span>
                        )}
                      </div>

                      {/* Financial info line */}
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                        <span>{formatCurrency(m.amount)}</span>
                        {m.paidAmount && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">
                              {formatCurrency(m.paidAmount)} paid
                            </span>
                          </>
                        )}
                        {m.dueAmount && (
                          <>
                            <span>•</span>
                            <span className="text-rose-600 font-medium">
                              {formatCurrency(m.dueAmount)} due
                            </span>
                          </>
                        )}
                        {m.dueDate && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">due {m.dueDate}</span>
                          </>
                        )}
                        {m.emailed && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">emailed</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline-block" />

                    {/* Pay button */}
                    <button
                      type="button"
                      onClick={() => setPayingMilestone(m)}
                      className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 font-bold text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer"
                    >
                      <span>₹</span>
                      <span>Pay</span>
                    </button>

                    {/* Email action */}
                    <button
                      type="button"
                      onClick={() => showToast(`Demand email dispatched for ${m.title}!`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Send Demand Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>

                    {/* Send / Dispatch action */}
                    <button
                      type="button"
                      onClick={() => showToast(`Demand letter raised for ${m.title}!`)}
                      className="p-1.5 rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                      title="Raise Demand Letter"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit action */}
                    <button
                      type="button"
                      onClick={() => showToast(`Editing milestone: ${m.title}`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Edit Milestone"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete action */}
                    <button
                      type="button"
                      onClick={() => handleDeleteMilestone(m.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions: Add Demand Letter & Generate Plan */}
            <div className="pt-2 flex items-center gap-6 text-xs font-semibold text-[#3B8CFF]">
              <button
                type="button"
                onClick={() => setIsAddingMilestone(true)}
                className="hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Demand Letter</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast("Payment plan recalculated according to unit cost!");
                }}
                className="text-slate-500 hover:text-slate-900 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate plan</span>
              </button>
            </div>
          </div>

          {/* 4. Documents Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-heading">Documents</h2>

            <form onSubmit={handleUploadDoc} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Document Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Allotment Letter"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]/20 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Quick Tag Pills matching screenshot */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  "Allotment Letter",
                  "Agreement to Sale",
                  "Sale Deed",
                  "NOC",
                  "OC / CC",
                  "Possession Letter",
                  "KYC - Aadhaar",
                  "KYC - PAN",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setDocName(tag)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* File Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  File (Max 10MB)
                </label>
                <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedFile ? selectedFile.name : "Choose file"}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              {/* Upload Button */}
              <div>
                <button
                  type="submit"
                  disabled={!docName.trim()}
                  className="px-5 py-2 text-xs font-bold bg-[#7C5CFC] hover:bg-[#6846EB] active:scale-95 text-white rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Booking Summary Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 font-heading">Booking Summary</h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Unit</span>
                <span className="font-bold text-slate-900">{customer.unit}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Category</span>
                <span className="font-bold text-slate-900">{customer.category}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Final Price</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(customer.agreedPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Unit & Cost Sheet Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 font-heading">Unit & Cost Sheet</h2>
              <button
                type="button"
                onClick={() => setIsCostSheetModalOpen(true)}
                className="text-xs font-semibold text-[#3B8CFF] hover:text-[#2570E8] flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Create</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Unit</span>
                <span className="font-bold text-slate-900">{customer.unit}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Type</span>
                <span className="font-bold text-slate-900">{customer.category}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Agreed Price</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(customer.agreedPrice)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-amber-600/90 font-medium leading-relaxed pt-1">
              No cost sheet yet — create one for the full price breakup.
            </p>
          </div>

          {/* 3. Post-Sale Checklist Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-heading">Post-Sale Checklist</h2>

            {/* Progress bar */}
            <div>
              <div className="text-xs text-slate-500 font-medium mb-1.5">
                {completedCount} of {totalChecklist} completed
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${(completedCount / totalChecklist) * 100}%` }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3 pt-1">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className="flex items-start justify-between gap-2 text-xs group cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 group-hover:text-slate-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`leading-tight font-medium ${
                        item.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-800 group-hover:text-slate-900"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  {item.date && (
                    <span className="text-[11px] text-slate-400 font-normal whitespace-nowrap">
                      {item.date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Customer Details Modal */}
      {isEditingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-4">Edit Customer Details</h3>
            <form onSubmit={handleSaveCustomerDetails} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingCustomer(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#3B8CFF] hover:bg-[#2570E8] text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Billing Recipients Modal */}
      {isEditingBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-4">Edit Billing Recipients</h3>
            <form onSubmit={handleSaveBillingDetails} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Billing Email (To)</label>
                <input
                  type="email"
                  value={editBillingEmail}
                  onChange={(e) => setEditBillingEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingBilling(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#3B8CFF] hover:bg-[#2570E8] text-white"
                >
                  Update Billing Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {isAddingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Payment Demand Milestone</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const title = form.title.value;
                const amount = Number(form.amount.value);
                if (title && amount) {
                  setMilestones((prev) => [
                    ...prev,
                    {
                      id: `m-${Date.now()}`,
                      index: prev.length + 1,
                      title,
                      amount,
                      status: "Unpaid",
                      raised: false,
                    },
                  ]);
                  setIsAddingMilestone(false);
                  showToast("New milestone demand added!");
                }
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Milestone Name</label>
                <input
                  name="title"
                  placeholder="e.g. On Flooring / Internal Plaster"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  name="amount"
                  type="number"
                  placeholder="e.g. 500000"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMilestone(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#3B8CFF] hover:bg-[#2570E8] text-white"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {payingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Record Collection Payment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Milestone: <strong>{payingMilestone.title}</strong> (Total: {formatCurrency(payingMilestone.amount)})
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const amt = Number(form.amount.value);
                if (amt > 0) {
                  handlePaySubmit(amt);
                }
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount Paid (₹)</label>
                <input
                  name="amount"
                  type="number"
                  defaultValue={payingMilestone.dueAmount || payingMilestone.amount}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode</label>
                <select
                  name="mode"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                >
                  <option value="NEFT">NEFT / RTGS / IMPS</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="UPI">UPI</option>
                  <option value="DD">Demand Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reference No. / UTR</label>
                <input
                  name="ref"
                  placeholder="e.g. UTR-982374619"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingMilestone(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cost Sheet Creator Modal */}
      {isCostSheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1 font-heading">
              Unit & Cost Sheet Breakup
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure base rate, floor rise, PLC, club charges & taxes for {customer.unit}.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Base Unit Consideration:</span>
                  <span className="font-bold text-slate-900">₹45,00,000</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PLC & Facing Charges:</span>
                  <span className="font-bold text-slate-900">₹2,50,000</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Club & Infrastructure Development:</span>
                  <span className="font-bold text-slate-900">₹2,50,000</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Agreed Consideration:</span>
                  <span className="text-emerald-600">₹50,00,000</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsCostSheetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCostSheetModalOpen(false);
                  showToast("Cost sheet generated and attached to booking!");
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#3B8CFF] hover:bg-[#2570E8] text-white"
              >
                Save & Attach Cost Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
