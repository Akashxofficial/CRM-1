"use client";

import { useState } from "react";
import {
  UserCheck,
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
  MessageSquare,
  Sparkles,
  Award,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { UrbanGaonEnquiryModal } from "@/components/leads/UrbanGaonEnquiryModal";
import { CustomerProfileDetailView } from "./CustomerProfileDetailView";

interface Props {
  initialCustomers: any[];
  projects: any[];
  users: any[];
  units: any[];
  bookings?: any[];
  userRole: string;
}

export function CustomersView({
  initialCustomers,
  projects,
  users,
  units,
  bookings = [],
  userRole,
}: Props) {
  // We can default to the detailed customer view (matching screenshot) while allowing user to toggle to the directory
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>({
    id: "cust-pratik",
    name: "Pratik Gowardhane",
    phone: "7045901129",
    email: "pratik291190@gmail.com",
    project: { name: "Vastu CRM" },
    interestedUnit: { unitNumber: "Plot 7" },
    interestedType: "Plot",
    budgetMax: 5000000,
  });

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [selectedFilterTab, setSelectedFilterTab] = useState<"ALL" | "BOOKED" | "PROSPECTS" | "NEW">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  // If a customer is selected, show the exact screenshot view!
  if (selectedCustomer) {
    return (
      <div className="space-y-4">
        {/* Quick Customer Switcher Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <button
            onClick={() => setSelectedCustomer(null)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Customers Directory</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Customer</span>
            </button>
          </div>
        </div>

        {/* Customer Detail Profile exactly matching the screenshot */}
        <CustomerProfileDetailView
          customer={selectedCustomer}
          onBack={() => setSelectedCustomer(null)}
        />

        {/* New Customer Modal */}
        <UrbanGaonEnquiryModal
          isOpen={isAddCustomerModalOpen}
          onClose={() => setIsAddCustomerModalOpen(false)}
          projects={projects}
          agents={users}
          formType="customer"
          title="UrbanGaon Customer Registration Form"
        />
      </div>
    );
  }

  // Filter customers for directory
  const filteredCustomers = initialCustomers.filter((c) => {
    if (selectedProjectId !== "ALL" && c.projectId !== selectedProjectId) return false;

    if (selectedFilterTab === "BOOKED" && c.status !== "BOOKED") return false;
    if (selectedFilterTab === "NEW" && c.status !== "NEW") return false;
    if (selectedFilterTab === "PROSPECTS" && !["NEGOTIATION", "SITE_VISIT_DONE", "SITE_VISIT_SCHEDULED", "CONTACTED"].includes(c.status)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (c.name || "").toLowerCase().includes(q);
      const matchPhone = (c.phone || "").toLowerCase().includes(q);
      const matchEmail = (c.email || "").toLowerCase().includes(q);
      const matchProject = (c.project?.name || "").toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchProject) return false;
    }
    return true;
  });

  // Calculate Metrics
  const totalCustomers = initialCustomers.length;
  const bookedOwners = initialCustomers.filter((c) => c.status === "BOOKED").length;
  const hotProspects = initialCustomers.filter((c) => ["NEGOTIATION", "SITE_VISIT_DONE"].includes(c.status)).length;
  const totalPipelineBudget = initialCustomers.reduce((acc, curr) => acc + (curr.budgetMax || 0), 0);
  const avgBudget = totalCustomers > 0 ? Math.round(totalPipelineBudget / totalCustomers) : 0;

  const exportCSV = () => {
    const headers = ["Name", "Phone", "Email", "Project", "Status", "Source", "Assigned Officer", "Budget"];
    const rows = filteredCustomers.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email || ""}"`,
      `"${c.project?.name || ""}"`,
      `"${c.status}"`,
      `"${c.source}"`,
      `"${c.assignedTo?.name || "Unassigned"}"`,
      `"${formatCurrency(c.budgetMin)} - ${formatCurrency(c.budgetMax)}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `urbangaon_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "BOOKED":
        return {
          label: "Confirmed Owner",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "NEGOTIATION":
        return {
          label: "In Negotiation",
          className: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "SITE_VISIT_DONE":
      case "SITE_VISIT_SCHEDULED":
        return {
          label: "Site Visit / Tour",
          className: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "CONTACTED":
        return {
          label: "Engaged",
          className: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "NEW":
        return {
          label: "New Registered",
          className: "bg-sky-50 text-sky-700 border-sky-200",
        };
      default:
        return {
          label: status,
          className: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5 font-heading">
            <UserCheck className="w-6 h-6 text-emerald-600" /> Customer Directory & Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete database of registered customers, property owners, and active buyer accounts with direct contact tools.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
          </button>

          {/* New Customer Button */}
          <button
            onClick={() => setIsAddCustomerModalOpen(true)}
            className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl shadow-sm shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Customer
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Customers
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalCustomers}</div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Registered in CRM
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Confirmed Owners
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{bookedOwners}</div>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5">
              Booked & Allotted Units
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Prospects
            </span>
            <div className="text-2xl font-black text-[#3B8CFF] mt-0.5">{hotProspects}</div>
            <span className="text-[11px] text-blue-600 font-medium mt-0.5">
              Negotiation & Site Visits
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#3B8CFF]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Avg. Investment Size
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {formatCurrency(avgBudget)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5">
              Target Buyer Portfolio
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: "ALL", label: `All Customers (${initialCustomers.length})` },
            { key: "BOOKED", label: `Owners (${bookedOwners})` },
            { key: "PROSPECTS", label: `Active Prospects (${hotProspects})` },
            { key: "NEW", label: `New Registrations` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedFilterTab(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFilterTab === tab.key
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Project Selector */}
        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer by name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]/20"
            />
          </div>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content: Table View or Grid Card View */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Project & Type</th>
                  <th className="py-3.5 px-4">Budget Range</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Assigned Officer</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <UserCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">No customers found</p>
                      <p className="text-[11px] mt-1 text-slate-400">
                        Try changing your search query or click "New Customer" to register one.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const badge = getStatusBadge(customer.status);
                    const cleanPhone = (customer.phone || "").replace(/\D/g, "");

                    return (
                      <tr
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className="hover:bg-slate-50/80 transition cursor-pointer group"
                      >
                        {/* Customer Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#3B8CFF]/10 text-[#3B8CFF] font-bold flex items-center justify-center flex-shrink-0 text-xs">
                              {customer.name?.charAt(0) || "C"}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 group-hover:text-[#3B8CFF] transition block truncate">
                                {customer.name}
                              </span>
                              <span className="text-[11px] text-slate-400 block truncate">
                                Registered: {formatDate(customer.createdAt)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${customer.phone}`}
                                className="font-semibold text-slate-800 hover:text-[#3B8CFF] flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{customer.phone}</span>
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
                            {customer.email && (
                              <a
                                href={`mailto:${customer.email}`}
                                className="text-[11px] text-slate-500 hover:underline flex items-center gap-1 truncate max-w-[180px]"
                              >
                                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{customer.email}</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Project & Type */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>{customer.project?.name || "UrbanGaon One"}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {customer.interestedType || "Plot / 2BHK"}
                          </div>
                        </td>

                        {/* Budget */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900">
                            {formatCurrency(customer.budgetMax || 5000000)}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            From {formatCurrency(customer.budgetMin || 2500000)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.className}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {badge.label}
                          </span>
                        </td>

                        {/* Assigned Officer */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{customer.assignedTo?.name || "Yudhister Tiwari"}</span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                            title="View Customer Profile"
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
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => {
            const badge = getStatusBadge(customer.status);
            const cleanPhone = (customer.phone || "").replace(/\D/g, "");

            return (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-[#3B8CFF]/50 transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-[#3B8CFF]/10 text-[#3B8CFF] font-bold flex items-center justify-center text-sm flex-shrink-0">
                        {customer.name?.charAt(0) || "C"}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-[#3B8CFF] transition text-sm">
                          {customer.name}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          {customer.project?.name || "UrbanGaon"}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="space-y-1.5 py-2.5 border-y border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-semibold text-slate-800">{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Email:</span>
                        <span className="font-medium text-slate-800 truncate max-w-[180px]">
                          {customer.email}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Housing Style:</span>
                      <span className="font-medium text-slate-800">
                        {customer.interestedType || "Plot / 2BHK"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Target Budget:</span>
                      <span className="font-bold text-emerald-600">
                        {formatCurrency(customer.budgetMax || 5000000)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-1 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{customer.assignedTo?.name || "Yudhister Tiwari"}</span>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-[10px]"
                      >
                        WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UrbanGaon Customer Registration Modal */}
      <UrbanGaonEnquiryModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        projects={projects}
        agents={users}
        formType="customer"
        title="UrbanGaon Customer Registration Form"
      />
    </div>
  );
}
