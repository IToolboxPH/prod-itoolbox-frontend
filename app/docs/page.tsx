"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredAuth, logout } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";
import { useBranding } from "@/components/branding-provider";
import { isAdmin, roleLabel as roleLabelOf } from "@/lib/platform-apps";
import type { UserProfile } from "@itoolbox/ui/types";

const SECTIONS = [
  {
    icon: "🚀",
    title: "Getting Started",
    color: "text-teal-600 dark:text-teal-400",
    border: "border-teal-400/40 dark:border-teal-500/30",
    bg: "bg-teal-50 dark:bg-teal-500/10",
    docs: [
      { title: "Platform Overview",    desc: "The IToolbox Platform and its seven modules, with BantAI at the centre.",                 tag: "Guide"     },
      { title: "Onboarding Checklist", desc: "Getting an account, signing in, and asking BantAI your first question.",                 tag: "Guide"     },
      { title: "Roles & Access",       desc: "What viewers, analysts, admins, and super admins can do, and how to request access.",    tag: "Reference" },
      { title: "Your IToolbox ID",     desc: "Your account profile, your role, and changing your password.",                          tag: "Guide"     },
    ],
  },
  {
    icon: "💬",
    title: "BantAI",
    color: "text-orange-600 dark:text-orange-400",
    border: "border-orange-400/40 dark:border-orange-500/30",
    bg: "bg-orange-50 dark:bg-orange-500/10",
    docs: [
      { title: "What BantAI Can Do",       desc: "Capabilities, limits, and how to phrase a good question.",                                        tag: "Guide"     },
      { title: "Reading an Investigation", desc: "The trail, the evidence tables, and how each E1-style citation links an answer to its rows.",      tag: "Guide"     },
      { title: "Choosing a Model",         desc: "Nemotron, Meterless, GPT, Grok, or Claude — when to use each.",                               tag: "Reference" },
      { title: "Agent API",                desc: "POST /api/v1/agent/ask streams an investigation as server-sent events.",                         tag: "API"       },
    ],
  },
  {
    icon: "📡",
    title: "Workflow Automation",
    color: "text-green-600 dark:text-green-400",
    border: "border-green-400/40 dark:border-green-500/30",
    bg: "bg-green-50 dark:bg-green-500/10",
    docs: [
      { title: "How a Workflow Runs", desc: "Trigger, plan, query, draft, review, approve: one run from start to approved plan.", tag: "Planned" },
      { title: "The Review Step",     desc: "How a second check rejects thin evidence and asks for more data.",                   tag: "Planned" },
      { title: "Approving Actions",   desc: "Approve, edit, or reject each action — nothing goes out without a person.",          tag: "Planned" },
    ],
  },
  {
    icon: "🤖",
    title: "BantAI Strategic Intelligence",
    color: "text-purple-600 dark:text-purple-400",
    border: "border-purple-400/40 dark:border-purple-500/30",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    docs: [
      { title: "Data Sources",   desc: "Browsing what BantAI can see: sources, tables, and columns.",                     tag: "Guide"     },
      { title: "The Data Plan",  desc: "Which sources are connected today and which come next.",                          tag: "Reference" },
      { title: "The Data Layer", desc: "How queries reach each source in place, with nothing copied into a warehouse.",   tag: "Reference" },
      { title: "Data API",       desc: "/api/v1/harness/*: status, sources, tables, columns, and read-only queries.",     tag: "API"       },
    ],
  },
  {
    icon: "🔒",
    title: "Security Settings",
    color: "text-slate-600 dark:text-slate-400",
    border: "border-slate-400/40 dark:border-slate-500/30",
    bg: "bg-slate-100 dark:bg-slate-500/10",
    docs: [
      { title: "Role Model",     desc: "Four roles — super admin, admin, analyst, viewer — enforced by the API on every route.", tag: "Reference" },
      { title: "Managing Users", desc: "Creating accounts, changing roles, and deactivating users.",                             tag: "Guide"     },
      { title: "The SQL Guard",  desc: "Why every query the agent writes is checked as read-only before it runs.",               tag: "Reference" },
      { title: "Admin API",      desc: "/api/v1/admin/users: list, create, and update accounts.",                                 tag: "API"       },
    ],
  },
  {
    icon: "📋",
    title: "SOPs",
    color: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-400/40 dark:border-emerald-500/30",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    docs: [
      { title: "Incident Response SOP",       desc: "The team's checklist from the first alert to the post-incident review.",                          tag: "Reference" },
      { title: "Business Continuity Hand-off", desc: "How BantAI's findings fit a company's continuity plan.",                                         tag: "Reference" },
      { title: "Advisories & Authority",      desc: "BantAI supports decisions; for weather, disaster, and life-safety calls, official advisories stay the authority.", tag: "Reference" },
    ],
  },
  {
    icon: "📊",
    title: "Project Management",
    color: "text-pink-600 dark:text-pink-400",
    border: "border-pink-400/40 dark:border-pink-500/30",
    bg: "bg-pink-50 dark:bg-pink-500/10",
    docs: [
      { title: "Project Setup Guide",       desc: "Creating a project, assigning milestones, and setting team capacity.", tag: "Planned" },
      { title: "Meeting Records & Actions", desc: "Logging meeting minutes and tracking action items to completion.",     tag: "Planned" },
    ],
  },
  {
    icon: "⚙️",
    title: "Platform & Infrastructure",
    color: "text-gray-600 dark:text-gray-400",
    border: "border-gray-300 dark:border-gray-500/30",
    bg: "bg-gray-100 dark:bg-gray-500/10",
    docs: [
      { title: "Tech Stack Overview",          desc: "Next.js 15 static export, FastAPI, Postgres, the data layer, and the model providers.", tag: "Reference" },
      { title: "Environment Variables",        desc: "NEXT_PUBLIC_* values for the web client; every secret stays in itoolbox-backend.",     tag: "Reference" },
      { title: "Local & Tailscale Deployment", desc: "Running the stack in Docker and sharing it with teammates over Tailscale.",            tag: "Guide"     },
      { title: "Backend API Reference",        desc: "Full REST index: auth, admin, harness, and agent routes.",                             tag: "API"       },
    ],
  },
];

const TAG_LIGHT: Record<string, string> = {
  Guide:     "text-teal-700 border-teal-400/50 bg-teal-50",
  Reference: "text-blue-700 border-blue-400/50 bg-blue-50",
  API:       "text-purple-700 border-purple-400/50 bg-purple-50",
  Planned:   "text-gray-400 border-gray-200 bg-gray-50",
};
const TAG_DARK: Record<string, string> = {
  Guide:     "text-teal-400 border-teal-500/30 bg-teal-500/10",
  Reference: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  API:       "text-purple-400 border-purple-500/30 bg-purple-500/10",
  Planned:   "text-white/30 border-white/10 bg-white/[0.03]",
};

type AuthState = "loading" | "unauthenticated" | "unauthorized" | "authorized";

export default function DocsPage() {
  const { dark } = useTheme();
  const branding = useBranding();
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [user, setUser]           = useState<UserProfile | null>(null);
  const [search, setSearch]       = useState("");
  const [active, setActive]       = useState<string | null>(null);

  useEffect(() => {
    const { token, user: u } = getStoredAuth();
    if (!token) { setAuthState("unauthenticated"); return; }
    setUser(u);
    setAuthState(isAdmin(u) ? "authorized" : "unauthorized");
  }, []);

  /* ── Theme tokens ── */
  const bg    = "bg-gray-50 dark:bg-[#070b14]";
  const navBg = "bg-white/90 dark:bg-[#0a0f1e]/95 border-gray-200 dark:border-white/[0.06]";
  const card  = "bg-white dark:bg-white/[0.03] border-gray-200 dark:border-white/[0.07]";
  const sub   = "text-gray-500 dark:text-white/40";
  const head  = "text-gray-900 dark:text-white";

  /* ── Shared nav ── */
  const Nav = ({ showUser }: { showUser: boolean }) => (
    <nav className={`sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md ${navBg}`}>
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-white rounded-md px-1.5 py-0.5 overflow-hidden flex items-center gap-1.5">
            <img src={branding.logoSrc} alt="" className="h-5 w-auto object-contain"/>
            <span className="text-itoolbox-navy text-xs font-black tracking-tight">{branding.shortName}</span>
          </div>
          <span className={`text-xs hidden sm:block ${sub}`}>{branding.appName}</span>
        </Link>
        <span className={`text-xs ${sub}`}>/</span>
        <span className={`text-xs font-bold ${sub}`}>📚 Docs</span>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/support"
          className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${navBg} hover:bg-gray-50 dark:hover:bg-white/10 ${sub}`}>
          🎫 Support
        </Link>
        {showUser && user && (
          <button type="button" onClick={() => logout()} className="text-xs text-gray-400 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition-colors">Sign out</button>
        )}
        <Link href={showUser ? "/dashboard" : "/login?page=account"}
          className="px-3 py-1.5 text-[11px] font-bold text-white bg-itoolbox-red hover:bg-red-700 rounded-lg transition-colors">
          {showUser ? "← Dashboard" : "Sign In"}
        </Link>
      </div>
    </nav>
  );

  /* ── Unauthenticated gate ── */
  if (authState === "unauthenticated") {
    return (
      <div className={`min-h-screen ${bg} text-gray-900 dark:text-white transition-colors duration-200`}>
        <Nav showUser={false}/>
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border-2 border-teal-400/40 dark:border-teal-500/30 flex items-center justify-center mx-auto text-4xl mb-6">
            🔐
          </div>
          <div className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-teal-600 dark:text-teal-400 border border-teal-400/40 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 rounded-full px-3 py-1 mb-4">
            Protected Content
          </div>
          <h1 className="text-2xl font-black mb-3">Sign in to access Docs</h1>
          <p className={`text-sm leading-relaxed mb-2 ${sub}`}>
            The {branding.shortName} Docs Hub holds user guides, API references, architecture documentation, and SOPs for BantAI and all seven platform modules.
          </p>
          <p className={`text-sm leading-relaxed mb-8 ${sub}`}>
            This content is <span className="font-bold text-teal-600 dark:text-teal-400">admin-curated and access-controlled</span>. You must sign in with an authorized account to continue.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login?page=account"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white bg-itoolbox-red hover:bg-red-700 transition-colors shadow-[0_0_20px_rgba(239,63,52,0.2)]">
              Sign In to Continue →
            </Link>
            <Link href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-gray-500 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors">
              ← Back to Home
            </Link>
          </div>
          <p className={`text-xs mt-8 ${sub}`}>
            Don&apos;t have an account? Ask your administrator to create one, then request documentation access.
          </p>
        </div>
      </div>
    );
  }

  /* ── Unauthorized gate (logged in, not admin) ── */
  if (authState === "unauthorized") {
    return (
      <div className={`min-h-screen ${bg} text-gray-900 dark:text-white transition-colors duration-200`}>
        <Nav showUser={true}/>
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-400/40 dark:border-amber-500/30 flex items-center justify-center mx-auto text-4xl mb-6">
            🔒
          </div>
          <div className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-amber-600 dark:text-amber-400 border border-amber-400/40 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 rounded-full px-3 py-1 mb-4">
            Access Restricted
          </div>
          <h1 className="text-2xl font-black mb-3">Docs is admin-only for now</h1>
          <p className={`text-sm leading-relaxed mb-2 ${sub}`}>
            Hi <span className="font-bold text-gray-700 dark:text-white/80">{user?.full_name || "there"}</span> — your account doesn&apos;t currently have access to the Documentation hub.
          </p>
          <p className={`text-sm leading-relaxed mb-8 ${sub}`}>
            Access is currently limited to admins. Contact your {branding.shortName} administrator to request access.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/support"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white bg-itoolbox-red hover:bg-red-700 transition-colors">
              🎫 Request Access via Support
            </Link>
            <Link href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-gray-500 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (authState === "loading" || !user) return null;

  /* ── Authorized view ── */
  const roleLabel = roleLabelOf(user.global_role);
  const tagStyles = dark ? TAG_DARK : TAG_LIGHT;

  const q = search.toLowerCase().trim();
  const filtered = SECTIONS.map((s) => ({
    ...s,
    docs: s.docs.filter(
      (d) => !q || d.title.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || s.title.toLowerCase().includes(q) || d.tag.toLowerCase() === q
    ),
  })).filter((s) => s.docs.length > 0);

  return (
    <div className={`min-h-screen ${bg} text-gray-900 dark:text-white transition-colors duration-200`}>
      <Nav showUser={true}/>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-teal-600 dark:text-teal-400 border border-teal-400/40 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 rounded-full px-3 py-1 mb-3">
            {roleLabel} Access · Admin-Curated
          </div>
          <h1 className={`text-3xl font-black mb-2 ${head}`}>Docs</h1>
          <p className={`text-sm max-w-2xl ${sub}`}>
            Centralized repository for{" "}
            <span className="text-teal-600 dark:text-teal-400 font-bold">User Guides</span>,{" "}
            <span className="text-teal-600 dark:text-teal-400 font-bold">API Reference</span>,{" "}
            <span className="text-teal-600 dark:text-teal-400 font-bold">Platform Architecture</span>,
            {" "}and <span className="text-teal-600 dark:text-teal-400 font-bold">SOPs</span> — covering BantAI and all seven modules.
          </p>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
            <input type="text" value={search}
              onChange={(e) => { setSearch(e.target.value); setActive(null); }}
              placeholder="Search documentation…" aria-label="Search documentation"
              className="w-full bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-teal-400 dark:focus:border-teal-500/40 focus:bg-white dark:focus:bg-white/[0.06] transition-colors"/>
          </div>
          <div className="flex gap-2 shrink-0">
            {["Guide", "API", "Reference"].map((tag) => (
              <button key={tag} type="button" onClick={() => setSearch(tag === search ? "" : tag)}
                className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all ${search === tag ? tagStyles[tag] : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60"}`}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Sections", value: SECTIONS.length },
            { label: "Docs",     value: SECTIONS.reduce((n, s) => n + s.docs.length, 0) },
            { label: "Guides",   value: SECTIONS.reduce((n, s) => n + s.docs.filter(d => d.tag === "Guide").length, 0) },
            { label: "API Refs", value: SECTIONS.reduce((n, s) => n + s.docs.filter(d => d.tag === "API").length, 0) },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-4 text-center ${card}`}>
              <p className={`text-2xl font-black ${head}`}>{s.value}</p>
              <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${sub}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {filtered.map((section) => (
            <div key={section.title}>
              <button type="button"
                onClick={() => setActive(active === section.title ? null : section.title)}
                className="w-full flex items-center gap-3 mb-4 group text-left">
                <span className="text-xl">{section.icon}</span>
                <h2 className={`text-base font-black ${section.color} group-hover:opacity-80 transition-opacity`}>{section.title}</h2>
                <div className={`flex-1 h-px border-t ${section.border}`}/>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${section.color} shrink-0`}>
                  {section.docs.length} docs
                </span>
                <svg className={`w-4 h-4 ${section.color} transition-transform ${active === section.title ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                </svg>
              </button>

              {(q || active === null || active === section.title) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {section.docs.map((doc) => (
                    <div key={doc.title} className={`rounded-2xl border p-4 flex flex-col gap-2 transition-all cursor-default ${section.border} ${section.bg}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-bold leading-snug ${head}`}>{doc.title}</p>
                        <span className={`text-[8px] font-black tracking-widest uppercase rounded-full px-1.5 py-0.5 border shrink-0 ${tagStyles[doc.tag] ?? tagStyles["Reference"]}`}>
                          {doc.tag}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed flex-1 ${sub}`}>{doc.desc}</p>
                      <span className={`text-[10px] font-bold mt-auto ${sub}`}>
                        {doc.tag === "Planned" ? "🚧 Coming soon" : "📄 Draft · Full content coming"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className={`text-sm ${sub}`}>No docs match &ldquo;<span className="font-bold text-gray-700 dark:text-white/60">{search}</span>&rdquo;</p>
              <button type="button" onClick={() => setSearch("")} className="mt-3 text-xs text-teal-600 dark:text-teal-400 hover:underline">Clear search</button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className={`text-xs ${sub}`}>Documentation is admin-curated. Full content is being authored.</p>
            <p className={`text-xs mt-0.5 ${sub}`}>
              To grant doc access, manage roles in{" "}
              <Link href="/security-settings" className="text-teal-600 dark:text-teal-400 hover:underline">Security Settings</Link>.
            </p>
          </div>
          <Link href="/dashboard" className={`text-xs font-bold hover:text-gray-900 dark:hover:text-white transition-colors shrink-0 ${sub}`}>
            ← Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
