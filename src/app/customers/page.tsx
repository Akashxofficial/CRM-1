import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProjects } from "@/actions/project-actions";
import { getLeads } from "@/actions/leads-actions";
import { getBookings } from "@/actions/bookings-actions";
import { getInventoryUnits } from "@/actions/inventory-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { CustomersView } from "@/components/customers/CustomersView";
import { redirect } from "next/navigation";
import { getCached } from "@/lib/cache";

export const dynamic = "force-dynamic";

async function getOrgUsers(orgId: string) {
  return getCached(`org_users_${orgId}`, async () => {
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
  }, 60_000);
}

export default async function CustomersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [customers, projects, users, units, bookings] = await Promise.all([
    getLeads(),
    getProjects(),
    getOrgUsers(user.organizationId),
    getInventoryUnits({ status: "AVAILABLE" }),
    getBookings(),
  ]);

  return (
    <AppLayout>
      <CustomersView
        initialCustomers={customers}
        projects={projects}
        users={users}
        units={units}
        bookings={bookings}
        userRole={user.role}
      />
    </AppLayout>
  );
}
