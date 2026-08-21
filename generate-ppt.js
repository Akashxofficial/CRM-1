const pptxgen = require("pptxgenjs");
const path = require("path");

const pptx = new pptxgen();

// Set presentation properties
pptx.author = "Antigravity (SDE-3 & Executive Team)";
pptx.company = "PropCRM Enterprise";
pptx.title = "PropCRM — Complete System Architecture & Executive Pitch Deck";
pptx.layout = "LAYOUT_16x9";

// Color Palette (Luxury Slate & Gold / Emerald Enterprise Theme)
const COLORS = {
  BG_DARK: "0F172A",       // Deep Slate 900
  BG_CARD: "1E293B",       // Slate 800
  BG_CARD_LIGHT: "334155", // Slate 700
  TEXT_LIGHT: "F8FAFC",    // Slate 50
  TEXT_MUTED: "94A3B8",    // Slate 400
  ACCENT_GOLD: "F59E0B",   // Amber/Gold
  ACCENT_EMERALD: "10B981",// Emerald Green
  ACCENT_BLUE: "38BDF8",   // Sky Blue
  ACCENT_PURPLE: "A855F7", // Purple
  ACCENT_ROSE: "F43F5E",   // Rose Red
  BORDER: "475569"         // Slate 600
};

// Helper: Add Standard Slide Background & Header/Footer
function createSlide(title, subtitle, category = "PROPCRM ARCHITECTURE DECK") {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.BG_DARK };

  // Top Header Banner
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 1.1,
    fill: { color: COLORS.BG_CARD },
    line: { color: COLORS.BORDER, width: 1 }
  });

  // Category Tag
  slide.addText(category.toUpperCase(), {
    x: 0.8, y: 0.15, w: 8.0, h: 0.3,
    fontSize: 10, fontFace: "Calibri", bold: true,
    color: COLORS.ACCENT_GOLD,
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8, y: 0.45, w: 10.5, h: 0.5,
    fontSize: 20, fontFace: "Calibri", bold: true,
    color: COLORS.TEXT_LIGHT,
  });

  // Footer Banner
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.0, w: "100%", h: 0.5,
    fill: { color: "0B0F19" }
  });

  slide.addText("PropCRM — Confidential & Proprietary | Real Estate Enterprise Solution", {
    x: 0.8, y: 7.1, w: 8.0, h: 0.3,
    fontSize: 9, fontFace: "Calibri", color: COLORS.TEXT_MUTED
  });

  slide.addText("SDE-3 & CEO Technical Review", {
    x: 9.5, y: 7.1, w: 3.0, h: 0.3,
    fontSize: 9, fontFace: "Calibri", align: "right", color: COLORS.ACCENT_GOLD
  });

  return slide;
}

// ----------------------------------------------------
// SLIDE 1: Title Slide (Cover)
// ----------------------------------------------------
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.BG_DARK };

  // Hero Card Box
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.0, y: 1.2, w: 11.33, h: 5.1,
    fill: { color: COLORS.BG_CARD },
    line: { color: COLORS.ACCENT_GOLD, width: 2 }
  });

  slide.addText("ENTERPRISE REAL ESTATE CLOUD PLATFORM", {
    x: 1.5, y: 1.7, w: 10.0, h: 0.4,
    fontSize: 13, fontFace: "Calibri", bold: true, color: COLORS.ACCENT_GOLD
  });

  slide.addText("PropCRM — Full Project Architecture & Implementation", {
    x: 1.5, y: 2.2, w: 10.0, h: 1.1,
    fontSize: 28, fontFace: "Calibri", bold: true, color: COLORS.TEXT_LIGHT
  });

  slide.addText("End-to-End System Breakdown: Tech Stack, L2P Lifecycle, Multi-Tenant Database, 2000+ User Scalability & Enterprise Security", {
    x: 1.5, y: 3.4, w: 10.0, h: 0.7,
    fontSize: 14, fontFace: "Calibri", color: COLORS.TEXT_MUTED
  });

  // Details Chips
  const chips = [
    { label: "Role Perspective", val: "SDE-3 / Co-Founder & CEO", col: COLORS.ACCENT_BLUE },
    { label: "Core Architecture", val: "Next.js 15 + Prisma + RBAC", col: COLORS.ACCENT_EMERALD },
    { label: "Target Concurrency", val: "2,000+ Concurrent Users", col: COLORS.ACCENT_PURPLE }
  ];

  chips.forEach((c, idx) => {
    const xPos = 1.5 + idx * 3.4;
    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: 4.5, w: 3.2, h: 1.2,
      fill: { color: COLORS.BG_CARD_LIGHT },
      line: { color: COLORS.BORDER, width: 1 }
    });
    slide.addText(c.label.toUpperCase(), {
      x: xPos + 0.15, y: 4.65, w: 2.9, h: 0.25,
      fontSize: 9, fontFace: "Calibri", bold: true, color: c.col
    });
    slide.addText(c.val, {
      x: xPos + 0.15, y: 4.95, w: 2.9, h: 0.6,
      fontSize: 12, fontFace: "Calibri", bold: true, color: COLORS.TEXT_LIGHT
    });
  });
}

// ----------------------------------------------------
// SLIDE 2: Executive Summary & Real Estate Problem Statement
// ----------------------------------------------------
{
  const slide = createSlide("Executive Summary & Core Value Proposition", "Why PropCRM Exists");

  // Left Card: Industry Problem
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.4, w: 5.6, h: 5.3,
    fill: { color: COLORS.BG_CARD },
    line: { color: COLORS.ACCENT_ROSE, width: 1.5 }
  });

  slide.addText("🚨 The Industry Bottlenecks (Legacy Real Estate)", {
    x: 1.0, y: 1.6, w: 5.2, h: 0.4,
    fontSize: 14, fontFace: "Calibri", bold: true, color: COLORS.ACCENT_ROSE
  });

  const problems = [
    "Fragmented Tools: Leads in WhatsApp/Excel, inventory on paper/whiteboards, billing on Tally.",
    "Double-Booking Disasters: Agents selling the same luxury unit simultaneously due to no real-time locking.",
    "Delayed Revenue Collections: Manual calculation of construction milestones leads to months of cashflow delay.",
    "Post-Sales Churn: Unorganized snag punchlists and missing KYC documents delay possession handovers.",
    "Zero Executive Visibility: CEOs have no live visibility into actual revenue realization vs pipeline."
  ];

  problems.forEach((p, idx) => {
    slide.addText(`• ${p}`, {
      x: 1.0, y: 2.1 + (idx * 0.85), w: 5.2, h: 0.75,
      fontSize: 11, fontFace: "Calibri", color: COLORS.TEXT_LIGHT
    });
  });

  // Right Card: PropCRM Unified Solution
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.8, y: 1.4, w: 5.7, h: 5.3,
    fill: { color: COLORS.BG_CARD },
    line: { color: COLORS.ACCENT_EMERALD, width: 1.5 }
  });

  slide.addText("✨ PropCRM Unified Enterprise Solution", {
    x: 7.0, y: 1.6, w: 5.3, h: 0.4,
    fontSize: 14, fontFace: "Calibri", bold: true, color: COLORS.ACCENT_EMERALD
  });

  const solutions = [
    "Single Pane of Glass: From lead capture to key handover in one unified, real-time web application.",
    "48-Hour Atomic Unit Hold: Distributed unit locking eliminates double-bookings with auto-releasing timers.",
    "Automated CLP Milestone Billing: 1-Click Demand Letters with escrow details and payment receipt reconciliation.",
    "Digital Post-Sales & Snags: Category-wise punchlist resolution (Civil, Plumbing, Electrical) & Possession Certificates.",
    "Live Executive Dashboards: Real-time revenue realization curves, conversion velocity, and agent leaderboards."
  ];

  solutions.forEach((s, idx) => {
    slide.addText(`✔ ${s}`, {
      x: 7.0, y: 2.1 + (idx * 0.85), w: 5.3, h: 0.75,
      fontSize: 11, fontFace: "Calibri", color: COLORS.TEXT_LIGHT
    });
  });
}

// ----------------------------------------------------
// SLIDE 3: Verified Technology Stack (Only Used Technologies)
// ----------------------------------------------------
{
  const slide = createSlide("Verified Technology Stack (100% Implemented & Active)", "Strict Codebase Audit");

  const stackItems = [
    { category: "Frontend Framework", name: "Next.js 15.5+ & React 19", desc: "App Router, Server Actions, React Server Components (RSC) for zero-waterfall layouts.", color: COLORS.ACCENT_BLUE },
    { category: "Core Language", name: "TypeScript 5.7", desc: "Strict end-to-end type safety spanning DB models, actions, and UI components.", color: COLORS.ACCENT_EMERALD },
    { category: "Design & Styling", name: "Tailwind CSS 3.4", desc: "Custom luxury dark/slate aesthetic with gold, emerald, and amber accent tokens.", color: COLORS.ACCENT_GOLD },
    { category: "Database & ORM", name: "Prisma ORM 6.3 + MongoDB", desc: "Type-safe database abstraction with relations, migrations, and schema validation.", color: COLORS.ACCENT_PURPLE },
    { category: "State & Data Fetching", name: "TanStack React Query v5", desc: "Client-side server state management, caching, optimistic mutations, and revalidation.", color: COLORS.ACCENT_BLUE },
    { category: "Authentication & Security", name: "Jose (JWT) + HTTP-Only Cookies", desc: "Stateless, cryptographically signed token auth with 5-tier role-based access control.", color: COLORS.ACCENT_ROSE },
    { category: "Analytics & Visuals", name: "Recharts 2.15 + Lucide Icons", desc: "Interactive collection vs booking graphs, conversion funnels, and executive KPIs.", color: COLORS.ACCENT_EMERALD },
    { category: "Communication & Utils", name: "Nodemailer + Zod + Date-fns", desc: "Automated transactional email dispatch (demand letters/receipts) + strict payload validation.", color: COLORS.ACCENT_GOLD }
  ];

  stackItems.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xPos = 0.8 + col * 5.9;
    const yPos = 1.4 + row * 1.35;

    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: yPos, w: 5.6, h: 1.2,
      fill: { color: COLORS.BG_CARD },
      line: { color: COLORS.BORDER, width: 1 }
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: yPos, w: 0.1, h: 1.2,
      fill: { color: item.color }
    });

    slide.addText(item.category.toUpperCase(), {
      x: xPos + 0.25, y: yPos + 0.1, w: 5.1, h: 0.25,
      fontSize: 9, fontFace: "Calibri", bold: true, color: item.color
    });

    slide.addText(item.name, {
      x: xPos + 0.25, y: yPos + 0.35, w: 5.1, h: 0.35,
      fontSize: 12, fontFace: "Calibri", bold: true, color: COLORS.TEXT_LIGHT
    });

    slide.addText(item.desc, {
      x: xPos + 0.25, y: yPos + 0.7, w: 5.1, h: 0.45,
      fontSize: 10, fontFace: "Calibri", color: COLORS.TEXT_MUTED
    });
  });
}

// ----------------------------------------------------
// SLIDE 4: Core Real Estate Business Lifecycle (L2P)
// ----------------------------------------------------
{
  const slide = createSlide("End-to-End Business Flow: Lead to Possession", "How the Business Functions");

  const stages = [
    { num: "01", title: "Lead Funnel", desc: "Ingestion via web/ads, duplicate detection by phone/email, Kanban stage tracking & activity log.", col: COLORS.ACCENT_BLUE },
    { num: "02", title: "Unit Matrix", desc: "Interactive floor grid visualizer. 48-hour temporary hold lock with countdown timer.", col: COLORS.ACCENT_EMERALD },
    { num: "03", title: "1-Click Booking", desc: "Lock unit, bind buyer & price, attach CLP payment plan, generate official Booking Letter.", col: COLORS.ACCENT_PURPLE },
    { num: "04", title: "Milestone Billing", desc: "Construction milestone triggers, automated Demand Letters, receipt issuance & ageing report.", col: COLORS.ACCENT_GOLD },
    { num: "05", title: "Post-Sales Legal", desc: "Document checklist (KYC, Sale Deed, OC/CC) status: Pending -> Uploaded -> Verified.", col: COLORS.ACCENT_BLUE },
    { num: "06", title: "Possession & Snags", desc: "Category-wise snag logging, punchlist signoff, utility meter reading & Possession Certificate.", col: COLORS.ACCENT_ROSE }
  ];

  stages.forEach((st, idx) => {
    const xPos = 0.8 + (idx * 1.95);
    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: 1.6, w: 1.85, h: 4.9,
      fill: { color: COLORS.BG_CARD },
      line: { color: st.col, width: 1.5 }
    });

    slide.addText(st.num, {
      x: xPos + 0.1, y: 1.8, w: 1.65, h: 0.5,
      fontSize: 22, fontFace: "Calibri", bold: true, color: st.col
    });

    slide.addText(st.title, {
      x: xPos + 0.1, y: 2.4, w: 1.65, h: 0.6,
      fontSize: 13, fontFace: "Calibri", bold: true, color: COLORS.TEXT_LIGHT
    });

    slide.addText(st.desc, {
      x: xPos + 0.1, y: 3.1, w: 1.65, h: 3.2,
      fontSize: 10.5, fontFace: "Calibri", color: COLORS.TEXT_MUTED
    });
  });
}

// ----------------------------------------------------
// SLIDE 5: Database Architecture & Data Schema Breakdown
// ----------------------------------------------------
{
  const slide = createSlide("Database Design & Multi-Tenant Schema", "Prisma ORM & Data Models");

  const tables = [
    { name: "Organization", fields: "id, name, slug, reraNo, logo", role: "Multi-tenant tenant partition boundary" },
    { name: "User", fields: "id, email, password, role, orgId", role: "RBAC user accounts with assigned leads & bookings" },
    { name: "Project & Tower", fields: "id, name, location, reraNumber, units", role: "Project hierarchy with towers and floors" },
    { name: "Unit", fields: "unitNumber, floor, type, baseRate, status", role: "Available, Held (48h timer), Booked, Sold, Blocked" },
    { name: "Lead & LeadActivity", fields: "name, phone, email, status, priority", role: "Lead funnel with calls, WhatsApp, & site visit timeline" },
    { name: "Booking", fields: "bookingNumber, agreementVal, paymentPlan", role: "Central transactional record binding Unit + Lead" },
    { name: "PaymentSchedule", fields: "milestoneName, percentage, dueAmount", role: "CLP milestones, demand letters, & overdue status" },
    { name: "Document & SnagItem", fields: "type, status, photoUrl, handoverJson", role: "Post-sales legal checklist & snag punchlists" }
  ];

  tables.forEach((t, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xPos = 0.8 + col * 5.9;
    const yPos = 1.4 + row * 1.35;

    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: yPos, w: 5.6, h: 1.2,
      fill: { color: COLORS.BG_CARD },
      line: { color: COLORS.BORDER, width: 1 }
    });

    slide.addText(`model ${t.name}`, {
      x: xPos + 0.2, y: yPos + 0.1, w: 5.2, h: 0.3,
      fontSize: 12, fontFace: "Consolas", bold: true, color: COLORS.ACCENT_GOLD
    });

    slide.addText(`Fields: ${t.fields}`, {
      x: xPos + 0.2, y: yPos + 0.4, w: 5.2, h: 0.3,
      fontSize: 9.5, fontFace: "Calibri", color: COLORS.TEXT_MUTED
    });

    slide.addText(`Purpose: ${t.role}`, {
      x: xPos + 0.2, y: yPos + 0.7, w: 5.2, h: 0.4,
      fontSize: 10, fontFace: "Calibri", color: COLORS.ACCENT_EMERALD
    });
  });
}

// ----------------------------------------------------
// SLIDE 6: Role-Based Access Control (5-Tier RBAC)
// ----------------------------------------------------
{
  const slide = createSlide("Enterprise 5-Tier Role-Based Access Control (RBAC)", "Security & Governance");

  const rbacRoles = [
    { role: "ADMIN / CEO", scope: "Global 360° Access", perm: "Full analytics, project creation, unit pricing, user management, audit logs, financial exports.", col: COLORS.ACCENT_PURPLE },
    { role: "SALES MANAGER", scope: "Team Leadership", perm: "Team lead velocity, pipeline oversight, unit hold approvals, booking approvals, sales reporting.", col: COLORS.ACCENT_BLUE },
    { role: "SALES AGENT", scope: "Personal Pipeline", perm: "Assigned leads, daily follow-up queue, unit temporary hold (48h), booking entry, personal incentive stats.", col: COLORS.ACCENT_EMERALD },
    { role: "ACCOUNTS / FINANCE", scope: "Billing & Revenue", perm: "Payment schedules (CLP), 1-click demand letter dispatch, receipt issuance, overdue ageing buckets.", col: COLORS.ACCENT_GOLD },
    { role: "POST-SALES / LEGAL", scope: "Documentation & Handover", perm: "KYC verification, Sale Agreement registry, OC/CC upload, snag punchlist inspection, Possession Certificate.", col: COLORS.ACCENT_ROSE }
  ];

  rbacRoles.forEach((r, idx) => {
    const yPos = 1.4 + idx * 1.05;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: yPos, w: 11.7, h: 0.95,
      fill: { color: COLORS.BG_CARD },
      line: { color: r.col, width: 1.5 }
    });

    slide.addText(r.role, {
      x: 1.0, y: yPos + 0.15, w: 2.4, h: 0.35,
      fontSize: 12, fontFace: "Calibri", bold: true, color: r.col
    });

    slide.addText(r.scope, {
      x: 1.0, y: yPos + 0.5, w: 2.4, h: 0.3,
      fontSize: 10, fontFace: "Calibri", color: COLORS.TEXT_MUTED
    });

    slide.addText(r.perm, {
      x: 3.6, y: yPos + 0.18, w: 8.7, h: 0.6,
      fontSize: 11, fontFace: "Calibri", color: COLORS.TEXT_LIGHT
    });
  });
}

// ----------------------------------------------------
// SLIDE 7: Module Deep Dive: Leads, Inventory & Bookings
// ----------------------------------------------------
{
  const slide = createSlide("Core Modules: Leads, Visual Inventory & Bookings", "Sales Engine Execution");

  const modules = [
    {
      title: "🎯 Lead Management & Ingestion",
      points: [
        "Kanban Pipeline & High-density Table with status filters.",
        "Automatic Duplicate Detection using phone/email matching.",
        "Activity Timeline logging calls, WhatsApp messages, & site visits.",
        "Today's Workflow queue with overdue follow-up alerts."
      ],
      col: COLORS.ACCENT_BLUE
    },
    {
      title: "🏢 Visual Inventory & Locking",
      points: [
        "Tower & Floor interactive matrix with color-coded unit statuses.",
        "48-Hour Atomic Hold Lock preventing concurrent double-bookings.",
        "Auto-releasing hold timer with hold extension approval.",
        "Bulk CSV / Excel unit importer with instant pricing calculations."
      ],
      col: COLORS.ACCENT_EMERALD
    },
    {
      title: "📝 1-Click Booking & Pricing",
      points: [
        "Dynamic Cost Sheet: Base rate + PLC + Parking + Taxes.",
        "Payment Plan Templates: Construction Linked Plan (CLP), Subvention.",
        "Instant Unit Status Lock from Held -> Booked.",
        "Print-ready Official Booking Allotment Letter generator."
      ],
      col: COLORS.ACCENT_PURPLE
    }
  ];

  modules.forEach((m, idx) => {
    const xPos = 0.8 + idx * 3.95;
    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: 1.4, w: 3.8, h: 5.3,
      fill: { color: COLORS.BG_CARD },
      line: { color: m.col, width: 1.5 }
    });

    slide.addText(m.title, {
      x: xPos + 0.2, y: 1.6, w: 3.4, h: 0.5,
      fontSize: 13, fontFace: "Calibri", bold: true, color: m.col
    });

    m.points.forEach((pt, pIdx) => {
      slide.addText(`• ${pt}`, {
        x: xPos + 0.2, y: 2.2 + pIdx * 1.05, w: 3.4, h: 0.95,
        fontSize: 10.5, fontFace: "Calibri", color: COLORS.TEXT_LIGHT
      });
    });
  });
}

// ----------------------------------------------------
// SLIDE 8: Module Deep Dive: Payments, Legal & Possession
// ----------------------------------------------------
{
  const slide = createSlide("Core Modules: Finance, Post-Sales Legal & Snagging", "Post-Sale Execution");

  const modules = [
    {
      title: "💳 Payments & Milestone Billing",
      points: [
        "Construction Linked Payment (CLP) milestone schedule generation.",
        "Official Printable Demand Letters with builder bank escrow details.",
        "Multi-mode payment reconciliation (NEFT, RTGS, Cheque, UPI).",
        "Overdue Ageing Buckets (0-30, 31-60, 61-90, 90+ days) for cashflow."
      ],
      col: COLORS.ACCENT_GOLD
    },
    {
      title: "📂 Post-Sales & Legal Paperwork",
      points: [
        "Comprehensive 7-Document Verification Lifecycle.",
        "Status stages: Pending -> Generated -> Uploaded -> Verified -> Registered.",
        "Allotment Letters, Sale Agreements, KYC, OC/CC, and Sale Deeds.",
        "Document verification audit trail with authorized staff stamps."
      ],
      col: COLORS.ACCENT_BLUE
    },
    {
      title: "🔑 Possession Handover & Snags",
      points: [
        "Category-wise Snag Punchlist (Civil, Electrical, Plumbing, Paint).",
        "Snag status toggle: Open -> In Progress -> Resolved -> Verified.",
        "Handover checklist: Electricity, water, and gas meter readings.",
        "Official Printable Possession Certificate generation."
      ],
      col: COLORS.ACCENT_ROSE
    }
  ];

  modules.forEach((m, idx) => {
    const xPos = 0.8 + idx * 3.95;
    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: 1.4, w: 3.8, h: 5.3,
      fill: { color: COLORS.BG_CARD },
      line: { color: m.col, width: 1.5 }
    });

    slide.addText(m.title, {
      x: xPos + 0.2, y: 1.6, w: 3.4, h: 0.5,
      fontSize: 13, fontFace: "Calibri", bold: true, color: m.col
    });

    m.points.forEach((pt, pIdx) => {
      slide.addText(`• ${pt}`, {
        x: xPos + 0.2, y: 2.2 + pIdx * 1.05, w: 3.4, h: 0.95,
        fontSize: 10.5, fontFace: "Calibri", color: COLORS.TEXT_LIGHT
      });
    });
  });
}

// ----------------------------------------------------
// SLIDE 9: Additional Features: Outreach, Calls, Builders & Leaderboard
// ----------------------------------------------------
{
  const slide = createSlide("Ancillary Ecosystem Modules in Codebase", "Extended Platform Capabilities");

  const extras = [
    { title: "📞 Calls & Calling Workflows (/calls)", desc: "Telecalling dialer interface, structured call outcome logging, follow-up scheduling, and call disposition analytics.", col: COLORS.ACCENT_BLUE },
    { title: "📢 Multi-Channel Outreach (/outreach)", desc: "Targeted customer outreach campaigns via WhatsApp and Email for project launches, payment reminders, and event invites.", col: COLORS.ACCENT_EMERALD },
    { title: "🏆 Sales Leaderboard & Incentives (/leaderboard)", desc: "Gamified sales performance dashboard tracking deals closed, revenue generated, and dynamic commission slabs.", col: COLORS.ACCENT_GOLD },
    { title: "🏗️ Builders & Property Listings (/builders, /listings)", desc: "Developer profile management, master project catalogs, public-facing property showcase, and unit inventory sync.", col: COLORS.ACCENT_PURPLE }
  ];

  extras.forEach((ex, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xPos = 0.8 + col * 5.9;
    const yPos = 1.4 + row * 2.65;

    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: yPos, w: 5.6, h: 2.45,
      fill: { color: COLORS.BG_CARD },
      line: { color: ex.col, width: 1.5 }
    });

    slide.addText(ex.title, {
      x: xPos + 0.2, y: yPos + 0.2, w: 5.2, h: 0.4,
      fontSize: 13, fontFace: "Calibri", bold: true, color: ex.col
    });

    slide.addText(ex.desc, {
      x: xPos + 0.2, y: yPos + 0.7, w: 5.2, h: 1.6,
      fontSize: 11, fontFace: "Calibri", color: COLORS.TEXT_LIGHT
    });
  });
}

// ----------------------------------------------------
// SLIDE 10: Scalability to 2,000+ Concurrent Users (CEO Question)
// ----------------------------------------------------
{
  const slide = createSlide("High-Concurrency Architecture (2,000+ Active Users)", "CEO Technical Scalability Strategy");

  const scalePillars = [
    {
      num: "01",
      title: "Stateless Next.js Web Pods (HPA)",
      desc: "JWT authentication in cookies makes web instances 100% stateless. Auto-scale container pods (2 to 20 instances) on Kubernetes / AWS ECS behind an Application Load Balancer.",
      col: COLORS.ACCENT_BLUE
    },
    {
      num: "02",
      title: "Prisma Accelerate & Connection Pooling",
      desc: "Eliminates database connection exhaustion under 2,000+ concurrent users via PgBouncer / Prisma Accelerate connection poolers and MongoDB Atlas replica clusters.",
      col: COLORS.ACCENT_EMERALD
    },
    {
      num: "03",
      title: "Redis Sub-Millisecond Caching Layer",
      desc: "Caches interactive tower/floor inventory grids and leaderboard queries in Redis. Utilizes Redis distributed mutex locks (SETNX) for instantaneous unit holding without DB write bottlenecks.",
      col: COLORS.ACCENT_PURPLE
    },
    {
      num: "04",
      title: "Asynchronous Background Queue Workers",
      desc: "Offloads bulk Demand Letter PDF rendering, KYC compression, and mass Nodemailer dispatch to BullMQ / AWS SQS workers, keeping API response latency under 50ms.",
      col: COLORS.ACCENT_GOLD
    }
  ];

  scalePillars.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xPos = 0.8 + col * 5.9;
    const yPos = 1.4 + row * 2.65;

    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: yPos, w: 5.6, h: 2.45,
      fill: { color: COLORS.BG_CARD },
      line: { color: p.col, width: 1.5 }
    });

    slide.addText(`${p.num}. ${p.title}`, {
      x: xPos + 0.2, y: yPos + 0.2, w: 5.2, h: 0.4,
      fontSize: 13, fontFace: "Calibri", bold: true, color: p.col
    });

    slide.addText(p.desc, {
      x: xPos + 0.2, y: yPos + 0.7, w: 5.2, h: 1.6,
      fontSize: 11, fontFace: "Calibri", color: COLORS.TEXT_LIGHT
    });
  });
}

// ----------------------------------------------------
// SLIDE 11: Enterprise Security Hardening & Compliance
// ----------------------------------------------------
{
  const slide = createSlide("Enterprise Security, Encryption & Compliance", "Bank-Grade Security Hardening");

  const secRows = [
    { vector: "Multi-Tenant Data Isolation", impl: "Strict organizationId scoping on every Prisma query. Zero possibility of cross-tenant data leakage.", standard: "SOC 2 Type II" },
    { vector: "Stateless JWT Authentication", impl: "Cryptographically signed JWTs via 'jose' stored in Secure, HttpOnly, SameSite=Strict cookies.", standard: "OWASP ASVS L2" },
    { vector: "Server-Side RBAC Enforcement", impl: "Granular permission validation on every Next.js Server Action before any database interaction.", standard: "Least Privilege" },
    { vector: "Input Validation & Anti-Injection", impl: "Strict Zod schema validation on all inputs; parameterized queries prevent SQL/NoSQL injections.", standard: "OWASP Top 10" },
    { vector: "Tamper-Evident Audit Logging", impl: "Every critical mutation (Hold, Booking, Payment, Snag) logged in AuditLog table with actor & timestamp.", standard: "ISO 27001 Audit" },
    { vector: "Data Encryption & Transport", impl: "AES-256 encryption at rest for DB/S3 storage and TLS 1.3 encryption in transit across all endpoints.", standard: "DPDP Act India" }
  ];

  secRows.forEach((s, idx) => {
    const yPos = 1.4 + idx * 0.88;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: yPos, w: 11.7, h: 0.8,
      fill: { color: COLORS.BG_CARD },
      line: { color: COLORS.BORDER, width: 1 }
    });

    slide.addText(s.vector, {
      x: 1.0, y: yPos + 0.15, w: 3.2, h: 0.35,
      fontSize: 11, fontFace: "Calibri", bold: true, color: COLORS.ACCENT_GOLD
    });

    slide.addText(s.impl, {
      x: 4.3, y: yPos + 0.15, w: 6.0, h: 0.55,
      fontSize: 10, fontFace: "Calibri", color: COLORS.TEXT_LIGHT
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: 10.4, y: yPos + 0.15, w: 1.9, h: 0.45,
      fill: { color: COLORS.BG_CARD_LIGHT },
      line: { color: COLORS.ACCENT_EMERALD, width: 1 }
    });

    slide.addText(s.standard, {
      x: 10.4, y: yPos + 0.22, w: 1.9, h: 0.3,
      fontSize: 9, fontFace: "Calibri", bold: true, align: "center", color: COLORS.ACCENT_EMERALD
    });
  });
}

// ----------------------------------------------------
// SLIDE 12: Executive Vision, Strategic Roadmap & Conclusion
// ----------------------------------------------------
{
  const slide = createSlide("Executive Conclusion & Product Roadmap", "SDE-3 & CEO Strategic Alignment");

  // Left Box: Current Platform Strength
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.4, w: 5.6, h: 5.3,
    fill: { color: COLORS.BG_CARD },
    line: { color: COLORS.ACCENT_EMERALD, width: 1.5 }
  });

  slide.addText("🏆 Current Production Readiness", {
    x: 1.0, y: 1.6, w: 5.2, h: 0.4,
    fontSize: 14, fontFace: "Calibri", bold: true, color: COLORS.ACCENT_EMERALD
  });

  const strengths = [
    "Full-Spectrum Coverage: Lead capture, visual inventory, 1-click booking, CLP billing, and digital possession.",
    "Type-Safe Architecture: Zero-overhead Server Actions with Prisma ORM and strict Zod validation.",
    "5-Tier Role Isolation: Tailored workflows for CEO, Managers, Sales Reps, Accounts, and Legal teams.",
    "Immediate Scalability: Stateless web tier ready for instant multi-container deployment behind Cloudflare & ALB."
  ];

  strengths.forEach((st, idx) => {
    slide.addText(`✔ ${st}`, {
      x: 1.0, y: 2.2 + idx * 1.1, w: 5.2, h: 0.95,
      fontSize: 11, fontFace: "Calibri", color: COLORS.TEXT_LIGHT
    });
  });

  // Right Box: Roadmap
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.8, y: 1.4, w: 5.7, h: 5.3,
    fill: { color: COLORS.BG_CARD },
    line: { color: COLORS.ACCENT_GOLD, width: 1.5 }
  });

  slide.addText("🚀 Strategic Product Roadmap (Q3 - Q4)", {
    x: 7.0, y: 1.6, w: 5.3, h: 0.4,
    fontSize: 14, fontFace: "Calibri", bold: true, color: COLORS.ACCENT_GOLD
  });

  const roadmap = [
    "Phase 1 — AI Lead Qualification: WhatsApp AI Bot for 24/7 lead scoring and automated site visit scheduling.",
    "Phase 2 — Mobile App for Agents & Snags: Dedicated offline-first mobile app for site engineers and field agents.",
    "Phase 3 — Automated Escrow Reconciliation: Virtual bank account integration (Razorpay/Cashfree) for instant RTGS matching.",
    "Phase 4 — Channel Partner (CP) Club: Broker portal with live inventory sharing and automatic commission calculations."
  ];

  roadmap.forEach((rm, idx) => {
    slide.addText(`➔ ${rm}`, {
      x: 7.0, y: 2.2 + idx * 1.1, w: 5.3, h: 0.95,
      fontSize: 11, fontFace: "Calibri", color: COLORS.TEXT_LIGHT
    });
  });
}

// Save Presentation
const outputPath = path.join(__dirname, "PropCRM_Executive_Architecture_Deck.pptx");
pptx.writeFile({ fileName: outputPath }).then((fileName) => {
  console.log(`Presentation successfully created at: ${fileName}`);
}).catch((err) => {
  console.error("Error creating presentation:", err);
});
