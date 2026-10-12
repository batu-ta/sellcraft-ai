# SellCraft AI ⚡

> **Zero-Cloud E-Commerce Listing Studio & Profit Optimizer for Side Hustlers**  
> *Built for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12).*

---

## 🌟 The Problem & The Side Hustle Opportunity

Millions of side hustlers, artisans, and flippers make extra income on Etsy, eBay, Shopify, and Amazon. However, **product listing creation is the #1 friction point**:
- Crafting SEO-optimized titles and researching 13 search tags takes 25–40 minutes per item.
- Existing AI copy tools like Jasper or Copy.ai charge **$39–$49/month**—eating up side hustle profits before sellers make their first sale.
- Proprietary material formulations, unreleased designs, and confidential cost-of-goods margins get uploaded to external cloud APIs, violating client privacy or NDAs.

**SellCraft AI solves this completely**: An in-browser, privacy-first studio powered by open-source AI principles that runs 100% locally on your machine with **$0 API costs forever**.

---

## 🚀 Key Features

### 1. Multi-Platform AI Listing Writer
- **Etsy:** SEO keyword-stacked titles under 140 chars + 13 high-density rank tags.
- **eBay:** Search-optimized concise titles under 80 chars with item specifics.
- **Shopify & DTC:** Clean brand titles with rich storytelling and care instructions.
- **Social Media:** Ready-to-post Instagram/TikTok hooks with hashtags.

### 2. Live Platform Fee & Profit Simulator
Real-time calculator that simulates fees as you type:
- **Etsy:** 6.5% transaction + $0.20 listing fee + 3% + $0.25 payment processing.
- **eBay:** 13.25% final value fee + $0.30 transaction.
- **Shopify:** 2.9% + $0.30 payment gateway.
- Computes Net Margin %, Break-even, and Total Costs on the fly.

### 3. Client-Side Image Palette Extractor
Drag and drop product photos. An offscreen HTML5 Canvas analyzes local pixel data to detect color palettes (e.g. *Warm Sand, Sage Botanical, Earthy Terracotta*) and integrates them into the listing narrative without uploading photos to any server.

### 4. 1-Click Exports
- **Copy All:** Exports structured markdown ready for direct paste.
- **Export CSV:** Exports standardized spreadsheets formatted for bulk listing imports.
- **Individual Snippet Copy:** Fast copy buttons for titles, bullet highlights, tags, and social captions.

### 5. Local Hustle History
Saves your generated product inventory to your browser's `localStorage` so you never lose past listings.

---

## 🔒 Why Does Open Innovation Matter?

1. **Zero Data Leakage:** Unreleased inventions, handcrafted techniques, and confidential supplier costs remain 100% on the creator's laptop.
2. **True $0 Marginal Cost:** Solopreneurs don't need a corporate credit card or cloud API token to run high-grade automated copy.
3. **Offline & Fair-Ready:** Works in flea markets, craft shows, and countryside workshops without Wi-Fi or cellular reception.

---

## 💻 Tech Stack
- **Languages:** Semantic HTML5, Vanilla CSS3 (Custom Design Tokens), Modern JavaScript (ES6+).
- **Inference:** Client-side local NLP engine & Canvas pixel analysis.
- **Deployment:** Netlify (Zero-configuration static build).

---

## 📦 Running Locally
Simply clone the repository and open `index.html` in any modern web browser:
```bash
git clone https://github.com/batu-ta/sellcraft-ai.git
cd sellcraft-ai
# Open index.html directly or with Live Server
```
