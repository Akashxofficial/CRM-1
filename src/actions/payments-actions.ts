"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function getPaymentSchedules(filters?: {
  projectId?: string;
  status?: string;
  search?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const where: any = {
    booking: {
      organizationId: user.organizationId,
    },
  };

  if (filters?.projectId && filters.projectId !== "ALL") {
    where.booking.projectId = filters.projectId;
  }
  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }
  if (filters?.search) {
    where.booking = {
      ...where.booking,
      OR: [
        { bookingNumber: { contains: filters.search } },
        { lead: { name: { contains: filters.search } } },
        { unit: { unitNumber: { contains: filters.search } } },
      ],
    };
  }

  try {
    const schedules = await prisma.paymentSchedule.findMany({
      where,
      include: {
        booking: {
          include: {
            lead: true,
            unit: { include: { tower: true, project: true } },
            project: true,
            salesAgent: true,
          },
        },
        transactions: true,
      },
      orderBy: [{ dueDate: "asc" }],
    });

    if (schedules.length > 0) return schedules;
  } catch (error) {
    console.warn("Database getPaymentSchedules fallback:", error);
  }

  // Fallback demo schedules
  return [
    {
      id: "demo-ms-1",
      milestoneName: "On Booking Token (10%)",
      milestoneCode: "MS_01",
      percentage: 10,
      dueAmount: 1452500,
      dueDate: new Date("2026-01-10"),
      status: "PAID",
      demandLetterSent: true,
      booking: {
        id: "demo-b-1",
        bookingNumber: "SKH-2026-001",
        projectId: "demo-proj-1",
        lead: { name: "Amitabh Sen", phone: "+91 98450 11223" },
        unit: { unitNumber: "A-102", type: "3BHK", tower: { name: "Tower A (Sapphire)" } },
        project: { name: "Skyline Heights" },
      },
      transactions: [],
    },
    {
      id: "demo-ms-2",
      milestoneName: "On Allotment & Agreement (10%)",
      milestoneCode: "MS_02",
      percentage: 10,
      dueAmount: 1452500,
      dueDate: new Date("2026-02-10"),
      status: "PENDING",
      demandLetterSent: false,
      booking: {
        id: "demo-b-1",
        bookingNumber: "SKH-2026-001",
        projectId: "demo-proj-1",
        lead: { name: "Amitabh Sen", phone: "+91 98450 11223" },
        unit: { unitNumber: "A-102", type: "3BHK", tower: { name: "Tower A (Sapphire)" } },
        project: { name: "Skyline Heights" },
      },
      transactions: [],
    },
  ];
}

export async function recordPaymentAction(data: {
  scheduleId: string;
  bookingId: string;
  amountPaid: number;
  mode: string;
  referenceNo: string;
  bankName?: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const schedule = await prisma.paymentSchedule.findUnique({
    where: { id: data.scheduleId },
    include: { booking: true },
  });

  if (!schedule) throw new Error("Schedule milestone not found");

  const receiptNumber = `REC-${schedule.booking.bookingNumber}-${schedule.milestoneCode}-${Math.floor(100 + Math.random() * 900)}`;

  const transaction = await prisma.paymentTransaction.create({
    data: {
      scheduleId: data.scheduleId,
      bookingId: data.bookingId,
      amountPaid: data.amountPaid,
      mode: data.mode,
      referenceNo: data.referenceNo,
      receiptNumber,
      bankName: data.bankName || "Direct Transfer",
      verifiedById: user.id,
      notes: data.notes,
    },
  });

  // Calculate total paid for this schedule
  const allTransactions = await prisma.paymentTransaction.findMany({
    where: { scheduleId: data.scheduleId },
  });
  const totalPaid = allTransactions.reduce((acc, t) => acc + t.amountPaid, 0);

  let newStatus = "PARTIAL";
  if (totalPaid >= schedule.dueAmount) {
    newStatus = "PAID";
  }

  await prisma.paymentSchedule.update({
    where: { id: data.scheduleId },
    data: { status: newStatus },
  });

  await createAuditLog({
    organizationId: user.organizationId,
    entityType: "PAYMENT",
    entityId: transaction.id,
    action: "PAID",
    details: `Payment receipt ${receiptNumber} of ₹${data.amountPaid.toLocaleString()} recorded for Milestone ${schedule.milestoneName} by ${user.name}.`,
    performedById: user.id,
  });

  revalidatePath("/payments");
  revalidatePath("/bookings");
  return { success: true, transaction, receiptNumber };
}

export async function generateDemandLetterAction(scheduleId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const updated = await prisma.paymentSchedule.update({
    where: { id: scheduleId },
    data: {
      demandLetterSent: true,
      demandLetterSentAt: new Date(),
    },
    include: {
      booking: {
        include: {
          lead: true,
          unit: { include: { tower: true, project: true } },
          project: { include: { organization: true } },
        },
      },
    },
  });

  await createAuditLog({
    organizationId: user.organizationId,
    entityType: "PAYMENT",
    entityId: scheduleId,
    action: "DEMAND_LETTER_SENT",
    details: `Demand letter dispatched for ${updated.milestoneName} on Unit ${updated.booking.unit.unitNumber}.`,
    performedById: user.id,
  });

  revalidatePath("/payments");
  return { success: true, schedule: updated };
}

export async function getDuesAgeingReport(projectId?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date();
  const where: any = {
    booking: {
      organizationId: user.organizationId,
    },
    status: { in: ["PENDING", "OVERDUE", "PARTIAL"] },
    dueDate: { lt: now },
  };

  if (projectId && projectId !== "ALL") {
    where.booking.projectId = projectId;
  }

  let overdueSchedules: any[] = [];
  try {
    overdueSchedules = await prisma.paymentSchedule.findMany({
      where,
      include: {
        booking: {
          include: {
            lead: true,
            unit: true,
            project: true,
            salesAgent: true,
          },
        },
        transactions: true,
      },
    });
  } catch (error) {
    console.warn("Database getDuesAgeingReport fallback:", error);
  }

  const ageing = {
    bracket_0_30: { count: 0, totalAmount: 0, items: [] as any[] },
    bracket_31_60: { count: 0, totalAmount: 0, items: [] as any[] },
    bracket_61_90: { count: 0, totalAmount: 0, items: [] as any[] },
    bracket_90_plus: { count: 0, totalAmount: 0, items: [] as any[] },
    grandTotal: 0,
  };

  for (const s of overdueSchedules) {
    const paid = s.transactions.reduce((acc, t) => acc + t.amountPaid, 0);
    const balance = Math.max(0, s.dueAmount - paid);
    if (balance <= 0) continue;

    const diffDays = Math.floor((now.getTime() - new Date(s.dueDate).getTime()) / (1000 * 60 * 60 * 24));

    const item = {
      scheduleId: s.id,
      bookingNumber: s.booking.bookingNumber,
      customerName: s.booking.lead.name,
      customerPhone: s.booking.lead.phone,
      unitNumber: s.booking.unit.unitNumber,
      projectName: s.booking.project.name,
      milestoneName: s.milestoneName,
      dueDate: s.dueDate,
      dueAmount: s.dueAmount,
      balanceDue: balance,
      daysOverdue: diffDays,
      agentName: s.booking.salesAgent?.name || "Unassigned",
    };

    ageing.grandTotal += balance;

    if (diffDays <= 30) {
      ageing.bracket_0_30.count++;
      ageing.bracket_0_30.totalAmount += balance;
      ageing.bracket_0_30.items.push(item);
    } else if (diffDays <= 60) {
      ageing.bracket_31_60.count++;
      ageing.bracket_31_60.totalAmount += balance;
      ageing.bracket_31_60.items.push(item);
    } else if (diffDays <= 90) {
      ageing.bracket_61_90.count++;
      ageing.bracket_61_90.totalAmount += balance;
      ageing.bracket_61_90.items.push(item);
    } else {
      ageing.bracket_90_plus.count++;
      ageing.bracket_90_plus.totalAmount += balance;
      ageing.bracket_90_plus.items.push(item);
    }
  }

  return ageing;
}
