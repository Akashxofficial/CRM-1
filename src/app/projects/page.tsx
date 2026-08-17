import { getCurrentUser } from "@/lib/auth";
import { getProjects } from "@/actions/project-actions";
import { AppLayout } from "@/components/layout/AppLayout";
import { redirect } from "next/navigation";
import { Building, MapPin, Layers, CheckCircle2, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rawProjects = await getProjects();
  const projects = JSON.parse(JSON.stringify(rawProjects));

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-200 font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
              Projects & Developments
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Active real estate development portfolio & inventory towers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/listings"
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
            >
              View Inventory Catalog
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj: any) => (
            <div
              key={proj.id}
              className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#3B8CFF]/50 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#F0F6FF] text-[#3B8CFF] flex items-center justify-center font-bold shadow-2xs">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 font-heading">
                        {proj.name}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{proj.location}, {proj.city}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {proj.status || "Active Construction"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Total Units</span>
                    <span className="text-sm font-bold text-slate-900">{proj.totalUnits || 24}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">RERA Number</span>
                    <span className="text-xs font-bold text-slate-700 truncate block">{proj.reraNumber || "RAJ/RERA/2026"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Project Code</span>
                    <span className="text-xs font-bold text-[#3B8CFF]">{proj.code || "UG1"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Developer: <strong>UrbanGaon</strong>
                </span>
                <Link
                  href={`/listings?project=${proj.id}`}
                  className="text-xs font-bold text-[#3B8CFF] hover:underline"
                >
                  View Units →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
