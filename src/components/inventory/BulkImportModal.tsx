"use client";

import { useState, useTransition } from "react";
import { Upload, FileSpreadsheet, Download, Loader2, Check, AlertCircle } from "lucide-react";
import { bulkImportUnitsCSVAction } from "@/actions/inventory-actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
}

export function BulkImportModal({ isOpen, onClose, projects }: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");
  const [selectedTowerId, setSelectedTowerId] = useState(projects[0]?.towers[0]?.id || "");
  const [csvContent, setCsvContent] = useState(
    `unitNumber,floor,type,areaSqft,carpetAreaSqft,facing,baseRate,plcCharges,parkingCharges,status
A-701,7,2BHK,1250,980,East,8900,150000,300000,AVAILABLE
A-702,7,3BHK,1650,1320,North,8900,200000,300000,AVAILABLE
A-801,8,2BHK,1250,980,East,9000,150000,300000,AVAILABLE
A-802,8,3BHK,1650,1320,North,9000,200000,300000,AVAILABLE`
  );
  const [isPending, startTransition] = useTransition();
  const [resultMessage, setResultMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const towers = currentProject?.towers || [];

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setResultMessage("");

    if (!selectedProjectId || !selectedTowerId) {
      setErrorMessage("Please select a valid Project and Tower.");
      return;
    }

    try {
      const lines = csvContent.trim().split("\n");
      if (lines.length < 2) {
        setErrorMessage("CSV must contain at least 1 header row and 1 data row.");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const rows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length < 2) continue;
        const rowObj: any = {};
        headers.forEach((h, index) => {
          rowObj[h] = values[index] || "";
        });
        rows.push(rowObj);
      }

      startTransition(async () => {
        const res = await bulkImportUnitsCSVAction(selectedProjectId, selectedTowerId, rows);
        if (res.success) {
          setResultMessage(`Successfully imported / updated ${res.count} units!`);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse CSV.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setCsvContent(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-sky-500">
              Bulk Unit Inventory Upload
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Import Units via CSV / Excel
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleImport} className="p-6 space-y-4">
          {resultMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{resultMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Target Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  const p = projects.find((x) => x.id === e.target.value);
                  if (p?.towers[0]) setSelectedTowerId(p.towers[0].id);
                }}
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
                Target Tower
              </label>
              <select
                value={selectedTowerId}
                onChange={(e) => setSelectedTowerId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {towers.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase text-slate-400">
                CSV Data (Paste or Upload File)
              </label>
              <label className="text-xs text-sky-500 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                <Upload className="w-3 h-3" /> Upload .csv file
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <textarea
              rows={8}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full p-3 font-mono text-xs rounded-xl bg-slate-950 text-slate-200 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Required headers: <code className="text-sky-400">unitNumber,floor,type,areaSqft,carpetAreaSqft,facing,baseRate,plcCharges,parkingCharges,status</code>
            </p>
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
              <span>Import Units</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
