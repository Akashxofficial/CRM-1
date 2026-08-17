import { getCurrentUser } from "@/lib/auth";
import { getProjects } from "@/actions/project-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { BuildersView } from "@/components/builders/BuildersView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BuildersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await getProjects();

  return (
    <AppLayout>
      <BuildersView projects={projects} />
    </AppLayout>
  );
}
