"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return await prisma.project.findMany({
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

  // Create default tower
  await prisma.tower.create({
    data: {
      projectId: project.id,
      name: "Tower 1",
      totalFloors: 10,
      unitsPerFloor: 4,
    },
  });

  // Create default CLP payment plan
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
