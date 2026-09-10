// Lokal ma'lumot qatlami (demo): brauzer xotirasi (localStorage).
// Firebase ulanganda app.js StoreFirebase'ni tanlaydi — interfeys bir xil.
window.StoreLocal = (function () {
  const KEY = 'topxodim.db.v7';
  let db = null;
  const listeners = new Set();
  const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* xotira to'lgan bo'lishi mumkin */ }
    listeners.forEach((f) => { try { f(); } catch (e) {} });
  }
  function load() {
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
    if (!db || !db.positions) { db = Seed.build(uid); persist(); }
  }
  const coll = (c) => (db[c] = db[c] || {});

  return {
    async init() { load(); },
    async reset() { db = Seed.build(uid); persist(); },
    async list(c, fn) { const a = Object.values(coll(c)); return fn ? a.filter(fn) : a; },
    async get(c, id) { return coll(c)[id] || null; },
    async add(c, obj) {
      const id = obj.id || uid();
      coll(c)[id] = Object.assign({}, obj, { id, created_at: obj.created_at || Date.now() });
      persist();
      return coll(c)[id];
    },
    async update(c, id, patch) {
      if (!coll(c)[id]) throw new Error('Topilmadi: ' + c + '/' + id);
      Object.assign(coll(c)[id], patch, { updated_at: Date.now() });
      persist();
      return coll(c)[id];
    },
    async remove(c, id) { delete coll(c)[id]; persist(); },
    onChange(f) { listeners.add(f); return () => listeners.delete(f); },
    exportJSON() { return JSON.stringify(db, null, 2); },
    uid,
  };
})();

// Demo ma'lumotlar — Firebase ulanganda ishlatilmaydi
window.Seed = (function () {
  function build(uid) {
    const db = { users: {}, candidates: {}, employers: {}, positions: {}, subjects: {},
      job_requests: {}, saved_candidates: {}, conversations: {}, messages: {}, reports: {} };
    DATA.POSITIONS.forEach((p) => (db.positions[p.id] = { ...p }));
    DATA.SUBJECTS.forEach((s) => (db.subjects[s.id] = { ...s }));
    const P = (nomi) => DATA.POSITIONS.find((p) => p.nomi === nomi).id;
    const S = (nomi) => DATA.SUBJECTS.find((s) => s.nomi === nomi).id;
    const now = Date.now();
    const day = 86400000;

    function user(id, name, rol, extra) {
      db.users[id] = { id, name, rol, telegram_id: null, telegram_username: extra && extra.username || '', telefon: extra && extra.telefon || '', bloklangan: false, created_at: now - 30 * day };
      return id;
    }
    user('u_admin', 'Admin', 'admin');

    // --- Nomzodlar
    function cand(o) {
      const id = 'c_' + o.key;
      user('u_' + o.key, o.fish, 'nomzod', { telefon: o.telefon });
      const ingliz = o.ingliz ? { shkala: o.ingliz[0], qiymat: o.ingliz[1], ball: DATA.tilBall(o.ingliz[0], o.ingliz[1]) } : { shkala: '', qiymat: '', ball: 0 };
      db.candidates[id] = {
        id, user_id: 'u_' + o.key, fish: o.fish, tugilgan_sana: o.dob, jins: o.jins,
        viloyat: o.viloyat || 'Toshkent shahri', tuman: o.tuman || '', telefon: o.telefon, rasm: '',
        lavozimlar: o.lavozimlar.map(P), dars_tillari: o.dars || [], stavka: o.stavka || 'toliq', kutilgan_maosh: o.maosh || 4000000,
        boshlash_sanasi: 'hoziroq', staj_yil: o.staj, malumot: o.malumot || 3, oqigan_joyi: o.oqigan || "O'zbekiston Milliy universiteti", yonalish: o.yonalish || 'Pedagogika', oqish_yil_dan: o.oy1 || 2019, oqish_yil_gacha: o.oy2 || 2023,
        ish_joylari: o.ish || [], ingliz, boshqa_tillar: o.tillar || [],
        fan_sert: (o.fan || []).map(([n, d]) => ({ subject_id: S(n), daraja: d, ball: DATA.fanBall(d) })),
        sat: o.sat || null,
        a_level: (o.alevel || []).map(([n, b]) => ({ subject_id: S(n), baho: b, ball: DATA.alevelBall(b) })),
        boshqa_sert: o.boshqa || [], ozim_haqimda: o.haqimda || "Mas'uliyatli, o'quvchilar bilan ishlashni yaxshi ko'raman.",
        holat: 'faol', step_done: 4, created_at: now - (o.kun || 5) * day,
      };
    }
    cand({ key: 'nilufar', fish: 'Nilufar Karimova', dob: '2002-03-14', jins: 'ayol', telefon: '+998901234501', lavozimlar: ['Support ustoz', 'Kurator'], dars: ["O'zbek", 'Ingliz'], staj: 3, ingliz: ['IELTS', '7.0'], fan: [['Matematika', 'A+']], ish: [{ tashkilot: 'Everest Learning', lavozim: 'Support ustoz', yil_dan: 2022, yil_gacha: 2025 }], haqimda: "3 yildan beri IELTS guruhlariga support ustoz bo'lib ishlayman. Matematikadan milliy sertifikat A+.", kun: 2 });
    cand({ key: 'madina', fish: 'Madina Yusupova', dob: '1994-07-02', jins: 'ayol', telefon: '+998901234502', lavozimlar: ['Support ustoz'], dars: ["O'zbek", 'Rus'], staj: 4, ingliz: ['CEFR', 'B2'], fan: [['Matematika', 'A']], malumot: 4, kun: 9 });
    cand({ key: 'jasur', fish: 'Jasur Aliyev', dob: '2000-11-20', jins: 'erkak', telefon: '+998901234503', lavozimlar: ['Matematika ustozi', 'Fizika ustozi', 'Support ustoz', 'Yordamchi ustoz'], dars: ["O'zbek", 'Rus'], staj: 2, ingliz: ['IELTS', '6.5'], fan: [['Matematika', 'A']], kun: 4 });
    cand({ key: 'dilnoza', fish: 'Dilnoza Rahimova', dob: '2004-01-09', jins: 'ayol', telefon: '+998901234504', lavozimlar: ['Support ustoz', 'Yordamchi ustoz', 'Uy vazifa tekshiruvchi'], dars: ["O'zbek"], staj: 1, ingliz: ['CEFR', 'C1'], fan: [['Matematika', 'A'], ['Fizika', 'B+']], malumot: 2, oqigan: 'TDPU, 2-kurs', stavka: 'yarim', maosh: 2500000, kun: 1 });
    cand({ key: 'sardor', fish: 'Sardor Toshmatov', dob: '1998-05-30', jins: 'erkak', telefon: '+998901234505', lavozimlar: ['Security', 'Tozalik xodimi'], staj: 5, malumot: 1, oqigan: '45-maktab', haqimda: 'Harbiy xizmatni o\'taganman, 5 yil qo\'riqlash sohasida.', kun: 12 });
    cand({ key: 'kamola', fish: 'Kamola Ergasheva', dob: '1999-09-17', jins: 'ayol', telefon: '+998901234506', lavozimlar: ['Kimyo ustozi', 'Biologiya ustozi', 'Kimyo A level ustoz', 'Support ustoz'], dars: ['Rus', 'Ingliz'], staj: 3, ingliz: ['IELTS', '7.5'], fan: [['Matematika', 'B+'], ['Kimyo', 'A+']], alevel: [['Kimyo', 'A*']], malumot: 4, oqigan: "O'zMU, kimyo fakulteti, magistr", viloyat: 'Samarqand', haqimda: 'Cambridge A level Chemistry A*. 3 yil A level guruhlariga dars berganman.', kun: 3 });
    cand({ key: 'zarina', fish: 'Zarina Nazarova', dob: '2000-02-25', jins: 'ayol', telefon: '+998901234507', lavozimlar: ['Support ustoz'], dars: ["O'zbek"], staj: 2, ingliz: ['CEFR', 'B1'], fan: [['Matematika', 'A+']], kun: 6 });
    cand({ key: 'bekzod', fish: 'Bekzod Umarov', dob: '1996-12-05', jins: 'erkak', telefon: '+998901234508', lavozimlar: ['SAT ustoz'], dars: ['Ingliz', "O'zbek"], staj: 4, ingliz: ['IELTS', '8.0'], sat: 1480, fan: [['Matematika', 'A+']], haqimda: 'SAT 1480 (Math 800). 4 yildan beri SAT Math o\'qitaman.', kun: 7 });
    cand({ key: 'malika', fish: 'Malika Xo\'jayeva', dob: '1995-06-21', jins: 'ayol', telefon: '+998901234511', lavozimlar: ['Kimyo ustozi', 'Biologiya ustozi'], dars: ["O'zbek", 'Rus'], staj: 6, ingliz: ['CEFR', 'B1'], fan: [['Kimyo', 'A+'], ['Biologiya', 'A']], malumot: 4, oqigan: "O'zMU, kimyo, magistr", haqimda: '6 yil maktabda kimyo va biologiyadan dars berganman. Rus sinflarida ham.', kun: 4 });
    cand({ key: 'gulnora', fish: 'Gulnora Saidova', dob: '1990-04-11', jins: 'ayol', telefon: '+998901234509', lavozimlar: ['Hamshira'], staj: 8, malumot: 2, oqigan: 'Toshkent tibbiyot kolleji', boshqa: [{ nomi: 'Hamshiralik diplomi' }], kun: 15 });
    cand({ key: 'otabek', fish: 'Otabek Qodirov', dob: '1997-08-08', jins: 'erkak', telefon: '+998901234510', lavozimlar: ['Marketolog', 'SMM'], staj: 3, ingliz: ['CEFR', 'B2'], tillar: [{ til: 'Rus tili', daraja: 'C1' }], viloyat: 'Toshkent viloyati', kun: 8 });

    // --- Ish beruvchilar
    function emp(key, nomi, turi, viloyat, masul, telefon) {
      user('u_' + key, masul, 'ish_beruvchi', { telefon });
      db.employers['e_' + key] = { id: 'e_' + key, user_id: 'u_' + key, nomi, turi, viloyat, tuman: '', masul_shaxs: masul, telefon, tasdiqlangan: false, created_at: now - 20 * day };
      return 'e_' + key;
    }
    const e1 = emp('cambridge', 'Cambridge Learning Center', "O'quv markaz", 'Toshkent shahri', 'Dilshod Nazarov (HR)', '+998712000001');
    const e2 = emp('zamonaviy', 'Zamonaviy Maktab', 'Maktab', 'Toshkent shahri', 'Nodira Aliyeva (direktor)', '+998712000002');

    db.job_requests['r1'] = { id: 'r1', employer_id: e1, position_id: P('Support ustoz'), nechta: 2, min_staj: 2, yosh_dan: 20, yosh_gacha: 30, jins: 'ayol', dars_tili: 'farqi_yoq', min_malumot: 0, til_ball: 4, fan_talab: [{ subject_id: S('Matematika'), min_ball: 5 }], sat_min: 0, a_level_talab: [], viloyat: 'Toshkent shahri', stavka: 'farqi_yoq', maosh_dan: 4000000, maosh_gacha: 6000000, izoh: 'Kechki guruhlar, haftada 5 kun.', holat: 'faol', created_at: now - 3 * day };
    db.job_requests['r2'] = { id: 'r2', employer_id: e2, position_id: P('SAT ustoz'), nechta: 1, min_staj: 2, yosh_dan: 0, yosh_gacha: 0, jins: 'farqi_yoq', dars_tili: 'Ingliz', min_malumot: 3, til_ball: 5, fan_talab: [], sat_min: 1400, a_level_talab: [], viloyat: '', stavka: 'toliq', maosh_dan: 8000000, maosh_gacha: 12000000, izoh: '', holat: 'faol', created_at: now - 1 * day };

    db.job_requests['r3'] = { id: 'r3', employer_id: e2, position_id: P('Kimyo ustozi'), nechta: 1, min_staj: 3, yosh_dan: 0, yosh_gacha: 0, jins: 'farqi_yoq', dars_tili: 'Rus', min_malumot: 3, til_ball: 0, fan_talab: [{ subject_id: S('Kimyo'), min_ball: 5 }], sat_min: 0, a_level_talab: [], viloyat: 'Toshkent shahri', stavka: 'toliq', maosh_dan: 5000000, maosh_gacha: 7000000, izoh: 'Rus sinflari, 8–11-sinflar.', holat: 'faol', created_at: now - 2 * day };

    // --- Suhbat namunasi
    db.conversations['cv1'] = { id: 'cv1', candidate_id: 'c_nilufar', employer_id: e1, request_id: 'r1', last_at: now - 2 * 3600000, last_text: "Rahmat, ertaga soat 15:00 qulay.", bloklangan_by: null, created_at: now - day };
    db.messages['m1'] = { id: 'm1', conversation_id: 'cv1', sender_user_id: 'u_cambridge', tur: 'request', text: '', at: now - day };
    db.messages['m2'] = { id: 'm2', conversation_id: 'cv1', sender_user_id: 'u_cambridge', tur: 'text', text: "Assalomu alaykum, Nilufar. CV'ingiz bizga mos keldi. Suhbatga kelolasizmi?", at: now - day + 60000 };
    db.messages['m3'] = { id: 'm3', conversation_id: 'cv1', sender_user_id: 'u_nilufar', tur: 'text', text: "Rahmat, ertaga soat 15:00 qulay.", at: now - 2 * 3600000 };
    return db;
  }
  return { build };
})();
