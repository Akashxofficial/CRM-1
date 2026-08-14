"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function checkAndReleaseExpiredHolds() {
  const now = new Date();
  const expiredUnits = await prisma.unit.findMany({
    where: {
      status: "HELD",
      heldUntil: {
        lt: now,
      },
    },
    include: { project: true },
  });

  for (const unit of expiredUnits) {
    await prisma.unit.update({
      where: { id: unit.id },
      data: {
        status: "AVAILABLE",
        heldUntil: null,
        heldById: null,
        currentLeadId: null,
      },
    });

    await createAuditLog({
      organizationId: unit.project.organizationId,
      entityType: "UNIT",
      entityId: unit.id,
      action: "AUTO_RELEASED",
      details: `Unit ${unit.unitNumber} hold expired and was automatically released to AVAILABLE status.`,
    });
  }
}

export async function getInventoryUnits(filters?: {
  projectId?: string;
  towerId?: string;
  status?: string;
  type?: string;
  search?: string;
}) {
  await checkAndReleaseExpiredHolds();

  const where: any = {};

  if (filters?.projectId && filters.projectId !== "ALL") {
    where.projectId = filters.projectId;
  }
  if (filters?.towerId && filters.towerId !== "ALL") {
    where.towerId = filters.towerId;
  }
  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }
  if (filters?.type && filters.type !== "ALL") {
    where.type = filters.type;
  }
  if (filters?.search) {
    where.unitNumber = {
      contains: filters.search,
    };
  }

  const units = await prisma.unit.findMany({
    where,
    include: {
      tower: true,
      project: true,
      heldBy: true,
      booking: {
        include: {
          lead: true,
          salesAgent: true,
        },
      },
      leads: {
        where: {
          status: {
            notIn: ["LOST", "BOOKED"],
          },
        },
      },
    },
    orderBy: [{ floor: "desc" }, { unitNumber: "asc" }],
  });

  return units;
}

export async function holdUnitAction(unitId: string, leadId?: string, hours: number = 48) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { project: true },
  });

  if (!unit) throw new Error("Unit not found");
  if (unit.status !== "AVAILABLE") {
    return { success: false, error: `Unit is currently ${unit.status} and cannot be held.` };
  }

  const heldUntil = new Date(Date.now() + hours * 60 * 60 * 1000);

  const updated = await prisma.unit.update({
    where: { id: unitId },
    data: {
      status: "HELD",
      heldUntil,
      heldById: user.id,
      currentLeadId: leadId || null,
    },
  });

  if (leadId) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        interestedUnitId: unitId,
        status: "NEGOTIATION",
      },
    });

    await prisma.leadActivity.create({
      data: {
        leadId,
        type: "STATUS_CHANGE",
        title: `Unit ${unit.unitNumber} Held`,
        notes: `Unit ${unit.unitNumber} placed on hold for ${hours} hours until ${heldUntil.toLocaleString()}.`,
        performedById: user.id,
      },
    });
  }

  await createAuditLog({
    organizationId: user.organizationId,
    entityType: "UNIT",
    entityId: unitId,
    action: "HELD",
    details: `Unit ${unit.unitNumber} held by ${user.name} for ${hours} hours.`,
    performedById: user.id,
  });

  revalidatePath("/inventory");
  revalidatePath("/leads");
  return { success: true, unit: updated };
}

export async function releaseUnitAction(unitId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { project: true },
  });

  if (!unit) throw new Error("Unit not found");

  const updated = await prisma.unit.update({
    where: { id: unitId },
    data: {
      status: "AVAILABLE",
      heldUntil: null,
      heldById: null,
      currentLeadId: null,
    },
  });

  await createAuditLog({
    organizationId: user.organizationId,
    entityType: "UNIT",
    entityId: unitId,
    action: "RELEASED",
    details: `Unit ${unit.unitNumber} released back to Available by ${user.name}.`,
    performedById: user.id,
  });

  revalidatePath("/inventory");
  return { success: true, unit: updated };
}

export async function updateUnitStatusAction(unitId: string, status: string, notes?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const unit = await prisma.unit.update({
    where: { id: unitId },
    data: {
      status,
      notes: notes || undefined,
    },
    include: { project: true },
  });

  await createAuditLog({
    organizationId: user.organizationId,
    entityType: "UNIT",
    entityId: unitId,
    action: "STATUS_CHANGED",
    details: `Unit ${unit.unitNumber} status set to ${status}.`,
    performedById: user.id,
  });

  revalidatePath("/inventory");
  return { success: true, unit };
}

export async function bulkImportUnitsCSVAction(projectId: string, towerId: string, csvRows: any[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  let createdCount = 0;

  for (const row of csvRows) {
    const areaSqft = parseFloat(row.areaSqft || "1200");
    const baseRate = parseFloat(row.baseRate || "8000");
    const plcCharges = parseFloat(row.plcCharges || "0");
    const parkingCharges = parseFloat(row.parkingCharges || "300000");
    const totalCost = areaSqft * baseRate + plcCharges + parkingCharges;

    await prisma.unit.upsert({
      where: {
        id: row.id || `custom-${projectId}-${row.unitNumber}`,
      },
      update: {
        floor: parseInt(row.floor || "1"),
        type: row.type || "2BHK",
        areaSqft,
        carpetAreaSqft: parseFloat(row.carpetAreaSqft || (areaSqft * 0.8).toString()),
        facing: row.facing || "East",
        baseRate,
        plcCharges,
        parkingCharges,
        totalCost,
        status: row.status || "AVAILABLE",
      },
      create: {
        projectId,
        towerId,
        unitNumber: row.unitNumber,
        floor: parseInt(row.floor || "1"),
        type: row.type || "2BHK",
        areaSqft,
        carpetAreaSqft: parseFloat(row.carpetAreaSqft || (areaSqft * 0.8).toString()),
        facing: row.facing || "East",
        baseRate,
        plcCharges,
        parkingCharges,
        totalCost,
        status: row.status || "AVAILABLE",
      },
    });
    createdCount++;
  }

  // Update total units on project
  const count = await prisma.unit.count({ where: { projectId } });
  await prisma.project.update({
    where: { id: projectId },
    data: { totalUnits: count },
  });

  revalidatePath("/inventory");
  return { success: true, count: createdCount };
}
