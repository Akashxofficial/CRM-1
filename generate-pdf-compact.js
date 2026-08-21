const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PropCRM — Architecture & Workflow Overview</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

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
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: #ffffff;
    color: #0f172a;
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
    background: #ffffff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .slide-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 8px;
    margin-bottom: 12px;
  }

  .slide-tag {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #d97706;
    margin-bottom: 4px;
  }

  .slide-title {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
  }

  .slide-number {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    background: #f8fafc;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
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
    border-top: 1px solid #e2e8f0;
    padding-top: 8px;
    font-size: 10px;
    color: #64748b;
  }

  /* Grids */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .grid-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }

  /* Cards */
  .card {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 14px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .card-gold { border-color: #f59e0b; background: #fffbeb; }
  .card-emerald { border-color: #10b981; background: #ecfdf5; }
  .card-blue { border-color: #3b82f6; background: #eff6ff; }
  .card-purple { border-color: #8b5cf6; background: #f5f3ff; }
  .card-rose { border-color: #f43f5e; background: #fff1f2; }

  .card-title {
    font-size: 13.5px;
    font-weight: 700;
    margin-bottom: 6px;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .card-desc {
    font-size: 11px;
    line-height: 1.5;
    color: #334155;
  }

  ul.card-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  ul.card-list li {
    font-size: 11px;
    line-height: 1.5;
    color: #334155;
    margin-bottom: 6px;
    position: relative;
    padding-left: 14px;
  }

  ul.card-list li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: #d97706;
    font-weight: bold;
    font-size: 14px;
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

  .badge-gold { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
  .badge-emerald { background: #d1fae5; color: #047857; border: 1px solid #a7f3d0; }
  .badge-blue { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
  .badge-purple { background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe; }

  table.simple-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }

  table.simple-table th {
    background: #f1f5f9;
    color: #0f172a;
    text-align: left;
    padding: 9px 12px;
    border: 1px solid #cbd5e1;
    font-weight: 700;
  }

  table.simple-table td {
    padding: 9px 12px;
    border: 1px solid #e2e8f0;
    color: #334155;
    background: #ffffff;
  }
</style>
</head>
<body>

  <!-- SLIDE 1: What is PropCRM? (Simple Overview - White Theme) -->
  <div class="slide">
    <div class="slide-header" style="border:none; margin-bottom: 0;">
      <div class="slide-tag">ALL-IN-ONE REAL ESTATE SOLUTION</div>
      <div class="badge badge-gold">SIMPLE & EASY GUIDE</div>
    </div>
    
    <div class="slide-body">
      <div class="card card-gold" style="padding: 26px; border-width: 2px;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #d97706; text-transform: uppercase; margin-bottom: 8px;">
          WHAT IS THIS PLATFORM?
        </div>
        <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1.2; margin-bottom: 10px;">
          PropCRM — Complete Real Estate Management System
        </h1>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; max-width: 880px; margin-bottom: 20px;">
          A simple, easy-to-use digital system designed for real estate companies to manage all customer inquiries, flat bookings, customer payments, legal paperwork, and key handovers in <strong>one single screen</strong>.
        </p>

        <div class="grid-3" style="margin-top: 6px;">
          <div class="card card-blue">
            <div style="font-size: 9px; font-weight: 700; color: #2563eb; text-transform: uppercase;">TEAM MEMBERS</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #0f172a; margin-top: 2px;">Up to 100+ Active Staff</div>
            <div style="font-size: 10.5px; color: #64748b; margin-top: 3px;">Sales, Accounts, Managers & Legal</div>
          </div>
          <div class="card card-emerald">
            <div style="font-size: 9px; font-weight: 700; color: #059669; text-transform: uppercase;">DATABASE SIZE</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #0f172a; margin-top: 2px;">1,000+ to 100,000+ Records</div>
            <div style="font-size: 10.5px; color: #64748b; margin-top: 3px;">All flats, inquiries, bills & receipts</div>
          </div>
          <div class="card card-purple">
            <div style="font-size: 9px; font-weight: 700; color: #7c3aed; text-transform: uppercase;">THE BIG BENEFIT</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #0f172a; margin-top: 2px;">Zero Manual Confusion</div>
            <div style="font-size: 10.5px; color: #64748b; margin-top: 3px;">Replaces Excel, WhatsApp & Paper</div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM &bull; Overview</span>
      <span>August 2026</span>
    </div>
  </div>

  <!-- SLIDE 2: How It Works (Real-Life Flow from Ingestion to Handover) -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">STEP-BY-STEP JOURNEY</div>
        <div class="slide-title">How the App Works in Real Life (Simple 6-Step Flow)</div>
      </div>
      <div class="slide-number">Slide 02 / 06</div>
    </div>

    <div class="slide-body">
      <div class="grid-6">
        <div class="card card-blue" style="text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #2563eb;">1</div>
          <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin: 4px 0;">New Inquiries</div>
          <div style="font-size: 9.5px; color: #475569; line-height: 1.35;">
            Customer leads come from ads or website. System checks phone numbers to stop duplicates.
          </div>
        </div>

        <div class="card card-emerald" style="text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #059669;">2</div>
          <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin: 4px 0;">Calls & Visits</div>
          <div style="font-size: 9.5px; color: #475569; line-height: 1.35;">
            Agents call buyers, write notes, and book site visits with automatic reminder alerts.
          </div>
        </div>

        <div class="card card-gold" style="text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #d97706;">3</div>
          <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin: 4px 0;">Choose & Hold Flat</div>
          <div style="font-size: 9.5px; color: #475569; line-height: 1.35;">
            View color-coded floor map. Temporarily hold a flat for 48 hours so nobody else sells it.
          </div>
        </div>

        <div class="card card-purple" style="text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #7c3aed;">4</div>
          <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin: 4px 0;">1-Click Booking</div>
          <div style="font-size: 9.5px; color: #475569; line-height: 1.35;">
            Calculate exact flat cost with taxes, attach payment plan, and print official Allotment Letter.
          </div>
        </div>

        <div class="card card-blue" style="text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #2563eb;">5</div>
          <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin: 4px 0;">Payment Demands</div>
          <div style="font-size: 9.5px; color: #475569; line-height: 1.35;">
            As construction finishes floors, system sends payment demand letters and issues receipts.
          </div>
        </div>

        <div class="card card-rose" style="text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #e11d48;">6</div>
          <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin: 4px 0;">Key Handover</div>
          <div style="font-size: 9.5px; color: #475569; line-height: 1.35;">
            Inspect flat, fix any painting/electric repairs, check meters, and issue Possession Certificate.
          </div>
        </div>
      </div>

      <div class="grid-2" style="margin-top: 10px;">
        <div class="card card-gold">
          <div class="card-title" style="color: #b45309;">🎯 For the Sales Team</div>
          <div class="card-desc">
            Sales reps always know who to call today, which flats are available, and can lock a flat for a customer in 2 seconds without calling anyone for permission.
          </div>
        </div>

        <div class="card card-emerald">
          <div class="card-title" style="color: #047857;">💳 For Accounts & Company Owners</div>
          <div class="card-desc">
            Automatic tracking of pending customer dues, instant receipt generation, clear collection graphs, and complete transparency into monthly company revenue.
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM &bull; Customer Journey</span>
      <span>Confidential</span>
    </div>
  </div>

  <!-- SLIDE 3: Every Screen in the App (Sidebar Explained Simply) -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">ALL FEATURES COVERED</div>
        <div class="slide-title">Everything Inside the Application (All 12 Screens Explained)</div>
      </div>
      <div class="slide-number">Slide 03 / 06</div>
    </div>

    <div class="slide-body">
      <div class="grid-3">
        <div class="card card-blue">
          <div class="card-title" style="color: #1d4ed8;">📊 1. Daily Operations</div>
          <ul class="card-list">
            <li><strong>Dashboard:</strong> Overall sales numbers, revenue graphs & conversion rates.</li>
            <li><strong>Today:</strong> Your personal daily to-do list (pending follow-ups & scheduled visits).</li>
            <li><strong>Calls:</strong> Calling screen where you dial leads and record call results.</li>
          </ul>
        </div>

        <div class="card card-emerald">
          <div class="card-title" style="color: #047857;">🏢 2. Properties & Sales</div>
          <ul class="card-list">
            <li><strong>Projects:</strong> Master project list, tower names & RERA approvals.</li>
            <li><strong>Listings:</strong> Complete live map of 1,000+ flats (Green: Available, Amber: Held, Blue: Booked).</li>
            <li><strong>Leads:</strong> Customer cards with phone numbers, budget & status.</li>
            <li><strong>Deals (Bookings):</strong> Official buyer bookings with printable letters.</li>
          </ul>
        </div>

        <div class="card card-purple">
          <div class="card-title" style="color: #6d28d9;">💰 3. Finance & Marketing</div>
          <ul class="card-list">
            <li><strong>Collections:</strong> Construction bills, bank payment receipts & overdue dues.</li>
            <li><strong>Leaderboard:</strong> Friendly competition showing top-selling sales agents.</li>
            <li><strong>Incentive Sheets:</strong> Automatic commission calculations per closed deal.</li>
            <li><strong>Reports & Outreach:</strong> Sales ROI charts & bulk WhatsApp announcements.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM &bull; Feature Breakdown</span>
      <span>Confidential</span>
    </div>
  </div>

  <!-- SLIDE 4: Who Uses the App? (5 Simple Roles) -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">TEAM RESPONSIBILITIES</div>
        <div class="slide-title">Who Uses the System? (5 Clear User Roles)</div>
      </div>
      <div class="slide-number">Slide 04 / 06</div>
    </div>

    <div class="slide-body">
      <table class="simple-table">
        <thead>
          <tr>
            <th style="width: 22%;">Role Name</th>
            <th style="width: 38%;">What They Do Every Day</th>
            <th style="width: 40%;">Why It Helps the Business</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong style="color:#6d28d9;">👑 Company Admin</strong></td>
            <td>Sees entire company performance, manages projects, sets flat rates, and adds new staff accounts.</td>
            <td>Gives leadership 100% real-time control over revenue and operations.</td>
          </tr>
          <tr>
            <td><strong style="color:#1d4ed8;">👔 Sales Manager</strong></td>
            <td>Guides the sales team, reviews lead pipelines, and approves flat hold extensions or special deals.</td>
            <td>Helps close deals faster and prevents leads from going cold.</td>
          </tr>
          <tr>
            <td><strong style="color:#047857;">🏃 Sales Agent</strong></td>
            <td>Calls prospective buyers, conducts site visits, holds available flats, and books deals.</td>
            <td>Gives agents an organized daily plan so they never miss an inquiry.</td>
          </tr>
          <tr>
            <td><strong style="color:#b45309;">💳 Accounts & Finance</strong></td>
            <td>Sends construction-linked demand letters, logs bank cheques/NEFT/UPI, and prints receipts.</td>
            <td>Speeds up customer payments and eliminates manual accounting errors.</td>
          </tr>
          <tr>
            <td><strong style="color:#be123c;">⚖️ Post-Sales & Legal</strong></td>
            <td>Verifies customer KYC documents, checks flat quality before handover, and issues final certificates.</td>
            <td>Ensures legal compliance and happy customer move-ins.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="slide-footer">
      <span>PropCRM &bull; User Roles</span>
      <span>Confidential</span>
    </div>
  </div>

  <!-- SLIDE 5: Database & Speed (Simple Non-Technical Explanation) -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">DATABASE & SCALE</div>
        <div class="slide-title">Database Storage & Speed (Easy Non-Technical Explanation)</div>
      </div>
      <div class="slide-number">Slide 05 / 06</div>
    </div>

    <div class="slide-body">
      <div class="grid-3">
        <div class="card card-emerald">
          <div class="card-title" style="color: #047857;">🍃 Where is Data Stored?</div>
          <div class="card-desc" style="font-size: 11.5px;">
            In <strong>MongoDB Atlas</strong> — an enterprise cloud database. Think of it as a secure digital vault where all flats, client phone numbers, payments, and photos are saved safely 24/7.
          </div>
        </div>

        <div class="card card-blue">
          <div class="card-title" style="color: #1d4ed8;">⚡ How Fast Is It?</div>
          <div class="card-desc" style="font-size: 11.5px;">
            Even with <strong>1,000+ flats and 100,000+ customer files</strong>, searching for any customer or flat takes <strong>less than 1 second</strong> because records are smartly organized with instant lookup tags.
          </div>
        </div>

        <div class="card card-purple">
          <div class="card-title" style="color: #6d28d9;">👥 How Many People Can Use It?</div>
          <div class="card-desc" style="font-size: 11.5px;">
            <strong>Up to 100+ team members</strong> can work simultaneously (calling leads, holding flats, creating receipts) at the exact same second without any app crashes or slowdowns.
          </div>
        </div>
      </div>

      <div class="card card-gold" style="margin-top: 6px;">
        <div class="card-title" style="color: #b45309;">🛡️ Double-Booking Protection</div>
        <div class="card-desc" style="font-size: 11.5px;">
          If two agents click to hold the exact same flat at the exact same millisecond, the system automatically awards it to the first click and instantly notifies the second agent. <strong>Zero risk of selling the same flat twice!</strong>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM &bull; Data & Scale</span>
      <span>Confidential</span>
    </div>
  </div>

  <!-- SLIDE 6: Safety, Privacy & Summary -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-tag">DATA SAFETY & CONCLUSION</div>
        <div class="slide-title">How Data is Kept Safe & Why It Works</div>
      </div>
      <div class="slide-number">Slide 06 / 06</div>
    </div>

    <div class="slide-body">
      <div class="grid-2">
        <div class="card card-emerald">
          <div class="card-title" style="color: #047857;">🔒 4 Layers of Security (In Simple Words)</div>
          <ul class="card-list">
            <li><strong>Private Company Data:</strong> Your business data is strictly isolated. No outsider can ever see your leads or prices.</li>
            <li><strong>Role Permissions:</strong> Staff only see what their job requires (e.g., sales agents cannot view the company bank balances).</li>
            <li><strong>Full History Log:</strong> The app records who created or changed every flat, deal, and payment with date and time.</li>
            <li><strong>Bank-Grade Lock:</strong> Customer phone numbers, passwords, and invoices are encrypted and protected 24/7.</li>
          </ul>
        </div>

        <div class="card card-gold">
          <div class="card-title" style="color: #b45309;">🏆 Summary: Why This App Wins</div>
          <ul class="card-list">
            <li><strong>Covers Everything:</strong> Leads, Calls, Flats, Deals, Bills, Commissions, and Key Handover.</li>
            <li><strong>Zero Learning Curve:</strong> Designed with clean buttons, easy colors, and simple everyday English.</li>
            <li><strong>Fast & Scalable:</strong> Easily manages 1,000+ flats, 100,000+ customer records, and 100+ staff members.</li>
            <li><strong>Live & Ready:</strong> Fully functioning web application ready for daily business use.</li>
          </ul>
        </div>
      </div>

      <div class="card card-blue" style="margin-top: 6px; text-align: center;">
        <div style="font-size: 12px; font-weight: 700; color: #1d4ed8;">
          ✨ PropCRM: Simple, Fast & Complete Real Estate Software Built for Real Teams.
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PropCRM &bull; Summary</span>
      <span>Confidential</span>
    </div>
  </div>

</body>
</html>`;

const htmlFilePath = path.join(__dirname, 'deck_clean_temp.html');
const pdfFilePath = path.join(__dirname, 'PropCRM_Executive_Architecture_Deck.pdf');
const pdfCompactPath = path.join(__dirname, 'PropCRM_Architecture_Overview.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');

const msedgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browserPath = fs.existsSync(chromePath) ? chromePath : msedgePath;

const cmd = `"${browserPath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfFilePath}" "${htmlFilePath}"`;
console.log('Generating clean white theme PDF...');
execSync(cmd);

// Also copy to PropCRM_Architecture_Overview.pdf
fs.copyFileSync(pdfFilePath, pdfCompactPath);

// Remove temp html
if (fs.existsSync(htmlFilePath)) {
  fs.unlinkSync(htmlFilePath);
}

console.log(`White Theme PDFs generated successfully:\n- ${pdfFilePath}\n- ${pdfCompactPath}`);
