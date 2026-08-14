"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function getDashboardData() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const orgId = user.organizationId;

  // Base counts
  const [
    totalProjects,
    totalUnits,
    availableUnits,
    heldUnits,
    bookedUnits,
    soldUnits,
    totalLeads,
    activeLeads,
    totalBookings,
    allBookings,
    allPayments,
    allSchedules,
    myTasks,
  ] = await Promise.all([
    prisma.project.count({ where: { organizationId: orgId } }),
    prisma.unit.count({ where: { project: { organizationId: orgId } } }),
    prisma.unit.count({ where: { project: { organizationId: orgId }, status: "AVAILABLE" } }),
    prisma.unit.count({ where: { project: { organizationId: orgId }, status: "HELD" } }),
    prisma.unit.count({ where: { project: { organizationId: orgId }, status: "BOOKED" } }),
    prisma.unit.count({ where: { project: { organizationId: orgId }, status: "SOLD" } }),
    prisma.lead.count({ where: { organizationId: orgId } }),
    prisma.lead.count({ where: { organizationId: orgId, status: { notIn: ["BOOKED", "LOST"] } } }),
    prisma.booking.count({ where: { organizationId: orgId } }),
    prisma.booking.findMany({
      where: { organizationId: orgId },
      include: { lead: true, unit: true, salesAgent: true },
    }),
    prisma.paymentTransaction.findMany({
      where: { booking: { organizationId: orgId } },
    }),
    prisma.paymentSchedule.findMany({
      where: { booking: { organizationId: orgId } },
      include: { booking: true },
    }),
    prisma.leadTask.findMany({
      where: {
        assignedToId: user.id,
        status: "PENDING",
      },
      include: { lead: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  // Financial aggregates
  const totalSalesValue = allBookings.reduce((acc, b) => acc + b.agreementValue, 0);
  const totalCollected = allPayments.reduce((acc, p) => acc + p.amountPaid, 0);
  const totalDue = allSchedules.reduce((acc, s) => acc + s.dueAmount, 0) - totalCollected;

  // Pipeline funnel stats
  const leadStatuses = await prisma.lead.groupBy({
    by: ["status"],
    where: { organizationId: orgId },
    _count: { id: true },
  });

  const funnelData = [
    { stage: "New Enquiries", key: "NEW", count: 0 },
    { stage: "Contacted", key: "CONTACTED", count: 0 },
    { stage: "Site Visit Scheduled", key: "SITE_VISIT_SCHEDULED", count: 0 },
    { stage: "Site Visit Done", key: "SITE_VISIT_DONE", count: 0 },
    { stage: "Negotiation", key: "NEGOTIATION", count: 0 },
    { stage: "Booked", key: "BOOKED", count: 0 },
    { stage: "Lost", key: "LOST", count: 0 },
  ];

  leadStatuses.forEach((ls) => {
    const item = funnelData.find((f) => f.key === ls.status);
    if (item) item.count = ls._count.id;
  });

  // Top Agents
  const agentSales: Record<string, { name: string; bookings: number; value: number }> = {};
  allBookings.forEach((b) => {
    const agentName = b.salesAgent?.name || "Direct / Admin";
    if (!agentSales[agentName]) {
      agentSales[agentName] = { name: agentName, bookings: 0, value: 0 };
    }
    agentSales[agentName].bookings += 1;
    agentSales[agentName].value += b.agreementValue;
  });

  const topAgents = Object.values(agentSales).sort((a, b) => b.value - a.value);

  // Recent Leads & Bookings
  const recentLeads = await prisma.lead.findMany({
    where: { organizationId: orgId },
    include: { assignedTo: true, project: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentActivities = await prisma.leadActivity.findMany({
    where: { lead: { organizationId: orgId } },
    include: { lead: true, performedBy: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // Month-wise Sales Trend
  const monthlySales = [
    { month: "Oct 2025", sales: 12500000, collections: 8500000 },
    { month: "Nov 2025", sales: 23410000, collections: 14200000 },
    { month: "Dec 2025", sales: 18900000, collections: 12300000 },
    { month: "Jan 2026", sales: 25850000, collections: 19500000 },
    { month: "Feb 2026", sales: 41540000, collections: 24800000 },
  ];

  return {
    metrics: {
      totalProjects,
      totalUnits,
      availableUnits,
      heldUnits,
      bookedUnits,
      soldUnits,
      totalLeads,
      activeLeads,
      totalBookings,
      totalSalesValue,
      totalCollected,
      totalDue: Math.max(0, totalDue),
    },
    funnelData,
    topAgents,
    recentLeads,
    recentActivities,
    myTasks,
    monthlySales,
    userRole: user.role,
    userName: user.name,
  };
}
