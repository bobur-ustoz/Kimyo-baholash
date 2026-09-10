// CV'ni PDF qilib yuklab olish: CV bloki rasmga olinadi (html2canvas), A4 sahifalarga joylanadi (jsPDF)
window.CVPdf = (function () {
  const LIBS = [
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  ];
  const loaded = {};
  function load(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = res; s.onerror = () => { delete loaded[src]; rej(new Error('Kutubxona yuklanmadi: ' + src)); };
      document.head.appendChild(s);
    });
    return loaded[src];
  }
  async function ensure() { for (const l of LIBS) await load(l); }

  // el — CV elementi. Natija: Blob (application/pdf)
  async function make(el) {
    await ensure();
    // A4 kenglikda nusxa: telefon ekranida ham PDF bir xil chiqadi
    const wrap = document.createElement('div');
    // Ekrandan tashqariga (manfiy left) qo'yilsa html2canvas chap tomonini kesib yuboradi — shuning uchun sahifa ostiga, ko'rinmas qatlamga qo'yamiz
    wrap.style.cssText = 'position:absolute;left:0;top:0;width:794px;background:#fff;z-index:-1;pointer-events:none';
    const clone = el.cloneNode(true); clone.classList.add('a4'); wrap.appendChild(clone); document.body.appendChild(wrap);
    let canvas;
    try { canvas = await html2canvas(clone, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, width: 794, windowWidth: 794, scrollX: 0, scrollY: 0, x: 0, y: 0 }); }
    finally { wrap.remove(); }
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
    const margin = 10, w = pw - margin * 2;
    const pxPerMm = canvas.width / w;                 // rasm pikseli → mm
    const pageHpx = Math.floor((ph - margin * 2) * pxPerMm);
    let y = 0, first = true;
    while (y < canvas.height) {
      const h = Math.min(pageHpx, canvas.height - y);
      const slice = document.createElement('canvas');
      slice.width = canvas.width; slice.height = h;
      slice.getContext('2d').drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
      if (!first) pdf.addPage();
      pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, w, h / pxPerMm);
      first = false; y += h;
    }
    pdf.setProperties({ title: 'Top Xodim — CV', creator: 'Top Xodim' });
    return pdf.output('blob');
  }

  // Faylni foydalanuvchiga beradi: claude.ai ko'rish oynasida — uning saqlash oynasi orqali, oddiy brauzerda — yuklab olish
  async function save(el, filename) {
    const blob = await make(el);
    if (window.claude && typeof window.claude.use === 'function') {
      const dl = await window.claude.use('downloads');
      if (dl) { await dl.save({ filename, data: blob }); return 'saved'; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    return 'saved';
  }
  const safeName = (s) => (s || 'CV').replace(/[^\wЀ-ӿ' -]+/g, '').trim().replace(/\s+/g, '-');
  return { make, save, safeName };
})();
