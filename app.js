// ============================================
// Kimyo Baholash - Milliy Sertifikat Tizimi
// Main Application Logic — v2.0 (Tuzatilgan)
// ============================================

// --- Grading Criteria from K.Baholash.docx ---
const CRITERIA = [
    { id: 1, text: "To'g'ri formula yozish" },
    { id: 2, text: "Struktura chizish" },
    { id: 3, text: "Reaksiyani davom ettirish" },
    { id: 4, text: "Tenglash (reaksiyalarni)" },
    { id: 5, text: "Formula keltira olish (masalan: m = E·I·t/F)" },
    { id: 6, text: "Matematik amallar (proportsiya)" },
    { id: 7, text: "To'g'ri hisob-kitob qilish" },
    { id: 8, text: "Katalizatorlarga e'tibor qaratish (shu reaksiyaga xos)" },
    { id: 9, text: "Nomlash (tarixiy, sistematik, ratsional)" },
    { id: 10, text: "Nazariy bilim" },
    { id: 11, text: "Ketma-ketlik (test, reaksiya, proportsiya, formula)" },
    { id: 12, text: "To'g'ri ta'rif berish" },
    { id: 13, text: "Mr va Ar ni to'g'ri hisoblash" },
    { id: 14, text: "Modda va element farqini bilish" },
    { id: 15, text: "Atom va ion farqini bilish" },
    { id: 16, text: "Moddalarni to'g'ri klassifikatsiya qilish (asos, tuz, kislota, oksid)" },
    { id: 17, text: "Sof va aralashmalarni ajrata olish" },
    { id: 18, text: "Oddiy va murakkab modda farqi" },
    { id: 19, text: "Aralashmalar farqi (gomogen va geterogen)" },
    { id: 20, text: "Fizik va kimyoviy hodisalar" },
    { id: 21, text: "Agregat holat (sublimatlanish, kondensatlanish)" },
    { id: 22, text: "Davriy jadvalni bilish" },
    { id: 23, text: "Moddalarning o'ziga xos xususiyatlari (rangi, hidi)" },
    { id: 24, text: "Ulush va foizni ajrata olish" },
    { id: 25, text: "To'g'ri nisbat olish (karrali nisbat asosida)" },
    { id: 26, text: "Foizga qarab formula chiqara olish" },
    { id: 27, text: "Atom va molekula farqi" },
    { id: 28, text: "Sof moddalarning sifat va miqdor tarkibi" },
    { id: 29, text: "Doimiy birliklarni bilish (22.4 l, 6.02·10²³, 1 mol)" },
    { id: 30, text: "Valentlik va oksidlanish darajasini to'g'ri qo'yish" },
    { id: 31, text: "Oddiy va murakkab bog' farqi" },
    { id: 32, text: "Sigma (σ) va pi (π) bog'ni bilish" },
    { id: 33, text: "Bog' topa olish" },
    { id: 34, text: "Reaksiya turlarini bilish" },
    { id: 35, text: "Koeffitsiyent va indeks farqi" },
    { id: 36, text: "Reagent va mahsulot farqi" },
    { id: 37, text: "Unumdan to'g'ri foydalana olish" },
    { id: 38, text: "Cheklovchi moddani bilish" },
    { id: 39, text: "Ekvivalent mol va massa farqi" },
    { id: 40, text: "Hajmiy ulushni bilish" },
    { id: 41, text: "Ulushdan foydalanib masala ishlay olish" },
    { id: 42, text: "Foizdan to'g'ri foydalanish (erituvchining va erigan moddaning foizi)" },
    { id: 43, text: "Erituvchi va erigan moddalarni ajrata olish" },
    { id: 44, text: "Belgilardan to'g'ri foydalanish (ω, C%, Cn, CM, T)" },
    { id: 45, text: "Eritmada cho'kma va gaz to'g'ri ajratilgani va uni hisoblashda to'g'ri ishlatilgani" },
    { id: 46, text: "Zichlikdan to'g'ri foydalangan holda hajmdan massaga va massadan hajmga o'tkazish" },
    { id: 47, text: "Birliklardan to'g'ri foydalanish" },
    { id: 48, text: "Erishuvchanlik qoidasiga asoslanib to'g'ri proportsiya tuza olish" },
    { id: 49, text: "Masalani to'g'ri tahlil qila olgan holda to'yingan eritmalarni ketma-ketlikda qo'ya olish" },
    { id: 50, text: "To'yingan, to'yinmagan va o'ta to'yingan eritmalarni ajrata olish" },
    { id: 51, text: "To'yingan eritmadan erishuvchanlik koeffitsiyentidan foydalangan holda foiz konsentratsiyani topa olish" },
    { id: 52, text: "Formuladan formula keltirib chiqarish" },
    { id: 53, text: "Berilgan ma'lumotlardan foydalangan holda ushbu ma'lumotlarni formulaga to'g'ri joylashtirish" },
    { id: 54, text: "Formuladan to'g'ri foydalanib konsentratsiyalarni bir-biriga bog'lash (C% → Cm → CM → Cn → S → T)" },
    { id: 55, text: "Plastinka jarayonini boshqa jarayonlardan ajrata olish" },
    { id: 56, text: "Metallarning aktivlik qatorini bilgan holda reaksiyani to'g'ri yozish" },
    { id: 57, text: "Plastinka tarkibidagi metall va eritmadagi metall og'irliklarini to'g'ri tahlil qilgan holda eritma va plastinka massasi o'zgarishini topish" },
];

const CRITERIA_TEXT = CRITERIA.map(c => `${c.id}. ${c.text}`).join('\n');

// --- State ---
const state = {
    apiKey: (function() { try { return localStorage.getItem('gemini_api_key') || 'AIzaSyADjwKQ-LB6043zXORC5-nmm-TcZypVnrE'; } catch(e) { return 'AIzaSyADjwKQ-LB6043zXORC5-nmm-TcZypVnrE'; } })(),
    scores: { 41: 0, 42: 0, 43: 0 },
    images: { 41: null, 42: null, 43: null },
    results: { 41: null, 42: null, 43: null },
    activeTab: 'q41'
};

// --- DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initEvents();
    
    // Agar API key saqlangan bo'lsa — to'g'ridan-to'g'ri interfeys ko'rsat
    if (state.apiKey) {
        document.getElementById('apiKeyInput').value = state.apiKey;
    }
    checkApiKey();
});

// --- Background Particles ---
function initParticles() {
    const container = document.getElementById('bgParticles');
    if (!container) return;
    const colors = ['hsl(230,85%,58%)', 'hsl(160,70%,50%)', 'hsl(280,60%,55%)', 'hsl(340,70%,55%)'];
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 150 + 50;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDuration = `${Math.random() * 20 + 15}s`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        container.appendChild(particle);
    }
}

// --- Events ---
function initEvents() {
    // API key
    document.getElementById('saveApiKey').addEventListener('click', saveApiKey);
    document.getElementById('apiKeyInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveApiKey();
    });

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // File inputs
    document.querySelectorAll('.file-input').forEach(input => {
        input.addEventListener('change', handleFileSelect);
    });

    // Remove image buttons
    document.querySelectorAll('.btn-remove-image').forEach(btn => {
        btn.addEventListener('click', () => removeImage(btn.dataset.question));
    });

    // Analyze buttons
    document.querySelectorAll('.btn-analyze').forEach(btn => {
        btn.addEventListener('click', () => analyzeQuestion(btn.dataset.question));
    });

    // Drag & drop
    document.querySelectorAll('.upload-zone').forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });

    // Reset
    document.getElementById('resetAllBtn')?.addEventListener('click', resetAll);
}

// --- Custom Criteria Tags (with ball) ---
const customCriteria = { 41: [], 42: [], 43: [] }; // [{text, ball}]
const questionImages = { 41: null, 42: null, 43: null };

function loadQuestionImage(q, input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            let w = img.width, h = img.height;
            const MAX = 1200;
            if (w > MAX || h > MAX) { const r = Math.min(MAX/w, MAX/h); w = Math.round(w*r); h = Math.round(h*r); }
            const c = document.createElement('canvas'); c.width = w; c.height = h;
            c.getContext('2d').drawImage(img, 0, 0, w, h);
            questionImages[q] = c.toDataURL('image/jpeg', 0.8);
            document.getElementById('qImgTag' + q).src = questionImages[q];
            document.getElementById('qImgPreview' + q).style.display = 'block';
            document.getElementById('qImgName' + q).textContent = '✅ ' + file.name;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function removeQuestionImage(q) {
    questionImages[q] = null;
    document.getElementById('qImgPreview' + q).style.display = 'none';
    document.getElementById('qImgName' + q).textContent = '';
    document.getElementById('qImgInput' + q).value = '';
}

function addCriteria(q) {
    const input = document.getElementById('criteriaInput' + q);
    const ballInput = document.getElementById('criteriaBall' + q);
    const text = input.value.trim();
    if (!text) return;
    if (customCriteria[q].some(c => c.text === text)) {
        showToast('Bu mezon allaqachon qo\'shilgan!', 'info');
        return;
    }
    const ball = parseFloat(ballInput.value) || 1;
    customCriteria[q].push({ text, ball });
    input.value = '';
    renderCriteriaTags(q);
    // Jami ballni ko'rsat
    updateCriteriaTotal(q);
}

function removeCriteria(q, index) {
    customCriteria[q].splice(index, 1);
    renderCriteriaTags(q);
    updateCriteriaTotal(q);
}

function updateCriteriaTotal(q) {
    const total = customCriteria[q].reduce((sum, c) => sum + c.ball, 0);
    const container = document.getElementById('criteriaList' + q);
    const totalEl = container.parentElement.querySelector('.criteria-total');
    if (totalEl) totalEl.remove();
    if (customCriteria[q].length > 0) {
        const div = document.createElement('div');
        div.className = 'criteria-total';
        div.style.cssText = 'font-size:0.8rem;color:var(--primary-light);font-weight:600;margin-top:8px;font-family:var(--font-mono);';
        div.textContent = `Mezonlar jami: ${total} ball`;
        container.parentElement.appendChild(div);
    }
}

function renderCriteriaTags(q) {
    const container = document.getElementById('criteriaList' + q);
    container.innerHTML = customCriteria[q].map((item, i) => 
        `<span style="display:inline-flex;align-items:center;gap:6px;font-size:0.82rem;color:var(--accent-light);background:hsla(160,70%,50%,0.12);padding:5px 12px;border-radius:var(--radius-round);border:1px solid hsla(160,70%,50%,0.25);">
            ${escapeHtml(item.text)} <span style="color:var(--warning);font-weight:700;font-family:var(--font-mono);">${item.ball}b</span>
            <button onclick="removeCriteria('${q}',${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:1rem;padding:0;line-height:1;">✕</button>
        </span>`
    ).join('');
}

// --- API Key ---
function saveApiKey() {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (!key) {
        showToast('API kalit kiritilmadi!', 'error');
        return;
    }
    if (!key.startsWith('AIza')) {
        showToast('Noto\'g\'ri API kalit formati! Google AI Studio dan oling.', 'error');
        return;
    }
    state.apiKey = key;
    try { localStorage.setItem('gemini_api_key', key); } catch(e) {}
    showToast('API kalit saqlandi!', 'success');
    checkApiKey();
}

function checkApiKey() {
    const changeBtn = document.getElementById('changeApiKeyBtn');
    if (state.apiKey) {
        document.getElementById('apiKeySection').style.display = 'none';
        document.getElementById('tabsContainer').style.display = 'block';
        document.getElementById('questionPanels').style.display = 'block';
        if (changeBtn) changeBtn.style.display = 'block';
    } else {
        document.getElementById('apiKeySection').style.display = 'flex';
        document.getElementById('tabsContainer').style.display = 'none';
        document.getElementById('questionPanels').style.display = 'none';
        if (changeBtn) changeBtn.style.display = 'none';
    }
}

// --- Tabs ---
function switchTab(tabId) {
    state.activeTab = tabId;

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    document.querySelectorAll('.question-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`panel-${tabId}`).classList.add('active');
}

// --- File Handling ---
function handleFileSelect(e) {
    const file = e.target.files[0];
    const question = e.target.dataset.question;
    if (file) processFile(file, question);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    const zoneId = e.currentTarget.id;
    const question = zoneId.replace('uploadZone', '');
    
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
        processFile(file, question);
    } else {
        showToast('Faqat rasm yoki PDF fayllari qabul qilinadi!', 'error');
    }
}

function processFile(file, question) {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
        showToast('Faqat rasm yoki PDF fayllari qabul qilinadi!', 'error');
        return;
    }

    // Fayl hajmini tekshir (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
        showToast('Fayl hajmi juda katta! Maksimum 20MB.', 'error');
        return;
    }

    if (isPdf) {
        processPDF(file, question);
    } else {
        // Rasmni compress qilish (agar juda katta bo'lsa)
        compressAndStoreImage(file, question);
    }
}

function compressAndStoreImage(file, question) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // Kattaroq rasm = yaxshiroq OCR
            const MAX_DIM = 2000;
            let { width, height } = img;
            
            if (width > MAX_DIM || height > MAX_DIM) {
                const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Oq fon
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            
            // Rasmni chizish
            ctx.drawImage(img, 0, 0, width, height);
            
            // Kontrastni oshirish — qo'lyozmani aniqroq qiladi
            try {
                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;
                const contrast = 30; // Kontrast kuchi (0-100)
                const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));     // R
                    data[i+1] = Math.min(255, Math.max(0, factor * (data[i+1] - 128) + 128)); // G
                    data[i+2] = Math.min(255, Math.max(0, factor * (data[i+2] - 128) + 128)); // B
                }
                
                ctx.putImageData(imageData, 0, 0);
            } catch(e) {
                // Agar kontrast ishlamasa, original rasmni ishlatamiz
                console.warn('Kontrast qo\'shib bo\'lmadi:', e);
            }
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            state.images[question] = [dataUrl];
            showPreview(question);
        };
        img.onerror = () => {
            state.images[question] = [e.target.result];
            showPreview(question);
        };
        img.src = e.target.result;
    };
    reader.onerror = () => {
        showToast('Rasmni o\'qishda xatolik!', 'error');
    };
    reader.readAsDataURL(file);
}

// --- PDF Processing ---
async function processPDF(file, question) {
    showLoading(true);
    try {
        const arrayBuffer = await file.arrayBuffer();
        
        // PDF.js worker
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        } else {
            throw new Error('PDF.js kutubxonasi yuklanmadi. Internet aloqasini tekshiring.');
        }
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;
        const pageImages = [];

        // Maksimum 10 sahifa
        const maxPages = Math.min(totalPages, 10);
        if (totalPages > 10) {
            showToast(`PDF da ${totalPages} sahifa bor, faqat birinchi 10 tasi yuklanadi`, 'info');
        } else {
            showToast(`PDF yuklandi: ${totalPages} sahifa topildi`, 'info');
        }

        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const scale = 1.5; // Yaxshi sifat, lekin juda og'ir emas
            const viewport = page.getViewport({ scale });
            
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            pageImages.push(dataUrl);
        }

        state.images[question] = pageImages;
        showPreview(question);
        showToast(`${maxPages} sahifa muvaffaqiyatli yuklandi!`, 'success');
    } catch (error) {
        console.error('PDF error:', error);
        showToast(`PDF ochishda xatolik: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function showPreview(question) {
    document.getElementById(`uploadZone${question}`).style.display = 'none';
    const previewSection = document.getElementById(`preview${question}`);
    previewSection.style.display = 'block';

    const images = state.images[question];
    const container = previewSection.querySelector('.preview-image-container');
    
    container.innerHTML = '';
    
    if (images.length === 1) {
        const img = document.createElement('img');
        img.id = `previewImg${question}`;
        img.className = 'preview-image';
        img.alt = `${question}-savol rasmi`;
        img.src = images[0];
        container.appendChild(img);
    } else {
        const pagesWrapper = document.createElement('div');
        pagesWrapper.className = 'pdf-pages-wrapper';
        
        images.forEach((imgSrc, idx) => {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'pdf-page-item';
            
            const pageLabel = document.createElement('div');
            pageLabel.className = 'pdf-page-label';
            pageLabel.textContent = `📄 ${idx + 1}-sahifa`;
            
            const img = document.createElement('img');
            img.className = 'preview-image';
            img.alt = `${question}-savol ${idx + 1}-sahifa`;
            img.src = imgSrc;
            
            pageDiv.appendChild(pageLabel);
            pageDiv.appendChild(img);
            pagesWrapper.appendChild(pageDiv);
        });
        
        container.appendChild(pagesWrapper);
    }
    
    // Remove button
    const newRemoveBtn = document.createElement('button');
    newRemoveBtn.className = 'btn-remove-image';
    newRemoveBtn.dataset.question = question;
    newRemoveBtn.textContent = '✕';
    newRemoveBtn.addEventListener('click', () => removeImage(question));
    container.appendChild(newRemoveBtn);
}

function removeImage(question) {
    state.images[question] = null;
    document.getElementById(`uploadZone${question}`).style.display = 'block';
    document.getElementById(`preview${question}`).style.display = 'none';
    document.getElementById(`result${question}`).style.display = 'none';
    
    document.querySelectorAll(`.file-input[data-question="${question}"]`).forEach(input => {
        input.value = '';
    });
}

// --- AI Analysis ---
async function analyzeQuestion(question) {
    if (!state.images[question] || state.images[question].length === 0) {
        showToast('Avval rasmni yuklang!', 'error');
        return;
    }

    if (!state.apiKey) {
        showToast('API kalitni kiriting!', 'error');
        document.getElementById('apiKeySection').style.display = 'flex';
        return;
    }

    const btn = document.getElementById(`analyzeBtn${question}`);
    btn.disabled = true;
    btn.querySelector('span:last-child').textContent = 'Tahlil qilinmoqda...';
    showLoading(true);

    try {
        const prompt = buildPrompt(question);
        
        // Talaba javobi rasmlari + savol rasmi (agar bor bo'lsa)
        let allImages = [...(state.images[question] || [])];
        if (questionImages[question]) {
            // Savol rasmini birinchi qo'shamiz
            allImages = [questionImages[question], ...allImages];
        }
        
        const result = await callGeminiAPI(allImages, prompt);
        
        const parsed = parseAIResponse(result, question);
        state.scores[question] = parsed.totalScore;
        state.results[question] = parsed;
        
        renderResult(question, parsed);
        updateScores();
        showToast(`${question}-savol baholandi: ${parsed.totalScore}/25 ball`, 'success');
    } catch (error) {
        console.error('Analysis error:', error);
        
        // Xato turini aniqlash va foydalanuvchiga tushunarli xabar berish
        let errorMsg = error.message;
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMsg = 'Internet bilan aloqa yo\'q yoki API serveriga ulanib bo\'lmadi. Internetni tekshiring va qaytadan urinib ko\'ring.';
        } else if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID') || error.message.includes('401')) {
            errorMsg = 'API kalit noto\'g\'ri yoki muddati o\'tgan. Google AI Studio dan yangi kalit oling.';
            // API key sahifasini ko'rsat
            state.apiKey = '';
            try { localStorage.removeItem('gemini_api_key'); } catch(e) {}
            checkApiKey();
        } else if (error.message.includes('quota') || error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
            errorMsg = 'API limit tugagan. Biroz kutib qaytadan urinib ko\'ring yoki yangi API kalit oling.';
        } else if (error.message.includes('safety') || error.message.includes('SAFETY')) {
            errorMsg = 'AI xavfsizlik filtri ishga tushdi. Rasmni aniqroq suratga oling.';
        }
        
        showToast(`Xatolik: ${errorMsg}`, 'error');
    } finally {
        btn.disabled = false;
        btn.querySelector('span:last-child').textContent = 'Tahlil qilish';
        showLoading(false);
    }
}

function buildPrompt(question) {
    // Foydalanuvchi kiritgan savolchalar sonini o'qiymiz
    const subCountEl = document.getElementById('subCount' + question);
    const subCount = subCountEl ? parseInt(subCountEl.value) || 5 : 5;
    const pointsEach = Math.round((25 / subCount) * 100) / 100;
    
    // Mavzu va savol matnini o'qiymiz
    const topicEl = document.getElementById('topic' + question);
    const questionTextEl = document.getElementById('questionText' + question);
    const topic = topicEl ? topicEl.value.trim() : '';
    const questionText = questionTextEl ? questionTextEl.value.trim() : '';
    
    let topicInfo = '';
    if (topic || questionText || questionImages[question]) {
        topicInfo = '\n\nSAVOL MA\'LUMOTLARI:';
        if (topic) topicInfo += `\nMavzu: ${topic}`;
        if (questionText) topicInfo += `\nSavol matni: ${questionText}`;
        if (questionImages[question]) topicInfo += '\nSavol rasmi ham yuborilgan — uni diqqat bilan o\'qib, talaba javobini shu savolga nisbatan baholay.';
        topicInfo += '\nShu mavzu va savol kontekstida talaba javobini baholay.';
    }
    
    // Tanlangan baholash mezonlarini o'qiymiz
    let selectedCriteria = '';
    if (customCriteria[question] && customCriteria[question].length > 0) {
        const items = customCriteria[question].map((c, i) => `${i+1}. ${c.text} — ${c.ball} ball`).join('\n');
        const totalCritBall = customCriteria[question].reduce((s, c) => s + c.ball, 0);
        selectedCriteria = `\n\nHar bir savolchada/reaksiyada FAQAT quyidagi mezonlarni tekshir va HAR BIRIGA ALOHIDA BALL ber:
${items}
Jami mezonlar balli: ${totalCritBall} ball.
Har bir savolcha/reaksiya uchun shu mezonlar bo'yicha ball ber. Mezon bajarilsa — shu mezon ballini to'liq ber. Bajarilmasa — 0. Qisman to'g'ri bo'lsa — qisman ball ber.
BOSHQA MEZONLARNI TEKSHIRMA.`;
    }
    
    let questionSpecific = '';
    
    if (question === '41') {
        questionSpecific = `Bu 41-savol. Unda ${subCount} ta kichik savol (savolcha) bor. Jami 25 ball.

MUHIM: Savol rasmida yoki matnida har bir savolcha yonida BALL yozilgan bo'lishi mumkin, masalan:
a) ... (5 ball)
b) ... (8 ball)
Agar ball ko'rsatilgan bo'lsa — HAR BIR SAVOLCHA UCHUN SHU BALLNI max_points sifatida ishlatib baholay.
Agar ball ko'rsatilmagan bo'lsa — 25 ballni ${subCount} ga teng bo'lib taqsimlay (har biri ${pointsEach} ball).
Bu savolda asosan nazariy bilim, formula yozish, hisob-kitob, klassifikatsiya kabi topshiriqlar bo'ladi.${selectedCriteria}`;
    } else if (question === '42') {
        let q42criteria = '';
        if (customCriteria['42'] && customCriteria['42'].length > 0) {
            const items = customCriteria['42'].map((c, i) => `${i+1}. ${c.text} — ${c.ball} ball`).join('\n');
            q42criteria = `\nHar bir reaksiyada FAQAT quyidagi mezonlarni tekshir va HAR BIRIGA ALOHIDA BALL ber:\n${items}\nMezon bajarilsa — shu mezon ballini to'liq ber. Bajarilmasa — 0.\nBOSHQA MEZONLARNI TEKSHIRMA.`;
        } else {
            q42criteria = `\nHar bir reaksiyada FAQAT quyidagi 3 ta mezonni tekshir:
1. Formulalar to'g'ri yozilganmi
2. Reaksiya davom ettirilganmi (mahsulotlar to'g'ri)
3. Reaksiya tenglashtirilganmi (koeffitsiyentlar to'g'ri)
BOSHQA MEZONLARNI TEKSHIRMA. Agar shu 3 ta mezon bajarilsa — shu reaksiya uchun to'liq ball ber.`;
        }
        questionSpecific = `Bu 42-savol. Unda ${subCount} ta kimyoviy reaksiya bor. Jami 25 ball.

MUHIM: Savol rasmida yoki matnida har bir reaksiya yonida BALL yozilgan bo'lishi mumkin, masalan:
1) KClO3 → ........ (1 ball)
2) CH4 + O2 → ........ (2 ball)
Agar ball ko'rsatilgan bo'lsa — HAR BIR REAKSIYA UCHUN SHU BALLNI max_points sifatida ishlatib baholay.
Agar ball ko'rsatilmagan bo'lsa — 25 ballni ${subCount} ga teng bo'lib taqsimlay (har biri ${pointsEach} ball).
${q42criteria}`;
    } else if (question === '43') {
        questionSpecific = `Bu 43-savol. Unda ${subCount} ta kichik savol (savolcha) bor. Jami 25 ball.

MUHIM: Savol rasmida yoki matnida har bir savolcha yonida BALL yozilgan bo'lishi mumkin, masalan:
a) ... (5 ball)
b) ... (8 ball)
Agar ball ko'rsatilgan bo'lsa — HAR BIR SAVOLCHA UCHUN SHU BALLNI max_points sifatida ishlatib baholay.
Agar ball ko'rsatilmagan bo'lsa — 25 ballni ${subCount} ga teng bo'lib taqsimlay (har biri ${pointsEach} ball).
Bu savolda asosan masala yechish, hisob-kitob, eritma, konsentratsiya kabi topshiriqlar bo'ladi.${selectedCriteria}`;
    }

    // Agar foydalanuvchi mezon qo'shgan bo'lsa, 57 ta umumiy mezonlarni yubormaymiz (tezlik uchun)
    const hasCustomCriteria = customCriteria[question] && customCriteria[question].length > 0;
    const criteriaBlock = hasCustomCriteria ? '' : `\nUmumiy baholash mezonlari:\n${CRITERIA_TEXT}\n`;

    return `Sen kimyo imtihoni tekshiruvchisisan.

Rasmdagi talabaning ${question}-savolga javobini baholay.${state.images[question]?.length > 1 ? ` (${state.images[question].length} sahifa)` : ''}
${topicInfo}
${questionSpecific}
${criteriaBlock}
MUHIM QOIDALAR:
1. Rasmni JUDA DIQQAT bilan o'qi. Qo'lyozma bo'lishi mumkin — har bir harf, raqam, indeks va koeffitsiyentni ANIQ taniy.
2. RASM BURILGAN BO'LISHI MUMKIN (90°, 180°, 270°). Agar yozuv yon tomonga yoki teskari bo'lsa — rasmni to'g'ri yo'nalishda o'qib, BARCHA yozuvlarni tani.
3. BARCHA sahifa va qismlarni o'qi — talaba javobini "bajarmagan" dema agar aslida rasmda javob yozilgan bo'lsa.
4. KIMYOVIY FORMULALARNI O'QISHDA EHTIYOT BO'L:
   - HNO3 ni H2O3 deb o'qima! N harfini tekshir.
   - H2SO4, HCl, HNO3, H3PO4 kabi kislotalarni to'g'ri taniy.
   - Indeks va koeffitsiyent farqini bil.
   - Cu, Ca, Cr, Co harflarini aralashtirib yuborma.
5. BIR NECHTA TO'G'RI JAVOB BO'LISHI MUMKIN! Kimyoda ko'p reaksiyalarning bir nechta to'g'ri varianti bor:
   - Suyultirilgan va konsentrlangan kislota bilan reaksiya FARQLI mahsulot beradi — IKKALASI ham TO'G'RI.
   - Agar talaba javobini kimyoviy jihatdan TEKSHIRIB, reaksiya TO'G'RI bo'lsa — TO'LIQ BALL ber.
6. SAVOLCHALAR KETMA-KET BOG'LANGAN BO'LISHI MUMKIN! Talaba oldingi savolchalarda hisoblagan natijalarni (massa, mol, hajm) keyingi savolchalarda ishlatishi mumkin. Agar talaba oldingi javoblardan olingan raqamlarni to'g'ri ishlatgan bo'lsa — bu XATO EMAS, bu TO'G'RI. Masalan: agar oldin K2S massasi 44g deb topilgan bo'lsa va keyingi savolchada 44g ishlatilsa — bu to'g'ri.
7. HISOB-KITOBNI TEKSHIRGANDA: Agar formula to'g'ri, raqamlar to'g'ri joylashtirilgan va natija matematik jihatdan to'g'ri bo'lsa — to'liq ball ber. "Qayerdan olgan" deb savol qo'yma — oldingi savolchalardan olgan.
8. Agar talaba koeffitsiyent yozgan bo'lsa (masalan "2CuO") — bu TENGLASHTIRILGAN.
7. To'g'ri = to'liq ball (${pointsEach}), qisman to'g'ri = qisman ball, xato = 0.
8. AYNAN ${subCount} ta savolcha/reaksiya. Har biri max ${pointsEach} ball.
9. Shubha bo'lsa — talaba FOYDASIGA baholay.

FAQAT JSON ber:
{"question":${question},"total_subquestions":${subCount},"max_score":25,"total_score":0,"subquestions":[{"number":1,"description":"","max_points":${pointsEach},"earned_points":0,"is_correct":false,"student_answer":"","correct_answer":"","explanation":"","criteria_met":[],"criteria_not_met":[],"errors":[]}],"overall_feedback":"","strengths":[],"weaknesses":[]}`;
}

// --- Gemini API Call (tuzatilgan) ---
async function callGeminiAPI(imageDataUrls, prompt) {
    // Yangilangan modellar ro'yxati (2025-2026 uchun)
    const models = [
        'gemini-2.5-flash'
    ];
    
    let lastError = null;
    
    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        try {
            if (i > 0) {
                showToast(`${model} modeli sinab ko'rilmoqda...`, 'info');
            }
            const result = await callGeminiModel(model, imageDataUrls, prompt);
            return result;
        } catch (error) {
            lastError = error;
            console.warn(`${model} xato:`, error.message);
            
            // Qayta urinish mumkin bo'lgan xatolar
            const retryableErrors = ['quota', 'Quota', '429', 'RESOURCE_EXHAUSTED', 
                                      'not found', 'not supported', '404', '503', 
                                      'overloaded', 'unavailable'];
            const isRetryable = retryableErrors.some(e => error.message.includes(e));
            
            if (isRetryable && i < models.length - 1) {
                continue; // Keyingi modelga o'tish
            }
            
            // Qayta urinib bo'lmaydigan xatolar (auth, network) — darhol to'xtat
            if (!isRetryable) {
                throw error;
            }
        }
    }
    
    throw lastError || new Error('Barcha modellar ishlamadi. Keyinroq urinib ko\'ring.');
}

async function callGeminiModel(model, imageDataUrls, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.apiKey}`;

    // Parts: text prompt + barcha rasmlar
    const parts = [{ text: prompt }];
    
    for (const imageDataUrl of imageDataUrls) {
        // data:image/jpeg;base64,... formatini parse qilish
        const matches = imageDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (!matches) {
            console.warn('Rasm formati tanilmadi, o\'tkazib yuborildi');
            continue;
        }
        
        parts.push({
            inline_data: {
                mime_type: matches[1],
                data: matches[2]
            }
        });
    }

    if (parts.length < 2) {
        throw new Error('Hech bir rasm yuklanmadi yoki rasm formati noto\'g\'ri');
    }

    const requestBody = {
        contents: [{ parts }],
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
        },
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
    };

    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
    } catch (networkError) {
        // Network xatosi — CORS yoki internet yo'q
        throw new Error('Failed to fetch — Internet bilan aloqa yo\'q yoki CORS xatosi. Sahifani http:// orqali oching (file:// ishlamaydi).');
    }

    if (!response.ok) {
        let errMsg = `API xatosi (${response.status})`;
        try {
            const errData = await response.json();
            errMsg = errData.error?.message || errMsg;
            
            // Maxsus xato kodlari
            if (response.status === 400 && errMsg.includes('API key')) {
                throw new Error('API_KEY_INVALID: ' + errMsg);
            }
            if (response.status === 401 || response.status === 403) {
                throw new Error('API key noto\'g\'ri yoki ruxsat yo\'q: ' + errMsg);
            }
        } catch (parseErr) {
            if (parseErr.message.includes('API_KEY') || parseErr.message.includes('API key') || parseErr.message.includes('ruxsat')) {
                throw parseErr;
            }
        }
        throw new Error(errMsg);
    }

    const data = await response.json();
    
    // Javob borligini tekshirish
    if (!data.candidates || data.candidates.length === 0) {
        // Safety filter yoki boshqa sabab
        if (data.promptFeedback?.blockReason) {
            throw new Error(`AI so'rovni rad etdi: ${data.promptFeedback.blockReason}. Rasmni aniqroq qilib qaytadan yuklang.`);
        }
        throw new Error('AI javob bermadi. Rasmni qaytadan yuklang.');
    }
    
    const candidate = data.candidates[0];
    
    // Finish reason tekshirish
    if (candidate.finishReason === 'SAFETY') {
        throw new Error('SAFETY: AI xavfsizlik filtri ishga tushdi. Rasmni o\'zgartirib qaytadan urinib ko\'ring.');
    }
    
    if (!candidate.content?.parts?.[0]?.text) {
        throw new Error('AI bo\'sh javob qaytardi. Rasmni aniqroq sifatda yuklang.');
    }

    return candidate.content.parts[0].text;
}

function parseAIResponse(responseText, question) {
    try {
        let jsonStr = responseText.trim();
        
        // Birinchi { va oxirgi } ni topamiz
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        
        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
            throw new Error('JSON topilmadi');
        }
        
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        
        // JSON string ichidagi control belgilarni tozalaymiz
        jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, function(ch) {
            if (ch === '\n' || ch === '\r' || ch === '\t') return ' ';
            return '';
        });
        
        let parsed;
        try {
            parsed = JSON.parse(jsonStr);
        } catch(e1) {
            // JSON buzilgan — tuzatishga urinamiz
            console.warn('JSON tuzatish urinilmoqda...', e1.message);
            let fixed = jsonStr;
            // Ochiq bracket va bracelarni yopamiz
            let ob = 0, oq = 0, inStr = false, esc = false;
            for (let i = 0; i < fixed.length; i++) {
                const c = fixed[i];
                if (esc) { esc = false; continue; }
                if (c === '\\') { esc = true; continue; }
                if (c === '"') { inStr = !inStr; continue; }
                if (inStr) continue;
                if (c === '{') ob++; if (c === '}') ob--;
                if (c === '[') oq++; if (c === ']') oq--;
            }
            while (oq > 0) { fixed += ']'; oq--; }
            while (ob > 0) { fixed += '}'; ob--; }
            parsed = JSON.parse(fixed);
        }
        
        let totalScore = Number(parsed.total_score) || 0;
        totalScore = Math.min(25, Math.max(0, totalScore));
        totalScore = Math.round(totalScore * 2) / 2;
        
        const subquestions = (parsed.subquestions || []).map(sq => {
            const maxPts = Number(sq.max_points) || 0;
            const earnedPts = Math.min(maxPts, Math.max(0, Number(sq.earned_points) || 0));
            return {
                number: sq.number, description: sq.description || '',
                maxPoints: maxPts, earnedPoints: Math.round(earnedPts * 2) / 2,
                isCorrect: sq.is_correct, studentAnswer: sq.student_answer || 'Ko\'rsatilmagan',
                correctAnswer: sq.correct_answer || '', explanation: sq.explanation || '',
                criteriaUsed: Array.isArray(sq.criteria_used) ? sq.criteria_used : [],
                criteriaMet: Array.isArray(sq.criteria_met) ? sq.criteria_met : [],
                criteriaNotMet: Array.isArray(sq.criteria_not_met) ? sq.criteria_not_met : [],
                errors: Array.isArray(sq.errors) ? sq.errors : []
            };
        });
        
        const subTotal = subquestions.reduce((sum, sq) => sum + sq.earnedPoints, 0);
        if (Math.abs(subTotal - totalScore) > 2 && subquestions.length > 0) {
            totalScore = Math.min(25, Math.round(subTotal * 2) / 2);
        }
        
        return {
            question: question, totalSubquestions: parsed.total_subquestions || subquestions.length,
            maxScore: 25, totalScore: totalScore, subquestions: subquestions,
            overallFeedback: parsed.overall_feedback || '',
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
            weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : []
        };
    } catch (err) {
        console.error('Parse error:', err);
        console.error('Raw:', responseText);
        const preview = responseText ? responseText.substring(0, 200) : 'bo\'sh';
        throw new Error('AI javobini tahlil qilishda xatolik. Javob boshi: ' + preview);
    }
}

// --- Render Results ---
function renderResult(question, data) {
    const container = document.getElementById(`resultCard${question}`);
    
    let html = `
        <div class="result-header">
            <div class="result-title">
                ${getScoreEmoji(data.totalScore, 25)} ${question}-Savol Natijasi
            </div>
            <div class="result-score">${data.totalScore}/25</div>
        </div>
    `;

    // Sub-questions
    data.subquestions.forEach((sq, idx) => {
        const pct = sq.maxPoints > 0 ? (sq.earnedPoints / sq.maxPoints) : 0;
        let badgeClass = 'zero';
        if (pct >= 1) badgeClass = 'full';
        else if (pct > 0) badgeClass = 'partial';

        html += `
            <div class="subq-item">
                <div class="subq-header">
                    <div class="subq-label">
                        ${question === '42' ? '⚗️' : '📝'} 
                        ${question === '42' ? `${idx + 1}-reaksiya` : `${idx + 1}-savolcha`}
                    </div>
                    <span class="subq-badge ${badgeClass}">${sq.earnedPoints}/${sq.maxPoints}</span>
                </div>
                <div class="subq-content">
                    ${sq.description ? `<p><strong>Savol:</strong> ${escapeHtml(sq.description)}</p>` : ''}
                    <p><strong>Talaba javobi:</strong> ${escapeHtml(sq.studentAnswer)}</p>
                    ${sq.correctAnswer ? `<p><strong>To'g'ri javob:</strong> ${escapeHtml(sq.correctAnswer)}</p>` : ''}
                    <p><strong>Izoh:</strong> ${escapeHtml(sq.explanation)}</p>
                    ${sq.errors.length > 0 ? `
                        <p style="color: var(--danger);"><strong>Xatolar:</strong></p>
                        <ul style="color: var(--danger); margin-left: 16px; font-size: 0.84rem;">
                            ${sq.errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
                <div class="subq-criteria">
                    ${sq.criteriaMet.map(c => {
                        const cr = CRITERIA.find(x => x.id === c);
                        return `<span class="criteria-tag met">✓ ${c}. ${cr ? cr.text : ''}</span>`;
                    }).join('')}
                    ${sq.criteriaNotMet.map(c => {
                        const cr = CRITERIA.find(x => x.id === c);
                        return `<span class="criteria-tag unmet">✗ ${c}. ${cr ? cr.text : ''}</span>`;
                    }).join('')}
                </div>
            </div>
        `;
    });

    // Overall feedback
    html += `
        <div class="subq-item" style="border-left: 3px solid var(--primary); margin-top: var(--space-lg);">
            <div class="subq-header">
                <div class="subq-label">📊 Umumiy baho</div>
            </div>
            <div class="subq-content">
                <p>${escapeHtml(data.overallFeedback)}</p>
                ${data.strengths.length > 0 ? `
                    <p style="margin-top: 8px; color: var(--success);"><strong>✅ Kuchli tomonlar:</strong></p>
                    <ul style="color: var(--success); margin-left: 16px; font-size: 0.84rem;">
                        ${data.strengths.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
                    </ul>
                ` : ''}
                ${data.weaknesses.length > 0 ? `
                    <p style="margin-top: 8px; color: var(--warning);"><strong>⚠️ Kamchiliklar:</strong></p>
                    <ul style="color: var(--warning); margin-left: 16px; font-size: 0.84rem;">
                        ${data.weaknesses.map(w => `<li>${escapeHtml(w)}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        </div>
    `;

    container.innerHTML = html;
    document.getElementById(`result${question}`).style.display = 'block';
    document.getElementById(`result${question}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getScoreEmoji(score, max) {
    const pct = (score / max) * 100;
    if (pct >= 90) return '🏆';
    if (pct >= 75) return '🌟';
    if (pct >= 50) return '👍';
    if (pct >= 25) return '📖';
    return '💪';
}

// --- Score Updates ---
function updateScores() {
    const total = state.scores[41] + state.scores[42] + state.scores[43];

    document.getElementById('totalScoreHeader').textContent = `${total} / 75`;

    [41, 42, 43].forEach(q => {
        const tabScore = document.getElementById(`tab${q}Score`);
        tabScore.textContent = `${state.scores[q]}/25`;
        
        const tab = document.getElementById(`tab${q}`);
        if (state.scores[q] > 0) {
            tab.classList.add('scored');
        } else {
            tab.classList.remove('scored');
        }

        document.getElementById(`score${q}`).textContent = state.scores[q];
    });

    const hasAnyScore = Object.values(state.scores).some(s => s > 0);
    const summarySection = document.getElementById('summarySection');
    
    if (hasAnyScore) {
        summarySection.style.display = 'block';
        
        [41, 42, 43].forEach(q => {
            const pct = (state.scores[q] / 25) * 100;
            document.getElementById(`summaryBar${q}`).style.width = `${pct}%`;
            document.getElementById(`summaryVal${q}`).textContent = `${state.scores[q]}/25`;
        });

        document.getElementById('summaryTotal').textContent = `${total} / 75`;

        const gradeEl = document.getElementById('summaryGrade');
        const pctTotal = (total / 75) * 100;
        if (pctTotal >= 86) {
            gradeEl.textContent = '🏆 A\'lo darajada!';
            gradeEl.style.color = 'var(--success)';
        } else if (pctTotal >= 71) {
            gradeEl.textContent = '🌟 Yaxshi darajada!';
            gradeEl.style.color = 'var(--accent)';
        } else if (pctTotal >= 56) {
            gradeEl.textContent = '👍 Qoniqarli';
            gradeEl.style.color = 'var(--warning)';
        } else {
            gradeEl.textContent = '📖 Ko\'proq tayyorlanish kerak';
            gradeEl.style.color = 'var(--danger)';
        }
    } else {
        summarySection.style.display = 'none';
    }
}

// --- Reset ---
function resetAll() {
    state.scores = { 41: 0, 42: 0, 43: 0 };
    state.images = { 41: null, 42: null, 43: null };
    state.results = { 41: null, 42: null, 43: null };

    [41, 42, 43].forEach(q => {
        removeImage(String(q));
        document.getElementById(`result${q}`).style.display = 'none';
    });

    updateScores();
    document.getElementById('summarySection').style.display = 'none';
    switchTab('q41');
    showToast('Barcha ma\'lumotlar tozalandi', 'info');
}

// --- Loading ---
function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

// --- Toast Notifications ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
        <span class="toast-text">${escapeHtml(message)}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    
    container.appendChild(toast);
    
    // Error xabarlar uzoqroq tursin
    const duration = type === 'error' ? 8000 : 5000;
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// --- Utility ---
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}
