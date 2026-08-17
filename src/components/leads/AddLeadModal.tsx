"use client";

import { useState, useTransition, useEffect } from "react";
import { Plus, Loader2, AlertTriangle, Check, UserPlus } from "lucide-react";
import { createLeadAction, checkDuplicateLead } from "@/actions/leads-actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
  users: any[];
}

export function AddLeadModal({ isOpen, onClose, projects, users }: Props) {
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("Website");
  const [interestedType, setInterestedType] = useState("3BHK");
  const [budgetMin, setBudgetMin] = useState("10000000");
  const [budgetMax, setBudgetMax] = useState("15000000");
  const [priority, setPriority] = useState("MEDIUM");
  const [assignedToId, setAssignedToId] = useState("");
  const [initialNote, setInitialNote] = useState("");

  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Check duplicate when phone or email changes
  useEffect(() => {
    if (phone.length >= 10 || (email && email.includes("@"))) {
      const timer = setTimeout(async () => {
        const res = await checkDuplicateLead(phone, email);
        if (res.exists) {
          setDupWarning(res.message || "Duplicate lead detected!");
        } else {
          setDupWarning(null);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setDupWarning(null);
    }
  }, [phone, email]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await createLeadAction({
        projectId,
        name,
        phone,
        email,
        source,
        interestedType,
        budgetMin: parseFloat(budgetMin) || undefined,
        budgetMax: parseFloat(budgetMax) || undefined,
        priority,
        assignedToId: assignedToId || undefined,
        initialNote,
      });
      onClose();
      window.location.reload();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-sky-500">
              Full-Funnel CRM
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-sky-500" /> Capture New Real Estate Lead
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Duplicate Lead Detection Alert */}
          {dupWarning && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Duplicate Lead Warning</strong>
                <span>{dupWarning}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Project *
              </label>
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Lead Source *
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Walk-in">Walk-in Experience Center</option>
                <option value="Portal">Property Portal (MagicBricks/99acres)</option>
                <option value="Google Ads">Google Ads Campaign</option>
                <option value="Facebook Ads">Meta / Instagram Ads</option>
                <option value="Channel Partner">Channel Partner (Broker)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Client Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98450 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. buyer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Interested Unit Type
              </label>
              <select
                value={interestedType}
                onChange={(e) => setInterestedType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="4BHK">4 BHK</option>
                <option value="PENTHOUSE">Penthouse</option>
                <option value="VILLA">Villa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Min Budget (₹)
              </label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Max Budget (₹)
              </label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="HOT">🔥 Hot Prospect</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Assign Sales Agent
            </label>
            <select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">Auto-Assign / Default</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Initial Notes / Requirement
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Looking for higher floor East facing flat, immediate site visit requested."
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
