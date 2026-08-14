# PropCRM — Real Estate CRM (Lead to Possession)

**PropCRM** is a production-grade, multi-tenant Real Estate Developer CRM web application inspired by the **"Lead → Inventory → Booking → Payments → Post-Sales → Possession"** lifecycle.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**:
   - **Admin / CEO**: Global access across all projects, revenue analytics, user management, and executive reports.
   - **Sales Manager**: Team leads pipeline velocity, unit hold approvals, and booking approvals.
   - **Sales Agent**: Personal lead funnel, today's follow-up reminders, unit holds, and conversion.
   - **Accounts / Finance**: Construction-linked payment milestones, receipt issuance, demand letters, and overdue ageing reports.
   - **Post-Sales / Legal**: Legal document verification (Allotment, Sale Agreement, KYC, OC/CC, Sale Deed), snag inspection, and possession handover certificate.
   - **1-Click Role Switcher**: Instant persona switching in the header and login screen.

2. **Full Lifecycle Modules**:
   - **Projects & Inventory Matrix**: Interactive color-coded tower/floor visualizer (Green: Available, Amber: Held, Blue: Booked, Red: Sold, Slate: Blocked), 48h hold countdown timer with auto-release, and Bulk CSV import.
   - **Leads & Pipeline CRM**: Visual Kanban board, tabular list view, duplicate lead detection by phone/email, customer activity timeline (calls/meetings/site visits), and follow-up task scheduler.
   - **1-Click Booking Conversion**: Auto-locks unit, binds customer agreement value, applies project payment plan templates (e.g. CLP, 20:80 Subvention), generates payment milestones, and prints official Booking Confirmation letters.
   - **Payments & Demand Letters**: Construction-linked milestone tracking, official printable Demand Letters with builder letterhead and escrow bank details, payment receipt logging, and 0-30/31-60/61-90/90+ days overdue ageing reports.
   - **Post-Sales Paperwork**: Document checklist with % completion tracking, status lifecycle (Pending → Generated → Uploaded → Verified → Registered).
   - **Possession & Snags**: Handover scheduling, defect snag logging by category (Electrical, Plumbing, Paint, Carpentry, Civil) with resolution toggle, utility meter verification, and official Possession Certificate generation.
   - **Executive Dashboards & Reports**: Recharts visualizations for monthly booking value vs collections, funnel conversion ratios, sales leaderboard, and CSV exporters.

---

## 🔑 Demo Login Credentials

You can log in with any of the pre-configured demo credentials below, or click the **1-Click Persona Login** buttons directly on the login screen:

| Role | Email | Password |
|---|---|---|
| **Admin / CEO** | `admin@propcrm.io` | `password123` |
| **Sales Manager** | `manager@propcrm.io` | `password123` |
| **Sales Agent** | `agent@propcrm.io` | `password123` |
| **Accounts / Finance** | `finance@propcrm.io` | `password123` |
| **Post-Sales / Legal** | `legal@propcrm.io` | `password123` |
| **Vastu Reference Demo** | `demo@vastucrm.com` | `vastu@123` |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router, Server Actions, Route Handlers, React 19)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS + Luxury Real Estate Aesthetics (Dark Mode, Deep Slate, Emerald, Gold accents)
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM 6.x
- **Charts**: Recharts
- **Icons**: Lucide React
- **Validation**: Zod & Server-side guards

---

## 🚀 Setup & Local Execution

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Generate Database & Push Schema**:
   ```bash
   npx prisma db push
   ```

3. **Seed Realistic Real Estate Demo Data**:
   ```bash
   npx tsx prisma/seed.ts
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
