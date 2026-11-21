"use client";

import { useState } from "react";
import { ChevronRight, Plus, Phone, FileText, Percent, Building } from "lucide-react";
import Link from "next/link";

interface Props {
  projects?: any[];
}

//

//


export function BuildersView({ projects = [] }: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const builders = [
    {
      id: "b-1",
      name: "DLF",
      status: "Active",
      contactPerson: "Sumit Garg",
      phone: "8291400006",
      rera: "RERA: ABGC123",
      commission: "3% default",
      projectsCount: projects.length || 1,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
            Builder Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {builders.length} developer registered
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#3B8CFF] hover:bg-[#2570E8] text-white rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Builder</span>
        </button>
      </div>

      {/* Builder Registry List */}
      <div className="space-y-3">
        {builders.map((builder) => (
          <div
            key={builder.id}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#3B8CFF]/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3">
              <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5 sm:mt-0 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm font-heading">
                    {builder.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                    {builder.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>{builder.contactPerson}</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {builder.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    {builder.rera}
                  </span>
                </div>
              </div>
            </div>

            {/* Right badges */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#F0F6FF] text-[#3B8CFF] border border-[#B9D5FF] flex items-center gap-1">
                <Percent className="w-3 h-3" />
                {builder.commission}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {builder.projectsCount} project
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
