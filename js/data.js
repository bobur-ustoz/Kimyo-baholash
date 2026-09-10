// Lug'atlar va shkalalar — sxema 4 va 8-bo'limlar
window.DATA = (function () {
  // Ikki bo'lim: oquv — dars/fan/sertifikat talablari so'raladi; mamuriyat — so'ralmaydi
  const BOLIMLAR = [{ v: 'oquv', l: "O'quv bo'limi" }, { v: 'mamuriyat', l: "Ma'muriy bo'lim" }];
  const OQUV = [
    'Matematika ustozi', 'Fizika ustozi', 'Kimyo ustozi', 'Biologiya ustozi', 'Ona tili ustozi', 'Tarix ustozi',
    'Ingliz tili ustozi', 'Rus tili ustozi', 'Informatika ustozi', 'Geografiya ustozi',
    'Support ustoz', 'Yordamchi ustoz', 'Uy vazifa tekshiruvchi', 'Kurator',
    'SAT ustoz', 'Kimyo A level ustoz', 'Biologiya A level ustoz', "IT o'qituvchisi",
    'Jismoniy tarbiya ustozi', 'Shaxmat ustozi',
  ];
  const MAMURIYAT = [
    'Administrator', 'HR xodim', 'SMM', 'Marketolog', 'Moliyachi', 'Sotuv menejer', 'Kutubxonachi',
    'Hamshira', 'Security', 'Tozalik xodimi', "Bog'cha mudirasi",
  ];
  const POSITIONS = [...OQUV.map((nomi) => ({ nomi, bolim: 'oquv' })), ...MAMURIYAT.map((nomi) => ({ nomi, bolim: 'mamuriyat' }))]
    .map((p, i) => ({ id: 'p' + (i + 1), nomi: p.nomi, bolim: p.bolim, faol: true, tartib: i }));

  const SUBJECTS = [
    'Matematika', 'Fizika', 'Kimyo', 'Biologiya', 'Ona tili', 'Tarix',
    'Ingliz tili', 'Rus tili', 'Informatika', 'Geografiya',
  ].map((nomi, i) => ({ id: 's' + (i + 1), nomi, faol: true, tartib: i }));

  const REGIONS = [
    'Toshkent shahri', 'Toshkent viloyati', 'Andijon', 'Buxoro', "Farg'ona", 'Jizzax',
    'Xorazm', 'Namangan', 'Navoiy', 'Qashqadaryo', "Qoraqalpog'iston", 'Samarqand',
    'Sirdaryo', 'Surxondaryo',
  ];

  const MALUMOT = [
    { v: 1, l: "O'rta" }, { v: 2, l: "O'rta maxsus" }, { v: 3, l: 'Bakalavr' }, { v: 4, l: 'Magistr' },
  ];
  const STAVKA = [
    { v: 'toliq', l: "To'liq stavka" }, { v: 'yarim', l: 'Yarim stavka' }, { v: 'soatbay', l: 'Soatbay' },
  ];
  const JINS = [{ v: 'erkak', l: 'Erkak' }, { v: 'ayol', l: 'Ayol' }];
  const ORG_TURI = ["O'quv markaz", 'Maktab', "Bog'cha", 'Boshqa'];

  // Til shkalasi: 1..6
  const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const IELTS_BANDS = ['4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'];
  function ieltsToBall(x) {
    x = parseFloat(x);
    if (isNaN(x)) return 0;
    if (x < 4) return 1;
    if (x < 4.5) return 2;
    if (x <= 5) return 3;
    if (x <= 6.5) return 4;
    if (x <= 8) return 5;
    return 6;
  }
  function tilBall(shkala, qiymat) {
    if (!shkala || !qiymat) return 0;
    if (shkala === 'IELTS') return ieltsToBall(qiymat);
    const i = CEFR.indexOf(qiymat);
    return i < 0 ? 0 : i + 1;
  }
  function tilLabel(ball) {
    if (!ball) return '—';
    return CEFR[ball - 1] + ' / IELTS ' + ['<4', '4.0', '4.5–5.0', '5.5–6.5', '7.0–8.0', '8.5–9.0'][ball - 1];
  }

  // Fan sertifikati: C=1 … A+=6
  const FAN_DARAJA = ['C', 'C+', 'B', 'B+', 'A', 'A+'];
  const fanBall = (d) => FAN_DARAJA.indexOf(d) + 1;
  // A level: E=1 … A*=6
  const ALEVEL = ['E', 'D', 'C', 'B', 'A', 'A*'];
  const alevelBall = (d) => ALEVEL.indexOf(d) + 1;

  // Dars o'tish tili
  const DARS_TILLARI = ["O'zbek", 'Rus', 'Ingliz'];
  const TILLAR = ['Rus tili', 'Turk tili', 'Arab tili', 'Koreys tili', 'Nemis tili', 'Boshqa'];

  return {
    POSITIONS, BOLIMLAR, SUBJECTS, REGIONS, MALUMOT, STAVKA, JINS, ORG_TURI,
    CEFR, IELTS_BANDS, FAN_DARAJA, ALEVEL, TILLAR, DARS_TILLARI,
    ieltsToBall, tilBall, tilLabel, fanBall, alevelBall,
    malumotLabel: (v) => (MALUMOT.find((m) => m.v === +v) || {}).l || '—',
    stavkaLabel: (v) => (STAVKA.find((s) => s.v === v) || {}).l || (v === 'farqi_yoq' ? "Farqi yo'q" : '—'),
    bolimLabel: (v) => (BOLIMLAR.find((b) => b.v === v) || {}).l || '—',
    jinsLabel: (v) => (JINS.find((j) => j.v === v) || {}).l || (v === 'farqi_yoq' ? "Farqi yo'q" : '—'),
  };
})();
