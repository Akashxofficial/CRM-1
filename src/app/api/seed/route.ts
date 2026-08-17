import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if data already exists
    const orgCount = await prisma.organization.count();
    if (orgCount > 0) {
      return NextResponse.json({
        message: "Database is already seeded with organization and demo data!",
        orgCount,
      });
    }

    console.log("🌱 Seeding database via API...");

    const org = await prisma.organization.create({
      data: {
        name: "Skyline Realty & Infrastructure",
        slug: "skyline-realty",
        reraNo: "RERA/PRM/KA/2026/08891",
        logo: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=200&auto=format&fit=crop&q=80",
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        email: "admin@propcrm.io",
        password: "password123",
        name: "Yudhister Tiwari",
        role: "ADMIN",
        phone: "+91 98765 43210",
        organizationId: org.id,
      },
    });

    const managerUser = await prisma.user.create({
      data: {
        email: "manager@propcrm.io",
        password: "password123",
        name: "Ananya Sharma (Sales Head)",
        role: "SALES_MANAGER",
        phone: "+91 98765 43211",
        organizationId: org.id,
      },
    });

    const agentUser = await prisma.user.create({
      data: {
        email: "agent@propcrm.io",
        password: "password123",
        name: "Rahul Verma (Senior Sales Agent)",
        role: "SALES_AGENT",
        phone: "+91 98765 43212",
        organizationId: org.id,
      },
    });

    const financeUser = await prisma.user.create({
      data: {
        email: "finance@propcrm.io",
        password: "password123",
        name: "Suresh Menon (Accounts Lead)",
        role: "ACCOUNTS",
        phone: "+91 98765 43213",
        organizationId: org.id,
      },
    });

    const legalUser = await prisma.user.create({
      data: {
        email: "legal@propcrm.io",
        password: "password123",
        name: "Pooja Hegde (Post-Sales & Legal)",
        role: "POST_SALES",
        phone: "+91 98765 43214",
        organizationId: org.id,
      },
    });

    await prisma.user.create({
      data: {
        email: "demo@urbangaon.com",
        password: "password123",
        name: "UrbanGaon Demo Admin",
        role: "ADMIN",
        phone: "+91 98000 00000",
        organizationId: org.id,
      },
    });

    const project1 = await prisma.project.create({
      data: {
        organizationId: org.id,
        name: "Skyline Heights",
        code: "SKH",
        location: "Whitefield, Bangalore",
        city: "Bangalore",
        reraNumber: "PRM/KA/RERA/1251/446/PR/210312/004000",
        totalUnits: 24,
        status: "Under Construction",
        startDate: new Date("2024-01-15"),
        completionDate: new Date("2026-12-31"),
        description: "Ultra-luxury 2, 3 & 4 BHK high-rise residences with 40+ club amenities.",
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
      },
    });

    const project2 = await prisma.project.create({
      data: {
        organizationId: org.id,
        name: "Skyline Meadows",
        code: "SKM",
        location: "Sarjapur Road, Bangalore",
        city: "Bangalore",
        reraNumber: "PRM/KA/RERA/1251/446/PR/220518/004921",
        totalUnits: 12,
        status: "Ready to Move",
        startDate: new Date("2023-03-01"),
        completionDate: new Date("2025-10-30"),
        description: "Exclusive boutique residences nestled in a lush green sanctuary.",
        imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
      },
    });

    const towerA = await prisma.tower.create({
      data: {
        projectId: project1.id,
        name: "Tower A (Sapphire)",
        totalFloors: 6,
        unitsPerFloor: 2,
      },
    });

    const towerB = await prisma.tower.create({
      data: {
        projectId: project1.id,
        name: "Tower B (Emerald)",
        totalFloors: 6,
        unitsPerFloor: 2,
      },
    });

    const clpPlan = await prisma.paymentPlanTemplate.create({
      data: {
        projectId: project1.id,
        name: "Construction Linked Plan (CLP)",
        description: "Standard milestone-linked plan.",
        isDefault: true,
        milestonesJson: JSON.stringify([
          { name: "On Booking", percentage: 10, days: 0 },
          { name: "Within 30 Days (Allotment)", percentage: 10, days: 30 },
          { name: "On Foundation Completion", percentage: 15, days: 90 },
          { name: "On 3rd Slab Casting", percentage: 15, days: 180 },
          { name: "On 6th Slab Casting", percentage: 15, days: 270 },
          { name: "On Brickwork & Plastering", percentage: 15, days: 360 },
          { name: "On Flooring & Finishing", percentage: 10, days: 450 },
          { name: "On Notice of Possession", percentage: 10, days: 540 },
        ]),
      },
    });

    // Create Sample Units
    const units = [
      { towerId: towerA.id, projectId: project1.id, unitNumber: "A-101", floor: 1, type: "2BHK", areaSqft: 1250, carpetAreaSqft: 980, facing: "East", baseRate: 8500, plcCharges: 150000, parkingCharges: 300000, status: "AVAILABLE" },
      { towerId: towerA.id, projectId: project1.id, unitNumber: "A-102", floor: 1, type: "3BHK", areaSqft: 1650, carpetAreaSqft: 1320, facing: "North", baseRate: 8500, plcCharges: 200000, parkingCharges: 300000, status: "BOOKED" },
      { towerId: towerA.id, projectId: project1.id, unitNumber: "A-201", floor: 2, type: "2BHK", areaSqft: 1250, carpetAreaSqft: 980, facing: "East", baseRate: 8600, plcCharges: 150000, parkingCharges: 300000, status: "AVAILABLE" },
      { towerId: towerA.id, projectId: project1.id, unitNumber: "A-202", floor: 2, type: "3BHK", areaSqft: 1650, carpetAreaSqft: 1320, facing: "North", baseRate: 8600, plcCharges: 200000, parkingCharges: 300000, status: "HELD" },
      { towerId: towerB.id, projectId: project1.id, unitNumber: "B-101", floor: 1, type: "2BHK", areaSqft: 1200, carpetAreaSqft: 950, facing: "South", baseRate: 8400, plcCharges: 100000, parkingCharges: 300000, status: "AVAILABLE" },
      { towerId: towerB.id, projectId: project1.id, unitNumber: "B-102", floor: 1, type: "3BHK", areaSqft: 1600, carpetAreaSqft: 1280, facing: "West", baseRate: 8400, plcCharges: 100000, parkingCharges: 300000, status: "AVAILABLE" },
    ];

    for (const u of units) {
      const totalCost = u.areaSqft * u.baseRate + u.plcCharges + u.parkingCharges;
      await prisma.unit.create({
        data: {
          ...u,
          totalCost,
        },
      });
    }

    // Create Leads
    const lead1 = await prisma.lead.create({
      data: {
        organizationId: org.id,
        projectId: project1.id,
        name: "Amitabh Sen",
        phone: "+91 98450 11223",
        email: "amitabh.sen@techcorp.com",
        source: "Website",
        status: "BOOKED",
        interestedType: "3BHK",
        budgetMin: 13000000,
        budgetMax: 16000000,
        priority: "HOT",
        assignedToId: agentUser.id,
      },
    });

    const lead2 = await prisma.lead.create({
      data: {
        organizationId: org.id,
        projectId: project1.id,
        name: "Siddharth Rao",
        phone: "+91 97312 88441",
        email: "siddharth.rao@fintech.io",
        source: "Google Ads",
        status: "NEGOTIATION",
        interestedType: "3BHK",
        budgetMin: 14000000,
        budgetMax: 16000000,
        priority: "HOT",
        assignedToId: agentUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with Demo Organization, Users, Projects, Units, and Leads!",
    });
  } catch (error: any) {
    console.error("Seed API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
