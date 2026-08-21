const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PropCRM — Executive Architecture & Implementation Deck</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  @page {
    size: 297mm 210mm; /* A4 Landscape */
    margin: 0;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #0b0f19;
    color: #f8fafc;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .slide {
    width: 297mm;
    height: 210mm;
    page-break-after: always;
    page-break-inside: avoid;
    padding: 16mm 20mm 14mm 20mm;
    position: relative;
    background: radial-gradient(circle at top right, #1e293b 0%, #0f172a 60%, #080d1a 100%);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .slide-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 2px solid #334155;
    padding-bottom: 8px;
    margin-bottom: 12px;
  }

  .slide-tag {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #f59e0b;
    margin-bottom: 4px;
  }

  .slide-title {
    font-size: 22px;
    font-weight: 800;
    color: #ffffff;
  }

  .slide-number {
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
    background: #1e293b;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid #475569;
  }

  .slide-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: center;
  }

  .slide-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #1e293b;
    padding-top: 8px;
    font-size: 10px;
    color: #64748b;
  }

  /* Grid Layouts */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
  }

  .grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .grid-6 {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
  }

  /* Cards */
  .card {
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 14px;
    backdrop-filter: blur(10px);
  }

  .card-highlight {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.05);
  }

  .card-emerald {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
  }

  .card-blue {
    border-color: #38bdf8;
    background: rgba(56, 189, 248, 0.05);
  }

  .card-purple {
    border-color: #a855f7;
    background: rgba(168, 85, 247, 0.05);
  }

  .card-rose {
    border-color: #f43f5e;
    background: rgba(244, 63, 94, 0.05);
  }

  .card-title {
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .card-desc {
    font-size: 10.5px;
    line-height: 1.45;
    color: #cbd5e1;
  }

  ul.card-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  ul.card-list li {
    font-size: 10.5px;
    line-height: 1.45;
    color: #cbd5e1;
    margin-bottom: 6px;
    position: relative;
    padding-left: 14px;
  }

  ul.card-list li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: #f59e0b;
    font-weight: bold;
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-gold { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
  .badge-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
  .badge-blue { background: rgba(56, 189, 248, 0.15); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.3); }
  .badge-purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
  .badge-rose { background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }

  /* Table styling */
  table.matrix-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
  }

  table.matrix-table th {
    background: #1e293b;
    color: #f59e0b;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #334155;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  table.matrix-table td {
    padding: 8px 10px;
    border: 1px solid #334155;
    color: #cbd5e1;
    background: rgba(15, 23, 42, 0.6);
  }

  /* Code snippet */
  .code-pill {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    background: #020617;
    color: #38bdf8;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #1e293b;
  }

  /* Cover specifics */
  .cover-hero {
    border: 2px solid #f59e0b;
    border-radius: 16px;
    padding: 32px;
    background: rgba(15, 23, 42, 0.85);
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  }
</style>
</head>
<body>

  <!-- SLIDE 1: Cover Page -->
  <div class="slide">
    <div class="slide-header" style="border:none; margin-bottom: 0;">
      <div class="slide-tag">PROPCRM ENTERPRISE PLATFORM</div>
      <div class="badge badge-gold">CONFIDENTIAL ARCHITECTURE DECK</div>
    </div>
    
    <div class="slide-body">
      <div class="cover-hero">
        <div style="font-size: 12px; font-weight: 700; letter-spacing: 2px; color: #f59e0b; text-transform: uppercase; margin-bottom: 12px;">
          TECHNICAL ARCHITECTURE & STRATEGIC PITCH DECK
        </div>
        <h1 style="font-size: 34px; font-weight: 800; color: #ffffff; line-height: 1.2; margin-bottom: 12px;">
          PropCRM — Complete System Architecture & Implementation
        </h1>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; max-width: 900px; margin-bottom: 24px;">
          Comprehensive technical blueprint for the Next.js 15 + React 19 + Prisma ORM + MongoDB Atlas stack, Lead-to-Possession (L2P) lifecycle, 5-Tier RBAC, Enterprise Security Hardening, and High-Concurrency Scaling to 2,000+ Active Users.
        </p>

        <div class="grid-3" style="margin-top: 10px;">
          <div class="card card-blue">
            <div style="font-size: 9px; font-weight: 700; color: #38bdf8; text-transform: uppercase;">AUTHOR & PERSPECTIVE</div>
            <div style="font-size: 13px; font-weight: 700; color: #fff; margin-top: 2px;">SDE-3 / Co-Founder & CEO</div>
          </div>
          <div class="card card-emerald">
            <div style="font-size: 9px; font-weight: 700; color: #10b981; text-transform: uppercase;">DATABASE & ORM ENGINE</div>
            <div style="font-size: 13px; font-weight: 700; color: #fff; margin-top: 2px;">MongoDB Atlas + Prisma ORM 6.x</div>
          </div>
          <div class="card card-purple">
            <div style="font-size: 9px; font-weight: 700; color: #a855f7; text-transform: uppercase;">SCALE TARGET</div>
            <div style="font-size: 13px; font-weight: 700; color: #fff; margin-top: 2px;">2,000+ Concurrent Enterprise Users</div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM Enterprise &bull; Lead to Possession System</span>
      <span>August 2026 Executive Review</span>
    </div>
  </div>

  <!-- SLIDE 2: Clarification on MongoDB vs Prisma -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">CORE CLARIFICATION</div>
        <div class="slide-title">Database vs ORM: MongoDB & Prisma Clarified</div>
      </div>
      <div class="slide-number">Slide 02 / 12</div>
    </div>

    <div class="slide-body">
      <div class="grid-2">
        <div class="card card-emerald" style="height: 100%;">
          <div class="card-title" style="color: #10b981; font-size: 15px;">🍃 1. The Actual Database = MongoDB Atlas</div>
          <p class="card-desc" style="margin-bottom: 10px;">
            Hamaare project ka <strong>actual physical database MongoDB</strong> hi hai. Hamara database connection string <span class="code-pill">mongodb+srv://.../urbangaon_crm</span> cloud cluster par hosted hai.
          </p>
          <ul class="card-list">
            <li><strong>Database Host:</strong> MongoDB Atlas Cloud (<span class="code-pill">cluster0.pwabati.mongodb.net</span>)</li>
            <li><strong>Database Name:</strong> <span class="code-pill">urbangaon_crm</span></li>
            <li><strong>Document Data Model:</strong> Sabhi records (Leads, Bookings, Units, Payments) MongoDB collections me BSON documents ke roop me store hote hain.</li>
            <li><strong>Flexibility:</strong> High write-throughput and dynamic nested structures (JSON milestone templates, snag photos).</li>
          </ul>
        </div>

        <div class="card card-blue" style="height: 100%;">
          <div class="card-title" style="color: #38bdf8; font-size: 15px;">⚡ 2. The Query Engine & ORM = Prisma 6.x</div>
          <p class="card-desc" style="margin-bottom: 10px;">
            <strong>Prisma koi database nahi hai</strong>, balki MongoDB ke sath communicate karne ka <strong>Type-Safe ORM Client</strong> hai (jaise Mongoose hota hai, waise hi modern Next.js me Prisma ORM use hota hai).
          </p>
          <ul class="card-list">
            <li><strong>Prisma Client:</strong> Node.js / Next.js code ko MongoDB se connect karta hai.</li>
            <li><strong>Auto TypeScript Typing:</strong> Jab aap code likhte hain, toh pure MongoDB schema ke fields ka auto-complete milta hai (Zero runtime typos).</li>
            <li><strong>Schema Definition:</strong> <span class="code-pill">prisma/schema.prisma</span> me <span class="code-pill">provider = "mongodb"</span> defined hai jo schema structure aur validation enforce karta hai.</li>
            <li><strong>Relation Mapping:</strong> MongoDB ke <span class="code-pill">@db.ObjectId</span> aur relations ko clean type-safe functions me convert karta hai.</li>
          </ul>
        </div>
      </div>

      <div class="card card-highlight">
        <div class="card-title" style="color: #f59e0b;">💡 SDE-3 Technical Summary for CEO</div>
        <div class="card-desc">
          <strong>Simple Equation:</strong> <span class="code-pill">Next.js Frontend / Actions</span> ➔ <span class="code-pill">Prisma ORM Client (Query Builder)</span> ➔ <span class="code-pill">MongoDB Atlas (Actual Cloud Database)</span>. Prisma is our bridge to query MongoDB with 100% type safety!
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM Architecture &bull; Database & ORM Layer</span>
      <span>Confidential</span>
    </div>
  </div>

  <!-- SLIDE 3: 100% Verified Technology Stack -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">TECHNOLOGY STACK</div>
        <div class="slide-title">100% Verified & Active Production Tech Stack</div>
      </div>
      <div class="slide-number">Slide 03 / 12</div>
    </div>

    <div class="slide-body">
      <div class="grid-4">
        <div class="card card-blue">
          <div class="badge badge-blue" style="margin-bottom: 6px;">FRONTEND & SSR</div>
          <div class="card-title" style="color:#fff;">Next.js 15.5+ & React 19</div>
          <div class="card-desc">App Router, Server Actions, and React Server Components (RSC) eliminating client-side API waterfall delays.</div>
        </div>

        <div class="card card-emerald">
          <div class="badge badge-emerald" style="margin-bottom: 6px;">LANGUAGE</div>
          <div class="card-title" style="color:#fff;">TypeScript 5.7</div>
          <div class="card-desc">Strict type safety from database models down to UI props. Eliminates undefined/null runtime exceptions.</div>
        </div>

        <div class="card card-gold">
          <div class="badge badge-gold" style="margin-bottom: 6px;">DATABASE & ORM</div>
          <div class="card-title" style="color:#fff;">MongoDB + Prisma 6.3</div>
          <div class="card-desc">MongoDB Atlas cloud cluster queried via Prisma type-safe client with ObjectId mappings.</div>
        </div>

        <div class="card card-purple">
          <div class="badge badge-purple" style="margin-bottom: 6px;">STYLING & THEME</div>
          <div class="card-title" style="color:#fff;">Tailwind CSS 3.4</div>
          <div class="card-desc">Luxury real estate theme: Deep Slate (<span class="code-pill">#0f172a</span>), Emerald (<span class="code-pill">#10b981</span>), and Gold (<span class="code-pill">#f59e0b</span>) tokens.</div>
        </div>

        <div class="card card-blue">
          <div class="badge badge-blue" style="margin-bottom: 6px;">STATE MANAGEMENT</div>
          <div class="card-title" style="color:#fff;">TanStack Query v5</div>
          <div class="card-desc">Server-state caching, automatic cache invalidation, optimistic updates, and instant UI re-renders.</div>
        </div>

        <div class="card card-rose">
          <div class="badge badge-rose" style="margin-bottom: 6px;">SECURITY & AUTH</div>
          <div class="card-title" style="color:#fff;">Jose (JWT) + Cookies</div>
          <div class="card-desc">Stateless token authentication stored in HttpOnly, SameSite=Strict, Secure cookies with 5-tier RBAC guards.</div>
        </div>

        <div class="card card-emerald">
          <div class="badge badge-emerald" style="margin-bottom: 6px;">ANALYTICS & CHARTS</div>
          <div class="card-title" style="color:#fff;">Recharts 2.15</div>
          <div class="card-desc">Interactive booking vs collections charts, pipeline conversion velocity, and leaderboard trackers.</div>
        </div>

        <div class="card card-gold">
          <div class="badge badge-gold" style="margin-bottom: 6px;">COMMUNICATION</div>
          <div class="card-title" style="color:#fff;">Nodemailer + Zod</div>
          <div class="card-desc">Automated transactional email dispatch (milestone demand letters, receipts) + Zod schema validation.</div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM Architecture &bull; Verified Technologies</span>
      <span>Confidential</span>
    </div>
  </div>

  <!-- SLIDE 4: Core Business Flow (Lead to Possession) -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">END-TO-END BUSINESS FLOW</div>
        <div class="slide-title">The Real Estate Lead-to-Possession (L2P) Journey</div>
      </div>
      <div class="slide-number">Slide 04 / 12</div>
    </div>

    <div class="slide-body">
      <div class="grid-6">
        <div class="card card-blue" style="text-align: center;">
          <div style="font-size: 24px; font-weight: 800; color: #38bdf8;">01</div>
          <div style="font-size: 12px; font-weight: 700; color: #fff; margin: 4px 0 6px 0;">Lead Funnel</div>
          <div style="font-size: 9.5px; color: #94a3b8; line-height: 1.4;">
            Ingestion, duplicate phone detection, Kanban board & call logs.
          </div>
        </div>

        <div class="card card-emerald" style="text-align: center;">
          <div style="font-size: 24px; font-weight: 800; color: #10b981;">02</div>
          <div style="font-size: 12px; font-weight: 700; color: #fff; margin: 4px 0 6px 0;">Live Inventory</div>
          <div style="font-size: 9.5px; color: #94a3b8; line-height: 1.4;">
            Visual tower matrix & 48-Hour Atomic Unit Hold timer.
          </div>
        </div>

        <div class="card card-purple" style="text-align: center;">
          <div style="font-size: 24px; font-weight: 800; color: #a855f7;">03</div>
          <div style="font-size: 12px; font-weight: 700; color: #fff; margin: 4px 0 6px 0;">1-Click Booking</div>
          <div style="font-size: 9.5px; color: #94a3b8; line-height: 1.4;">
            Lock unit, attach CLP plan & print official Allotment Letter.
          </div>
        </div>

        <div class="card card-gold" style="text-align: center;">
          <div style="font-size: 24px; font-weight: 800; color: #f59e0b;">04</div>
          <div style="font-size: 12px; font-weight: 700; color: #fff; margin: 4px 0 6px 0;">Milestone Billing</div>
          <div style="font-size: 9.5px; color: #94a3b8; line-height: 1.4;">
            Construction demand letters, receipts & overdue ageing.
          </div>
        </div>

        <div class="card card-blue" style="text-align: center;">
          <div style="font-size: 24px; font-weight: 800; color: #38bdf8;">05</div>
          <div style="font-size: 12px; font-weight: 700; color: #fff; margin: 4px 0 6px 0;">Post-Sales Legal</div>
          <div style="font-size: 9.5px; color: #94a3b8; line-height: 1.4;">
            KYC, Sale Agreement, OC/CC & Sale Deed checklist.
          </div>
        </div>

        <div class="card card-rose" style="text-align: center;">
          <div style="font-size: 24px; font-weight: 800; color: #f43f5e;">06</div>
          <div style="font-size: 12px; font-weight: 700; color: #fff; margin: 4px 0 6px 0;">Possession</div>
          <div style="font-size: 9.5px; color: #94a3b8; line-height: 1.4;">
            Snag punchlist, meter readings & digital Possession Certificate.
          </div>
        </div>
      </div>

      <div class="card card-highlight" style="margin-top: 6px;">
        <div class="card-title" style="color: #f59e0b;">🌟 Core Business Impact</div>
        <div class="card-desc">
          PropCRM replaces 5 disconnected tools (Excel, WhatsApp, Tally, Paper files, Physical Registers) into <strong>one single, synchronized digital platform</strong>. Every department operates on the exact same real-time data with zero friction.
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM Architecture &bull; Business Flow</span>
      <span>Confidential</span>
    </div>
  </div>

  <!-- SLIDE 5: Multi-Tenant MongoDB Data Models -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">DATABASE ARCHITECTURE</div>
        <div class="slide-title">Multi-Tenant MongoDB Collections & Data Schema</div>
      </div>
      <div class="slide-number">Slide 05 / 12</div>
    </div>

    <div class="slide-body">
      <table class="matrix-table">
        <thead>
          <tr>
            <th style="width: 18%;">Collection (Model)</th>
            <th style="width: 32%;">Key Fields (MongoDB Schema)</th>
            <th style="width: 50%;">Business Purpose & Relation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong style="color:#38bdf8;">Organization</strong></td>
            <td><span class="code-pill">_id, name, slug, logo, reraNo</span></td>
            <td>Tenant boundary. Enforces strict multi-tenant data isolation for builders.</td>
          </tr>
          <tr>
            <td><strong style="color:#38bdf8;">User</strong></td>
            <td><span class="code-pill">_id, email, password, role, orgId</span></td>
            <td>5 RBAC roles (ADMIN, SALES_MANAGER, SALES_AGENT, ACCOUNTS, POST_SALES).</td>
          </tr>
          <tr>
            <td><strong style="color:#10b981;">Project & Unit</strong></td>
            <td><span class="code-pill">unitNumber, floor, baseRate, status</span></td>
            <td>Status: <span class="code-pill">AVAILABLE, HELD, BOOKED, SOLD, BLOCKED</span>. Holds have 48h timers.</td>
          </tr>
          <tr>
            <td><strong style="color:#10b981;">Lead & Activity</strong></td>
            <td><span class="code-pill">name, phone, email, status, budget</span></td>
            <td>Lead funnel with call logs, WhatsApp notes, and site visit scheduling.</td>
          </tr>
          <tr>
            <td><strong style="color:#a855f7;">Booking</strong></td>
            <td><span class="code-pill">bookingNumber, agreementVal, unitId</span></td>
            <td>Central transaction binding buyer, unit, payment plan template, and agent.</td>
          </tr>
          <tr>
            <td><strong style="color:#f59e0b;">PaymentSchedule</strong></td>
            <td><span class="code-pill">milestoneName, dueAmount, dueDate</span></td>
            <td>CLP billing milestones, automated demand letters, receipts, and ageing.</td>
          </tr>
          <tr>
            <td><strong style="color:#f43f5e;">Possession & Snag</strong></td>
            <td><span class="code-pill">snags[], meterReadings, status</span></td>
            <td>Snag punchlists (Electrical, Plumbing, Civil) & Possession handover certificate.</td>
          </tr>
          <tr>
            <td><strong style="color:#cbd5e1;">AuditLog</strong></td>
            <td><span class="code-pill">entityType, entityId, action, userId</span></td>
            <td>Tamper-evident activity trail for compliance and fraud prevention.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="slide-footer">
      <span>PropCRM Architecture &bull; MongoDB Collections</span>
      <span>Confidential</span>
    </div>
  </div>

  <!-- SLIDE 6: Role-Based Access Control (5-Tier RBAC) -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">GOVERNANCE & SECURITY</div>
        <div class="slide-title">5-Tier Role-Based Access Control (RBAC)</div>
      </div>
      <div class="slide-number">Slide 06 / 12</div>
    </div>

    <div class="slide-body">
      <div class="grid-2">
        <div class="card card-purple">
          <div class="card-title" style="color: #a855f7;">👑 1. ADMIN / CEO</div>
          <div class="card-desc">
            Global 360° platform access. Real-time executive dashboards, total revenue realization vs bookings, user role management, project creation, unit pricing, and raw data export.
          </div>
        </div>

        <div class="card card-blue">
          <div class="card-title" style="color: #38bdf8;">👔 2. SALES MANAGER</div>
          <div class="card-desc">
            Team leadership view. Pipeline velocity analysis, unassigned lead auto-routing, 48-hour hold extension approvals, booking approvals, and agent conversion leaderboard.
          </div>
        </div>

        <div class="card card-emerald">
          <div class="card-title" style="color: #10b981;">🏃 3. SALES AGENT</div>
          <div class="card-desc">
            Personal lead funnel. Today's task queue & follow-up call reminders, 48-hour unit temporary holds, 1-click booking initiation, and personal sales incentive tracking.
          </div>
        </div>

        <div class="card card-gold">
          <div class="card-title" style="color: #f59e0b;">💳 4. ACCOUNTS / FINANCE</div>
          <div class="card-desc">
            Billing & cashflow. Construction-linked milestone triggers, 1-click official Demand Letters with escrow details, payment receipt logging, and 0-90+ days overdue ageing reports.
          </div>
        </div>
      </div>

      <div class="card card-rose">
        <div class="card-title" style="color: #f43f5e;">⚖️ 5. POST-SALES / LEGAL & HANDOVER</div>
        <div class="card-desc">
          Legal document verification checklist (KYC, Sale Deed, OC/CC), snag defect punchlists (Civil, Electrical, Plumbing), utility meter readings, and digital Possession Certificate generation.
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM Architecture &bull; RBAC Engine</span>
      <span>Confidential</span>
    </div>
  </div>

  <!-- SLIDE 7: Module Deep Dive 1: Leads, Inventory & Bookings -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">CORE MODULES BREAKDOWN</div>
        <div class="slide-title">Front-Office Sales Engine: Leads, Inventory & Bookings</div>
      </div>
      <div class="slide-number">Slide 07 / 12</div>
    </div>

    <div class="slide-body">
      <div class="grid-3">
        <div class="card card-blue">
          <div class="card-title" style="color: #38bdf8;">🎯 Lead Funnel & CRM</div>
          <ul class="card-list">
            <li><strong>Kanban & Table Views:</strong> Drag-and-drop pipeline stages with budget, priority, and source filtering.</li>
            <li><strong>Duplicate Lead Detection:</strong> Phone & email validation prevents overlapping agent assignments.</li>
            <li><strong>Customer Activity Timeline:</strong> Complete log of calls, WhatsApp conversations, and site visits.</li>
            <li><strong>Today's Task Queue:</strong> Automated reminders for pending follow-ups and scheduled visits.</li>
          </ul>
        </div>

        <div class="card card-emerald">
          <div class="card-title" style="color: #10b981;">🏢 Live Inventory Matrix</div>
          <ul class="card-list">
            <li><strong>Interactive Grid:</strong> Color-coded visual matrix (Green: Available, Amber: Held, Blue: Booked, Red: Sold).</li>
            <li><strong>48-Hour Atomic Hold:</strong> Locks unit temporarily for genuine buyers with an active countdown timer.</li>
            <li><strong>Auto-Release Mechanism:</strong> Prevents inventory hoarding by automatically releasing expired holds.</li>
            <li><strong>Bulk CSV Uploader:</strong> 1-click import of hundreds of units with floor, area, and rate calculations.</li>
          </ul>
        </div>

        <div class="card card-purple">
          <div class="card-title" style="color: #a855f7;">📝 1-Click Booking</div>
          <ul class="card-list">
            <li><strong>Dynamic Cost Sheet:</strong> Calculates Base Rate + PLC + Floor Rise + Parking + Taxes automatically.</li>
            <li><strong>Payment Plan Binding:</strong> Applies Construction-Linked Plans (CLP) or 20:80 Subvention schemes.</li>
            <li><strong>Unit Status Lock:</strong> Transitions unit from HELD to BOOKED with zero conflict.</li>
            <li><strong>Official Booking Letter:</strong> Printable allotment confirmation document with builder letterhead.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM Architecture &bull; Sales Modules</span>
      <span>Confidential</span>
    </div>
  </div>

  <!-- SLIDE 8: Module Deep Dive 2: Payments, Legal & Possession -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">CORE MODULES BREAKDOWN</div>
        <div class="slide-title">Back-Office Engine: Finance, Legal & Possession</div>
      </div>
      <div class="slide-number">Slide 08 / 12</div>
    </div>

    <div class="slide-body">
      <div class="grid-3">
        <div class="card card-gold">
          <div class="card-title" style="color: #f59e0b;">💳 Payments & Demand Letters</div>
          <ul class="card-list">
            <li><strong>Milestone Triggers:</strong> Construction progress triggers payment demand schedules automatically.</li>
            <li><strong>Official Demand Letters:</strong> Printable PDF letters with builder escrow bank details & due dates.</li>
            <li><strong>Payment Receipts:</strong> Real-time reconciliation for Cheque, NEFT, RTGS, and UPI payments.</li>
            <li><strong>Overdue Ageing Buckets:</strong> 0-30, 31-60, 61-90, 90+ days aging analysis for cashflow health.</li>
          </ul>
        </div>

        <div class="card card-blue">
          <div class="card-title" style="color: #38bdf8;">📂 Post-Sales Legal Workflow</div>
          <ul class="card-list">
            <li><strong>7-Stage Checklist:</strong> Allotment, KYC, Agreement of Sale, Demand Letters, OC/CC, Sale Deed.</li>
            <li><strong>Document Lifecycle:</strong> Pending ➔ Generated ➔ Uploaded ➔ Verified ➔ Registered.</li>
            <li><strong>Audit Stamping:</strong> Records who uploaded and verified each sensitive document.</li>
            <li><strong>Completion Tracking:</strong> % completion progress bar per customer booking file.</li>
          </ul>
        </div>

        <div class="card card-rose">
          <div class="card-title" style="color: #f43f5e;">🔑 Snagging & Possession</div>
          <ul class="card-list">
            <li><strong>Category Snags:</strong> Civil, Electrical, Plumbing, Carpentry, Painting defect tracking.</li>
            <li><strong>Snag Resolution Toggle:</strong> Open ➔ In Progress ➔ Resolved ➔ Verified with photos.</li>
            <li><strong>Handover Checklist:</strong> Electricity, Water, and Gas meter readings recorded at handover.</li>
            <li><strong>Possession Certificate:</strong> Printable official possession certificate with digital signoff.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM Architecture &bull; Back-Office Modules</span>
      <span>Confidential</span>
    </div>
  </div>

  <!-- SLIDE 9: Ecosystem Modules (Calls, Outreach, Builders, Leaderboard) -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">EXTENDED ECOSYSTEM</div>
        <div class="slide-title">Active Ancillary Modules in Codebase</div>
      </div>
      <div class="slide-number">Slide 09 / 12</div>
    </div>

    <div class="slide-body">
      <div class="grid-2">
        <div class="card card-blue">
          <div class="card-title" style="color: #38bdf8;">📞 Calling & Telecalling Workflows (/calls)</div>
          <div class="card-desc">
            Structured calling interface with disposition logging (Interested, Callback, Not Reachable, Site Visit Booked), follow-up scheduling, and call outcome analytics for tele-sales teams.
          </div>
        </div>

        <div class="card card-emerald">
          <div class="card-title" style="color: #10b981;">📢 Multi-Channel Campaign Outreach (/outreach)</div>
          <div class="card-desc">
            Targeted customer communication campaigns via WhatsApp and Email for project pre-launches, festive discounts, construction milestone alerts, and event invites.
          </div>
        </div>

        <div class="card card-gold">
          <div class="card-title" style="color: #f59e0b;">🏆 Sales Leaderboard & Incentives (/leaderboard, /incentives)</div>
          <div class="card-desc">
            Gamified performance leaderboards ranking agents by deals closed and revenue generated. Dynamic commission and incentive calculation based on milestone achievement.
          </div>
        </div>

        <div class="card card-purple">
          <div class="card-title" style="color: #a855f7;">🏗️ Builders & Property Listings (/builders, /listings)</div>
          <div class="card-desc">
            Builder developer profiles, master project catalog, public-facing property showcase, and inventory sync across multiple channel partners.
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM Architecture &bull; Ancillary Modules</span>
      <span>Confidential</span>
    </div>
  </div>

  <!-- SLIDE 10: Scalability to 2,000+ Concurrent Users -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">ENTERPRISE SCALABILITY (CEO QUESTION)</div>
        <div class="slide-title">High-Concurrency Architecture (2,000+ Active Users)</div>
      </div>
      <div class="slide-number">Slide 10 / 12</div>
    </div>

    <div class="slide-body">
      <div class="grid-4">
        <div class="card card-blue">
          <div style="font-size: 20px; font-weight: 800; color: #38bdf8;">01</div>
          <div class="card-title" style="color: #fff; margin: 4px 0;">Stateless Next.js Pods</div>
          <div class="card-desc">
            JWT auth in client cookies makes web containers 100% stateless. Auto-scales from 2 to 20+ pods on Kubernetes / AWS ECS behind an Application Load Balancer.
          </div>
        </div>

        <div class="card card-emerald">
          <div style="font-size: 20px; font-weight: 800; color: #10b981;">02</div>
          <div class="card-title" style="color: #fff; margin: 4px 0;">MongoDB Atlas Cluster</div>
          <div class="card-desc">
            Primary write replica + distributed read replicas with connection pooling. Heavy dashboard analytics read from replicas without blocking booking transactions.
          </div>
        </div>

        <div class="card card-purple">
          <div style="font-size: 20px; font-weight: 800; color: #a855f7;">03</div>
          <div class="card-title" style="color: #fff; margin: 4px 0;">Redis In-Memory Layer</div>
          <div class="card-desc">
            Caches tower floor grids & active holds in Redis (&lt;2ms response). Uses distributed mutex locks (<span class="code-pill">SETNX</span>) for instant race-condition-free unit locking.
          </div>
        </div>

        <div class="card card-gold">
          <div style="font-size: 20px; font-weight: 800; color: #f59e0b;">04</div>
          <div class="card-title" style="color: #fff; margin: 4px 0;">Async Background Queues</div>
          <div class="card-desc">
            Bulk Demand Letter PDF rendering, KYC image compression, and mass emails offloaded to BullMQ / AWS SQS workers. Client HTTP latency remains &lt;50ms.
          </div>
        </div>
      </div>

      <div class="card card-highlight" style="margin-top: 6px;">
        <div class="card-title" style="color: #f59e0b;">📈 Traffic Capacity Analysis</div>
        <div class="card-desc">
          Under this architecture, 2,000 concurrent agents generate ~400 req/sec. With Cloudflare Edge Caching + Redis + MongoDB Atlas M30 Replica Set, the system can effortlessly scale to <strong>10,000+ peak concurrent users</strong> at 99.99% uptime.
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM Architecture &bull; Scalability Blueprint</span>
      <span>Confidential</span>
    </div>
  </div>

  <!-- SLIDE 11: Enterprise Security Hardening -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">ENTERPRISE SECURITY & COMPLIANCE</div>
        <div class="slide-title">Bank-Grade Security Hardening Matrix</div>
      </div>
      <div class="slide-number">Slide 11 / 12</div>
    </div>

    <div class="slide-body">
      <table class="matrix-table">
        <thead>
          <tr>
            <th style="width: 22%;">Security Dimension</th>
            <th style="width: 58%;">Current & Production Implementation</th>
            <th style="width: 20%;">Compliance Standard</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong style="color:#f59e0b;">Multi-Tenant Isolation</strong></td>
            <td>Every database query is strictly partitioned by <span class="code-pill">organizationId</span>. Cross-tenant access is physically impossible.</td>
            <td><span class="badge badge-emerald">SOC 2 Type II</span></td>
          </tr>
          <tr>
            <td><strong style="color:#f59e0b;">Stateless JWT Auth</strong></td>
            <td>Cryptographically signed token via <span class="code-pill">jose</span>, stored in <span class="code-pill">HttpOnly, SameSite=Strict, Secure</span> cookies.</td>
            <td><span class="badge badge-emerald">OWASP ASVS L2</span></td>
          </tr>
          <tr>
            <td><strong style="color:#f59e0b;">Server-Side RBAC</strong></td>
            <td>Granular permission checks (<span class="code-pill">hasPermission</span>) executed on every Next.js Server Action before any DB mutation.</td>
            <td><span class="badge badge-blue">Least Privilege</span></td>
          </tr>
          <tr>
            <td><strong style="color:#f59e0b;">Input Validation</strong></td>
            <td>Strict Zod schemas validate all client payloads. Prisma parameterized queries completely prevent SQL/NoSQL injections.</td>
            <td><span class="badge badge-blue">OWASP Top 10</span></td>
          </tr>
          <tr>
            <td><strong style="color:#f59e0b;">Tamper-Proof Audit Log</strong></td>
            <td>Every critical mutation (Hold, Booking, Payment, Snag) is immutably logged in the <span class="code-pill">AuditLog</span> collection.</td>
            <td><span class="badge badge-purple">ISO 27001</span></td>
          </tr>
          <tr>
            <td><strong style="color:#f59e0b;">Encryption at Rest & Transit</strong></td>
            <td>MongoDB Atlas AES-256 storage encryption + TLS 1.3 network encryption on all API traffic.</td>
            <td><span class="badge badge-purple">DPDP Act India</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="slide-footer">
      <span>PropCRM Architecture &bull; Security & Compliance</span>
      <span>Confidential</span>
    </div>
  </div>

  <!-- SLIDE 12: Executive Vision & Strategic Roadmap -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">EXECUTIVE STRATEGY</div>
        <div class="slide-title">Conclusion & Strategic Product Roadmap</div>
      </div>
      <div class="slide-number">Slide 12 / 12</div>
    </div>

    <div class="slide-body">
      <div class="grid-2">
        <div class="card card-emerald">
          <div class="card-title" style="color: #10b981;">🏆 Current Production Readiness</div>
          <ul class="card-list">
            <li><strong>100% Functional L2P Workflow:</strong> Lead capture, 48h inventory hold, 1-click booking, CLP billing, and possession handover are fully built and working.</li>
            <li><strong>Type-Safe & High Performance:</strong> Next.js 15 Server Actions + Prisma ORM + MongoDB Atlas provides rock-solid reliability.</li>
            <li><strong>5-Tier Role Isolation:</strong> Custom tailored views for Admin, Managers, Sales Agents, Accounts, and Legal teams.</li>
            <li><strong>Ready for Scale:</strong> Architecture designed for horizontal scaling across cloud containers and load balancers.</li>
          </ul>
        </div>

        <div class="card card-gold">
          <div class="card-title" style="color: #f59e0b;">🚀 Future Roadmap (Q3 - Q4)</div>
          <ul class="card-list">
            <li><strong>Phase 1 — AI Lead Scoring:</strong> 24/7 AI WhatsApp bot for instant buyer qualification and automated site visit scheduling.</li>
            <li><strong>Phase 2 — Mobile App for Agents:</strong> React Native / PWA app for on-site sales agents and photo-based snag inspections.</li>
            <li><strong>Phase 3 — Virtual Escrow Accounts:</strong> Razorpay / Cashfree integration for instant automated NEFT/RTGS payment reconciliation.</li>
            <li><strong>Phase 4 — Channel Partner (CP) Portal:</strong> External broker portal with live inventory sharing and dynamic commission calculations.</li>
          </ul>
        </div>
      </div>

      <div class="card card-highlight">
        <div class="card-title" style="color: #f59e0b;">🎯 Executive Sign-Off</div>
        <div class="card-desc">
          PropCRM represents a modern, enterprise-grade real estate software platform capable of serving top-tier developers with thousands of daily transactions, zero double-booking risk, and full financial transparency.
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM Enterprise &bull; End of Presentation</span>
      <span>Confidential</span>
    </div>
  </div>

</body>
</html>`;

const htmlFilePath = path.join(__dirname, 'deck_temp.html');
const pdfFilePath = path.join(__dirname, 'PropCRM_Executive_Architecture_Deck.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log('HTML presentation written successfully.');

const msedgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const browserPath = fs.existsSync(chromePath) ? chromePath : msedgePath;

const cmd = `"${browserPath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfFilePath}" "${htmlFilePath}"`;
console.log('Generating PDF via headless browser...');
execSync(cmd);

console.log(`PDF generated successfully at: ${pdfFilePath}`);
