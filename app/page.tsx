"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getStoredAuth } from "@/lib/auth";
import { useBranding, useModuleOverrides } from "@/components/branding-provider";
import {
  AboutSection, ContactSection, MissionVisionSection, PartnersSection, ProductsSection, SiteFooter, TeamSection,
} from "@/components/landing/company-sections";
import { BANTAI_ACCURACY_NOTE, COMPANY, PRODUCTS } from "@/lib/company";
import { PLATFORM_APPS, getVisibleApps } from "@/lib/platform-apps";
import type { UserProfile } from "@itoolbox/ui/types";

/* ── In-page sections the nav links to ───────────────────────────── */
const NAV_SECTIONS = [
  { id: "products", label: "Products" },
  { id: "bantai",   label: "BantAI" },
  { id: "about",    label: "About" },
  { id: "team",     label: "Team" },
  { id: "partners", label: "Partners" },
  { id: "contact",  label: "Contact" },
];

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: "smooth" });
}

/* ── Network node background (matches login portal) ─────────────── */
function NodeNetwork({ color }: { color: string }) {
  const nodes = [
    { x: 8,  y: 12 }, { x: 28, y: 6  }, { x: 55, y: 18 }, { x: 80, y: 8  },
    { x: 92, y: 30 }, { x: 18, y: 35 }, { x: 45, y: 30 }, { x: 70, y: 42 },
    { x: 88, y: 58 }, { x: 12, y: 60 }, { x: 38, y: 55 }, { x: 62, y: 68 },
    { x: 85, y: 78 }, { x: 22, y: 80 }, { x: 50, y: 85 }, { x: 75, y: 92 },
    { x: 5,  y: 90 }, { x: 35, y: 95 }, { x: 95, y: 70 },
  ];
  const edges = [
    [0,1],[1,2],[2,3],[3,4],[5,6],[6,7],[7,8],[9,10],[10,11],[11,12],
    [13,14],[14,15],[0,5],[1,6],[2,7],[3,4],[5,9],[6,10],[7,11],[8,12],
    [9,13],[10,14],[11,15],[13,16],[14,17],[12,18],
  ];
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice" aria-hidden>
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke={color} strokeWidth="0.25" opacity="0.2"/>
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={i % 4 === 0 ? 1.2 : 0.7} fill={color}
          opacity={i % 3 === 0 ? 0.7 : 0.35}/>
      ))}
    </svg>
  );
}

/* ── Platform logo pill ───────────────────────────────────────────── */
// The IToolbox logo is a square badge, unreadable at pill height on its own,
// so the name rides beside it.
function PlatformLogo({ className = "" }: { className?: string }) {
  const branding = useBranding();
  return (
    <span className="flex items-center gap-1.5">
      <img
        src={branding.logoSrc}
        alt=""
        className={`object-contain ${className}`}
      />
      <span className="text-itoolbox-navy text-base font-black tracking-tight">{branding.shortName}</span>
    </span>
  );
}

/* ── Slide icon (image with emoji fallback) ─────────────────────── */
function SlideIcon({ icon, imgSrc, name, size = "lg" }: {
  icon: string; imgSrc?: string; name: string; size?: "sm" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const imgCls = size === "sm" ? "w-8 h-8 object-cover rounded-lg" : "w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl drop-shadow-lg";
  const emojiCls = size === "sm" ? "text-xl" : "text-5xl sm:text-6xl";
  if (!imgSrc || failed) return <span className={emojiCls}>{icon}</span>;
  return (
    <img src={imgSrc} alt={name} className={imgCls} onError={() => setFailed(true)} />
  );
}

/* ── Per-slide glow overlay classes (defined in globals.css) ─────── */
const SLIDE_GLOW_CLS: Record<string, string> = {
  account:      "slide-glow-account",
  bantai:       "slide-glow-bantai",
  autonomous:   "slide-glow-autonomous",
  intelligence: "slide-glow-intelligence",
  tracker:      "slide-glow-tracker",
  secure:       "slide-glow-secure",
  docs:         "slide-glow-docs",
};

/* ── Slide accent text classes (avoids runtime inline color styles) ─ */
const SLIDE_TEXT_CLS: Record<string, string> = {
  account:      "text-blue-500",
  bantai:       "text-orange-500",
  autonomous:   "text-green-500",
  intelligence: "text-purple-500",
  tracker:      "text-pink-500",
  secure:       "text-slate-400",
  docs:         "text-teal-400",
};

// Landing-only copy per module — name/tagline/icon/imgSrc/color/border come
// from PLATFORM_APPS (lib/platform-apps.ts), the single source of truth also
// used by the dashboard grid and the hamburger menus.
const SLIDE_EXTRAS: Record<string, { num: string; hype: string; detail: string }> = {
  account: {
    num: "01",
    hype: "Your IToolbox ID. One sign-in for BantAI and every module of the platform.",
    detail: "More than a login — a digital identity built for IToolbox. Your role decides what you can do, from reading a report to asking BantAI to managing access, all from one accessible profile.",
  },
  bantai: {
    num: "02",
    hype: "Ask BantAI. Accessible information, faster responses, the evidence behind every answer.",
    detail: "BantAI — from bantay, Filipino for “guard” — is the AI chat assistant and knowledge base at the heart of the platform, built for public- and private-sector teams. Ask in English or Filipino: it looks through your connected data and cites the records behind each claim — no answer without evidence.",
  },
  autonomous: {
    num: "03",
    hype: "From insight to action — orchestrated, automated, approved by people.",
    detail: "Intelligent workflow orchestration and automation. When something changes — a threshold crossed, a request waiting, a report due — BantAI drafts the response: tasks, notices, and schedule changes, each routed to the right person. A review step sends back anything whose evidence is thin, and nothing goes out until a person approves.",
  },
  intelligence: {
    num: "04",
    hype: "Predictive insights and automated reports — timely information, before it's needed.",
    detail: "Advanced intelligence, predictive analytics, and automated insights across every source connected to the platform. BantAI queries each one where it lives, under local governance, with nothing copied into a new warehouse.",
  },
  tracker: {
    num: "05",
    hype: "Track every engagement. Own every milestone.",
    detail: "End-to-end project management for IToolbox engagements — projects, team capacity, meeting records, and action items, from the kickoff to the final review.",
  },
  secure: {
    num: "06",
    hype: "Governed by design — every session, role, and query checked.",
    detail: "Signed sessions and role-based access across every module, plus a read-only guard between BantAI and your data: every query BantAI writes is checked before it runs, and nothing it does can change your data.",
  },
  docs: {
    num: "07",
    hype: "One place. All docs. BantAI and the platform — organized and always current.",
    detail: "The documentation hub for BantAI and the IToolbox Platform — user guides, the API reference, the architecture, and the SOPs. Admin-curated, with access by role.",
  },
};

/* ── Carousel slides — PLATFORM_APPS content + landing-only extras ── */
function buildSlides(apps: typeof PLATFORM_APPS) {
  return apps.map((app) => ({
    id: app.key,
    href: app.href,
    name: app.title,
    tagline: app.subtitle,
    icon: app.icon,
    imgSrc: app.imgSrc,
    color: app.hex,
    border: app.border,
    ...SLIDE_EXTRAS[app.key],
  }));
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { moduleContent, moduleVisibility } = useModuleOverrides();
  const SLIDES = useMemo(
    () => buildSlides(getVisibleApps(moduleContent, moduleVisibility)),
    [moduleContent, moduleVisibility]
  );
  const TICKER = useMemo(() => SLIDES.map((s) => `${s.icon} ${s.name} — ${s.tagline}`), [SLIDES]);
  const [active, setActive]         = useState(0);
  const [paused, setPaused]         = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  useEffect(() => {
    const { token, user: u } = getStoredAuth();
    setIsLoggedIn(!!token);
    setUser(u);
  }, []);

  // Clamp `active` if the slide count shrinks out from under the current index.
  useEffect(() => {
    if (active >= SLIDES.length) setActive(0);
  }, [SLIDES.length, active]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
      setProgressKey((k) => k + 1);
    }, 4500);
    return () => clearInterval(t);
  }, [paused, SLIDES.length]);

  function goTo(i: number) {
    setActive(i);
    setProgressKey((k) => k + 1);
    setPaused(false);
  }

  const slide = SLIDES[active];

  return (
    // overflow-x-clip, not -hidden: hidden makes this div a scroll container,
    // and the sticky nav would stop sticking.
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-clip">

      {/* ── Fixed node-network background — color shifts with active slide ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <NodeNetwork color={slide.color} />
        <div className={`absolute inset-0 transition-all duration-700 ${SLIDE_GLOW_CLS[slide.id] ?? ""}`}/>
      </div>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#0a0f1e]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button type="button" onClick={() => setMenuOpen((o) => !o)} aria-label="Open menu" aria-expanded={menuOpen ? "true" : "false"}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors -ml-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/>
                  )}
                </svg>
              </button>
            ) : (
              <Link href="/" aria-label="Home"
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors -ml-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                </svg>
              </Link>
            )}
            <Link href="/" className="bg-white rounded-xl px-2.5 py-1.5 overflow-hidden">
              <PlatformLogo className="h-7 w-auto" />
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            {NAV_SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} onClick={(e) => scrollToSection(e, s.id)}
                className="text-xs font-bold text-white/50 hover:text-white transition-colors">
                {s.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!isLoggedIn && (
              <Link
                href="/support"
                className="hidden sm:inline-block whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-bold bg-white/[0.07] border border-white/15 text-white/50 hover:bg-white/[0.12] hover:text-white/70 transition-colors"
              >
                🎫 Support
              </Link>
            )}
            {isLoggedIn ? (
              <>
                <Link href="/account"
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors">
                  <span className="w-6 h-6 rounded-full bg-itoolbox-red text-white flex items-center justify-center text-[10px] font-black shrink-0 overflow-hidden">
                    {(user?.full_name || "U").charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:flex flex-col leading-tight text-left">
                    <span className="text-[11px] font-bold text-white">{user?.full_name?.split(" ")[0] || "Signed in"}</span>
                    <span className="text-[9px] text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"/> Signed in
                    </span>
                  </span>
                </Link>
                <Link
                  href="/dashboard"
                  className="px-5 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase bg-itoolbox-red hover:bg-red-700 transition-colors shadow-[0_0_20px_rgba(239,63,52,0.25)]"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <Link
                href="/login?page=account"
                className="px-5 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase bg-itoolbox-red hover:bg-red-700 transition-colors shadow-[0_0_20px_rgba(239,63,52,0.25)]"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── HAMBURGER MENU DRAWER — the platform modules ── */}
      {isLoggedIn && menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60"/>
          <div onClick={(e) => e.stopPropagation()}
            className="absolute top-14 left-0 right-0 bg-[#0c1326] border-b border-white/[0.06] shadow-2xl p-3 space-y-1">
            {SLIDES.map((s) => (
              <Link key={s.id} href={s.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/5">
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <SlideIcon icon={s.icon} imgSrc={s.imgSrc} name={s.name} size="sm"/>
                </div>
                <span className="flex flex-col">
                  <span className="text-sm font-black" style={{ color: s.color }}>{s.name}</span>
                  <span className="text-white/40 text-[10px]">{s.tagline}</span>
                </span>
              </Link>
            ))}
            <div className="border-t border-white/[0.06] pt-1 mt-1">
              <Link href="/support" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/5">
                <div className="w-9 h-9 flex items-center justify-center shrink-0 text-lg">🎫</div>
                <span className="text-sm font-black text-white">Support</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO: the company ── */}
      <section className="relative max-w-4xl mx-auto px-5 pt-20 pb-14 text-center">
        <p className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.25em] uppercase text-white/60 bg-[#0a0f1e] border border-white/10 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-itoolbox-red" aria-hidden/>
          {COMPANY.name} PH · Since {COMPANY.founded}
        </p>
        <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-balance">
          Building tomorrow&apos;s <span className="text-itoolbox-red">solutions today!</span>
        </h1>
        <p className="text-sm sm:text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">{COMPANY.intro}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <a href="#products" onClick={(e) => scrollToSection(e, "products")}
            className="px-10 py-3.5 rounded-xl font-black text-sm bg-itoolbox-red hover:bg-red-700 transition-all shadow-[0_0_40px_rgba(239,63,52,0.3)] hover:shadow-[0_0_60px_rgba(239,63,52,0.5)]">
            Explore Products & Services ↓
          </a>
          <Link href={isLoggedIn ? "/dashboard" : "/login?page=account"}
            className="px-10 py-3.5 rounded-xl font-bold border border-white/20 text-white/80 hover:bg-white/5 transition-colors text-sm">
            {isLoggedIn ? "Go to Dashboard" : "Go to Platform"}
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
          {[
            { value: String(COMPANY.founded), label: "Founded" },
            { value: String(PRODUCTS.length), label: "Products & Services" },
            BANTAI_ACCURACY_NOTE,
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-[#0c1326]/80 py-4 px-2">
              <div className="text-2xl sm:text-3xl font-black text-itoolbox-red">{s.value}</div>
              <div className="text-[10px] sm:text-xs text-white/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FLAGSHIP: BantAI ── */}
      <section id="bantai" className="relative max-w-4xl mx-auto px-5 pt-16 pb-16 text-center scroll-mt-16">
        <p className="text-[11px] font-black tracking-[0.25em] uppercase text-green-400 mb-6">Our flagship · Private beta</p>
        {/* BantAI hero card */}
        <div className="animate-float mb-8">
          <div className="rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10 mx-auto max-w-md">
            <img
              src="/icons/bantai.jpg"
              alt="BantAI"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-5xl sm:text-7xl font-black leading-none tracking-tight mb-6">
          <span className="text-itoolbox-red">BantAI</span>
          <br />
          {/* A long line at the 7xl of "BantAI" fills three lines and pushes the CTAs below the fold. */}
          <span className="block mt-3 text-3xl sm:text-5xl text-balance text-green-500">Your AI Knowledge Base and Conversational Agent</span>
        </h2>

        <p className="text-sm sm:text-base text-white/50 mb-10 tracking-widest font-medium uppercase">
          Accessible Information · Faster Responses · More Meaningful Conversations
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href={isLoggedIn ? "/bantai" : "/login?page=bantai"}
            className="px-10 py-3.5 rounded-xl font-black text-sm bg-itoolbox-red hover:bg-red-700 transition-all shadow-[0_0_40px_rgba(239,63,52,0.3)] hover:shadow-[0_0_60px_rgba(239,63,52,0.5)]"
          >
            Ask BantAI
          </Link>
          <button
            type="button"
            onClick={() => document.getElementById("ecosystem")?.scrollIntoView({ behavior: "smooth" })}
            className="px-10 py-3.5 rounded-xl font-bold border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-colors text-sm"
          >
            Explore Ecosystem ↓
          </button>
        </div>

      </section>

      {/* ── TICKER ── */}
      <div className="border-y border-white/[0.05] bg-white/[0.015] py-2.5 overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap gap-14">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="text-xs text-white/20 font-mono shrink-0">{item}</span>
          ))}
        </div>
      </div>

      {/* ── CAROUSEL ── */}
      <section id="ecosystem" className="max-w-6xl mx-auto px-5 py-20">
        {/* Slide */}
        <div
          className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0c1326] cursor-default"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >

          <div className="relative z-10 p-8 sm:p-14 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 sm:gap-14 items-center min-h-[280px] sm:min-h-[240px]">
            {/* Icon */}
            <div className="flex justify-center sm:justify-start">
              <div
                className="flex items-center justify-center w-28 h-28 rounded-2xl bg-[#0a0f1e]"
                style={{ border: `1px solid ${slide.color}30` }}
              >
                <SlideIcon icon={slide.icon} imgSrc={slide.imgSrc} name={slide.name}/>
              </div>
            </div>

            {/* Text */}
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-3 mb-3 justify-center sm:justify-start">
                <span className="text-[10px] font-black tracking-[0.2em] text-white/20">{slide.num} / 07</span>
                <div className="h-px w-14" style={{ background: slide.color, opacity: 0.4 }}/>
              </div>
              <h3 className="text-4xl sm:text-5xl font-black leading-none mb-2" style={{ color: slide.color }}>
                {slide.name}
              </h3>
              <p className="text-white/35 text-xs font-bold mb-3 uppercase tracking-widest">{slide.tagline}</p>
              <p className="text-white/90 text-lg sm:text-xl font-semibold leading-snug mb-2">{slide.hype}</p>
              <p className="text-white/40 text-sm leading-relaxed max-w-md mb-5">{slide.detail}</p>
              <Link href={
                slide.id === "docs" ? "/docs" :
                isLoggedIn ? slide.href :
                `/login?page=${slide.id}`
              }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black border transition-all hover:scale-105"
                style={{ color: slide.color, borderColor: `${slide.color}50`, background: `${slide.color}12` }}>
                Explore {slide.name} ↗
              </Link>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
            <div
              key={progressKey}
              className="h-full"
              style={{ background: slide.color, animation: paused ? "none" : "slideProgress 4.5s linear forwards" }}
            />
          </div>
        </div>

        {/* Dot nav */}
        <div className="flex gap-2.5 justify-center mt-5">
          {SLIDES.map((s, i) => (
            <button key={s.id} type="button" onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300 focus:outline-none"
              style={{ width: active === i ? "28px" : "8px", height: "8px",
                background: active === i ? s.color : "rgba(255,255,255,0.12)",
                boxShadow: active === i ? `0 0 10px ${s.color}` : "none" }}
              aria-label={s.name}/>
          ))}
        </div>

        {/* Mini cards */}
        <div className="grid grid-cols-8 gap-2 mt-4">
          {SLIDES.map((s, i) => (
            <div key={s.id} className="relative group">
              <button type="button" onClick={() => goTo(i)}
                className={`w-full rounded-xl p-3 text-center transition-all duration-300 border ${
                  active === i ? s.border + " bg-white/[0.06]" : "border-white/[0.04] hover:bg-white/[0.05]"
                }`}>
                <div className="flex justify-center mb-1 h-8 items-center">
                  <SlideIcon icon={s.icon} imgSrc={s.imgSrc} name={s.name} size="sm" />
                </div>
                <div className="text-[9px] font-bold text-white/25 leading-tight hidden sm:block">{s.name}</div>
              </button>
              {/* Hover tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-[#0c1326] border border-white/10 rounded-xl p-3 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-2xl">
                <div className={`text-xs font-black mb-0.5 ${SLIDE_TEXT_CLS[s.id] ?? "text-white"}`}>{s.name}</div>
                <div className="text-[10px] text-white/50 leading-relaxed">{s.hype}</div>
                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0c1326] border-r border-b border-white/10 rotate-45"/>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE COMPANY: content from lib/company.ts ── */}
      <ProductsSection/>
      <AboutSection/>
      <MissionVisionSection/>
      <TeamSection/>
      <PartnersSection/>
      <ContactSection/>

      <SiteFooter isLoggedIn={isLoggedIn}/>

      <style>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
