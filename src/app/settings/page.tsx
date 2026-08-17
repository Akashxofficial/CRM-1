import { getCurrentUser } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Settings, User, Building, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
            Settings & Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organization details, team roles, and CRM integrations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Organization Profile Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3B8CFF] to-[#1A57BD] text-white flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-heading">
                  Organization Profile
                </h2>
                <p className="text-xs text-slate-400">Brokerage & Builder Workspace</p>
              </div>
            </div>

            <div className="space-y-3 text-xs pt-2">
              <div>
                <label className="text-slate-400 block mb-1">Company Name</label>
                <input
                  readOnly
                  value={user.organizationName || "Demo Broker Co"}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Registered City / Hub</label>
                <input
                  readOnly
                  value="Gurugram / NCR"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* User Account Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-heading">
                  User Account
                </h2>
                <p className="text-xs text-slate-400">Authenticated Session</p>
              </div>
            </div>

            <div className="space-y-3 text-xs pt-2">
              <div>
                <label className="text-slate-400 block mb-1">Name</label>
                <input
                  readOnly
                  value={user.name}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Assigned Role</label>
                <input
                  readOnly
                  value={user.role}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 font-semibold uppercase"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
