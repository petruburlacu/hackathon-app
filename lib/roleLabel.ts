export type Role = "dev" | "non-dev" | "admin";

const LABELS: Record<Role, string> = {
  dev: "💻 Developer",
  "non-dev": "🎨 Non-Developer",
  admin: "🚨 Admin",
};

const BADGE_CLASSES: Record<Role, string> = {
  dev: "bg-blue-500",
  "non-dev": "bg-pink-500",
  admin: "bg-red-500",
};

export function roleLabel(role: Role) {
  return LABELS[role];
}

export function roleBadgeClass(role: Role) {
  return BADGE_CLASSES[role];
}
