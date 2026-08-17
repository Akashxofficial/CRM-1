"use client";

import { useState } from "react";
import { Send, Sparkles, MessageSquare, Check, Users } from "lucide-react";
import Link from "next/link";

interface Props {
  leadsCount?: number;
  sampleLeadName?: string;
}

export function OutreachView({ leadsCount = 1, sampleLeadName = "Sumit Garg" }: Props) {
  const [activeTab, setActiveTab] = useState<"CAMPAIGNS" | "AUTOMATIONS" | "TEMPLATES">("CAMPAIGNS");
  const [confirmed, setConfirmed] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
          Outreach
        </h1>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("CAMPAIGNS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "CAMPAIGNS"
                ? "bg-[#3B8CFF] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>One-time Campaigns</span>
          </button>

          <button
            onClick={() => setActiveTab("AUTOMATIONS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "AUTOMATIONS"
                ? "bg-[#3B8CFF] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automations</span>
          </button>

          <button
            onClick={() => setActiveTab("TEMPLATES")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "TEMPLATES"
                ? "bg-[#3B8CFF] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium">Log</span>
      </div>

      {/* Main Campaign Form & Recipients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
          {/* WhatsApp Campaign Title */}
          <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-heading">
                WhatsApp Campaign
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Send a WhatsApp Business template to a segment of leads
              </p>
            </div>
          </div>

          {/* 1. CHOOSE TEMPLATE */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              1. CHOOSE TEMPLATE
            </span>
            <p className="text-xs text-slate-500">
              No active WhatsApp Business templates. Create one in{" "}
              <button
                onClick={() => setActiveTab("TEMPLATES")}
                className="text-[#3B8CFF] hover:underline font-semibold"
              >
                Templates
              </button>
              .
            </p>
          </div>

          {/* 2. TARGET SEGMENT */}
          <div className="space-y-3 pt-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                2. TARGET SEGMENT
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Leave filters blank to send to all leads with a phone number (max 500).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Project</label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 focus:outline-none"
                >
                  <option>All Projects</option>
                  <option>DLF Camellias</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Source</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 focus:outline-none"
                >
                  <option>All Sources</option>
                  <option>Housing.com</option>
                  <option>Website Direct</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Classification</label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 focus:outline-none"
                >
                  <option>All</option>
                  <option>Hot</option>
                  <option>Warm</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 focus:outline-none"
                >
                  <option>All Statuses</option>
                  <option>New</option>
                  <option>Booked</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. SEND */}
          <div className="space-y-3 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
              3. SEND
            </span>

            <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-4 h-4 rounded text-[#3B8CFF] focus:ring-[#3B8CFF] border-slate-300"
              />
              <span>
                I confirm I want to send this WhatsApp template to {leadsCount} leads. This cannot be undone.
              </span>
            </label>

            <button
              disabled={!confirmed}
              onClick={() => setIsSent(true)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition flex items-center gap-1.5 ${
                confirmed
                  ? "bg-[#10B981] hover:bg-[#059669] shadow-sm"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Campaign</span>
            </button>

            {isSent && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Campaign dispatched successfully!
              </p>
            )}
          </div>
        </div>

        {/* Right Recipients Card */}
        <div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 font-heading">
              <Users className="w-4 h-4 text-[#3B8CFF]" />
              <span>Recipients</span>
            </div>

            <div>
              <div className="text-xl font-bold text-slate-900 font-heading">
                {leadsCount}
              </div>
              <p className="text-xs text-slate-400">leads with a phone number</p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                SAMPLE
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {sampleLeadName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
