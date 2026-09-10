# Top Xodim — ilova sxemasi (3-versiya, yakuniy)

O'quv markazlar va maktablar uchun xodim topish ilovasi.

- **Platforma:** Web ilova (PWA)
- **Qidiruv:** ish beruvchi filtr bilan qidiradi (nomzod vakansiya ko'rmaydi)
- **Aloqa:** ichki chat
- **Moderatsiya:** hozircha yo'q
- **Admin panel:** bor
- **Kirish:** Telegram orqali (keyin SMS qo'shish mumkin)
- **Baza:** Firebase + haftalik eksport nusxasi

## Ikki rol

| «Ish kerak» — Nomzod | «Ishchi kerak» — Ish beruvchi |
|---|---|
| Ro'yxatdan o'tadi, profil to'ldiradi (4 qadam) — tayyor CV shakllanadi | Tashkilotini ro'yxatdan o'tkazadi |
| Qaysi lavozimlarga tayyorligini belgilaydi | So'rov yaratadi: lavozim, staj, yosh, jins, sertifikat talablari |
| Staj, ma'lumot, sertifikatlarini kiritadi | Mos nomzodlar ro'yxatini oladi |
| Ish beruvchi yozganda chatda javob beradi | Profilni ko'rib «Xabar yozish» bosadi → chat |
| Profilini yashirishi / yangilashi mumkin | So'rovlarni va yoqqan nomzodlarni saqlaydi |

## 1. Ekranlar oqimi

```
                 ┌─ Ish kerak ──► Kirish ──► Profil to'ldirish (4 qadam) ──► Mening CV'm ──────► Xabarlar ─┐
Asosiy menyu ────┤                                                                                          ├──► Chat
                 └─ Ishchi kerak ► Kirish ──► Xodim qidirish (filtr) ──► Natijalar ──► Nomzod CV'si ────────┘
```

Chatni faqat ish beruvchi boshlaydi. Nomzod «Xabarlar» ekranida kelgan suhbatlarni ko'radi va javob beradi.

## 2. Nomzod profili — 4 qadam

`*` — majburiy: CV chiqishi uchun to'ldirilishi shart. Ixtiyoriy faqat rasm va sertifikatlar ro'yxatlari (bo'lmasa «yo'q» deb belgilaydi).

**1-qadam. Shaxsiy**
- `fish` *
- `tugilgan_sana` * — yosh avtomatik hisoblanadi
- `jins` * — Erkak / Ayol
- `shahar` * — viloyat → shahar/tuman
- `telefon` * — qo'lda kiritiladi; chat boshlanguncha yashirin (`telegram_id` kirishdan avtomatik)
- `rasm`

**2-qadam. Lavozim va ish sharti**
- `lavozimlar[]` * — ro'yxatdan bir yoki bir nechta
- `dars_tillari[]` — dars o'tish tili: O'zbek / Rus / Ingliz (bir nechta; ustozlar uchun)
- `stavka` * — To'liq / Yarim / Soatbay
- `kutilgan_maosh` *, `boshlash_sanasi` *

**3-qadam. Tajriba va ma'lumot**
- `staj_yil` * — 0 = tajribasiz
- `malumot` * — O'rta / O'rta maxsus / Bakalavr / Magistr
- `oqigan_joyi` * — o'quv yurti
- `yonalish`, `oqish_yil_dan`, `oqish_yil_gacha` — yo'nalish va o'qigan yillari (ixtiyoriy)
- `ish_joylari[]` — tashkilot, lavozim, yildan–yilgacha (ixtiyoriy)

**4-qadam. Sertifikatlar**
- `ingliz_tili` — IELTS / CEFR / Milliy + daraja yoki ball (`IELTS 7.0`, `CEFR B2`)
- `boshqa_tillar[]` — A1–C2
- `fan_sertifikatlari[]` — fan (ro'yxatdan) + daraja (A+, A, B+, B, C+, C); rasm ixtiyoriy
- `sat` — SAT balli 400–1600
- `a_level[]` — fan + baho (A*, A, B, C, D, E)
- `boshqa_sertifikatlar[]` — nomi + fayl
- `ozim_haqimda` * — 300 belgigacha

**Profil holati:** Faol (qidiruvda chiqadi) / Yashirin (o'chmaydi, qayta yoqish mumkin).

**Tayyor CV.** To'rt qadam to'lgach ilova o'zi CV yig'adi — nomzodning bosh ekrani va ish beruvchi ochadigan sahifa bitta shablon:

| CV qismi | Maydonlar |
|---|---|
| Sarlavha | rasm (bo'lsa) · fish · yosh · jins · shahar · lavozimlar |
| Ish sharti | stavka · kutilgan_maosh · boshlash_sanasi |
| Tajriba | staj_yil · ish_joylari[] |
| Ma'lumot | malumot · oqigan_joyi |
| Sertifikatlar | ingliz_tili · boshqa_tillar[] · fan_sertifikatlari[] · boshqa_sertifikatlar[] |
| Men haqimda | ozim_haqimda |
| Aloqa | telefon — faqat chat boshlangan ish beruvchiga; boshqalarga «Xabar yozish» |

CV'ni PDF qilib yuklab olish va havola bilan ulashish mumkin (havolada telefon ko'rinmaydi).

## 3. Ish beruvchi so'rovi

**Tashkilot (bir marta):** `nomi` *, `turi` * (O'quv markaz / Maktab / Bog'cha / Boshqa), `shahar` *, `masul_shaxs` *, `telefon` *.

**So'rov «Menga ... kerak»:**
- `lavozim` * — bitta
- `nechta` — standart 1
- `min_staj` — kamida N yil
- `yosh_dan`, `yosh_gacha`
- `jins` * — Erkak / Ayol / Farqi yo'q
- `dars_tili` — O'zbek / Rus / Ingliz / Farqi yo'q («Kimyo (rus)» = lavozim Kimyo + dars tili Rus)
- `min_malumot`
- `til_talab` — kamida `IELTS 7.0` yoki `CEFR B2`
- `fan_talab[]` — fan + kamida daraja (Matematika ≥ A, Fizika ≥ B+)
- `sat_min` — kamida SAT balli
- `a_level_talab[]` — fan + kamida baho (Kimyo ≥ A)
- `shahar` — standart tashkilot shahri; «butun O'zbekiston» mumkin
- `stavka`, `maosh_dan`, `maosh_gacha`, `izoh`
- `holat` — faol / yopiq

**Natijalar ekrani:** karta — ism, yosh, jins, shahar, staj, lavozimlar, asosiy sertifikatlar. Tugmalar: Profilni ko'rish · Xabar yozish · Saqlash. Ro'yxat ostida «Yaqin mosliklar» bo'limi — bitta shartga to'g'ri kelmaganlar, kartada qaysi shart yozilgan.

## 4. Moslik mantiqi

Ish beruvchi to'ldirmagan talab tekshirilmaydi. To'ldirilganlarning hammasi bajarilsa nomzod chiqadi.

| So'rov | Shart | Nomzod |
|---|---|---|
| `lavozim` | ∈ ro'yxatda | `lavozimlar[]` |
| `min_staj` | ≤ | `staj_yil` |
| `yosh_dan … yosh_gacha` | ∋ oraliqda | `yosh` (tug'ilgan sanadan) |
| `jins` | = yoki «farqi yo'q» | `jins` |
| `dars_tili` | ∈ ro'yxatda yoki «farqi yo'q» | `dars_tillari[]` |
| `min_malumot` | ≤ daraja balli | `malumot` |
| `til_talab` | ≤ til balli | `ingliz_tili` |
| `fan_talab[]` | har biri ≤ | `fan_sertifikatlari[]` |
| `sat_min` | ≤ | `sat` |
| `a_level_talab[]` | har biri ≤ | `a_level[]` |
| `shahar`, `stavka` | = yoki «farqi yo'q» | `shahar`, `stavka` |

**Darajalarni raqamga o'girish**

| Ball | CEFR | IELTS | Milliy |
|---|---|---|---|
| 1 | A1 | < 4.0 | — |
| 2 | A2 | 4.0 | — |
| 3 | B1 | 4.5–5.0 | B1 |
| 4 | B2 | 5.5–6.5 | B2 |
| 5 | C1 | 7.0–8.0 | C1 |
| 6 | C2 | 8.5–9.0 | C2 |

Fan sertifikati: A+=6, A=5, B+=4, B=3, C+=2, C=1.
A level: A*=6, A=5, B=4, C=3, D=2, E=1. SAT — raqamning o'zi.
Ma'lumot: Magistr=4, Bakalavr=3, O'rta maxsus=2, O'rta=1.

**Misol.** So'rov: Support ustoz, staj ≥ 2, yosh 20–30, ayol, IELTS ≥ 6.5 (4), Matematika ≥ A (5). Nomzod: [Support ustoz, Kurator], staj 3, yosh 24, ayol, CEFR C1 (5), Matematika A+ (6) → chiqadi. Matematikasi B+ (4) bo'lsa — to'liq mosliklarga chiqmaydi, «Yaqin mosliklar»da ko'rinadi.

**«Yaqin mosliklar» qoidasi**
- `lavozim`, `jins`, `dars_tili` — hech qachon yumshatilmaydi
- `min_staj`, `yosh`, `min_malumot`, `til_talab`, `fan_talab`, `sat_min`, `a_level_talab`, `shahar`, `stavka` — faqat **bittasi** bajarilmagan bo'lsa chiqadi
- Ikki va undan ko'p shart bajarilmasa — chiqmaydi
- Kartada farq yoziladi: «staj 1 yil, siz 2 so'ragansiz»

## 5. Chat

- Chatni ish beruvchi boshlaydi (nomzod vakansiya ko'rmaydi)
- Bir nomzod + bir ish beruvchi = bitta suhbat
- Birinchi xabar so'rov kartasi bilan keladi (lavozim, maosh, shartlar)
- Telefon raqam faqat chat ichida ochiladi
- Bildirishnoma: Telegram bot orqali
- Bloklash / shikoyat — shikoyat admin panelga tushadi

## 6. Ma'lumotlar modeli

```
Foydalanuvchi ──1:1──► Nomzod ──1:n──► Sertifikat
              │                 ──1:n──► Ish joyi
              │                 ──n:m──► Lavozim ◄──n:1── So'rov
              └──1:1──► Ish beruvchi ──1:n──► So'rov
                                     ──1:n──► Saqlangan nomzod
Nomzod ──1:n──► Suhbat ◄──1:n── Ish beruvchi     (suhbat so'rovga bog'liq)
                 Suhbat ──1:n──► Xabar
```

| Jadval | Maydonlar |
|---|---|
| `users` | id, telegram_id, telegram_username, telefon, rol (nomzod \| ish_beruvchi \| admin), yaratilgan_vaqt, oxirgi_kirish |
| `candidates` | id, user_id, fish, tugilgan_sana, jins, shahar_id, rasm_url, dars_tillari[], staj_yil, malumot (1–4), oqigan_joyi, ozim_haqimda, stavka, kutilgan_maosh, holat (faol \| yashirin) |
| `certificates` | id, candidate_id, tur (til \| fan \| sat \| a_level \| boshqa), nomi, subject_id, shkala (IELTS \| CEFR \| milliy \| daraja \| SAT \| A level), qiymat, ball (1–6; SAT raqam), fayl_url |
| `work_history` | id, candidate_id, tashkilot, lavozim, yil_dan, yil_gacha |
| `positions` | id, nomi, bolim (oquv \| mamuriyat), faol |
| `subjects` | id, nomi, faol |
| `candidate_positions` | candidate_id, position_id |
| `employers` | id, user_id, nomi, turi, shahar_id, masul_shaxs, telefon, tasdiqlangan (hozircha ishlatilmaydi) |
| `job_requests` | id, employer_id, position_id, nechta, min_staj, yosh_dan, yosh_gacha, jins, dars_tili, min_malumot, til_ball, fan_talab[] {subject_id, min_ball}, sat_min, a_level_talab[] {subject_id, min_ball}, shahar_id, stavka, maosh_dan, maosh_gacha, izoh, holat |
| `saved_candidates` | employer_id, candidate_id, request_id, vaqt |
| `conversations` | id, candidate_id, employer_id, request_id, oxirgi_xabar_vaqti, bloklangan |
| `reports` | id, conversation_id, kim, sabab, vaqt, holat (yangi \| ko'rildi) |
| `messages` | id, conversation_id, sender_user_id, matn, fayl_url, vaqt, oqildi |

## 7. Admin panel

Faqat admin roliga, alohida manzil. Ekranlar:
- **Lavozimlar** — qo'shish, nomini o'zgartirish, o'chirib qo'yish (faol = yo'q)
- **Fanlar** — xuddi shunday
- **Foydalanuvchilar** — nomzodlar va ish beruvchilar, qidirish, bloklash; ish beruvchi yonida «Tasdiqlash» (moderatsiya yoqilganda)
- **Shikoyatlar** — chatdan kelganlar: kim, kimga, sabab → ko'rildi / bloklandi
- Bosh sahifada statistika: nomzodlar, so'rovlar, suhbatlar soni

## 8. Lavozimlar va fanlar (bazada, admin paneldan boshqariladi)

Lavozimlar ikki bo'limda (31):

- **O'quv bo'limi (20):** Matematika ustozi · Fizika ustozi · Kimyo ustozi · Biologiya ustozi · Ona tili ustozi · Tarix ustozi · Ingliz tili ustozi · Rus tili ustozi · Informatika ustozi · Geografiya ustozi · Support ustoz · Yordamchi ustoz · Uy vazifa tekshiruvchi · Kurator · SAT ustoz · Kimyo A level ustoz · Biologiya A level ustoz · IT o'qituvchisi · Jismoniy tarbiya ustozi · Shaxmat ustozi
- **Ma'muriy bo'lim (11):** Administrator · HR xodim · SMM · Marketolog · Moliyachi · Sotuv menejer · Kutubxonachi · Hamshira · Security · Tozalik xodimi · Bog'cha mudirasi

O'quv bo'limi lavozimlarida dars tili, fan sertifikati, SAT, A level so'raladi; ma'muriy bo'limda bu maydonlar ko'rinmaydi (ikki tomonda ham). Ingliz tili, boshqa tillar va boshqa sertifikatlar hamma uchun.

Fanlar (10): Matematika · Fizika · Kimyo · Biologiya · Ona tili · Tarix · Ingliz tili · Rus tili · Informatika · Geografiya

## 9. Qabul qilingan qarorlar

| Savol | Qaror |
|---|---|
| Ilova nomi | **Top Xodim** |
| Ish beruvchilarni moderatsiya qilish | Hozircha yo'q; `tasdiqlangan` maydoni va admin tugmasi tayyor turadi |
| Sertifikat rasmi | Ixtiyoriy |
| «Yaqin mosliklar» | Bor — bitta shartga chegirma, lavozim va jinsga emas |
| Tayyor CV | Bor — avtomatik; rasm ixtiyoriy, qolgani majburiy |
| Admin panel | Bor |
| Fanlar | 10 ta tasdiqlandi |
| Kirish usuli | Telegram orqali — bepul; keyin SMS qo'shish mumkin |
| Baza | Firebase + haftalik eksport nusxasi (Google Drive) |
| SAT, A level | Lavozim ham, nomzod sertifikati ham; filtrga qo'yiladi |
| Nomzod so'rovlarni ko'rishi | Yo'q |

## 10. Texnologiya

| Qism | Nima bilan | Izoh |
|---|---|---|
| Ilova | PWA — HTML/CSS/JS | Telefonga o'rnatiladi |
| Kod | GitHub | |
| Kirish | Telegram Login → Firebase Auth | Firebase Functions kerak (Blaze tarif, bepul kvota ichida) |
| Baza | Firestore | 6-bo'lim jadvallari → collections |
| Fayllar | Firebase Storage | rasm, sertifikat, CV PDF |
| Bildirishnoma | Telegram bot | |
| Hosting | Firebase Hosting | bepul, HTTPS |
| Zaxira nusxa | Haftalik eksport → Google Drive | ikkinchi nusxa |

**Sxema yopildi.** Keyingi qadam — yasash tartibi: 1) Firebase loyiha + Telegram bot, 2) asosiy menyu + Telegram kirish, 3) nomzod 4 qadam + CV, 4) ish beruvchi so'rov + natijalar, 5) chat + bot bildirishnoma, 6) admin panel.
