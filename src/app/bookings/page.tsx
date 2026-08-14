import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProjects } from "@/actions/project-actions";
import { getBookings } from "@/actions/bookings-actions";
import { getLeads } from "@/actions/leads-actions";
import { getInventoryUnits } from "@/actions/inventory-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookingsListView } from "@/components/bookings/BookingsListView";
import { redirect } from "next/navigation";

async function getPaymentPlans() {
  try {
    const plans = await prisma.paymentPlanTemplate.findMany();
    if (plans.length > 0) return plans;
  } catch (err) {
    console.warn("getPaymentPlans fallback:", err);
  }

  return [
    {
      id: "demo-plan-clp",
      name: "Construction Linked Plan (CLP)",
      isDefault: true,
      milestonesJson: JSON.stringify([
        { name: "On Booking Token", percentage: 10, days: 0 },
        { name: "On Agreement Execution", percentage: 10, days: 30 },
        { name: "On Foundation Completion", percentage: 15, days: 90 },
      ]),
    },
  ];
}

export default async function BookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [bookings, projects, leads, availableUnits, paymentPlans] = await Promise.all([
    getBookings(),
    getProjects(),
    getLeads({ status: "NEGOTIATION" }),
    getInventoryUnits({ status: "AVAILABLE" }),
    getPaymentPlans(),
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
