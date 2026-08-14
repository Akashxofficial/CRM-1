import { getCurrentUser } from "@/lib/auth";
import { getBookingById } from "@/actions/bookings-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookingDetailView } from "@/components/bookings/BookingDetailView";
import { notFound, redirect } from "next/navigation";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    notFound();
  }

  return (
    <AppLayout>
      <BookingDetailView booking={booking} userRole={user.role} />
    </AppLayout>
  );
}
