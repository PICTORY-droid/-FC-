/**
 * Builds public/og-image.png — the preview card shown when the link is shared
 * (KakaoTalk, 문자, SNS). Dev-only: needs Playwright (`npx playwright install chromium`).
 *
 * Usage: node scripts/build_og_image.mjs
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const font = (f) =>
  `data:font/woff2;base64,${readFileSync(join(root, "node_modules/@fontsource/jua/files", f)).toString("base64")}`;

const mascot = `
<svg width="330" height="330" viewBox="0 0 64 64">
  <rect x="6" y="14" width="52" height="40" rx="9" fill="#fff8f1" stroke="#e8541e" stroke-width="3"/>
  <path d="M9.5 16.5 L32 28 L54.5 16.5 Z" fill="#ffe1d2" stroke="#e8541e" stroke-width="2.6" stroke-linejoin="round"/>
  <g fill="none" stroke="#3b2a20" stroke-width="2.6" stroke-linecap="round">
    <path d="M19.5 38.5q3.5 -4.5 7 0"/><path d="M37.5 38.5q3.5 -4.5 7 0"/>
  </g>
  <circle cx="17" cy="43" r="3.2" fill="#ff9f8a" opacity="0.7"/><circle cx="47" cy="43" r="3.2" fill="#ff9f8a" opacity="0.7"/>
  <path d="M27.5 43q4.5 4.5 9 0" fill="none" stroke="#3b2a20" stroke-width="2.4" stroke-linecap="round"/>
  <g transform="translate(44 4)">
    <rect width="16" height="16" rx="3" fill="#ffc94d" stroke="#e8541e" stroke-width="2" stroke-dasharray="2.4 1.6"/>
    <path d="M8 12.2l-3.6-3.4a2.2 2.2 0 013.6-2.6 2.2 2.2 0 013.6 2.6z" fill="#e8541e"/>
  </g>
</svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Jua;src:url(${font("jua-korean-400-normal.woff2")}) format("woff2")}
@font-face{font-family:JuaLatin;src:url(${font("jua-latin-400-normal.woff2")}) format("woff2")}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#fff8f1;font-family:JuaLatin,Jua,sans-serif;color:#3b2a20;position:relative;overflow:hidden}
.stripe{position:absolute;left:0;right:0;height:22px;background:repeating-linear-gradient(-45deg,#e8541e 0 26px,#fff8f1 26px 40px,#1f8a5b 40px 66px,#fff8f1 66px 80px)}
.top{top:0}.bottom{bottom:0}
.wrap{position:absolute;inset:22px 0;display:flex;align-items:center;gap:56px;padding:0 90px}
h1{font-size:96px;line-height:1.05;color:#e8541e}
p{margin-top:26px;font-size:38px;color:#6e5648}
.chips{margin-top:30px;display:flex;gap:14px}
.chip{background:#fff0e7;color:#e8541e;border:3px dashed rgba(232,84,30,.35);border-radius:18px;padding:10px 22px;font-size:30px}
</style></head><body>
<div class="stripe top"></div><div class="stripe bottom"></div>
<div class="wrap">${mascot}
  <div><h1>우체국 FC<br>문제은행</h1>
  <p>교재 원문 240문항 · 바로 채점 · 해설</p>
  <div class="chips"><span class="chip">누리 도우미</span><span class="chip">앱 설치 · 오프라인</span></div></div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(root, "public/og-image.png") });
await browser.close();
console.log("wrote public/og-image.png");
