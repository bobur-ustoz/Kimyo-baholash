// Moslik mantiqi — sxema 4-bo'lim
window.Match = (function () {
  function age(dob) {
    if (!dob) return null;
    const d = new Date(dob), n = new Date();
    let a = n.getFullYear() - d.getFullYear();
    const m = n.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--;
    return a;
  }

  // Bitta nomzodni so'rovga tekshiradi.
  // Natija: { hard: true|false, failed: [{key, label}] }
  function evaluate(req, c, subjName) {
    const failed = [];
    let hard = false;

    // Hech qachon yumshatilmaydi
    if (!(c.lavozimlar || []).includes(req.position_id)) hard = true;
    if (req.jins && req.jins !== 'farqi_yoq' && req.jins !== c.jins) hard = true;
    if (req.dars_tili && req.dars_tili !== 'farqi_yoq' && !(c.dars_tillari || []).includes(req.dars_tili)) hard = true;
    if (hard) return { hard, failed };

    if (req.min_staj > 0 && (c.staj_yil || 0) < req.min_staj)
      failed.push({ key: 'staj', label: `staj ${c.staj_yil || 0} yil, siz ${req.min_staj} so'ragansiz` });

    const a = age(c.tugilgan_sana);
    if (a != null) {
      if (req.yosh_dan && a < req.yosh_dan) failed.push({ key: 'yosh', label: `yoshi ${a}, siz ${req.yosh_dan} dan so'ragansiz` });
      else if (req.yosh_gacha && a > req.yosh_gacha) failed.push({ key: 'yosh', label: `yoshi ${a}, siz ${req.yosh_gacha} gacha so'ragansiz` });
    }

    if (req.min_malumot && (c.malumot || 0) < req.min_malumot)
      failed.push({ key: 'malumot', label: `ma'lumoti ${DATA.malumotLabel(c.malumot)}, siz kamida ${DATA.malumotLabel(req.min_malumot)} so'ragansiz` });

    if (req.til_ball && ((c.ingliz && c.ingliz.ball) || 0) < req.til_ball)
      failed.push({ key: 'til', label: `ingliz tili ${c.ingliz && c.ingliz.qiymat ? c.ingliz.shkala + ' ' + c.ingliz.qiymat : "yo'q"}, siz kamida ${DATA.CEFR[req.til_ball - 1]} so'ragansiz` });

    for (const t of req.fan_talab || []) {
      const s = (c.fan_sert || []).find((x) => x.subject_id === t.subject_id);
      const have = s ? s.ball : 0;
      if (have < t.min_ball)
        failed.push({ key: 'fan:' + t.subject_id, label: `${subjName(t.subject_id)} ${s ? s.daraja : "sertifikati yo'q"}, siz kamida ${DATA.FAN_DARAJA[t.min_ball - 1]} so'ragansiz` });
    }

    if (req.sat_min && (c.sat || 0) < req.sat_min)
      failed.push({ key: 'sat', label: `SAT ${c.sat || "yo'q"}, siz kamida ${req.sat_min} so'ragansiz` });

    for (const t of req.a_level_talab || []) {
      const s = (c.a_level || []).find((x) => x.subject_id === t.subject_id);
      const have = s ? s.ball : 0;
      if (have < t.min_ball)
        failed.push({ key: 'alevel:' + t.subject_id, label: `${subjName(t.subject_id)} A level ${s ? s.baho : "yo'q"}, siz kamida ${DATA.ALEVEL[t.min_ball - 1]} so'ragansiz` });
    }

    if (req.viloyat && req.viloyat !== c.viloyat)
      failed.push({ key: 'shahar', label: `${c.viloyat}, siz ${req.viloyat} so'ragansiz` });

    if (req.stavka && req.stavka !== 'farqi_yoq' && req.stavka !== c.stavka)
      failed.push({ key: 'stavka', label: `${DATA.stavkaLabel(c.stavka)}, siz ${DATA.stavkaLabel(req.stavka)} so'ragansiz` });

    return { hard, failed };
  }

  // So'rov bo'yicha barcha faol nomzodlarni ikki ro'yxatga ajratadi
  function run(req, candidates, subjName) {
    const full = [], near = [];
    for (const c of candidates) {
      if (c.holat !== 'faol' || (c.step_done || 0) < 4) continue;
      const r = evaluate(req, c, subjName);
      if (r.hard) continue;
      if (r.failed.length === 0) full.push({ c, failed: [] });
      else if (r.failed.length === 1) near.push({ c, failed: r.failed });
    }
    const byStaj = (x, y) => (y.c.staj_yil || 0) - (x.c.staj_yil || 0);
    full.sort(byStaj); near.sort(byStaj);
    return { full, near };
  }

  return { age, evaluate, run };
})();
