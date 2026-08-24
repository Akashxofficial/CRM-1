import { getCurrentUser } from "@/lib/auth";
import { getSnagRecords } from "@/actions/snag-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { SnagsListView } from "@/components/snags/SnagsListView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SnagsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const snags = await getSnagRecords();

  return (
    <AppLayout>
      <SnagsListView initialSnags={snags} userRole={user.role} />
    </AppLayout>
  );
}
