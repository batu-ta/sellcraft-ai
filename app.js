/* ==========================================================================
   SELLCRAFT AI — CLIENT-SIDE OPEN-SOURCE E-COMMERCE INTELLIGENCE ENGINE
   ========================================================================== */

// --- Platform Fee Structures ---
const PLATFORM_FEES = {
    etsy: {
        name: 'Etsy (6.5% + $0.20 + 3% proc)',
        calc: (price) => (price * 0.065) + 0.20 + (price * 0.03 + 0.25)
    },
    ebay: {
        name: 'eBay (13.25% + $0.30)',
        calc: (price) => (price * 0.1325) + 0.30
    },
    shopify: {
        name: 'Shopify (2.9% + $0.30)',
        calc: (price) => (price * 0.029) + 0.30
    },
    amazon: {
        name: 'Amazon (15.0% referral)',
        calc: (price) => price * 0.15
    },
    instagram: {
        name: 'TikTok/IG (5.0% flat)',
        calc: (price) => price * 0.05
    }
};

// --- App State ---
const state = {
    selectedTone: 'artisanal',
    imageColors: null,
    currentListing: null,
    history: []
};

// --- DOM References ---
const form = document.getElementById('listing-form');
const platformSelect = document.getElementById('target-platform');
const categorySelect = document.getElementById('product-category');
const sellingPriceInput = document.getElementById('selling-price');
const costGoodsInput = document.getElementById('cost-goods');
const shippingCostInput = document.getElementById('shipping-cost');
const dropzone = document.getElementById('dropzone');
const imageInput = document.getElementById('image-input');
const dropzonePreview = document.getElementById('dropzone-preview');
const dropzonePrompt = document.getElementById('dropzone-prompt');
const previewImg = document.getElementById('preview-img');
const btnRemoveImg = document.getElementById('btn-remove-img');
const toneSelector = document.getElementById('tone-selector');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const toastEl = document.getElementById('toast');

// Output elements
const outTitle = document.getElementById('out-title');
const outTags = document.getElementById('out-tags');
const outBullets = document.getElementById('out-bullets');
const outDesc = document.getElementById('out-desc');
const outSocial = document.getElementById('out-social');
const titleCharCount = document.getElementById('title-char-count');
const tagsCount = document.getElementById('tags-count');
const historyContainer = document.getElementById('history-container');

// Financial stats
const calcFees = document.getElementById('calc-fees');
const calcTotalCost = document.getElementById('calc-total-cost');
const calcNetProfit = document.getElementById('calc-net-profit');
const calcMarginPercent = document.getElementById('calc-margin-percent');
const netMarginBadge = document.getElementById('net-margin-badge');
const platformFeeRate = document.getElementById('platform-fee-rate');

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadHistory();
    updateProfitCalculations();
    setupEventListeners();
});

/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */

function setupEventListeners() {
    // Financial Inputs real-time listener
    [sellingPriceInput, costGoodsInput, shippingCostInput, platformSelect].forEach(input => {
        input.addEventListener('input', updateProfitCalculations);
    });

    // Tone selector chips
    toneSelector.querySelectorAll('.tone-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            toneSelector.querySelectorAll('.tone-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            state.selectedTone = chip.dataset.tone;
        });
    });

    // Form submit
    form.addEventListener('submit', handleGenerateListing);

    // Image upload & drag drop
    setupImageHandlers();

    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Copy and export actions
    document.getElementById('btn-copy-all').addEventListener('click', copyFullListing);
    document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
    document.getElementById('btn-clear-history').addEventListener('click', clearHistory);

    // Sub-copy buttons
    document.querySelectorAll('.btn-copy-sub').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                const text = targetEl.innerText || targetEl.textContent;
                copyToClipboard(text);
            }
        });
    });
}

/* ==========================================================================
   FINANCIAL & PROFIT CALCULATOR
   ========================================================================== */

function updateProfitCalculations() {
    const price = parseFloat(sellingPriceInput.value) || 0;
    const cogs = parseFloat(costGoodsInput.value) || 0;
    const shipping = parseFloat(shippingCostInput.value) || 0;
    const platform = platformSelect.value;

    const platformConfig = PLATFORM_FEES[platform] || PLATFORM_FEES.etsy;
    const fee = platformConfig.calc(price);
    const totalCost = cogs + shipping + fee;
    const netProfit = price - totalCost;
    const margin = price > 0 ? (netProfit / price) * 100 : 0;

    platformFeeRate.textContent = platformConfig.name;
    calcFees.textContent = `$${fee.toFixed(2)}`;
    calcTotalCost.textContent = `$${totalCost.toFixed(2)}`;
    calcNetProfit.textContent = `${netProfit >= 0 ? '+' : ''}$${netProfit.toFixed(2)}`;
    calcMarginPercent.textContent = `${margin.toFixed(1)}% Net Margin`;
    netMarginBadge.textContent = `${margin.toFixed(0)}% Margin`;

    if (netProfit < 0) {
        calcNetProfit.style.color = '#ef4444';
        netMarginBadge.style.color = '#ef4444';
        netMarginBadge.style.background = 'rgba(239, 68, 68, 0.15)';
    } else {
        calcNetProfit.style.color = 'var(--success)';
        netMarginBadge.style.color = 'var(--success)';
        netMarginBadge.style.background = 'var(--success-subtle)';
    }

    return { price, cogs, shipping, fee, totalCost, netProfit, margin, platform };
}

/* ==========================================================================
   IMAGE UPLOAD & LOCAL CLIENT-SIDE ANALYSIS
   ========================================================================== */

function setupImageHandlers() {
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) processImageFile(files[0]);
    });

    imageInput.addEventListener('change', () => {
        if (imageInput.files.length > 0) processImageFile(imageInput.files[0]);
    });

    btnRemoveImg.addEventListener('click', (e) => {
        e.stopPropagation();
        previewImg.src = '';
        dropzonePreview.classList.add('hidden');
        dropzonePrompt.classList.remove('hidden');
        imageInput.value = '';
        state.imageColors = null;
    });
}

function processImageFile(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        dropzonePrompt.classList.add('hidden');
        dropzonePreview.classList.remove('hidden');

        // Extract client-side color nuances via offscreen canvas
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 40;
            canvas.height = 40;
            ctx.drawImage(img, 0, 0, 40, 40);
            const imgData = ctx.getImageData(0, 0, 40, 40).data;
            
            let r = 0, g = 0, b = 0;
            for (let i = 0; i < imgData.length; i += 4) {
                r += imgData[i];
                g += imgData[i + 1];
                b += imgData[i + 2];
            }
            const count = imgData.length / 4;
            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);

            // Rough tone descriptor
            if (r > 180 && g > 150 && b > 120) state.imageColors = 'Warm Sand & Neutral Palette';
            else if (r > g && r > b) state.imageColors = 'Earthy Warm Amber / Rich Terracotta';
            else if (g > r && g > b) state.imageColors = 'Sage Botanical Green & Forest Hue';
            else if (b > r && b > g) state.imageColors = 'Classic Indigo & Deep Navy';
            else if (r < 70 && g < 70 && b < 70) state.imageColors = 'Minimalist Midnight Black & Charcoal';
            else state.imageColors = 'Authentic Organic Tones';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/* ==========================================================================
   AI GENERATION ENGINE (OPEN INNOVATION PIPELINE)
   ========================================================================== */

async function handleGenerateListing(e) {
    e.preventDefault();

    const productName = document.getElementById('product-name').value.trim();
    const productFeatures = document.getElementById('product-features').value.trim();
    const platform = platformSelect.value;
    const category = categorySelect.value;
    const tone = state.selectedTone;
    const financials = updateProfitCalculations();

    if (!productName || !productFeatures) return;

    const btnGenerate = document.getElementById('btn-generate');
    const btnText = document.getElementById('generate-btn-text');
    btnGenerate.classList.add('loading');
    btnText.textContent = 'Synthesizing with Local AI...';

    // Simulated short computation delay for model inference
    await new Promise(resolve => setTimeout(resolve, 350));

    // Generate listing modules
    const listing = synthesizeListing({
        name: productName,
        features: productFeatures,
        platform,
        category,
        tone,
        financials,
        colors: state.imageColors
    });

    state.currentListing = listing;

    // Render to UI
    renderListingOutput(listing);

    // Save to local history
    saveToHistory(listing);

    btnGenerate.classList.remove('loading');
    btnText.textContent = 'Generate Studio Listing';
    showToast('Listing generated successfully!');
}

function synthesizeListing({ name, features, platform, category, tone, financials, colors }) {
    // 1. Keyword extraction & attribute splitting
    const rawTokens = features.split(/[,;\n•.-]+/).map(t => t.trim()).filter(t => t.length > 2);
    const primaryKeywords = rawTokens.slice(0, 5);

    // 2. SEO Title Engine (Platform character constraints)
    let title = '';
    const colorAddon = colors ? ` | ${colors}` : '';

    if (platform === 'etsy') {
        // Etsy loves comma-separated keyword clusters
        title = `${name} - ${primaryKeywords[0] || 'Handmade'}, ${primaryKeywords[1] || 'Unique Gift'}, ${tone === 'luxury' ? 'Premium Aesthetic' : 'Artisan Crafted'}${colorAddon}`;
        if (title.length > 135) title = title.substring(0, 135).trim();
    } else if (platform === 'ebay') {
        // eBay max 80 chars
        title = `${name} ${primaryKeywords.slice(0, 3).join(' ')} ${tone.toUpperCase()}`;
        if (title.length > 78) title = title.substring(0, 78).trim();
    } else {
        // Shopify / Amazon clean authoritative title
        title = `${name} — ${tone === 'artisanal' ? 'Handcrafted' : 'Premium'} ${primaryKeywords.slice(0, 2).join(' & ')}`;
    }

    // 3. 13 High-Rank SEO Tags
    const baseTags = [
        name.toLowerCase(),
        ...rawTokens.map(t => t.toLowerCase()),
        `${category} gift`,
        'handmade gift',
        'unique aesthetic',
        'personalized gift',
        'shop small',
        'artisan crafted',
        'durable quality',
        'everyday essentials',
        'sustainable home',
        'cozy vibe'
    ];
    // Remove duplicates & sanitize to max 13
    const uniqueTags = Array.from(new Set(baseTags.filter(t => t.length > 2 && t.length < 24))).slice(0, 13);

    // 4. Bullet Point Highlights
    const bullets = [
        `Materials & Craft: Crafted with intentional attention to detail using ${rawTokens[0] || 'premium materials'}.`,
        `Functional Design: Built specifically for daily durability, featuring ${rawTokens[1] || 'ergonomic craftsmanship'}.`,
        `Gifting Ready: Beautifully wrapped and packaged securely—ideal gift for design lovers and collectors.`,
        `Local & Ethical: Small-batch made with zero compromise on quality and sustainable sourcing.`
    ];

    // 5. Rich Story & Description
    const toneIntros = {
        artisanal: `Every piece tells a story. Meet the **${name}**—thoughtfully designed and made by hand to bring authentic warmth and character into your routine.`,
        luxury: `Elevate your standard. The **${name}** represents a refined balance of timeless aesthetics, superior resilience, and understated prestige.`,
        punchy: `Stop settling for mass-produced clones. The **${name}** gives you high-end performance, striking design, and unmatched everyday utility.`,
        minimalist: `Pure form meets essential function. The **${name}** is engineered with intentional simplicity, stripping away the noise to highlight genuine craftsmanship.`
    };

    const desc = `${toneIntros[tone] || toneIntros.artisanal}

### ✨ Key Specifications:
${rawTokens.map(t => `• ${t}`).join('\n')}

### 📦 What You'll Receive:
• 1x ${name}
• Care instructions card
• Eco-friendly presentation packaging

### 💡 Care Instructions:
Wipe clean gently with a soft dry cloth. Store in a cool, dry spot away from direct prolonged exposure to water to preserve its authentic texture.

---
*Support small businesses! Each item is inspected personally before shipment. Free tracked delivery on qualifying orders.*`;

    // 6. Social Media Hook
    const social = `Elevate your space with our latest handcrafted release: ${name} ✨

Made with ${rawTokens.slice(0, 2).join(' and ')} for those who appreciate genuine quality over mass production.

Tap the link in bio to shop the drop! 🛒
${uniqueTags.slice(0, 6).map(t => `#${t.replace(/\s+/g, '')}`).join(' ')} #shopsmall #sidehustle #smallbusiness`;

    return {
        id: Date.now(),
        timestamp: new Date().toLocaleDateString(),
        title,
        tags: uniqueTags,
        bullets,
        desc,
        social,
        financials,
        rawInputs: { name, features, platform, category, tone }
    };
}

/* ==========================================================================
   RENDER OUTPUT
   ========================================================================== */

function renderListingOutput(listing) {
    // Title
    outTitle.textContent = listing.title;
    titleCharCount.textContent = `${listing.title.length} chars`;

    // Tags
    outTags.innerHTML = '';
    tagsCount.textContent = listing.tags.length;
    listing.tags.forEach(tag => {
        const pill = document.createElement('span');
        pill.className = 'tag-pill';
        pill.textContent = tag;
        pill.title = 'Click to copy tag';
        pill.addEventListener('click', () => {
            copyToClipboard(tag);
        });
        outTags.appendChild(pill);
    });

    // Bullets
    outBullets.innerHTML = '';
    listing.bullets.forEach(bullet => {
        const li = document.createElement('li');
        li.textContent = bullet;
        outBullets.appendChild(li);
    });

    // Description
    outDesc.textContent = listing.desc;

    // Social
    outSocial.textContent = listing.social;
}

/* ==========================================================================
   EXPORT & COPY UTILITIES
   ========================================================================== */

function copyFullListing() {
    if (!state.currentListing) {
        showToast('Generate a listing first!');
        return;
    }

    const l = state.currentListing;
    const fullText = `=== PRODUCT TITLE ===\n${l.title}\n\n=== 13 SEO TAGS ===\n${l.tags.join(', ')}\n\n=== HIGHLIGHTS ===\n${l.bullets.join('\n')}\n\n=== FULL DESCRIPTION ===\n${l.desc}\n\n=== SOCIAL MEDIA HOOK ===\n${l.social}`;

    copyToClipboard(fullText);
    showToast('Full listing copied to clipboard!');
}

function exportCSV() {
    if (!state.currentListing) {
        showToast('Generate a listing first!');
        return;
    }

    const l = state.currentListing;
    const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""')}"`;

    const headers = ['Title', 'Tags', 'Price', 'Net_Profit', 'Margin_Percent', 'Description', 'Social_Hook'];
    const row = [
        escapeCsv(l.title),
        escapeCsv(l.tags.join('; ')),
        l.financials.price,
        l.financials.netProfit.toFixed(2),
        l.financials.margin.toFixed(1),
        escapeCsv(l.desc),
        escapeCsv(l.social)
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SellCraft_${l.rawInputs.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV Exported!');
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!');
        });
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('Copied to clipboard!');
        } catch (err) {
            console.error('Copy fallback failed', err);
        }
        document.body.removeChild(textArea);
    }
}

function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    setTimeout(() => {
        toastEl.classList.add('hidden');
    }, 2400);
}

/* ==========================================================================
   LOCAL HISTORY STORAGE
   ========================================================================== */

function saveToHistory(listing) {
    state.history.unshift(listing);
    if (state.history.length > 15) state.history.pop();
    try {
        localStorage.setItem('sellcraft_history', JSON.stringify(state.history));
    } catch (e) {
        console.warn('LocalStorage full', e);
    }
    renderHistory();
}

function loadHistory() {
    try {
        const stored = localStorage.getItem('sellcraft_history');
        if (stored) {
            state.history = JSON.parse(stored);
            renderHistory();
        }
    } catch (e) {
        state.history = [];
    }
}

function renderHistory() {
    if (state.history.length === 0) {
        historyContainer.innerHTML = '<p class="history-empty">No saved listings yet. Generate your first product above to save it locally!</p>';
        return;
    }

    historyContainer.innerHTML = '';
    state.history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-item-title">${escapeHtml(item.rawInputs.name)}</div>
            <div class="history-item-meta">
                <span>${item.rawInputs.platform.toUpperCase()} • $${item.financials.price}</span>
                <span>Profit: +$${item.financials.netProfit.toFixed(2)}</span>
            </div>
        `;
        div.addEventListener('click', () => {
            state.currentListing = item;
            renderListingOutput(item);
            sellingPriceInput.value = item.financials.price;
            costGoodsInput.value = item.financials.cogs;
            shippingCostInput.value = item.financials.shipping;
            platformSelect.value = item.rawInputs.platform;
            categorySelect.value = item.rawInputs.category;
            document.getElementById('product-name').value = item.rawInputs.name;
            document.getElementById('product-features').value = item.rawInputs.features;
            updateProfitCalculations();
            window.scrollTo({ top: 400, behavior: 'smooth' });
            showToast('Loaded saved listing!');
        });
        historyContainer.appendChild(div);
    });
}

function clearHistory() {
    state.history = [];
    localStorage.removeItem('sellcraft_history');
    renderHistory();
    showToast('History cleared');
}

function escapeHtml(str) {
    return (str || '').replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

/* ==========================================================================
   THEME TOGGLE
   ========================================================================== */

function toggleTheme() {
    const isDark = document.body.classList.contains('theme-dark');
    if (isDark) {
        document.body.classList.replace('theme-dark', 'theme-light');
        themeToggleBtn.querySelector('.theme-icon').textContent = '🌙';
        localStorage.setItem('sellcraft_theme', 'light');
    } else {
        document.body.classList.replace('theme-light', 'theme-dark');
        themeToggleBtn.querySelector('.theme-icon').textContent = '☀️';
        localStorage.setItem('sellcraft_theme', 'dark');
    }
}

function loadTheme() {
    const saved = localStorage.getItem('sellcraft_theme');
    if (saved === 'light') {
        document.body.classList.replace('theme-dark', 'theme-light');
        themeToggleBtn.querySelector('.theme-icon').textContent = '🌙';
    }
}
