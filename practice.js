(function () {
  "use strict";

  /* ───────── config ───────── */
  const API = "https://pwsecure.gourav23032009.workers.dev/api/pw";
  const EXAM_CATEGORY = "vckzned6mqjlkub8wsfh605rp";
  const BATCHES = [
    { id: "676e4dee1ec923bc192f38c9", name: "11th JEE", detail: "Practice for Class 11 JEE", jee: true },
    { id: "65dc6fbabb55350018d555b7", name: "12th JEE", detail: "Practice for Class 12 JEE", jee: true },
    { id: "676e5677418e84037bd6247c", name: "11th NEET", detail: "Practice for Class 11 NEET", jee: false },
    { id: "65dc6fbaf5bcd500180102cd", name: "12th NEET", detail: "Practice for Class 12 NEET", jee: false }
  ];
  const COUNTS = [5, 10, 15, 20];
  const DIFFS = [
    { v: 1, label: "Easy", detail: "Build confidence" },
    { v: 2, label: "Medium", detail: "Stay exam-ready" },
    { v: 3, label: "Hard", detail: "Stretch your ceiling" }
  ];

  const ICON = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/></svg>',
    flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>',
    spin: '<svg class="ip-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9"/></svg>',
    redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg>'
  };

  /* ───────── tiny helpers ───────── */
  const $ = (s) => document.querySelector(s);
  const esc = (v = "") => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
  const page = $("#page");
  const params = new URLSearchParams(location.search);

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2400);
  }

  /* ───────── HTML / MathML / LaTeX normalising (ported 1:1) ───────── */
  const TEX_MAP = [
    [/−/g, "-"], [/×/g, "\\times "], [/⋅/g, "\\cdot "], [/≤/g, "\\le "], [/≥/g, "\\ge "], [/≠/g, "\\ne "],
    [/∞/g, "\\infty "], [/π/g, "\\pi "], [/θ/g, "\\theta "], [/α/g, "\\alpha "], [/β/g, "\\beta "],
    [/γ/g, "\\gamma "], [/Δ/g, "\\Delta "], [/∑/g, "\\sum "], [/∏/g, "\\prod "], [/∈/g, "\\in "],
    [/∉/g, "\\notin "], [/∴/g, "\\therefore "]
  ];
  function mathmlTextToTex(value) {
    let out = value;
    TEX_MAP.forEach(([re, rep]) => { out = out.replace(re, rep); });
    return out;
  }
  function mathmlNodeToTex(node) {
    if (node.nodeType === Node.TEXT_NODE) return mathmlTextToTex(node.textContent || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node;
    const tag = el.localName.toLowerCase();
    const children = Array.from(el.childNodes);
    const meaningful = children.filter((c) => {
      if (c.nodeType !== Node.ELEMENT_NODE) return (c.textContent || "").trim();
      const t = c.localName.toLowerCase();
      return t !== "none" && t !== "mprescripts";
    });
    const ct = (i) => (meaningful[i] ? mathmlNodeToTex(meaningful[i]) : "");
    const all = meaningful.map((c) => mathmlNodeToTex(c)).join("");
    switch (tag) {
      case "math": case "mrow": case "mstyle": case "semantics": case "mphantom": case "menclose": return all;
      case "annotation": case "annotation-xml": return "";
      case "mi": case "mn": case "mtext": case "mo": return mathmlTextToTex(el.textContent || "");
      case "mfrac": return "\\frac{" + ct(0) + "}{" + ct(1) + "}";
      case "msup": return ct(0) + "^{" + ct(1) + "}";
      case "msub": return ct(0) + "_{" + ct(1) + "}";
      case "msubsup": return ct(0) + "_{" + ct(1) + "}^{" + ct(2) + "}";
      case "msqrt": return "\\sqrt{" + all + "}";
      case "mroot": return "\\sqrt[" + ct(1) + "]{" + ct(0) + "}";
      case "mfenced": {
        const open = el.getAttribute("open") ?? "(";
        const close = el.getAttribute("close") ?? ")";
        const sep = (el.getAttribute("separators") || "")[0] ?? ",";
        return "\\left" + open + meaningful.map((c) => mathmlNodeToTex(c)).join(sep) + "\\right" + close;
      }
      case "mover": return "\\overset{" + ct(1) + "}{" + ct(0) + "}";
      case "munder": return "\\underset{" + ct(1) + "}{" + ct(0) + "}";
      case "munderover": return "\\underset{" + ct(1) + "}{\\overset{" + ct(2) + "}{" + ct(0) + "}}";
      case "mspace": return "\\ ";
      case "mtable": return "\\begin{matrix}" + Array.from(el.children).map((r) => mathmlNodeToTex(r)).join("\\\\") + "\\end{matrix}";
      case "mtr": return Array.from(el.children).map((c) => mathmlNodeToTex(c)).join(" & ");
      case "mtd": return all;
      case "mmultiscripts": {
        const isNone = (n) => !n || (n.localName || "").toLowerCase() === "none";
        const base = children[0] ? mathmlNodeToTex(children[0]) : "";
        const postSub = !isNone(children[1]) ? mathmlNodeToTex(children[1]) : "";
        const postSup = !isNone(children[2]) ? mathmlNodeToTex(children[2]) : "";
        const marker = children.findIndex((c) => c.nodeType === Node.ELEMENT_NODE && c.localName.toLowerCase() === "mprescripts");
        const preSubN = marker === -1 ? undefined : children[marker + 1];
        const preSupN = marker === -1 ? undefined : children[marker + 2];
        const preSub = preSubN && !isNone(preSubN) ? mathmlNodeToTex(preSubN) : "";
        const preSup = preSupN && !isNone(preSupN) ? mathmlNodeToTex(preSupN) : "";
        return (preSup ? "^{" + preSup + "}" : "") + (preSub ? "_{" + preSub + "}" : "") + base +
          (postSub ? "_{" + postSub + "}" : "") + (postSup ? "^{" + postSup + "}" : "");
      }
      default: return all;
    }
  }
  function normalizeEscapedLatexText(value) {
    let n = value, prev = "";
    while (n !== prev) { prev = n; n = n.replace(/\\\\(?=[A-Za-z()[\]$])/g, "\\"); }
    return n;
  }
  const BAD_TAGS = "script,iframe,object,embed,style,link,meta,base,form";
  function sanitizeTree(root) {
    root.querySelectorAll(BAD_TAGS).forEach((n) => n.remove());
    root.querySelectorAll("*").forEach((n) => {
      Array.from(n.attributes).forEach((a) => {
        const name = a.name.toLowerCase();
        const val = (a.value || "").replace(/\s+/g, "").toLowerCase();
        if (name.startsWith("on") || ((name === "href" || name === "src" || name === "xlink:href") && /^(javascript|data:text\/html|vbscript)/.test(val))) {
          n.removeAttribute(a.name);
        }
      });
    });
  }
  function normalizeMathContent(html) {
    if (!html) return "";
    const parsed = new DOMParser().parseFromString("<div>" + html + "</div>", "text/html");
    const container = parsed.body.firstElementChild;
    if (!container) return "";
    sanitizeTree(container);
    container.querySelectorAll("math").forEach((math) => {
      const tex = mathmlNodeToTex(math).replace(/\s+/g, " ").trim();
      if (!tex) return;
      const display = math.getAttribute("display") === "block";
      math.replaceWith(parsed.createTextNode((display ? "\\[" : "\\(") + tex + (display ? "\\]" : "\\)")));
    });
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) { node.textContent = normalizeEscapedLatexText(node.textContent || ""); return; }
      Array.from(node.childNodes).forEach(walk);
    };
    walk(container);
    return container.innerHTML;
  }
  function renderMath(el) {
    if (typeof window.renderMathInElement !== "function") return;
    try {
      window.renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false, strict: false, trust: false
      });
    } catch (e) { /* leave raw text */ }
  }
  // fill every [data-html] placeholder inside root with normalized + math-rendered content
  const htmlStore = [];
  function slot(html, cls) {
    const i = htmlStore.push(html || "") - 1;
    return '<div class="practice-html ' + (cls || "") + '" data-slot="' + i + '"></div>';
  }
  function hydrate(root) {
    root.querySelectorAll("[data-slot]").forEach((el) => {
      const html = htmlStore[+el.getAttribute("data-slot")];
      el.removeAttribute("data-slot");
      el.innerHTML = normalizeMathContent(html);
      renderMath(el);
    });
  }

  /* ───────── API ───────── */
  async function readJson(res, fallback) {
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = payload && payload.error && payload.error.message;
      throw new Error(msg || fallback);
    }
    return payload;
  }
  const cache = new Map();
  async function cached(key, fn) {
    if (cache.has(key)) return cache.get(key);
    const v = await fn();
    cache.set(key, v);
    return v;
  }
  async function getSubjects(batchId) {
    return cached("s:" + batchId, async () => {
      const r = await readJson(await fetch(API + "/v3/batches/" + batchId + "/infinitePractice/subjects"), "Could not load practice subjects.");
      return (r && r.data && r.data.subjects) || [];
    });
  }
  async function getChapters(batchId, subjectId) {
    return cached("c:" + batchId + ":" + subjectId, async () => {
      const r = await readJson(await fetch(API + "/v3/batches/" + batchId + "/infinitePractice/chapters?subjectId=" + encodeURIComponent(subjectId)), "Could not load chapters for this subject.");
      return (r && r.data) || [];
    });
  }
  async function startTest(batchId, input) {
    const res = await fetch(API + "/v3/test-service/" + batchId + "/infinitePractice/v2/start-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exams: [], examCategory: EXAM_CATEGORY, testMode: "EXAM",
        questionsCount: input.questionsCount, chapters: input.chapters, subject: input.subjectId,
        difficultyLevel: input.difficultyLevel, isReattempt: false, language: "English"
      })
    });
    const r = await readJson(res, "Could not create this practice set.");
    const s = r && r.data;
    if (!s || !s._id || !Array.isArray(s.questions) || !s.questions.length) throw new Error("No questions are available for this selection.");
    return { testId: s._id, questions: s.questions };
  }
  async function submitTest(testId, responses) {
    const res = await fetch(API + "/v3/test-service/" + testId + "/infinitePractice/submit-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionsResponse: responses })
    });
    await readJson(res, "Could not submit this practice test.");
  }
  async function loadSolution(testId) {
    const r = await readJson(await fetch(API + "/v3/test-service/" + testId + "/infinitePractice/test-solution"), "Could not load the test solutions.");
    if (!r || !r.data) throw new Error("The test solution response was empty.");
    return r.data;
  }

  /* ───────── state ───────── */
  const S = {
    view: "hub", batchId: "", subjects: null, subjectId: "", chapters: null, chapterIds: new Set(),
    count: 10, diff: new Set([1, 2, 3]),
    session: null, idx: 0, answers: {}, selected: [], startedAt: Date.now(), busy: false, submitError: "", result: null
  };
  const batchById = (id) => BATCHES.find((b) => b.id === id);

  function setTitle(t) { $("#topTitle").textContent = t; document.title = t + " — CODEX STUDYS"; }
  function go(view) { S.view = view; window.scrollTo({ top: 0 }); render(); }

  /* ───────── views ───────── */
  function renderHub() {
    setTitle("Infinite Practice");
    page.innerHTML =
      '<section class="ip-card ip-hero"><p class="ip-eyebrow">Focused question practice</p>' +
      '<h2>Infinite Practice<span>.</span></h2>' +
      '<p class="ip-sub">Apni class aur exam choose karein, phir subject aur chapters ke hisaab se unlimited practice set banayein.</p></section>' +
      '<div class="ip-card"><p class="ip-eyebrow">Choose your batch</p><h2 class="ip-h2">What are you preparing for?</h2>' +
      '<div class="ip-grid two">' +
      BATCHES.map((b) =>
        '<button class="ip-tile" type="button" data-batch="' + b.id + '"><span class="ip-ico">' + (b.jee ? ICON.book : ICON.flask) + '</span>' +
        '<span><b>' + esc(b.name) + '</b><small>' + esc(b.detail) + '</small></span><span class="ip-go">' + ICON.arrow + '</span></button>'
      ).join("") + '</div></div>';
    page.querySelectorAll("[data-batch]").forEach((btn) => btn.addEventListener("click", () => openBatch(btn.dataset.batch)));
  }

  function openBatch(id) {
    S.batchId = id; S.subjects = null; S.subjectId = ""; S.chapters = null; S.chapterIds = new Set();
    history.pushState({ b: id }, "", "?b=" + id);
    go("select");
    loadSubjects();
  }

  async function loadSubjects() {
    try {
      S.subjects = await getSubjects(S.batchId);
    } catch (e) {
      S.subjects = null;
      return renderError(e.message, loadSubjects);
    }
    if (S.view === "select") render();
  }
  async function loadChapters() {
    S.chapters = null;
    render();
    try {
      S.chapters = await getChapters(S.batchId, S.subjectId);
    } catch (e) {
      S.chapters = { error: e.message };
    }
    if (S.view === "select") render();
  }

  function renderError(message, retry) {
    page.innerHTML = '<div class="ip-card ip-center"><h2>Could not load Infinite Practice</h2><p class="ip-sub">' + esc(message) +
      '</p><button class="ip-btn primary" id="retry" type="button" style="margin-top:18px">' + ICON.redo + ' Try again</button></div>';
    $("#retry").addEventListener("click", () => { renderSkeleton(); retry(); });
  }
  function renderSkeleton() {
    page.innerHTML = '<div class="list"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>';
  }

  function subjectIcon(s) {
    const n = (s.englishName || "").toLowerCase();
    if (n.includes("physics")) return ICON.bolt;
    if (n.includes("chem")) return ICON.flask;
    return ICON.target;
  }

  function renderSelect() {
    const batch = batchById(S.batchId);
    setTitle("Infinite Practice · " + (batch ? batch.name : ""));
    if (S.subjects === null) return renderSkeleton();
    if (!S.subjects.length) {
      page.innerHTML = '<div class="ip-card ip-center"><h2>No practice subjects are available</h2><p class="ip-sub">This practice catalog does not have published subjects for ' +
        esc(batch ? batch.name : "this batch") + ' yet.</p></div>';
      return;
    }
    const chapters = Array.isArray(S.chapters) ? S.chapters : [];
    let chapterHtml;
    if (!S.subjectId) chapterHtml = '<div class="ip-empty">Select a subject to see its chapters.</div>';
    else if (S.chapters === null) chapterHtml = '<div class="ip-chapters">' + '<div class="skeleton" style="height:58px;border-radius:13px"></div>'.repeat(4) + '</div>';
    else if (S.chapters.error) chapterHtml = '<div class="ip-err">' + esc(S.chapters.error) + '</div>';
    else if (!chapters.length) chapterHtml = '<div class="ip-empty">No chapters are available for this subject.</div>';
    else chapterHtml = '<div class="ip-chapters">' + chapters.map((c) => {
      const on = S.chapterIds.has(c.chapterId);
      return '<button type="button" class="ip-chap' + (on ? " on" : "") + '" data-chap="' + esc(c.chapterId) + '" aria-pressed="' + on + '">' +
        '<span class="ip-box">' + ICON.check + '</span><span class="t"><b>' + esc(c.englishName) + '</b><small>' +
        Number(c.questionCount || 0).toLocaleString("en-IN") + ' questions</small></span></button>';
    }).join("") + '</div>';
    const allOn = chapters.length > 0 && S.chapterIds.size === chapters.length;
    const canStart = S.subjectId && S.chapterIds.size > 0 && !S.busy;
    const noFree = /no free sessions left/i.test(S.submitError || "");

    page.innerHTML =
      '<section class="ip-card"><p class="ip-eyebrow">Step 01 / Choose subject</p><h2 class="ip-h2">What do you want to practise?</h2>' +
      '<p class="ip-sub">Choose a subject, then select one or more chapters.</p><div class="ip-grid three">' +
      S.subjects.map((s) => {
        const on = S.subjectId === s.subjectId;
        return '<button type="button" class="ip-tile' + (on ? " on" : "") + '" data-subj="' + esc(s.subjectId) + '" aria-pressed="' + on + '">' +
          '<span class="ip-ico">' + (s.icon ? '<img src="' + esc(s.icon) + '" alt="" referrerpolicy="no-referrer">' : subjectIcon(s)) + '</span>' +
          '<span><b>' + esc(s.englishName) + '</b>' + (s.hindiName ? '<small>' + esc(s.hindiName) + '</small>' : '') + '</span></button>';
      }).join("") + '</div></section>' +
      '<section class="ip-card"><div class="ip-row"><div><p class="ip-eyebrow">Step 02 / Pick chapters</p><h2 class="ip-h2">Practice exactly what you need</h2></div>' +
      (chapters.length ? '<button type="button" class="ip-link" id="selAll">' + (allOn ? "Clear all" : "Select all") + '</button>' : '') + '</div>' + chapterHtml + '</section>' +
      '<section class="ip-card"><p class="ip-eyebrow">Step 03 / Build your set</p><h2 class="ip-h2">Build your own question set</h2>' +
      '<p class="ip-legend">Difficulty</p><div class="ip-pills">' +
      DIFFS.map((d) => '<button type="button" class="ip-pill' + (S.diff.has(d.v) ? " on" : "") + '" data-diff="' + d.v + '" title="' + esc(d.detail) + '" aria-pressed="' + S.diff.has(d.v) + '">' + d.label + '</button>').join("") +
      '</div><p class="ip-legend">Questions</p><div class="ip-pills">' +
      COUNTS.map((n) => '<button type="button" class="ip-pill' + (S.count === n ? " on" : "") + '" data-count="' + n + '" aria-pressed="' + (S.count === n) + '">' + n + '</button>').join("") +
      '</div><button type="button" class="ip-btn primary block" id="startBtn"' + (canStart && !noFree ? "" : " disabled") + '>' +
      (S.busy ? ICON.spin + " Building your set" : (noFree ? "Sessions unavailable" : "Start practising") + " " + ICON.arrow) + '</button>' +
      (S.submitError ? '<div class="ip-err' + (noFree ? " ip-warn" : "") + '">' +
        (noFree ? "Is batch (" + esc(batch ? batch.name : "") + ") ke free Infinite Practice sessions ab available nahi hain. Kisi doosre supported batch ya baad mein dobara try karein." : esc(S.submitError)) + '</div>' : '') +
      '</section>';

    page.querySelectorAll("[data-subj]").forEach((b) => b.addEventListener("click", () => {
      if (S.subjectId === b.dataset.subj) return;
      S.subjectId = b.dataset.subj; S.chapterIds = new Set(); S.submitError = "";
      loadChapters();
    }));
    page.querySelectorAll("[data-chap]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.chap;
      S.chapterIds.has(id) ? S.chapterIds.delete(id) : S.chapterIds.add(id);
      render();
    }));
    const sa = $("#selAll");
    if (sa) sa.addEventListener("click", () => {
      S.chapterIds = allOn ? new Set() : new Set(chapters.map((c) => c.chapterId));
      render();
    });
    page.querySelectorAll("[data-diff]").forEach((b) => b.addEventListener("click", () => {
      const v = +b.dataset.diff;
      if (S.diff.has(v)) { if (S.diff.size > 1) S.diff.delete(v); } else S.diff.add(v);
      render();
    }));
    page.querySelectorAll("[data-count]").forEach((b) => b.addEventListener("click", () => { S.count = +b.dataset.count; render(); }));
    $("#startBtn").addEventListener("click", onStart);
  }

  async function onStart() {
    if (S.busy || !S.subjectId || !S.chapterIds.size) return;
    const chosen = (S.chapters || []).filter((c) => S.chapterIds.has(c.chapterId));
    if (!chosen.length) return;
    S.busy = true; S.submitError = ""; render();
    try {
      const session = await startTest(S.batchId, {
        subjectId: S.subjectId,
        chapters: chosen.map((c) => ({ chapterId: c.chapterId, classId: c.classId })),
        questionsCount: S.count,
        difficultyLevel: [...S.diff].sort()
      });
      S.busy = false;
      S.session = session; S.idx = 0; S.answers = {}; S.selected = []; S.result = null; S.submitError = "";
      S.startedAt = Date.now();
      go("question");
    } catch (e) {
      S.busy = false; S.submitError = e.message || "Could not create this practice set."; render();
    }
  }

  /* question room */
  function currentQuestion() { return S.session.questions[S.idx]; }
  function makeAnswer(status) {
    const q = currentQuestion();
    if (!q) return null;
    if (status === "ATTEMPTED" && !S.selected.length) return null;
    return {
      questionId: q.questionId, status,
      timeTaken: Math.max(1000, Date.now() - S.startedAt),
      chapterId: q.chapterId, questionNumber: S.idx + 1,
      markedSolutions: status === "SKIPPED" ? [] : S.selected.slice(),
      difficulty: q.difficulty, type: q.type
    };
  }
  function loadIndex(i) {
    S.idx = i;
    const q = currentQuestion();
    S.selected = (S.answers[q.questionId] && S.answers[q.questionId].markedSolutions || []).slice();
    S.startedAt = Date.now();
    S.submitError = "";
    window.scrollTo({ top: 0 });
    render();
  }
  async function finish() {
    if (S.busy) return;
    S.busy = true; S.submitError = ""; render();
    const full = S.session.questions.map((q, i) => S.answers[q.questionId] || {
      questionId: q.questionId, status: "SKIPPED", timeTaken: 0, chapterId: q.chapterId,
      questionNumber: i + 1, markedSolutions: [], difficulty: q.difficulty, type: q.type
    });
    try {
      await submitTest(S.session.testId, full);
      S.result = await loadSolution(S.session.testId);
      S.busy = false;
      go("complete");
    } catch (e) {
      S.busy = false; S.submitError = e.message || "Could not submit this test."; render();
    }
  }
  function onNext() {
    const a = makeAnswer("ATTEMPTED");
    if (!a) return;
    S.answers[a.questionId] = a;
    if (S.idx < S.session.questions.length - 1) loadIndex(S.idx + 1); else finish();
  }
  function onPrev() {
    if (S.idx === 0 || S.busy) return;
    const a = makeAnswer("ATTEMPTED");
    if (a) S.answers[a.questionId] = a;
    loadIndex(S.idx - 1);
  }
  function onSkip() {
    const a = makeAnswer("SKIPPED");
    if (!a) return;
    S.answers[a.questionId] = a;
    if (S.idx < S.session.questions.length - 1) loadIndex(S.idx + 1); else finish();
  }
  function onSubmitNow() {
    const a = makeAnswer(S.selected.length ? "ATTEMPTED" : "SKIPPED");
    if (a) S.answers[a.questionId] = a;
    finish();
  }

  function renderQuestion() {
    setTitle("Infinite Practice");
    const q = currentQuestion();
    if (!q) return go("select");
    const total = S.session.questions.length;
    const last = S.idx === total - 1;
    const multi = q.type === 2;
    htmlStore.length = 0;
    page.innerHTML =
      '<div class="ip-bar"><div class="q">Question ' + (S.idx + 1) + ' <small>of ' + total + '</small></div>' +
      '<button type="button" class="ip-btn" id="submitNow" style="height:38px;font-size:12px"' + (S.busy ? " disabled" : "") + '>' +
      (S.busy ? ICON.spin + " Submitting..." : "Submit test") + '</button></div>' +
      '<div class="ip-prog"><i style="width:' + (S.idx / total * 100) + '%"></i></div>' +
      '<article class="ip-card"><div class="ip-qhead"><b>' + esc(q.chapterName || "Practice question") + '</b><span>' + esc(q.typeTitle || "Question") + '</span></div>' +
      slot(q.content || q.plainQuestionText, "ip-qtext") +
      '<div class="ip-opts" role="' + (multi ? "group" : "radiogroup") + '">' +
      (q.options || []).map((o, i) => {
        const on = S.selected.includes(i + 1);
        return '<button type="button" class="ip-opt' + (on ? " on" : "") + '" data-opt="' + (i + 1) + '" role="' + (multi ? "checkbox" : "radio") + '" aria-checked="' + on + '"' + (S.busy ? " disabled" : "") + '>' +
          '<span class="k">' + String.fromCharCode(65 + i) + '</span>' + slot(o.text, "v") + '</button>';
      }).join("") + '</div>' +
      '<p class="ip-hint">' + (multi ? "Select one or more options" : "Select an option") + '</p>' +
      '<div class="ip-actions">' +
      '<button type="button" class="ip-btn" id="prevBtn"' + (S.idx === 0 || S.busy ? " disabled" : "") + '>' + ICON.left + ' Previous</button>' +
      '<button type="button" class="ip-btn warn" id="skipBtn"' + (S.busy ? " disabled" : "") + '>Skip question</button>' +
      '<button type="button" class="ip-btn primary" id="nextBtn"' + (!S.selected.length || S.busy ? " disabled" : "") + '>' +
      (S.busy ? ICON.spin + " Submitting..." : (last ? "Submit &amp; finish" : "Next question") + " " + ICON.arrow) + '</button></div>' +
      (S.submitError ? '<div class="ip-err">' + esc(S.submitError) + '</div>' : '') + '</article>';
    hydrate(page);
    page.querySelectorAll("[data-opt]").forEach((b) => b.addEventListener("click", () => {
      const n = +b.dataset.opt;
      if (multi) S.selected = S.selected.includes(n) ? S.selected.filter((v) => v !== n) : S.selected.concat(n);
      else S.selected = [n];
      // update in place so math doesn't re-render
      page.querySelectorAll("[data-opt]").forEach((x) => {
        const on = S.selected.includes(+x.dataset.opt);
        x.classList.toggle("on", on);
        x.setAttribute("aria-checked", String(on));
      });
      $("#nextBtn").disabled = !S.selected.length || S.busy;
    }));
    $("#prevBtn").addEventListener("click", onPrev);
    $("#skipBtn").addEventListener("click", onSkip);
    $("#nextBtn").addEventListener("click", onNext);
    $("#submitNow").addEventListener("click", onSubmitNow);
  }

  function renderComplete() {
    setTitle("Practice set finished");
    const r = S.result || {};
    const sols = r.questionsResponses || [];
    htmlStore.length = 0;
    const stats = [
      ["Score", r.userScore ?? r.score ?? "—"],
      ["Accuracy", r.accuracy === undefined ? "—" : r.accuracy + "%"],
      ["Correct", r.totalCorrectQuestions ?? "—"],
      ["Incorrect", r.totalIncorrectQuestions ?? "—"]
    ];
    page.innerHTML =
      '<div class="ip-card" style="text-align:center"><div class="ip-trophy">' + ICON.trophy + '</div>' +
      '<p class="ip-eyebrow" style="margin-top:18px">Test submitted</p><h2 class="ip-h2" style="font-size:28px">Practice set finished</h2>' +
      '<div class="ip-stats">' + stats.map(([l, v]) => '<div class="ip-stat"><small>' + l + '</small><b>' + esc(String(v)) + '</b></div>').join("") + '</div>' +
      '<p class="ip-sub">Review the solutions below and keep practising.</p>' +
      (sols.length ? '<div class="ip-sols">' + sols.map((item, i) => {
        const correct = (item.options || []).map((o, oi) => (o.isCorrect ? oi + 1 : null)).filter((v) => v !== null);
        const sol = item.solutions && item.solutions[0];
        const vid = sol && sol.videoSolution && sol.videoSolution.url;
        const safeVid = vid && /^https?:\/\//i.test(vid) ? vid : "";
        return '<article class="ip-sol"><small class="n">Question ' + (item.questionNumber ?? i + 1) + '</small>' + slot(item.content, "") +
          '<p class="ans">Correct option' + (correct.length === 1 ? "" : "s") + ': ' + (correct.length ? correct.join(", ") : "Not available") + '</p>' +
          (sol && sol.text ? slot(sol.text, "sx") : "") +
          (safeVid ? '<a href="' + esc(safeVid) + '" target="_blank" rel="noopener noreferrer">Watch video solution</a>' : "") + '</article>';
      }).join("") + '</div>' : '') +
      '<p class="ip-sub">Keep the momentum going with another focused set.</p>' +
      '<button type="button" class="ip-btn primary" id="again" style="margin-top:20px;height:48px">' + ICON.redo + ' Practise another set</button></div>';
    hydrate(page);
    $("#again").addEventListener("click", () => {
      S.session = null; S.result = null; S.answers = {}; S.selected = []; S.submitError = "";
      go("select");
    });
  }

  function render() {
    if (S.view === "hub") renderHub();
    else if (S.view === "select") renderSelect();
    else if (S.view === "question") renderQuestion();
    else if (S.view === "complete") renderComplete();
  }

  /* ───────── navigation ───────── */
  $("#backBtn").addEventListener("click", () => {
    if (S.view === "question") {
      if (!confirm("Leave this practice set? Your answers will not be submitted.")) return;
      S.session = null; S.answers = {}; S.selected = [];
      go("select");
      return;
    }
    if (S.view === "complete") { go("select"); return; }
    if (S.view === "select") {
      S.view = "hub"; S.batchId = "";
      history.pushState({}, "", location.pathname);
      render();
      return;
    }
    if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) history.back();
    else location.href = "index.html#courses";
  });
  window.addEventListener("popstate", () => {
    const b = new URLSearchParams(location.search).get("b");
    if (b && batchById(b)) {
      if (S.batchId !== b) { S.batchId = b; S.subjects = null; S.subjectId = ""; S.chapters = null; S.chapterIds = new Set(); loadSubjects(); }
      S.view = "select";
    } else { S.view = "hub"; S.batchId = ""; }
    render();
  });
  window.addEventListener("beforeunload", (e) => {
    if (S.view === "question" && S.session) { e.preventDefault(); e.returnValue = ""; }
  });

  /* ───────── init ───────── */
  const initial = params.get("b");
  if (initial && batchById(initial)) {
    S.batchId = initial; S.view = "select";
    render();
    loadSubjects();
  } else {
    render();
  }
})();
