// Firestore ma'lumot qatlami — StoreLocal bilan bir xil interfeys.
// CONFIG.FIREBASE to'ldirilganda app.js shu qatlamni tanlaydi.
window.StoreFirebase = function () {
  const db = firebase.firestore();
  const listeners = new Set();
  const watchers = {}; // coll -> unsubscribe
  const cache = {};    // coll -> { id: doc } (jonli kuzatuvdagi to'plamlar uchun)
  const uid = () => db.collection('_').doc().id;
  const withId = (d) => Object.assign({ id: d.id }, d.data());

  // Ko'p o'qiladigan to'plamlarni jonli kuzatamiz (bir marta yuklab, o'zgarishda yangilanadi)
  const LIVE = ['positions', 'subjects', 'candidates', 'employers', 'job_requests', 'saved_candidates', 'conversations', 'messages', 'users', 'reports'];
  function watch(c) {
    if (watchers[c]) return watchers[c].ready;
    let resolve; const ready = new Promise((r) => (resolve = r));
    const unsub = db.collection(c).onSnapshot((snap) => {
      cache[c] = cache[c] || {};
      snap.docChanges().forEach((ch) => { if (ch.type === 'removed') delete cache[c][ch.doc.id]; else cache[c][ch.doc.id] = withId(ch.doc); });
      resolve(); listeners.forEach((f) => { try { f(); } catch (e) {} });
    }, (err) => { console.error('Firestore', c, err); resolve(); });
    watchers[c] = { unsub, ready };
    return ready;
  }

  return {
    async init() {
      await firebase.firestore().enablePersistence({ synchronizeTabs: true }).catch(() => {});
      await Promise.all(['positions', 'subjects'].map(watch));
      // Lug'atlar bo'sh bo'lsa boshlang'ich ro'yxatni yozamiz (faqat admin yoza oladi — qoidalarga qarang)
      if (!Object.keys(cache.positions || {}).length) {
        try { const b = db.batch(); DATA.POSITIONS.forEach((p) => b.set(db.collection('positions').doc(p.id), p)); DATA.SUBJECTS.forEach((s) => b.set(db.collection('subjects').doc(s.id), s)); await b.commit(); } catch (e) { /* admin emas — o'tkazib yuboramiz */ }
      }
    },
    async reset() { throw new Error("Firebase rejimida demo tiklash yo'q"); },
    async list(c, fn) {
      if (LIVE.includes(c)) { await watch(c); const a = Object.values(cache[c] || {}); return fn ? a.filter(fn) : a; }
      const snap = await db.collection(c).get(); const a = snap.docs.map(withId); return fn ? a.filter(fn) : a;
    },
    async get(c, id) {
      if (LIVE.includes(c) && cache[c] && cache[c][id]) return cache[c][id];
      const d = await db.collection(c).doc(id).get(); return d.exists ? withId(d) : null;
    },
    async add(c, obj) {
      const id = obj.id || uid();
      const data = Object.assign({}, obj, { id, created_at: obj.created_at || Date.now() });
      await db.collection(c).doc(id).set(data);
      if (cache[c]) cache[c][id] = data;
      return data;
    },
    async update(c, id, patch) {
      await db.collection(c).doc(id).update(Object.assign({}, patch, { updated_at: Date.now() }));
      if (cache[c] && cache[c][id]) Object.assign(cache[c][id], patch);
      return this.get(c, id);
    },
    async remove(c, id) { await db.collection(c).doc(id).delete(); if (cache[c]) delete cache[c][id]; },
    onChange(f) { listeners.add(f); return () => listeners.delete(f); },
    exportJSON() { return JSON.stringify(cache, null, 2); },
    uid,
  };
};
