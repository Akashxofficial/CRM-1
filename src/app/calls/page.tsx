import { getCurrentUser } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { CallsWorkflowView } from "@/components/calls/CallsWorkflowView";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CallsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let leads: any[] = [];
  try {
    leads = await prisma.lead.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        assignedTo: true,
        project: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Database getLeads for Calls fallback:", err);
  }

  // Fallback demo inquiry lead if no leads exist yet
  if (leads.length === 0) {
    leads = [
      {
        id: "demo-inquiry-1",
        name: "aakash akash",
        email: "a@g.com",
        phone: "9989898989",
        source: "Customer Enquiry Form",
        status: "Inquiry",
        priority: "HOT",
        assignedTo: { name: user.name || "Yudhister Tiwari" },
        project: { name: "UrbanGaon One, Jagatpura" },
        activities: [],
      },
    ];
  }

  const serializableLeads = JSON.parse(JSON.stringify(leads));

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
            Calls & Telephony Workflow
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process incoming enquiries, state machine call transitions & gather customer requirements
          </p>
        </div>

        <CallsWorkflowView
          initialLeads={serializableLeads}
          currentUserName={user.name || "Yudhister Tiwari"}
        />
      </div>
    </AppLayout>
  );
}
