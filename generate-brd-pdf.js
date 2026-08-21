const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>UrbanGaon CRM — Business Requirement & System Implementation Document (BRD)</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

  @page {
    size: A4 portrait;
    margin: 18mm 20mm 18mm 20mm;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #ffffff;
    color: #1e293b;
    line-height: 1.6;
    font-size: 11.5pt;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Page container */
  .page {
    page-break-after: always;
    position: relative;
    min-height: 250mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .page-last {
    page-break-after: auto;
  }

  /* Header & Footer */
  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 10px;
    margin-bottom: 24px;
  }

  .doc-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    font-size: 16pt;
    color: #0f172a;
    letter-spacing: -0.5px;
  }

  .doc-logo-badge {
    background: #2563eb;
    color: #ffffff;
    font-size: 10pt;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .doc-header-meta {
    font-size: 9pt;
    color: #64748b;
    text-align: right;
  }

  .doc-footer {
    border-top: 1px solid #e2e8f0;
    padding-top: 10px;
    margin-top: 24px;
    display: flex;
    justify-content: space-between;
    font-size: 8.5pt;
    color: #94a3b8;
  }

  /* Typography */
  h1.doc-title {
    font-size: 26pt;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
    margin-bottom: 12px;
  }

  h2.section-heading {
    font-size: 16pt;
    font-weight: 800;
    color: #0f172a;
    border-bottom: 1.5px solid #cbd5e1;
    padding-bottom: 6px;
    margin-top: 20px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  h3.subsection-heading {
    font-size: 12.5pt;
    font-weight: 700;
    color: #1e293b;
    margin-top: 14px;
    margin-bottom: 6px;
  }

  p {
    margin-bottom: 10px;
    color: #334155;
    text-align: justify;
  }

  /* Lists */
  ul.bullet-list {
    list-style: none;
    padding-left: 0;
    margin-bottom: 12px;
  }

  ul.bullet-list li {
    position: relative;
    padding-left: 18px;
    margin-bottom: 6px;
    color: #334155;
  }

  ul.bullet-list li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: #2563eb;
    font-weight: bold;
    font-size: 14pt;
    line-height: 1;
  }

  /* Tables */
  table.custom-table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px 0;
    font-size: 10pt;
  }

  table.custom-table th {
    background-color: #f8fafc;
    color: #0f172a;
    font-weight: 700;
    text-align: left;
    padding: 9px 12px;
    border: 1px solid #cbd5e1;
  }

  table.custom-table td {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    color: #334155;
    background-color: #ffffff;
  }

  table.custom-table tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  /* Cards */
  .info-box {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #2563eb;
    border-radius: 6px;
    padding: 12px 16px;
    margin: 12px 0;
  }

  .info-box-gold {
    border-left-color: #d97706;
    background-color: #fffbeb;
  }

  .info-box-emerald {
    border-left-color: #059669;
    background-color: #ecfdf5;
  }

  /* Table of Contents */
  .toc-container {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 18px 22px;
    margin: 20px 0;
  }

  .toc-title {
    font-weight: 800;
    font-size: 13pt;
    color: #0f172a;
    margin-bottom: 12px;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 6px;
  }

  .toc-item {
    display: flex;
    justify-content: space-between;
    font-size: 10.5pt;
    margin-bottom: 6px;
    color: #334155;
  }

  .toc-item a {
    text-decoration: none;
    color: #1e293b;
    font-weight: 600;
  }

  .toc-dots {
    flex: 1;
    border-bottom: 1px dotted #94a3b8;
    margin: 0 8px 4px 8px;
  }

  .toc-page {
    font-weight: 700;
    color: #2563eb;
  }

  .badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
  }

  .badge-blue { background: #dbeafe; color: #1d4ed8; }
  .badge-emerald { background: #d1fae5; color: #047857; }
  .badge-gold { background: #fef3c7; color: #b45309; }
  .badge-purple { background: #ede9fe; color: #6d28d9; }
</style>
</head>
<body>

  <!-- ==================== PAGE 1: COVER & TABLE OF CONTENTS ==================== -->
  <div class="page">
    <div>
      <div class="doc-header">
        <div class="doc-logo">
          UrbanGaon <span class="doc-logo-badge">CRM PLATFORM</span>
        </div>
        <div class="doc-header-meta">
          <strong>Document Ref:</strong> UG-BRD-2026<br/>
          <strong>Date:</strong> August 2026
        </div>
      </div>

      <div style="margin-top: 20px; margin-bottom: 24px;">
        <span class="badge badge-gold" style="font-size: 9pt; padding: 4px 10px; margin-bottom: 10px;">BUSINESS REQUIREMENT DOCUMENT (BRD)</span>
        <h1 class="doc-title" style="margin-top: 8px;">
          UrbanGaon Real Estate CRM — System Architecture & Workflow Specification
        </h1>
        <p style="font-size: 12.5pt; color: #475569; line-height: 1.6;">
          An end-to-end operational blueprint detailing platform architecture, user workflows, database design, 5-tier role access, high-volume scalability, and security governance for managing real estate sales from initial inquiry to final key handover.
        </p>

        <table style="width: 100%; margin-top: 14px; font-size: 10pt; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 8px 0;">
          <tr>
            <td style="color: #64748b; width: 25%;"><strong>Project Scope:</strong> Real Estate Enterprise CRM</td>
            <td style="color: #64748b; width: 25%;"><strong>Target Scale:</strong> 100+ Staff | 1k–100k+ Records</td>
            <td style="color: #64748b; width: 25%;"><strong>Primary Database:</strong> MongoDB Atlas</td>
            <td style="color: #64748b; width: 25%;"><strong>Document Status:</strong> Complete & Verified</td>
          </tr>
        </table>
      </div>

      <!-- Table of Contents -->
      <div class="toc-container">
        <div class="toc-title">Table of Contents</div>

        <div class="toc-item">
          <span><strong>1. Executive Summary</strong></span>
          <span class="toc-dots"></span>
          <span class="toc-page">Page 2</span>
        </div>
        <div class="toc-item">
          <span><strong>2. Core Business Objectives</strong></span>
          <span class="toc-dots"></span>
          <span class="toc-page">Page 2</span>
        </div>
        <div class="toc-item">
          <span><strong>3. Application Modules Overview (All 12 Web Screens)</strong></span>
          <span class="toc-dots"></span>
          <span class="toc-page">Page 3</span>
        </div>
        <div class="toc-item" style="padding-left: 14px;">
          <span>3.1 Daily Operations (Dashboard, Today, Calls)</span>
          <span class="toc-dots"></span>
          <span class="toc-page">Page 3</span>
        </div>
        <div class="toc-item" style="padding-left: 14px;">
          <span>3.2 Inventory & Sales (Projects, Listings, Leads, Deals)</span>
          <span class="toc-dots"></span>
          <span class="toc-page">Page 3</span>
        </div>
        <div class="toc-item" style="padding-left: 14px;">
          <span>3.3 Revenue & Growth (Collections, Leaderboard, Incentives, Reports, Outreach)</span>
          <span class="toc-dots"></span>
          <span class="toc-page">Page 3</span>
        </div>
        <div class="toc-item">
          <span><strong>4. Complete Lead-to-Possession (L2P) Workflow</strong></span>
          <span class="toc-dots"></span>
          <span class="toc-page">Page 4</span>
        </div>
        <div class="toc-item">
          <span><strong>5. User Roles & Permission Matrix (5-Tier RBAC)</strong></span>
          <span class="toc-dots"></span>
          <span class="toc-page">Page 5</span>
        </div>
        <div class="toc-item">
          <span><strong>6. Database Architecture & Scalability (100 Users & 1k–100k+ Records)</strong></span>
          <span class="toc-dots"></span>
          <span class="toc-page">Page 6</span>
        </div>
        <div class="toc-item">
          <span><strong>7. Data Security, Compliance & Next Steps</strong></span>
          <span class="toc-dots"></span>
          <span class="toc-page">Page 7</span>
        </div>
      </div>
    </div>

    <div class="doc-footer">
      <span>UrbanGaon CRM &bull; Business Requirement Document</span>
      <span>Page 1 of 7</span>
    </div>
  </div>


  <!-- ==================== PAGE 2: EXECUTIVE SUMMARY & OBJECTIVES ==================== -->
  <div class="page">
    <div>
      <div class="doc-header">
        <div class="doc-logo">UrbanGaon CRM</div>
        <div class="doc-header-meta">Section 1 & 2 &bull; Executive Summary & Objectives</div>
      </div>

      <h2 class="section-heading">1. Executive Summary</h2>
      <p>
        UrbanGaon requires a unified, modern digital platform to streamline and automate its entire real estate sales and customer management lifecycle. In traditional setups, operations suffer from fragmented tools—leads are scattered across WhatsApp and Excel sheets, inventory is tracked manually leading to accidental double-bookings, construction milestone billing on Tally is delayed, and post-sales paperwork causes move-in bottlenecks.
      </p>
      <p>
        The <strong>UrbanGaon CRM platform</strong> resolves these challenges by providing a single, intuitive web-based interface that coordinates all teams: Sales Agents, Telecallers, Sales Managers, Accounts/Finance, and Legal/Post-Sales staff.
      </p>

      <div class="info-box info-box-emerald">
        <strong>Key Platform Capabilities:</strong>
        <p style="margin-top: 4px; margin-bottom: 0;">
          Centralized customer inquiries, 48-Hour Atomic Unit Holds on visual floor maps, 1-click booking cost sheets, automated construction-linked milestone demand letters, telecalling dialer workflows, sales incentive calculators, and digital snag inspection certificates.
        </p>
      </div>

      <h2 class="section-heading" style="margin-top: 24px;">2. Core Business Objectives</h2>
      <p>The primary business and operational goals achieved by this system include:</p>

      <ul class="bullet-list">
        <li><strong>Zero Double-Bookings:</strong> Provide a real-time, color-coded floor grid where agents can hold units for 48 hours with an automatic expiry countdown.</li>
        <li><strong>Standardized Lead Follow-Up:</strong> Eliminate lead leakage through automatic duplicate detection (phone/email matching) and daily reminder queues in the <em>Today</em> screen.</li>
        <li><strong>Automated Deal & Letter Generation:</strong> Calculate total apartment pricing (Base Rate + PLC + Floor Rise + Parking + Taxes) and generate official printable Allotment Letters instantly.</li>
        <li><strong>Accelerated Cashflow & Collections:</strong> Automatically generate official Demand Letters with builder bank escrow details linked to construction milestones, accompanied by payment receipts.</li>
        <li><strong>Streamlined Post-Sales & Handovers:</strong> Manage a 7-stage legal verification checklist (KYC, Sale Deed, OC/CC) and conduct category-wise snag inspections before issuing digital Possession Certificates.</li>
        <li><strong>Gamified Performance & Transparency:</strong> Real-time sales leaderboards, dynamic incentive sheet calculators, and executive revenue realization analytics.</li>
      </ul>
    </div>

    <div class="doc-footer">
      <span>UrbanGaon CRM &bull; Business Requirement Document</span>
      <span>Page 2 of 7</span>
    </div>
  </div>


  <!-- ==================== PAGE 3: APPLICATION MODULES OVERVIEW ==================== -->
  <div class="page">
    <div>
      <div class="doc-header">
        <div class="doc-logo">UrbanGaon CRM</div>
        <div class="doc-header-meta">Section 3 &bull; Application Modules Overview</div>
      </div>

      <h2 class="section-heading">3. Application Modules Overview</h2>
      <p>
        The UrbanGaon CRM application consists of 12 fully integrated, active functional screens accessible through the navigation sidebar:
      </p>

      <table class="custom-table">
        <thead>
          <tr>
            <th style="width: 24%;">Module Name & Route</th>
            <th style="width: 38%;">Core Operational Function</th>
            <th style="width: 38%;">Business Value for UrbanGaon</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Dashboard</strong><br/><span style="font-size:8.5pt; color:#64748b;">/dashboard</span></td>
            <td>Role-based executive KPI cards, monthly revenue charts, collection realization curves, and pipeline funnel velocity.</td>
            <td>Gives leadership real-time visibility into overall company cashflow and deal status.</td>
          </tr>
          <tr>
            <td><strong>Today</strong><br/><span style="font-size:8.5pt; color:#64748b;">/today</span></td>
            <td>Personalized daily action queue displaying overdue follow-ups, scheduled site visits, and pending callbacks.</td>
            <td>Ensures agents never forget an active prospective customer.</td>
          </tr>
          <tr>
            <td><strong>Projects</strong><br/><span style="font-size:8.5pt; color:#64748b;">/projects</span></td>
            <td>Master project catalog with RERA registration numbers, total towers, unit counts, and construction progress status.</td>
            <td>Maintains clean master project data across all company developments.</td>
          </tr>
          <tr>
            <td><strong>Listings</strong><br/><span style="font-size:8.5pt; color:#64748b;">/listings & /inventory</span></td>
            <td>Visual color-coded floor grid (Available, Held, Booked, Sold) for 1,000+ units with 48h hold timers & CSV uploader.</td>
            <td>Prevents double-booking conflicts and provides live unit availability to sales reps.</td>
          </tr>
          <tr>
            <td><strong>Leads</strong><br/><span style="font-size:8.5pt; color:#64748b;">/leads</span></td>
            <td>Kanban pipeline and high-density table views with automatic phone/email duplicate detection and activity logs.</td>
            <td>Organizes all buyer inquiries from marketing ads with complete conversation history.</td>
          </tr>
          <tr>
            <td><strong>Calls</strong><br/><span style="font-size:8.5pt; color:#64748b;">/calls</span></td>
            <td>Telecalling interface with disposition logging (Interested, Callback, Site Visit Booked, Not Reachable).</td>
            <td>Standardizes telesales workflows and tracks call outcomes.</td>
          </tr>
          <tr>
            <td><strong>Deals (Bookings)</strong><br/><span style="font-size:8.5pt; color:#64748b;">/bookings</span></td>
            <td>1-Click booking wizard calculating base rate, PLC, parking, attaching CLP payment plans, and generating Allotment Letters.</td>
            <td>Turns verbal agreements into verified legal bookings in seconds.</td>
          </tr>
          <tr>
            <td><strong>Collections</strong><br/><span style="font-size:8.5pt; color:#64748b;">/payments</span></td>
            <td>Milestone billing tracker, official Demand Letters with bank escrow details, payment receipts, and 0–90+ days overdue ageing.</td>
            <td>Eliminates revenue leakages and speeds up customer payment collection.</td>
          </tr>
          <tr>
            <td><strong>Leaderboard</strong><br/><span style="font-size:8.5pt; color:#64748b;">/leaderboard</span></td>
            <td>Gamified team ranking board displaying total bookings closed, revenue realized, and individual sales rankings.</td>
            <td>Drives healthy sales competition and motivates agents.</td>
          </tr>
          <tr>
            <td><strong>Incentive Sheets</strong><br/><span style="font-size:8.5pt; color:#64748b;">/incentives</span></td>
            <td>Automated commission calculation sheets based on closed deals, slab targets, and payout status.</td>
            <td>Provides transparency in sales commissions and simplifies accounting payouts.</td>
          </tr>
          <tr>
            <td><strong>Reports</strong><br/><span style="font-size:8.5pt; color:#64748b;">/reports</span></td>
            <td>Source-wise ROI analysis, sales conversion ratios, collection realization graphs, and one-click CSV export.</td>
            <td>Enables data-driven marketing budget allocation.</td>
          </tr>
          <tr>
            <td><strong>Outreach</strong><br/><span style="font-size:8.5pt; color:#64748b;">/outreach</span></td>
            <td>Multi-channel broadcast campaign tool for WhatsApp and Email notifications (launches, payment reminders).</td>
            <td>Enables instant communication with thousands of leads and existing buyers.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="doc-footer">
      <span>UrbanGaon CRM &bull; Business Requirement Document</span>
      <span>Page 3 of 7</span>
    </div>
  </div>


  <!-- ==================== PAGE 4: BUSINESS WORKFLOW (LEAD TO POSSESSION) ==================== -->
  <div class="page">
    <div>
      <div class="doc-header">
        <div class="doc-logo">UrbanGaon CRM</div>
        <div class="doc-header-meta">Section 4 &bull; End-to-End Business Flow</div>
      </div>

      <h2 class="section-heading">4. End-to-End Business Workflow (Lead to Possession)</h2>
      <p>
        The platform standardizes the real estate sales process into 6 sequential stages, ensuring no step is missed between initial marketing and property handover:
      </p>

      <div class="info-box">
        <h3 class="subsection-heading" style="margin-top:0; color:#2563eb;">Stage 1: Lead Capture & Duplicate Protection</h3>
        <p style="margin-bottom:0;">
          Buyer inquiries enter the system via digital marketing, website forms, or manual walk-in entry. The system automatically cross-references phone numbers and email addresses against existing records. If an inquiry already exists, it prevents duplicate lead creation and alerts the assigned agent.
        </p>
      </div>

      <div class="info-box">
        <h3 class="subsection-heading" style="margin-top:0; color:#2563eb;">Stage 2: Structured Telecalling & Site Visits</h3>
        <p style="margin-bottom:0;">
          Agents access their daily calling list in <strong>/today</strong> and <strong>/calls</strong>. After each call, agents log structured dispositions (e.g., <em>Interested, Callback Requested, Site Visit Scheduled</em>). The activity timeline permanently stores meeting dates, call notes, and customer preferences.
        </p>
      </div>

      <div class="info-box">
        <h3 class="subsection-heading" style="margin-top:0; color:#2563eb;">Stage 3: Live Inventory Exploration & 48-Hour Hold</h3>
        <p style="margin-bottom:0;">
          When a buyer selects a preferred apartment, the agent opens the visual floor matrix in <strong>/listings</strong>. The agent activates a <strong>48-Hour Atomic Hold</strong>. The flat turns Amber across all company screens with an active countdown timer. No other agent can book this flat, eliminating accidental double-sales.
        </p>
      </div>

      <div class="info-box">
        <h3 class="subsection-heading" style="margin-top:0; color:#2563eb;">Stage 4: 1-Click Deal Booking & Allotment Letter</h3>
        <p style="margin-bottom:0;">
          Upon receiving token advance, the agent converts the hold to a confirmed deal in <strong>/bookings</strong>. The system auto-calculates total agreement value, applies the Construction-Linked Payment (CLP) milestone schedule, and prints an official <strong>Booking Allotment Letter</strong> with company letterhead.
        </p>
      </div>

      <div class="info-box">
        <h3 class="subsection-heading" style="margin-top:0; color:#2563eb;">Stage 5: Milestone Billing & Automated Demand Letters</h3>
        <p style="margin-bottom:0;">
          As on-site construction milestones are achieved (e.g., <em>Plinth Completion, 5th Slab, Flooring</em>), the Accounts team triggers automated <strong>Demand Letters</strong> containing builder bank escrow details. Payments received via Cheque, NEFT, RTGS, or UPI are recorded with instant receipt generation and overdue ageing tracking (0–30, 31–60, 61–90, 90+ days).
        </p>
      </div>

      <div class="info-box">
        <h3 class="subsection-heading" style="margin-top:0; color:#2563eb;">Stage 6: Post-Sales Legal, Snag Inspection & Possession</h3>
        <p style="margin-bottom:0;">
          The Legal team verifies the 7-stage document checklist (Allotment, Sale Agreement, KYC, OC/CC, Sale Deed). Before handover, engineers log any paint, civil, plumbing, or electrical defects on the <strong>Snag Tracker</strong>. Once all items are resolved and utility meters are verified, the official <strong>Possession Certificate</strong> is issued.
        </p>
      </div>
    </div>

    <div class="doc-footer">
      <span>UrbanGaon CRM &bull; Business Requirement Document</span>
      <span>Page 4 of 7</span>
    </div>
  </div>


  <!-- ==================== PAGE 5: USER ROLES & GOVERNANCE ==================== -->
  <div class="page">
    <div>
      <div class="doc-header">
        <div class="doc-logo">UrbanGaon CRM</div>
        <div class="doc-header-meta">Section 5 &bull; User Roles & Permission Governance</div>
      </div>

      <h2 class="section-heading">5. User Roles & Permission Matrix (5-Tier RBAC)</h2>
      <p>
        To ensure operational security, staff members are assigned specific roles. Each role is restricted to view and modify only the data relevant to their daily job responsibilities:
      </p>

      <table class="custom-table">
        <thead>
          <tr>
            <th style="width: 22%;">User Role</th>
            <th style="width: 40%;">Primary Responsibilities</th>
            <th style="width: 38%;">Permissions & Access Boundaries</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong style="color:#6d28d9;">👑 Company Admin</strong></td>
            <td>Overall company management, project configuration, unit base pricing, user account creation, and financial audit reviews.</td>
            <td>Full 360° platform access to all projects, dashboards, export tools, and audit logs.</td>
          </tr>
          <tr>
            <td><strong style="color:#1d4ed8;">👔 Sales Manager</strong></td>
            <td>Lead pipeline oversight, unassigned lead distribution, 48-hour hold extension approvals, and deal discount approvals.</td>
            <td>Team-wide lead viewing, booking approvals, and sales performance reports. Cannot alter global company pricing.</td>
          </tr>
          <tr>
            <td><strong style="color:#047857;">🏃 Sales Agent</strong></td>
            <td>Customer calling, site visit appointments, unit inventory search, 48-hour flat holds, and booking deal entry.</td>
            <td>Access to own assigned leads, follow-up queues, unit availability, and personal commission calculations.</td>
          </tr>
          <tr>
            <td><strong style="color:#b45309;">💳 Accounts / Finance</strong></td>
            <td>Milestone billing triggers, official Demand Letter generation, bank transaction reconciliation, and overdue payment tracking.</td>
            <td>Manage payment schedules, issue money receipts, and generate overdue ageing reports. No access to reassign sales leads.</td>
          </tr>
          <tr>
            <td><strong style="color:#be123c;">⚖️ Post-Sales / Legal</strong></td>
            <td>Customer KYC document verification, Sale Agreement registry, snag defect tracking (Electrical, Civil, Paint), and handover certificate signoff.</td>
            <td>Document management, snag punchlist resolution, meter readings, and Possession Certificate generation.</td>
          </tr>
        </tbody>
      </table>

      <div class="info-box info-box-gold" style="margin-top: 18px;">
        <strong>Built-in 1-Click Role Switcher:</strong>
        <p style="margin-top: 4px; margin-bottom: 0;">
          For leadership reviews, demonstration, and operational audits, authorized users can switch perspectives instantly between Admin, Manager, Agent, Accounts, and Legal personas directly from the navigation bar.
        </p>
      </div>
    </div>

    <div class="doc-footer">
      <span>UrbanGaon CRM &bull; Business Requirement Document</span>
      <span>Page 5 of 7</span>
    </div>
  </div>


  <!-- ==================== PAGE 6: DATABASE & SCALABILITY ==================== -->
  <div class="page">
    <div>
      <div class="doc-header">
        <div class="doc-logo">UrbanGaon CRM</div>
        <div class="doc-header-meta">Section 6 &bull; Database & Scalability Architecture</div>
      </div>

      <h2 class="section-heading">6. Database Architecture & Scalability</h2>
      
      <h3 class="subsection-heading">6.1 Primary Database: MongoDB Atlas Cloud</h3>
      <p>
        All business data (Projects, Towers, Units, Leads, Bookings, Payment Schedules, Receipts, Documents, and Snag Items) is housed in <strong>MongoDB Atlas</strong>—a high-performance, enterprise cloud database.
      </p>
      <ul class="bullet-list">
        <li><strong>Connection:</strong> Hosted on a multi-zone cloud replica cluster ensuring 99.99% operational uptime.</li>
        <li><strong>Prisma ORM Client:</strong> Next.js Server Actions communicate with MongoDB via Prisma, providing compile-time type validation and zero runtime field errors.</li>
      </ul>

      <h3 class="subsection-heading">6.2 High-Volume Capacity (1,000+ to 100,000+ Records)</h3>
      <p>
        The system architecture is engineered to easily handle rapid inventory and customer data expansion:
      </p>
      <table class="custom-table">
        <thead>
          <tr>
            <th style="width: 30%;">Scale Dimension</th>
            <th style="width: 35%;">System Capacity</th>
            <th style="width: 35%;">Engineering Safeguard</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Concurrent Staff Accounts</strong></td>
            <td>Up to 100+ active team members</td>
            <td>Stateless server requests eliminate memory congestion on web servers.</td>
          </tr>
          <tr>
            <td><strong>Unit Inventory Scale</strong></td>
            <td>1,000+ to 10,000+ flats & villas</td>
            <td>Compound database indexing ensures inventory queries render in &lt;10ms.</td>
          </tr>
          <tr>
            <td><strong>Customer Leads & History</strong></td>
            <td>100,000+ customer records</td>
            <td>Cursor-based pagination loads records smoothly without browser lag.</td>
          </tr>
          <tr>
            <td><strong>Financial Transactions</strong></td>
            <td>50,000+ milestone bills & receipts</td>
            <td>Atomic database transactions prevent accounting inconsistencies.</td>
          </tr>
        </tbody>
      </table>

      <h3 class="subsection-heading">6.3 Concurrent Double-Booking Prevention</h3>
      <div class="info-box info-box-emerald">
        <p style="margin-bottom:0;">
          If two agents attempt to hold or book the exact same flat at the exact same millisecond, the database executes an atomic unit lock. The first request successfully locks the flat, and the second agent receives an instantaneous notification that the flat has just been secured by a colleague.
        </p>
      </div>
    </div>

    <div class="doc-footer">
      <span>UrbanGaon CRM &bull; Business Requirement Document</span>
      <span>Page 6 of 7</span>
    </div>
  </div>


  <!-- ==================== PAGE 7: DATA SECURITY & NEXT STEPS ==================== -->
  <div class="page page-last">
    <div>
      <div class="doc-header">
        <div class="doc-logo">UrbanGaon CRM</div>
        <div class="doc-header-meta">Section 7 &bull; Security, Compliance & Next Steps</div>
      </div>

      <h2 class="section-heading">7. Data Security & Compliance Controls</h2>
      <p>The platform implements bank-grade security standards to protect company financials and customer personal data:</p>

      <ul class="bullet-list">
        <li><strong>Multi-Tenant Data Isolation:</strong> Every database query is strictly partitioned by Organization ID, guaranteeing complete data privacy.</li>
        <li><strong>Encrypted Cookie Authentication:</strong> User sessions are managed via cryptographically signed JWT tokens stored in secure, HttpOnly, SameSite cookies.</li>
        <li><strong>Server-Side Permission Guards:</strong> Every action (such as approving a deal or recording a payment) validates user role permissions on the server before modifying records.</li>
        <li><strong>Immutable Audit Trail:</strong> All critical actions (holds, bookings, payment receipts, document verifications) are recorded in the <em>AuditLog</em> collection with user ID, timestamp, and entity details.</li>
        <li><strong>End-to-End Encryption:</strong> 256-bit AES storage encryption at rest in MongoDB Atlas and TLS 1.3 network encryption in transit across all endpoints.</li>
      </ul>

      <h2 class="section-heading" style="margin-top: 22px;">8. Summary & Next Steps</h2>
      <p>
        UrbanGaon CRM delivers a complete, secure, and production-ready operational foundation. The software bridges the gap between front-office sales and back-office accounts, providing total clarity across all property developments.
      </p>

      <table class="custom-table" style="margin-top: 14px;">
        <thead>
          <tr>
            <th style="width: 25%;">Deployment Stage</th>
            <th style="width: 45%;">Key Activity</th>
            <th style="width: 30%;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. Core Platform</strong></td>
            <td>Lead CRM, Visual Inventory Grid, 1-Click Deals & CLP Payments</td>
            <td><span class="badge badge-emerald">Completed & Verified</span></td>
          </tr>
          <tr>
            <td><strong>2. Extended Tools</strong></td>
            <td>Calls Dialer, Leaderboard, Incentives & WhatsApp Outreach</td>
            <td><span class="badge badge-emerald">Completed & Verified</span></td>
          </tr>
          <tr>
            <td><strong>3. Team Rollout</strong></td>
            <td>Staff account creation (100 accounts) & role assignment</td>
            <td><span class="badge badge-blue">Ready for Onboarding</span></td>
          </tr>
          <tr>
            <td><strong>4. Master Data Sync</strong></td>
            <td>Bulk upload of 1,000+ flats, pricing sheets & payment templates</td>
            <td><span class="badge badge-gold">Ready for Live Upload</span></td>
          </tr>
        </tbody>
      </table>

      <div class="info-box" style="margin-top: 16px; text-align: center;">
        <strong style="color: #2563eb; font-size: 11pt;">
          UrbanGaon CRM — Standardizing Real Estate Sales & Operations From Lead to Possession.
        </strong>
      </div>
    </div>

    <div class="doc-footer">
      <span>UrbanGaon CRM &bull; Business Requirement Document</span>
      <span>Page 7 of 7</span>
    </div>
  </div>

</body>
</html>`;

const htmlFilePath = path.join(__dirname, 'brd_temp.html');
const pdfFilePath = path.join(__dirname, 'UrbanGaon_CRM_Business_Requirement_Document.pdf');
const pdfExecutivePath = path.join(__dirname, 'PropCRM_Executive_Architecture_Deck.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');

const msedgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browserPath = fs.existsSync(chromePath) ? chromePath : msedgePath;

const cmd = `"${browserPath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfFilePath}" "${htmlFilePath}"`;
console.log('Generating A4 Portrait BRD PDF...');
execSync(cmd);

// Also copy to PropCRM_Executive_Architecture_Deck.pdf
fs.copyFileSync(pdfFilePath, pdfExecutivePath);

// Remove temp html
if (fs.existsSync(htmlFilePath)) {
  fs.unlinkSync(htmlFilePath);
}

console.log(`BRD PDFs generated successfully:\n- ${pdfFilePath}\n- ${pdfExecutivePath}`);
