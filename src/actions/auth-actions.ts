"use server";

import { getCurrentUser, loginWithEmail, switchDemoRole, clearSessionCookie } from "@/lib/auth";
import { UserRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await loginWithEmail(email, password);
  if (!user) {
    return { error: "Invalid credentials. Use demo accounts or password123." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function switchDemoRoleAction(role: UserRole) {
  const user = await switchDemoRole(role);
  if (!user) {
    return { error: `Could not switch to role ${role}` };
  }

  revalidatePath("/", "layout");
  return { success: true, user };
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getSessionUserAction() {
  return await getCurrentUser();
}
