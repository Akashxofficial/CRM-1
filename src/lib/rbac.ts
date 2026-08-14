export type UserRole =
  | "ADMIN"
  | "SALES_MANAGER"
  | "SALES_AGENT"
  | "ACCOUNTS"
  | "POST_SALES";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  organizationId: string;
  organizationName: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    "VIEW_ALL_DATA",
    "MANAGE_USERS",
    "MANAGE_PROJECTS",
    "VIEW_INVENTORY",
    "MANAGE_INVENTORY",
    "HOLD_UNIT",
    "VIEW_ALL_LEADS",
    "MANAGE_LEADS",
    "CREATE_BOOKINGS",
    "APPROVE_BOOKINGS",
    "VIEW_PAYMENTS",
    "MANAGE_PAYMENTS",
    "GENERATE_DEMAND_LETTER",
    "MANAGE_POST_SALES_DOCS",
    "MANAGE_POSSESSION",
    "VIEW_CEO_DASHBOARD",
    "VIEW_REPORTS",
    "EXPORT_DATA",
  ],
  SALES_MANAGER: [
    "VIEW_PROJECTS",
    "VIEW_INVENTORY",
    "HOLD_UNIT",
    "VIEW_TEAM_LEADS",
    "MANAGE_TEAM_LEADS",
    "CREATE_BOOKINGS",
    "APPROVE_BOOKINGS",
    "VIEW_BOOKINGS",
    "VIEW_SALES_REPORTS",
    "VIEW_MANAGER_DASHBOARD",
  ],
  SALES_AGENT: [
    "VIEW_PROJECTS",
    "VIEW_INVENTORY",
    "HOLD_UNIT",
    "VIEW_OWN_LEADS",
    "MANAGE_OWN_LEADS",
    "CREATE_BOOKINGS",
    "VIEW_OWN_BOOKINGS",
    "VIEW_AGENT_DASHBOARD",
  ],
  ACCOUNTS: [
    "VIEW_PROJECTS",
    "VIEW_INVENTORY",
    "VIEW_LEADS_READONLY",
    "VIEW_BOOKINGS",
    "VIEW_PAYMENTS",
    "MANAGE_PAYMENTS",
    "GENERATE_DEMAND_LETTER",
    "GENERATE_RECEIPTS",
    "VIEW_ACCOUNTS_DASHBOARD",
    "VIEW_FINANCE_REPORTS",
  ],
  POST_SALES: [
    "VIEW_PROJECTS",
    "VIEW_INVENTORY",
    "VIEW_BOOKINGS",
    "MANAGE_POST_SALES_DOCS",
    "VERIFY_DOCUMENTS",
    "MANAGE_POSSESSION",
    "MANAGE_SNAGS",
    "GENERATE_POSSESSION_CERTIFICATE",
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  if (role === "ADMIN") return true;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export const ROLE_LABELS: Record<UserRole, { label: string; badgeColor: string; description: string }> = {
  ADMIN: {
    label: "Admin / CEO",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800 dark:text-purple-400",
    description: "Full system access, all projects, financials & settings",
  },
  SALES_MANAGER: {
    label: "Sales Manager",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400",
    description: "Team leads, pipeline velocity & booking approvals",
  },
  SALES_AGENT: {
    label: "Sales Agent",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400",
    description: "Personal lead funnel, unit holds & conversion",
  },
  ACCOUNTS: {
    label: "Accounts / Finance",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800 dark:text-amber-400",
    description: "Payments, milestones, receipts & demand letters",
  },
  POST_SALES: {
    label: "Post-Sales / Legal",
    badgeColor: "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800 dark:text-rose-400",
    description: "Agreement, KYC, OC/CC, snags & possession handover",
  },
};
