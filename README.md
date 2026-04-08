# Kimyo Baholash - Milliy Sertifikat Tizimi

Kimyo fanidan milliy sertifikat imtihoni javoblarini AI (Google Gemini) yordamida tekshiruvchi web-ilova.

## 🚀 Ishga tushirish (3 ta yo'l)

### 1-yo'l: GitHub Pages (bepul hosting)
1. GitHub.com da yangi repository yarating
2. Shu papkadagi barcha fayllarni yuklang
3. Settings → Pages → Source: `main` branch → Save
4. 1-2 daqiqada `https://username.github.io/repo-name/` da ishlaydi

### 2-yo'l: Netlify (drag & drop)
1. https://app.netlify.com/drop ga kiring
2. Shu papkani drag & drop qiling
3. Tayyor — link beradi

### 3-yo'l: Lokal server
```bash
cd MS_deploy
python3 -m http.server 8000
```
Brauzerda: http://localhost:8000

## 📁 Fayllar
- `index.html` — asosiy sahifa
- `style.css` — dizayn
- `app.js` — dastur logikasi (Gemini API)
- `K.Baholash.docx` — baholash mezonlari

## ⚠️ Muhim
- `file://` protokolida ishlamaydi (CORS xatosi)
- Faqat `http://` yoki `https://` orqali oching
