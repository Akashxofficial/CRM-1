"use client";

import { useState, useTransition, useRef } from "react";
import { createLeadAction } from "@/actions/leads-actions";
import {
  X,
  Printer,
  CheckCircle2,
  Loader2,
  Building,
  UserCheck,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Layers,
  Clock,
  DollarSign,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects?: any[];
  agents?: any[];
  onSuccess?: () => void;
}

export function UrbanGaonEnquiryModal({
  isOpen,
  onClose,
  projects = [],
  agents = [],
  onSuccess,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Form State matching the PDF
  const [salutation, setSalutation] = useState<"Mr." | "Ms." | "Mrs.">("Mr.");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Jaipur");
  const [state, setState] = useState("Rajasthan");
  const [country, setCountry] = useState("India");
  const [pinCode, setPinCode] = useState("302006");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  // Demographics
  const [dob, setDob] = useState("");
  const [maritalStatus, setMaritalStatus] = useState<"Single" | "Married">("Single");
  const [childrenCount, setChildrenCount] = useState("");
  const [residentialStatus, setResidentialStatus] = useState<
    "Resident" | "Non-Resident" | "Foreign National of Indian Origin"
  >("Resident");
  const [purposeOfPurchase, setPurposeOfPurchase] = useState<"Investment" | "End Use">(
    "End Use"
  );

  // Customer Profile & Employment
  const [customerProfile, setCustomerProfile] = useState<
    "Self Employed" | "Private Service" | "Govt. Service" | "Retired" | "NRI" | "Housewife"
  >("Private Service");
  const [industryType, setIndustryType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");

  // Source of Enquiry
  const [sourceOption, setSourceOption] = useState("Company website / social media / online search");
  const [channelPartnerName, setChannelPartnerName] = useState("");
  const [empId, setEmpId] = useState("");
  const [referralDetails, setReferralDetails] = useState("");
  const [otherSource, setOtherSource] = useState("");

  // Housing Preference, Timelines & Budget
  const [livingStatus, setLivingStatus] = useState<"Own" | "Rent">("Own");
  const [housingStyle, setHousingStyle] = useState<"Plot" | "2/3 BHK" | "Serviced Apartment">(
    "2/3 BHK"
  );
  const [purchaseTimeline, setPurchaseTimeline] = useState<
    "With in 1 Month" | "1-3 Months" | "6-12 Months"
  >("1-3 Months");
  const [budgetRange, setBudgetRange] = useState<
    "<₹50 Lakhs" | "₹50 Lakhs-₹1 Crore" | ">₹1 Crore" | "Prefer not to disclose"
  >("₹50 Lakhs-₹1 Crore");

  // CRM Project & Sales Assignment
  const defaultProjId = projects[0]?.id || "demo-proj-1";
  const [projectId, setProjectId] = useState(defaultProjId);
  const [assignedToId, setAssignedToId] = useState("");
  const [initialNote, setInitialNote] = useState("");

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const fullName = `${salutation} ${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please provide First and Last Name.");
      return;
    }
    if (!mobile.trim()) {
      setError("Please provide a valid 10-digit mobile number.");
      return;
    }

    startTransition(async () => {
      let sourceLabel = sourceOption;
      if (sourceOption.includes("Channel Partner") && channelPartnerName) {
        sourceLabel = `Channel Partner: ${channelPartnerName}`;
      } else if (sourceOption.includes("Employee Referral") && empId) {
        sourceLabel = `Employee Referral (ID: ${empId})`;
      } else if (sourceOption.includes("Referral from") && referralDetails) {
        sourceLabel = `Referral: ${referralDetails}`;
      } else if (sourceOption.includes("Other") && otherSource) {
        sourceLabel = `Other: ${otherSource}`;
      }

      let bMin = 5000000;
      let bMax = 10000000;
      if (budgetRange === "<₹50 Lakhs") {
        bMin = 2500000;
        bMax = 5000000;
      } else if (budgetRange === ">₹1 Crore") {
        bMin = 10000000;
        bMax = 25000000;
      }

      const noteContent = `
[UrbanGaon Customer Enquiry Form Captured]
- Correspondence: ${address}, ${city}, ${state}, ${country} - ${pinCode}
- Profile: ${customerProfile} | ${designation} @ ${companyName} (${department}) | Income: ${annualIncome || "N/A"}
- Housing: Style: ${housingStyle} | Purpose: ${purposeOfPurchase} | Timeline: ${purchaseTimeline} | Budget: ${budgetRange}
- Residential Status: ${residentialStatus} | Living: ${livingStatus} | Marital: ${maritalStatus} (${childrenCount ? childrenCount + " children" : "0 children"})
- Notes: ${initialNote || "Enquiry submitted via official customer form."}
      `.trim();

      const res = await createLeadAction({
        projectId: projectId || defaultProjId,
        name: fullName,
        phone: mobile,
        email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@customer.in`,
        source: sourceLabel,
        interestedType: housingStyle,
        budgetMin: bMin,
        budgetMax: bMax,
        priority: purchaseTimeline === "With in 1 Month" ? "HOT" : "WARM",
        assignedToId: assignedToId || undefined,
        initialNote: noteContent,
      });

      if (res.success) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 1500);
      } else {
        setError("Failed to create lead. Please check your inputs.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        ref={printRef}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 font-sans"
      >
        {/* Modal Top Action Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3B8CFF] to-[#1A57BD] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#3B8CFF]/20">
              UG
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading leading-tight">
                UrbanGaon Customer Enquiry Form
              </h2>
              <p className="text-xs text-slate-500">
                Official real estate application & lead capture registry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
            >
              <Printer className="w-3.5 h-3.5 text-[#3B8CFF]" />
              <span className="hidden sm:inline">Print Form</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-slate-800 text-xs">
          {/* Header Banner exactly matching PDF */}
          <div className="text-center pb-4 border-b border-slate-200">
            <div className="inline-flex items-center gap-2 text-[#3B8CFF] font-bold text-lg font-heading">
              <span className="w-6 h-6 rounded-lg bg-[#3B8CFF] text-white flex items-center justify-center text-xs">✦</span>
              <span>UrbanGaon</span>
            </div>
            <span className="text-[11px] text-slate-400 block tracking-widest uppercase">a perfect balance</span>
            <h1 className="text-xl font-bold text-slate-900 mt-2 font-heading tracking-tight">
              Customer Enquiry Form
            </h1>
            <p className="text-[11px] text-slate-500 italic">
              (Please complete this application thoroughly so we can process it as quickly as possible)
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Customer Enquiry Form submitted & registered into UrbanGaon CRM!</span>
            </div>
          )}

          {/* 1. PERSONAL / CONTACT DETAILS */}
          <div className="space-y-3.5">
            {/* Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Name: Mr./Ms./Mrs.
                </label>
                <select
                  value={salutation}
                  onChange={(e: any) => setSalutation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] text-slate-400 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Rajesh"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] text-slate-400 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="e.g. Kumar"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] text-slate-400 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                />
              </div>
            </div>

            {/* Correspondence Address */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Correspondence Address:
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Flat No., Street, Landmark..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
              />
            </div>

            {/* City, State, Country, Pin */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Pin</label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                />
              </div>
            </div>

            {/* Mobile & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Mobile * (10 Digits)
                </label>
                <div className="flex items-center gap-1">
                  <span className="px-2.5 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-500 font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] tracking-wider"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajesh.sharma@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                />
              </div>
            </div>
          </div>

          {/* 2. DEMOGRAPHICS (4 Box Cards matching PDF) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            {/* Date of Birth */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">Date of Birth:</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs"
              />
              <span className="text-[9px] text-slate-400 block text-center">DD-MM-YYYY</span>
            </div>

            {/* Marital Status */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">Marital Status</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                  <input
                    type="radio"
                    name="marital"
                    checked={maritalStatus === "Single"}
                    onChange={() => setMaritalStatus("Single")}
                    className="text-[#3B8CFF]"
                  />
                  <span>Single</span>
                </label>
                <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                  <input
                    type="radio"
                    name="marital"
                    checked={maritalStatus === "Married"}
                    onChange={() => setMaritalStatus("Married")}
                    className="text-[#3B8CFF]"
                  />
                  <span>Married</span>
                </label>
              </div>
              {maritalStatus === "Married" && (
                <input
                  type="text"
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(e.target.value)}
                  placeholder="If married, No. of Children..."
                  className="w-full px-2 py-1 text-[11px] rounded bg-white border border-slate-200"
                />
              )}
            </div>

            {/* Residential Status */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">Residential Status</label>
              <div className="space-y-1 text-[11px]">
                {["Resident", "Non-Resident", "Foreign National of Indian Origin"].map((r) => (
                  <label key={r} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="residential"
                      checked={residentialStatus === r}
                      onChange={() => setResidentialStatus(r as any)}
                      className="text-[#3B8CFF]"
                    />
                    <span className="truncate">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Purpose of Purchase */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">Purpose of Purchase</label>
              <div className="space-y-1.5 text-[11px] pt-1">
                {["Investment", "End Use"].map((p) => (
                  <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="purpose"
                      checked={purposeOfPurchase === p}
                      onChange={() => setPurposeOfPurchase(p as any)}
                      className="text-[#3B8CFF]"
                    />
                    <span className="font-medium">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 3. CUSTOMER PROFILE & EMPLOYMENT DETAILS */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-2">Customer Profile:</label>
              <div className="flex flex-wrap items-center gap-4 text-[11px]">
                {["Self Employed", "Private Service", "Govt. Service", "Retired", "NRI", "Housewife"].map((cp) => (
                  <label key={cp} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="custProfile"
                      checked={customerProfile === cp}
                      onChange={() => setCustomerProfile(cp as any)}
                      className="text-[#3B8CFF]"
                    />
                    <span>{cp}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Industry Type</label>
                <input
                  type="text"
                  value={industryType}
                  onChange={(e) => setIndustryType(e.target.value)}
                  placeholder="e.g. IT, Healthcare, Manufacturing"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Infosys / Self-Practicing"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. VP / Senior Architect"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Technology / Operations"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-400 mb-1">Annual Income</label>
                <input
                  type="text"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value)}
                  placeholder="e.g. ₹25,00,000 / Year"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 4. HOW DID YOU FIRST HEAR ABOUT THIS PROJECT */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-2.5">
            <label className="block text-[11px] font-bold text-slate-900">
              How did you first hear about this Project:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              {[
                "Newspaper/magazine ad",
                "Hoarding/billboard",
                "Email/SMS/ Whats app campaign",
                "Event/Exhibition",
                "Channel Partner",
                "Employee Referral",
                "Referral from friend/family/ Existing Customer",
                "Company website / social media / online search",
                "Real estate portal (e.g., Magic Bricks, 99acres)",
                "Other",
              ].map((src) => (
                <label key={src} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="leadSource"
                    checked={sourceOption.startsWith(src)}
                    onChange={() => setSourceOption(src)}
                    className="mt-0.5 text-[#3B8CFF]"
                  />
                  <span>{src}</span>
                </label>
              ))}
            </div>

            {/* Conditional input fields */}
            {sourceOption === "Channel Partner" && (
              <input
                type="text"
                value={channelPartnerName}
                onChange={(e) => setChannelPartnerName(e.target.value)}
                placeholder="Channel Partner Name..."
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs mt-2"
              />
            )}
            {sourceOption === "Employee Referral" && (
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="Employee Referral Emp. ID..."
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs mt-2"
              />
            )}
            {sourceOption.includes("Referral from") && (
              <input
                type="text"
                value={referralDetails}
                onChange={(e) => setReferralDetails(e.target.value)}
                placeholder="Referral from friend/family/ Existing Customer unit no. Name..."
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs mt-2"
              />
            )}
            {sourceOption === "Other" && (
              <input
                type="text"
                value={otherSource}
                onChange={(e) => setOtherSource(e.target.value)}
                placeholder="Other please specify..."
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs mt-2"
              />
            )}
          </div>

          {/* 5. HOUSING STYLE, LIVING STATUS, TIMELINES & BUDGET (4 Box Cards matching PDF) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Current living Status */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-white space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">Current living Status:</label>
              <div className="space-y-1.5 text-[11px] pt-1">
                {["Own", "Rent"].map((s) => (
                  <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="livingStatus"
                      checked={livingStatus === s}
                      onChange={() => setLivingStatus(s as any)}
                      className="text-[#3B8CFF]"
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Desired Housing Style */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-white space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">Desired Housing Style:</label>
              <div className="space-y-1.5 text-[11px] pt-1">
                {["Plot", "2/3 BHK", "Serviced Apartment"].map((h) => (
                  <label key={h} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="housingStyle"
                      checked={housingStyle === h}
                      onChange={() => setHousingStyle(h as any)}
                      className="text-[#3B8CFF]"
                    />
                    <span>{h}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Purchase Timelines */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-white space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">Purchase Timelines:</label>
              <div className="space-y-1.5 text-[11px] pt-1">
                {["With in 1 Month", "1-3 Months", "6-12 Months"].map((t) => (
                  <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="timeline"
                      checked={purchaseTimeline === t}
                      onChange={() => setPurchaseTimeline(t as any)}
                      className="text-[#3B8CFF]"
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-white space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">Overall Budget Range:</label>
              <div className="space-y-1 text-[11px] pt-1">
                {["<₹50 Lakhs", "₹50 Lakhs-₹1 Crore", ">₹1 Crore", "Prefer not to disclose"].map((b) => (
                  <label key={b} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="budget"
                      checked={budgetRange === b}
                      onChange={() => setBudgetRange(b as any)}
                      className="text-[#3B8CFF]"
                    />
                    <span className="truncate">{b}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 6. CRM PROJECT ASSIGNMENT & AGENT */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-[#F0F6FF]/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Assign Sales Executive</label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none"
              >
                <option value="">Auto-Assign / Unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Official Footer matching PDF */}
          <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 leading-relaxed">
            <strong>UrbanGaon</strong>, 2nd Floor, 74A, Sawai Pratap Singh Road, Near CM House, Opp. Loharu House, Gaurav Nagar, Civil lines, Jaipur, PIN: 302006, Rajasthan, India.
          </div>

          {/* Actions Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-bold shadow-md shadow-[#3B8CFF]/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Customer Enquiry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
