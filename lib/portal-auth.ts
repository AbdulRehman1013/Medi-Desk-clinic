export type PortalRole = "admin" | "doctor" | "patient";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Exclude<PortalRole, "admin">;
  linkedDoctorId?: string;
  phone?: string;
};

export type PortalSession = {
  name: string;
  email: string;
  role: PortalRole;
  linkedDoctorId?: string;
  phone?: string;
};

export const PORTAL_USERS_KEY = "medidesk-portal-users";
export const PORTAL_SESSION_KEY = "medidesk-portal-session";

export function readStoredUsers() {
  if (typeof window === "undefined") {
    return [] as StoredUser[];
  }

  const raw = window.localStorage.getItem(PORTAL_USERS_KEY);
  if (!raw) {
    return [] as StoredUser[];
  }

  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [] as StoredUser[];
  }
}

export function writeStoredUsers(users: StoredUser[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PORTAL_USERS_KEY, JSON.stringify(users));
}

export function readPortalSession() {
  if (typeof window === "undefined") {
    return null as PortalSession | null;
  }

  const raw = window.localStorage.getItem(PORTAL_SESSION_KEY);
  if (!raw) {
    return null as PortalSession | null;
  }

  try {
    return JSON.parse(raw) as PortalSession;
  } catch {
    return null as PortalSession | null;
  }
}

export function writePortalSession(session: PortalSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PORTAL_SESSION_KEY, JSON.stringify(session));
}

export function clearPortalSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PORTAL_SESSION_KEY);
}

export function roleDashboardPath(role: PortalRole) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "doctor":
      return "/doctor/dashboard";
    default:
      return "/patient/dashboard";
  }
}
