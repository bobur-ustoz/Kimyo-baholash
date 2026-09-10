# Top Xodim — o'rnatish yo'riqnomasi

O'quv markazlar va maktablar uchun xodim topish ilovasi (PWA). Sxema: `SXEMA.md`.

## Tuzilma

| Fayl | Vazifa |
|---|---|
| `index.html`, `css/app.css`, `js/app.js` | Ilova ekranlari |
| `js/store.js` | Demo ma'lumot qatlami (brauzer xotirasi) + boshlang'ich namunalar |
| `js/store-firebase.js` | Firestore ma'lumot qatlami — `CONFIG.FIREBASE` to'ldirilganda ishlaydi |
| `js/auth.js` | Telegram orqali kirish (demo va Firebase yo'li) |
| `js/match.js` | Moslik mantiqi (SXEMA 4-bo'lim) |
| `js/pdf.js` | CV'ni PDF qilish |
| `functions/` | Firebase Functions: Telegram imzosini tekshirish, bot bildirishnomalari |
| `firestore.rules` | Kim nimani o'qiy/yoza olishi |
| `build-preview.sh` | Bitta faylga yig'ish (demo ko'rish uchun) |

## Demo rejim

`js/config.js` da `FIREBASE: null` bo'lsa ilova demo rejimda: ma'lumot brauzerda saqlanadi, tayyor namunalar bilan kirish mumkin. `index.html` ni istalgan hostingga qo'ysa bo'ladi.

## Haqiqiy rejim — 6 qadam

### 1. Telegram bot
1. Telegram'da **@BotFather** → `/newbot` → nom (masalan `Top Xodim`) → username `TopXodimBot` (ochilgan).
2. Berilgan **token**ni saqlab qo'ying (hech kimga bermang, chatga yozmang).
3. `/setdomain` → botni tanlang → ilova domenini kiriting (masalan `top-xodim.web.app`). Bu Telegram Login Widget uchun shart.

### 2. Firebase loyiha
1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → nom `top-xodim`.
2. **Build → Firestore Database** → Create → production mode → region `europe-west1` (yoki yaqinroq).
3. **Build → Authentication** → Get started (provayder qo'shish shart emas — custom token ishlatiladi).
4. **Build → Hosting** → Get started.
5. **Project settings → Your apps → Web app (</>)** → nom `Top Xodim` → **Config** ko'rinishini nusxalang.
6. **Upgrade → Blaze** (pay as you go) — Functions uchun shart; oddiy foydalanishda bepul kvota ichida qoladi.

### 3. Konfiguratsiya
`js/config.js`:
```js
TELEGRAM_BOT: 'TopXodimBot',
FIREBASE: { apiKey: '...', authDomain: 'top-xodim.firebaseapp.com', projectId: 'top-xodim', ... },
FUNCTIONS_REGION: 'europe-west1',
DEMO: false,
```
`.firebaserc` da `"default": "top-xodim"` — loyiha ID'ingiz bilan bir xil bo'lsin.

### 4. Joylash (kompyuterda bir marta)
```bash
npm install -g firebase-tools
firebase login
cd top-xodim
firebase functions:secrets:set TELEGRAM_BOT_TOKEN     # bot tokenini so'raydi
cd functions && npm install && cd ..
firebase deploy                                         # hosting + rules + functions
```
Ilova manzili: `https://top-xodim.web.app` (o'z domenini Hosting → Add custom domain orqali ulash mumkin).

### 5. Bot webhook
Deploy oxirida `telegramWebhook` funksiyasining URL'i chiqadi. Brauzerda bir marta oching:
```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=<telegramWebhook URL>
```
Endi botga `/start` yozilsa ilova havolasini yuboradi; yangi chat xabarlari botdan keladi.

### 6. Admin
Ilovaga Telegram bilan bir marta kiring (nomzod yoki ish beruvchi sifatida), keyin Firebase console → Firestore → `users` → o'zingizning hujjatingiz (`tg_<telegram id>`) → `rol` maydonini `admin` qiling. Shundan keyin `#/admin` manzili ochiladi; lavozimlar/fanlar ro'yxati birinchi kirishda avtomatik yoziladi.

## Zaxira nusxa
Admin panel → «Eksport (JSON)» — butun bazani fayl qilib beradi. Haftada bir marta Google Drive'ga saqlab qo'ying. (Avtomatik eksport keyingi bosqichda.)

## Cheklovlar (1-versiya)
- Profil va sertifikat rasmlari Firestore hujjati ichida saqlanadi (kichraytirilgan, ~100 KB); Firebase Storage keyin ulanadi.
- Qidiruv nomzodlar to'plamini to'liq yuklab, brauzerda filtrlaydi — bir necha ming nomzodgacha yetarli.
