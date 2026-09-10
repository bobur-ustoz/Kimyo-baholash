// Top Xodim — Firebase Functions
//  1) telegramAuth    — Telegram Login Widget ma'lumotini tekshiradi, Firebase custom token beradi
//  2) onNewMessage    — yangi chat xabari kelganda qabul qiluvchiga Telegram bot orqali yozadi
//  3) telegramWebhook — bot /start bosilganda ilova havolasini yuboradi
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret, defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();
const REGION = 'europe-west1';
const BOT_TOKEN = defineSecret('TELEGRAM_BOT_TOKEN');       // firebase functions:secrets:set TELEGRAM_BOT_TOKEN
const APP_URL = defineString('APP_URL', { default: 'https://top-xodim.web.app' });
const esc = (s) => String(s || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// --- Telegram imzosini tekshirish: https://core.telegram.org/widgets/login#checking-authorization
function verifyTelegram(data, token) {
  const { hash, ...rest } = data;
  if (!hash) return false;
  const check = Object.keys(rest).filter((k) => rest[k] !== undefined && rest[k] !== null).sort().map((k) => `${k}=${rest[k]}`).join('\n');
  const secret = crypto.createHash('sha256').update(token).digest();
  const hmac = crypto.createHmac('sha256', secret).update(check).digest('hex');
  if (hmac !== hash) return false;
  if (Date.now() / 1000 - Number(rest.auth_date) > 86400) return false; // 1 kundan eski
  return true;
}

exports.telegramAuth = onCall({ region: REGION, secrets: [BOT_TOKEN] }, async (req) => {
  const tg = req.data || {};
  if (!verifyTelegram(tg, BOT_TOKEN.value())) throw new HttpsError('permission-denied', "Telegram ma'lumoti tasdiqlanmadi");
  const uid = 'tg_' + tg.id;
  const token = await admin.auth().createCustomToken(uid, { telegram_id: tg.id });
  return { token, uid };
});

// --- Telegram'ga xabar yuborish
async function sendTelegram(token, chatId, text, url) {
  const body = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (url) body.reply_markup = { inline_keyboard: [[{ text: 'Ilovada ochish', url }]] };
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) console.warn('telegram sendMessage', r.status, await r.text());
}

exports.onNewMessage = onDocumentCreated({ region: REGION, document: 'messages/{id}', secrets: [BOT_TOKEN] }, async (event) => {
  const m = event.data && event.data.data();
  if (!m || !m.conversation_id) return;
  const db = admin.firestore();
  const conv = (await db.collection('conversations').doc(m.conversation_id).get()).data();
  if (!conv) return;
  const toUid = (conv.user_ids || []).find((u) => u !== m.sender_user_id);
  if (!toUid) return;
  const [to, from] = await Promise.all([db.collection('users').doc(toUid).get(), db.collection('users').doc(m.sender_user_id).get()]);
  const tgId = to.exists && to.data().telegram_id;
  if (!tgId) return;
  let who = from.exists ? from.data().name : 'Foydalanuvchi';
  if (from.exists && from.data().rol === 'ish_beruvchi') {
    const e = await db.collection('employers').doc(conv.employer_id).get();
    if (e.exists) who = e.data().nomi;
  }
  let pos = '';
  if (conv.request_id) {
    const r = await db.collection('job_requests').doc(conv.request_id).get();
    if (r.exists) { const p = await db.collection('positions').doc(r.data().position_id).get(); if (p.exists) pos = ' · ' + p.data().nomi; }
  }
  const text = m.tur === 'request'
    ? `<b>${esc(who)}</b>${esc(pos)} sizga so'rov yubordi.`
    : `<b>${esc(who)}</b>${esc(pos)}:\n${esc((m.text || '').slice(0, 300))}`;
  await sendTelegram(BOT_TOKEN.value(), tgId, text, `${APP_URL.value()}/#/chat/${m.conversation_id}`);
});

// --- Bot webhook: /start → ilova havolasi. Sozlash: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<FUNCTION_URL>
exports.telegramWebhook = onRequest({ region: REGION, secrets: [BOT_TOKEN] }, async (req, res) => {
  const msg = req.body && req.body.message;
  if (msg && msg.text && msg.text.startsWith('/start')) {
    await sendTelegram(BOT_TOKEN.value(), msg.chat.id, `Assalomu alaykum! <b>Top Xodim</b> — o'quv markazlar uchun xodim topish ilovasi.\nIlovaga kirib, «Ish kerak» yoki «Ishchi kerak» ni tanlang. Yangi xabarlar shu yerga keladi.`, APP_URL.value());
  }
  res.status(200).send('ok');
});
