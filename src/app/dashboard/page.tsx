import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/actions/dashboard-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminDashboardView } from "@/components/dashboard/AdminDashboardView";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const rawData = await getDashboardData();
  const data = JSON.parse(JSON.stringify(rawData));

  return (
    <AppLayout>
      <AdminDashboardView data={data} />
    </AppLayout>
  );
}
