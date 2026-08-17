import { getCurrentUser } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { FileSpreadsheet, Plus, Download } from "lucide-react";
import { redirect } from "next/navigation";

export default async function IncentiveSheetsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
              Incentive Sheets
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Sales rep commission payout calculations & performance slabs
            </p>
          </div>

          <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#3B8CFF] hover:bg-[#2570E8] text-white rounded-xl shadow-sm transition">
            <Plus className="w-4 h-4" />
            <span>New Incentive Slab</span>
          </button>
        </div>

        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#F0F6FF] text-[#3B8CFF] flex items-center justify-center mb-3">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 font-heading">
            Current Quarter Incentive Period: Q1 2026
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Standard brokerage slab set to 3.0% on confirmed milestone receipts.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
