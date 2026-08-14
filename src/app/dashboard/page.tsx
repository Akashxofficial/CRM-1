import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/actions/dashboard-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminDashboardView } from "@/components/dashboard/AdminDashboardView";
import { ManagerDashboardView } from "@/components/dashboard/ManagerDashboardView";
import { AgentDashboardView } from "@/components/dashboard/AgentDashboardView";
import { AccountsDashboardView } from "@/components/dashboard/AccountsDashboardView";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const data = await getDashboardData();

  return (
    <AppLayout>
      {user.role === "ADMIN" && <AdminDashboardView data={data} />}
      {user.role === "SALES_MANAGER" && <ManagerDashboardView data={data} />}
      {user.role === "SALES_AGENT" && <AgentDashboardView data={data} />}
      {user.role === "ACCOUNTS" && <AccountsDashboardView data={data} />}
      {user.role === "POST_SALES" && <AdminDashboardView data={data} />}
    </AppLayout>
  );
}
