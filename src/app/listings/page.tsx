import { getCurrentUser } from "@/lib/auth";
import { getInventoryUnits } from "@/actions/inventory-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { ListingsView } from "@/components/listings/ListingsView";
import { redirect } from "next/navigation";

export default async function ListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const units = await getInventoryUnits();

  return (
    <AppLayout>
      <ListingsView units={units} />
    </AppLayout>
  );
}
