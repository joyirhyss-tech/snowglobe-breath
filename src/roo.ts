// Roo Reporter init — wires the feedback button into Hush.
//
// IMPORTANT: Roo's canonical design uses a Supabase client with RLS-gated
// inserts (the `aeq_feedback` table requires an authenticated user). Hush
// is a consumer App Store app with no auth and no Supabase yet, so we
// install Roo with a *stub adapter* that captures feedback to localStorage
// for now. The button is visible, the UX completes end-to-end, but no
// network round-trip happens.
//
// **Before public App Store launch, do one of:**
//   (a) Wire a real Supabase client + add anonymous-insert RLS policy on
//       `aeq_feedback`, then replace `STUB_SUPABASE` with the real client.
//   (b) Hide Roo entirely on production builds and use it only for internal
//       beta testing (TestFlight) by gating on an env flag.
//
// See public/roo/roo.js for the Roo internals.

const ROO_LOCALSTORAGE_KEY = 'hush.roo.pendingFeedback';

// Stub Supabase client — captures Roo submissions locally so the UX works
// end-to-end during development. Replace with a real `@supabase/supabase-js`
// client (and run roo-reporter/supabase-schema.sql) before launch.
const STUB_SUPABASE = {
  from: (_table: string) => ({
    insert: async (payload: Record<string, unknown>) => {
      try {
        const existing = JSON.parse(localStorage.getItem(ROO_LOCALSTORAGE_KEY) || '[]');
        existing.push({ ...payload, _captured_at: new Date().toISOString() });
        localStorage.setItem(ROO_LOCALSTORAGE_KEY, JSON.stringify(existing));
        // eslint-disable-next-line no-console
        console.info('[Roo] Captured locally (Supabase not wired):', payload);
        return { error: null };
      } catch (err) {
        return { error: err };
      }
    },
  }),
  auth: {
    getSession: async () => ({ data: { session: null } }),
  },
};

declare global {
  interface Window {
    RooReporter?: {
      init: (opts: {
        supabase: unknown;
        appName: string;
        assetsPath?: string;
        getUser?: () => Promise<{ email: string; id: string | null }>;
        getPageContext?: () => string;
      }) => void;
    };
  }
}

let initialized = false;

export function initRoo() {
  if (initialized) return;
  if (typeof window === 'undefined' || !window.RooReporter) {
    // Script tag in index.html may not have loaded yet — retry shortly.
    setTimeout(initRoo, 100);
    return;
  }
  window.RooReporter.init({
    supabase: STUB_SUPABASE,
    appName: 'hush',
    assetsPath: '/roo/',
    // Anonymous user — Hush has no auth.
    getUser: async () => ({ email: 'anonymous', id: null }),
    // Page context: which mode is active (read from localStorage where Hush
    // persists it). Falls back to pathname.
    getPageContext: () => {
      try {
        return localStorage.getItem('hush.mode') || window.location.pathname;
      } catch {
        return window.location.pathname;
      }
    },
  });
  initialized = true;
}

// Note: the floating Roo button is hidden via index.html CSS. The Roo
// modal is opened from inside the Settings panel via window.RooReporter
// .open() — see src/ui/ThemePicker.tsx (RooRow component).
