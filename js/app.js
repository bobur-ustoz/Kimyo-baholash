// Top Xodim — ekranlar va marshrutlar
window.App = (function () {
  const { esc, money, timeAgo, timeHM, toast, select, avatar } = UI;
  const root = () => document.getElementById('app');
  let user = null, cand = null, emp = null;
  const L = { positions: {}, subjects: {} };
  const posName = (id) => (L.positions[id] || {}).nomi || '—';
  const subjName = (id) => (L.subjects[id] || {}).nomi || '—';
  const activePositions = () => Object.values(L.positions).filter((p) => p.faol).sort((a, b) => a.tartib - b.tartib);
  const reqTitle = (r) => posName(r.position_id);
  const isOquv = (pid) => !!(L.positions[pid] && L.positions[pid].bolim === 'oquv');
  const posByBolim = (b) => activePositions().filter((p) => (p.bolim || 'mamuriyat') === b);
  const posOptions = (bolim, val) => posByBolim(bolim).map((p) => `<option value="${p.id}" ${p.id === val ? 'selected' : ''}>${esc(p.nomi)}</option>`).join('');
  const activeSubjects = () => Object.values(L.subjects).filter((s) => s.faol).sort((a, b) => a.tartib - b.tartib);
  const go = (h) => { location.hash = h; };
  const on = (sel, ev, fn) => root().querySelectorAll(sel).forEach((el) => el.addEventListener(ev, fn));

  async function loadLookups() {
    L.positions = {}; L.subjects = {};
    (await Store.list('positions')).forEach((p) => (L.positions[p.id] = p));
    (await Store.list('subjects')).forEach((s) => (L.subjects[s.id] = s));
  }
  async function loadContext() {
    user = await Auth.current();
    cand = user && user.rol === 'nomzod' ? (await Store.list('candidates', (c) => c.user_id === user.id))[0] || null : null;
    emp = user && user.rol === 'ish_beruvchi' ? (await Store.list('employers', (e) => e.user_id === user.id))[0] || null : null;
  }

  // ---------- Sahifa qobig'i ----------
  async function unread() {
    if (!user) return 0;
    const convs = await Store.list('conversations', (c) => (cand && c.candidate_id === cand.id) || (emp && c.employer_id === emp.id));
    const ids = new Set(convs.map((c) => c.id));
    return (await Store.list('messages', (m) => ids.has(m.conversation_id) && m.sender_user_id !== user.id && !m.read)).length;
  }
  async function page({ title, body, back, nav = true, wide = false, brand = false }) {
    document.body.dataset.role = user ? user.rol : '';
    document.body.classList.toggle('no-nav', !nav || !user);
    const n = await unread();
    const items = !user ? [] : user.rol === 'nomzod'
      ? [['/nomzod/cv', '📄', 'CV'], ['/nomzod/xabarlar', '💬', 'Xabarlar', n], ['/nomzod/profil/1', '✏️', 'Tahrirlash']]
      : user.rol === 'ish_beruvchi'
        ? [['/ish-beruvchi', '🔎', "So'rovlar"], ['/ish-beruvchi/saqlanganlar', '⭐', 'Saqlanganlar'], ['/ish-beruvchi/xabarlar', '💬', 'Xabarlar', n]]
        : [['/admin?tab=lavozimlar', '🗂', 'Lavozimlar'], ['/admin?tab=fanlar', '📚', 'Fanlar'], ['/admin?tab=foydalanuvchilar', '👥', 'Odamlar'], ['/admin?tab=shikoyatlar', '⚠️', 'Shikoyatlar']];
    const cur = location.hash.replace(/^#/, '');
    root().innerHTML = `
      <header class="top">
        ${back ? `<button class="iconbtn" data-go="${esc(back)}" aria-label="Orqaga">←</button>` : ''}
        <div class="title">${brand ? '<span class="brand">Top <span>Xodim</span></span>' : esc(title)}</div>
        ${user ? `<button class="iconbtn" id="userbtn" title="${esc(user.name)}">${avatar(user.name, user.rasm, '')}</button>` : ''}
      </header>
      <main class="page ${wide ? 'wide' : ''}">${body}</main>
      ${nav && user ? `<nav class="nav">${items.map(([h, ic, l, b]) => `<a href="#${h}" class="${cur.startsWith(h.split('?')[0]) && (h.indexOf('?') < 0 || cur === h) ? 'active' : ''}"><span class="ic">${ic}</span>${l}${b ? `<span class="badge">${b}</span>` : ''}</a>`).join('')}</nav>` : ''}`;
    const ub = root().querySelector('#userbtn');
    if (ub) ub.onclick = () => {
      const m = document.createElement('div'); m.className = 'modal-back';
      m.innerHTML = `<div class="modal"><div class="row gap mb">${avatar(user.name, user.rasm)}<div><b>${esc(user.name)}</b><div class="small muted">${user.rol === 'nomzod' ? 'Nomzod' : user.rol === 'ish_beruvchi' ? 'Ish beruvchi' : 'Admin'}</div></div></div>
        <div class="col" style="gap:8px"><button class="btn block" data-x="home">🏠 Bosh sahifa</button><button class="btn block danger" data-x="out">Chiqish — boshqa hisob bilan kirish</button><button class="btn block ghost" data-x="no">Bekor</button></div></div>`;
      m.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (b) { m.remove(); if (b.dataset.x === 'out') { Auth.logout(); go('/'); } else if (b.dataset.x === 'home') go('/'); } else if (e.target === m) m.remove(); });
      document.body.appendChild(m);
    };
    window.scrollTo(0, 0);
  }
  document.addEventListener('click', (e) => { const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); go(g.dataset.go); } });

  // ---------- Bosh menyu va kirish ----------
  async function home() {
    await page({ brand: true, nav: false, body: `
      <div style="padding:24px 0 8px"><h1 style="font-size:30px">Kimni izlayapsiz?</h1><p class="muted">O'quv markazlar va maktablar uchun xodim topish ilovasi</p></div>
      <a class="role-card cand" href="#/kirish?rol=nomzod"><b>Ish kerak</b><span>Men xodimman — CV yarataman, ish beruvchilar meni topadi</span></a>
      <a class="role-card emp" href="#/kirish?rol=ish_beruvchi"><b>Ishchi kerak</b><span>Men ish beruvchiman — talab kiritaman, mos nomzodlarni topaman</span></a>
      ${user ? `<div class="card mt row between gap"><div><b>${esc(user.name)}</b><div class="small muted">${user.rol === 'nomzod' ? 'Nomzod' : user.rol === 'ish_beruvchi' ? 'Ish beruvchi' : 'Admin'} sifatida kirgansiz</div></div><div class="col" style="gap:6px"><button class="btn primary sm" data-go="${roleHome()}">Davom etish</button><button class="btn sm ghost" id="logout">Chiqish</button></div></div>` : ''}
      <p class="tiny muted center mt">${esc(CONFIG.APP_NAME)} · ${CONFIG.VERSION}${CONFIG.DEMO ? ' · demo rejim' : ''}${user && user.rol === 'admin' ? '' : ' · <a href="#/kirish?rol=admin">admin</a>'}</p>` });
    const lo = root().querySelector('#logout'); if (lo) lo.onclick = () => { Auth.logout(); render(); };
  }
  function roleHome() {
    if (!user) return '/';
    if (user.rol === 'nomzod') return cand && cand.step_done >= 4 ? '/nomzod/cv' : '/nomzod/profil/' + ((cand && cand.step_done || 0) + 1);
    if (user.rol === 'ish_beruvchi') return emp ? '/ish-beruvchi' : '/ish-beruvchi/tashkilot';
    return '/admin?tab=lavozimlar';
  }
  async function afterLogin(u, rol) {
    await loadContext();
    if (u.bloklangan) { Auth.logout(); await loadContext(); toast('Bu hisob bloklangan', 'warn'); return go('/'); }
    if (u.rol !== rol) toast(`Bu hisob ${u.rol === 'nomzod' ? 'nomzod' : u.rol === 'ish_beruvchi' ? 'ish beruvchi' : 'admin'} sifatida ro'yxatdan o'tgan`, 'warn');
    go(roleHome());
  }
  async function login(q) {
    const rol = q.rol || 'nomzod';
    const rl = { nomzod: 'Nomzod', ish_beruvchi: 'Ish beruvchi', admin: 'Admin' }[rol];
    const demos = CONFIG.DEMO ? await Store.list('users', (u) => u.rol === rol && !u.bloklangan) : [];
    document.body.dataset.role = rol;
    await page({ title: rl + ' — kirish', back: '/', nav: false, body: `
      <div class="card"><h3>Telegram orqali kirish</h3><p class="small muted">Telegram hisobingiz bilan bir marta tasdiqlaysiz, parol kerak emas. Xabarlar ham Telegram botdan keladi.</p>
        <div id="tg" class="mt"></div></div>
      ${CONFIG.DEMO && rol !== 'admin' ? `<div class="card mt"><h3>Sinov uchun</h3><p class="small muted">Bo'sh hisob ochib, ${rol === 'nomzod' ? "4 qadamni o'zingiz to'ldirasiz — CV shakllanadi" : "tashkilot va so'rovni o'zingiz kiritasiz"}.</p>
        <button class="btn primary block mt" id="newdemo">+ Yangi hisob — o'zim to'ldiraman</button></div>` : ''}
      ${CONFIG.DEMO ? `<details class="card mt near" ${rol === 'admin' ? 'open' : ''}><summary>Tayyor to'ldirilgan namunalar (${demos.length})</summary><p class="small muted">Ma'lumotlari oldindan kiritilgan hisoblar — natijalar va chatni ko'rish uchun. Haqiqiy ilovada bu bo'lim bo'lmaydi.</p>
        <div class="list mt">${demos.map((u) => `<a class="item" data-demo="${u.id}">${avatar(u.name, u.rasm)}<div class="grow"><div class="t">${esc(u.name)}</div><div class="s">${esc(u.telegram_username ? '@' + u.telegram_username : u.telefon || '')}</div></div><span class="muted">→</span></a>`).join('')}</div></details>` : ''}` });
    document.body.dataset.role = rol;
    if (!Auth.mountTelegramWidget(root().querySelector('#tg'), rol))
      root().querySelector('#tg').innerHTML = `<button class="btn tg block" disabled>Telegram orqali kirish</button><p class="hint">${CONFIG.TELEGRAM_BOT ? '@' + esc(CONFIG.TELEGRAM_BOT) + ' — Firebase ulangach ishga tushadi.' : 'Telegram bot hali ulanmagan.'} Hozircha demo hisob bilan kiring.</p>`;
    on('[data-demo]', 'click', async (e) => { const u = await Auth.login(e.currentTarget.dataset.demo); afterLogin(u, rol); });
    const nd = root().querySelector('#newdemo');
    if (nd) nd.onclick = async () => {
      const name = await UI.prompt('Ismingiz (demo)', 'Masalan: Aziz Karimov');
      if (!name) return;
      const u = await Store.add('users', { name, rol, telegram_id: null, telegram_username: '', telefon: '', bloklangan: false });
      await Auth.login(u.id); afterLogin(u, rol);
    };
  }
  function guard(rol) {
    if (!user) { go('/kirish?rol=' + rol); return false; }
    if (user.rol !== rol) { go(roleHome()); return false; }
    return true;
  }

  // ---------- Nomzod: profil qadamlari ----------
  const STEP_TITLES = ["Shaxsiy ma'lumot", 'Lavozim va ish sharti', "Tajriba va ma'lumot", 'Sertifikatlar'];
  function stepsBar(n) { return `<div class="steps">${[1, 2, 3, 4].map((i) => `<i class="${i <= n ? 'done' : ''}"></i>`).join('')}</div><p class="small muted">${n}-qadam / 4 · ${STEP_TITLES[n - 1]}</p>`; }
  const F = (name, label, input, req) => `<div class="field ${req ? 'req' : ''}"><label>${label}</label>${input}</div>`;

  async function profilStep(nStr) {
    if (!guard('nomzod')) return;
    const n = Math.min(4, Math.max(1, +nStr || 1));
    const c = cand || { lavozimlar: [], ish_joylari: [], ingliz: {}, boshqa_tillar: [], fan_sert: [], a_level: [], boshqa_sert: [], holat: 'faol', step_done: 0 };
    if (n > (c.step_done || 0) + 1) return go('/nomzod/profil/' + ((c.step_done || 0) + 1));
    let body = '';
    if (n === 1) body = `
      <div class="photo mb">${avatar(c.fish || user.name, c.rasm, 'lg')}<div><label class="btn sm" for="rasm">Rasm tanlash</label><input type="file" id="rasm" accept="image/*" hidden><div class="hint">Ixtiyoriy. CV'da ko'rinadi</div></div></div>
      ${F('fish', 'Familiya, ism, sharif', `<input class="in" name="fish" required value="${esc(c.fish || user.name)}">`, 1)}
      <div class="grid2">${F('tugilgan_sana', "Tug'ilgan sana", `<input class="in" type="date" name="tugilgan_sana" required value="${esc(c.tugilgan_sana || '')}" max="${new Date(Date.now() - 16 * 365.25 * 86400000).toISOString().slice(0, 10)}">`, 1)}
      ${F('jins', 'Jinsi', `<div class="radios">${DATA.JINS.map((j) => `<label><input type="radio" name="jins" value="${j.v}" required ${c.jins === j.v ? 'checked' : ''}>${j.l}</label>`).join('')}</div>`, 1)}</div>
      <div class="grid2">${F('viloyat', 'Viloyat', select('viloyat', DATA.REGIONS, c.viloyat || 'Toshkent shahri'), 1)}${F('tuman', 'Shahar / tuman', `<input class="in" name="tuman" value="${esc(c.tuman || '')}" placeholder="Yunusobod">`)}</div>
      ${F('telefon', 'Telefon', `<input class="in" type="tel" name="telefon" required value="${esc(c.telefon || user.telefon || '')}" placeholder="+998 90 123 45 67"><div class="hint">Faqat siz bilan chat boshlagan ish beruvchiga ko'rinadi</div>`, 1)}`;
    if (n === 2) body = `
      ${F('lavozimlar', 'Qaysi lavozimlarga tayyorsiz? (bir nechta)', DATA.BOLIMLAR.map((b) => { const sel = posByBolim(b.v).filter((p) => c.lavozimlar.includes(p.id)).length; return `<details class="acc" data-bolim="${b.v}" ${sel ? 'open' : ''}><summary><span>${esc(b.l)}</span><span class="cnt">${sel ? sel + ' tanlandi' : posByBolim(b.v).length + ' ta lavozim'}</span></summary><div class="chips">${posByBolim(b.v).map((p) => `<label class="chip"><input type="checkbox" name="lavozimlar" value="${p.id}" required ${c.lavozimlar.includes(p.id) ? 'checked' : ''}>${esc(p.nomi)}</label>`).join('')}</div></details>`; }).join(''), 1)}
      <div id="oquvblock" class="card soft" style="margin-bottom:14px" ${(c.lavozimlar || []).some(isOquv) ? '' : 'hidden'}>${F('dars_tillari', "Qaysi tillarda dars bera olasiz? (bir nechta)", `<div class="chips">${DATA.DARS_TILLARI.map((t) => `<label class="chip"><input type="checkbox" name="dars_tillari" value="${esc(t)}" ${(c.dars_tillari || []).includes(t) ? 'checked' : ''}>${esc(t)} tilida</label>`).join('')}</div><div class="hint">Ish beruvchi «Kimyo (rus)» deb qidirsa shu bo'yicha topadi</div>`, 1)}</div>
      ${F('stavka', 'Ish sharti', select('stavka', DATA.STAVKA, c.stavka || 'toliq'), 1)}
      <div class="grid2">${F('kutilgan_maosh', "Kutilgan maosh (so'm, oyiga)", `<input class="in" type="number" name="kutilgan_maosh" required min="0" step="100000" value="${c.kutilgan_maosh || ''}">`, 1)}
      ${F('boshlash_sanasi', 'Qachondan boshlay olasiz', select('boshlash_sanasi', [{ v: 'hoziroq', l: 'Hoziroq' }, { v: '1_hafta', l: '1 hafta ichida' }, { v: '1_oy', l: '1 oy ichida' }], c.boshlash_sanasi || 'hoziroq'), 1)}</div>`;
    if (n === 3) body = `
      <div class="grid2">${F('staj_yil', 'Umumiy ish staji (yil)', `<input class="in" type="number" name="staj_yil" required min="0" max="50" value="${c.staj_yil ?? ''}"><div class="hint">0 — tajribasiz</div>`, 1)}
      ${F('malumot', "Ma'lumot", select('malumot', DATA.MALUMOT, c.malumot || 3), 1)}</div>
      ${F('oqigan_joyi', "O'quv yurti", `<input class="in" name="oqigan_joyi" required value="${esc(c.oqigan_joyi || '')}" placeholder="Toshkent davlat pedagogika universiteti">`, 1)}
      <div class="grid3">${F('yonalish', "Yo'nalish", `<input class="in" name="yonalish" value="${esc(c.yonalish || '')}" placeholder="Matematika">`)}${F('oqish_yil_dan', 'O\'qigan yillari, dan', `<input class="in" type="number" name="oqish_yil_dan" min="1960" max="2040" value="${c.oqish_yil_dan || ''}" placeholder="2019">`)}${F('oqish_yil_gacha', 'gacha', `<input class="in" type="number" name="oqish_yil_gacha" min="1960" max="2040" value="${c.oqish_yil_gacha || ''}" placeholder="2023">`)}</div>
      <div class="field"><label>Oldingi ish joylari <span class="muted" style="font-weight:400">(ixtiyoriy — yozsangiz CV'da ko'rinadi)</span></label>
        <div class="rows" id="ish">${(c.ish_joylari || []).map(jobRow).join('')}</div>
        <button type="button" class="btn sm mt" id="addjob">+ Ish joyi qo'shish</button></div>`;
    if (n === 4) {
      const ing = c.ingliz || {};
      body = `
      <div class="card soft mb"><b>Ingliz tili</b>
        <div class="grid2 mt">${F('ingliz_shkala', 'Sertifikat turi', select('ingliz_shkala', [{ v: '', l: "Yo'q" }, 'IELTS', 'CEFR', { v: 'milliy', l: 'Milliy sertifikat' }], ing.shkala || ''))}
        <div class="field"><label>Daraja / ball</label><span id="ingq">${ingQiymat(ing.shkala, ing.qiymat)}</span></div></div></div>
      <div class="field"><label>Boshqa tillar</label><div class="rows" id="tillar">${(c.boshqa_tillar || []).map(tilRow).join('')}</div><button type="button" class="btn sm mt" data-add="tillar">+ Til qo'shish</button></div>
      <div ${(c.lavozimlar || []).some(isOquv) ? '' : 'hidden'}>
      <div class="field"><label>Fan sertifikatlari (milliy)</label><div class="rows" id="fan">${(c.fan_sert || []).map(fanRow).join('')}</div><button type="button" class="btn sm mt" data-add="fan">+ Fan qo'shish</button></div>
      <div class="field"><label>SAT</label><div class="rows" id="sat">${c.sat ? satRow(c.sat, 'sat') : ''}</div><button type="button" class="btn sm mt" data-add="sat" ${c.sat ? 'hidden' : ''}>+ SAT qo'shish</button></div>
      <div class="field"><label>A level</label><div class="rows" id="alevel">${(c.a_level || []).map(alevelRow).join('')}</div><button type="button" class="btn sm mt" data-add="alevel">+ A level qo'shish</button></div>
      </div>
      <div class="field"><label>Boshqa sertifikatlar</label><div class="rows" id="boshqa">${(c.boshqa_sert || []).map(boshqaRow).join('')}</div><button type="button" class="btn sm mt" data-add="boshqa">+ Sertifikat qo'shish</button></div>
      ${F('ozim_haqimda', 'Men haqimda', `<textarea class="in" name="ozim_haqimda" required maxlength="300" placeholder="Qisqacha: tajribangiz, kuchli tomonlaringiz">${esc(c.ozim_haqimda || '')}</textarea><div class="hint">300 belgigacha</div>`, 1)}`;
    }
    await page({ title: 'Profil', back: n > 1 ? '/nomzod/profil/' + (n - 1) : (cand && cand.step_done >= 4 ? '/nomzod/cv' : '/'), nav: !!(cand && cand.step_done >= 4), body: `
      ${stepsBar(n)}<form id="f" class="mt" novalidate>${body}
      <div class="row gap mt"><button class="btn primary block" type="submit">${n < 4 ? 'Davom etish →' : (cand && cand.step_done >= 4 ? 'Saqlash' : "CV'ni yaratish")}</button></div></form>` });

    const f = root().querySelector('#f');
    let rasm = c.rasm || '';
    const ri = root().querySelector('#rasm');
    if (ri) ri.onchange = async () => { if (ri.files[0]) { rasm = await UI.readImage(ri.files[0], 600); root().querySelector('.photo').firstElementChild.outerHTML = avatar('', rasm, 'lg'); } };
    const aj = root().querySelector('#addjob');
    if (aj) aj.onclick = () => root().querySelector('#ish').insertAdjacentHTML('beforeend', jobRow({}));
    on('[data-add]', 'click', (e) => { const k = e.currentTarget.dataset.add; root().querySelector('#' + k).insertAdjacentHTML('beforeend', k === 'sat' ? satRow('', 'sat') : { tillar: tilRow, fan: fanRow, alevel: alevelRow, boshqa: boshqaRow }[k]({})); if (k === 'sat') e.currentTarget.hidden = true; });
    root().addEventListener('click', (e) => { const d = e.target.closest('.del'); if (d) { const row = d.closest('.rrow'), box = row.parentElement; row.remove(); const btn = root().querySelector('[data-add=' + box.id + ']'); if (btn && (box.id === 'sat' || box.id === 'satmin')) btn.hidden = false; } });
    const ob = root().querySelector('#oquvblock');
    if (ob) f.querySelectorAll('[name=lavozimlar]').forEach((el) => el.addEventListener('change', () => {
      ob.hidden = ![...f.querySelectorAll('[name=lavozimlar]:checked')].some((x) => isOquv(x.value));
      f.querySelectorAll('details.acc').forEach((d) => { const n = d.querySelectorAll('input:checked').length; d.querySelector('.cnt').textContent = n ? n + ' tanlandi' : d.querySelectorAll('input').length + ' ta lavozim'; });
    }));
    const sh = f.querySelector('[name=ingliz_shkala]');
    if (sh) sh.onchange = () => { root().querySelector('#ingq').innerHTML = ingQiymat(sh.value, ''); };

    f.onsubmit = async (e) => {
      e.preventDefault();
      const ob2 = root().querySelector('#oquvblock');
      if (ob2 && !ob2.hidden) {
        ob2.style.outline = '';
        if (!f.querySelector('[name=dars_tillari]:checked')) { ob2.style.outline = '2px solid var(--danger)'; ob2.scrollIntoView({ behavior: 'smooth', block: 'center' }); toast("Qaysi tillarda dars bera olasiz — bu bo'limni to'ldirmadingiz, kamida bittasini belgilang", 'warn'); return; }
      }
      if (!UI.validate(f)) return;
      const d = UI.formData(f);
      let patch = {};
      if (n === 1) patch = { fish: d.fish, tugilgan_sana: d.tugilgan_sana, jins: d.jins, viloyat: d.viloyat, tuman: d.tuman, telefon: d.telefon, rasm };
      if (n === 2) {
        const oquv = (d.lavozimlar || []).some(isOquv);
        patch = { lavozimlar: d.lavozimlar || [], dars_tillari: oquv ? d.dars_tillari || [] : [], stavka: d.stavka, kutilgan_maosh: d.kutilgan_maosh, boshlash_sanasi: d.boshlash_sanasi };
      }
      if (n === 3) {
        const jobs = [...f.querySelectorAll('#ish .rrow')].map((r) => ({ tashkilot: r.querySelector('[name=tashkilot]').value.trim(), lavozim: r.querySelector('[name=lavozim]').value.trim(), yil_dan: +r.querySelector('[name=yil_dan]').value || null, yil_gacha: +r.querySelector('[name=yil_gacha]').value || null })).filter((j) => j.tashkilot);
        patch = { staj_yil: d.staj_yil, malumot: +d.malumot, oqigan_joyi: d.oqigan_joyi, yonalish: d.yonalish || '', oqish_yil_dan: d.oqish_yil_dan || null, oqish_yil_gacha: d.oqish_yil_gacha || null, ish_joylari: jobs };
      }
      if (n === 4) {
        const q = f.querySelector('[name=ingliz_qiymat]');
        const shk = d.ingliz_shkala, qv = q ? q.value : '';
        patch = {
          ingliz: { shkala: shk, qiymat: shk ? qv : '', ball: shk ? DATA.tilBall(shk === 'milliy' ? 'CEFR' : shk, qv) : 0 },
          boshqa_tillar: rows('#tillar', (r) => ({ til: r.querySelector('[name=til]').value, daraja: r.querySelector('[name=daraja]').value })),
          fan_sert: rows('#fan', (r) => { const daraja = r.querySelector('[name=daraja]').value; return { subject_id: r.querySelector('[name=subject_id]').value, daraja, ball: DATA.fanBall(daraja) }; }),
          sat: (f.querySelector('#sat [name=sat]') && +f.querySelector('#sat [name=sat]').value) || null,
          a_level: rows('#alevel', (r) => { const baho = r.querySelector('[name=baho]').value; return { subject_id: r.querySelector('[name=subject_id]').value, baho, ball: DATA.alevelBall(baho) }; }),
          boshqa_sert: rows('#boshqa', (r) => ({ nomi: r.querySelector('[name=nomi]').value.trim() })).filter((x) => x.nomi),
          ozim_haqimda: d.ozim_haqimda,
        };
      }
      patch.step_done = Math.max(c.step_done || 0, n);
      if (cand) await Store.update('candidates', cand.id, patch);
      else await Store.add('candidates', Object.assign({ user_id: user.id, holat: 'faol', lavozimlar: [], ish_joylari: [], ingliz: { shkala: '', qiymat: '', ball: 0 }, boshqa_tillar: [], fan_sert: [], a_level: [], boshqa_sert: [], sat: null }, patch));
      if (n === 1 && d.telefon && !user.telefon) await Store.update('users', user.id, { telefon: d.telefon });
      await loadContext();
      if (n < 4) go('/nomzod/profil/' + (n + 1));
      else { toast("CV tayyor", 'ok'); go('/nomzod/cv'); }
    };
    function rows(sel, fn) { return [...f.querySelectorAll(sel + ' .rrow')].map(fn); }
  }
  function ingQiymat(shkala, val) {
    if (!shkala) return `<input class="in" disabled value="—">`;
    if (shkala === 'IELTS') return select('ingliz_qiymat', DATA.IELTS_BANDS, val || '6.5');
    return select('ingliz_qiymat', DATA.CEFR, val || 'B2');
  }
  const delBtn = `<button type="button" class="del" title="O'chirish">✕</button>`;
  const jobRow = (j) => `<div class="rrow" style="grid-template-columns:1fr 1fr 70px 70px 32px"><input class="in" name="tashkilot" placeholder="Tashkilot" value="${esc(j.tashkilot || '')}"><input class="in" name="lavozim" placeholder="Lavozim" value="${esc(j.lavozim || '')}"><input class="in" name="yil_dan" type="number" placeholder="2022" value="${j.yil_dan || ''}"><input class="in" name="yil_gacha" type="number" placeholder="2025" value="${j.yil_gacha || ''}">${delBtn}</div>`;
  const tilRow = (t) => `<div class="rrow" style="grid-template-columns:1fr 100px 32px">${select('til', DATA.TILLAR, t.til || 'Rus tili')}${select('daraja', DATA.CEFR, t.daraja || 'B1')}${delBtn}</div>`;
  const fanRow = (x) => `<div class="rrow" style="grid-template-columns:1fr 100px 32px">${select('subject_id', activeSubjects().map((s) => ({ v: s.id, l: s.nomi })), x.subject_id || '')}${select('daraja', [...DATA.FAN_DARAJA].reverse(), x.daraja || 'A')}${delBtn}</div>`;
  const alevelRow = (x) => `<div class="rrow" style="grid-template-columns:1fr 100px 32px">${select('subject_id', activeSubjects().map((s) => ({ v: s.id, l: s.nomi })), x.subject_id || '')}${select('baho', [...DATA.ALEVEL].reverse(), x.baho || 'A')}${delBtn}</div>`;
  const satRow = (v, name) => `<div class="rrow" style="grid-template-columns:1fr 32px"><input class="in" type="number" name="${name}" min="400" max="1600" step="10" value="${v || ''}" placeholder="SAT balli, 400–1600">${delBtn}</div>`;
  const boshqaRow = (x) => `<div class="rrow" style="grid-template-columns:1fr 32px"><input class="in" name="nomi" placeholder="Sertifikat nomi" value="${esc(x.nomi || '')}">${delBtn}</div>`;

  // ---------- CV ----------
  const fmtDate = (iso) => { if (!iso) return '—'; const [y, m, d] = iso.split('-'); return `${d}.${m}.${y}`; };
  const yrs = (a, b) => a || b ? `${a || '…'}–${b || (a ? 'hozir' : '…')}` : '—';
  function cvHtml(c, opt) {
    const a = Match.age(c.tugilgan_sana);
    const langs = [];
    const dl = c.dars_tillari || [];
    langs.push(["O'zbek tili" + (dl.includes("O'zbek") ? ' (dars tili)' : ''), 'Ona tili']);
    if (c.ingliz && c.ingliz.shkala) langs.push(['Ingliz tili' + (dl.includes('Ingliz') ? ' (dars tili)' : ''), c.ingliz.shkala + ' ' + c.ingliz.qiymat]);
    else if (dl.includes('Ingliz')) langs.push(['Ingliz tili (dars tili)', '—']);
    (c.boshqa_tillar || []).forEach((t) => langs.push([t.til + (t.til === 'Rus tili' && dl.includes('Rus') ? ' (dars tili)' : ''), t.daraja]));
    if (dl.includes('Rus') && !(c.boshqa_tillar || []).some((t) => t.til === 'Rus tili')) langs.push(['Rus tili (dars tili)', '—']);
    const certs = [];
    (c.fan_sert || []).forEach((x) => certs.push([subjName(x.subject_id) + ' — milliy sertifikat', x.daraja]));
    if (c.ingliz && c.ingliz.shkala === 'IELTS') certs.push(['IELTS Academic', c.ingliz.qiymat]);
    if (c.sat) certs.push(['SAT', String(c.sat)]);
    (c.a_level || []).forEach((x) => certs.push([subjName(x.subject_id) + ' — Cambridge A level', x.baho]));
    (c.boshqa_sert || []).forEach((x) => certs.push([x.nomi, 'bor']));
    const start = { hoziroq: 'Hoziroq', '1_hafta': '1 hafta ichida', '1_oy': '1 oy ichida' }[c.boshlash_sanasi] || '—';
    const malumot = { 1: "O'rta", 2: "O'rta maxsus", 3: 'Oliy (bakalavr)', 4: 'Oliy (magistr)' }[c.malumot] || '—';
    const tbl = (head, rows) => `<table><tr>${head.map((h) => `<th${h.w ? ` style="width:${h.w}"` : ''}>${esc(h.l || h)}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table>`;
    const today = new Date().toLocaleDateString('ru-RU');
    return `<div class="cv">
      <div class="cv-head">
        <div>
          <div class="cv-name">${esc(c.fish)}</div>
          <div class="cv-pos">${(c.lavozimlar || []).map(posName).join(' · ') || '—'}</div>
          <div class="cv-kv">
            <b>Tug'ilgan sanasi</b><span>${fmtDate(c.tugilgan_sana)}${a != null ? ` (${a} yosh)` : ''}</span>
            <b>Jinsi</b><span>${DATA.jinsLabel(c.jins)}</span>
            <b>Manzil</b><span>${esc(c.viloyat)}${c.tuman ? ', ' + esc(c.tuman) : ''}</span>
            <b>Telefon</b><span>${opt.showPhone ? `<a href="tel:${esc(c.telefon)}">${esc(c.telefon)}</a>` : '<span class="cv-muted">chat boshlangach ko\'rinadi</span>'}</span>
            ${opt.username ? `<b>Telegram</b><span>@${esc(opt.username)}</span>` : ''}
            <b>Ma'lumoti</b><span>${malumot}</span>
          </div>
        </div>
        ${c.rasm ? `<img class="cv-photo" src="${c.rasm}" alt="">` : `<div class="cv-photo cv-nophoto">${opt.self ? 'Rasm<br>3×4<br><small>1-qadamda qo\'shiladi</small>' : 'Rasm<br>yo\'q'}</div>`}
      </div>

      <h3><span class="n">1.</span> Ma'lumoti</h3>
      ${tbl([{ l: 'Yillar', w: '110px' }, "O'quv yurti", "Yo'nalish / daraja"], [[yrs(c.oqish_yil_dan, c.oqish_yil_gacha), c.oqigan_joyi || '—', [c.yonalish, DATA.malumotLabel(c.malumot)].filter(Boolean).join(', ')]])}

      <h3><span class="n">2.</span> Mehnat faoliyati${c.staj_yil ? ` · ${c.staj_yil} yil` : ''}</h3>
      ${(c.ish_joylari || []).length ? tbl([{ l: 'Yillar', w: '110px' }, 'Tashkilot', 'Lavozim'], c.ish_joylari.map((j) => [yrs(j.yil_dan, j.yil_gacha), j.tashkilot, j.lavozim])) : `<p class="cv-muted">${c.staj_yil ? `Umumiy staj ${c.staj_yil} yil, ish joylari ko'rsatilmagan` : 'Tajribasiz — birinchi ish'}</p>`}

      <div class="cv-two">
        <div><h3><span class="n">3.</span> Tillar</h3>${tbl(['Til', { l: 'Daraja', w: '100px' }], langs)}</div>
        <div><h3><span class="n">4.</span> Sertifikatlar</h3>${certs.length ? tbl(['Nomi', { l: 'Natija', w: '80px' }], certs) : '<p class="cv-muted">Kiritilmagan</p>'}</div>
      </div>

      <h3><span class="n">5.</span> Ish sharti</h3>
      <div class="cv-kv"><b>Stavka</b><span>${DATA.stavkaLabel(c.stavka)}</span><b>Kutilgan maosh</b><span>${money(c.kutilgan_maosh)}</span><b>Boshlash</b><span>${start}</span></div>

      <h3><span class="n">6.</span> Qo'shimcha ma'lumot</h3>
      <p>${esc(c.ozim_haqimda)}</p>

      <div class="cv-sig"><div>Nomzod imzosi</div><div>Sana: ${today}</div></div>
      <div class="cv-foot"><span>Top Xodim orqali tayyorlangan</span><span>${today}</span></div>
    </div>`;
  }
  async function downloadCv(c) {
    const btn = root().querySelector('#pdf'); if (btn) { btn.disabled = true; btn.textContent = 'Tayyorlanmoqda…'; }
    try { await CVPdf.save(root().querySelector('.cv'), 'Top-Xodim-CV-' + CVPdf.safeName(c.fish) + '.pdf'); toast('PDF saqlandi', 'ok'); }
    catch (err) { if (err && err.code === 'declined') toast('Saqlash bekor qilindi'); else toast('PDF tayyorlab bo\'lmadi: ' + (err && err.message || err), 'warn'); }
    if (btn) { btn.disabled = false; btn.textContent = '⬇ PDF yuklab olish'; }
  }
  async function myCv() {
    if (!guard('nomzod')) return;
    if (!cand || cand.step_done < 4) return go('/nomzod/profil/' + ((cand && cand.step_done || 0) + 1));
    const on_ = cand.holat === 'faol';
    await page({ title: "Mening CV'm", body: `
      <div class="row between gap mb no-print"><span class="status ${on_ ? 'on' : 'off'}">${on_ ? '● Faol — qidiruvda chiqadi' : '○ Yashirin — qidiruvda chiqmaydi'}</span><button class="btn sm" id="tog">${on_ ? 'Yashirish' : 'Faollashtirish'}</button></div>
      ${cvHtml(cand, { showPhone: true, username: user.telegram_username, self: true })}
      <div class="row gap mt no-print"><button class="btn block" data-go="/nomzod/profil/1">✏️ Tahrirlash</button><button class="btn block primary" id="pdf">⬇ PDF yuklab olish</button></div>
      <p class="hint center no-print">PDF fayl telefon yoki kompyuterga saqlanadi — Telegram'da ulashish mumkin. <a href="#" id="print">Chop etish</a></p>` });
    root().querySelector('#tog').onclick = async () => { await Store.update('candidates', cand.id, { holat: on_ ? 'yashirin' : 'faol' }); toast(on_ ? 'Profil yashirildi' : 'Profil faol', 'ok'); render(); };
    root().querySelector('#pdf').onclick = () => downloadCv(cand);
    root().querySelector('#print').onclick = (e) => { e.preventDefault(); window.print(); };
  }

  // ---------- Ish beruvchi ----------
  async function tashkilot() {
    if (!guard('ish_beruvchi')) return;
    const e = emp || {};
    await page({ title: 'Tashkilot', back: emp ? '/ish-beruvchi' : '/', nav: !!emp, body: `
      <p class="muted small">${emp ? "Tashkilot ma'lumotlari" : "Bir marta to'ldiriladi, keyin so'rov yaratasiz"}</p>
      <form id="f" novalidate>
      ${F('nomi', 'Tashkilot nomi', `<input class="in" name="nomi" required value="${esc(e.nomi || '')}" placeholder="Cambridge Learning Center">`, 1)}
      <div class="grid2">${F('turi', 'Turi', select('turi', DATA.ORG_TURI, e.turi || DATA.ORG_TURI[0]), 1)}${F('viloyat', 'Viloyat', select('viloyat', DATA.REGIONS, e.viloyat || 'Toshkent shahri'), 1)}</div>
      ${F('tuman', 'Shahar / tuman, manzil', `<input class="in" name="tuman" value="${esc(e.tuman || '')}">`)}
      ${F('masul_shaxs', "Mas'ul shaxs (ism, lavozim)", `<input class="in" name="masul_shaxs" required value="${esc(e.masul_shaxs || user.name)}" placeholder="Dilshod Nazarov, HR">`, 1)}
      ${F('telefon', 'Telefon', `<input class="in" type="tel" name="telefon" required value="${esc(e.telefon || user.telefon || '')}">`, 1)}
      <button class="btn primary block mt" type="submit">${emp ? 'Saqlash' : 'Davom etish →'}</button></form>` });
    const f = root().querySelector('#f');
    f.onsubmit = async (ev) => {
      ev.preventDefault(); if (!UI.validate(f)) return;
      const d = UI.formData(f);
      if (emp) await Store.update('employers', emp.id, d);
      else await Store.add('employers', Object.assign({ user_id: user.id, tasdiqlangan: false }, d));
      await loadContext(); go('/ish-beruvchi');
    };
  }
  async function empHome() {
    if (!guard('ish_beruvchi')) return;
    if (!emp) return go('/ish-beruvchi/tashkilot');
    const reqs = (await Store.list('job_requests', (r) => r.employer_id === emp.id)).sort((a, b) => b.created_at - a.created_at);
    const cands = await Store.list('candidates');
    const rows = reqs.map((r) => { const m = Match.run(r, cands, subjName); return `<a class="item" href="#/ish-beruvchi/natijalar/${r.id}"><div class="grow"><div class="t">${esc(reqTitle(r))} ${r.nechta > 1 ? '× ' + r.nechta : ''}</div><div class="s">${reqSummary(r)}</div></div><div class="col" style="align-items:flex-end"><b style="color:var(--role)">${m.full.length}</b><span class="tiny muted">${m.near.length ? '+' + m.near.length + ' yaqin' : 'mos'}</span></div>${r.holat !== 'faol' ? '<span class="status yopiq">yopiq</span>' : ''}</a>`; }).join('');
    await page({ title: esc(emp.nomi), body: `
      <div class="row between mb"><div><h2 style="font-size:20px">So'rovlarim</h2><div class="small muted">${esc(emp.turi)} · ${esc(emp.viloyat)} · <a href="#/ish-beruvchi/tashkilot">tahrirlash</a></div></div><a class="btn primary sm" href="#/ish-beruvchi/sorov/yangi">+ Yangi</a></div>
      ${reqs.length ? `<div class="list">${rows}</div>` : `<div class="empty"><div class="ic">🔎</div>Hali so'rov yo'q. «Yangi» tugmasini bosib kimni izlayotganingizni yozing — mos nomzodlar darrov chiqadi.</div>`}` });
  }
  function reqSummary(r) {
    const p = [];
    if (r.min_staj) p.push('staj ≥ ' + r.min_staj);
    if (r.yosh_dan || r.yosh_gacha) p.push('yosh ' + (r.yosh_dan || '…') + '–' + (r.yosh_gacha || '…'));
    if (r.jins !== 'farqi_yoq') p.push(DATA.jinsLabel(r.jins).toLowerCase());
    if (r.dars_tili && r.dars_tili !== 'farqi_yoq') p.push(r.dars_tili.toLowerCase() + ' tilida');
    if (r.til_ball) p.push('ingliz ≥ ' + DATA.CEFR[r.til_ball - 1]);
    (r.fan_talab || []).forEach((t) => p.push(subjName(t.subject_id) + ' ≥ ' + DATA.FAN_DARAJA[t.min_ball - 1]));
    if (r.sat_min) p.push('SAT ≥ ' + r.sat_min);
    (r.a_level_talab || []).forEach((t) => p.push(subjName(t.subject_id) + ' A level ≥ ' + DATA.ALEVEL[t.min_ball - 1]));
    if (r.viloyat) p.push(r.viloyat);
    return p.join(' · ') || "Qo'shimcha shart yo'q";
  }
  async function sorovForm(id) {
    if (!guard('ish_beruvchi')) return;
    if (!emp) return go('/ish-beruvchi/tashkilot');
    const r = id !== 'yangi' ? await Store.get('job_requests', id) : { jins: 'farqi_yoq', stavka: 'farqi_yoq', viloyat: emp.viloyat, fan_talab: [], a_level_talab: [], nechta: 1, holat: 'faol' };
    if (!r) return go('/ish-beruvchi');
    const talabRow = (x, kind) => `<div class="rrow" style="grid-template-columns:1fr 110px 32px">${select('subject_id', activeSubjects().map((s) => ({ v: s.id, l: s.nomi })), x.subject_id || '')}${select('min_ball', (kind === 'fan' ? DATA.FAN_DARAJA : DATA.ALEVEL).map((d, i) => ({ v: i + 1, l: '≥ ' + d })).reverse(), x.min_ball || 5)}${delBtn}</div>`;
    await page({ title: id === 'yangi' ? "Yangi so'rov" : "So'rovni tahrirlash", back: '/ish-beruvchi', body: `
      <form id="f" novalidate>
      <div class="card soft mb"><b>Menga kerak</b>
      ${F('bolim', "Bo'lim", `<div class="radios">${DATA.BOLIMLAR.map((b) => `<label><input type="radio" name="bolim" value="${b.v}" ${(r.position_id ? (L.positions[r.position_id] || {}).bolim || 'mamuriyat' : 'oquv') === b.v ? 'checked' : ''}>${esc(b.l)}</label>`).join('')}</div>`, 1)}
      <div class="grid2">${F('position_id', 'Lavozim', `<select class="in" name="position_id" required>${posOptions(r.position_id ? (L.positions[r.position_id] || {}).bolim || 'mamuriyat' : 'oquv', r.position_id || '')}</select>`, 1)}${F('nechta', 'Nechta xodim', `<input class="in" type="number" name="nechta" min="1" value="${r.nechta || 1}">`)}</div></div>
      <h3 class="mb" style="font-size:16px">Talablar <span class="muted small" style="font-weight:400">— bo'sh qoldirilgan shart tekshirilmaydi</span></h3>
      <div class="grid3">${F('min_staj', 'Staj, kamida (yil)', `<input class="in" type="number" name="min_staj" min="0" value="${r.min_staj || ''}" placeholder="0">`)}${F('yosh_dan', 'Yosh, dan', `<input class="in" type="number" name="yosh_dan" min="16" value="${r.yosh_dan || ''}">`)}${F('yosh_gacha', 'Yosh, gacha', `<input class="in" type="number" name="yosh_gacha" min="16" value="${r.yosh_gacha || ''}">`)}</div>
      ${F('jins', 'Jinsi', `<div class="radios">${[{ v: 'farqi_yoq', l: "Farqi yo'q" }, ...DATA.JINS].map((j) => `<label><input type="radio" name="jins" value="${j.v}" ${r.jins === j.v ? 'checked' : ''}>${j.l}</label>`).join('')}</div>`, 1)}
      <div id="oquvreq" ${isOquv(r.position_id || activePositions()[0].id) ? '' : 'hidden'}>
      ${F('dars_tili', 'Qaysi tilda dars o\'tilsin?', select('dars_tili', [{ v: 'farqi_yoq', l: "Farqi yo'q" }, ...DATA.DARS_TILLARI.map((t) => ({ v: t, l: t + ' tilida' }))], r.dars_tili || 'farqi_yoq'))}
      <div class="field"><label>Fan sertifikati, kamida</label><div class="rows" id="fan">${(r.fan_talab || []).map((x) => talabRow(x, 'fan')).join('')}</div><button type="button" class="btn sm mt" data-add="fan">+ Fan qo'shish</button></div>
      <div class="field"><label>SAT, kamida</label><div class="rows" id="satmin">${r.sat_min ? satRow(r.sat_min, 'sat_min') : ''}</div><button type="button" class="btn sm mt" data-add="satmin" ${r.sat_min ? 'hidden' : ''}>+ SAT qo'shish</button></div>
      <div class="field"><label>A level, kamida</label><div class="rows" id="alevel">${(r.a_level_talab || []).map((x) => talabRow(x, 'alevel')).join('')}</div><button type="button" class="btn sm mt" data-add="alevel">+ A level qo'shish</button></div>
      </div>
      <div class="grid2">${F('min_malumot', "Ma'lumot, kamida", select('min_malumot', [{ v: 0, l: "Farqi yo'q" }, ...DATA.MALUMOT], r.min_malumot || 0))}${F('til_ball', 'Ingliz tili, kamida', select('til_ball', [{ v: 0, l: "Talab yo'q" }, ...DATA.CEFR.map((c, i) => ({ v: i + 1, l: c + ' / IELTS ' + ['<4', '4.0', '4.5', '5.5', '7.0', '8.5'][i] + '+' }))], r.til_ball || 0))}</div>
      <div class="grid2">${F('viloyat', 'Viloyat', select('viloyat', [{ v: '', l: "Butun O'zbekiston" }, ...DATA.REGIONS], r.viloyat ?? emp.viloyat))}${F('stavka', 'Stavka', select('stavka', [{ v: 'farqi_yoq', l: "Farqi yo'q" }, ...DATA.STAVKA], r.stavka || 'farqi_yoq'))}</div>
      <div class="grid2">${F('maosh_dan', "Maosh, dan (so'm)", `<input class="in" type="number" name="maosh_dan" step="100000" value="${r.maosh_dan || ''}">`)}${F('maosh_gacha', 'Maosh, gacha', `<input class="in" type="number" name="maosh_gacha" step="100000" value="${r.maosh_gacha || ''}">`)}</div>
      ${F('izoh', 'Qo\'shimcha izoh', `<textarea class="in" name="izoh" placeholder="Ish vaqti, sharoit, boshqa talablar">${esc(r.izoh || '')}</textarea>`)}
      <button class="btn primary block mt" type="submit">${id === 'yangi' ? 'Nomzodlarni topish →' : 'Saqlash'}</button>
      ${id !== 'yangi' ? `<div class="row gap mt"><button class="btn block" type="button" id="tog">${r.holat === 'faol' ? "So'rovni yopish" : 'Qayta ochish'}</button><button class="btn block danger" type="button" id="del">O'chirish</button></div>` : ''}
      </form>` });
    const f = root().querySelector('#f');
    on('[data-add]', 'click', (e) => { const k = e.currentTarget.dataset.add; root().querySelector('#' + k).insertAdjacentHTML('beforeend', k === 'satmin' ? satRow('', 'sat_min') : talabRow({}, k)); if (k === 'satmin') e.currentTarget.hidden = true; });
    const ps = f.querySelector('[name=position_id]'), oq = root().querySelector('#oquvreq');
    f.querySelectorAll('[name=bolim]').forEach((el) => el.addEventListener('change', () => { ps.innerHTML = posOptions(el.value, ''); oq.hidden = el.value !== 'oquv'; }));
    ps.onchange = () => { oq.hidden = !isOquv(ps.value); };
    root().addEventListener('click', (e) => { const d = e.target.closest('.del'); if (d) { const row = d.closest('.rrow'), box = row.parentElement; row.remove(); const btn = root().querySelector('[data-add=' + box.id + ']'); if (btn && (box.id === 'sat' || box.id === 'satmin')) btn.hidden = false; } });
    f.onsubmit = async (ev) => {
      ev.preventDefault(); if (!UI.validate(f)) return;
      const d = UI.formData(f);
      const rowsOf = (sel) => [...f.querySelectorAll(sel + ' .rrow')].map((x) => ({ subject_id: x.querySelector('[name=subject_id]').value, min_ball: +x.querySelector('[name=min_ball]').value }));
      const oquv = isOquv(d.position_id);
      const patch = { position_id: d.position_id, nechta: d.nechta || 1, min_staj: d.min_staj || 0, yosh_dan: d.yosh_dan || 0, yosh_gacha: d.yosh_gacha || 0, jins: d.jins, dars_tili: oquv ? d.dars_tili || 'farqi_yoq' : 'farqi_yoq', min_malumot: +d.min_malumot || 0, til_ball: +d.til_ball || 0, fan_talab: oquv ? rowsOf('#fan') : [], sat_min: oquv ? (f.querySelector('#satmin [name=sat_min]') && +f.querySelector('#satmin [name=sat_min]').value) || 0 : 0, a_level_talab: oquv ? rowsOf('#alevel') : [], viloyat: d.viloyat, stavka: d.stavka, maosh_dan: d.maosh_dan || 0, maosh_gacha: d.maosh_gacha || 0, izoh: d.izoh };
      if (patch.yosh_dan && patch.yosh_gacha && patch.yosh_dan > patch.yosh_gacha) return toast("Yosh oralig'i noto'g'ri", 'warn');
      let saved;
      if (id === 'yangi') saved = await Store.add('job_requests', Object.assign({ employer_id: emp.id, user_id: user.id, holat: 'faol' }, patch));
      else saved = await Store.update('job_requests', id, patch);
      go('/ish-beruvchi/natijalar/' + saved.id);
    };
    const tg = root().querySelector('#tog'); if (tg) tg.onclick = async () => { await Store.update('job_requests', id, { holat: r.holat === 'faol' ? 'yopiq' : 'faol' }); go('/ish-beruvchi'); };
    const dl = root().querySelector('#del'); if (dl) dl.onclick = async () => { if (await UI.confirm("So'rov o'chirilsinmi? Suhbatlar saqlanib qoladi.", "O'chirish")) { await Store.remove('job_requests', id); go('/ish-beruvchi'); } };
  }
  async function natijalar(id) {
    if (!guard('ish_beruvchi')) return;
    const r = await Store.get('job_requests', id);
    if (!r || r.employer_id !== emp.id) return go('/ish-beruvchi');
    const cands = await Store.list('candidates');
    const m = Match.run(r, cands, subjName);
    const saved = new Set((await Store.list('saved_candidates', (s) => s.employer_id === emp.id)).map((s) => s.candidate_id));
    const card = ({ c, failed }) => `<div class="cand-card"><div class="row gap">${avatar(c.fish, c.rasm)}<div class="grow" style="flex:1;min-width:0"><b>${esc(c.fish)}</b><div class="small muted">${Match.age(c.tugilgan_sana)} yosh · ${DATA.jinsLabel(c.jins)} · ${esc(c.viloyat)} · staj ${c.staj_yil || 0} yil</div></div>${saved.has(c.id) ? '<span title="Saqlangan">⭐</span>' : ''}</div>
      <div class="tags">${(c.lavozimlar || []).map((p) => `<span class="tag ${p === r.position_id ? 'role' : ''}">${esc(posName(p))}</span>`).join('')}${(c.dars_tillari || []).map((t) => `<span class="tag ${t === r.dars_tili ? 'role' : ''}">${esc(t)} tilida</span>`).join('')}${certTags(c)}</div>
      ${failed.length ? `<div class="why">⚠ ${esc(failed[0].label)}</div>` : ''}
      <div class="acts"><a class="btn sm" href="#/ish-beruvchi/nomzod/${c.id}?r=${r.id}">CV</a><button class="btn sm primary" data-chat="${c.id}">Xabar yozish</button><button class="btn sm" data-save="${c.id}">${saved.has(c.id) ? '★' : '☆'}</button></div></div>`;
    await page({ title: reqTitle(r), back: '/ish-beruvchi', body: `
      <div class="card soft mb row between gap"><div class="small">${esc(reqSummary(r))}</div><a class="btn sm" href="#/ish-beruvchi/sorov/${r.id}">✏️</a></div>
      <h3 style="font-size:16px" class="mb">To'liq mos — ${m.full.length}</h3>
      ${m.full.length ? `<div class="list">${m.full.map(card).join('')}</div>` : `<div class="empty">Hamma shartga mos nomzod topilmadi.${m.near.length ? ' Pastdagi yaqin mosliklarga qarang yoki shartlarni yumshating.' : ' Shartlarni yumshatib ko\'ring.'}</div>`}
      ${m.near.length ? `<details class="near mt" ${m.full.length ? '' : 'open'}><summary>Yaqin mosliklar — ${m.near.length} <span class="muted small" style="font-weight:400">(bitta shartga to'g'ri kelmagan)</span></summary><div class="list">${m.near.map(card).join('')}</div></details>` : ''}` });
    on('[data-chat]', 'click', (e) => startChat(e.currentTarget.dataset.chat, r.id));
    on('[data-save]', 'click', async (e) => { await toggleSave(e.currentTarget.dataset.save, r.id); render(); });
  }
  function certTags(c) {
    const t = [];
    if (c.ingliz && c.ingliz.shkala) t.push(c.ingliz.shkala + ' ' + c.ingliz.qiymat);
    (c.fan_sert || []).forEach((s) => t.push(subjName(s.subject_id) + ' ' + s.daraja));
    if (c.sat) t.push('SAT ' + c.sat);
    (c.a_level || []).forEach((s) => t.push(subjName(s.subject_id) + ' A level ' + s.baho));
    return t.map((x) => `<span class="tag">${esc(x)}</span>`).join('');
  }
  async function toggleSave(cid, rid) {
    const ex = (await Store.list('saved_candidates', (s) => s.employer_id === emp.id && s.candidate_id === cid))[0];
    if (ex) { await Store.remove('saved_candidates', ex.id); toast("Saqlanganlardan olib tashlandi"); }
    else { await Store.add('saved_candidates', { employer_id: emp.id, user_id: user.id, candidate_id: cid, request_id: rid || null }); toast('Saqlandi', 'ok'); }
  }
  async function startChat(cid, rid) {
    let conv = (await Store.list('conversations', (c) => c.candidate_id === cid && c.employer_id === emp.id))[0];
    if (!conv) {
      const cu = await Store.get('candidates', cid);
      conv = await Store.add('conversations', { candidate_id: cid, employer_id: emp.id, user_ids: [user.id, cu.user_id], request_id: rid || null, last_at: Date.now(), last_text: '', bloklangan_by: null });
      if (rid) await Store.add('messages', { conversation_id: conv.id, user_ids: conv.user_ids, sender_user_id: user.id, tur: 'request', request_id: rid, text: '', at: Date.now(), read: false });
    }
    go('/chat/' + conv.id);
  }
  async function nomzodView(cid, q) {
    if (!guard('ish_beruvchi')) return;
    const c = await Store.get('candidates', cid);
    if (!c) return go('/ish-beruvchi');
    const conv = (await Store.list('conversations', (x) => x.candidate_id === cid && x.employer_id === emp.id))[0];
    const saved = (await Store.list('saved_candidates', (s) => s.employer_id === emp.id && s.candidate_id === cid))[0];
    await page({ title: c.fish, back: q.r ? '/ish-beruvchi/natijalar/' + q.r : '/ish-beruvchi/saqlanganlar', body: `
      ${c.holat !== 'faol' ? '<div class="card mb small muted">Bu nomzod profilini yashirgan — qidiruvda chiqmaydi</div>' : ''}
      ${cvHtml(c, { showPhone: !!conv, username: conv ? ((await Store.get('users', c.user_id)) || {}).telegram_username : '' })}
      <div class="row gap mt no-print"><button class="btn primary block" id="chat">${conv ? 'Chatga o\'tish' : 'Xabar yozish'}</button><button class="btn block" id="save">${saved ? '★ Saqlangan' : '☆ Saqlash'}</button><button class="btn" id="pdf" title="PDF yuklab olish">⬇</button></div>` });
    root().querySelector('#pdf').onclick = () => downloadCv(c);
    root().querySelector('#chat').onclick = () => startChat(cid, q.r);
    root().querySelector('#save').onclick = async () => { await toggleSave(cid, q.r); render(); };
  }
  async function saqlanganlar() {
    if (!guard('ish_beruvchi')) return;
    const s = (await Store.list('saved_candidates', (x) => x.employer_id === emp.id)).sort((a, b) => b.created_at - a.created_at);
    const items = [];
    for (const x of s) { const c = await Store.get('candidates', x.candidate_id); if (c) items.push(`<a class="item" href="#/ish-beruvchi/nomzod/${c.id}${x.request_id ? '?r=' + x.request_id : ''}">${avatar(c.fish, c.rasm)}<div class="grow"><div class="t">${esc(c.fish)}</div><div class="s">${(c.lavozimlar || []).map(posName).join(', ')} · staj ${c.staj_yil || 0} yil</div></div><span class="muted">→</span></a>`); }
    await page({ title: 'Saqlangan nomzodlar', body: items.length ? `<div class="list">${items.join('')}</div>` : `<div class="empty"><div class="ic">⭐</div>Natijalardagi ☆ tugmasi bilan nomzodlarni shu yerga saqlaysiz</div>` });
  }

  // ---------- Xabarlar va chat ----------
  async function xabarlar(rol) {
    if (!guard(rol)) return;
    if (rol === 'nomzod' && (!cand || cand.step_done < 4)) return go(roleHome());
    if (rol === 'ish_beruvchi' && !emp) return go('/ish-beruvchi/tashkilot');
    const convs = (await Store.list('conversations', (c) => rol === 'nomzod' ? c.candidate_id === cand.id : c.employer_id === emp.id)).sort((a, b) => b.last_at - a.last_at);
    const items = [];
    for (const cv of convs) {
      const other = rol === 'nomzod' ? await Store.get('employers', cv.employer_id) : await Store.get('candidates', cv.candidate_id);
      const req = cv.request_id ? await Store.get('job_requests', cv.request_id) : null;
      const n = (await Store.list('messages', (m) => m.conversation_id === cv.id && m.sender_user_id !== user.id && !m.read)).length;
      items.push(`<a class="item" href="#/chat/${cv.id}">${avatar(other ? (other.nomi || other.fish) : '?', other && other.rasm)}<div class="grow"><div class="t row between"><span>${esc(other ? (other.nomi || other.fish) : '—')}</span><span class="tiny muted" style="font-weight:400">${timeAgo(cv.last_at)}</span></div><div class="s">${req ? '<b>' + esc(reqTitle(req)) + '</b> · ' : ''}${esc(cv.last_text || "So'rov yuborildi")}</div></div>${n ? `<span class="badge" style="position:static">${n}</span>` : ''}</a>`);
    }
    await page({ title: 'Xabarlar', body: items.length ? `<div class="list">${items.join('')}</div>` : `<div class="empty"><div class="ic">💬</div>${rol === 'nomzod' ? "Hali hech kim yozmagan. Ish beruvchi CV'ingizni topib yozganda shu yerda chiqadi." : "Natijalardan nomzodga «Xabar yozish» bosing"}</div>` });
  }
  async function chat(id) {
    if (!user) return go('/');
    const cv = await Store.get('conversations', id);
    if (!cv) return go(roleHome());
    const mine = (cand && cv.candidate_id === cand.id) || (emp && cv.employer_id === emp.id) || user.rol === 'admin';
    if (!mine) return go(roleHome());
    const c = await Store.get('candidates', cv.candidate_id), e = await Store.get('employers', cv.employer_id);
    const req = cv.request_id ? await Store.get('job_requests', cv.request_id) : null;
    const msgs = (await Store.list('messages', (m) => m.conversation_id === id)).sort((a, b) => a.at - b.at);
    for (const m of msgs) if (m.sender_user_id !== user.id && !m.read) await Store.update('messages', m.id, { read: true });
    const isCand = user.rol === 'nomzod';
    const other = isCand ? e : c;
    const blocked = cv.bloklangan_by;
    const reqCard = (rq) => rq ? `<div class="msg req"><b>${esc(e.nomi)}</b> · ${esc(reqTitle(rq))}${rq.nechta > 1 ? ' × ' + rq.nechta : ''}<div class="small muted">${esc(reqSummary(rq))}</div>${rq.maosh_dan || rq.maosh_gacha ? `<div class="small">Maosh: ${money(rq.maosh_dan)}${rq.maosh_gacha ? ' – ' + money(rq.maosh_gacha) : ''}</div>` : ''}${rq.izoh ? `<div class="small">${esc(rq.izoh)}</div>` : ''}</div>` : '';
    await page({ title: other ? (other.nomi || other.fish) : 'Chat', back: isCand ? '/nomzod/xabarlar' : '/ish-beruvchi/xabarlar', body: `
      <div class="chat">
        <div class="row between gap small muted" style="padding-bottom:6px">${isCand ? `<span>${esc(e.turi)} · ${esc(e.viloyat)} · <a href="tel:${esc(e.telefon)}">${esc(e.telefon)}</a></span><span><a href="#" id="rep">Shikoyat</a> · <a href="#" id="blk">${blocked ? 'Blokdan chiqarish' : 'Bloklash'}</a></span>` : `<span><a href="#/ish-beruvchi/nomzod/${c.id}${cv.request_id ? '?r=' + cv.request_id : ''}">CV</a> · <a href="tel:${esc(c.telefon)}">${esc(c.telefon)}</a></span>`}</div>
        <div class="msgs" id="msgs">${msgs.map((m) => m.tur === 'request' ? reqCard(req) : `<div class="msg ${m.sender_user_id === user.id ? 'me' : ''}">${esc(m.text)}<span class="tm">${timeHM(m.at)}</span></div>`).join('')}</div>
        ${blocked ? `<div class="card small muted center">Suhbat bloklangan${blocked === user.id ? ' (siz tomondan)' : ''}</div>` : `<form class="composer" id="cf"><input class="in" name="t" placeholder="Xabar yozing…" autocomplete="off"><button class="btn primary" type="submit">➤</button></form>`}
      </div>` });
    const box = root().querySelector('#msgs'); box.scrollTop = box.scrollHeight;
    const cf = root().querySelector('#cf');
    if (cf) cf.onsubmit = async (ev) => {
      ev.preventDefault(); const t = cf.t.value.trim(); if (!t) return;
      await Store.add('messages', { conversation_id: id, user_ids: cv.user_ids || [], sender_user_id: user.id, tur: 'text', text: t, at: Date.now(), read: false });
      await Store.update('conversations', id, { last_at: Date.now(), last_text: t });
      cf.t.value = ''; render();
    };
    const rep = root().querySelector('#rep'); if (rep) rep.onclick = async (ev) => { ev.preventDefault(); const s = await UI.prompt('Shikoyat sababi', "Masalan: noo'rin takliflar"); if (s) { await Store.add('reports', { conversation_id: id, by_user_id: user.id, about_user_id: e.user_id, sabab: s, holat: 'yangi', at: Date.now() }); toast('Shikoyat yuborildi', 'ok'); } };
    const blk = root().querySelector('#blk'); if (blk) blk.onclick = async (ev) => { ev.preventDefault(); await Store.update('conversations', id, { bloklangan_by: blocked ? null : user.id }); render(); };
  }

  // ---------- Admin ----------
  async function admin(q) {
    if (!guard('admin')) return;
    const tab = q.tab || 'lavozimlar';
    const [cands, emps, reqs, convs, reports, users] = await Promise.all([Store.list('candidates'), Store.list('employers'), Store.list('job_requests'), Store.list('conversations'), Store.list('reports'), Store.list('users')]);
    let body = '';
    const lookupTab = (coll, items) => `<div class="list">${items.sort((a, b) => a.tartib - b.tartib).map((p) => `<div class="item"><div class="grow"><div class="t ${p.faol ? '' : 'muted'}">${esc(p.nomi)}</div></div><button class="btn sm ghost" data-ren="${p.id}">✏️</button><input type="checkbox" class="switch" data-tog="${p.id}" ${p.faol ? 'checked' : ''} title="Faol"></div>`).join('')}</div><button class="btn block mt" id="add">+ Qo'shish</button><p class="hint">O'chirilgan (faol emas) element eski profillarda qoladi, yangi tanlovda chiqmaydi.</p>`;
    if (tab === 'lavozimlar') body = DATA.BOLIMLAR.map((b) => `<h3 style="font-size:15px;margin:14px 0 8px">${esc(b.l)}</h3><div class="list">${Object.values(L.positions).filter((p) => (p.bolim || 'mamuriyat') === b.v).sort((x, y) => x.tartib - y.tartib).map((p) => `<div class="item"><div class="grow"><div class="t ${p.faol ? '' : 'muted'}">${esc(p.nomi)}</div></div><button class="btn sm ghost" data-ren="${p.id}">✏️</button><input type="checkbox" class="switch" data-tog="${p.id}" ${p.faol ? 'checked' : ''} title="Faol"></div>`).join('')}</div><button class="btn block mt" data-addpos="${b.v}">+ ${esc(b.l)}ga qo'shish</button>`).join('') + `<p class="hint">O'quv bo'limi lavozimlarida dars tili, fan sertifikati, SAT, A level so'raladi; ma'muriy bo'limda so'ralmaydi. O'chirilgan element eski profillarda qoladi, yangi tanlovda chiqmaydi.</p>`;
    if (tab === 'fanlar') body = lookupTab('subjects', Object.values(L.subjects));
    if (tab === 'foydalanuvchilar') body = `<div class="list">${users.filter((u) => u.rol !== 'admin').sort((a, b) => b.created_at - a.created_at).map((u) => { const c = cands.find((x) => x.user_id === u.id), e = emps.find((x) => x.user_id === u.id); return `<div class="item"><div class="grow"><div class="t ${u.bloklangan ? 'muted' : ''}">${esc(u.name)} ${u.bloklangan ? '· bloklangan' : ''}</div><div class="s">${u.rol === 'nomzod' ? 'Nomzod' + (c ? ' · ' + (c.lavozimlar || []).map(posName).join(', ') + (c.step_done < 4 ? ' · profil tugallanmagan' : '') : ' · profil yo\'q') : 'Ish beruvchi' + (e ? ' · ' + esc(e.nomi) + (e.tasdiqlangan ? ' ✓' : '') : '')}</div></div>${e ? `<button class="btn sm ${e.tasdiqlangan ? 'ghost' : ''}" data-ok="${e.id}" title="Tasdiqlash (moderatsiya yoqilganda ishlaydi)">${e.tasdiqlangan ? '✓' : 'Tasdiqlash'}</button>` : ''}<button class="btn sm ${u.bloklangan ? '' : 'danger'}" data-blk="${u.id}">${u.bloklangan ? 'Ochish' : 'Blok'}</button></div>`; }).join('')}</div>`;
    if (tab === 'shikoyatlar') body = reports.length ? `<div class="list">${reports.sort((a, b) => b.at - a.at).map((r) => { const by = users.find((u) => u.id === r.by_user_id), ab = users.find((u) => u.id === r.about_user_id); return `<div class="item"><div class="grow"><div class="t">${esc(by ? by.name : '?')} → ${esc(ab ? ab.name : '?')}</div><div class="s" style="white-space:normal">${esc(r.sabab)} · ${timeAgo(r.at)}</div></div>${r.holat === 'yangi' ? `<button class="btn sm" data-seen="${r.id}">Ko'rildi</button>` : '<span class="tiny muted">ko\'rilgan</span>'}<a class="btn sm ghost" href="#/chat/${r.conversation_id}">chat</a></div>`; }).join('')}</div>` : '<div class="empty">Shikoyat yo\'q</div>';
    await page({ title: 'Admin panel', body: `
      <div class="stats"><div class="stat"><b>${cands.filter((c) => c.step_done >= 4).length}</b><span>nomzod</span></div><div class="stat"><b>${reqs.filter((r) => r.holat === 'faol').length}</b><span>faol so'rov</span></div><div class="stat"><b>${convs.length}</b><span>suhbat</span></div></div>
      <div class="tabs">${[['lavozimlar', 'Lavozimlar'], ['fanlar', 'Fanlar'], ['foydalanuvchilar', 'Foydalanuvchilar'], ['shikoyatlar', 'Shikoyatlar' + (reports.filter((r) => r.holat === 'yangi').length ? ' (' + reports.filter((r) => r.holat === 'yangi').length + ')' : '')]].map(([k, l]) => `<a href="#/admin?tab=${k}" class="${tab === k ? 'active' : ''}">${l}</a>`).join('')}</div>
      ${body}
      <div class="row gap mt no-print"><button class="btn sm ghost" id="exp">⬇ Eksport (JSON)</button><button class="btn sm ghost" id="rst">Demo ma'lumotni tiklash</button></div>` });
    const coll = tab === 'lavozimlar' ? 'positions' : 'subjects';
    on('[data-tog]', 'change', async (e) => { await Store.update(coll, e.currentTarget.dataset.tog, { faol: e.currentTarget.checked }); await loadLookups(); });
    on('[data-ren]', 'click', async (e) => { const it = await Store.get(coll, e.currentTarget.dataset.ren); const n = await UI.prompt('Yangi nom', it.nomi); if (n) { await Store.update(coll, it.id, { nomi: n }); render(); } });
    on('[data-addpos]', 'click', async (e) => { const b = e.currentTarget.dataset.addpos; const nm = await UI.prompt(DATA.bolimLabel(b) + ' — yangi lavozim nomi'); if (nm) { const all = await Store.list('positions'); await Store.add('positions', { nomi: nm, bolim: b, faol: true, tartib: all.length }); render(); } });
    const add = root().querySelector('#add'); if (add) add.onclick = async () => { const n = await UI.prompt(tab === 'lavozimlar' ? 'Yangi lavozim nomi' : 'Yangi fan nomi'); if (n) { const all = await Store.list(coll); await Store.add(coll, { nomi: n, faol: true, tartib: all.length }); render(); } };
    on('[data-blk]', 'click', async (e) => { const u = await Store.get('users', e.currentTarget.dataset.blk); await Store.update('users', u.id, { bloklangan: !u.bloklangan }); render(); });
    on('[data-ok]', 'click', async (e) => { const x = await Store.get('employers', e.currentTarget.dataset.ok); await Store.update('employers', x.id, { tasdiqlangan: !x.tasdiqlangan }); render(); });
    on('[data-seen]', 'click', async (e) => { await Store.update('reports', e.currentTarget.dataset.seen, { holat: 'korildi' }); render(); });
    root().querySelector('#exp').onclick = () => { const b = new Blob([Store.exportJSON()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'top-xodim-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); };
    root().querySelector('#rst').onclick = async () => { if (await UI.confirm("Barcha ma'lumot o'chib, demo holatga qaytadi. Davom etasizmi?", 'Tiklash')) { await Store.reset(); Auth.logout(); go('/'); } };
  }

  // ---------- Marshrutlar ----------
  const routes = [
    [/^\/$/, home],
    [/^\/kirish$/, (q) => login(q)],
    [/^\/nomzod\/profil\/(\d)$/, (n) => profilStep(n)],
    [/^\/nomzod\/cv$/, myCv],
    [/^\/nomzod\/xabarlar$/, () => xabarlar('nomzod')],
    [/^\/ish-beruvchi$/, empHome],
    [/^\/ish-beruvchi\/tashkilot$/, tashkilot],
    [/^\/ish-beruvchi\/sorov\/([^/]+)$/, (id) => sorovForm(id)],
    [/^\/ish-beruvchi\/natijalar\/([^/]+)$/, (id) => natijalar(id)],
    [/^\/ish-beruvchi\/nomzod\/([^/]+)$/, (id, q) => nomzodView(id, q)],
    [/^\/ish-beruvchi\/saqlanganlar$/, saqlanganlar],
    [/^\/ish-beruvchi\/xabarlar$/, () => xabarlar('ish_beruvchi')],
    [/^\/chat\/([^/]+)$/, (id) => chat(id)],
    [/^\/admin$/, (q) => admin(q)],
  ];
  let rendering = false;
  async function render() {
    if (rendering) return; rendering = true;
    try {
      await loadLookups(); await loadContext();
      const h = location.hash.replace(/^#/, '') || '/';
      const [path, qs] = h.split('?');
      const q = Object.fromEntries(new URLSearchParams(qs || ''));
      for (const [re, fn] of routes) { const m = path.match(re); if (m) { const args = m.slice(1); await fn(...(args.length ? [...args, q] : [q])); rendering = false; return; } }
      go('/');
    } catch (err) { console.error(err); root().innerHTML = `<div class="page"><div class="card"><b>Xatolik</b><p class="small muted">${esc(err.message)}</p><button class="btn" data-go="/">Bosh sahifa</button></div></div>`; }
    rendering = false;
  }
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Yuklanmadi: ' + src)); document.head.appendChild(s); }); }
  async function init() {
    if (CONFIG.FIREBASE) {
      const v = '10.14.1';
      for (const m of ['app', 'auth', 'firestore', 'functions']) await loadScript(`https://www.gstatic.com/firebasejs/${v}/firebase-${m}-compat.js`);
      firebase.initializeApp(CONFIG.FIREBASE);
      await new Promise((res) => { const off = firebase.auth().onAuthStateChanged(() => { off(); res(); }); });
      window.Store = StoreFirebase();
      Store.onChange(() => { if (location.hash.startsWith('#/chat/') || location.hash.endsWith('/xabarlar')) render(); });
    } else window.Store = StoreLocal;
    await Store.init(); window.addEventListener('hashchange', render); render();
  }
  init();
  return { render, afterLogin, go };
})();
