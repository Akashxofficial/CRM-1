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

  const serializedUser = JSON.parse(JSON.stringify(user));
  const serializedProjects = JSON.parse(JSON.stringify(projects));

  return (
    <AppLayoutClient user={serializedUser} projects={serializedProjects}>
      {children}
    </AppLayoutClient>
  );
}
