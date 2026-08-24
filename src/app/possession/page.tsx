import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProjects } from "@/actions/project-actions";
import { getPossessions } from "@/actions/possession-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { PossessionView } from "@/components/possession/PossessionView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import { getCached } from "@/lib/cache";

async function getBookingsWithoutPossession(orgId: string) {
  return getCached(`bookings_no_possession_${orgId}`, async () => {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          organizationId: orgId,
          possession: null,
        },
        include: { lead: true, unit: true },
      });
      if (bookings.length > 0) return bookings;
    } catch (err) {
      console.warn("getBookingsWithoutPossession fallback:", err);
    }

    return [];
  }, 30_000);
}

export default async function PossessionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [possessions, allBookings, projects] = await Promise.all([
    getPossessions(),
    getBookingsWithoutPossession(user.organizationId),
    getProjects(),
  ]);

  return (
    <AppLayout>
      <PossessionView
        possessions={possessions}
        bookingsWithoutPossession={allBookings}
        projects={projects}
        userRole={user.role}
      />
    </AppLayout>
  );
}
