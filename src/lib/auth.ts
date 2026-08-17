import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { SessionUser, UserRole } from "./rbac";
import { prisma } from "./prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-urbangaon-jwt-key-2026-secure-token"
);

const COOKIE_NAME = "urbangaon_session";

export const DEMO_USERS_MAP: Record<
  UserRole,
  { id: string; name: string; email: string; phone: string; orgId: string; orgName: string }
> = {
  ADMIN: {
    id: "user-admin-1",
    name: "Vikram Malhotra (CEO)",
    email: "admin@urbangaon.com",
    phone: "+91 98765 43210",
    orgId: "org-urbangaon-1",
    orgName: "UrbanGaon Realty & Infrastructure",
  },
  SALES_MANAGER: {
    id: "user-manager-1",
    name: "Ananya Sharma (Sales Head)",
    email: "manager@urbangaon.com",
    phone: "+91 98765 43211",
    orgId: "org-urbangaon-1",
    orgName: "UrbanGaon Realty & Infrastructure",
  },
  SALES_AGENT: {
    id: "user-agent-1",
    name: "Rahul Verma (Senior Sales Agent)",
    email: "agent@urbangaon.com",
    phone: "+91 98765 43212",
    orgId: "org-urbangaon-1",
    orgName: "UrbanGaon Realty & Infrastructure",
  },
  ACCOUNTS: {
    id: "user-finance-1",
    name: "Suresh Menon (Accounts Lead)",
    email: "finance@urbangaon.com",
    phone: "+91 98765 43213",
    orgId: "org-urbangaon-1",
    orgName: "UrbanGaon Realty & Infrastructure",
  },
  POST_SALES: {
    id: "user-legal-1",
    name: "Pooja Hegde (Post-Sales & Legal)",
    email: "legal@urbangaon.com",
    phone: "+91 98765 43214",
    orgId: "org-urbangaon-1",
    orgName: "UrbanGaon Realty & Infrastructure",
  },
};

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (token) {
      const user = await verifySessionToken(token);
      if (user) return user;
    }

    // Default fallback to ADMIN for instant demo
    const defaultUser: SessionUser = {
      id: DEMO_USERS_MAP.ADMIN.id,
      email: DEMO_USERS_MAP.ADMIN.email,
      name: DEMO_USERS_MAP.ADMIN.name,
      role: "ADMIN",
      organizationId: DEMO_USERS_MAP.ADMIN.orgId,
      organizationName: DEMO_USERS_MAP.ADMIN.orgName,
    };
    return defaultUser;
  } catch (error) {
    console.warn("Error resolving current user, returning demo admin:", error);
    return {
      id: DEMO_USERS_MAP.ADMIN.id,
      email: DEMO_USERS_MAP.ADMIN.email,
      name: DEMO_USERS_MAP.ADMIN.name,
      role: "ADMIN",
      organizationId: DEMO_USERS_MAP.ADMIN.orgId,
      organizationName: DEMO_USERS_MAP.ADMIN.orgName,
    };
  }
}

export async function setSessionUser(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
