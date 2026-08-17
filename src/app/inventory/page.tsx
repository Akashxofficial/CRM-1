import { getCurrentUser } from "@/lib/auth";
import { getProjects } from "@/actions/project-actions";
import { getInventoryUnits } from "@/actions/inventory-actions";
import { getLeads } from "@/actions/leads-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { InventoryGrid } from "@/components/inventory/InventoryGrid";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [projects, initialUnits, leads] = await Promise.all([
    getProjects(),
    getInventoryUnits(),
    getLeads(),
  ]);

  return (
    <AppLayout>
      <InventoryGrid
        projects={projects}
        initialUnits={initialUnits}
        userRole={user.role}
        leads={leads}
      />
    </AppLayout>
  );
}
