/* ============================================================
   لوحة التسليم — أداة داخلية لمكتبة رَفّ
   تحفظ روابط الملفات في المتصفح، وتُركّب رسالة التسليم للزبون.
   ============================================================ */
(function () {
  const KEY = "raff_library_v1";
  const $ = (s, r = document) => r.querySelector(s);
  const store = window.STORE || {};

  function loadLinks() {
    const base = {};
    Object.keys(window.LIBRARY || {}).forEach((id) => (base[id] = (window.LIBRARY[id] || {}).link || ""));
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      Object.keys(saved).forEach((id) => { if (id in base) base[id] = saved[id]; });
    } catch (e) { /* تجاهل */ }
    return base;
  }

  function saveLinks(links) {
    localStorage.setItem(KEY, JSON.stringify(links));
  }

  let links = loadLinks();

  /* ---------------- مكتبة الملفات ---------------- */
  function renderLibrary() {
    const host = $("#libGrid");
    host.innerHTML = BOOKS.map((b) => {
      const link = links[b.id] || "";
      const ok = !!link.trim();
      return `
      <div class="lib-row ${ok ? "is-ok" : ""}" data-id="${b.id}">
        <img src="${b.cover}" alt="" loading="lazy">
        <div class="lib-main">
          <strong>${b.title}</strong>
          <span class="small muted">${b.pages} صفحة · ${b.author}</span>
          <input type="url" class="lib-input" data-link="${b.id}"
            placeholder="https://drive.google.com/… رابط ملف PDF" value="${link.replace(/"/g, "&quot;")}">
        </div>
        <span class="lib-chip">${ok ? "جاهز" : "ناقص"}</span>
      </div>`;
    }).join("");

    host.querySelectorAll(".lib-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const id = inp.dataset.link;
        links[id] = inp.value.trim();
        saveLinks(links);
        const row = inp.closest(".lib-row");
        const ok = !!links[id];
        row.classList.toggle("is-ok", ok);
        row.querySelector(".lib-chip").textContent = ok ? "جاهز" : "ناقص";
        updateStats();
      });
    });
    updateStats();
  }

  function updateStats() {
    const total = BOOKS.length;
    const ready = BOOKS.filter((b) => (links[b.id] || "").trim()).length;
    $("#libStats").textContent = `${ready} من ${total} ملفاً جاهزاً`;
    $("#libBar").style.width = (ready / total) * 100 + "%";

    $("#bookPicker").innerHTML = BOOKS.map((b) => {
      const ok = !!(links[b.id] || "").trim();
      return `<label class="pick ${ok ? "" : "is-missing"}">
        <input type="checkbox" value="${b.id}">
        <span>${b.title}</span>
        <em>${ok ? "" : "بلا ملف"}</em>
      </label>`;
    }).join("");
    $("#bookPicker").querySelectorAll("input").forEach((c) => c.addEventListener("change", build));
  }

  /* ---------------- تركيب رسالة التسليم ---------------- */
  function code() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `RF-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${rnd}`;
  }

  function selected() {
    return [...$("#bookPicker").querySelectorAll("input:checked")].map((c) => c.value);
  }

  function build() {
    const name = $("#custName").value.trim();
    const order = $("#orderCode").value.trim() || "(بلا رقم)";
    const method = $("#payMethod").value;
    const ids = selected();
    const out = $("#message");
    const warn = $("#warn");

    if (!ids.length) {
      out.value = "";
      warn.textContent = "";
      $("#copyMsg").disabled = true;
      return;
    }

    const missing = ids.filter((id) => !(links[id] || "").trim());
    const lines = ids.map((id, i) => {
      const b = BOOKS.find((x) => x.id === id);
      const link = (links[id] || "").trim() || "— الملف لم يُرفع بعد —";
      return `${i + 1}) ${b.title}\n   ${link}`;
    });

    const body = [
      `مرحباً${name ? " " + name : ""}،`,
      ``,
      `تم تأكيد طلبك رقم ${order} في مكتبة رَفّ (${method}). شكراً لثقتك.`,
      ``,
      `كتبك جاهزة للتحميل:`,
      ...lines,
      ``,
      `ملاحظات:`,
      `• الرابط خاص بك، نرجو عدم مشاركته.`,
      `• الملفات بصيغة PDF تُفتح على الهاتف والحاسوب ويمكن طباعتها لاستعمالك الشخصي.`,
      `• إن لم يعمل أي رابط، راسلينا على هذا البريد ونرسل نسخة جديدة فوراً.`,
      ``,
      `— ${store.name || "رَفّ"} · ${store.tagline || "مكتبة رقمية عربية"}`
    ].join("\n");

    out.value = body;
    warn.textContent = missing.length
      ? `تنبيه: ${missing.length} كتاباً بلا رابط ملف (${missing.map((id) => BOOKS.find((b) => b.id === id).title).join("، ")}). لن يعمل الرابط في الرسالة.`
      : "";
    warn.style.color = missing.length ? "#B4452F" : "";
    $("#copyMsg").disabled = false;
  }

  function copy() {
    const t = $("#message");
    t.select();
    navigator.clipboard.writeText(t.value).catch(() => document.execCommand("copy"));
    const b = $("#copyMsg");
    const old = b.textContent;
    b.textContent = "تم النسخ ✓";
    setTimeout(() => (b.textContent = old), 1600);
  }

  function total() {
    const ids = selected();
    const sum = ids.reduce((s, id) => s + (BOOKS.find((b) => b.id === id) || {}).price || 0, 0);
    $("#orderTotal").textContent = ids.length ? `${sum.toLocaleString("fr-DZ")} دج` : "—";
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderLibrary();

    $("#newCode").addEventListener("click", () => {
      $("#orderCode").value = code();
      build();
    });
    ["custName", "orderCode", "payMethod"].forEach((id) =>
      $("#" + id).addEventListener("input", build));
    $("#bookPicker").addEventListener("change", total);
    $("#copyMsg").addEventListener("click", copy);

    $("#exportLib").addEventListener("click", () => {
      const rows = BOOKS.map((b) => {
        const l = (links[b.id] || "").trim();
        return `  "${b.id}":${" ".repeat(Math.max(1, 30 - b.id.length))}{ link: ${JSON.stringify(l)}, note: "" }`;
      }).join(",\n");
      const text = `window.LIBRARY = {\n${rows}\n};\n`;
      navigator.clipboard.writeText(text).catch(() => {});
      const box = document.createElement("textarea");
      box.value = text;
      document.body.appendChild(box);
      box.select();
      document.execCommand("copy");
      box.remove();
      const b = $("#exportLib");
      b.textContent = "تم نسخ الكود ✓";
      setTimeout(() => (b.textContent = "نسخ كود library.js"), 1800);
    });

    $("#sendWhats").addEventListener("click", () => {
      const num = (store.whatsapp || "").replace(/\D/g, "");
      if (!num) {
        alert("أضيفي رقم واتساب المتجر في assets/js/config.js أولاً.");
        return;
      }
      window.open(`https://wa.me/${num}?text=${encodeURIComponent($("#message").value)}`, "_blank");
    });

    $("#sendMail").addEventListener("click", () => {
      const subj = `طلبك ${$("#orderCode").value || ""} — كتبك جاهزة للتحميل`;
      window.location.href = `mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent($("#message").value)}`;
    });

    // أول رقم طلب جاهز
    $("#orderCode").value = code();
    build();
    total();
  });
})();
