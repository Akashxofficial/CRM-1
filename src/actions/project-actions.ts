"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/** MongoDB ObjectId: 24-char hex string */
function isValidObjectId(id: string) {
  return /^[a-f0-9]{24}$/i.test(id);
}

export async function getProjects() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  if (isValidObjectId(user.organizationId)) {
    try {
      const projects = await prisma.project.findMany({
        where: { organizationId: user.organizationId },
        include: {
          towers: {
            include: {
              units: true,
            },
          },
          paymentPlanTemplates: true,
          _count: {
            select: {
              units: true,
              leads: true,
              bookings: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      if (projects.length > 0) return projects;
    } catch (error) {
      console.warn("Database projects fetch skipped:", error);
    }
  } else {
    console.warn("Skipping DB query — invalid organizationId in session:", user.organizationId);
  }

  // Fallback demo projects
  return [
    {
      id: "demo-proj-1",
      name: "Skyline Heights",
      code: "SKH",
      location: "Whitefield, Bangalore",
      city: "Bangalore",
      reraNumber: "PRM/KA/RERA/1251/446/PR/210312/004000",
      totalUnits: 24,
      status: "Under Construction",
      towers: [
        { id: "demo-tower-a", name: "Tower A (Sapphire)", totalFloors: 6, units: [] },
        { id: "demo-tower-b", name: "Tower B (Emerald)", totalFloors: 6, units: [] },
      ],
      paymentPlanTemplates: [
        { id: "demo-plan-clp", name: "Construction Linked Plan (CLP)", isDefault: true },
      ],
      _count: { units: 24, leads: 12, bookings: 5 },
    },
    {
      id: "demo-proj-2",
      name: "Skyline Meadows",
      code: "SKM",
      location: "Sarjapur Road, Bangalore",
      city: "Bangalore",
      reraNumber: "PRM/KA/RERA/1251/446/PR/220518/004921",
      totalUnits: 12,
      status: "Ready to Move",
      towers: [
        { id: "demo-tower-1", name: "Tower 1 (Orchid)", totalFloors: 4, units: [] },
      ],
      paymentPlanTemplates: [],
      _count: { units: 12, leads: 4, bookings: 2 },
    },
  ];
}

export async function createProjectAction(data: {
  name: string;
  code: string;
  location: string;
  city: string;
  reraNumber: string;
  status?: string;
  description?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const project = await prisma.project.create({
    data: {
      organizationId: user.organizationId,
      name: data.name,
      code: data.code.toUpperCase(),
      location: data.location,
      city: data.city,
      reraNumber: data.reraNumber,
      status: data.status || "Under Construction",
      description: data.description,
    },
  });

  await prisma.tower.create({
    data: {
      projectId: project.id,
      name: "Tower 1",
      totalFloors: 10,
      unitsPerFloor: 4,
    },
  });

  await prisma.paymentPlanTemplate.create({
    data: {
      projectId: project.id,
      name: "Standard Construction Linked Plan (CLP)",
      isDefault: true,
      milestonesJson: JSON.stringify([
        { name: "On Booking Token", percentage: 10, days: 0 },
        { name: "On Agreement Execution (30 Days)", percentage: 10, days: 30 },
        { name: "On Foundation Completion", percentage: 15, days: 90 },
        { name: "On 3rd Floor Slab", percentage: 15, days: 180 },
        { name: "On 6th Floor Slab", percentage: 15, days: 270 },
        { name: "On Brickwork & Internal Plaster", percentage: 15, days: 360 },
        { name: "On Flooring & Fitouts", percentage: 10, days: 450 },
        { name: "On Notice of Possession", percentage: 10, days: 540 },
      ]),
    },
  });

  revalidatePath("/inventory");
  revalidatePath("/projects");
  return { success: true, project };
}
