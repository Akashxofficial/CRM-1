"use client";

import { useState, useMemo, useTransition, useRef } from "react";
import {
  X,
  Sparkles,
  Upload,
  Plus,
  Building2,
  MapPin,
  Home,
  Trash2,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { generateUnitsBatchAction } from "@/actions/inventory-actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
  selectedProjectId?: string;
  onUnitsGenerated?: (newUnits: any[]) => void;
}

interface UnitRowConfig {
  id: string;
  category: string;
  facing: string;
  superArea: number;
  carpetArea: number;
  basePrice: number;
}

const UNIT_CATEGORIES = [
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4 BHK",
  "5 BHK",
  "Studio",
  "Penthouse",
  "Duplex",
  "Plot",
  "Villa",
  "Commercial",
  "Shop",
];

const FACING_OPTIONS = [
  "Facing...",
  "East",
  "North",
  "West",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

export function AddInventoryModal({
  isOpen,
  onClose,
  projects,
  selectedProjectId,
  onUnitsGenerated,
}: Props) {
  const [activeTab, setActiveTab] = useState<"generate" | "import" | "single">(
    "generate"
  );
  const [patternType, setPatternType] = useState<"tower" | "plots" | "villas">(
    "tower"
  );

  const [projectId, setProjectId] = useState<string>(
    selectedProjectId && selectedProjectId !== "ALL"
      ? selectedProjectId
      : projects[0]?.id || "demo-proj-1"
  );

  // Tower configuration
  const [towerName, setTowerName] = useState("A");
  const [floorFrom, setFloorFrom] = useState(1);
  const [floorTo, setFloorTo] = useState(12);
  const [unitStyle, setUnitStyle] = useState("01, 02, 03...");
  const [unitFormat, setUnitFormat] = useState("{block}-{floor}{unit}");
  const [groundLabel, setGroundLabel] = useState("");
  const [skipFloors, setSkipFloors] = useState("13");
  const [floorRise, setFloorRise] = useState(0);
  const [sizeUnit, setSizeUnit] = useState("sqft");

  const [unitRows, setUnitRows] = useState<UnitRowConfig[]>([
    {
      id: "row-1",
      category: "2 BHK",
      facing: "Facing...",
      superArea: 1200,
      carpetArea: 850,
      basePrice: 4500000,
    },
    {
      id: "row-2",
      category: "3 BHK",
      facing: "Facing...",
      superArea: 1500,
      carpetArea: 1050,
      basePrice: 5800000,
    },
  ]);

  // Plots configuration
  const [plotBlock, setPlotBlock] = useState("Sector A");
  const [plotFrom, setPlotFrom] = useState(1);
  const [plotTo, setPlotTo] = useState(50);
  const [plotFormat, setPlotFormat] = useState("Plot {num}");
  const [plotArea, setPlotArea] = useState(1200);
  const [plotFacing, setPlotFacing] = useState("East");
  const [plotBasePrice, setPlotBasePrice] = useState(2500000);

  // Single unit configuration
  const [singleUnitNumber, setSingleUnitNumber] = useState("");
  const [singleFloor, setSingleFloor] = useState(1);
  const [singleCategory, setSingleCategory] = useState("2 BHK");
  const [singleFacing, setSingleFacing] = useState("East");
  const [singleSuperArea, setSingleSuperArea] = useState(1200);
  const [singleCarpetArea, setSingleCarpetArea] = useState(900);
  const [singlePrice, setSinglePrice] = useState(4500000);
  const [singleStatus, setSingleStatus] = useState("AVAILABLE");

  // CSV Import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvParsedUnits, setCsvParsedUnits] = useState<any[]>([]);
  const [csvRawText, setCsvRawText] = useState("");
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();

  const currentProject =
    projects.find((p) => p.id === projectId) || projects[0];

  // Helper to add unit row
  const addUnitRow = () => {
    setUnitRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        category: "2 BHK",
        facing: "Facing...",
        superArea: 1200,
        carpetArea: 850,
        basePrice: 4500000,
      },
    ]);
  };

  const removeUnitRow = (id: string) => {
    if (unitRows.length <= 1) return;
    setUnitRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateUnitRow = (id: string, field: keyof UnitRowConfig, val: any) => {
    setUnitRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  // Tag click helper
  const appendTag = (tag: string) => {
    setUnitFormat((prev) => prev + tag);
  };

  // CSV Parse Handler
  const parseCSVText = (text: string) => {
    try {
      const lines = text.trim().split("\n");
      if (lines.length < 2) {
        setImportStatus({
          type: "error",
          message: "CSV must have at least a header row and 1 data row.",
        });
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const parsed: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const vals = line.split(",").map((v) => v.trim());
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = vals[idx] || "";
        });

        const uNum =
          row["unitnumber"] ||
          row["unit"] ||
          row["plot"] ||
          row["number"] ||
          `Unit-${i}`;
        const floor = parseInt(row["floor"] || "1") || 1;
        const type = row["type"] || row["category"] || "Plot";
        const area = parseFloat(row["areasqft"] || row["area"] || "1200") || 1200;
        const carpet =
          parseFloat(row["carpetareasqft"] || row["carpet"] || `${area * 0.8}`) ||
          area * 0.8;
        const facing = row["facing"] || "East";
        const baseRate = parseFloat(row["baserate"] || row["rate"] || "4500") || 4500;
        const plc = parseFloat(row["plccharges"] || row["plc"] || "0") || 0;
        const parking =
          parseFloat(row["parkingcharges"] || row["parking"] || "0") || 0;
        const total =
          parseFloat(row["totalcost"] || row["price"] || `${area * baseRate + plc + parking}`) ||
          area * baseRate + plc + parking;
        const status = (row["status"] || "AVAILABLE").toUpperCase();

        parsed.push({
          unitNumber: uNum,
          floor,
          type,
          areaSqft: area,
          carpetAreaSqft: Math.round(carpet),
          facing,
          baseRate,
          plcCharges: plc,
          parkingCharges: parking,
          totalCost: total,
          status,
        });
      }

      if (parsed.length > 0) {
        setCsvParsedUnits(parsed);
        setImportStatus({
          type: "success",
          message: `Parsed ${parsed.length} units ready to import.`,
        });
      }
    } catch (e: any) {
      setImportStatus({
        type: "error",
        message: e.message || "Failed to parse CSV file.",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvRawText(text);
        parseCSVText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvRawText(text);
        parseCSVText(text);
      }
    };
    reader.readAsText(file);
  };

  // Generate preview list
  const generatedUnits = useMemo(() => {
    if (activeTab === "import") {
      return csvParsedUnits;
    }

    if (activeTab === "single") {
      return [
        {
          unitNumber: singleUnitNumber || "Plot 1",
          floor: singleFloor,
          type: singleCategory,
          areaSqft: singleSuperArea,
          carpetAreaSqft: singleCarpetArea,
          facing: singleFacing,
          baseRate: Math.round(singlePrice / (singleSuperArea || 1)),
          totalCost: singlePrice,
          status: singleStatus,
        },
      ];
    }

    if (patternType === "plots") {
      const units: any[] = [];
      const from = Math.min(plotFrom, plotTo);
      const to = Math.max(plotFrom, plotTo);
      for (let i = from; i <= to; i++) {
        const uNum = plotFormat
          .replace("{block}", plotBlock)
          .replace("{num}", i.toString());
        units.push({
          unitNumber: uNum,
          floor: 1,
          type: "Plot",
          areaSqft: plotArea,
          carpetAreaSqft: plotArea,
          facing: plotFacing === "Facing..." ? "East" : plotFacing,
          baseRate: Math.round(plotBasePrice / (plotArea || 1)),
          totalCost: plotBasePrice,
          status: "AVAILABLE",
        });
      }
      return units;
    }

    if (patternType === "villas") {
      const units: any[] = [];
      const from = Math.min(plotFrom, plotTo);
      const to = Math.max(plotFrom, plotTo);
      for (let i = from; i <= to; i++) {
        const uNum = `Villa ${i}`;
        units.push({
          unitNumber: uNum,
          floor: 1,
          type: "Villa",
          areaSqft: 2200,
          carpetAreaSqft: 1800,
          facing: "East",
          baseRate: 4000,
          totalCost: 8800000,
          status: "AVAILABLE",
        });
      }
      return units;
    }

    // High-rise Tower generator
    const units: any[] = [];
    const skipped = skipFloors
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    const fFrom = Math.min(floorFrom, floorTo);
    const fTo = Math.max(floorFrom, floorTo);

    for (let f = fFrom; f <= fTo; f++) {
      if (skipped.includes(f)) continue;

      const floorLabel = f === 0 && groundLabel ? groundLabel : f.toString();

      unitRows.forEach((row, uIdx) => {
        let uCode = (uIdx + 1).toString();
        if (unitStyle.includes("01")) {
          uCode = (uIdx + 1).toString().padStart(2, "0");
        } else if (unitStyle.includes("A, B")) {
          uCode = String.fromCharCode(65 + uIdx);
        }

        const unitNum = unitFormat
          .replace("{block}", towerName)
          .replace("{floor}", floorLabel)
          .replace("{unit}", uCode);

        const riseAdded = floorRise * Math.max(0, f - fFrom);
        const finalPrice = row.basePrice + riseAdded;

        units.push({
          unitNumber: unitNum,
          floor: f,
          type: row.category,
          areaSqft: row.superArea,
          carpetAreaSqft: row.carpetArea,
          facing: row.facing === "Facing..." ? "East" : row.facing,
          baseRate: Math.round(finalPrice / (row.superArea || 1)),
          totalCost: finalPrice,
          status: "AVAILABLE",
        });
      });
    }

    return units;
  }, [
    activeTab,
    patternType,
    csvParsedUnits,
    towerName,
    floorFrom,
    floorTo,
    unitStyle,
    unitFormat,
    groundLabel,
    skipFloors,
    floorRise,
    unitRows,
    plotBlock,
    plotFrom,
    plotTo,
    plotFormat,
    plotArea,
    plotFacing,
    plotBasePrice,
    singleUnitNumber,
    singleFloor,
    singleCategory,
    singleFacing,
    singleSuperArea,
    singleCarpetArea,
    singlePrice,
    singleStatus,
  ]);

  if (!isOpen) return null;

  const handleGenerateSubmit = () => {
    if (generatedUnits.length === 0) return;

    startTransition(async () => {
      try {
        const tName =
          activeTab === "import"
            ? "Imported Units"
            : patternType === "plots"
            ? plotBlock || "Phase 1"
            : patternType === "villas"
            ? "Villa Cluster"
            : `Tower ${towerName}`;

        await generateUnitsBatchAction(projectId, tName, generatedUnits);

        if (onUnitsGenerated) {
          onUnitsGenerated(generatedUnits);
        }

        onClose();
        window.location.reload();
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Add inventory
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              to {currentProject?.name || "UrbanGaon CRM"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Top 3 Mode Switcher */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("generate")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === "generate"
                  ? "bg-[#4F46E5] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("import")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === "import"
                  ? "bg-[#4F46E5] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Import
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("single")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === "single"
                  ? "bg-[#4F46E5] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Single unit
            </button>
          </div>

          <p className="text-xs text-slate-500 font-medium -mt-2">
            {activeTab === "generate"
              ? "Build a whole tower or plot range from a pattern"
              : activeTab === "import"
              ? "Upload CSV file with unit numbers, area, rates and statuses"
              : "Add an individual plot or flat to inventory"}
          </p>

          {/* TAB 1: GENERATE PATTERN */}
          {activeTab === "generate" && (
            <div className="space-y-5">
              {/* Pattern Type Pills */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPatternType("tower")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                    patternType === "tower"
                      ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  High-rise Tower
                </button>

                <button
                  type="button"
                  onClick={() => setPatternType("plots")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                    patternType === "plots"
                      ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Plots
                </button>

                <button
                  type="button"
                  onClick={() => setPatternType("villas")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                    patternType === "villas"
                      ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  Villas / Rows
                </button>
              </div>

              {/* TOWER CONFIGURATION */}
              {patternType === "tower" && (
                <div className="space-y-4">
                  {/* Row 1: Tower Name, Floor From, Floor To, Unit Style */}
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Tower / Block name
                      </label>
                      <input
                        type="text"
                        value={towerName}
                        onChange={(e) => setTowerName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        placeholder="A"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Floor from
                      </label>
                      <input
                        type="number"
                        value={floorFrom}
                        onChange={(e) =>
                          setFloorFrom(parseInt(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Floor to
                      </label>
                      <input
                        type="number"
                        value={floorTo}
                        onChange={(e) =>
                          setFloorTo(parseInt(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Unit style
                      </label>
                      <select
                        value={unitStyle}
                        onChange={(e) => setUnitStyle(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none cursor-pointer"
                      >
                        <option value="01, 02, 03...">01, 02, 03...</option>
                        <option value="1, 2, 3...">1, 2, 3...</option>
                        <option value="A, B, C...">A, B, C...</option>
                        <option value="101, 102...">101, 102...</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Unit number format + Ground Label + Skip floors */}
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-6">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Unit number format
                      </label>
                      <input
                        type="text"
                        value={unitFormat}
                        onChange={(e) => setUnitFormat(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                      {/* Tag pill inserts */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5 text-[11px]">
                        <span className="text-slate-400">Insert:</span>
                        {["{block}", "{floor}", "{unit}", "-", "/", "_"].map(
                          (tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => appendTag(tag)}
                              className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-mono text-[10px] font-semibold transition"
                            >
                              {tag}
                            </button>
                          )
                        )}
                        <button
                          type="button"
                          onClick={() => setUnitFormat("{block}-{floor}{unit}")}
                          className="text-[10px] text-slate-400 hover:text-slate-600 underline ml-1"
                        >
                          reset
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        {"{block}"} = Tower name, {"{floor}"} = floor no.,{" "}
                        {"{unit}"} = unit on floor. Values come from the fields
                        above — e.g. {"{block}-{floor}{unit}"} →{" "}
                        <span className="text-indigo-600 font-semibold">
                          {towerName}-101
                        </span>
                        .
                      </p>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Ground label (floor 0)
                      </label>
                      <input
                        type="text"
                        value={groundLabel}
                        onChange={(e) => setGroundLabel(e.target.value)}
                        placeholder="G / GF (optional)"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Skip floors
                      </label>
                      <input
                        type="text"
                        value={skipFloors}
                        onChange={(e) => setSkipFloors(e.target.value)}
                        placeholder="13"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  {/* Row 3: Floor rise & Size Unit */}
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Floor rise (₹/floor)
                      </label>
                      <input
                        type="number"
                        value={floorRise}
                        onChange={(e) =>
                          setFloorRise(parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Size unit
                      </label>
                      <select
                        value={sizeUnit}
                        onChange={(e) => setSizeUnit(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none cursor-pointer"
                      >
                        <option value="sqft">sqft</option>
                        <option value="sqyd">sqyd</option>
                        <option value="sqm">sqm</option>
                        <option value="acres">acres</option>
                      </select>
                    </div>
                  </div>

                  {/* Section: Units per floor */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">
                        Units per floor (repeats on every floor)
                      </span>
                      <button
                        type="button"
                        onClick={addUnitRow}
                        className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add unit type
                      </button>
                    </div>

                    <div className="space-y-2">
                      {unitRows.map((row, index) => (
                        <div
                          key={row.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="w-4 text-center font-bold text-slate-400">
                            {index + 1}
                          </span>

                          <select
                            value={row.category}
                            onChange={(e) =>
                              updateUnitRow(row.id, "category", e.target.value)
                            }
                            className="flex-1 px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none text-xs"
                          >
                            {UNIT_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>

                          <select
                            value={row.facing}
                            onChange={(e) =>
                              updateUnitRow(row.id, "facing", e.target.value)
                            }
                            className="w-28 px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none text-xs"
                          >
                            {FACING_OPTIONS.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>

                          <input
                            type="number"
                            value={row.superArea}
                            onChange={(e) =>
                              updateUnitRow(
                                row.id,
                                "superArea",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="Super"
                            className="w-24 px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none"
                          />

                          <input
                            type="number"
                            value={row.carpetArea}
                            onChange={(e) =>
                              updateUnitRow(
                                row.id,
                                "carpetArea",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="Carpet"
                            className="w-24 px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none"
                          />

                          <input
                            type="number"
                            value={row.basePrice}
                            onChange={(e) =>
                              updateUnitRow(
                                row.id,
                                "basePrice",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="Base ₹"
                            className="w-28 px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => removeUnitRow(row.id)}
                            disabled={unitRows.length <= 1}
                            className="p-2 text-slate-300 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-slate-300 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PLOTS CONFIGURATION */}
              {patternType === "plots" && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Block / Sector Name
                    </label>
                    <input
                      type="text"
                      value={plotBlock}
                      onChange={(e) => setPlotBlock(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                      placeholder="Sector A"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Plot Number From
                    </label>
                    <input
                      type="number"
                      value={plotFrom}
                      onChange={(e) =>
                        setPlotFrom(parseInt(e.target.value) || 1)
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Plot Number To
                    </label>
                    <input
                      type="number"
                      value={plotTo}
                      onChange={(e) =>
                        setPlotTo(parseInt(e.target.value) || 1)
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Unit Format
                    </label>
                    <input
                      type="text"
                      value={plotFormat}
                      onChange={(e) => setPlotFormat(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Plot Area (sq.ft)
                    </label>
                    <input
                      type="number"
                      value={plotArea}
                      onChange={(e) =>
                        setPlotArea(parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Base Price (₹)
                    </label>
                    <input
                      type="number"
                      value={plotBasePrice}
                      onChange={(e) =>
                        setPlotBasePrice(parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* VILLAS CONFIGURATION */}
              {patternType === "villas" && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Villa Range From
                    </label>
                    <input
                      type="number"
                      value={plotFrom}
                      onChange={(e) =>
                        setPlotFrom(parseInt(e.target.value) || 1)
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Villa Range To
                    </label>
                    <input
                      type="number"
                      value={plotTo}
                      onChange={(e) =>
                        setPlotTo(parseInt(e.target.value) || 1)
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Base Price (₹)
                    </label>
                    <input
                      type="number"
                      value={plotBasePrice}
                      onChange={(e) =>
                        setPlotBasePrice(parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPORT CSV */}
          {activeTab === "import" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${
                  csvFile
                    ? "border-emerald-400 bg-emerald-50/30"
                    : "border-slate-200 hover:border-indigo-400 bg-slate-50/50"
                }`}
              >
                {csvFile ? (
                  <>
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-slate-900">
                      {csvFile.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(csvFile.size / 1024).toFixed(1)} KB &bull;{" "}
                      <span className="text-indigo-600 font-semibold underline">
                        Click to choose a different file
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Upload CSV File
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Drag and drop your unit list (.csv) or{" "}
                      <span className="text-indigo-600 font-semibold underline">
                        browse file
                      </span>
                    </p>
                  </>
                )}
              </div>

              {importStatus.message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    importStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {importStatus.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">
                    Sample CSV Template
                  </p>
                  <p className="text-slate-400">
                    Download sample structure with unit number, floor, area,
                    rate, etc.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const csvContent =
                      "data:text/csv;charset=utf-8,unitNumber,floor,type,areaSqft,carpetAreaSqft,facing,baseRate,plcCharges,parkingCharges,status\nPlot 1,1,Plot,1200,1200,East,4500,0,200000,AVAILABLE\nPlot 2,1,Plot,1500,1500,North,4500,100000,200000,AVAILABLE\nPlot 3,1,Plot,1800,1800,West,4800,0,200000,AVAILABLE\nPlot 4,1,Plot,2000,2000,South,5000,150000,200000,AVAILABLE";
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "sample_inventory.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition shadow-sm"
                >
                  Download Sample CSV
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SINGLE UNIT */}
          {activeTab === "single" && (
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unit / Plot Number *
                </label>
                <input
                  type="text"
                  value={singleUnitNumber}
                  onChange={(e) => setSingleUnitNumber(e.target.value)}
                  placeholder="e.g. Plot 51 or A-101"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Floor Number
                </label>
                <input
                  type="number"
                  value={singleFloor}
                  onChange={(e) =>
                    setSingleFloor(parseInt(e.target.value) || 1)
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category / Type
                </label>
                <select
                  value={singleCategory}
                  onChange={(e) => setSingleCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                >
                  {UNIT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Facing / Orientation
                </label>
                <select
                  value={singleFacing}
                  onChange={(e) => setSingleFacing(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                >
                  {FACING_OPTIONS.filter((f) => f !== "Facing...").map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Super Area (sq.ft)
                </label>
                <input
                  type="number"
                  value={singleSuperArea}
                  onChange={(e) =>
                    setSingleSuperArea(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Carpet Area (sq.ft)
                </label>
                <input
                  type="number"
                  value={singleCarpetArea}
                  onChange={(e) =>
                    setSingleCarpetArea(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Total Agreement Value (₹)
                </label>
                <input
                  type="number"
                  value={singlePrice}
                  onChange={(e) =>
                    setSinglePrice(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Initial Status
                </label>
                <select
                  value={singleStatus}
                  onChange={(e) => setSingleStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="HELD">Held</option>
                  <option value="BOOKED">Booked</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              </div>
            </div>
          )}

          {/* Section: Live Preview Box (matches screenshot) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="text-xs font-bold text-slate-800">
              Preview —{" "}
              <span className="text-indigo-600 font-extrabold">
                {generatedUnits.length} units
              </span>
            </div>

            {generatedUnits.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                {activeTab === "import"
                  ? "Upload a CSV file above to preview rows before importing."
                  : "No units configured yet."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-1.5 pr-4">Unit</th>
                      <th className="py-1.5 pr-4">Floor</th>
                      <th className="py-1.5 pr-4">Category</th>
                      <th className="py-1.5 pr-4">Super</th>
                      <th className="py-1.5 pr-4">Carpet</th>
                      <th className="py-1.5 pr-4">Price</th>
                      <th className="py-1.5 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {generatedUnits.slice(0, 8).map((u, i) => (
                      <tr key={i} className="hover:bg-slate-100/50 transition">
                        <td className="py-1.5 pr-4 font-bold text-slate-900">
                          {u.unitNumber}
                        </td>
                        <td className="py-1.5 pr-4">{u.floor}</td>
                        <td className="py-1.5 pr-4">{u.type}</td>
                        <td className="py-1.5 pr-4">{u.areaSqft} sqft</td>
                        <td className="py-1.5 pr-4">{u.carpetAreaSqft} sqft</td>
                        <td className="py-1.5 pr-4 font-semibold text-slate-900">
                          {formatCurrency(u.totalCost)}
                        </td>
                        <td className="py-1.5 pr-4 font-semibold text-emerald-600 text-[10px]">
                          {u.status || "AVAILABLE"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {generatedUnits.length > 8 && (
              <p className="text-[11px] text-slate-400 pt-1">
                ...and {generatedUnits.length - 8} more (last:{" "}
                {generatedUnits[generatedUnits.length - 1]?.unitNumber})
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
          <button
            type="button"
            onClick={handleGenerateSubmit}
            disabled={isPending || generatedUnits.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : activeTab === "import" ? (
              <Upload className="w-4 h-4" />
            ) : activeTab === "single" ? (
              <Plus className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {activeTab === "import"
              ? `Import ${generatedUnits.length} units from CSV`
              : activeTab === "single"
              ? "Add Unit"
              : `Generate ${generatedUnits.length} units`}
          </button>
        </div>
      </div>
    </div>
  );
}
