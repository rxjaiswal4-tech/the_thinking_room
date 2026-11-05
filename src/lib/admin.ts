export type AdminUser = {
  email?: string | null;
  user_metadata?: Record<string, any> | null;
  app_metadata?: Record<string, any> | null;
};

export function isAdminUser(user: AdminUser | null | undefined): boolean {
  if (!user) {
    return false;
  }

  const roleValue =
    user.user_metadata?.role ??
    user.app_metadata?.role ??
    user.user_metadata?.is_admin ??
    user.app_metadata?.is_admin;

  if (typeof roleValue === "string") {
    const normalized = roleValue.trim().toLowerCase();
    if (normalized === "admin") {
      return true;
    }
  }

  if (roleValue === true || roleValue === "true") {
    return true;
  }

  const email = user.email?.trim().toLowerCase();
  if (!email) {
    return false;
  }

  const configuredAdmins = (process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return configuredAdmins.includes(email);
}
