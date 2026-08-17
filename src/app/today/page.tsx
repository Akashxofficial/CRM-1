import { getCurrentUser } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { TodayView } from "@/components/today/TodayView";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let tasks: any[] = [];
  try {
    tasks = await prisma.leadTask.findMany({
      where: {
        lead: { organizationId: user.organizationId },
        status: "PENDING",
      },
      include: { lead: true },
      orderBy: { dueDate: "asc" },
    });
  } catch (e) {
    tasks = [];
  }

  return (
    <AppLayout>
      <TodayView userName={user.name} tasks={tasks} />
    </AppLayout>
  );
}
