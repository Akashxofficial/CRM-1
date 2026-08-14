"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function getLeads(filters?: {
  projectId?: string;
  status?: string;
  source?: string;
  assignedToId?: string;
  search?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const where: any = {
    organizationId: user.organizationId,
  };

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

  return await prisma.lead.findMany({
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
}

export async function checkDuplicateLead(phone: string, email?: string) {
  const user = await getCurrentUser();
  if (!user) return { exists: false };

  const conditions: any[] = [];
  if (phone) conditions.push({ phone: phone.trim() });
  if (email && email.trim()) conditions.push({ email: email.trim() });

  if (conditions.length === 0) return { exists: false };

  const existing = await prisma.lead.findFirst({
    where: {
      organizationId: user.organizationId,
      OR: conditions,
    },
    include: { assignedTo: true, project: true },
  });

  if (existing) {
    return {
      exists: true,
      lead: existing,
      message: `A lead already exists for ${existing.name} (${existing.phone}) assigned to ${existing.assignedTo?.name || "Unassigned"}.`,
    };
  }

  return { exists: false };
}

export async function createLeadAction(data: {
  projectId: string;
  name: string;
  phone: string;
  email: string;
  source?: string;
  interestedType?: string;
  budgetMin?: number;
  budgetMax?: number;
  priority?: string;
  assignedToId?: string;
  interestedUnitId?: string;
  initialNote?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Duplicate warning/check
  const dup = await checkDuplicateLead(data.phone, data.email);
  if (dup.exists) {
    // We can still create or return warning
  }

  const lead = await prisma.lead.create({
    data: {
      organizationId: user.organizationId,
      projectId: data.projectId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      source: data.source || "Website",
      status: "NEW",
      interestedType: data.interestedType,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      priority: data.priority || "MEDIUM",
      assignedToId: data.assignedToId || (user.role === "SALES_AGENT" ? user.id : null),
      interestedUnitId: data.interestedUnitId || null,
    },
  });

  // Log initial activity
  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      type: "NOTE",
      title: "Lead Created",
      notes: data.initialNote || `Enquiry captured via ${lead.source}.`,
      performedById: user.id,
    },
  });

  await createAuditLog({
    organizationId: user.organizationId,
    entityType: "LEAD",
    entityId: lead.id,
    action: "CREATED",
    details: `Lead ${lead.name} created by ${user.name}.`,
    performedById: user.id,
  });

  revalidatePath("/leads");
  return { success: true, lead };
}

export async function updateLeadStatusAction(
  leadId: string,
  newStatus: string,
  options?: { lostReason?: string; note?: string }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const prev = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!prev) throw new Error("Lead not found");

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: newStatus,
      lostReason: newStatus === "LOST" ? options?.lostReason || "No response" : null,
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId,
      type: "STATUS_CHANGE",
      title: `Status Changed to ${newStatus.replace(/_/g, " ")}`,
      notes: options?.note || (newStatus === "LOST" ? `Reason: ${options?.lostReason || "Unknown"}` : `Moved from ${prev.status} to ${newStatus}`),
      performedById: user.id,
    },
  });

  await createAuditLog({
    organizationId: user.organizationId,
    entityType: "LEAD",
    entityId: leadId,
    action: "STATUS_CHANGED",
    details: `Lead status updated to ${newStatus} by ${user.name}.`,
    performedById: user.id,
  });

  revalidatePath("/leads");
  return { success: true, lead };
}

export async function addLeadActivityAction(data: {
  leadId: string;
  type: string;
  title: string;
  notes?: string;
  siteVisitDate?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const activity = await prisma.leadActivity.create({
    data: {
      leadId: data.leadId,
      type: data.type,
      title: data.title,
      notes: data.notes,
      siteVisitDate: data.siteVisitDate ? new Date(data.siteVisitDate) : null,
      performedById: user.id,
    },
  });

  // Auto-progress status if site visit is logged
  if (data.type === "SITE_VISIT") {
    await prisma.lead.update({
      where: { id: data.leadId },
      data: { status: "SITE_VISIT_DONE" },
    });
  }

  revalidatePath("/leads");
  return { success: true, activity };
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
  if (!user) throw new Error("Unauthorized");

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
}

export async function toggleTaskStatusAction(taskId: string, status: string) {
  const task = await prisma.leadTask.update({
    where: { id: taskId },
    data: { status },
  });

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return { success: true, task };
}
