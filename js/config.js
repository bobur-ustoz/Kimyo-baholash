// Top Xodim — sozlamalar
// Firebase va Telegram bot ma'lumotlari kelganda shu yerga yoziladi.
window.CONFIG = {
  APP_NAME: 'Top Xodim',
  VERSION: '0.7.0',
  // Telegram bot foydalanuvchi nomi (masalan 'TopXodimBot'). Bo'sh bo'lsa demo kirish ishlaydi.
  TELEGRAM_BOT: 'TopXodimBot',
  // Firebase veb-ilova konfiguratsiyasi (Firebase console → Project settings → Your apps → Config).
  // null bo'lsa demo rejim: ma'lumot brauzerda (localStorage) saqlanadi.
  // Masalan:
  // FIREBASE: { apiKey: '...', authDomain: 'top-xodim.firebaseapp.com', projectId: 'top-xodim', storageBucket: 'top-xodim.appspot.com', messagingSenderId: '...', appId: '...' },
  FIREBASE: null,
  // Firebase Functions joylashgan region (functions/index.js bilan bir xil)
  FUNCTIONS_REGION: 'europe-west1',
  // Demo rejim: soxta foydalanuvchilar bilan kirish tugmalari ko'rinadi
  DEMO: true,
};
