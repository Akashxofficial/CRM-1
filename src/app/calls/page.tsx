import { getCurrentUser } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { PhoneCall, Plus, Phone, CheckCircle, Clock } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CallsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
              Calls & Telephony
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live call logs, Exotel / Cloud telephony dialer & recordings
            </p>
          </div>

          <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#3B8CFF] hover:bg-[#2570E8] text-white rounded-xl shadow-sm transition">
            <Plus className="w-4 h-4" />
            <span>Log Manual Call</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Calls Today</span>
            <div className="mt-2 text-2xl font-bold text-[#3B8CFF] font-heading">0</div>
            <p className="text-xs text-slate-400 mt-0.5">via Exotel or manual</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Connected Rate</span>
            <div className="mt-2 text-2xl font-bold text-emerald-500 font-heading">0%</div>
            <p className="text-xs text-slate-400 mt-0.5">0 connected</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Active Leads Stale (3d+)</span>
            <div className="mt-2 text-2xl font-bold text-amber-500 font-heading">0</div>
            <p className="text-xs text-slate-400 mt-0.5">Need immediate follow-up</p>
          </div>
        </div>

        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#F0F6FF] text-[#3B8CFF] flex items-center justify-center mb-3">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 font-heading">
            No active calls logged today
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            All calls initiated from the Lead Drawer or Cloud Telephony will automatically appear here in real-time.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
