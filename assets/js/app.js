/* ============================================================
   رَفّ — منطق الموقع (سلة، بحث، صفحات الكتب، إتمام الطلب)
   ============================================================ */
(function () {
  "use strict";

  const S = window.STORE || {};
  const CUR = S.currency || "دج";
  const KEY = "raff_cart_v1";

  /* ---------------- helpers ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const money = (n) => Number(n).toLocaleString("en-US").replace(/,/g, " ") + " " + CUR;
  const catName = (id) => (CATEGORIES.find((c) => c.id === id) || {}).name || id;
  const bookById = (id) => BOOKS.find((b) => b.id === id);
  const esc = (t) =>
    String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ICONS = {
    "book-open": '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C12 6.5 9.5 4.5 5 4.5v14c4.5 0 7 2 7 2s2.5-2 7-2v-14c-4.5 0-7 2-7 2Z"/><path d="M12 6.5v14"/></svg>',
    sparkle: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M18 16l.9 2.1L21 19l-2.1.9L18 22l-.9-2.1L15 19l2.1-.9L18 16Z"/></svg>',
    chart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"/><path d="M7 19v-6M12 19V7M17 19v-9"/></svg>',
    heart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z"/></svg>',
    home: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-6h4v6"/></svg>',
    star: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.8-5.3-2.9-5.3 2.9 1.1-5.8L3.5 9.7l5.9-.8L12 3.5Z"/></svg>',
    globe: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.2 3.6 5.2 3.6 8.5S14.4 18.3 12 20.5c-2.4-2.2-3.6-5.2-3.6-8.5S9.6 5.7 12 3.5Z"/></svg>',
    card: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><path d="M6.5 14.5h4"/></svg>',
    phone: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 5.5h2"/><path d="M12 18.5h.01"/></svg>',
    bank: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9.5L12 4l8.5 5.5"/><path d="M5.5 9.5V19M18.5 9.5V19M9.5 9.5V19M14.5 9.5V19"/><path d="M3 19h18"/></svg>',
    cart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 10.5A2 2 0 0 0 9.4 16h7.2a2 2 0 0 0 2-1.6L20 7H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/></svg>',
    search: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    dl: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v11"/><path d="M8 11l4 4 4-4"/><path d="M4.5 19.5h15"/></svg>',
    shield: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 2.5v6c0 4.4-3 7.7-7 9.5-4-1.8-7-5.1-7-9.5v-6L12 3Z"/><path d="M9 12l2 2 4-4"/></svg>',
    bolt: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2.5 5.5 13.5H11l-1 8 8-11H12l1-8Z"/></svg>',
    mail: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/></svg>'
  };
  const icon = (n) => ICONS[n] || "";

  /* ---------------- cart ---------------- */
  function readCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
      const clean = {};
      Object.keys(raw).forEach((id) => {
        if (bookById(id) && raw[id] > 0) clean[id] = Math.min(9, Number(raw[id]));
      });
      return clean;
    } catch (e) {
      return {};
    }
  }
  function writeCart(c) {
    localStorage.setItem(KEY, JSON.stringify(c));
    paintCartCount();
    renderDrawer();
    document.dispatchEvent(new CustomEvent("cart:change"));
  }
  const cartCount = () => Object.values(readCart()).reduce((a, b) => a + b, 0);
  const cartItems = () => Object.entries(readCart()).map(([id, q]) => ({ book: bookById(id), qty: q }));
  const cartTotal = () => cartItems().reduce((s, i) => s + i.book.price * i.qty, 0);

  function addToCart(id, qty) {
    const c = readCart();
    c[id] = Math.min(9, (c[id] || 0) + (qty || 1));
    writeCart(c);
    openDrawer();
  }
  function setQty(id, q) {
    const c = readCart();
    if (q <= 0) delete c[id];
    else c[id] = Math.min(9, q);
    writeCart(c);
  }

  function paintCartCount() {
    const n = cartCount();
    $$("[data-cart-count]").forEach((el) => {
      el.textContent = n;
      el.style.display = n ? "" : "none";
    });
  }

  /* ---------------- drawer ---------------- */
  function drawerEl() {
    let d = $("#drawer");
    if (!d) {
      d = document.createElement("aside");
      d.id = "drawer";
      d.className = "drawer";
      d.setAttribute("aria-label", "سلة الشراء");
      document.body.appendChild(d);
      const ov = document.createElement("div");
      ov.className = "overlay";
      ov.id = "overlay";
      document.body.appendChild(ov);
      ov.addEventListener("click", closeDrawer);
    }
    return d;
  }
  function openDrawer() {
    drawerEl().classList.add("on");
    $("#overlay").classList.add("on");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    $("#drawer").classList.remove("on");
    $("#overlay").classList.remove("on");
    document.body.style.overflow = "";
  }

  function renderDrawer() {
    const d = drawerEl();
    const items = cartItems();
    const body = items.length
      ? items
          .map(
            (i) => `
      <div class="cart-item">
        <img src="${i.book.cover}" alt="${esc(i.book.title)}" loading="lazy">
        <div>
          <h4>${esc(i.book.title)}</h4>
          <div class="m">${esc(catName(i.book.category))} · ${i.book.pages} صفحة</div>
          <div class="m">${money(i.book.price)}</div>
          <div class="qty">
            <button type="button" data-dec="${i.book.id}" aria-label="إنقاص">−</button>
            <span>${i.qty}</span>
            <button type="button" data-inc="${i.book.id}" aria-label="زيادة">+</button>
          </div>
        </div>
        <div style="text-align:end">
          <strong>${money(i.book.price * i.qty)}</strong>
          <div><button class="remove" type="button" data-rm="${i.book.id}">حذف</button></div>
        </div>
      </div>`
          )
          .join("")
      : `<div class="cart-empty"><p>سلتك فارغة.</p><a class="btn btn--ghost btn--sm" href="shop.html">تصفّحي الكتب</a></div>`;

    d.innerHTML = `
      <div class="drawer-head">
        <h3>سلة الشراء</h3>
        <button class="close-x" type="button" id="closeDrawer" aria-label="إغلاق">✕</button>
      </div>
      <div class="drawer-body">${body}</div>
      <div class="drawer-foot">
        <div class="cart-sum">
          <div><span>المجموع الفرعي</span><span>${money(cartTotal())}</span></div>
          <div><span>التوصيل (PDF)</span><span style="color:var(--green);font-weight:700">مجاني</span></div>
          <div class="tot"><span>المجموع</span><span>${money(cartTotal())}</span></div>
        </div>
        <a class="btn btn--primary btn--wide ${items.length ? "" : "disabled"}" ${items.length ? 'href="checkout.html"' : 'aria-disabled="true"'} style="${items.length ? "" : "pointer-events:none;opacity:.45"}">
          إتمام الطلب
        </a>
        <p class="small muted center" style="margin:12px 0 0">تحميل فوري بصيغة PDF · دفع آمن</p>
      </div>`;

    $("#closeDrawer").addEventListener("click", closeDrawer);
    $$("[data-inc]", d).forEach((b) => b.addEventListener("click", () => setQty(b.dataset.inc, readCart()[b.dataset.inc] + 1)));
    $$("[data-dec]", d).forEach((b) => b.addEventListener("click", () => setQty(b.dataset.dec, readCart()[b.dataset.dec] - 1)));
    $$("[data-rm]", d).forEach((b) => b.addEventListener("click", () => setQty(b.dataset.rm, 0)));
  }

  /* ---------------- cards ---------------- */
  function cardHTML(b) {
    const badge = b.badge
      ? `<span class="badge ${b.badge.indexOf("مبيعا") > -1 ? "" : "badge--gold"}">${esc(b.badge)}</span>`
      : "";
    return `
    <article class="book-card reveal">
      <a class="book-cover" href="book.html?id=${b.id}" aria-label="${esc(b.title)}">
        ${badge}
        <img src="${b.cover}" alt="غلاف ${esc(b.title)}" loading="lazy">
        <button class="cover-quick" type="button" data-add="${b.id}">أضيفي إلى السلة +</button>
      </a>
      <div class="book-meta">
        <span class="book-cat">${esc(catName(b.category))}</span>
        <a class="book-title" href="book.html?id=${b.id}">${esc(b.title)}</a>
        <span class="book-author">${esc(b.author)}</span>
        <div class="book-row">
          <span class="price">${money(b.price)}${b.oldPrice ? `<s>${money(b.oldPrice)}</s>` : ""}</span>
          <span class="rating"><i>★</i>${b.rating.toFixed(1)}</span>
        </div>
      </div>
    </article>`;
  }

  function bindAddButtons(root) {
    $$("[data-add]", root).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        addToCart(btn.dataset.add);
      });
    });
  }

  /* ---------------- reveal ---------------- */
  function observeReveals(root) {
    const els = $$(".reveal:not(.in)", root || document);
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    els.forEach((e) => io.observe(e));
  }

  /* ---------------- pages ---------------- */
  function initIndex() {
    const cats = $("#catGrid");
    if (cats) {
      cats.innerHTML = CATEGORIES.map(
        (c) => `
        <a class="cat-card reveal" href="shop.html?cat=${c.id}">
          <span class="cat-ico">${icon(c.icon)}</span>
          <h3>${esc(c.name)}</h3>
          <p>${esc(c.desc)}</p>
          <span class="more">${BOOKS.filter((b) => b.category === c.id).length} كتب ›</span>
        </a>`
      ).join("");
    }
    const best = $("#bestGrid");
    if (best) {
      best.innerHTML = [...BOOKS].sort((a, b) => b.reviews - a.reviews).slice(0, 4).map(cardHTML).join("");
    }
    const fresh = $("#newGrid");
    if (fresh) {
      fresh.innerHTML = [...BOOKS].reverse().slice(0, 4).map(cardHTML).join("");
    }
    bindAddButtons(document);
  }

  function initShop() {
    const grid = $("#shopGrid");
    if (!grid) return;
    const params = new URLSearchParams(location.search);
    let state = { cat: params.get("cat") || "all", q: params.get("q") || "", sort: "featured" };

    const chips = $("#chips");
    chips.innerHTML =
      `<button class="chip" data-cat="all">كل الكتب</button>` +
      CATEGORIES.map((c) => `<button class="chip" data-cat="${c.id}">${esc(c.name)}</button>`).join("");

    $("#q").value = state.q;

    function render() {
      $$(".chip", chips).forEach((c) => c.classList.toggle("on", c.dataset.cat === state.cat));
      let list = BOOKS.filter((b) => state.cat === "all" || b.category === state.cat);
      if (state.q.trim()) {
        const q = state.q.trim().toLowerCase();
        list = list.filter((b) =>
          [b.title, b.author, b.subtitle, b.short, catName(b.category), (b.details || []).join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(q)
        );
      }
      if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
      else if (state.sort === "price-desc") list.sort((a, b) => b.price - a.price);
      else if (state.sort === "rating") list.sort((a, b) => b.rating - a.rating);
      else if (state.sort === "new") list = [...list].reverse();

      $("#count").textContent = list.length;
      grid.innerHTML = list.length
        ? list.map(cardHTML).join("")
        : `<div class="empty" style="grid-column:1/-1"><p>لا توجد نتائج مطابقة.</p><button class="btn btn--ghost btn--sm" id="reset">إظهار كل الكتب</button></div>`;
      const reset = $("#reset");
      if (reset)
        reset.addEventListener("click", () => {
          state = { cat: "all", q: "", sort: "featured" };
          $("#q").value = "";
          $("#sort").value = "featured";
          render();
        });
      bindAddButtons(grid);
      observeReveals(grid);
    }

    chips.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      state.cat = b.dataset.cat;
      render();
    });
    $("#q").addEventListener("input", (e) => {
      state.q = e.target.value;
      render();
    });
    $("#sort").addEventListener("change", (e) => {
      state.sort = e.target.value;
      render();
    });
    render();
  }

  function initBook() {
    const host = $("#bookDetail");
    if (!host) return;
    const id = new URLSearchParams(location.search).get("id");
    const b = bookById(id) || BOOKS[0];
    document.title = `${b.title} — ${S.name || "رَفّ"}`;

    host.innerHTML = `
      <div class="detail-cover reveal">
        <img src="${b.cover}" alt="غلاف ${esc(b.title)}">
        <div class="notice" style="margin-top:18px">
          <strong>صيغة الملف:</strong> PDF عالي الجودة، يفتح على الهاتف والحاسوب والقارئ الإلكتروني، بلا حماية تعطّل القراءة.
        </div>
      </div>
      <div class="detail-body">
        <span class="eyebrow">${esc(catName(b.category))}</span>
        <h1>${esc(b.title)}</h1>
        <p class="detail-sub">${esc(b.subtitle)} · ${esc(b.author)}</p>
        <div class="detail-facts">
          <span class="fact"><i style="color:var(--gold);font-style:normal">★</i> ${b.rating.toFixed(1)} (${b.reviews} تقييم)</span>
          <span class="fact">${b.pages} صفحة</span>
          <span class="fact">تحميل فوري</span>
          ${(b.details || []).slice(0, 2).map((d) => `<span class="fact">${esc(d)}</span>`).join("")}
        </div>
        <p class="lead">${esc(b.short)}</p>

        <div class="price-box">
          <div>
            <div class="big">${money(b.price)}</div>
            <div class="usd">${b.oldPrice ? `<s>${money(b.oldPrice)}</s> · ` : ""}تعادل ~ ${b.usd} $ للدفع الدولي</div>
          </div>
          <div style="margin-inline-start:auto;display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn--primary" data-add="${b.id}">${icon("cart")} أضيفي إلى السلة</button>
            <button class="btn btn--ink" id="buyNow">اشتري الآن</button>
          </div>
        </div>

        ${b.sample ? `<p class="small"><a href="${b.sample}" target="_blank" rel="noopener" style="color:var(--wine);font-weight:700;display:inline-flex;gap:8px;align-items:center">${icon("dl")} اقرئي مقتطفاً مجانياً (PDF)</a></p>` : ""}

        <div class="tabs" role="tablist">
          <button class="tab on" data-tab="desc">الوصف</button>
          <button class="tab" data-tab="excerpt">مقتطف</button>
          <button class="tab" data-tab="toc">المحتوى</button>
          <button class="tab" data-tab="info">تفاصيل</button>
        </div>

        <div class="tab-panel prose" id="tab-desc">
          ${b.description.map((p) => `<p>${esc(p)}</p>`).join("")}
          ${b.note ? `<div class="notice">${esc(b.note)}</div>` : ""}
        </div>
        <div class="tab-panel" id="tab-excerpt" hidden>
          <div class="excerpt">${esc(b.excerpt)}</div>
          <p class="small muted" style="margin-top:14px">المقتطف من مقدمة الكتاب. النص الكامل داخل الملف.</p>
        </div>
        <div class="tab-panel" id="tab-toc" hidden>
          <ol class="toc-list">${b.toc.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>
        </div>
        <div class="tab-panel" id="tab-info" hidden>
          <ul class="toc-list" style="list-style:none">
            <li style="border:0;padding:8px 0"><strong style="min-width:120px;font-family:var(--sans);font-size:14px;color:var(--muted)">المؤلف</strong> ${esc(b.author)}</li>
            <li style="border:0;padding:8px 0"><strong style="min-width:120px;font-family:var(--sans);font-size:14px;color:var(--muted)">الفئة</strong> ${esc(catName(b.category))}</li>
            <li style="border:0;padding:8px 0"><strong style="min-width:120px;font-family:var(--sans);font-size:14px;color:var(--muted)">الصفحات</strong> ${b.pages}</li>
            <li style="border:0;padding:8px 0"><strong style="min-width:120px;font-family:var(--sans);font-size:14px;color:var(--muted)">الصيغة</strong> PDF (نسخة واحدة شخصية)</li>
            <li style="border:0;padding:8px 0"><strong style="min-width:120px;font-family:var(--sans);font-size:14px;color:var(--muted)">الوسوم</strong> ${esc((b.details || []).join(" · "))}</li>
          </ul>
        </div>
      </div>`;

    const crumb = $("#crumbTitle");
    if (crumb) crumb.textContent = b.title;

    $$(".tab", host).forEach((t) => {
      t.addEventListener("click", () => {
        $$(".tab", host).forEach((x) => x.classList.toggle("on", x === t));
        $$(".tab-panel", host).forEach((p) => (p.hidden = p.id !== "tab-" + t.dataset.tab));
      });
    });
    bindAddButtons(host);
    $("#buyNow").addEventListener("click", () => {
      addToCart(b.id);
      setTimeout(() => (location.href = "checkout.html"), 260);
    });

    const rel = $("#relatedGrid");
    if (rel) {
      const same = BOOKS.filter((x) => x.id !== b.id && x.category === b.category);
      const others = BOOKS.filter((x) => x.id !== b.id && x.category !== b.category).sort((a, c) => c.rating - a.rating);
      rel.innerHTML = [...same, ...others].slice(0, 4).map(cardHTML).join("");
      bindAddButtons(rel);
    }
    observeReveals();
  }

  /* ---------------- checkout ---------------- */
  function initCheckout() {
    const host = $("#checkoutApp");
    if (!host) return;

    if (!cartItems().length) {
      host.innerHTML = `<div class="panel center" style="grid-column:1/-1;padding:70px 24px">
        <h2>سلتك فارغة</h2>
        <p class="muted">اختاري كتاباً واحداً على الأقل لإتمام الطلب.</p>
        <a class="btn btn--primary" href="shop.html">تصفّحي المكتبة</a>
      </div>`;
      return;
    }

    const payHtml = PAYMENT_METHODS.map(
      (p, i) => `
      <label class="pay-opt ${i === 0 ? "on" : ""}" data-pay="${p.id}">
        <input type="radio" name="pay" value="${p.id}" ${i === 0 ? "checked" : ""}>
        <div>
          <strong>${esc(p.name)}</strong>
          <span>${esc(p.short)}</span>
        </div>
        <span class="cat-ico" style="margin:0 0 0 auto;flex:0 0 auto">${icon(p.icon)}</span>
      </label>`
    ).join("");

    host.innerHTML = `
      <div>
        <div class="panel">
          <h2>1. معلوماتك</h2>
          <p class="hint">تُستعمل لإرسال ملفات PDF ورابط الطلب فقط.</p>
          <form id="orderForm" novalidate>
            <div class="field two">
              <div class="field" style="margin:0">
                <label for="fullname">الاسم الكامل *</label>
                <input id="fullname" name="fullname" required autocomplete="name" placeholder="مثال: نودجود تويل">
              </div>
              <div class="field" style="margin:0">
                <label for="email">البريد الإلكتروني *</label>
                <input id="email" name="email" type="email" required autocomplete="email" placeholder="name@example.com" dir="ltr">
              </div>
            </div>
            <div class="field two" style="margin-top:16px">
              <div class="field" style="margin:0">
                <label for="phone">الهاتف (واتساب)</label>
                <input id="phone" name="phone" inputmode="tel" autocomplete="tel" placeholder="05xx xx xx xx" dir="ltr">
              </div>
              <div class="field" style="margin:0">
                <label for="wilaya">الولاية</label>
                <input id="wilaya" name="wilaya" placeholder="مثال: وهران">
              </div>
            </div>
            <div class="field" style="margin-top:16px">
              <label for="note">ملاحظة (اختياري)</label>
              <textarea id="note" name="note" rows="2" placeholder="مثال: فاتورة باسم مؤسسة"></textarea>
            </div>
            <p class="small muted">بإتمام الطلب أنت توافقين على شروط البيع: ترخيص شخصي للقراءة، بلا إعادة بيع.</p>
          </form>
        </div>

        <div class="panel">
          <h2>2. طريقة الدفع</h2>
          <p class="hint">اختاري الطريقة الأنسب لك، ثم اتبعي الخطوات.</p>
          <div class="pay-options" id="payOptions">${payHtml}</div>
          <div class="pay-detail" id="payDetail"></div>
        </div>

        <button class="btn btn--primary btn--wide" id="placeOrder" style="margin-top:24px">تأكيد الطلب</button>
        <div id="orderResult"></div>
      </div>

      <aside class="summary">
        <div class="panel">
          <h2 style="font-size:1.2rem">طلبك</h2>
          <div id="sumItems" style="margin:6px 0 16px"></div>
          <div class="line"><span>المجموع الفرعي</span><span>${money(cartTotal())}</span></div>
          <div class="line"><span>التوصيل الرقمي</span><span style="color:var(--green);font-weight:700">مجاني</span></div>
          <div class="total"><span>المجموع</span><span>${money(cartTotal())}</span></div>
          <p class="small muted" style="margin-top:14px">${icon("shield")} لا نحتفظ بمعلومات البطاقة البنكية. الدفع يتم عبر صفحة البنك.</p>
        </div>
      </aside>`;

    $("#sumItems").innerHTML = cartItems()
      .map(
        (i) => `<div class="mini-item">
          <img src="${i.book.cover}" alt="">
          <div><strong style="font-family:var(--serif)">${esc(i.book.title)}</strong><br><span class="small muted">${i.qty} × ${money(i.book.price)}</span></div>
          <strong>${money(i.book.price * i.qty)}</strong>
        </div>`
      )
      .join("");

    function paintPay() {
      const sel = $('input[name="pay"]:checked');
      const p = PAYMENT_METHODS.find((x) => x.id === sel.value) || PAYMENT_METHODS[0];
      $$(".pay-opt").forEach((o) => o.classList.toggle("on", o.dataset.pay === p.id));
      let extra = "";
      if (p.id === "baridimob" && S.baridimob) extra = `<p style="margin:10px 0 0"><strong>الحساب:</strong> <span dir="ltr">${esc(S.baridimob)}</span></p>`;
      if (p.id === "ccp" && S.ccp) extra = `<p style="margin:10px 0 0"><strong>الحساب البريدي:</strong> <span dir="ltr">${esc(S.ccp)}</span></p>`;
      if (p.id === "cib" && S.cardGateway) extra = `<p style="margin:10px 0 0"><a href="${esc(S.cardGateway)}" target="_blank" rel="noopener" style="color:var(--wine);font-weight:700">بوابة الدفع بالبطاقة ›</a></p>`;
      $("#payDetail").innerHTML = `<strong>${esc(p.name)}</strong> — ${esc(p.note)}
        <ol>${p.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>${extra}`;
    }
    $("#payOptions").addEventListener("change", paintPay);
    $$(".pay-opt").forEach((o) => o.addEventListener("click", () => setTimeout(paintPay, 0)));
    paintPay();

    function orderCode() {
      const d = new Date();
      const p = (n) => String(n).padStart(2, "0");
      const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
      return `RF-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${rnd}`;
    }

    $("#placeOrder").addEventListener("click", () => {
      const f = $("#orderForm");
      const name = $("#fullname").value.trim();
      const email = $("#email").value.trim();
      if (!name) return fail("fullname", "اكتبي الاسم الكامل.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail("email", "البريد الإلكتروني غير صحيح.");

      const payName = PAYMENT_METHODS.find((x) => x.id === $('input[name="pay"]:checked').value).name;
      const code = orderCode();
      const itemsTxt = cartItems().map((i) => `• ${i.book.title} × ${i.qty} = ${money(i.book.price * i.qty)}`).join("\n");
      const body = `طلب جديد من ${S.name || "رَفّ"}\nرقم الطلب: ${code}\nالاسم: ${name}\nالبريد: ${email}\nالهاتف: ${$("#phone").value.trim() || "—"}\nالولاية: ${$("#wilaya").value.trim() || "—"}\nطريقة الدفع: ${payName}\nملاحظة: ${$("#note").value.trim() || "—"}\n\n${itemsTxt}\n\nالمجموع: ${money(cartTotal())}`;

      $("#orderResult").innerHTML = `
        <div class="panel" id="donePanel" style="border-color:#BFE0D2">
          <div class="confirm-box">
            <strong style="font-size:1.1rem">تم تسجيل طلبك ✅</strong>
            <p style="margin:8px 0 0">احتفظي برقم الطلب وأرسليه مع إثبات الدفع إن كانت طريقتك تحويلاً.</p>
            <div class="order-code">${code}</div>
            <div class="copybar">
              <button class="btn btn--ghost btn--sm" id="copyOrder">نسخ تفاصيل الطلب</button>
              ${S.whatsapp ? `<a class="btn btn--primary btn--sm" id="waOrder" target="_blank" rel="noopener">إرسال الطلب على واتساب</a>` : ""}
              ${S.email ? `<a class="btn btn--ink btn--sm" id="mailOrder">إرسال بالبريد</a>` : ""}
              <a class="btn btn--ghost btn--sm" href="shop.html">متابعة التسوق</a>
            </div>
            <p class="small" style="margin:14px 0 0">بعد تأكيد الدفع يصلك رابط تحميل كل كتاب على البريد <b dir="ltr">${esc(email)}</b> — عادة في أقل من ساعة عمل، وخلال 5 دقائق للدفع بالبطاقة أو PayPal.</p>
          </div>
        </div>`;

      const waText = encodeURIComponent(body);
      const wa = $("#waOrder");
      if (wa) wa.href = `https://wa.me/${S.whatsapp.replace(/\D/g, "")}?text=${waText}`;
      const mail = $("#mailOrder");
      if (mail) mail.href = `mailto:${S.email}?subject=${encodeURIComponent("طلب " + code)}&body=${waText}`;

      $("#copyOrder").addEventListener("click", () => {
        navigator.clipboard
          .writeText(body)
          .then(() => ($("#copyOrder").textContent = "تم النسخ ✓"))
          .catch(() => ($("#copyOrder").textContent = "تعذّر النسخ، اختاري النص يدوياً"));
      });
      $("#donePanel").scrollIntoView({ behavior: "smooth", block: "center" });
    });

    function fail(id, msg) {
      const el = $("#" + id);
      el.focus();
      el.style.borderColor = "#C0392B";
      el.style.boxShadow = "0 0 0 3px rgba(192,57,43,.14)";
      const old = $(".form-err");
      if (old) old.remove();
      const p = document.createElement("p");
      p.className = "form-err small";
      p.style.cssText = "color:#C0392B;font-weight:700;margin:8px 0 0";
      p.textContent = msg;
      el.closest(".field").appendChild(p);
    }
  }

  /* ---------------- contact ---------------- */
  function initContact() {
    const form = $("#contactForm");
    if (!form) return;
    const note = $("#contatNote");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#cname").value.trim() || "قارئ";
      const msg = $("#cmsg").value.trim();
      if (!msg) return;
      const body = encodeURIComponent(`من: ${name}\nالبريد: ${$("#cemail").value.trim() || "—"}\n\n${msg}`);
      if (S.email) {
        location.href = `mailto:${S.email}?subject=${encodeURIComponent("رسالة من موقع رَفّ")}&body=${body}`;
      } else {
        navigator.clipboard.writeText(decodeURIComponent(body)).then(() => {
          note.textContent = "نُسخت الرسالة. أرسليها على حساب المتجر عند توفّره.";
          note.style.display = "block";
        });
      }
    });
  }

  /* ---------------- header / nav ---------------- */
  function initChrome() {
    paintCartCount();
    renderDrawer();

    const burger = $("#burger");
    const links = $("#navLinks");
    if (burger && links) burger.addEventListener("click", () => links.classList.toggle("on"));
    $$("#navLinks a").forEach((a) => a.addEventListener("click", () => links && links.classList.remove("on")));

    $$("[data-open-cart]").forEach((b) =>
      b.addEventListener("click", (e) => {
        e.preventDefault();
        openDrawer();
      })
    );

    /* حقول الاتصال التي تعتمد على الإعدادات */
    $$("[data-store-email]").forEach((el) => {
      if (S.email) {
        el.textContent = S.email;
        if (el.tagName === "A") el.href = "mailto:" + S.email;
      } else {
        el.closest("[data-if-contact]")?.remove();
      }
    });
    $$("[data-store-wa]").forEach((el) => {
      if (S.whatsapp) {
        el.href = "https://wa.me/" + S.whatsapp.replace(/\D/g, "");
        el.textContent = "واتساب المتجر";
      } else {
        el.closest("[data-if-contact]")?.remove();
      }
    });
    $$("[data-store-ig]").forEach((el) => {
      if (S.instagram) el.href = "https://instagram.com/" + S.instagram;
      else el.closest("[data-if-contact]")?.remove();
    });

    observeReveals();
  }

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initChrome();
    const page = document.body.dataset.page;
    if (page === "home") initIndex();
    if (page === "shop") initShop();
    if (page === "book") initBook();
    if (page === "checkout") initCheckout();
    if (page === "contact") initContact();
    observeReveals();
  });

  window.RAFF = { addToCart, cartItems, cartTotal, money };
})();
