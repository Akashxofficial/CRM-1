"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export interface SnagRecord {
  id: string;
  // Basic Information
  dealName?: string;
  inspectionType?: string;
  unitNumber?: string;
  customerDealName?: string;
  type?: string;
  snagOrigin: string;
  relatedTo?: string;
  phone?: string;
  snagOwner: string;
  subject: string;
  reportedBy?: string;
  email?: string;
  customer?: string;

  // Issue Details
  category?: string;
  subCategory?: string;
  snagDescription?: string;
  locationInUnit?: string;
  priority?: string;
  issue?: string;

  // Assignment
  raisedBy?: string;
  assignTo?: string;
  raisedOn?: string;
  targetClosureDate?: string;

  // Resolution
  status: "Logged" | "Open" | "In Progress" | "Resolved" | "Verified" | "Closed" | "Reopened";
  rootCause?: string;
  reopenCount?: number;
  closureRemarks?: string;
  closureProof?: string;

  createdAt: string;
  updatedAt: string;
}

// In-memory store for fallback & real-time responsiveness
let fallbackSnags: SnagRecord[] = [
  {
    id: "snag-001",
    dealName: "Dr. Arvind Swamy - Orchid M-201",
    inspectionType: "Pre Handover",
    unitNumber: "M-201",
    customerDealName: "Skyline Meadows - 4BHK",
    type: "Problem",
    snagOrigin: "Web",
    relatedTo: "Handover Checklist",
    phone: "+91 98450 33221",
    snagOwner: "Yudhister Tiwari",
    subject: "Master Bedroom Wall Hairline Cracks & Skirting Alignment",
    reportedBy: "Yudhister Tiwari",
    email: "yudhister@urbangaon.com",
    customer: "Dr. Arvind Swamy",
    category: "Civil Work",
    subCategory: "Wall Plaster & Cracks",
    snagDescription: "Fine hairline cracks observed on north wall near balcony sliding door. Skirting tiles need re-grouting.",
    locationInUnit: "Master Bedroom",
    priority: "Medium",
    issue: "Yes",
    raisedBy: "Yudhister Tiwari",
    assignTo: "Yudhister Tiwari",
    raisedOn: "2026-08-20T10:00",
    targetClosureDate: "2026-08-28",
    status: "In Progress",
    rootCause: "Thermal contraction during final curing stage.",
    reopenCount: 0,
    closureRemarks: "Plaster repair initiated with epoxy putty. Touch-up scheduled.",
    closureProof: "",
    createdAt: "2026-08-20T10:00:00Z",
    updatedAt: "2026-08-21T14:30:00Z",
  },
  {
    id: "snag-002",
    dealName: "Mr. Rajesh Kumar Sharma - 3BHK Skyline",
    inspectionType: "Post Handover",
    unitNumber: "T1-402",
    customerDealName: "UrbanGaon Skyline 3BHK",
    type: "Problem",
    snagOrigin: "Email",
    relatedTo: "Pre-Possession Review",
    phone: "+91 98765 43210",
    snagOwner: "Yudhister Tiwari",
    subject: "Kitchen Sink Under-Counter Mixer Water Seepage",
    reportedBy: "Yudhister Tiwari",
    email: "yudhister@urbangaon.com",
    customer: "Rajesh Kumar Sharma",
    category: "Plumbing & Sanitary",
    subCategory: "Under-Counter Leakage",
    snagDescription: "Slow water seepage detected below sink counter around the cold water angle valve inlet.",
    locationInUnit: "Kitchen",
    priority: "High",
    issue: "Yes",
    raisedBy: "Yudhister Tiwari",
    assignTo: "Yudhister Tiwari",
    raisedOn: "2026-08-22T11:30",
    targetClosureDate: "2026-08-25",
    status: "Logged",
    rootCause: "Teflon tape seal loosened during pressure testing.",
    reopenCount: 0,
    closureRemarks: "",
    closureProof: "",
    createdAt: "2026-08-22T11:30:00Z",
    updatedAt: "2026-08-22T11:30:00Z",
  },
  {
    id: "snag-003",
    dealName: "Aakash Kumar Test - UrbanGaon 3BHK",
    inspectionType: "Pre Handover",
    unitNumber: "B-304",
    customerDealName: "UrbanGaon Luxury Phase 1",
    type: "Feature Request",
    snagOrigin: "Phone",
    relatedTo: "Final Handover Audit",
    phone: "+91 99898 98989",
    snagOwner: "Yudhister Tiwari",
    subject: "Living Room Modular Switchboard Dimmer Tripping",
    reportedBy: "Yudhister Tiwari",
    email: "yudhister@urbangaon.com",
    customer: "Aakash Kumar Test",
    category: "Electrical & Fixtures",
    subCategory: "Switchboard & Wiring",
    snagDescription: "Living room accent light circuit trips when dimmer is rotated past 70% load.",
    locationInUnit: "Living Room",
    priority: "Critical",
    issue: "Yes",
    raisedBy: "Yudhister Tiwari",
    assignTo: "Yudhister Tiwari",
    raisedOn: "2026-08-23T09:15",
    targetClosureDate: "2026-08-24",
    status: "Open",
    rootCause: "Neutral wire loose at intermediate junction box.",
    reopenCount: 0,
    closureRemarks: "",
    closureProof: "",
    createdAt: "2026-08-23T09:15:00Z",
    updatedAt: "2026-08-23T09:15:00Z",
  },
  {
    id: "snag-004",
    dealName: "Pooja Hegde - Garden Villa 12",
    inspectionType: "Post Handover",
    unitNumber: "GV-12",
    customerDealName: "Skyline Garden Villas",
    type: "Questions",
    snagOrigin: "Email",
    relatedTo: "Handover Checklist",
    phone: "+91 98765 43214",
    snagOwner: "Yudhister Tiwari",
    subject: "Balcony Ceiling Paint Discoloration & Patch Work",
    reportedBy: "Yudhister Tiwari",
    email: "yudhister@urbangaon.com",
    customer: "Pooja Hegde",
    category: "Painting & Polish",
    subCategory: "Ceiling Paint",
    snagDescription: "Color unevenness on outdoor balcony ceiling after primer coat.",
    locationInUnit: "Balcony",
    priority: "Low",
    issue: "No",
    raisedBy: "Yudhister Tiwari",
    assignTo: "Yudhister Tiwari",
    raisedOn: "2026-08-18T14:00",
    targetClosureDate: "2026-08-22",
    status: "Resolved",
    rootCause: "Moisture trapped during unseasonable rains.",
    reopenCount: 0,
    closureRemarks: "Two coats of weather-shield exterior paint applied and dried.",
    closureProof: "balcony_repair_done.jpg",
    createdAt: "2026-08-18T14:00:00Z",
    updatedAt: "2026-08-22T16:00:00Z",
  },
];

export async function getSnagRecords(filters?: {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}): Promise<SnagRecord[]> {
  let list = [...fallbackSnags];

  if (filters?.status && filters.status !== "ALL") {
    list = list.filter((s) => s.status.toLowerCase() === filters.status?.toLowerCase());
  }
  if (filters?.priority && filters.priority !== "ALL") {
    list = list.filter((s) => s.priority?.toLowerCase() === filters.priority?.toLowerCase());
  }
  if (filters?.category && filters.category !== "ALL") {
    list = list.filter((s) => s.category?.toLowerCase() === filters.category?.toLowerCase());
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.subject.toLowerCase().includes(q) ||
        (s.dealName && s.dealName.toLowerCase().includes(q)) ||
        (s.unitNumber && s.unitNumber.toLowerCase().includes(q)) ||
        (s.customer && s.customer.toLowerCase().includes(q)) ||
        (s.reportedBy && s.reportedBy.toLowerCase().includes(q))
    );
  }

  return list;
}

export async function getSnagRecordById(id: string): Promise<SnagRecord | null> {
  const found = fallbackSnags.find((s) => s.id === id);
  return found || null;
}

export async function createSnagRecord(
  data: Omit<SnagRecord, "id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; snag?: SnagRecord; error?: string }> {
  try {
    const user = await getCurrentUser();

    const newId = `snag-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newSnag: SnagRecord = {
      id: newId,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    fallbackSnags.unshift(newSnag);

    if (user) {
      try {
        await createAuditLog({
          organizationId: user.organizationId,
          entityType: "POSSESSION",
          entityId: newId,
          action: "CREATED",
          details: `Created Snag: "${newSnag.subject}" for ${newSnag.unitNumber || "Unit"} (${newSnag.dealName || "General"}) by ${user.name}.`,
          performedById: user.id,
        });
      } catch (e) {
        console.warn("Audit log creation error:", e);
      }
    }

    revalidatePath("/snags");
    revalidatePath("/snag-module");
    return { success: true, snag: newSnag };
  } catch (err: any) {
    console.error("createSnagRecord error:", err);
    return { success: false, error: err.message || "Failed to create Snag" };
  }
}

export async function updateSnagRecord(
  id: string,
  data: Partial<SnagRecord>
): Promise<{ success: boolean; snag?: SnagRecord; error?: string }> {
  try {
    const index = fallbackSnags.findIndex((s) => s.id === id);
    if (index === -1) {
      return { success: false, error: "Snag not found" };
    }

    const updated: SnagRecord = {
      ...fallbackSnags[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    fallbackSnags[index] = updated;

    revalidatePath("/snags");
    revalidatePath("/snag-module");
    return { success: true, snag: updated };
  } catch (err: any) {
    console.error("updateSnagRecord error:", err);
    return { success: false, error: err.message || "Failed to update Snag" };
  }
}

export async function deleteSnagRecord(id: string): Promise<{ success: boolean }> {
  fallbackSnags = fallbackSnags.filter((s) => s.id !== id);
  revalidatePath("/snags");
  revalidatePath("/snag-module");
  return { success: true };
}
