import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProjects } from "@/actions/project-actions";
import { getPossessions } from "@/actions/possession-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { PossessionView } from "@/components/possession/PossessionView";
import { redirect } from "next/navigation";

export default async function PossessionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [possessions, allBookings, projects] = await Promise.all([
    getPossessions(),
    prisma.booking.findMany({
      where: {
        organizationId: user.organizationId,
        possession: null,
      },
      include: { lead: true, unit: true },
    }),
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
