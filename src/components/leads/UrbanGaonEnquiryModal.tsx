"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { createLeadAction } from "@/actions/leads-actions";
import { generateCustomerWelcomeEmail, generateInternalCompanyNotificationEmail } from "@/lib/email-templates";
import { ALL_COUNTRIES, findCountry, CountryData } from "@/lib/countries-data";
import { CountryFlag } from "../common/CountryFlag";
import {
  X,
  Printer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Send,
  Sparkles,
  Eye,
  Check,
  Phone,
  AtSign,
  ChevronDown,
  Globe,
  Search,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects?: any[];
  agents?: any[];
  onSuccess?: () => void;
}

const COMMON_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "urbangaon.com",
];

const DESIGNATIONS_LIST = [
  "-None-",
  "CEO",
  "CTO",
  "CFO",
  "Vice President (VP)",
  "Country Head / Regional Head",
  "Executive",
  "Director",
  "Director / Executive Director",
  "Assistant / Associate Vice President (Avp)",
  "Senior Manager",
  "General Manager (GM)",
  "Manager",
  "Supervisor",
  "Operations Manager",
  "Team-Lead",
  "Architect",
  "Sales / Business Development Manager",
  "Marketing Manager",
  "Hr Manager",
  "Finance / Accounts Manager",
  "Project / Program Manager",
  "Product Manager",
  "Assistant Manager",
  "Team Lead / Supervisor",
  "Senior Executive / Senior Officer",
  "Coordinator",
  "Executive / Officer / Associate",
  "Engineer / Developer / Analyst",
  "Consultant / Specialist",
  "Intern",
  "Product-Manager",
  "Project-Manager",
  "Business-Analyst",
  "HR-Specialist",
  "Marketing-Specialist",
  "Sales-Representative",
  "Customer-Service-Rep",
  "Financial-Analyst",
  "Advisor",
  "Freelancer / Self-Employed",
  "Intern / Trainee",
  "Student",
  "Homemaker",
  "Retired",
  "Other / Not Applicable",
];

const INDUSTRY_TYPES_LIST = [
  "-None-",
  "Banking & Finance",
  "Consulting",
  "Insurance",
  "Legal",
  "Accounting",
  "Investment Management",
  "Healthcare",
  "Pharmaceuticals",
  "Wellness",
  "Medical Devices",
  "Information Technology",
  "Software Development",
  "Telecommunications",
  "Technology",
  "Cloud Computing",
  "Arts & Culture",
  "Entertainment",
  "Fashion & Apparel",
  "Media & Publishing",
  "Advertising",
  "Agriculture",
  "Automotive",
  "Aviation",
  "Construction",
  "Energy & Utilities",
  "Manufacturing",
  "Mining & Metals",
  "Chemicals",
  "Education",
  "Government & Public Sector",
  "Hospitality & Tourism",
  "Non-Profit",
  "Real Estate",
  "Retail",
  "Sports & Recreation",
  "Transportation & Logistics",
  "Primary & Secondary Education",
  "Higher Education",
  "Vocational Training",
  "Online Learning",
  "Defense & Security",
  "E-Commerce",
  "Environmental Services",
  "Food & Beverage",
  "Gaming",
  "Marine",
  "Research & Development",
  "Supply Chain Management",
  "Startups",
  "Other",
];

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
  const [dispatchedEmails, setDispatchedEmails] = useState<any>(null);
  const [previewEmailTab, setPreviewEmailTab] = useState<"customer" | "company" | null>(null);
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

  // Country Code & Flag State
  const [countryIso, setCountryIso] = useState("in");
  const [countryDialCode, setCountryDialCode] = useState("+91");
  const [targetDigitLength, setTargetDigitLength] = useState(10);
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  
  // Mobile & Real-time Email Suggestions
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailFocused, setIsEmailFocused] = useState(false);

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
  const [customerProfile, setCustomerProfile] = useState<string>("-None-");
  const [industryType, setIndustryType] = useState("-None-");
  const [companyName, setCompanyName] = useState("");
  const [designation, setDesignation] = useState("-None-");
  const [department, setDepartment] = useState("");
  const [annualIncome, setAnnualIncome] = useState("-None-");

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

  // Real-time Country & Dial Code Auto-Sync Function
  const syncCountryAndDialCode = (countryName: string) => {
    setCountry(countryName);
    const matched = findCountry(countryName);

    if (matched) {
      setCountryIso(matched.iso);
      setCountryDialCode(matched.code);
      setTargetDigitLength(matched.digitLength);
    }
  };

  const selectCountryItem = (item: CountryData) => {
    setCountry(item.name);
    setCountryIso(item.iso);
    setCountryDialCode(item.code);
    setTargetDigitLength(item.digitLength);
    setIsCountryPickerOpen(false);
    setCountrySearchQuery("");
  };

  const filteredCountries = ALL_COUNTRIES.filter((c) => {
    if (!countrySearchQuery) return true;
    const q = countrySearchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.includes(q) || c.iso.includes(q);
  });

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Mobile Real-Time Validation Handler (Strict numeric)
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, "").slice(0, targetDigitLength);
    setMobile(digitsOnly);
    if (error) setError("");
  };

  // Email Autocomplete logic
  const emailPrefix = email.includes("@") ? email.split("@")[0] : email;
  const emailDomainPart = email.includes("@") ? email.split("@")[1].toLowerCase() : "";
  const matchingDomains = COMMON_EMAIL_DOMAINS.filter(
    (d) => !emailDomainPart || d.toLowerCase().startsWith(emailDomainPart)
  );
  const showEmailSuggestions =
    isEmailFocused &&
    email.length > 0 &&
    (email.includes("@") || emailPrefix.length >= 2);

  const applyEmailDomain = (domain: string) => {
    setEmail(`${emailPrefix}@${domain}`);
    setIsEmailFocused(false);
  };

  const payloadData = {
    salutation,
    firstName: firstName || "Customer",
    middleName,
    lastName: lastName || "",
    email: email || `${firstName.toLowerCase() || "lead"}.${lastName.toLowerCase() || "user"}@customer.in`,
    mobile: `${countryDialCode} ${mobile || "9876543210"}`,
    address,
    city,
    state,
    country,
    pinCode,
    dob,
    maritalStatus,
    childrenCount,
    residentialStatus,
    purposeOfPurchase,
    customerProfile,
    industryType,
    companyName,
    designation,
    department,
    annualIncome,
    sourceOption,
    channelPartnerName,
    empId,
    referralDetails,
    otherSource,
    livingStatus,
    housingStyle,
    purchaseTimeline,
    budgetRange,
    projectName: "UrbanGaon One, Jagatpura, Jaipur",
    assignedAgentName: "Yudhister Tiwari (Senior Relationship Officer)",
  };

  const customerPreview = generateCustomerWelcomeEmail(payloadData);
  const companyPreview = generateInternalCompanyNotificationEmail(payloadData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const fullName = `${salutation} ${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please provide First and Last Name.");
      return;
    }

    // Strict Mobile Number Check
    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length !== targetDigitLength) {
      setError(`Mobile number for ${country} must be exactly ${targetDigitLength} digits. (Currently entered ${cleanMobile.length} digits)`);
      return;
    }

    if (countryDialCode === "+91" && !/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
      return;
    }

    // Email Check (if entered, must be valid)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address (e.g. rajesh@gmail.com).");
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
        phone: `${countryDialCode} ${cleanMobile}`,
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
        setDispatchedEmails({
          customerTo: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@customer.in`,
          customerSubject: customerPreview.subject,
          companyTo: "yudhister.tiwari@urbangaon.com",
          companySubject: companyPreview.subject,
        });

        if (onSuccess) onSuccess();
      } else {
        setError("Failed to create lead. Please check your inputs.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        ref={printRef}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-5xl lg:max-w-6xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 font-sans"
      >
        {/* Modal Top Action Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <img
              src="/urbangaon-icon.png"
              alt="UrbanGaon"
              className="w-10 h-10 rounded-full object-contain shadow-xs flex-shrink-0"
            />
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading leading-tight">
                UrbanGaon Customer Enquiry Form
              </h2>
              <p className="text-xs text-slate-500">
                Official real estate application with real-time international flag & dial code auto-sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewEmailTab(previewEmailTab ? null : "customer")}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                previewEmailTab
                  ? "bg-[#3B8CFF] text-white border-[#3B8CFF]"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{previewEmailTab ? "Back to Form" : "Preview Emails"}</span>
            </button>

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

        {/* Email Preview Overlay */}
        {previewEmailTab ? (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-[#F8FAFC]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewEmailTab("customer")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    previewEmailTab === "customer"
                      ? "bg-[#3B8CFF] text-white shadow-sm"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>1. Customer Welcome Email ({sourceOption.includes("Channel Partner") ? "Draft-6" : sourceOption.includes("Employee") ? "Draft-4" : sourceOption.includes("Referral") ? "Draft-3" : "Draft-1"})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewEmailTab("company")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    previewEmailTab === "company"
                      ? "bg-[#3B8CFF] text-white shadow-sm"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>2. Company Notification Email (yudhister.tiwari@urbangaon.com)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewEmailTab(null)}
                className="text-xs font-bold text-[#3B8CFF] hover:underline"
              >
                ← Return to Form
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
              <div className="mb-4 pb-3 border-b border-slate-100 text-xs text-slate-500 space-y-1">
                <div><strong>To:</strong> {previewEmailTab === "customer" ? customerPreview.to : companyPreview.to}</div>
                <div><strong>Subject:</strong> {previewEmailTab === "customer" ? customerPreview.subject : companyPreview.subject}</div>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: previewEmailTab === "customer" ? customerPreview.html : companyPreview.html,
                }}
              />
            </div>
          </div>
        ) : (
          /* Scrollable Form Body */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-slate-800 text-xs">
            {/* Header Banner: Centered UrbanGaon & Form Title + Large Right-aligned AXIO Luxury Logo */}
            <div className="pb-5 border-b border-slate-200 relative">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left invisible spacer to ensure exact mathematical center alignment */}
                <div className="hidden sm:block w-48 md:w-56 lg:w-64 flex-shrink-0" />

                {/* Center: Official UrbanGaon Logo & Title */}
                <div className="text-center flex-1 flex flex-col items-center">
                  <img
                    src="/urbangaon-logo.png"
                    alt="UrbanGaon — a perfect balance"
                    className="h-12 sm:h-14 w-auto object-contain mx-auto mb-1"
                  />
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-heading tracking-tight">
                    Customer Enquiry Form
                  </h1>
                  <p className="text-[11px] sm:text-xs text-slate-500 italic mt-0.5">
                    (Please complete this application thoroughly so we can process it as quickly as possible)
                  </p>
                </div>

                {/* Right Side: High-Impact AXIO Luxury Brand Logo */}
                <div className="w-full sm:w-48 md:w-56 lg:w-64 flex-shrink-0 flex items-center justify-center sm:justify-end">
                  <div className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition flex items-center justify-center">
                    <img
                      src="/axio-logo.png"
                      alt="AXIO — An asset with the Class."
                      className="h-14 sm:h-16 md:h-18 lg:h-20 w-auto object-contain max-w-[220px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isSuccess && dispatchedEmails && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Lead Registered & Automated Dual-Emails Dispatched!</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                    <span className="text-emerald-600 font-bold block mb-0.5">✉️ Customer Welcome Email:</span>
                    <div>To: <strong>{dispatchedEmails.customerTo}</strong></div>
                    <div className="text-slate-500 truncate">{dispatchedEmails.customerSubject}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                    <span className="text-blue-600 font-bold block mb-0.5">🏢 Company Notification Email:</span>
                    <div>To: <strong>{dispatchedEmails.companyTo}</strong></div>
                    <div className="text-slate-500 truncate">{dispatchedEmails.companySubject}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 1. PERSONAL / CONTACT DETAILS */}
            <div className="space-y-4">
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

              {/* City, State, Country (with Real-Time Flag & Dial Code Auto-Sync), Pin */}
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

                {/* Real-Time Synced Country Field with Flag Preview */}
                <div className="relative">
                  <label className="block text-[10px] text-slate-400 mb-1 flex items-center justify-between">
                    <span>Country *</span>
                    <span className="text-[10px] text-[#3B8CFF] font-semibold flex items-center gap-1">
                      <CountryFlag iso={countryIso} size="xs" />
                      <span>{countryDialCode}</span>
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 pointer-events-none">
                      <CountryFlag iso={countryIso} size="sm" />
                    </div>
                    <input
                      type="text"
                      list="countries-datalist"
                      value={country}
                      onChange={(e) => syncCountryAndDialCode(e.target.value)}
                      placeholder="e.g. India, UAE, USA"
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                    />
                    <datalist id="countries-datalist">
                      {ALL_COUNTRIES.map((c) => (
                        <option key={c.iso} value={c.name}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </datalist>
                  </div>
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

              {/* Mobile (Real-Time Synced Flag + Strict Validation) & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. AUTO-ASSIGNED COUNTRY FLAG & STRICT DIGIT VALIDATION */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Mobile Number * (Exactly {targetDigitLength} Digits)
                    </label>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition ${
                        mobile.length === targetDigitLength
                          ? "bg-emerald-100 text-emerald-700"
                          : mobile.length > 0
                          ? "bg-amber-100 text-amber-800"
                          : "text-slate-400"
                      }`}
                    >
                      {mobile.length === targetDigitLength
                        ? `✓ ${targetDigitLength}/${targetDigitLength} Digits Complete`
                        : mobile.length > 0
                        ? `${mobile.length}/${targetDigitLength} Digits (Need ${targetDigitLength - mobile.length} more)`
                        : `0/${targetDigitLength} Digits`}
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    {/* Interactive Country Code Pill with Flag Image */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCountryPickerOpen(!isCountryPickerOpen)}
                        className="px-3 py-2 rounded-l-xl bg-[#F8FAFC] hover:bg-slate-100 border border-r-0 border-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition select-none"
                      >
                        <CountryFlag iso={countryIso} size="sm" />
                        <span>{countryDialCode}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </button>

                      {/* Dropdown for quick country selection with search */}
                      {isCountryPickerOpen && (
                        <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-2xl shadow-xl border border-slate-200/90 w-64 max-h-64 overflow-hidden flex flex-col p-1.5 animate-in fade-in">
                          <div className="p-1.5 border-b border-slate-100">
                            <div className="relative flex items-center">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                              <input
                                type="text"
                                autoFocus
                                value={countrySearchQuery}
                                onChange={(e) => setCountrySearchQuery(e.target.value)}
                                placeholder="Search country or code..."
                                className="w-full pl-8 pr-2 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
                            {filteredCountries.map((item) => (
                              <button
                                key={item.iso}
                                type="button"
                                onClick={() => selectCountryItem(item)}
                                className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-[#F0F6FF] hover:text-[#3B8CFF] flex items-center justify-between transition group"
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <CountryFlag iso={item.iso} size="sm" />
                                  <span className="font-medium text-slate-800 group-hover:text-[#3B8CFF] truncate">
                                    {item.name}
                                  </span>
                                </span>
                                <strong className="text-slate-500 font-mono text-[11px] ml-1">{item.code}</strong>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      value={mobile}
                      onChange={handleMobileChange}
                      placeholder={targetDigitLength === 10 ? "9876543210" : "501234567"}
                      maxLength={targetDigitLength}
                      className={`flex-1 px-3 py-2 rounded-r-xl bg-white border font-bold text-xs tracking-widest focus:outline-none focus:ring-2 transition ${
                        mobile.length === targetDigitLength
                          ? "border-emerald-400 text-emerald-950 focus:ring-emerald-400"
                          : mobile.length > 0
                          ? "border-amber-300 text-slate-900 focus:ring-amber-400"
                          : "border-slate-200 text-slate-900 focus:ring-[#3B8CFF]"
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Auto-synced with <strong>{country}</strong> ({countryDialCode}). Enter exactly {targetDigitLength} digits.
                  </p>
                </div>

                {/* 2. AUTO-SUGGESTION EMAIL INPUT */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Email Address *
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Type <strong className="text-[#3B8CFF]">@</strong> for quick domain suggestions
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setIsEmailFocused(false), 200);
                      }}
                      placeholder="rajesh.sharma@gmail.com"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                    />

                    {/* Floating Auto-Suggestion Dropdown */}
                    {showEmailSuggestions && matchingDomains.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                        <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                          Select Domain Suggestion:
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {matchingDomains.map((dom) => (
                            <button
                              key={dom}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                applyEmailDomain(dom);
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-700 hover:bg-[#F0F6FF] hover:text-[#3B8CFF] font-medium flex items-center justify-between transition group"
                            >
                              <span className="truncate">
                                {emailPrefix ? `${emailPrefix}@` : "@"}
                                <strong className="text-slate-900 group-hover:text-[#3B8CFF]">{dom}</strong>
                              </span>
                              <AtSign className="w-3 h-3 text-slate-300 group-hover:text-[#3B8CFF]" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Domain Quick-Pill Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-slate-400">Quick domains:</span>
                    {["gmail.com", "yahoo.com", "outlook.com", "icloud.com"].map((dom) => (
                      <button
                        key={dom}
                        type="button"
                        onClick={() => applyEmailDomain(dom)}
                        className="px-2 py-0.5 rounded-md bg-[#F8FAFC] hover:bg-[#F0F6FF] hover:text-[#3B8CFF] text-[10px] font-semibold text-slate-600 border border-slate-200 transition"
                      >
                        @{dom}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. DEMOGRAPHICS (4 Box Cards matching PDF) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-2">
              {/* Date of Birth */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1.5">
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
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1.5">
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
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1">
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
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1">
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
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Customer Profile:</label>
                <select
                  value={customerProfile}
                  onChange={(e) => setCustomerProfile(e.target.value)}
                  className="w-full sm:max-w-md px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-xs cursor-pointer"
                >
                  <option value="-None-">-None-</option>
                  <option value="Self Employed">Self Employed</option>
                  <option value="Private Service">Private Service</option>
                  <option value="Govt. Service">Govt. Service</option>
                  <option value="Retired">Retired</option>
                  <option value="NRI">NRI</option>
                  <option value="Housewife">Housewife</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {/* 1. Company Name */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Infosys / Self-Practicing"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                  />
                </div>

                {/* 2. Industry Type Dropdown */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Industry Type</label>
                  <select
                    value={industryType}
                    onChange={(e) => setIndustryType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] cursor-pointer"
                  >
                    {INDUSTRY_TYPES_LIST.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Designation Dropdown (45 options) */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Designation</label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] cursor-pointer"
                  >
                    {DESIGNATIONS_LIST.map((des) => (
                      <option key={des} value={des}>
                        {des}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Department */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Engineering / Sales"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Annual Income</label>
                  <select
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-xs cursor-pointer"
                  >
                    <option value="-None-">-None-</option>
                    <option value="Upto 10 Lakhs">Upto 10 Lakhs</option>
                    <option value="10-50 Lakhs">10-50 Lakhs</option>
                    <option value="More than 50 Lakhs">More than 50 Lakhs</option>
                    <option value="Prefer not to disclose">Prefer not to disclose</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. HOW DID YOU FIRST HEAR ABOUT THIS PROJECT */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-3">
              <label className="block text-[11px] font-bold text-slate-900">
                How did you first hear about this Project (Determines automated welcome email draft):
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
                <div className="mt-2">
                  <label className="block text-[10px] text-slate-500 mb-1">Channel Partner Name * (triggers Draft-6 email)</label>
                  <input
                    type="text"
                    value={channelPartnerName}
                    onChange={(e) => setChannelPartnerName(e.target.value)}
                    placeholder="e.g. Horizon Realty Partners"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
              )}
              {sourceOption === "Employee Referral" && (
                <div className="mt-2">
                  <label className="block text-[10px] text-slate-500 mb-1">Employee Referral Emp ID * (triggers Draft-4 email)</label>
                  <input
                    type="text"
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    placeholder="e.g. EMP-9204"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
              )}
              {sourceOption.includes("Referral from") && (
                <div className="mt-2">
                  <label className="block text-[10px] text-slate-500 mb-1">Referral details / Existing Unit / Vendor Name * (triggers Draft-3 email)</label>
                  <input
                    type="text"
                    value={referralDetails}
                    onChange={(e) => setReferralDetails(e.target.value)}
                    placeholder="Referral from friend/family/ Existing Customer unit no. Name..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
              )}
              {sourceOption === "Other" && (
                <div className="mt-2">
                  <label className="block text-[10px] text-slate-500 mb-1">Other source details</label>
                  <input
                    type="text"
                    value={otherSource}
                    onChange={(e) => setOtherSource(e.target.value)}
                    placeholder="Other please specify..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
              )}
            </div>

            {/* 5. HOUSING STYLE, LIVING STATUS, TIMELINES & BUDGET (4 Box Cards matching PDF) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              {/* Current living Status */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
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
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
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
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
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
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
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
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#F0F6FF]/60 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                  <option value="">Auto-Assign / Yudhister Tiwari</option>
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
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                ⚡ Automatically sends customer welcome email + internal company notification on submit.
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending || mobile.length !== targetDigitLength}
                  className="px-6 py-2.5 rounded-xl bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-bold shadow-md shadow-[#3B8CFF]/25 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Customer Enquiry</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
