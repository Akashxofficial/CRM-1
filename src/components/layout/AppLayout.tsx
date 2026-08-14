import { getCurrentUser } from "@/lib/auth";
import { getProjects } from "@/actions/project-actions";
import { AppLayoutClient } from "./AppLayoutClient";
import { redirect } from "next/navigation";

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const projects = await getProjects();

  return (
    <AppLayoutClient user={user} projects={projects}>
      {children}
    </AppLayoutClient>
  );
}
