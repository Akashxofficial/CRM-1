import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { SessionUser, UserRole } from "./rbac";
import { prisma } from "./prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-propcrm-jwt-key-2026-secure-token"
);

const COOKIE_NAME = "propcrm_session";

export const DEMO_USERS_MAP: Record<
  UserRole,
  { id: string; name: string; email: string; phone: string; orgId: string; orgName: string }
> = {
  ADMIN: {
    id: "user-admin-1",
    name: "Vikram Malhotra (CEO)",
    email: "admin@propcrm.io",
    phone: "+91 98765 43210",
    orgId: "org-skyline-1",
    orgName: "Skyline Realty & Infrastructure",
  },
  SALES_MANAGER: {
    id: "user-manager-1",
    name: "Ananya Sharma (Sales Head)",
    email: "manager@propcrm.io",
    phone: "+91 98765 43211",
    orgId: "org-skyline-1",
    orgName: "Skyline Realty & Infrastructure",
  },
  SALES_AGENT: {
    id: "user-agent-1",
    name: "Rahul Verma (Senior Sales Agent)",
    email: "agent@propcrm.io",
    phone: "+91 98765 43212",
    orgId: "org-skyline-1",
    orgName: "Skyline Realty & Infrastructure",
  },
  ACCOUNTS: {
    id: "user-finance-1",
    name: "Suresh Menon (Accounts Lead)",
    email: "finance@propcrm.io",
    phone: "+91 98765 43213",
    orgId: "org-skyline-1",
    orgName: "Skyline Realty & Infrastructure",
  },
  POST_SALES: {
    id: "user-legal-1",
    name: "Pooja Hegde (Post-Sales & Legal)",
    email: "legal@propcrm.io",
    phone: "+91 98765 43214",
    orgId: "org-skyline-1",
    orgName: "Skyline Realty & Infrastructure",
  },
};

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function loginWithEmail(email: string, passwordAttempt: string): Promise<SessionUser | null> {
  const lowerEmail = email.toLowerCase().trim();

  // Determine role from email
  let targetRole: UserRole = "ADMIN";
  if (lowerEmail.includes("manager")) targetRole = "SALES_MANAGER";
  else if (lowerEmail.includes("agent")) targetRole = "SALES_AGENT";
  else if (lowerEmail.includes("finance")) targetRole = "ACCOUNTS";
  else if (lowerEmail.includes("legal")) targetRole = "POST_SALES";

  return await switchDemoRole(targetRole);
}

export async function switchDemoRole(role: UserRole): Promise<SessionUser> {
  const fallback = DEMO_USERS_MAP[role] || DEMO_USERS_MAP.ADMIN;

  let sessionUser: SessionUser = {
    id: fallback.id,
    email: fallback.email,
    name: fallback.name,
    role,
    phone: fallback.phone,
    organizationId: fallback.orgId,
    organizationName: fallback.orgName,
  };

  try {
    // Try to query or upsert from database if available
    const dbUser = await prisma.user.findFirst({
      where: { role },
      include: { organization: true },
    });

    if (dbUser) {
      sessionUser = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role as UserRole,
        phone: dbUser.phone,
        organizationId: dbUser.organizationId,
        organizationName: dbUser.organization.name,
      };
    }
  } catch (err) {
    console.warn("Database lookup skipped, using fallback demo persona:", err);
  }

  // Always issue a valid session token regardless of DB status
  const token = await createSessionToken(sessionUser);
  await setSessionCookie(token);
  return sessionUser;
}
