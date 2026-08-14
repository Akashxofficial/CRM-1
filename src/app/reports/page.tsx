import { getCurrentUser } from "@/lib/auth";
import { getProjects } from "@/actions/project-actions";
import { getBookings } from "@/actions/bookings-actions";
import { getLeads } from "@/actions/leads-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportsView } from "@/components/reports/ReportsView";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [projects, bookings, leads] = await Promise.all([
    getProjects(),
    getBookings(),
    getLeads(),
  ]);

  return (
    <AppLayout>
      <ReportsView
        projects={projects}
        bookings={bookings}
        leads={leads}
      />
    </AppLayout>
  );
}
