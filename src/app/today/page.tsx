import { getCurrentUser } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { TodayView } from "@/components/today/TodayView";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCached } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tasks = await getCached(`tasks_today_${user.organizationId}`, async () => {
    try {
      const dbTasks = await prisma.leadTask.findMany({
        where: {
          lead: { organizationId: user.organizationId },
          status: "PENDING",
        },
        include: { lead: true },
        orderBy: { dueDate: "asc" },
      });
      return dbTasks;
    } catch (e) {
      return [];
    }
  }, 20_000);

  return (
    <AppLayout>
      <TodayView userName={user.name} tasks={tasks} />
    </AppLayout>
  );
}
