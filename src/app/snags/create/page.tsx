import { getCurrentUser } from "@/lib/auth";
import { getBookings } from "@/actions/bookings-actions";
import { getSnagRecordById } from "@/actions/snag-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { CreateSnagView } from "@/components/snags/CreateSnagView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CreateSnagPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resolvedParams = await searchParams;
  const editId = resolvedParams?.id;

  const [bookings, existingSnag] = await Promise.all([
    getBookings(),
    editId ? getSnagRecordById(editId) : Promise.resolve(null),
  ]);

  return (
    <AppLayout>
      <CreateSnagView
        deals={bookings}
        initialValues={existingSnag || undefined}
        isEditMode={Boolean(existingSnag)}
      />
    </AppLayout>
  );
}
