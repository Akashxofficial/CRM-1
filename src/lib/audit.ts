import { prisma } from "./prisma";

export async function createAuditLog({
  organizationId,
  entityType,
  entityId,
  action,
  details,
  performedById,
}: {
  organizationId: string;
  entityType: "LEAD" | "UNIT" | "BOOKING" | "PAYMENT" | "DOCUMENT" | "POSSESSION" | "PROJECT";
  entityId: string;
  action: string;
  details?: string;
  performedById?: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        organizationId,
        entityType,
        entityId,
        action,
        details,
        performedById,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    return null;
  }
}
