"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { createLeadAction, updateLeadAction } from "@/actions/leads-actions";
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
  Lock,
  Unlock,
  ShieldCheck,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects?: any[];
  agents?: any[];
  onSuccess?: () => void;
  onLeadSaved?: (lead: any) => void;
  onOpenPipeline?: () => void;
  initialLead?: any | null;
  userRole?: string;
  formType?: "lead" | "customer";
  title?: string;
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

const EMPTY_LIST: any[] = [];

export function UrbanGaonEnquiryModal({
  isOpen,
  onClose,
  projects = EMPTY_LIST,
  agents = EMPTY_LIST,
  onSuccess,
  onLeadSaved,
  onOpenPipeline,
  initialLead = null,
  userRole = "",
  formType = "lead",
  title,
}: Props) {
  const isSuperAdmin = ["SUPERADMIN", "SUPER_ADMIN", "ADMIN"].includes(
    (userRole || "").toUpperCase()
  );
  const [isSuperAdminUnlocked, setIsSuperAdminUnlocked] = useState(false);
  const [lockedFields, setLockedFields] = useState<Set<string>>(new Set());
  const isFieldLocked = (fieldKey: string) =>
    Boolean(initialLead) && !isSuperAdminUnlocked && lockedFields.has(fieldKey);
  const hasLockedFields = Boolean(initialLead) && !isSuperAdminUnlocked && lockedFields.size > 0;

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
  const [residentialStatus, setResidentialStatus] = useState<string>("-None-");
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

  // Real-time Auto-Sync: Prefill all form fields from initialLead whenever opened or lead data changes
  useEffect(() => {
    if (!isOpen) return;

    setIsSuperAdminUnlocked(false);
    setError("");
    setIsSuccess(false);
    setDispatchedEmails(null);
    setPreviewEmailTab(null);

    if (!initialLead) {
      setLockedFields(new Set());
      setSalutation("Mr.");
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setAddress("");
      setCity("Jaipur");
      setState("Rajasthan");
      setCountry("India");
      setPinCode("302006");
      setCountryIso("in");
      setCountryDialCode("+91");
      setTargetDigitLength(10);
      setMobile("");
      setEmail("");
      setDob("");
      setMaritalStatus("Single");
      setChildrenCount("");
      setResidentialStatus("-None-");
      setPurposeOfPurchase("End Use");
      setCustomerProfile("-None-");
      setIndustryType("-None-");
      setCompanyName("");
      setDesignation("-None-");
      setDepartment("");
      setAnnualIncome("-None-");
      setSourceOption("Company website / social media / online search");
      setChannelPartnerName("");
      setEmpId("");
      setReferralDetails("");
      setOtherSource("");
      setLivingStatus("Own");
      setHousingStyle("2/3 BHK");
      setPurchaseTimeline("1-3 Months");
      setBudgetRange("₹50 Lakhs-₹1 Crore");
      setProjectId(projects[0]?.id || "demo-proj-1");
      setAssignedToId("");
      setInitialNote("");
      return;
    }

    // Track which specific fields already have lead-filled data (only these freeze; empty fields remain editable by Sales Team)
    const locked = new Set<string>();

    // 1. Parse Salutation, First, Middle, Last Name
    const rawName = (initialLead.name || "").trim();
    const salMatch = rawName.match(/^(Mr\.|Ms\.|Mrs\.)\s+/i);
    if (salMatch) {
      const normalized = salMatch[1].charAt(0).toUpperCase() + salMatch[1].slice(1).toLowerCase();
      setSalutation((normalized as "Mr." | "Ms." | "Mrs.") || "Mr.");
      locked.add("salutation");
    } else {
      setSalutation("Mr.");
    }
    const cleanName = rawName.replace(/^(Mr\.|Ms\.|Mrs\.)\s+/i, "").trim();
    const nameParts = cleanName.split(/\s+/).filter(Boolean);
    if (nameParts.length === 1) {
      setFirstName(nameParts[0]);
      setMiddleName("");
      setLastName("");
      locked.add("firstName");
    } else if (nameParts.length === 2) {
      setFirstName(nameParts[0]);
      setMiddleName("");
      setLastName(nameParts[1]);
      locked.add("firstName");
      locked.add("lastName");
    } else if (nameParts.length >= 3) {
      setFirstName(nameParts[0]);
      setMiddleName(nameParts.slice(1, -1).join(" "));
      setLastName(nameParts[nameParts.length - 1]);
      locked.add("firstName");
      locked.add("middleName");
      locked.add("lastName");
    } else {
      setFirstName("");
      setMiddleName("");
      setLastName("");
    }

    // 2. Parse Phone & Sync International Country Flag + Dial Code
    const rawPhone = (initialLead.phone || "").trim();
    let matchedCountry = ALL_COUNTRIES.find((c) => c.iso === "in");
    let localDigits = rawPhone.replace(/\D/g, "");
    if (rawPhone.startsWith("+")) {
      const sortedByCodeLen = [...ALL_COUNTRIES].sort((a, b) => b.code.length - a.code.length);
      const found = sortedByCodeLen.find((c) => rawPhone.startsWith(c.code));
      if (found) {
        matchedCountry = found;
        const codeDigits = found.code.replace(/\D/g, "");
        localDigits = rawPhone.replace(/\D/g, "").slice(codeDigits.length);
      }
    } else if (localDigits.length > 10 && localDigits.startsWith("91")) {
      localDigits = localDigits.slice(2);
    }
    if (matchedCountry) {
      setCountry(matchedCountry.name);
      setCountryIso(matchedCountry.iso);
      setCountryDialCode(matchedCountry.code);
      setTargetDigitLength(matchedCountry.digitLength);
      setMobile(localDigits.slice(0, matchedCountry.digitLength));
    } else {
      setMobile(localDigits.slice(0, 10));
    }
    if (localDigits.length > 0) {
      locked.add("mobile");
      locked.add("country");
    }

    // 3. Email
    setEmail(initialLead.email || "");
    if ((initialLead.email || "").trim()) {
      locked.add("email");
    }

    // 4. Budget Range
    const bMax = Number(initialLead.budgetMax || 0);
    const bMin = Number(initialLead.budgetMin || 0);
    if (bMax > 10000000 || bMin >= 10000000) {
      setBudgetRange(">₹1 Crore");
      locked.add("budgetRange");
    } else if (bMax > 5000000 || bMin >= 5000000) {
      setBudgetRange("₹50 Lakhs-₹1 Crore");
      locked.add("budgetRange");
    } else if (bMax > 0 || bMin > 0) {
      setBudgetRange("<₹50 Lakhs");
      locked.add("budgetRange");
    } else {
      setBudgetRange("₹50 Lakhs-₹1 Crore");
    }

    // 5. Housing Style
    const iType = (initialLead.interestedType || "").toLowerCase();
    if (iType.includes("plot")) {
      setHousingStyle("Plot");
      locked.add("housingStyle");
    } else if (iType.includes("serviced")) {
      setHousingStyle("Serviced Apartment");
      locked.add("housingStyle");
    } else if (iType.trim()) {
      setHousingStyle("2/3 BHK");
      locked.add("housingStyle");
    } else {
      setHousingStyle("2/3 BHK");
    }

    // 6. Purchase Timeline from Priority
    const prio = (initialLead.priority || "").toUpperCase();
    if (prio === "HOT") {
      setPurchaseTimeline("With in 1 Month");
      locked.add("purchaseTimeline");
    } else if (prio === "HIGH" || prio === "WARM") {
      setPurchaseTimeline("1-3 Months");
      locked.add("purchaseTimeline");
    } else if (prio) {
      setPurchaseTimeline("6-12 Months");
      locked.add("purchaseTimeline");
    } else {
      setPurchaseTimeline("1-3 Months");
    }

    // 7. Source of Enquiry Mapping
    const rawSrc = (initialLead.source || "").trim();
    const srcLower = rawSrc.toLowerCase();
    setChannelPartnerName("");
    setEmpId("");
    setReferralDetails("");
    setOtherSource("");

    if (rawSrc) {
      locked.add("sourceOption");
      if (srcLower.includes("channel partner")) {
        setSourceOption("Channel Partner");
        const parts = rawSrc.split(":");
        if (parts[1]?.trim()) {
          setChannelPartnerName(parts.slice(1).join(":").trim());
          locked.add("channelPartnerName");
        }
      } else if (srcLower.includes("employee referral")) {
        setSourceOption("Employee Referral");
        const idMatch = rawSrc.match(/ID:\s*([^)]+)/i);
        if (idMatch?.[1]?.trim()) {
          setEmpId(idMatch[1].trim());
          locked.add("empId");
        }
      } else if (srcLower.includes("referral")) {
        setSourceOption("Referral from friend/family/ Existing Customer");
        const parts = rawSrc.split(":");
        if (parts[1]?.trim()) {
          setReferralDetails(parts.slice(1).join(":").trim());
          locked.add("referralDetails");
        }
      } else if (srcLower.includes("portal") || srcLower.includes("magic") || srcLower.includes("99acres")) {
        setSourceOption("Real estate portal (e.g., Magic Bricks, 99acres)");
      } else if (srcLower.includes("newspaper") || srcLower.includes("magazine")) {
        setSourceOption("Newspaper/magazine ad");
      } else if (srcLower.includes("hoarding") || srcLower.includes("billboard")) {
        setSourceOption("Hoarding/billboard");
      } else if (srcLower.includes("whatsapp") || srcLower.includes("sms") || srcLower.includes("email")) {
        setSourceOption("Email/SMS/ Whats app campaign");
      } else if (srcLower.includes("event") || srcLower.includes("exhibition") || srcLower.includes("walk")) {
        setSourceOption("Event/Exhibition");
      } else if (srcLower.startsWith("other")) {
        setSourceOption("Other");
        const parts = rawSrc.split(":");
        if (parts[1]?.trim()) {
          setOtherSource(parts.slice(1).join(":").trim());
          locked.add("otherSource");
        }
      } else {
        setSourceOption("Company website / social media / online search");
      }
    } else {
      setSourceOption("Company website / social media / online search");
    }

    // 8. Project & Assigned Sales Executive Matching
    const matchedProj =
      projects.find((p) => p.id === initialLead.projectId) ||
      projects.find((p) => p.name?.toLowerCase() === initialLead.project?.name?.toLowerCase());
    setProjectId(matchedProj?.id || initialLead.projectId || projects[0]?.id || "demo-proj-1");
    if (matchedProj?.id || initialLead.projectId || initialLead.project?.name) {
      locked.add("projectId");
    }

    const matchedAgent =
      agents.find((a) => a.id === initialLead.assignedToId) ||
      agents.find((a) => a.name?.toLowerCase() === initialLead.assignedTo?.name?.toLowerCase());
    setAssignedToId(matchedAgent?.id || initialLead.assignedToId || "");
    if (matchedAgent?.id || initialLead.assignedToId || initialLead.assignedTo?.name) {
      locked.add("assignedToId");
    }

    // 9. Restore Extended Form Details from Latest Structured Activity Note (only freeze fields that were actually filled)
    setAddress("");
    setCity("Jaipur");
    setState("Rajasthan");
    setPinCode("302006");
    setDob("");
    setMaritalStatus("Single");
    setChildrenCount("");
    setResidentialStatus("-None-");
    setPurposeOfPurchase("End Use");
    setCustomerProfile("-None-");
    setIndustryType("-None-");
    setCompanyName("");
    setDesignation("-None-");
    setDepartment("");
    setAnnualIncome("-None-");
    setLivingStatus("Own");
    setInitialNote("");

    const structuredAct = (initialLead.activities || []).find(
      (a: any) =>
        typeof a.notes === "string" &&
        (a.notes.includes("[UrbanGaon Customer Enquiry Form") || a.notes.includes("- Correspondence:"))
    );
    if (structuredAct?.notes) {
      const n: string = structuredAct.notes;
      const corrMatch = n.match(/- Correspondence:\s*(.*)/);
      if (corrMatch) {
        const [addrPart, pinPart] = corrMatch[1].split(" - ");
        if (pinPart?.trim()) {
          setPinCode(pinPart.trim());
          locked.add("pinCode");
        }
        const segs = (addrPart || "").split(",").map((s) => s.trim());
        if (segs.length >= 4) {
          const parsedAddr = segs.slice(0, -3).join(", ").trim();
          const parsedCity = segs[segs.length - 3]?.trim();
          const parsedState = segs[segs.length - 2]?.trim();
          if (parsedAddr) {
            setAddress(parsedAddr);
            locked.add("address");
          }
          if (parsedCity) {
            setCity(parsedCity);
            locked.add("city");
          }
          if (parsedState) {
            setState(parsedState);
            locked.add("state");
          }
        } else if (segs[0]) {
          setAddress(segs[0]);
          locked.add("address");
        }
      }
      const profMatch = n.match(/- Profile:\s*([^|]+)\|\s*([^@]+)@\s*([^(|]+)(?:\(([^)]*)\))?\s*\|\s*Income:\s*(.*)/);
      if (profMatch) {
        const pProf = profMatch[1]?.trim();
        const pDes = profMatch[2]?.trim();
        const pComp = profMatch[3]?.trim();
        const pDept = profMatch[4]?.trim();
        const pInc = profMatch[5]?.trim();
        if (pProf && pProf !== "-None-") {
          setCustomerProfile(pProf);
          locked.add("customerProfile");
        }
        if (pDes && pDes !== "-None-") {
          setDesignation(pDes);
          locked.add("designation");
        }
        if (pComp) {
          setCompanyName(pComp);
          locked.add("companyName");
        }
        if (pDept) {
          setDepartment(pDept);
          locked.add("department");
        }
        if (pInc && pInc !== "N/A" && pInc !== "-None-") {
          setAnnualIncome(pInc);
          locked.add("annualIncome");
        }
      }
      const housingMatch = n.match(/Purpose:\s*([^|]+)\|\s*Timeline:\s*([^|]+)/);
      if (housingMatch) {
        const purp = housingMatch[1].trim();
        if (purp === "Investment" || purp === "End Use") {
          setPurposeOfPurchase(purp);
          locked.add("purposeOfPurchase");
        }
        const tl = housingMatch[2].trim();
        if (tl === "With in 1 Month" || tl === "1-3 Months" || tl === "6-12 Months") {
          setPurchaseTimeline(tl);
          locked.add("purchaseTimeline");
        }
      }
      const resMatch = n.match(/- Residential Status:\s*([^|]+)\|\s*Living:\s*([^|]+)\|\s*Marital:\s*([^(]+)(?:\((\d+)\s*children\))?/);
      if (resMatch) {
        const pRes = resMatch[1]?.trim();
        if (pRes && pRes !== "-None-") {
          setResidentialStatus(pRes);
          locked.add("residentialStatus");
        }
        const liv = resMatch[2]?.trim();
        if (liv === "Own" || liv === "Rent") {
          setLivingStatus(liv);
          locked.add("livingStatus");
        }
        const mar = resMatch[3]?.trim();
        if (mar === "Single" || mar === "Married") {
          setMaritalStatus(mar);
          locked.add("maritalStatus");
        }
        if (resMatch[4] && Number(resMatch[4]) > 0) {
          setChildrenCount(resMatch[4]);
          locked.add("childrenCount");
        }
      }
    }

    setLockedFields(locked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialLead?.id, initialLead?.updatedAt, initialLead?.activities?.length]);

  // Real-time Country & Dial Code Auto-Sync Function
  const syncCountryAndDialCode = (countryName: string) => {
    if (isFieldLocked("country")) return;
    setCountry(countryName);
    const matched = findCountry(countryName);

    if (matched) {
      setCountryIso(matched.iso);
      setCountryDialCode(matched.code);
      setTargetDigitLength(matched.digitLength);
    }
  };

  const selectCountryItem = (item: CountryData) => {
    if (isFieldLocked("country") || isFieldLocked("mobile")) return;
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
    if (isFieldLocked("mobile")) return;
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
    !isFieldLocked("email") &&
    isEmailFocused &&
    email.length > 0 &&
    (email.includes("@") || emailPrefix.length >= 2);

  const applyEmailDomain = (domain: string) => {
    if (isFieldLocked("email")) return;
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
[UrbanGaon Customer Enquiry Form ${initialLead ? "Updated" : "Captured"}]
- Correspondence: ${address}, ${city}, ${state}, ${country} - ${pinCode}
- Profile: ${customerProfile} | ${designation} @ ${companyName} (${department}) | Income: ${annualIncome || "N/A"}
- Housing: Style: ${housingStyle} | Purpose: ${purposeOfPurchase} | Timeline: ${purchaseTimeline} | Budget: ${budgetRange}
- Residential Status: ${residentialStatus} | Living: ${livingStatus} | Marital: ${maritalStatus} (${childrenCount ? childrenCount + " children" : "0 children"})
- Notes: ${initialNote || (initialLead ? "Lead enquiry profile updated and synced." : "Enquiry submitted via official customer form.")}
      `.trim();

      const resolvedProject = projects.find((p) => p.id === (projectId || defaultProjId));
      const resolvedAgent = agents.find((a) => a.id === assignedToId);

      if (initialLead) {
        const res = await updateLeadAction(initialLead.id, {
          projectId: projectId || defaultProjId,
          name: fullName,
          phone: `${countryDialCode} ${cleanMobile}`,
          email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@customer.in`,
          source: sourceLabel,
          interestedType: housingStyle,
          budgetMin: bMin,
          budgetMax: bMax,
          priority: purchaseTimeline === "With in 1 Month" ? "HOT" : "MEDIUM",
          assignedToId: assignedToId || undefined,
          initialNote: noteContent,
        });

        if (res.success) {
          const syncedLead = {
            ...initialLead,
            ...res.lead,
            name: fullName,
            phone: `${countryDialCode} ${cleanMobile}`,
            email: email || initialLead.email,
            source: sourceLabel,
            interestedType: housingStyle,
            budgetMin: bMin,
            budgetMax: bMax,
            priority: purchaseTimeline === "With in 1 Month" ? "HOT" : "MEDIUM",
            projectId: projectId || initialLead.projectId,
            project: resolvedProject || initialLead.project,
            assignedToId: assignedToId || initialLead.assignedToId,
            assignedTo: resolvedAgent || initialLead.assignedTo,
            activities: [
              {
                id: `act-${Date.now()}`,
                type: "NOTE",
                title: "Customer Enquiry Form Updated",
                notes: noteContent,
                createdAt: new Date().toISOString(),
              },
              ...(initialLead.activities || []),
            ],
          };
          setIsSuccess(true);
          setIsSuperAdminUnlocked(false);
          setDispatchedEmails(null);
          if (onLeadSaved) onLeadSaved(syncedLead);
          if (onSuccess) onSuccess();
        } else {
          setError((res as any).error || "Failed to update lead. Only SuperAdmin can edit synced lead details.");
        }
        return;
      }

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

        if (onLeadSaved && res.lead) onLeadSaved(res.lead);
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
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <img
              src="/urbangaon-icon.png"
              alt="UrbanGaon"
              className="w-10 h-10 rounded-full object-contain shadow-xs flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 font-heading leading-tight">
                  {title || (formType === "customer" ? "UrbanGaon Customer Registration Form" : "UrbanGaon Customer Enquiry Form")}
                </h2>
                {initialLead && (
                  <>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Auto-Synced • {initialLead.name}
                    </span>
                    {hasLockedFields ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Lock className="w-2.5 h-2.5" />
                        Filled Fields Frozen • Missing Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Unlock className="w-2.5 h-2.5" />
                        SuperAdmin Full Edit Mode
                      </span>
                    )}
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {initialLead
                  ? `Real-time prefilled lead enquiry form (${initialLead.project?.name || "UrbanGaon One"} • ${initialLead.status || "NEW"})`
                  : formType === "customer"
                  ? "Official customer onboarding form with real-time international flag & dial code auto-sync"
                  : "Official real estate application with real-time international flag & dial code auto-sync"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {initialLead && onOpenPipeline && (
              <button
                type="button"
                onClick={onOpenPipeline}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#3B8CFF]" />
                <span>Pipeline & Timeline</span>
              </button>
            )}
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
          <div className="p-4 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-[#F8FAFC]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
              <div className="flex flex-wrap items-center gap-2">
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
          <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 overflow-y-auto flex-1 text-slate-800 text-xs pb-safe">
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

            {isSuccess && !dispatchedEmails && initialLead && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Lead Enquiry Profile Updated & Synced in Real Time!</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Done
                </button>
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

            {/* SuperAdmin Freeze / Sales Enrichment Security Banner */}
            {initialLead && (
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  hasLockedFields
                    ? "bg-amber-50/80 border-amber-200 text-amber-950"
                    : "bg-blue-50/80 border-blue-200 text-blue-950"
                }`}
              >
                <div className="flex items-start sm:items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      hasLockedFields ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {hasLockedFields ? <Lock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      {hasLockedFields
                        ? "Lead-Filled Details Frozen • Unfilled Fields Open for Sales Team"
                        : "SuperAdmin Full Edit Mode Active"}
                    </div>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      {hasLockedFields
                        ? isSuperAdmin
                          ? "Details already synced from the lead are frozen (shaded). Any empty fields can be filled by the sales team, or unlock all fields with your SuperAdmin right."
                          : "Details already filled by the lead are frozen and locked (SuperAdmin only). You can fill in any remaining empty details and save them to the CRM."
                        : "All fields are unlocked via SuperAdmin privilege. Save your changes or re-lock filled fields when finished."}
                    </p>
                  </div>
                </div>

                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuperAdminUnlocked((prev) => !prev);
                      setError("");
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer flex-shrink-0 self-start sm:self-center ${
                      hasLockedFields
                        ? "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                        : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-300"
                    }`}
                  >
                    {hasLockedFields ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unlock All (SuperAdmin)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Freeze Filled Fields</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* 1. PERSONAL / CONTACT DETAILS */}
            <div className="space-y-6 [&_input:disabled]:bg-slate-100/90 [&_input:disabled]:text-slate-600 [&_input:disabled]:cursor-not-allowed [&_select:disabled]:bg-slate-100/90 [&_select:disabled]:text-slate-600 [&_select:disabled]:cursor-not-allowed [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-60">
            <div className="space-y-4">
              {/* Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Name: Mr./Ms./Mrs.
                  </label>
                  <select
                    value={salutation}
                    disabled={isFieldLocked("salutation")}
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
                    disabled={isFieldLocked("firstName")}
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
                    disabled={isFieldLocked("middleName")}
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
                    disabled={isFieldLocked("lastName")}
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
                  disabled={isFieldLocked("address")}
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
                    disabled={isFieldLocked("city")}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">State</label>
                  <input
                    type="text"
                    disabled={isFieldLocked("state")}
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
                      disabled={isFieldLocked("country")}
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
                    disabled={isFieldLocked("pinCode")}
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
                        disabled={isFieldLocked("mobile") || isFieldLocked("country")}
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
                      disabled={isFieldLocked("mobile")}
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
                      disabled={isFieldLocked("email")}
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
                        disabled={isFieldLocked("email")}
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
                  disabled={isFieldLocked("dob")}
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
                      disabled={isFieldLocked("maritalStatus")}
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
                      disabled={isFieldLocked("maritalStatus")}
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
                    disabled={isFieldLocked("childrenCount")}
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(e.target.value)}
                    placeholder="If married, No. of Children..."
                    className="w-full px-2 py-1 text-[11px] rounded bg-white border border-slate-200"
                  />
                )}
              </div>

              {/* Residential Status Dropdown */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">Residential Status</label>
                <select
                  disabled={isFieldLocked("residentialStatus")}
                  value={residentialStatus}
                  onChange={(e) => setResidentialStatus(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] cursor-pointer"
                >
                  <option value="-None-">-None-</option>
                  <option value="Resident">Resident</option>
                  <option value="Non-Resident">Non-Resident</option>
                  <option value="Foreign National of Indian Origin">Foreign National of Indian Origin</option>
                </select>
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
                        disabled={isFieldLocked("purposeOfPurchase")}
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
                  disabled={isFieldLocked("customerProfile")}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
                {/* 1. Company Name */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Company Name</label>
                  <input
                    type="text"
                    disabled={isFieldLocked("companyName")}
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
                    disabled={isFieldLocked("industryType")}
                    value={industryType}
                    onChange={(e) => setIndustryType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] cursor-pointer truncate"
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
                    disabled={isFieldLocked("designation")}
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] cursor-pointer truncate"
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
                    disabled={isFieldLocked("department")}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Engineering / Sales"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#3B8CFF]"
                  />
                </div>

                {/* 5. Annual Income Dropdown (Equally sized compact column) */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Annual Income</label>
                  <select
                    disabled={isFieldLocked("annualIncome")}
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-xs cursor-pointer truncate"
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
                      disabled={isFieldLocked("sourceOption")}
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
                    disabled={isFieldLocked("channelPartnerName")}
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
                    disabled={isFieldLocked("empId")}
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
                    disabled={isFieldLocked("referralDetails")}
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
                    disabled={isFieldLocked("otherSource")}
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
                        disabled={isFieldLocked("livingStatus")}
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
                        disabled={isFieldLocked("housingStyle")}
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
                        disabled={isFieldLocked("purchaseTimeline")}
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
                        disabled={isFieldLocked("budgetRange")}
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
                  disabled={isFieldLocked("projectId")}
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
                  disabled={isFieldLocked("assignedToId")}
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

            </div>

            {/* Official Footer matching PDF */}
            <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 leading-relaxed">
              <strong>UrbanGaon</strong>, 2nd Floor, 74A, Sawai Pratap Singh Road, Near CM House, Opp. Loharu House, Gaurav Nagar, Civil lines, Jaipur, PIN: 302006, Rajasthan, India.
            </div>

            {/* Actions Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                {hasLockedFields ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>
                      Lead-filled fields are frozen (SuperAdmin only). Unfilled fields can be completed and saved by the sales team.
                    </span>
                  </>
                ) : initialLead ? (
                  "⚡ SuperAdmin Mode: Changes save directly to MongoDB and sync in real time across Leads & Pipeline."
                ) : (
                  "⚡ Automatically sends customer welcome email + internal company notification on submit."
                )}
              </span>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending || mobile.length !== targetDigitLength}
                  className="px-6 py-2.5 rounded-xl bg-[#3B8CFF] hover:bg-[#2570E8] text-white font-bold shadow-md shadow-[#3B8CFF]/25 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {initialLead
                          ? hasLockedFields
                            ? "Save Missing Details"
                            : "Save & Sync Lead Profile"
                          : formType === "customer"
                          ? "Register & Save Customer"
                          : "Submit Customer Enquiry"}
                      </span>
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
