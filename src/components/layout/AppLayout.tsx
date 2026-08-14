import { getCurrentUser } from "@/lib/auth";
import { getProjects } from "@/actions/project-actions";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { redirect } from "next/navigation";

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const projects = await getProjects();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar user={user} projects={projects} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
