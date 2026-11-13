import type { UserProfile } from "@itoolbox/ui/types";
import { AUTONOMOUS_SUBPAGES, INTELLIGENCE_SUBPAGES, SECURE_SUBPAGES, TRACKER_SUBPAGES, type SubPage } from "@/lib/nav";

export interface PlatformApp {
  key: string;
  adminOnly: boolean;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  gradient: string;
  border: string;
  accent: string;
  bg: string;
  /** Hex equivalent of `accent`/`gradient`, for contexts (inline styles, SVG) where Tailwind classes don't apply. */
  hex: string;
  icon: string;
  imgSrc?: string;
  href: string;
  subPages: SubPage[];
}

// Single source of truth for the platform's module list — used by the landing
// carousel, ticker and hamburger, the dashboard cards, and the account menu, so
// order, wording, and icons can't drift apart between pages.
export const PLATFORM_APPS: PlatformApp[] = [
  {
    key: "account",
    adminOnly: false,
    badge: "",
    title: "Account Profile",
    subtitle: "A Smart Digital Identity — Secure, Scalable, and Built for IToolbox.",
    desc: "One IToolbox identity for BantAI and every platform module — your role, your access, and your sign-in in a single card.",
    gradient: "from-blue-600 to-blue-800",
    border: "border-blue-500/30",
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    hex: "#3b82f6",
    icon: "🪪",
    href: "/account",
    subPages: [],
  },
  {
    key: "bantai",
    adminOnly: false,
    badge: "",
    title: "BantAI — AI Knowledge Base & Conversational Agent",
    subtitle: "Empower Teams with AI-Driven Insights to Accelerate Response Times.",
    desc: "BantAI is IToolbox's AI chat assistant. Ask it a question in English or Filipino: it looks through your connected data and answers with the evidence behind each claim.",
    gradient: "from-orange-600 to-orange-800",
    border: "border-orange-500/30",
    accent: "text-orange-400",
    bg: "bg-orange-500/10",
    hex: "#f97316",
    icon: "💬",
    imgSrc: "/icons/bantai.jpg",
    href: "/bantai",
    subPages: [],
  },
  {
    key: "autonomous",
    adminOnly: false,
    badge: "",
    title: "BantAI Intelligent Workflow Automation",
    subtitle: "Intelligent Workflow Orchestration and Automation.",
    desc: "When something changes — a threshold crossed, a request waiting, a report due — BantAI orchestrates the team's response: it drafts the tasks and notices, routes each to the right person, and nothing goes out until a person approves.",
    gradient: "from-green-600 to-green-800",
    border: "border-green-500/30",
    accent: "text-green-400",
    bg: "bg-green-500/10",
    hex: "#22c55e",
    icon: "📡",
    href: "/autonomous",
    subPages: AUTONOMOUS_SUBPAGES,
  },
  {
    key: "intelligence",
    adminOnly: false,
    badge: "",
    title: "BantAI Strategic Intelligence",
    subtitle: "Predictive Insights and Automated Reports.",
    desc: "Advanced intelligence, predictive analytics, and automated insights across every source connected to the platform, queried where it lives, with nothing copied into a new warehouse.",
    gradient: "from-purple-600 to-purple-800",
    border: "border-purple-500/30",
    accent: "text-purple-400",
    bg: "bg-purple-500/10",
    hex: "#a855f7",
    icon: "🤖",
    href: "/intelligence",
    subPages: INTELLIGENCE_SUBPAGES,
  },
  {
    key: "tracker",
    adminOnly: false,
    badge: "",
    title: "Project Management",
    subtitle: "Seamless Project Management.",
    desc: "End-to-end project management for IToolbox engagements — projects, team capacity, meetings, and action items.",
    gradient: "from-pink-600 to-pink-800",
    border: "border-pink-500/30",
    accent: "text-pink-400",
    bg: "bg-pink-500/10",
    hex: "#ec4899",
    icon: "📊",
    href: "/tracker",
    subPages: TRACKER_SUBPAGES,
  },
  {
    key: "secure",
    adminOnly: true,
    badge: "",
    title: "Security Settings",
    subtitle: "Enterprise‑Grade Security and Governance, End‑to‑End.",
    desc: "Role-based access, signed sessions, and a read-only guard between BantAI and your data — every query BantAI writes is checked before it runs.",
    gradient: "from-slate-600 to-slate-800",
    border: "border-slate-500/30",
    accent: "text-slate-400",
    bg: "bg-slate-500/10",
    hex: "#94a3b8",
    icon: "🔒",
    href: "/security-settings",
    subPages: SECURE_SUBPAGES,
  },
  {
    key: "docs",
    adminOnly: true,
    badge: "",
    title: "Docs",
    subtitle: "Comprehensive Documentation and Knowledge Base for Scalable Platforms.",
    desc: "User guides, API reference, and architecture for BantAI and the IToolbox Platform.",
    gradient: "from-teal-600 to-teal-800",
    border: "border-teal-500/30",
    accent: "text-teal-400",
    bg: "bg-teal-500/10",
    hex: "#14b8a6",
    icon: "📚",
    href: "/docs",
    subPages: [
      { label: "User Guides",   href: "/docs" },
      { label: "API Reference", href: "/docs" },
      { label: "Architecture",  href: "/docs" },
      { label: "SOPs",          href: "/docs" },
    ],
  },
];

/** Per-module overrides layered on PLATFORM_APPS (see components/branding-provider.tsx). */
export interface ModuleContentOverride {
  name?: string;
  tagline?: string;
  desc?: string;
  hex?: string;
}

function withOverride(app: PlatformApp, override?: ModuleContentOverride): PlatformApp {
  if (!override) return app;
  return {
    ...app,
    title: override.name ?? app.title,
    subtitle: override.tagline ?? app.subtitle,
    desc: override.desc ?? app.desc,
    hex: override.hex ?? app.hex,
  };
}

/**
 * PLATFORM_APPS with content overrides applied and hidden modules removed —
 * no role filtering, so it's safe for logged-out surfaces like the landing
 * page carousel.
 */
export function getVisibleApps(
  moduleContent: Record<string, ModuleContentOverride> = {},
  moduleVisibility: Record<string, boolean> = {}
): PlatformApp[] {
  return PLATFORM_APPS
    .filter((app) => moduleVisibility[app.key] !== false)
    .map((app) => withOverride(app, moduleContent[app.key]));
}

/** Admin-only modules need an admin; every other module is open to any signed-in user. */
export function canAccessApp(app: PlatformApp, user: UserProfile | null): boolean {
  if (!user) return false;
  if (app.adminOnly) return isAdmin(user);
  return true;
}

export function isAdmin(user: UserProfile | null): boolean {
  return user?.global_role === "super_admin" || user?.global_role === "admin";
}

export function roleLabel(role: string | undefined): string {
  switch (role) {
    case "super_admin": return "Super Admin";
    case "admin":       return "Admin";
    case "analyst":     return "Analyst";
    default:            return "Viewer";
  }
}
