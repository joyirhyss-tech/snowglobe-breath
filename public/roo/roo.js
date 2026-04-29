/* ============================================================
   ROO REPORTER — JS
   Framework-agnostic. Works with any app that has a Supabase client.
   ------------------------------------------------------------
   Usage:
     1. Include roo.css + roo.html + this script.
     2. Call RooReporter.init({ supabase, appName, getUser }) once after page load.
   ------------------------------------------------------------ */

(function (global) {
  const RooReporter = {
    _cfg: null,

    /**
     * Initialize Roo.
     * @param {Object} opts
     * @param {Object} opts.supabase  - Initialized Supabase client (required)
     * @param {string} opts.appName   - Unique identifier for the app reporting in (required, e.g. "reach-dashboard")
     * @param {Function} [opts.getUser] - Optional async function returning { email, id } of current user
     * @param {string} [opts.tableName] - Supabase table name (default: "aeq_feedback")
     * @param {Function} [opts.getPageContext] - Optional function returning a string describing current page/tab
     * @param {Function} [opts.onSent] - Optional callback after successful send
     * @param {string} [opts.assetsPath] - Override default "/assets/" if assets live elsewhere
     */
    init(opts) {
      if (!opts || !opts.supabase || !opts.appName) {
        console.error("[Roo] init requires { supabase, appName }");
        return;
      }
      this._cfg = Object.assign({
        tableName: "aeq_feedback",
        getUser: async () => {
          const { data: { session } } = await opts.supabase.auth.getSession();
          return { email: session?.user?.email || "anonymous", id: session?.user?.id || null };
        },
        getPageContext: () => {
          const active = document.querySelector('.tab-btn.active, [data-active-tab="true"]');
          return active?.dataset?.tab || active?.textContent?.trim() || window.location.pathname;
        },
        onSent: null,
      }, opts);

      // Rewrite asset paths if user provided custom base
      if (opts.assetsPath) {
        document.querySelectorAll("#roo-btn img, #roo-modal img").forEach(img => {
          const name = img.src.split("/").pop();
          img.src = opts.assetsPath.replace(/\/?$/, "/") + name;
        });
      }

      this._wire();
    },

    _wire() {
      const btn     = document.getElementById("roo-btn");
      const modal   = document.getElementById("roo-modal");
      const close   = document.querySelectorAll("[data-roo-close]");
      const typeBtns = document.querySelectorAll("[data-roo-type]");
      const sendBtn = document.getElementById("roo-send");
      const msgEl   = document.getElementById("roo-message");

      if (!btn || !modal || !sendBtn || !msgEl) {
        console.error("[Roo] HTML snippet not found. Include roo.html before calling init.");
        return;
      }

      this._type = "bug";

      btn.addEventListener("click", () => this._open());
      close.forEach(el => el.addEventListener("click", () => this._close()));
      modal.addEventListener("click", (e) => { if (e.target === modal) this._close(); });

      typeBtns.forEach(b => {
        b.addEventListener("click", () => {
          this._type = b.dataset.rooType;
          typeBtns.forEach(x => x.classList.toggle("roo-active", x === b));
        });
      });

      sendBtn.addEventListener("click", () => this._send());

      // Esc to close
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("roo-open")) this._close();
      });
    },

    _open() {
      const modal = document.getElementById("roo-modal");
      modal.classList.add("roo-open");
      modal.setAttribute("aria-hidden", "false");
      setTimeout(() => document.getElementById("roo-message")?.focus(), 100);
    },

    _close() {
      const modal = document.getElementById("roo-modal");
      modal.classList.remove("roo-open");
      modal.setAttribute("aria-hidden", "true");
    },

    async _send() {
      const msgEl = document.getElementById("roo-message");
      const sendBtn = document.getElementById("roo-send");
      const message = msgEl.value.trim();
      if (!message) { this._toast("Tell Roo a little more about it."); return; }

      sendBtn.disabled = true;
      const originalLabel = sendBtn.textContent;
      sendBtn.textContent = "Hopping...";

      try {
        const { supabase, appName, tableName, getUser, getPageContext, onSent } = this._cfg;
        const user = await getUser();
        const payload = {
          app_name:       appName,
          user_email:     user?.email || "anonymous",
          user_id:        user?.id || null,
          feedback_type:  this._type,
          message:        message,
          page_context:   getPageContext() || null,
          user_agent:     navigator.userAgent.slice(0, 500),
          page_url:       window.location.href.slice(0, 500),
        };

        const { error } = await supabase.from(tableName).insert(payload);
        if (error) throw error;

        this._toast("Roo got it. Hopping it to the team lead. 🦘");
        msgEl.value = "";
        this._resetType();
        this._close();
        if (typeof onSent === "function") onSent(payload);
      } catch (err) {
        console.error("[Roo] send failed:", err);
        this._toast("Roo got stuck: " + (err.message || "unknown error"));
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = originalLabel;
      }
    },

    _resetType() {
      this._type = "bug";
      document.querySelectorAll("[data-roo-type]").forEach(b => {
        b.classList.toggle("roo-active", b.dataset.rooType === "bug");
      });
    },

    _toast(msg) {
      const t = document.getElementById("roo-toast");
      if (!t) return;
      t.textContent = msg;
      t.classList.add("roo-toast-show");
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => t.classList.remove("roo-toast-show"), 3200);
    },

    /** Programmatically open the reporter (e.g. from a menu) */
    open() { this._open(); },
  };

  global.RooReporter = RooReporter;
})(typeof window !== "undefined" ? window : this);
