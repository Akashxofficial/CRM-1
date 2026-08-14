"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function getPossessions(filters?: {
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
    const possessions = await prisma.possession.findMany({
      where,
      include: {
        booking: {
          include: {
            lead: true,
            unit: { include: { tower: true, project: true } },
            project: { include: { organization: true } },
            salesAgent: true,
          },
        },
        snags: {
          orderBy: { reportedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (possessions.length > 0) return possessions;
  } catch (error) {
    console.warn("Database getPossessions fallback:", error);
  }

  // Fallback demo possession
  return [
    {
      id: "demo-poss-1",
      scheduledDate: new Date("2026-02-15"),
      actualDate: new Date("2026-02-18"),
      status: "READY_FOR_HANDOVER",
      electricityMeterNo: "BESCOM-LT-8891223",
      waterMeterNo: "BWSSB-WT-441299",
      gasMeterNo: "GAIL-GAS-110022",
      booking: {
        id: "demo-b-1",
        bookingNumber: "SKH-2026-001",
        lead: { name: "Dr. Arvind Swamy", phone: "+91 98450 33221" },
        unit: { unitNumber: "M-201", type: "4BHK", tower: { name: "Tower 1 (Orchid)" } },
        project: { name: "Skyline Meadows", organization: { name: "Skyline Realty & Infrastructure" } },
      },
      snags: [
        { id: "s-1", category: "PAINTING", description: "Minor paint touch-up", location: "Master Bedroom Balcony", status: "RESOLVED" },
      ],
    },
  ];
}

export async function schedulePossessionAction(data: {
  bookingId: string;
  scheduledDate: string;
  electricityMeterNo?: string;
  waterMeterNo?: string;
  gasMeterNo?: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const possession = await prisma.possession.upsert({
    where: { bookingId: data.bookingId },
    update: {
      scheduledDate: new Date(data.scheduledDate),
      electricityMeterNo: data.electricityMeterNo,
      waterMeterNo: data.waterMeterNo,
      gasMeterNo: data.gasMeterNo,
      notes: data.notes,
      status: "SCHEDULED",
    },
    create: {
      bookingId: data.bookingId,
      scheduledDate: new Date(data.scheduledDate),
      electricityMeterNo: data.electricityMeterNo,
      waterMeterNo: data.waterMeterNo,
      gasMeterNo: data.gasMeterNo,
      notes: data.notes,
      status: "SCHEDULED",
      handoverChecklistJson: JSON.stringify([
        { item: "Key handover (3 sets Master, 2 sets Balcony)", checked: false },
        { item: "Electrical fittings & MCB verification", checked: false },
        { item: "Sanitary ware & water pressure test", checked: false },
        { item: "Fire alarm & sprinkler check", checked: false },
        { item: "Clubhouse smart access card issued", checked: false },
      ]),
    },
  });

  await createAuditLog({
    organizationId: user.organizationId,
    entityType: "POSSESSION",
    entityId: possession.id,
    action: "SCHEDULED",
    details: `Possession inspection scheduled for ${new Date(data.scheduledDate).toLocaleDateString()} by ${user.name}.`,
    performedById: user.id,
  });

  revalidatePath("/possession");
  return { success: true, possession };
}

export async function addSnagItemAction(data: {
  possessionId: string;
  category: string;
  description: string;
  location?: string;
  photoUrl?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const snag = await prisma.snagItem.create({
    data: {
      possessionId: data.possessionId,
      category: data.category,
      description: data.description,
      location: data.location,
      photoUrl: data.photoUrl,
      status: "OPEN",
    },
  });

  await prisma.possession.update({
    where: { id: data.possessionId },
    data: { status: "SNAGS_PENDING" },
  });

  revalidatePath("/possession");
  return { success: true, snag };
}

export async function updateSnagStatusAction(snagId: string, status: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const snag = await prisma.snagItem.update({
    where: { id: snagId },
    data: {
      status,
      resolvedAt: status === "RESOLVED" || status === "VERIFIED" ? new Date() : null,
    },
    include: { possession: { include: { snags: true } } },
  });

  // If all snags are resolved, mark possession as READY_FOR_HANDOVER
  const allResolved = snag.possession.snags.every((s) => s.id === snagId ? (status === "RESOLVED" || status === "VERIFIED") : (s.status === "RESOLVED" || s.status === "VERIFIED"));
  if (allResolved) {
    await prisma.possession.update({
      where: { id: snag.possessionId },
      data: { status: "READY_FOR_HANDOVER" },
    });
  }

  revalidatePath("/possession");
  return { success: true, snag };
}

export async function completeHandoverAction(data: {
  possessionId: string;
  actualDate?: string;
  handoverChecklistJson: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const possession = await prisma.possession.update({
    where: { id: data.possessionId },
    data: {
      status: "HANDED_OVER",
      actualDate: data.actualDate ? new Date(data.actualDate) : new Date(),
      handoverChecklistJson: data.handoverChecklistJson,
      notes: data.notes,
      handoverById: user.id,
    },
    include: { booking: { include: { unit: true } } },
  });

  // Mark unit as SOLD
  await prisma.unit.update({
    where: { id: possession.booking.unitId },
    data: { status: "SOLD" },
  });

  await createAuditLog({
    organizationId: user.organizationId,
    entityType: "POSSESSION",
    entityId: possession.id,
    action: "HANDED_OVER",
    details: `Unit ${possession.booking.unit.unitNumber} officially handed over to customer. Possession Certificate issued.`,
    performedById: user.id,
  });

  revalidatePath("/possession");
  revalidatePath("/inventory");
  return { success: true, possession };
}
