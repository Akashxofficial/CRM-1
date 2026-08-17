import { getCurrentUser } from "@/lib/auth";
import { getProjects } from "@/actions/project-actions";
import { getPostSalesBookings } from "@/actions/documents-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentsView } from "@/components/documents/DocumentsView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [bookings, projects] = await Promise.all([
    getPostSalesBookings(),
    getProjects(),
  ]);

  return (
    <AppLayout>
      <DocumentsView
        bookings={bookings}
        projects={projects}
        userRole={user.role}
      />
    </AppLayout>
  );
}
