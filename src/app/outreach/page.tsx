import { getCurrentUser } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { OutreachView } from "@/components/outreach/OutreachView";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function OutreachPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let leadsCount = 1;
  let sampleLeadName = "Sumit Garg";

  try {
    const leads = await prisma.lead.findMany({
      where: { organizationId: user.organizationId },
      take: 1,
    });
    if (leads.length > 0) {
      leadsCount = await prisma.lead.count({ where: { organizationId: user.organizationId } });
      sampleLeadName = leads[0].name;
    }
  } catch (e) {
    // fallback
  }

  return (
    <AppLayout>
      <OutreachView leadsCount={leadsCount} sampleLeadName={sampleLeadName} />
    </AppLayout>
  );
}
