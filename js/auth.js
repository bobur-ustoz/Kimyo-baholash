// Kirish: Telegram (haqiqiy) yoki demo
window.Auth = (function () {
  const KEY = 'topxodim.session';
  let cache = null;

  function sessionId() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  const fb = () => !!CONFIG.FIREBASE;
  async function current() {
    if (fb()) {
      const u = firebase.auth().currentUser;
      if (!u) return (cache = null);
      if (cache && cache.id === u.uid) return cache;
      cache = await Store.get('users', u.uid);
      return cache;
    }
    const id = sessionId();
    if (!id) return (cache = null);
    if (cache && cache.id === id) return cache;
    cache = await Store.get('users', id);
    return cache;
  }
  async function login(userId) { try { localStorage.setItem(KEY, userId); } catch (e) {} cache = null; return current(); }
  function logout() { if (fb()) firebase.auth().signOut(); try { localStorage.removeItem(KEY); } catch (e) {} cache = null; }

  // Telegram widget'dan kelgan foydalanuvchi: {id, first_name, last_name, username, photo_url, auth_date, hash}
  // Eslatma: haqiqiy tekshiruv (hash) Firebase Functions'da bo'ladi — 10-bo'lim.
  async function loginTelegram(tg, rol) {
    const name = [tg.first_name, tg.last_name].filter(Boolean).join(' ');
    if (fb()) {
      // Telegram imzosini server (Firebase Functions) tekshiradi va Firebase token beradi
      const call = firebase.app().functions(CONFIG.FUNCTIONS_REGION).httpsCallable('telegramAuth');
      const res = await call(tg);
      await firebase.auth().signInWithCustomToken(res.data.token);
      const uid = firebase.auth().currentUser.uid;
      let u = await Store.get('users', uid);
      if (!u) u = await Store.add('users', { id: uid, telegram_id: tg.id, telegram_username: tg.username || '', name, rasm: tg.photo_url || '', rol, telefon: '', bloklangan: false });
      else if (u.telegram_username !== (tg.username || '')) await Store.update('users', uid, { telegram_username: tg.username || '', rasm: tg.photo_url || u.rasm || '' });
      cache = null; return current();
    }
    let u = (await Store.list('users', (x) => x.telegram_id === tg.id))[0];
    if (!u) u = await Store.add('users', { telegram_id: tg.id, telegram_username: tg.username || '', name, rasm: tg.photo_url || '', rol, telefon: '', bloklangan: false });
    return login(u.id);
  }

  // Telegram Login Widget skriptini joylashtiradi (CONFIG.TELEGRAM_BOT bo'lsa)
  function mountTelegramWidget(container, rol) {
    // Widget faqat haqiqiy rejimda (Firebase ulangan) ma'noga ega — imzo serverda tekshiriladi
    if (!CONFIG.TELEGRAM_BOT || !CONFIG.FIREBASE) return false;
    window.onTelegramAuth = async (tg) => {
      const u = await loginTelegram(tg, rol);
      App.afterLogin(u, rol);
    };
    const s = document.createElement('script');
    s.src = 'https://telegram.org/js/telegram-widget.js?22';
    s.async = true;
    s.setAttribute('data-telegram-login', CONFIG.TELEGRAM_BOT);
    s.setAttribute('data-size', 'large');
    s.setAttribute('data-radius', '8');
    s.setAttribute('data-onauth', 'onTelegramAuth(user)');
    s.setAttribute('data-request-access', 'write');
    container.appendChild(s);
    return true;
  }

  return { current, login, logout, loginTelegram, mountTelegramWidget };
})();
