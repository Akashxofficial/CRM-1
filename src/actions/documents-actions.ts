"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function getPostSalesBookings(filters?: {
  projectId?: string;
  search?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const where: any = {
    organizationId: user.organizationId,
  };

  if (filters?.projectId && filters.projectId !== "ALL") {
    where.projectId = filters.projectId;
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
      unit: { include: { tower: true, project: true } },
      project: true,
      documents: {
        include: { uploadedBy: true, verifiedBy: true },
        orderBy: { createdAt: "asc" },
      },
      possession: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateDocumentStatusAction(data: {
  docId: string;
  status: string;
  fileUrl?: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const doc = await prisma.document.findUnique({
    where: { id: data.docId },
    include: { booking: true },
  });

  if (!doc) throw new Error("Document not found");

  const updated = await prisma.document.update({
    where: { id: data.docId },
    data: {
      status: data.status,
      fileUrl: data.fileUrl || doc.fileUrl || `/docs/sample_${doc.type.toLowerCase()}.pdf`,
      notes: data.notes || doc.notes,
      uploadedById: user.id,
      uploadedAt: new Date(),
      verifiedById: data.status === "VERIFIED" || data.status === "REGISTERED" ? user.id : doc.verifiedById,
      verifiedAt: data.status === "VERIFIED" || data.status === "REGISTERED" ? new Date() : doc.verifiedAt,
    },
  });

  await createAuditLog({
    organizationId: user.organizationId,
    entityType: "DOCUMENT",
    entityId: doc.id,
    action: "STATUS_CHANGED",
    details: `Document ${doc.title} for Booking #${doc.booking.bookingNumber} updated to ${data.status} by ${user.name}.`,
    performedById: user.id,
  });

  revalidatePath("/documents");
  revalidatePath(`/bookings/${doc.bookingId}`);
  return { success: true, document: updated };
}
