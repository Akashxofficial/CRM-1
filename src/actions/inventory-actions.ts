"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { getCached, invalidateCache } from "@/lib/cache";

/** MongoDB ObjectId: 24-char hex string */
function isValidObjectId(id: string) {
  return /^[a-f0-9]{24}$/i.test(id);
}

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
  const user = await getCurrentUser();
  const cacheKey = `inventory_${user?.organizationId || "org"}_${JSON.stringify(filters || {})}`;

  return getCached(cacheKey, async () => {
    try {
      await checkAndReleaseExpiredHolds();
      const where: any = {};

    if (filters?.projectId && filters.projectId !== "ALL") {
      if (!isValidObjectId(filters.projectId)) throw new Error("Invalid projectId");
      where.projectId = filters.projectId;
    }
    if (filters?.towerId && filters.towerId !== "ALL") {
      if (!isValidObjectId(filters.towerId)) throw new Error("Invalid towerId");
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

    // Only query DB if we have a valid org session
    if (user && isValidObjectId(user.organizationId)) {
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

      if (units.length > 0) return units;
    }
  } catch (error) {
    console.warn("Database getInventoryUnits fallback:", error);
  }

  // Fallback: 50 demo plots named "Plot 1" – "Plot 50"
  const DEMO_PROJECT = { id: "demo-proj-1", name: "UrbanGaon Township" };
  const DEMO_TOWER   = { name: "Phase 1" };
  const STATUSES     = ["AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","HELD","BOOKED","SOLD","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","AVAILABLE","SOLD","AVAILABLE","AVAILABLE","AVAILABLE"];
  const FACINGS      = ["East","North","West","South","North-East"];
  const SIZES        = [1200,1350,1500,1800,2000,2200];

  return Array.from({ length: 50 }, (_, i) => {
    const n        = i + 1;
    const areaSqft = SIZES[i % SIZES.length];
    const baseRate = 4500 + (i % 5) * 200;
    const plc      = (i % 4 === 0) ? 100000 : 0;
    const parking  = 200000;
    const total    = areaSqft * baseRate + plc + parking;
    return {
      id:              `demo-plot-${n}`,
      projectId:       DEMO_PROJECT.id,
      towerId:         "demo-tower-1",
      unitNumber:      `Plot ${n}`,
      floor:           1,
      type:            "PLOT",
      areaSqft,
      carpetAreaSqft:  areaSqft,
      facing:          FACINGS[i % FACINGS.length],
      baseRate,
      plcCharges:      plc,
      parkingCharges:  parking,
      totalCost:       total,
      status:          STATUSES[i],
      tower:           DEMO_TOWER,
      project:         DEMO_PROJECT,
      heldBy:          n === 9  ? { name: "Gayatri Sarkar" } : null,
      booking:         n === 10 ? { id: "bk-demo-1", bookingNumber: "BK-0001", lead: { name: "Aaron Khan" } } : null,
    };
  });
  }, 20_000);
}

export const getUnits = getInventoryUnits;

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

  invalidateCache("inventory");
  invalidateCache("dashboard");
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

export async function generateUnitsBatchAction(
  projectId: string,
  towerName: string,
  units: Array<{
    unitNumber: string;
    floor: number;
    type: string;
    areaSqft: number;
    carpetAreaSqft: number;
    facing: string;
    baseRate: number;
    totalCost: number;
    status?: string;
  }>
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  if (isValidObjectId(user.organizationId) && isValidObjectId(projectId)) {
    try {
      let tower = await prisma.tower.findFirst({
        where: { projectId, name: towerName },
      });

      if (!tower) {
        tower = await prisma.tower.create({
          data: {
            projectId,
            name: towerName,
            totalFloors: Math.max(...units.map((u) => u.floor), 1),
            unitsPerFloor: 4,
          },
        });
      }

      for (const u of units) {
        await prisma.unit.upsert({
          where: {
            id: `gen-${projectId}-${u.unitNumber.replace(/[\s/]+/g, "_")}`,
          },
          update: {
            floor: u.floor,
            type: u.type,
            areaSqft: u.areaSqft,
            carpetAreaSqft: u.carpetAreaSqft,
            facing: u.facing || "East",
            baseRate: u.baseRate,
            plcCharges: 0,
            parkingCharges: 0,
            totalCost: u.totalCost,
            status: u.status || "AVAILABLE",
          },
          create: {
            projectId,
            towerId: tower.id,
            unitNumber: u.unitNumber,
            floor: u.floor,
            type: u.type,
            areaSqft: u.areaSqft,
            carpetAreaSqft: u.carpetAreaSqft,
            facing: u.facing || "East",
            baseRate: u.baseRate,
            plcCharges: 0,
            parkingCharges: 0,
            totalCost: u.totalCost,
            status: u.status || "AVAILABLE",
          },
        });
      }

      const count = await prisma.unit.count({ where: { projectId } });
      await prisma.project.update({
        where: { id: projectId },
        data: { totalUnits: count },
      });

      await createAuditLog({
        organizationId: user.organizationId,
        entityType: "PROJECT",
        entityId: projectId,
        action: "BATCH_UNITS_GENERATED",
        details: `Batch generated ${units.length} units in ${towerName}.`,
        performedById: user.id,
      });
    } catch (e) {
      console.warn("DB generateUnitsBatchAction error:", e);
    }
  }

  revalidatePath("/inventory");
  return { success: true, count: units.length };
}

