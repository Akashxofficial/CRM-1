"use client";

import { useState } from "react";
import { BarChart3, Download, TrendingUp, Building, Users, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Props {
  projects: any[];
  bookings: any[];
  leads: any[];
}

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#64748b"];

export function ReportsView({ projects, bookings, leads }: Props) {
  const [selectedReport, setSelectedReport] = useState<"sales" | "inventory" | "leads">("sales");

  // Project Sales Aggregates
  const projectSalesData = projects.map((p) => {
    const pBookings = bookings.filter((b) => b.projectId === p.id);
    const totalVal = pBookings.reduce((acc, b) => acc + b.agreementValue, 0);
    return {
      name: p.name,
      bookingsCount: pBookings.length,
      salesValue: totalVal,
    };
  });

  // Source-wise Lead Breakdown
  const sourceMap: Record<string, number> = {};
  leads.forEach((l) => {
    sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
  });
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  const exportReportCSV = () => {
    const headers = ["Project", "Total Units", "Confirmed Bookings", "Total Sales Value"];
    const rows = projects.map((p) => {
      const pBookings = bookings.filter((b) => b.projectId === p.id);
      const totalVal = pBookings.reduce((acc, b) => acc + b.agreementValue, 0);
      return [`"${p.name}"`, `"${p.totalUnits}"`, `"${pBookings.length}"`, `"${totalVal}"`];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `propcrm_executive_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-heading flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-500" /> Executive Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyze project revenue realization, lead source attribution, and unit absorption velocity.
          </p>
        </div>

        <button
          onClick={exportReportCSV}
          className="px-3.5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 transition"
        >
          <Download className="w-3.5 h-3.5" /> Export Executive Summary (CSV)
        </button>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Realized Sales Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Project-Wise Realized Sales Value
          </h2>
          <p className="text-xs text-slate-400 mb-6">Total contract value locked per development</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectSalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415520" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), "Sales Value"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="salesValue" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Acquisition Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Lead Generation Channel Share
          </h2>
          <p className="text-xs text-slate-400 mb-4">Acquisition channels distribution</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
