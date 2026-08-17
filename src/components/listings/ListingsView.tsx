"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  units?: any[];
}

export function ListingsView({ units = [] }: Props) {
  const [activeTab, setActiveTab] = useState<"ALL" | "NEW_BUILD" | "RESALE" | "RENTAL">("ALL");

  const listings = [
    {
      id: "l-1",
      unit: "2bhk",
      type: "New Build",
      builder: "DLF",
      project: "DLF Camellias",
      price: 100000000,
      commission: "3%",
      status: "Available",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
            Listings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {listings.length} listing in your catalog
          </p>
        </div>

        <button
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#3B8CFF] hover:bg-[#2570E8] text-white rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Listing</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeTab === "ALL"
              ? "bg-[#3B8CFF] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setActiveTab("NEW_BUILD")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeTab === "NEW_BUILD"
              ? "bg-[#3B8CFF] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          }`}
        >
          New Build <span className="ml-1 text-[11px] text-slate-400">1</span>
        </button>

        <button
          onClick={() => setActiveTab("RESALE")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeTab === "RESALE"
              ? "bg-[#3B8CFF] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          }`}
        >
          Resale <span className="ml-1 text-[11px] text-slate-400">0</span>
        </button>

        <button
          onClick={() => setActiveTab("RENTAL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeTab === "RENTAL"
              ? "bg-[#3B8CFF] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          }`}
        >
          Rental <span className="ml-1 text-[11px] text-slate-400">0</span>
        </button>
      </div>

      {/* Listings Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-slate-400 text-[11px] font-semibold">
              <tr>
                <th className="py-3.5 px-5">Unit</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Builder / Owner</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Commission</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-5 font-bold text-slate-900 font-heading">
                    {item.unit}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F6FF] text-[#3B8CFF] border border-[#B9D5FF]">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900">{item.builder}</div>
                    <div className="text-[11px] text-slate-400">{item.project}</div>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900 font-heading">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-4 px-4 font-semibold text-[#3B8CFF]">
                    {item.commission}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
