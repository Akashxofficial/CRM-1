import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProjects } from "@/actions/project-actions";
import { getLeads } from "@/actions/leads-actions";
import { getInventoryUnits } from "@/actions/inventory-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { LeadsView } from "@/components/leads/LeadsView";
import { redirect } from "next/navigation";

export default async function LeadsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [leads, projects, users, units] = await Promise.all([
    getLeads(),
    getProjects(),
    prisma.user.findMany({ where: { organizationId: user.organizationId } }),
    getInventoryUnits({ status: "AVAILABLE" }),
  ]);

  return (
    <AppLayout>
      <LeadsView
        initialLeads={leads}
        projects={projects}
        users={users}
        units={units}
        userRole={user.role}
      />
    </AppLayout>
  );
}
