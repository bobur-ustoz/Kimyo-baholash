// Kichik yordamchilar
window.UI = (function () {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => (n ? Number(n).toLocaleString('ru-RU').replace(/ /g, ' ') + " so'm" : '—');
  function timeAgo(t) {
    if (!t) return '';
    const d = (Date.now() - t) / 1000;
    if (d < 60) return 'hozir';
    if (d < 3600) return Math.floor(d / 60) + ' daqiqa oldin';
    if (d < 86400) return Math.floor(d / 3600) + ' soat oldin';
    if (d < 7 * 86400) return Math.floor(d / 86400) + ' kun oldin';
    return new Date(t).toLocaleDateString('uz-UZ');
  }
  const timeHM = (t) => new Date(t).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

  function toast(msg, kind) {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, kind === "warn" ? 4500 : 2800);
  }

  function confirm(msg, okLabel) {
    return new Promise((res) => {
      const m = document.createElement('div');
      m.className = 'modal-back';
      m.innerHTML = `<div class="modal"><p>${esc(msg)}</p><div class="row end gap"><button class="btn ghost" data-x="0">Bekor</button><button class="btn danger" data-x="1">${esc(okLabel || 'Ha')}</button></div></div>`;
      m.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (b) { res(b.dataset.x === '1'); m.remove(); } else if (e.target === m) { res(false); m.remove(); } });
      document.body.appendChild(m);
    });
  }

  function prompt(msg, placeholder) {
    return new Promise((res) => {
      const m = document.createElement('div');
      m.className = 'modal-back';
      m.innerHTML = `<div class="modal"><p>${esc(msg)}</p><textarea class="in" rows="3" placeholder="${esc(placeholder || '')}"></textarea><div class="row end gap" style="margin-top:12px"><button class="btn ghost" data-x="0">Bekor</button><button class="btn primary" data-x="1">Yuborish</button></div></div>`;
      const ta = m.querySelector('textarea');
      m.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (b) { res(b.dataset.x === '1' ? ta.value.trim() : null); m.remove(); } });
      document.body.appendChild(m); ta.focus();
    });
  }

  // Forma qiymatlarini obyektga yig'ish
  function formData(form) {
    const o = {};
    for (const el of form.elements) {
      if (!el.name) continue;
      if (el.type === 'checkbox') { (o[el.name] = o[el.name] || []); if (el.checked) o[el.name].push(el.value); }
      else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; }
      else if (el.type === 'number') o[el.name] = el.value === '' ? null : Number(el.value);
      else o[el.name] = el.value.trim();
    }
    return o;
  }
  // Majburiy maydonlarni tekshirish; xato bo'lsa birinchi maydonga fokus
  function validate(form) {
    let first = null;
    form.querySelectorAll('.err').forEach((e) => e.classList.remove('err'));
    for (const el of form.querySelectorAll('[required]')) {
      let ok = el.type === 'checkbox' ? form.querySelector(`[name="${el.name}"]:checked`) : el.value.trim() !== '';
      if (!ok) { (el.closest('.field') || el).classList.add('err'); first = first || el; }
    }
    if (first) { first.focus(); toast("Yulduzchali maydonlarni to'ldiring", 'warn'); return false; }
    return true;
  }

  const select = (name, opts, val, extra) =>
    `<select class="in" name="${name}" ${extra || ''}>${opts.map((o) => { const v = o.v !== undefined ? o.v : o, l = o.l !== undefined ? o.l : o; return `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;

  // Rasmni kichraytirib dataURL qiladi
  function readImage(file, max) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const k = Math.min(1, (max || 320) / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          res(c.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = rej; img.src = r.result;
      };
      r.onerror = rej; r.readAsDataURL(file);
    });
  }

  const initials = (name) => (name || '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const avatar = (name, rasm, cls) => rasm ? `<img class="avatar ${cls || ''}" src="${rasm}" alt="">` : `<div class="avatar ${cls || ''}">${esc(initials(name))}</div>`;

  return { esc, money, timeAgo, timeHM, toast, confirm, prompt, formData, validate, select, readImage, avatar, initials };
})();
