import { getCurrentUser } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { getDashboardData } from "@/actions/dashboard-actions";
import { formatCurrency } from "@/lib/utils";
import { Trophy } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getDashboardData();
  const reps = data.repLeaderboard || [];

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
            Rep Leaderboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rankings by confirmed booking volume & agreement value
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[500px]">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 pb-2">
                <tr>
                  <th className="py-2.5 font-bold w-10">#</th>
                  <th className="py-2.5 font-bold">REP</th>
                  <th className="py-2.5 font-bold text-center">LEADS</th>
                  <th className="py-2.5 font-bold text-center">BOOKED</th>
                  <th className="py-2.5 font-bold text-right">VALUE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reps.map((rep: any, idx: number) => (
                  <tr key={rep.name} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 font-bold text-slate-500">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs shadow-2xs">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-slate-900 text-sm">
                      {rep.name}
                    </td>
                    <td className="py-3.5 text-center text-slate-600 font-medium">
                      {rep.leads}
                    </td>
                    <td className="py-3.5 text-center text-slate-600 font-medium">
                      {rep.booked}
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-900 text-sm">
                      <div className="flex items-center justify-end gap-3">
                        <span>{formatCurrency(rep.value)}</span>
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div
                            style={{ width: `${Math.max(10, rep.percentage || 100)}%` }}
                            className="h-full bg-amber-500 rounded-full"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
