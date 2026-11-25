import { prisma } from "@/lib/prisma";
import { invalidateCache } from "@/lib/cache";
import { revalidatePath } from "next/cache";
import { sendLeadEnquiryEmails } from "@/lib/email-service";

export interface WebsiteInquiryPayload {
  salutation?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  name?: string;
  country?: string;
  dialCode?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  purposeOfPurchase?: string;
  desiredHousingStyle?: string;
  interestedType?: string;
  timeline?: string;
  purchaseTimeline?: string;
  budgetRange?: string;
  referralSource?: string;
  channelPartnerName?: string;
  empId?: string;
  referralDetails?: string;
  otherSourceDetails?: string;
  message?: string;
  consentGiven?: boolean;
  website?: string; // honeypot
  projectName?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
}

export function parseBudgetRange(budgetRange?: string): { budgetMin: number; budgetMax: number } {
  const b = (budgetRange || "").trim();
  if (b.includes("<") || b.includes("Under") || b.toLowerCase().includes("below 50")) {
    return { budgetMin: 2500000, budgetMax: 5000000 };
  }
  if (b.includes(">") || b.toLowerCase().includes("above 1") || b.toLowerCase().includes("more than 1")) {
    return { budgetMin: 10000000, budgetMax: 25000000 };
  }
  return { budgetMin: 5000000, budgetMax: 10000000 };
}

export function parsePriorityFromTimeline(timeline?: string): string {
  const t = (timeline || "").toLowerCase();
  if (t.includes("1 month") || t.includes("immediate") || t.includes("within 1")) {
    return "HOT";
  }
  if (t.includes("1-3") || t.includes("3 month")) {
    return "HIGH";
  }
  return "MEDIUM";
}

async function resolveDefaultOrgAndProject() {
  let organization = await prisma.organization.findFirst();
  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: "UrbanGaon",
        slug: "urbangaon",
        reraNo: "RAJ/RERA/2026/001",
      },
    });
  }

  let project = await prisma.project.findFirst({
    where: { organizationId: organization.id },
  });
  if (!project) {
    project = await prisma.project.create({
      data: {
        organizationId: organization.id,
        name: "UrbanGaon One",
        code: "UG1",
        location: "Jagatpura, Jaipur",
        city: "Jaipur",
        reraNumber: "RAJ/RERA/2026/001",
        totalUnits: 24,
        status: "Under Construction",
      },
    });
  }

  const defaultAgent =
    (await prisma.user.findFirst({
      where: { organizationId: organization.id, role: "SALES_AGENT" },
    })) ||
    (await prisma.user.findFirst({
      where: { organizationId: organization.id },
    }));

  return { organization, project, defaultAgent };
}

/**
 * Ingests a contact form submission from https://client-inky-xi.vercel.app/
 * into the CRM Lead module with source strictly set to "Website".
 */
export async function ingestWebsiteInquiry(
  payload: WebsiteInquiryPayload,
  options?: { sendEmails?: boolean; skipIfDuplicate?: boolean }
) {
  // Honeypot spam protection
  if (payload.website && String(payload.website).trim().length > 0) {
    return { success: true, ignored: true, message: "Submission accepted." };
  }

  const salutation = (payload.salutation || "Mr.").trim();
  const firstName = (payload.firstName || "").trim();
  const middleName = (payload.middleName || "").trim();
  const lastName = (payload.lastName || "").trim();

  const fullName =
    (payload.name || "").trim() ||
    [salutation, firstName, middleName, lastName].filter(Boolean).join(" ").trim();

  const rawPhone = String(payload.phone || payload.mobile || "").trim();
  const cleanDigits = rawPhone.replace(/\D/g, "");
  const dialCode = (payload.dialCode || "+91").trim();
  const formattedPhone = rawPhone.startsWith("+")
    ? rawPhone
    : cleanDigits
    ? `${dialCode} ${cleanDigits}`
    : "";

  const email = (payload.email || "").trim().toLowerCase();

  if (!fullName || !formattedPhone || !email) {
    return {
      success: false,
      error: "Name, phone number, and email address are required.",
    };
  }

  const { organization, project, defaultAgent } = await resolveDefaultOrgAndProject();

  if (options?.skipIfDuplicate) {
    const existing = await prisma.lead.findFirst({
      where: {
        organizationId: organization.id,
        OR: [
          { email, source: "Website" },
          { phone: formattedPhone, source: "Website" },
        ],
      },
    });
    if (existing) {
      return { success: true, duplicate: true, lead: existing };
    }
  }

  const housingStyle = (payload.desiredHousingStyle || payload.interestedType || "2/3 BHK").trim();
  const timeline = (payload.timeline || payload.purchaseTimeline || "1-3 Months").trim();
  const budgetRange = (payload.budgetRange || "₹50 Lakhs-₹1 Crore").trim();
  const purposeOfPurchase = (payload.purposeOfPurchase || "End Use").trim();
  const { budgetMin, budgetMax } = parseBudgetRange(budgetRange);
  const priority = parsePriorityFromTimeline(timeline);

  const country = (payload.country || "India").trim();
  const city = (payload.city || "Jaipur").trim();
  const state = (payload.state || "Rajasthan").trim();
  const pinCode = (payload.pinCode || "302006").trim();
  const address = (payload.address || "").trim();

  const referralMeta = [
    payload.referralSource ? `Form Selection: ${payload.referralSource}` : "",
    payload.channelPartnerName ? `Channel Partner: ${payload.channelPartnerName}` : "",
    payload.empId ? `Emp ID: ${payload.empId}` : "",
    payload.referralDetails ? `Referral: ${payload.referralDetails}` : "",
    payload.otherSourceDetails ? `Other: ${payload.otherSourceDetails}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  // Structured note compatible with UrbanGaonEnquiryModal auto-prefill & field-level freeze
  const structuredNote = `
[UrbanGaon Customer Enquiry Form Captured - Website]
- Correspondence: ${address}, ${city}, ${state}, ${country} - ${pinCode}
- Profile: -None- | -None- @  () | Income: N/A
- Housing: Style: ${housingStyle} | Purpose: ${purposeOfPurchase} | Timeline: ${timeline} | Budget: ${budgetRange}
- Residential Status: -None- | Living: Own | Marital: Single (0 children)
- Notes: ${payload.message?.trim() || "Submitted via UrbanGaon × AXIO Website Contact Form (https://client-inky-xi.vercel.app/)."}${referralMeta ? ` [${referralMeta}]` : ""}
  `.trim();

  // Strictly enforce source: "Website" per CRM policy
  const lead = await prisma.lead.create({
    data: {
      organizationId: organization.id,
      projectId: project.id,
      name: fullName,
      phone: formattedPhone,
      email,
      source: "Website",
      status: "NEW",
      interestedType: housingStyle,
      budgetMin,
      budgetMax,
      priority,
      assignedToId: defaultAgent?.id || null,
    },
    include: {
      project: true,
      assignedTo: true,
      activities: true,
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      type: "NOTE",
      title: "Website Contact Form Enquiry Received",
      notes: structuredNote,
      performedById: defaultAgent?.id || null,
    },
  });

  if (options?.sendEmails !== false) {
    try {
      await sendLeadEnquiryEmails({
        salutation,
        firstName: firstName || fullName.split(" ")[0] || fullName,
        lastName: lastName || fullName.split(" ").slice(1).join(" ") || "",
        email,
        mobile: formattedPhone,
        sourceOption: "Website",
        housingStyle,
        budgetRange,
        projectName: project.name || "UrbanGaon One",
        assignedAgentName: defaultAgent?.name || "Yudhister Tiwari",
      });
    } catch (emailErr) {
      console.warn("Website lead email dispatch failed (non-blocking):", emailErr);
    }
  }

  invalidateCache("leads");
  invalidateCache("dashboard");
  invalidateCache("customers");
  try {
    revalidatePath("/leads");
    revalidatePath("/customers");
    revalidatePath("/calls");
    revalidatePath("/dashboard");
  } catch {
    // Safe when called outside a Next.js request context
  }

  return { success: true, lead };
}

/**
 * Automatically imports any new documents written directly to the shared
 * MongoDB `inquiries` collection (by the Contact-form MERN backend) into
 * the CRM Lead collection with source strictly set to "Website".
 */
export async function syncExternalWebsiteInquiries(): Promise<number> {
  try {
    const rawResult: any = await prisma.$runCommandRaw({
      find: "inquiries",
      sort: { createdAt: -1 },
      limit: 50,
    });

    const docs: any[] = rawResult?.cursor?.firstBatch || [];
    if (!Array.isArray(docs) || docs.length === 0) return 0;

    let syncedCount = 0;
    for (const doc of docs) {
      const res = await ingestWebsiteInquiry(
        {
          salutation: doc.salutation,
          firstName: doc.firstName,
          middleName: doc.middleName,
          lastName: doc.lastName,
          name: doc.name || doc.fullName,
          country: doc.country,
          dialCode: doc.dialCode,
          phone: doc.phone || doc.mobile,
          email: doc.email,
          purposeOfPurchase: doc.purposeOfPurchase,
          desiredHousingStyle: doc.desiredHousingStyle || doc.housingStyle,
          timeline: doc.timeline || doc.purchaseTimeline,
          budgetRange: doc.budgetRange,
          referralSource: doc.referralSource,
          channelPartnerName: doc.channelPartnerName,
          empId: doc.empId,
          referralDetails: doc.referralDetails,
          otherSourceDetails: doc.otherSourceDetails,
          message: doc.message,
          address: doc.address,
          city: doc.city,
          state: doc.state,
          pinCode: doc.pinCode,
        },
        { sendEmails: false, skipIfDuplicate: true }
      );
      if (res.success && !res.duplicate && !res.ignored) {
        syncedCount++;
      }
    }
    return syncedCount;
  } catch {
    // Collection may not exist or DB may be unreachable — fail silently
    return 0;
  }
}
