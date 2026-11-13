export interface Branding {
  appName: string;
  /** Compact form for badges and the top bar, where the full appName won't fit. */
  shortName: string;
  tagline: string;
  logoSrc: string;
  iconSrc: string;
}

// Build-time-baked branding for the IToolbox Platform. Served through
// components/branding-provider.tsx so a runtime overlay can replace it later.
export const DEFAULT_BRANDING: Branding = {
  appName: "IToolbox Platform",
  shortName: "IToolbox",
  tagline: "One login, one dashboard, every tool.",
  logoSrc: "/icons/itoolbox-logo.png",
  iconSrc: "/icons/itoolbox-icon.svg",
};
