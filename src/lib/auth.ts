import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { SessionUser, UserRole } from "./rbac";

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

export async function getCurrentUser(): Promise<SessionUser> {
  const fallbackUser: SessionUser = {
    id: DEMO_USERS_MAP.ADMIN.id,
    email: DEMO_USERS_MAP.ADMIN.email,
    name: DEMO_USERS_MAP.ADMIN.name,
    role: "ADMIN",
    organizationId: DEMO_USERS_MAP.ADMIN.orgId,
    organizationName: DEMO_USERS_MAP.ADMIN.orgName,
  };

  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("urbangaon_session")?.value ||
      cookieStore.get("propcrm_session")?.value;

    if (token) {
      const user = await verifySessionToken(token);
      if (user && user.id && user.role) return user;
    }

    return fallbackUser;
  } catch (error) {
    console.warn("Cookie store unavailable, returning fallback demo admin:", error);
    return fallbackUser;
  }
}

export async function setSessionUser(user: SessionUser): Promise<void> {
  try {
    const token = await createSessionToken(user);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    console.warn("Failed to set session cookie:", error);
  }
}

export async function clearSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    cookieStore.delete("propcrm_session");
  } catch (error) {
    console.warn("Failed to clear session cookie:", error);
  }
}

export const clearSessionCookie = clearSession;

export async function loginWithEmail(email: string, _password?: string): Promise<SessionUser | null> {
  const normalizedEmail = email.toLowerCase();
  let selectedRole: UserRole = "ADMIN";

  if (normalizedEmail.includes("manager")) selectedRole = "SALES_MANAGER";
  else if (normalizedEmail.includes("agent")) selectedRole = "SALES_AGENT";
  else if (normalizedEmail.includes("finance") || normalizedEmail.includes("account")) selectedRole = "ACCOUNTS";
  else if (normalizedEmail.includes("legal") || normalizedEmail.includes("post")) selectedRole = "POST_SALES";

  const template = DEMO_USERS_MAP[selectedRole];
  const user: SessionUser = {
    id: template.id,
    email: normalizedEmail,
    name: template.name,
    role: selectedRole,
    organizationId: template.orgId,
    organizationName: template.orgName,
  };

  await setSessionUser(user);
  return user;
}

export async function switchDemoRole(role: UserRole): Promise<SessionUser | null> {
  const template = DEMO_USERS_MAP[role] || DEMO_USERS_MAP.ADMIN;
  const user: SessionUser = {
    id: template.id,
    email: template.email,
    name: template.name,
    role: role,
    organizationId: template.orgId,
    organizationName: template.orgName,
  };

  await setSessionUser(user);
  return user;
}
