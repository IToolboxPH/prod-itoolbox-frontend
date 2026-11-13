// A small corner label on every page of a non-production build, so staging can't
// be mistaken for production. NEXT_PUBLIC_APP_ENV is baked in at build time (from
// compose.yaml's APP_ENV). Unset, or "production", it renders nothing.

const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV;

export function EnvBanner() {
  if (!APP_ENV || APP_ENV === "production") return null;
  return (
    <div
      role="status"
      aria-label={`${APP_ENV} environment`}
      className="pointer-events-none fixed bottom-2 left-2 z-[9999] rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-black shadow-lg"
    >
      {APP_ENV}
    </div>
  );
}
