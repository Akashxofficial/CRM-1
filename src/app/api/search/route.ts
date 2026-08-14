import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ leads: [], units: [], bookings: [] });
  }

  const [leads, units, bookings] = await Promise.all([
    prisma.lead.findMany({
      where: {
        organizationId: user.organizationId,
        OR: [
          { name: { contains: q } },
          { phone: { contains: q } },
          { email: { contains: q } },
        ],
      },
      include: { project: true },
      take: 5,
    }),
    prisma.unit.findMany({
      where: {
        project: { organizationId: user.organizationId },
        OR: [
          { unitNumber: { contains: q } },
          { type: { contains: q } },
        ],
      },
      include: { project: true, tower: true },
      take: 5,
    }),
    prisma.booking.findMany({
      where: {
        organizationId: user.organizationId,
        OR: [
          { bookingNumber: { contains: q } },
          { lead: { name: { contains: q } } },
          { unit: { unitNumber: { contains: q } } },
        ],
      },
      include: { lead: true, unit: true, project: true },
      take: 5,
    }),
  ]);

  return NextResponse.json({ leads, units, bookings });
}
