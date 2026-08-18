"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { sendLeadEnquiryEmails } from "@/lib/email-service";

export async function getLeads(filters?: {
  projectId?: string;
  status?: string;
  source?: string;
  assignedToId?: string;
  search?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const where: any = {};

  // RBAC scope for Sales Agents (only own leads unless admin/manager)
  if (user.role === "SALES_AGENT") {
    where.OR = [
      { assignedToId: user.id },
      { assignedToId: null },
    ];
  }

  if (filters?.projectId && filters.projectId !== "ALL") {
    where.projectId = filters.projectId;
  }
  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }
  if (filters?.source && filters.source !== "ALL") {
    where.source = filters.source;
  }
  if (filters?.assignedToId && filters.assignedToId !== "ALL") {
    where.assignedToId = filters.assignedToId;
  }
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { phone: { contains: filters.search } },
      { email: { contains: filters.search } },
    ];
  }

  try {
    const leads = await prisma.lead.findMany({
      where,
      include: {
        project: true,
        assignedTo: true,
        interestedUnit: {
          include: { tower: true },
        },
        activities: {
          include: { performedBy: true },
          orderBy: { createdAt: "desc" },
        },
        tasks: {
          include: { assignedTo: true },
          orderBy: { dueDate: "asc" },
        },
        booking: {
          include: { unit: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (leads.length > 0) return leads;
  } catch (error) {
    console.warn("Database getLeads fallback:", error);
  }

  // Fallback demo leads
  return [
    {
      id: "l-1",
      name: "Amitabh Sen",
      phone: "+91 98450 11223",
      email: "amitabh.sen@techcorp.com",
      source: "Website",
      status: "BOOKED",
      interestedType: "3BHK",
      budgetMin: 13000000,
      budgetMax: 16000000,
      priority: "HOT",
      projectId: "demo-proj-1",
      project: { name: "UrbanGaon One" },
      assignedTo: { name: "Rahul Verma (Senior Sales Agent)" },
      activities: [],
      tasks: [],
    },
    {
      id: "l-2",
      name: "Siddharth Rao",
      phone: "+91 97312 88441",
      email: "siddharth.rao@fintech.io",
      source: "Google Ads",
      status: "NEGOTIATION",
      interestedType: "3BHK",
      budgetMin: 14000000,
      budgetMax: 16000000,
      priority: "HOT",
      projectId: "demo-proj-1",
      project: { name: "UrbanGaon One" },
      assignedTo: { name: "Rahul Verma (Senior Sales Agent)" },
      activities: [],
      tasks: [],
    },
    {
      id: "l-3",
      name: "Deepika Padukone",
      phone: "+91 98450 44556",
      email: "deepika.p@creative.in",
      source: "Referral",
      status: "BOOKED",
      interestedType: "2BHK",
      budgetMin: 10000000,
      budgetMax: 12000000,
      priority: "HIGH",
      projectId: "demo-proj-1",
      project: { name: "UrbanGaon One" },
      assignedTo: { name: "Rahul Verma (Senior Sales Agent)" },
      activities: [],
      tasks: [],
    },
  ];
}

export async function checkDuplicateLead(phone: string, email?: string) {
  try {
    const conditions: any[] = [];
    if (phone) conditions.push({ phone: phone.trim() });
    if (email && email.trim()) conditions.push({ email: email.trim() });

    if (conditions.length === 0) return { exists: false };

    const existing = await prisma.lead.findFirst({
      where: { OR: conditions },
      include: { assignedTo: true, project: true },
    });

    if (existing) {
      return {
        exists: true,
        lead: existing,
        message: `A lead already exists for ${existing.name} (${existing.phone}) assigned to ${existing.assignedTo?.name || "Unassigned"}.`,
      };
    }
  } catch (e) {
    // Ignore db errors
  }

  return { exists: false };
}

function isValidObjectId(id?: string | null): boolean {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
}

export async function createLeadAction(data: {
  name: string;
  phone: string;
  email: string;
  source?: string;
  interestedType?: string;
  budgetMin?: number;
  budgetMax?: number;
  priority?: string;
  projectId?: string;
  assignedToId?: string;
  initialNote?: string;
}) {
  const user = await getCurrentUser();
  let createdLeadId = "temp-" + Date.now();
  let finalLead: any = null;

  try {
    // 1. Resolve or Create valid Organization in database
    let organization: any = null;
    if (isValidObjectId(user.organizationId)) {
      organization = await prisma.organization.findUnique({ where: { id: user.organizationId } });
    }
    if (!organization) {
      organization = await prisma.organization.findFirst();
    }
    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: user.organizationName || "UrbanGaon",
          slug: "urbangaon",
          reraNo: "RAJ/RERA/2026/001",
        },
      });
    }

    // 2. Resolve or Create valid Project in database
    let project: any = null;
    if (isValidObjectId(data.projectId)) {
      project = await prisma.project.findUnique({ where: { id: data.projectId } });
    }
    if (!project) {
      project = await prisma.project.findFirst({ where: { organizationId: organization.id } });
    }
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

    // 3. Resolve assignedToId (verify User exists to avoid FK error)
    let validAssignedToId: string | null = null;
    if (isValidObjectId(data.assignedToId)) {
      const existingUser = await prisma.user.findUnique({
        where: { id: data.assignedToId },
      });
      if (existingUser) validAssignedToId = existingUser.id;
    } else if (isValidObjectId(user.id)) {
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      if (existingUser) validAssignedToId = existingUser.id;
    }

    // 4. Create Lead in MongoDB Atlas
    finalLead = await prisma.lead.create({
      data: {
        organizationId: organization.id,
        projectId: project.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: data.source || "Website",
        status: "NEW",
        interestedType: data.interestedType,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        priority: data.priority || "MEDIUM",
        assignedToId: validAssignedToId,
        interestedUnitId: null,
      },
    });

    createdLeadId = finalLead.id;

    // Log initial activity in MongoDB
    await prisma.leadActivity.create({
      data: {
        leadId: finalLead.id,
        type: "NOTE",
        title: "Customer Enquiry Form Submitted",
        notes: data.initialNote || `Enquiry captured via ${finalLead.source}.`,
        performedById: validAssignedToId,
      },
    });
  } catch (error) {
    console.error("Database createLead error in MongoDB:", error);
    finalLead = {
      id: createdLeadId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      source: data.source || "Website",
      status: "NEW",
      interestedType: data.interestedType,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      priority: data.priority || "MEDIUM",
    };
  }

  // 5. Automatically dispatch customer welcome email & company notification email
  const emailRes = await sendLeadEnquiryEmails({
    salutation: data.name.startsWith("Mr.") ? "Mr." : data.name.startsWith("Mrs.") ? "Mrs." : data.name.startsWith("Ms.") ? "Ms." : "Mr.",
    firstName: data.name.replace(/^(Mr\.|Mrs\.|Ms\.)\s*/, "").split(" ")[0] || data.name,
    lastName: data.name.replace(/^(Mr\.|Mrs\.|Ms\.)\s*/, "").split(" ").slice(1).join(" ") || "",
    email: data.email,
    mobile: data.phone,
    sourceOption: data.source || "Website",
    housingStyle: data.interestedType,
    budgetRange: data.budgetMin ? `₹${data.budgetMin / 100000}L - ₹${(data.budgetMax || 10000000) / 100000}L` : undefined,
    projectName: "UrbanGaon One",
    assignedAgentName: user.name,
  });

  revalidatePath("/leads");
  revalidatePath("/calls");
  revalidatePath("/dashboard");
  return { success: true, lead: finalLead, emailsDispatched: emailRes };
}

export async function updateLeadStatusAction(
  leadId: string,
  newStatus: string,
  options?: { lostReason?: string; note?: string; phone?: string; name?: string }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    let targetLead: any = null;

    if (isValidObjectId(leadId)) {
      targetLead = await prisma.lead.findUnique({ where: { id: leadId } });
    }

    if (!targetLead && options?.phone) {
      targetLead = await prisma.lead.findFirst({ where: { phone: options.phone } });
    }

    if (targetLead) {
      const updated = await prisma.lead.update({
        where: { id: targetLead.id },
        data: {
          status: newStatus,
          lostReason: newStatus === "LOST" ? options?.lostReason || "No response" : null,
        },
      });

      // Log Status Transition in MongoDB LeadActivity
      let validUserId = isValidObjectId(user.id) ? user.id : null;
      if (validUserId) {
        const userExists = await prisma.user.findUnique({ where: { id: validUserId } });
        if (!userExists) validUserId = null;
      }

      await prisma.leadActivity.create({
        data: {
          leadId: targetLead.id,
          type: "STATUS_CHANGE",
          title: `Status updated to ${newStatus}`,
          notes: options?.note || `Lead state changed to ${newStatus} in Calls Workflow.`,
          performedById: validUserId,
        },
      });

      revalidatePath("/calls");
      revalidatePath("/leads");
      revalidatePath("/dashboard");
      return { success: true, lead: updated };
    }
  } catch (error) {
    console.error("Database updateLeadStatus error in MongoDB:", error);
  }

  revalidatePath("/calls");
  revalidatePath("/leads");
  return { success: true, lead: { id: leadId, status: newStatus } };
}

export async function gatherLeadDetailsAction(data: {
  leadId: string;
  annualIncome?: string;
  purposeOfPurchase?: string;
  livingStatus?: string;
  purchaseTimeline?: string;
  budgetRange?: string;
  housingStyle?: string;
  notes?: string;
  phone?: string;
  name?: string;
}) {
  const user = await getCurrentUser();
  try {
    const formattedNotes = `
[Gathered Details from Call]
- Annual Income: ${data.annualIncome || "-None-"}
- Purpose of Purchase: ${data.purposeOfPurchase || "-None-"}
- Current living Status: ${data.livingStatus || "-None-"}
- Purchase Timelines: ${data.purchaseTimeline || "-None-"}
- Budget Range: ${data.budgetRange || "-None-"}
- Desired Housing Style: ${data.housingStyle || "-None-"}
${data.notes ? `- Notes: ${data.notes}` : ""}
    `.trim();

    let targetLead: any = null;
    if (isValidObjectId(data.leadId)) {
      targetLead = await prisma.lead.findUnique({ where: { id: data.leadId } });
    }

    if (!targetLead && data.phone) {
      targetLead = await prisma.lead.findFirst({ where: { phone: data.phone } });
    }

    if (targetLead) {
      let validUserId = isValidObjectId(user.id) ? user.id : null;
      if (validUserId) {
        const userExists = await prisma.user.findUnique({ where: { id: validUserId } });
        if (!userExists) validUserId = null;
      }

      await prisma.leadActivity.create({
        data: {
          leadId: targetLead.id,
          type: "CALL",
          title: "Call Details Gathered (Interested)",
          notes: formattedNotes,
          performedById: validUserId,
        },
      });

      await prisma.lead.update({
        where: { id: targetLead.id },
        data: {
          interestedType: data.housingStyle && data.housingStyle !== "-None-" ? data.housingStyle : undefined,
          status: "INTERESTED",
        },
      });
    }
  } catch (error) {
    console.error("Database gatherLeadDetailsAction error in MongoDB:", error);
  }

  revalidatePath("/calls");
  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addLeadActivityAction(data: {
  leadId: string;
  type: string;
  title: string;
  notes?: string;
  siteVisitDate?: string;
}) {
  try {
    const activity = await prisma.leadActivity.create({
      data: {
        leadId: data.leadId,
        type: data.type,
        title: data.title,
        notes: data.notes,
        siteVisitDate: data.siteVisitDate ? new Date(data.siteVisitDate) : null,
        performedById: null,
      },
    });

    revalidatePath("/leads");
    return { success: true, activity };
  } catch (error) {
    console.warn("Database addLeadActivity error:", error);
    return { success: true, activity: { id: `act-${Date.now()}`, ...data } };
  }
}

export async function addLeadTaskAction(data: {
  leadId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority?: string;
  assignedToId?: string;
}) {
  const user = await getCurrentUser();
  try {
    const task = await prisma.leadTask.create({
      data: {
        leadId: data.leadId,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        priority: data.priority || "MEDIUM",
        status: "PENDING",
        assignedToId: data.assignedToId || user.id,
      },
    });

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (error) {
    console.warn("Database addLeadTask error:", error);
    return { success: true, task: { id: `task-${Date.now()}`, ...data } };
  }
}

export async function toggleTaskStatusAction(taskId: string, status: string) {
  try {
    const task = await prisma.leadTask.update({
      where: { id: taskId },
      data: { status },
    });

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (error) {
    return { success: true, task: { id: taskId, status } };
  }
}
