import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProjects } from "@/actions/project-actions";
import { getLeads } from "@/actions/leads-actions";
import { getInventoryUnits } from "@/actions/inventory-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { LeadsView } from "@/components/leads/LeadsView";
import { redirect } from "next/navigation";

async function getOrgUsers(orgId: string) {
  try {
    const users = await prisma.user.findMany({ where: { organizationId: orgId } });
    if (users.length > 0) return users;
  } catch (err) {
    console.warn("getOrgUsers fallback:", err);
  }

  return [
    { id: "user-admin-1", name: "Yudhister Tiwari", email: "yudhister.tiwari@urbangaon.com", role: "ADMIN" },
    { id: "user-manager-1", name: "Ananya Sharma (Sales Head)", email: "manager@propcrm.io", role: "SALES_MANAGER" },
    { id: "user-agent-1", name: "Rahul Verma (Senior Sales Agent)", email: "agent@propcrm.io", role: "SALES_AGENT" },
  ];
}

export default async function LeadsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [leads, projects, users, units] = await Promise.all([
    getLeads(),
    getProjects(),
    getOrgUsers(user.organizationId),
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
