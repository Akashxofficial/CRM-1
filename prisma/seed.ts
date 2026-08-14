import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning existing database...");
  await prisma.snagItem.deleteMany({});
  await prisma.possession.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.paymentTransaction.deleteMany({});
  await prisma.paymentSchedule.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.paymentPlanTemplate.deleteMany({});
  await prisma.leadTask.deleteMany({});
  await prisma.leadActivity.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.unit.deleteMany({});
  await prisma.tower.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log("🏢 Creating Organization...");
  const org = await prisma.organization.create({
    data: {
      name: "Skyline Realty & Infrastructure",
      slug: "skyline-realty",
      reraNo: "RERA/PRM/KA/2026/08891",
      logo: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=200&auto=format&fit=crop&q=80",
    },
  });

  console.log("👥 Creating Users across 5 Roles...");
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@propcrm.io",
      password: "password123",
      name: "Vikram Malhotra (CEO)",
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

  // Also seed demo@vastucrm.com matching the prompt reference
  await prisma.user.create({
    data: {
      email: "demo@vastucrm.com",
      password: "password123",
      name: "Vastu Demo Admin",
      role: "ADMIN",
      phone: "+91 98000 00000",
      organizationId: org.id,
    },
  });

  console.log("🏗️ Creating Projects & Towers...");
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
      description: "Ultra-luxury 2, 3 & 4 BHK high-rise residences with 40+ club amenities, panoramic views and IGBC Gold certification.",
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
      description: "Exclusive boutique residences and duplex penthouses nestled in a lush green private sanctuary.",
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

  const towerM = await prisma.tower.create({
    data: {
      projectId: project2.id,
      name: "Tower 1 (Orchid)",
      totalFloors: 4,
      unitsPerFloor: 3,
    },
  });

  console.log("📐 Creating Payment Plan Templates...");
  const clpPlan = await prisma.paymentPlanTemplate.create({
    data: {
      projectId: project1.id,
      name: "Construction Linked Plan (CLP)",
      description: "Standard milestone-linked plan spread across building slabs and finishing.",
      isDefault: true,
      milestonesJson: JSON.stringify([
        { name: "On Booking", percentage: 10, days: 0 },
        { name: "Within 30 Days (Allotment)", percentage: 10, days: 30 },
        { name: "On Foundation Completion", percentage: 15, days: 90 },
        { name: "On 3rd Slab Casting", percentage: 15, days: 180 },
        { name: "On 6th Slab Casting", percentage: 15, days: 270 },
        { name: "On Brickwork & Plastering", percentage: 15, days: 360 },
        { name: "On Flooring & Internal Finishing", percentage: 10, days: 450 },
        { name: "On Notice of Possession", percentage: 10, days: 540 },
      ]),
    },
  });

  const subventionPlan = await prisma.paymentPlanTemplate.create({
    data: {
      projectId: project1.id,
      name: "20:80 Subvention Scheme",
      description: "Pay 20% on booking, remaining 80% on possession notice.",
      isDefault: false,
      milestonesJson: JSON.stringify([
        { name: "Booking & Agreement (20%)", percentage: 20, days: 0 },
        { name: "On Handover / Possession (80%)", percentage: 80, days: 540 },
      ]),
    },
  });

  console.log("🏢 Creating Inventory Units...");
  const unitsData = [
    // Tower A
    { towerId: towerA.id, projectId: project1.id, unitNumber: "A-101", floor: 1, type: "2BHK", areaSqft: 1250, carpetAreaSqft: 980, facing: "East", baseRate: 8500, plcCharges: 150000, parkingCharges: 300000, status: "SOLD" },
    { towerId: towerA.id, projectId: project1.id, unitNumber: "A-102", floor: 1, type: "3BHK", areaSqft: 1650, carpetAreaSqft: 1320, facing: "North", baseRate: 8500, plcCharges: 200000, parkingCharges: 300000, status: "BOOKED" },
    { towerId: towerA.id, projectId: project1.id, unitNumber: "A-201", floor: 2, type: "2BHK", areaSqft: 1250, carpetAreaSqft: 980, facing: "East", baseRate: 8600, plcCharges: 150000, parkingCharges: 300000, status: "AVAILABLE" },
    { towerId: towerA.id, projectId: project1.id, unitNumber: "A-202", floor: 2, type: "3BHK", areaSqft: 1650, carpetAreaSqft: 1320, facing: "North", baseRate: 8600, plcCharges: 200000, parkingCharges: 300000, status: "HELD" },
    { towerId: towerA.id, projectId: project1.id, unitNumber: "A-301", floor: 3, type: "2BHK", areaSqft: 1250, carpetAreaSqft: 980, facing: "East", baseRate: 8700, plcCharges: 150000, parkingCharges: 300000, status: "BOOKED" },
    { towerId: towerA.id, projectId: project1.id, unitNumber: "A-302", floor: 3, type: "3BHK", areaSqft: 1650, carpetAreaSqft: 1320, facing: "North-East", baseRate: 8700, plcCharges: 250000, parkingCharges: 300000, status: "AVAILABLE" },
    { towerId: towerA.id, projectId: project1.id, unitNumber: "A-401", floor: 4, type: "2BHK", areaSqft: 1250, carpetAreaSqft: 980, facing: "East", baseRate: 8800, plcCharges: 150000, parkingCharges: 300000, status: "AVAILABLE" },
    { towerId: towerA.id, projectId: project1.id, unitNumber: "A-402", floor: 4, type: "3BHK", areaSqft: 1650, carpetAreaSqft: 1320, facing: "North", baseRate: 8800, plcCharges: 200000, parkingCharges: 300000, status: "SOLD" },
    { towerId: towerA.id, projectId: project1.id, unitNumber: "A-501", floor: 5, type: "3BHK", areaSqft: 1700, carpetAreaSqft: 1360, facing: "East", baseRate: 8900, plcCharges: 200000, parkingCharges: 300000, status: "AVAILABLE" },
    { towerId: towerA.id, projectId: project1.id, unitNumber: "A-502", floor: 5, type: "3BHK", areaSqft: 1700, carpetAreaSqft: 1360, facing: "North", baseRate: 8900, plcCharges: 200000, parkingCharges: 300000, status: "BLOCKED" },
    { towerId: towerA.id, projectId: project1.id, unitNumber: "A-601", floor: 6, type: "PENTHOUSE", areaSqft: 2800, carpetAreaSqft: 2300, facing: "East", baseRate: 9500, plcCharges: 500000, parkingCharges: 600000, status: "BOOKED" },
    { towerId: towerA.id, projectId: project1.id, unitNumber: "A-602", floor: 6, type: "PENTHOUSE", areaSqft: 2800, carpetAreaSqft: 2300, facing: "North-West", baseRate: 9500, plcCharges: 500000, parkingCharges: 600000, status: "AVAILABLE" },

    // Tower B
    { towerId: towerB.id, projectId: project1.id, unitNumber: "B-101", floor: 1, type: "2BHK", areaSqft: 1200, carpetAreaSqft: 950, facing: "South", baseRate: 8400, plcCharges: 100000, parkingCharges: 300000, status: "AVAILABLE" },
    { towerId: towerB.id, projectId: project1.id, unitNumber: "B-102", floor: 1, type: "3BHK", areaSqft: 1600, carpetAreaSqft: 1280, facing: "West", baseRate: 8400, plcCharges: 100000, parkingCharges: 300000, status: "BOOKED" },
    { towerId: towerB.id, projectId: project1.id, unitNumber: "B-201", floor: 2, type: "2BHK", areaSqft: 1200, carpetAreaSqft: 950, facing: "South", baseRate: 8500, plcCharges: 100000, parkingCharges: 300000, status: "AVAILABLE" },
    { towerId: towerB.id, projectId: project1.id, unitNumber: "B-202", floor: 2, type: "3BHK", areaSqft: 1600, carpetAreaSqft: 1280, facing: "West", baseRate: 8500, plcCharges: 100000, parkingCharges: 300000, status: "AVAILABLE" },
    { towerId: towerB.id, projectId: project1.id, unitNumber: "B-301", floor: 3, type: "2BHK", areaSqft: 1200, carpetAreaSqft: 950, facing: "South", baseRate: 8600, plcCharges: 100000, parkingCharges: 300000, status: "HELD" },
    { towerId: towerB.id, projectId: project1.id, unitNumber: "B-302", floor: 3, type: "3BHK", areaSqft: 1600, carpetAreaSqft: 1280, facing: "West", baseRate: 8600, plcCharges: 100000, parkingCharges: 300000, status: "AVAILABLE" },
    
    // Tower Meadows (Project 2)
    { towerId: towerM.id, projectId: project2.id, unitNumber: "M-101", floor: 1, type: "3BHK", areaSqft: 1850, carpetAreaSqft: 1480, facing: "East", baseRate: 9200, plcCharges: 250000, parkingCharges: 400000, status: "SOLD" },
    { towerId: towerM.id, projectId: project2.id, unitNumber: "M-102", floor: 1, type: "3BHK", areaSqft: 1850, carpetAreaSqft: 1480, facing: "North", baseRate: 9200, plcCharges: 250000, parkingCharges: 400000, status: "AVAILABLE" },
    { towerId: towerM.id, projectId: project2.id, unitNumber: "M-201", floor: 2, type: "4BHK", areaSqft: 2400, carpetAreaSqft: 1950, facing: "East", baseRate: 9400, plcCharges: 350000, parkingCharges: 500000, status: "BOOKED" },
    { towerId: towerM.id, projectId: project2.id, unitNumber: "M-202", floor: 2, type: "4BHK", areaSqft: 2400, carpetAreaSqft: 1950, facing: "West", baseRate: 9400, plcCharges: 350000, parkingCharges: 500000, status: "AVAILABLE" },
  ];

  const createdUnits: Record<string, any> = {};

  for (const u of unitsData) {
    const totalCost = u.areaSqft * u.baseRate + u.plcCharges + u.parkingCharges;
    const isHeld = u.status === "HELD";
    const unit = await prisma.unit.create({
      data: {
        projectId: u.projectId,
        towerId: u.towerId,
        unitNumber: u.unitNumber,
        floor: u.floor,
        type: u.type,
        areaSqft: u.areaSqft,
        carpetAreaSqft: u.carpetAreaSqft,
        facing: u.facing,
        baseRate: u.baseRate,
        plcCharges: u.plcCharges,
        parkingCharges: u.parkingCharges,
        totalCost,
        status: u.status,
        heldUntil: isHeld ? new Date(Date.now() + 48 * 3600 * 1000) : null,
        heldById: isHeld ? agentUser.id : null,
      },
    });
    createdUnits[u.unitNumber] = unit;
  }

  console.log("🎯 Creating Leads & Funnel...");
  const leadsData = [
    {
      name: "Amitabh Sen",
      phone: "+91 98450 11223",
      email: "amitabh.sen@techcorp.com",
      source: "Website",
      status: "BOOKED",
      interestedType: "3BHK",
      budgetMin: 13000000,
      budgetMax: 16000000,
      priority: "HOT",
      projectId: project1.id,
      assignedToId: agentUser.id,
      unitNumber: "A-102",
    },
    {
      name: "Deepika Padukone",
      phone: "+91 98450 44556",
      email: "deepika.p@creative.in",
      source: "Referral",
      status: "BOOKED",
      interestedType: "2BHK",
      budgetMin: 10000000,
      budgetMax: 12000000,
      priority: "HIGH",
      projectId: project1.id,
      assignedToId: agentUser.id,
      unitNumber: "A-301",
    },
    {
      name: "Rajesh & Priya Nair",
      phone: "+91 98450 77889",
      email: "rajesh.nair@investors.com",
      source: "Walk-in",
      status: "BOOKED",
      interestedType: "PENTHOUSE",
      budgetMin: 25000000,
      budgetMax: 30000000,
      priority: "HOT",
      projectId: project1.id,
      assignedToId: managerUser.id,
      unitNumber: "A-601",
    },
    {
      name: "Karan Johar",
      phone: "+91 98450 99001",
      email: "karan.j@cinema.co",
      source: "Portal",
      status: "BOOKED",
      interestedType: "3BHK",
      budgetMin: 14000000,
      budgetMax: 16000000,
      priority: "HIGH",
      projectId: project1.id,
      assignedToId: agentUser.id,
      unitNumber: "B-102",
    },
    {
      name: "Dr. Arvind Swamy",
      phone: "+91 98450 33221",
      email: "dr.arvind@healthcare.org",
      source: "Channel Partner",
      status: "BOOKED",
      interestedType: "4BHK",
      budgetMin: 22000000,
      budgetMax: 26000000,
      priority: "HOT",
      projectId: project2.id,
      assignedToId: managerUser.id,
      unitNumber: "M-201",
    },
    {
      name: "Siddharth Rao",
      phone: "+91 97312 88441",
      email: "siddharth.rao@fintech.io",
      source: "Google Ads",
      status: "NEGOTIATION",
      interestedType: "3BHK",
      budgetMin: 14000000,
      budgetMax: 16000000,
      priority: "HOT",
      projectId: project1.id,
      assignedToId: agentUser.id,
      unitNumber: "A-202",
    },
    {
      name: "Meera Krishnan",
      phone: "+91 97312 55220",
      email: "meera.krishnan@design.studio",
      source: "Website",
      status: "SITE_VISIT_SCHEDULED",
      interestedType: "2BHK",
      budgetMin: 9000000,
      budgetMax: 11500000,
      priority: "MEDIUM",
      projectId: project1.id,
      assignedToId: agentUser.id,
      unitNumber: "B-301",
    },
    {
      name: "Naveen Jindal",
      phone: "+91 99887 66554",
      email: "naveen.j@metals.com",
      source: "Portal",
      status: "SITE_VISIT_DONE",
      interestedType: "3BHK",
      budgetMin: 15000000,
      budgetMax: 18000000,
      priority: "HIGH",
      projectId: project1.id,
      assignedToId: managerUser.id,
    },
    {
      name: "Rohan Gupta",
      phone: "+91 98711 22334",
      email: "rohan.gupta@consultancy.com",
      source: "Facebook Ads",
      status: "CONTACTED",
      interestedType: "2BHK",
      budgetMin: 9500000,
      budgetMax: 11000000,
      priority: "MEDIUM",
      projectId: project1.id,
      assignedToId: agentUser.id,
    },
    {
      name: "Sunita & Alok Verma",
      phone: "+91 98100 44332",
      email: "alok.verma@pharma.in",
      source: "Walk-in",
      status: "NEW",
      interestedType: "3BHK",
      budgetMin: 14000000,
      budgetMax: 16500000,
      priority: "HIGH",
      projectId: project1.id,
      assignedToId: agentUser.id,
    },
    {
      name: "Tanvi Deshmukh",
      phone: "+91 96543 21098",
      email: "tanvi.d@aerospace.gov",
      source: "Referral",
      status: "NEW",
      interestedType: "2BHK",
      budgetMin: 9000000,
      budgetMax: 10500000,
      priority: "MEDIUM",
      projectId: project1.id,
      assignedToId: agentUser.id,
    },
    {
      name: "Vikrant Singh",
      phone: "+91 91234 56789",
      email: "vikrant.singh@logistics.net",
      source: "Website",
      status: "LOST",
      interestedType: "3BHK",
      budgetMin: 11000000,
      budgetMax: 12000000,
      priority: "LOW",
      projectId: project1.id,
      assignedToId: agentUser.id,
      lostReason: "Budget mismatch - bought secondary property elsewhere",
    },
  ];

  const createdLeads: Record<string, any> = {};

  for (const l of leadsData) {
    const linkedUnit = l.unitNumber ? createdUnits[l.unitNumber] : null;
    const lead = await prisma.lead.create({
      data: {
        organizationId: org.id,
        projectId: l.projectId,
        name: l.name,
        phone: l.phone,
        email: l.email,
        source: l.source,
        status: l.status,
        interestedType: l.interestedType,
        budgetMin: l.budgetMin,
        budgetMax: l.budgetMax,
        priority: l.priority,
        lostReason: l.lostReason,
        assignedToId: l.assignedToId,
        interestedUnitId: linkedUnit?.id || null,
      },
    });
    createdLeads[l.name] = lead;

    // Create activity logs for lead
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "NOTE",
        title: "Lead Created",
        notes: `Enquiry received via ${l.source} for ${l.interestedType || "residential unit"}.`,
        performedById: l.assignedToId || adminUser.id,
      },
    });

    if (l.status !== "NEW") {
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "CALL",
          title: "Introduction Call Completed",
          notes: "Explained project architecture, amenities, and pricing. Buyer showed keen interest.",
          performedById: l.assignedToId || adminUser.id,
        },
      });
    }

    if (["SITE_VISIT_SCHEDULED", "SITE_VISIT_DONE", "NEGOTIATION", "BOOKED"].includes(l.status)) {
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "SITE_VISIT",
          title: "Project Model & Sample Flat Visit",
          notes: "Client visited experience center with family. Inspected floor layouts and clubhouse.",
          siteVisitDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
          performedById: l.assignedToId || adminUser.id,
        },
      });
    }

    // Create Tasks
    if (l.status === "SITE_VISIT_SCHEDULED") {
      await prisma.leadTask.create({
        data: {
          leadId: lead.id,
          title: "Coordinate Pick-up & Site Experience",
          description: "Confirm arrival time with client and prepare printed brochures.",
          dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
          priority: "HIGH",
          status: "PENDING",
          assignedToId: l.assignedToId,
        },
      });
    } else if (l.status === "NEGOTIATION") {
      await prisma.leadTask.create({
        data: {
          leadId: lead.id,
          title: "Finalize Payment Schedule & Discount Approval",
          description: "Get manager approval for 1.5% special festive waiver on floor rise.",
          dueDate: new Date(Date.now() + 1 * 24 * 3600 * 1000),
          priority: "HIGH",
          status: "PENDING",
          assignedToId: l.assignedToId,
        },
      });
    }
  }

  console.log("📝 Creating Bookings & Generating Payment Schedules...");
  const bookingsData = [
    {
      leadName: "Amitabh Sen",
      unitNumber: "A-102",
      bookingNumber: "SKH-2026-001",
      agreementValue: 14525000,
      bookingAmount: 1000000,
      agentId: agentUser.id,
      date: new Date("2026-01-10"),
      status: "CONFIRMED",
    },
    {
      leadName: "Deepika Padukone",
      unitNumber: "A-301",
      bookingNumber: "SKH-2026-002",
      agreementValue: 11325000,
      bookingAmount: 500000,
      agentId: agentUser.id,
      date: new Date("2026-01-20"),
      status: "CONFIRMED",
    },
    {
      leadName: "Rajesh & Priya Nair",
      unitNumber: "A-601",
      bookingNumber: "SKH-2026-003",
      agreementValue: 27700000,
      bookingAmount: 2500000,
      agentId: managerUser.id,
      date: new Date("2026-02-01"),
      status: "CONFIRMED",
    },
    {
      leadName: "Karan Johar",
      unitNumber: "B-102",
      bookingNumber: "SKH-2026-004",
      agreementValue: 13840000,
      bookingAmount: 1000000,
      agentId: agentUser.id,
      date: new Date("2026-02-08"),
      status: "PROVISIONAL",
    },
    {
      leadName: "Dr. Arvind Swamy",
      unitNumber: "M-201",
      bookingNumber: "SKM-2026-005",
      agreementValue: 23410000,
      bookingAmount: 2000000,
      agentId: managerUser.id,
      date: new Date("2025-11-15"),
      status: "CONFIRMED",
    },
  ];

  for (const b of bookingsData) {
    const lead = createdLeads[b.leadName];
    const unit = createdUnits[b.unitNumber];
    if (!lead || !unit) continue;

    const booking = await prisma.booking.create({
      data: {
        organizationId: org.id,
        projectId: unit.projectId,
        unitId: unit.id,
        leadId: lead.id,
        bookingNumber: b.bookingNumber,
        agreementValue: b.agreementValue,
        bookingAmountReceived: b.bookingAmount,
        paymentPlanId: clpPlan.id,
        salesAgentId: b.agentId,
        approvedById: managerUser.id,
        status: b.status,
        bookingDate: b.date,
      },
    });

    // Create standard CLP milestones
    const milestones = [
      { name: "On Booking Token (10%)", code: "MS_01", pct: 10, offsetDays: 0, status: "PAID" },
      { name: "On Allotment & Agreement (10%)", code: "MS_02", pct: 10, offsetDays: 30, status: b.bookingNumber === "SKM-2026-005" || b.bookingNumber === "SKH-2026-001" ? "PAID" : "PENDING" },
      { name: "On Foundation Completion (15%)", code: "MS_03", pct: 15, offsetDays: 90, status: b.bookingNumber === "SKM-2026-005" ? "PAID" : "OVERDUE" },
      { name: "On 3rd Slab Casting (15%)", code: "MS_04", pct: 15, offsetDays: 180, status: "PENDING" },
      { name: "On 6th Slab Casting (15%)", code: "MS_05", pct: 15, offsetDays: 270, status: "PENDING" },
      { name: "On Brickwork & Finishing (15%)", code: "MS_06", pct: 15, offsetDays: 360, status: "PENDING" },
      { name: "On Flooring & Fitments (10%)", code: "MS_07", pct: 10, offsetDays: 450, status: "PENDING" },
      { name: "On Handover / Possession (10%)", code: "MS_08", pct: 10, offsetDays: 540, status: "PENDING" },
    ];

    for (const m of milestones) {
      const dueAmount = (b.agreementValue * m.pct) / 100;
      const dueDate = new Date(b.date.getTime() + m.offsetDays * 24 * 3600 * 1000);
      const isDemandSent = m.status === "PAID" || m.status === "OVERDUE";

      const schedule = await prisma.paymentSchedule.create({
        data: {
          bookingId: booking.id,
          milestoneName: m.name,
          milestoneCode: m.code,
          percentage: m.pct,
          dueAmount,
          dueDate,
          status: m.status,
          demandLetterSent: isDemandSent,
          demandLetterSentAt: isDemandSent ? new Date(dueDate.getTime() - 15 * 24 * 3600 * 1000) : null,
        },
      });

      // If milestone is paid, record transaction
      if (m.status === "PAID") {
        await prisma.paymentTransaction.create({
          data: {
            scheduleId: schedule.id,
            bookingId: booking.id,
            amountPaid: dueAmount,
            paymentDate: dueDate,
            mode: "NEFT",
            referenceNo: `UTR-HDFC-${Math.floor(100000000 + Math.random() * 900000000)}`,
            receiptNumber: `REC-${b.bookingNumber}-${m.code}`,
            bankName: "HDFC Bank Ltd.",
            verifiedById: financeUser.id,
            notes: `Full payment cleared against milestone ${m.name}.`,
          },
        });
      }
    }

    // Create Post-Sales Documents
    const docs = [
      { type: "ALLOTMENT_LETTER", title: "Allotment Letter", status: "VERIFIED", fileUrl: "/docs/allotment_sample.pdf" },
      { type: "SALE_AGREEMENT", title: "Agreement for Sale (Registered)", status: b.bookingNumber === "SKM-2026-005" ? "REGISTERED" : "UPLOADED", fileUrl: "/docs/agreement_sample.pdf" },
      { type: "KYC_VERIFICATION", title: "KYC Dossier (PAN & Aadhaar)", status: "VERIFIED", fileUrl: "/docs/kyc_sample.pdf" },
      { type: "OC_CC_CERTIFICATE", title: "Occupancy Certificate (BBMP)", status: b.bookingNumber === "SKM-2026-005" ? "VERIFIED" : "PENDING", fileUrl: "/docs/oc_sample.pdf" },
      { type: "SALE_DEED", title: "Sale Deed & Title Handover", status: b.bookingNumber === "SKM-2026-005" ? "REGISTERED" : "PENDING", fileUrl: "/docs/saledeed_sample.pdf" },
    ];

    for (const doc of docs) {
      await prisma.document.create({
        data: {
          bookingId: booking.id,
          type: doc.type,
          title: doc.title,
          status: doc.status,
          fileUrl: doc.fileUrl,
          uploadedById: legalUser.id,
          verifiedById: doc.status === "VERIFIED" || doc.status === "REGISTERED" ? legalUser.id : null,
          uploadedAt: new Date(b.date.getTime() + 10 * 24 * 3600 * 1000),
          verifiedAt: doc.status === "VERIFIED" || doc.status === "REGISTERED" ? new Date(b.date.getTime() + 15 * 24 * 3600 * 1000) : null,
        },
      });
    }

    // If project is Ready to Move (Project 2 / Unit M-201), create possession & snag record
    if (b.bookingNumber === "SKM-2026-005") {
      const possession = await prisma.possession.create({
        data: {
          bookingId: booking.id,
          scheduledDate: new Date("2026-02-15"),
          actualDate: new Date("2026-02-18"),
          status: "READY_FOR_HANDOVER",
          electricityMeterNo: "BESCOM-LT-8891223",
          waterMeterNo: "BWSSB-WT-441299",
          gasMeterNo: "GAIL-GAS-110022",
          handoverChecklistJson: JSON.stringify([
            { item: "Key handover (3 sets Master, 2 sets Balcony)", checked: true },
            { item: "Electrical fittings & MCB verification", checked: true },
            { item: "Sanitary ware & water pressure test", checked: true },
            { item: "Fire alarm & sprinkler check", checked: true },
            { item: "Clubhouse smart access card issued", checked: true },
          ]),
          notes: "Pre-handover inspection conducted with Dr. Arvind Swamy. Minor painting touch-up completed.",
          handoverById: legalUser.id,
        },
      });

      await prisma.snagItem.create({
        data: {
          possessionId: possession.id,
          category: "PAINTING",
          description: "Minor paint scuff near balcony sliding glass frame",
          location: "Master Bedroom Balcony",
          status: "RESOLVED",
          reportedAt: new Date("2026-02-10"),
          resolvedAt: new Date("2026-02-14"),
        },
      });

      await prisma.snagItem.create({
        data: {
          possessionId: possession.id,
          category: "ELECTRICAL",
          description: "Kitchen island pendant light switch loose contact",
          location: "Modular Kitchen",
          status: "RESOLVED",
          reportedAt: new Date("2026-02-10"),
          resolvedAt: new Date("2026-02-13"),
        },
      });
    }
  }

  console.log("✅ Seed database finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
