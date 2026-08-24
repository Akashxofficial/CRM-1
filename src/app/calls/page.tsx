import { getCurrentUser } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { CallsWorkflowView } from "@/components/calls/CallsWorkflowView";
import { redirect } from "next/navigation";
import { getLeads } from "@/actions/leads-actions";

export const dynamic = "force-dynamic";

export default async function CallsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const leads = await getLeads();
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
