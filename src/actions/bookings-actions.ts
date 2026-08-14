"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function convertLeadToBookingAction(data: {
  leadId: string;
  unitId: string;
  paymentPlanId?: string;
  customAgreementValue?: number;
  bookingAmountReceived: number;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const [lead, unit] = await Promise.all([
    prisma.lead.findUnique({ where: { id: data.leadId }, include: { project: true } }),
    prisma.unit.findUnique({ where: { id: data.unitId }, include: { tower: true, project: true } }),
  ]);

  if (!lead) throw new Error("Lead not found");
  if (!unit) throw new Error("Unit not found");
  if (unit.status === "BOOKED" || unit.status === "SOLD") {
    return { success: false, error: `Unit ${unit.unitNumber} is already ${unit.status}` };
  }

  // Get project default payment plan if none supplied
  let paymentPlan = null;
  if (data.paymentPlanId) {
    paymentPlan = await prisma.paymentPlanTemplate.findUnique({ where: { id: data.paymentPlanId } });
  } else {
    paymentPlan = await prisma.paymentPlanTemplate.findFirst({
      where: { projectId: unit.projectId, isDefault: true },
    }) || await prisma.paymentPlanTemplate.findFirst({
      where: { projectId: unit.projectId },
    });
  }

  const agreementValue = data.customAgreementValue || unit.totalCost;
  const projectCode = unit.project.code || "PRJ";
  const bookingNumber = `${projectCode}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  // 1. Create Booking
  const booking = await prisma.booking.create({
    data: {
      organizationId: user.organizationId,
      projectId: unit.projectId,
      unitId: unit.id,
      leadId: lead.id,
      bookingNumber,
      agreementValue,
      bookingAmountReceived: data.bookingAmountReceived,
      paymentPlanId: paymentPlan?.id || null,
      salesAgentId: lead.assignedToId || user.id,
      approvedById: user.role === "ADMIN" || user.role === "SALES_MANAGER" ? user.id : null,
      status: user.role === "ADMIN" || user.role === "SALES_MANAGER" ? "CONFIRMED" : "PROVISIONAL",
      notes: data.notes,
    },
  });

  // 2. Update Unit to BOOKED
  await prisma.unit.update({
    where: { id: unit.id },
    data: {
      status: "BOOKED",
      currentLeadId: lead.id,
    },
  });

  // 3. Update Lead status to BOOKED
  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      status: "BOOKED",
      interestedUnitId: unit.id,
    },
  });

  // 4. Generate Payment Milestones from Template
  let milestones: Array<{ name: string; percentage: number; days: number }> = [];
  if (paymentPlan?.milestonesJson) {
    try {
      milestones = JSON.parse(paymentPlan.milestonesJson);
    } catch {
      milestones = [
        { name: "On Booking Token", percentage: 10, days: 0 },
        { name: "On Agreement Signing", percentage: 10, days: 30 },
        { name: "On Foundation Completion", percentage: 15, days: 90 },
        { name: "On Superstructure Slab", percentage: 35, days: 240 },
        { name: "On Finishing & Flooring", percentage: 20, days: 360 },
        { name: "On Possession & Key Handover", percentage: 10, days: 480 },
      ];
    }
  } else {
    milestones = [
      { name: "On Booking Token", percentage: 10, days: 0 },
      { name: "On Agreement Signing", percentage: 10, days: 30 },
      { name: "On Foundation Completion", percentage: 15, days: 90 },
      { name: "On Superstructure Slab", percentage: 35, days: 240 },
      { name: "On Finishing & Flooring", percentage: 20, days: 360 },
      { name: "On Possession & Key Handover", percentage: 10, days: 480 },
    ];
  }

  const now = new Date();
  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i];
    const dueAmount = (agreementValue * m.percentage) / 100;
    const dueDate = new Date(now.getTime() + (m.days || i * 45) * 24 * 3600 * 1000);
    const isFirstMilestone = i === 0 && data.bookingAmountReceived >= dueAmount;

    const schedule = await prisma.paymentSchedule.create({
      data: {
        bookingId: booking.id,
        milestoneName: m.name,
        milestoneCode: `MS_${String(i + 1).padStart(2, "0")}`,
        percentage: m.percentage,
        dueAmount,
        dueDate,
        status: isFirstMilestone ? "PAID" : "PENDING",
      },
    });

    if (i === 0 && data.bookingAmountReceived > 0) {
      await prisma.paymentTransaction.create({
        data: {
          scheduleId: schedule.id,
          bookingId: booking.id,
          amountPaid: data.bookingAmountReceived,
          mode: "NEFT",
          referenceNo: `BOOKING-TOKEN-${Math.floor(100000 + Math.random() * 900000)}`,
          receiptNumber: `REC-${bookingNumber}-TOKEN`,
          bankName: "Direct Transfer",
          verifiedById: user.id,
          notes: "Initial booking token receipt",
        },
      });
    }
  }

  // 5. Create Document Checklist
  const defaultDocs = [
    { type: "ALLOTMENT_LETTER", title: "Allotment Letter", status: "GENERATED" },
    { type: "SALE_AGREEMENT", title: "Agreement for Sale (Draft)", status: "PENDING" },
    { type: "KYC_VERIFICATION", title: "Buyer KYC Documents (PAN/Aadhaar)", status: "PENDING" },
    { type: "OC_CC_CERTIFICATE", title: "Occupancy / Completion Certificate", status: "PENDING" },
    { type: "SALE_DEED", title: "Registered Sale Deed", status: "PENDING" },
  ];

  for (const doc of defaultDocs) {
    await prisma.document.create({
      data: {
        bookingId: booking.id,
        type: doc.type,
        title: doc.title,
        status: doc.status,
        uploadedById: user.id,
      },
    });
  }

  // 6. Log Lead Activity & Audit
  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      type: "STATUS_CHANGE",
      title: `Converted to Booking #${bookingNumber}`,
      notes: `Booked Unit ${unit.unitNumber} (${unit.tower.name}) for ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(agreementValue)}. Token received: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(data.bookingAmountReceived)}.`,
      performedById: user.id,
    },
  });

  await createAuditLog({
    organizationId: user.organizationId,
    entityType: "BOOKING",
    entityId: booking.id,
    action: "CREATED",
    details: `Booking ${bookingNumber} generated for Unit ${unit.unitNumber} by ${user.name}.`,
    performedById: user.id,
  });

  revalidatePath("/bookings");
  revalidatePath("/inventory");
  revalidatePath("/leads");
  return { success: true, booking };
}

export async function getBookings(filters?: {
  projectId?: string;
  status?: string;
  search?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const where: any = {
    organizationId: user.organizationId,
  };

  if (user.role === "SALES_AGENT") {
    where.salesAgentId = user.id;
  }

  if (filters?.projectId && filters.projectId !== "ALL") {
    where.projectId = filters.projectId;
  }
  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }
  if (filters?.search) {
    where.OR = [
      { bookingNumber: { contains: filters.search } },
      { lead: { name: { contains: filters.search } } },
      { unit: { unitNumber: { contains: filters.search } } },
    ];
  }

  return await prisma.booking.findMany({
    where,
    include: {
      lead: true,
      unit: {
        include: { tower: true, project: true },
      },
      project: true,
      salesAgent: true,
      paymentPlan: true,
      schedules: {
        orderBy: { dueDate: "asc" },
      },
      transactions: true,
      documents: true,
      possession: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBookingById(bookingId: string) {
  return await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      lead: true,
      unit: {
        include: { tower: true, project: true },
      },
      project: {
        include: { organization: true },
      },
      salesAgent: true,
      approvedBy: true,
      paymentPlan: true,
      schedules: {
        include: {
          transactions: true,
        },
        orderBy: { dueDate: "asc" },
      },
      transactions: {
        orderBy: { paymentDate: "desc" },
      },
      documents: {
        include: { uploadedBy: true, verifiedBy: true },
        orderBy: { createdAt: "asc" },
      },
      possession: {
        include: { snags: true },
      },
    },
  });
}

export async function approveBookingAction(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== "ADMIN" && user.role !== "SALES_MANAGER") {
    return { success: false, error: "Only Admins or Sales Managers can approve bookings." };
  }

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CONFIRMED",
      approvedById: user.id,
    },
  });

  await createAuditLog({
    organizationId: user.organizationId,
    entityType: "BOOKING",
    entityId: bookingId,
    action: "APPROVED",
    details: `Booking ${booking.bookingNumber} confirmed & approved by ${user.name}.`,
    performedById: user.id,
  });

  revalidatePath("/bookings");
  return { success: true, booking };
}
