import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProjects } from "@/actions/project-actions";
import { getBookings } from "@/actions/bookings-actions";
import { getLeads } from "@/actions/leads-actions";
import { getInventoryUnits } from "@/actions/inventory-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookingsListView } from "@/components/bookings/BookingsListView";
import { redirect } from "next/navigation";

export default async function BookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [bookings, projects, leads, availableUnits, paymentPlans] = await Promise.all([
    getBookings(),
    getProjects(),
    getLeads({ status: "NEGOTIATION" }),
    getInventoryUnits({ status: "AVAILABLE" }),
    prisma.paymentPlanTemplate.findMany(),
  ]);

  return (
    <AppLayout>
      <BookingsListView
        initialBookings={bookings}
        projects={projects}
        leads={leads}
        availableUnits={availableUnits}
        paymentPlans={paymentPlans}
        userRole={user.role}
      />
    </AppLayout>
  );
}
