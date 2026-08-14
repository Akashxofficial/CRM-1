"use client";

import { useState, useTransition } from "react";
import {
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  MessageSquare,
  Building,
  User,
  ArrowRight,
  Loader2,
  CheckSquare,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  updateLeadStatusAction,
  addLeadActivityAction,
  addLeadTaskAction,
  toggleTaskStatusAction,
} from "@/actions/leads-actions";
import Link from "next/link";

interface Props {
  lead: any;
  onClose: () => void;
  availableUnits: any[];
}

const PIPELINE_STAGES = [
  { key: "NEW", label: "New" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "SITE_VISIT_SCHEDULED", label: "Site Visit Scheduled" },
  { key: "SITE_VISIT_DONE", label: "Site Visit Done" },
  { key: "NEGOTIATION", label: "Negotiation" },
  { key: "BOOKED", label: "Booked" },
];

export function LeadDrawer({ lead, onClose, availableUnits }: Props) {
  const [activeTab, setActiveTab] = useState<"timeline" | "tasks">("timeline");

  // Activity form
  const [actType, setActType] = useState("CALL");
  const [actTitle, setActTitle] = useState("");
  const [actNotes, setActNotes] = useState("");
  const [siteVisitDate, setSiteVisitDate] = useState("");

  // Task form
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");

  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      await updateLeadStatusAction(lead.id, newStatus);
      window.location.reload();
    });
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim()) return;
    startTransition(async () => {
      await addLeadActivityAction({
        leadId: lead.id,
        type: actType,
        title: actTitle,
        notes: actNotes,
        siteVisitDate: actType === "SITE_VISIT" && siteVisitDate ? siteVisitDate : undefined,
      });
      setActTitle("");
      setActNotes("");
      setSiteVisitDate("");
      window.location.reload();
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDueDate) return;
    startTransition(async () => {
      await addLeadTaskAction({
        leadId: lead.id,
        title: taskTitle,
        dueDate: taskDueDate,
        priority: taskPriority,
      });
      setTaskTitle("");
      setTaskDueDate("");
      window.location.reload();
    });
  };

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    startTransition(async () => {
      await toggleTaskStatusAction(taskId, nextStatus);
      window.location.reload();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-sky-500">
                {lead.project?.name}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  lead.priority === "HOT"
                    ? "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {lead.priority} Priority
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {lead.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.phone}
              </span>
              {lead.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {lead.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Assigned: {lead.assignedTo?.name || "Unassigned"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pipeline Stage Progression Stepper */}
        <div className="p-4 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Funnel Stage Progression
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {PIPELINE_STAGES.map((s) => {
              const isCurrent = lead.status === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => handleStatusChange(s.key)}
                  disabled={isPending}
                  className={`py-2 px-1 text-[11px] font-semibold rounded-lg text-center transition border ${
                    isCurrent
                      ? "bg-sky-600 text-white border-sky-500 shadow-sm"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1-Click Convert to Booking Action Banner */}
        {lead.status !== "BOOKED" && (
          <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Ready to lock the sale? Convert this lead into a confirmed booking.</span>
            </div>
            <Link
              href={`/bookings?leadId=${lead.id}&unitId=${lead.interestedUnitId || ""}`}
              className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1 transition flex-shrink-0"
            >
              <span>Convert to Booking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Lead Details Overview */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Interested Unit Type</span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{lead.interestedType || "Any"}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Budget Range</span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
              {formatCurrency(lead.budgetMin)} - {formatCurrency(lead.budgetMax)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Lead Source</span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{lead.source}</span>
          </div>
        </div>

        {/* Tabs: Timeline vs Tasks */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 mr-6 transition ${
              activeTab === "timeline"
                ? "border-sky-500 text-sky-500"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Activity Timeline ({lead.activities?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === "tasks"
                ? "border-sky-500 text-sky-500"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Follow-up Tasks ({lead.tasks?.length || 0})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeTab === "timeline" && (
            <div className="space-y-6">
              {/* Add Activity Form */}
              <form onSubmit={handleAddActivity} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">Log Customer Touchpoint</span>
                  <div className="flex gap-1">
                    {["CALL", "SITE_VISIT", "NOTE", "WHATSAPP"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setActType(t)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          actType === t
                            ? "bg-sky-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Activity Title (e.g. Call to discuss payment scheme)"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />

                {actType === "SITE_VISIT" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Site Visit Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={siteVisitDate}
                      onChange={(e) => setSiteVisitDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <textarea
                  rows={2}
                  placeholder="Detailed notes or client feedback..."
                  value={actNotes}
                  onChange={(e) => setActNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Activity</span>
                  </button>
                </div>
              </form>

              {/* Activities Stream */}
              <div className="space-y-4">
                {lead.activities?.map((act: any) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{act.title}</span>
                        <span className="text-[10px] text-slate-400">{formatDateTime(act.createdAt)}</span>
                      </div>
                      {act.notes && <p className="text-slate-600 dark:text-slate-300 mt-1">{act.notes}</p>}
                      <span className="text-[10px] text-slate-400 block mt-2">
                        Logged by: {act.performedBy?.name || "System"} ({act.type})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-6">
              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <span className="text-xs font-bold uppercase text-slate-400">Schedule Follow-up Reminder</span>

                <input
                  type="text"
                  required
                  placeholder="Task Title (e.g. Call to confirm cheque handover)"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Priority
                    </label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High Priority</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Add Task</span>
                  </button>
                </div>
              </form>

              {/* Task Checklist */}
              <div className="space-y-3">
                {lead.tasks?.map((t: any) => {
                  const isDone = t.status === "COMPLETED";
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTask(t.id, t.status)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                            isDone
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 dark:border-slate-600 hover:border-slate-400"
                          }`}
                        >
                          {isDone && <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <span className={`font-bold ${isDone ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}>
                            {t.title}
                          </span>
                          <span className="text-[10px] text-amber-600 block mt-0.5">
                            Due: {new Date(t.dueDate).toLocaleDateString()} • {t.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
