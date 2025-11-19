/* ============================================================
   CodeSathi / DevSolve — Solver Page Logic
   - Keeps your original behaviors
   - Adds Info (View Details) modal + downloads
   - Hero upgraded; filters, timers, payment modal kept
   ============================================================ */

/* ---------- Utilities ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const formatTimeLeft = (mins) => {
  if (mins <= 0) return "Expired";
  const d = Math.floor(mins / (60 * 24));
  const h = Math.floor((mins % (60 * 24)) / 60);
  const m = Math.floor(mins % 60);
  const chunks = [];
  if (d) chunks.push(`${d}d`);
  if (h) chunks.push(`${h}h`);
  if (m || (!d && !h)) chunks.push(`${m}m`);
  return chunks.join(" ");
};

const parseAttachmentList = (value) =>
  (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/* ---------- Mobile drawer & theme (kept) ---------- */
(() => {
  const hamburgerBtn = $("#hamburgerBtn");
  const drawer = $("#mobileDrawer");
  hamburgerBtn?.addEventListener("click", () => {
    drawer?.classList.toggle("open");
  });

  const themeToggle = $("#themeToggle");
  const mThemeToggle = $("#mThemeToggle");
  const toggleTheme = () => document.body.classList.toggle("dark");
  themeToggle?.addEventListener("click", toggleTheme);
  mThemeToggle?.addEventListener("click", toggleTheme);
})();

/* ---------- Countdown timers on request cards (kept) ---------- */
(() => {
  const cards = $$(".request-card");
  const tick = () => {
    cards.forEach((card) => {
      const mins = Number(card.dataset.deadlineMins || 0) - 1;
      card.dataset.deadlineMins = String(Math.max(mins, 0));
      const label = $(".deadline", card);
      if (label) label.textContent = formatTimeLeft(mins);
    });
  };
  // initialize now
  cards.forEach((card) => {
    const mins = Number(card.dataset.deadlineMins || 0);
    const label = $(".deadline", card);
    if (label) label.textContent = formatTimeLeft(mins);
  });
  setInterval(tick, 60 * 1000);
})();

/* ---------- Sort & filter (kept) ---------- */
(() => {
  const applyBtn = $("#applyFilters");
  const skillFilter = $("#skillFilter");
  const sortPrice = $("#sortPrice");
  const sortDeadline = $("#sortDeadline");
  const complexityFilter = $("#complexityFilter");
  const urgentOnly = $("#urgentOnly");
  const list = $("#requests");

  const apply = () => {
    const cards = $$(".request-card");
    // filter
    cards.forEach((card) => {
      const wantSkill = (skillFilter.value || "").toLowerCase();
      const skills = (card.dataset.skill || "").toLowerCase();
      const complexity = (card.dataset.complexity || "");
      const urgent = (card.dataset.urgent || "false") === "true";

      let show = true;
      if (wantSkill && !skills.includes(wantSkill)) show = false;
      if (complexityFilter.value && complexity !== complexityFilter.value) show = false;
      if (urgentOnly.checked && !urgent) show = false;
      card.style.display = show ? "" : "none";
    });

    // sort
    const visibleCards = $$(".request-card").filter((c) => c.style.display !== "none");
    visibleCards.sort((a, b) => {
      let by = 0;
      if (sortPrice.value === "high") {
        by = Number(b.dataset.price) - Number(a.dataset.price);
      } else if (sortPrice.value === "low") {
        by = Number(a.dataset.price) - Number(b.dataset.price);
      }
      if (by !== 0) return by;

      // tie-break by deadline
      const da = Number(a.dataset.deadlineMins || 0);
      const db = Number(b.dataset.deadlineMins || 0);
      return sortDeadline.value === "soon" ? da - db : db - da;
    });
    // re-append in sorted order
    visibleCards.forEach((c) => list.appendChild(c));
  };
  applyBtn?.addEventListener("click", apply);
})();

/* ---------- Payment modal (kept) ---------- */
(() => {
  const modal = $("#paymentModal");
  const closeBtn = $("#closeModal");
  const payTitle = $("#payTaskTitle");
  const payAmount = $("#payAmount");
  const form = $("#fakePayForm");

  $$(".request-card .accept").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".request-card");
      const amount = btn.dataset.amount || card.dataset.price || "0";
      const title = card.dataset.title || $(".req-main h3", card)?.textContent || "Task";
      payAmount.textContent = `₹${amount}`;
      payTitle.textContent = title;
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
    });
  });

  closeBtn?.addEventListener("click", () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Demo payment success. Task accepted!");
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  });
})();

/* ---------- INFO MODAL (new) ---------- */
(() => {
  const infoModal = $("#infoModal");
  const closeInfo = $("#closeInfo");
  const infoCloseBtn = $("#infoCloseBtn");
  const infoAccept = $("#infoAccept");

  const i = {
    title: $("#infoTitle"),
    t: $("#i_title"),
    desc: $("#i_desc"),
    budget: $("#i_budget"),
    deadline: $("#i_deadline"),
    urgency: $("#i_urgency"),
    skills: $("#i_skills"),
    files: $("#i_files")
  };

  // Helper: fill skills as chips
  const fillChips = (container, csv) => {
    container.innerHTML = "";
    const list = (csv || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!list.length) {
      container.innerHTML = `<span class="cs-muted">—</span>`;
      return;
    }
    list.forEach((txt) => {
      const span = document.createElement("span");
      span.className = "cs-chip";
      span.textContent = txt;
      container.appendChild(span);
    });
  };

  // Helper: fill file download links
  const fillFiles = (container, csv) => {
    container.innerHTML = "";
    const files = parseAttachmentList(csv);
    if (!files.length) {
      container.innerHTML = `<span class="cs-muted">No files attached</span>`;
      return;
    }
    files.forEach((href) => {
      const a = document.createElement("a");
      a.href = href;
      a.download = "";
      a.className = "cs-btn cs-btn-outline";
      a.textContent = "⬇ Download";
      const label = document.createElement("span");
      label.className = "cs-muted";
      label.style.marginLeft = "8px";
      label.textContent = href.split("/").pop();
      const wrap = document.createElement("span");
      wrap.style.display = "inline-flex";
      wrap.style.alignItems = "center";
      wrap.style.gap = "8px";
      wrap.appendChild(a);
      wrap.appendChild(label);
      container.appendChild(wrap);
    });
  };

  // Universal handler for both “View Details” in cards and in request rows
  const openInfo = (dataset, fallbackTitle) => {
    const title =
      dataset.title || fallbackTitle || "Problem Details";
    const desc =
      dataset.description || "—";
    const budget =
      dataset.budget || `₹${dataset.price || "—"}`;
    const deadline =
      dataset.deadline || "—";
    const urgency =
      dataset.urgency || (dataset.urgent === "true" ? "Urgent" : "Normal");
    const skills =
      dataset.skills || dataset.skill || "";
    const attachments =
      dataset.attachments || "";

    i.title.textContent = title;
    i.t.textContent = title;
    i.desc.textContent = desc;
    i.budget.textContent = budget;
    i.deadline.textContent = deadline;
    i.urgency.textContent = urgency;
    fillChips(i.skills, skills);
    fillFiles(i.files, attachments);

    infoModal.classList.add("show");
    infoModal.setAttribute("aria-hidden", "false");
  };

  // Bind all “View Details / Info” triggers
  $$(".view-details").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const sourceCard = e.target.closest("[data-title]") || e.target.closest(".request-card");
      openInfo(sourceCard.dataset, $(".req-main h3", sourceCard)?.textContent);
    });
  });

  // Accept from info modal = open payment modal with correct data
  infoAccept?.addEventListener("click", () => {
    infoModal.classList.remove("show");
    infoModal.setAttribute("aria-hidden", "true");
    // try to locate a matching request card by title and trigger Accept
    const title = i.t.textContent;
    const match = $$(".request-card").find((c) => (c.dataset.title || "").trim() === title.trim());
    if (match) {
      const acceptBtn = $(".accept", match);
      acceptBtn?.click();
    } else {
      // fallback: open payment with parsed budget
      const payModal = $("#paymentModal");
      $("#payTaskTitle").textContent = title;
      const budgetText = i.budget.textContent.replace(/[^\d]/g, "");
      $("#payAmount").textContent = `₹${budgetText || "0"}`;
      payModal.classList.add("show");
      payModal.setAttribute("aria-hidden", "false");
    }
  });

  const close = () => {
    infoModal.classList.remove("show");
    infoModal.setAttribute("aria-hidden", "true");
  };
  closeInfo?.addEventListener("click", close);
  infoCloseBtn?.addEventListener("click", close);
  window.addEventListener("click", (e) => { if (e.target === infoModal) close(); });
})();

/* ---------- Demo: reject buttons (kept) ---------- */
(() => {
  $$(".request-card .reject").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".request-card");
      card.style.opacity = 0.5;
      alert("Request rejected (demo).");
    });
  });
})();

/* ---------- Login/Signup demo (kept) ---------- */
(() => {
  $("#loginBtn")?.addEventListener("click", () => alert("Login flow (demo)"));
  $("#signupBtn")?.addEventListener("click", () => alert("Signup flow (demo)"));
  $("#mLogin")?.addEventListener("click", () => alert("Login flow (demo)"));
  $("#mSignup")?.addEventListener("click", () => alert("Signup flow (demo)"));
})();
/* ============================================================
   CodeSathi / DevSolve — Dashboard Page Logic
   - Kanban with drag & drop
   - Earnings & notifications
   - Profile save/load
   ============================================================ */