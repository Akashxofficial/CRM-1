import { getCurrentUser } from "@/lib/auth";
import { getProjects } from "@/actions/project-actions";
import { getPaymentSchedules, getDuesAgeingReport } from "@/actions/payments-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { PaymentsOverview } from "@/components/payments/PaymentsOverview";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [schedules, ageingReport, projects] = await Promise.all([
    getPaymentSchedules(),
    getDuesAgeingReport(),
    getProjects(),
  ]);

  return (
    <AppLayout>
      <PaymentsOverview
        schedules={schedules}
        ageingReport={ageingReport}
        projects={projects}
        userName={user.name}
        userRole={user.role}
      />
    </AppLayout>
  );
}
