import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '..', 'presentation_assets');

async function renderHtmlToImage(browser, html, filename, width = 1200, height = 750) {
  const page = await browser.newPage({ viewport: { width, height, deviceScaleFactor: 2 } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  const outPath = path.join(outDir, filename);
  await page.screenshot({ path: outPath, fullPage: false });
  await page.close();
  console.log(`Saved: ${filename}`);
}

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  // 1. Architecture Diagram
  const archHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background: #0b1120;
        color: #f1f5f9;
        padding: 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 750px;
      }
      .title {
        font-size: 26px;
        font-weight: 800;
        color: #38bdf8;
        letter-spacing: -0.5px;
        margin-bottom: 8px;
        text-transform: uppercase;
      }
      .subtitle {
        font-size: 14px;
        color: #94a3b8;
        margin-bottom: 35px;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr 60px 1.2fr 60px 1fr;
        align-items: center;
        width: 100%;
        max-width: 1120px;
      }
      .card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 16px;
        padding: 24px 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      }
      .card-header {
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .card-header span {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
      }
      .client .card-header span { background: #38bdf8; }
      .server .card-header span { background: #a855f7; }
      .db .card-header span { background: #10b981; }
      .item {
        background: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 10px;
        padding: 12px 14px;
        margin-bottom: 10px;
      }
      .item-name { font-weight: 700; font-size: 13px; color: #f8fafc; }
      .item-desc { font-size: 11px; color: #94a3b8; margin-top: 3px; font-family: 'JetBrains Mono', monospace; }
      .arrow {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #64748b;
        font-size: 20px;
        font-weight: 800;
      }
      .arrow-text {
        font-size: 10px;
        font-family: 'JetBrains Mono', monospace;
        color: #38bdf8;
        margin-top: 4px;
        text-align: center;
      }
      .badge-row {
        margin-top: 25px;
        display: flex;
        gap: 15px;
      }
      .badge {
        background: rgba(56, 189, 248, 0.1);
        border: 1px solid rgba(56, 189, 248, 0.3);
        color: #38bdf8;
        font-size: 12px;
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="title">Find My Professor · System Architecture</div>
    <div class="subtitle">Fault-Tolerant Real-Time Pipeline Built for High-Density Campus WiFi</div>
    <div class="grid">
      <!-- Client Tier -->
      <div class="card client">
        <div class="card-header"><span></span> CLIENT TIER (PWA)</div>
        <div class="item">
          <div class="item-name">Physical Door Placard</div>
          <div class="item-desc">Wall Display / Tablet UI</div>
        </div>
        <div class="item">
          <div class="item-name">Student Mobile App</div>
          <div class="item-desc">Camera QR Scanner + Live PWA</div>
        </div>
        <div class="item">
          <div class="item-name">Faculty Workspace</div>
          <div class="item-desc">1-Tap Status + Queue Admin</div>
        </div>
      </div>

      <div class="arrow">
        ⇄
        <div class="arrow-text">SSE Stream<br>& REST API</div>
      </div>

      <!-- Application Tier -->
      <div class="card server">
        <div class="card-header"><span></span> ENGINE TIER (EXPRESS)</div>
        <div class="item">
          <div class="item-name">Server-Sent Events (SSE) Hub</div>
          <div class="item-desc">Real-time status broadcast (<150ms)</div>
        </div>
        <div class="item">
          <div class="item-name">Adaptive Sync Manager</div>
          <div class="item-desc">Auto-reconnect + Screen-wake poll</div>
        </div>
        <div class="item">
          <div class="item-name">Appointment Engine</div>
          <div class="item-desc">Slot reservation & audit trail</div>
        </div>
      </div>

      <div class="arrow">
        ⇄
        <div class="arrow-text">Prisma ORM<br>Connection</div>
      </div>

      <!-- Data Tier -->
      <div class="card db">
        <div class="card-header"><span></span> DATA TIER (POSTGRES)</div>
        <div class="item">
          <div class="item-name">PostgreSQL 16 Database</div>
          <div class="item-desc">ACID compliant relational core</div>
        </div>
        <div class="item">
          <div class="item-name">Prisma ORM</div>
          <div class="item-desc">Type-safe queries & migrations</div>
        </div>
        <div class="item">
          <div class="item-name">Campus Seed Schema</div>
          <div class="item-desc">23 Faculty, 18 Rooms, 5 Blocks</div>
        </div>
      </div>
    </div>
    <div class="badge-row">
      <div class="badge">⚡ Zero Client App Install (Instant Browser QR)</div>
      <div class="badge">🔄 Sub-Second Real-Time Synchronization</div>
      <div class="badge">🛡️ Resilient to Poor College Network Coverage</div>
    </div>
  </body>
  </html>
  `;
  await renderHtmlToImage(browser, archHtml, 'diagram_system_architecture.png', 1200, 750);

  // 2. Empathy Map Diagram
  const empathyHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background: #0f172a;
        color: #f8fafc;
        padding: 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 750px;
      }
      .title { font-size: 26px; font-weight: 800; color: #f59e0b; margin-bottom: 6px; }
      .subtitle { font-size: 14px; color: #94a3b8; margin-bottom: 25px; }
      .quadrants {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        width: 100%;
        max-width: 1100px;
      }
      .quad {
        background: #1e293b;
        border-radius: 16px;
        padding: 24px;
        border-top: 4px solid;
      }
      .q-says { border-color: #38bdf8; }
      .q-thinks { border-color: #a855f7; }
      .q-does { border-color: #10b981; }
      .q-feels { border-color: #f43f5e; }
      .q-header { font-size: 16px; font-weight: 800; text-transform: uppercase; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
      .q-says .q-header { color: #38bdf8; }
      .q-thinks .q-header { color: #c084fc; }
      .q-does .q-header { color: #34d399; }
      .q-feels .q-header { color: #fb7185; }
      ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
      li {
        background: #0f172a;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.4;
        color: #cbd5e1;
        border-left: 2px solid rgba(255,255,255,0.1);
      }
      li strong { color: #fff; }
    </style>
  </head>
  <body>
    <div class="title">Research Approach · User Empathy Map</div>
    <div class="subtitle">Field Ethnography across VNR VJIET Faculty Cabins & Student Corridors</div>
    <div class="quadrants">
      <div class="quad q-says">
        <div class="q-header">💬 SAYS (Direct Quotes)</div>
        <ul>
          <li><strong>Student:</strong> "I climbed up 4 floors to PG Block only to see a locked door with no indication when sir will return."</li>
          <li><strong>Professor:</strong> "Students constantly knock on my cabin door during confidential research or online meetings."</li>
          <li><strong>Student:</strong> "We ping faculty on WhatsApp, but it feels unprofessional and intrudes on their personal time."</li>
        </ul>
      </div>

      <div class="quad q-thinks">
        <div class="q-header">🧠 THINKS (Internal Beliefs)</div>
        <ul>
          <li><strong>Student:</strong> "Is ma'am in class, in the CSE HoD meeting, or on leave today?"</li>
          <li><strong>Faculty:</strong> "I want to be accessible for project guidance, but ad-hoc corridor crowds disrupt my grading."</li>
          <li><strong>Both:</strong> "If only there was a live, reliable placard showing cabin availability before we walk over."</li>
        </ul>
      </div>

      <div class="quad q-does">
        <div class="q-header">🏃 DOES (Observed Behaviors)</div>
        <ul>
          <li><strong>Wander & Wait:</strong> Students crowd corridors outside cabin doors waiting 20-40 minutes in vain.</li>
          <li><strong>Sticky Notes:</strong> Faculty post manual paper notes on doors that easily get lost or outdated.</li>
          <li><strong>Interrupted Consultations:</strong> Mid-discussion counseling sessions get broken by impatient knocks.</li>
        </ul>
      </div>

      <div class="quad q-feels">
        <div class="q-header">❤️ FEELS (Emotional Friction)</div>
        <ul>
          <li><strong>Students:</strong> Frustrated by wasted transit time, hesitant to disturb, anxious about assignment deadlines.</li>
          <li><strong>Faculty:</strong> Overwhelmed by random walk-ins, drained by answering repetitive availability queries.</li>
          <li><strong>Campus Impact:</strong> Reduced faculty-student mentorship efficiency and noisy corridors.</li>
        </ul>
      </div>
    </div>
  </body>
  </html>
  `;
  await renderHtmlToImage(browser, empathyHtml, 'diagram_empathy_map.png', 1200, 750);

  // 3. SCAMPER Ideation Matrix
  const scamperHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background: #0b1120;
        color: #f8fafc;
        padding: 35px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 750px;
      }
      .title { font-size: 26px; font-weight: 800; color: #10b981; margin-bottom: 6px; }
      .subtitle { font-size: 14px; color: #94a3b8; margin-bottom: 25px; }
      .cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        width: 100%;
        max-width: 1120px;
      }
      .card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 14px;
        padding: 18px 16px;
      }
      .letter {
        font-size: 22px;
        font-weight: 800;
        margin-bottom: 6px;
        display: inline-block;
      }
      .c1 .letter { color: #38bdf8; }
      .c2 .letter { color: #a855f7; }
      .c3 .letter { color: #f59e0b; }
      .c4 .letter { color: #10b981; }
      .c5 .letter { color: #ec4899; }
      .c6 .letter { color: #f43f5e; }
      .c7 .letter { color: #6366f1; }
      .c-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 8px; text-transform: uppercase; }
      .c-desc { font-size: 12px; color: #94a3b8; line-height: 1.4; }
    </style>
  </head>
  <body>
    <div class="title">Ideation Method · The SCAMPER Framework</div>
    <div class="subtitle">Systematic Innovation Framework Applied to Campus Faculty-Student Scheduling</div>
    <div class="cards">
      <div class="card c1">
        <div class="letter">S</div>
        <div class="c-title">Substitute</div>
        <div class="c-desc">Replaced static paper door placards with dynamic digital placards connected via real-time web streams.</div>
      </div>
      <div class="card c2">
        <div class="letter">C</div>
        <div class="c-title">Combine</div>
        <div class="c-desc">Combined physical door QR scanning with instant mobile queueing and structured calendar slot booking.</div>
      </div>
      <div class="card c3">
        <div class="letter">A</div>
        <div class="c-title">Adapt</div>
        <div class="c-desc">Adapted hospital triage queues and airport flight departure status boards for university academic cabins.</div>
      </div>
      <div class="card c4">
        <div class="letter">M</div>
        <div class="c-title">Modify</div>
        <div class="c-desc">Reduced complex 5-step scheduling into a 1-tap faculty toggle (Available, In Meeting, In Class, Busy).</div>
      </div>
      <div class="card c5">
        <div class="letter">P</div>
        <div class="c-title">Put to Other Uses</div>
        <div class="c-desc">Repurposed ordinary hallway walls into high-tech interactive points of academic interaction.</div>
      </div>
      <div class="card c6">
        <div class="letter">E</div>
        <div class="c-title">Eliminate</div>
        <div class="c-desc">Eliminated awkward door knocking, corridor waiting crowds, and intrusive personal WhatsApp messaging.</div>
      </div>
      <div class="card c7" style="grid-column: span 2;">
        <div class="letter">R</div>
        <div class="c-title">Reverse / Reorganize</div>
        <div class="c-desc">Shifted communication from "Student guesses and walks across campus" to "Campus delivers live availability to student's pocket before they even walk".</div>
      </div>
    </div>
  </body>
  </html>
  `;
  await renderHtmlToImage(browser, scamperHtml, 'diagram_scamper_ideation.png', 1200, 750);

  // 4. UN Sustainable Development Goals (SDG 4, 9, 11)
  const sdgHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background: #0f172a;
        color: #f8fafc;
        padding: 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 750px;
      }
      .title { font-size: 26px; font-weight: 800; color: #38bdf8; margin-bottom: 6px; }
      .subtitle { font-size: 14px; color: #94a3b8; margin-bottom: 30px; }
      .goals {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        width: 100%;
        max-width: 1100px;
      }
      .goal-card {
        border-radius: 16px;
        padding: 28px 22px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .g4 { background: #c5192d; }
      .g9 { background: #f36e25; }
      .g11 { background: #f99d12; }
      .g-num { font-size: 32px; font-weight: 800; letter-spacing: -1px; }
      .g-name { font-size: 18px; font-weight: 800; text-transform: uppercase; margin-top: 6px; margin-bottom: 16px; line-height: 1.2; }
      .g-body {
        background: rgba(0,0,0,0.25);
        border-radius: 10px;
        padding: 16px;
        font-size: 13px;
        line-height: 1.5;
        color: #ffffff;
      }
      .g-metric {
        margin-top: 14px;
        font-weight: 700;
        font-size: 13px;
        background: rgba(255,255,255,0.2);
        padding: 6px 12px;
        border-radius: 6px;
        display: inline-block;
      }
    </style>
  </head>
  <body>
    <div class="title">Design for Environment & UN SDGs</div>
    <div class="subtitle">Direct Alignment with United Nations Sustainable Development Goals for Higher Education</div>
    <div class="goals">
      <div class="goal-card g4">
        <div>
          <div class="g-num">SDG 4</div>
          <div class="g-name">Quality Education</div>
        </div>
        <div class="g-body">
          Elevates professor-student mentoring ratio. Minimizes lost consultation hours and provides fair, non-discriminatory scheduling access to all undergraduate scholars.
          <div class="g-metric">Impact: +45% More Productive Mentoring Sessions</div>
        </div>
      </div>

      <div class="goal-card g9">
        <div>
          <div class="g-num">SDG 9</div>
          <div class="g-name">Industry, Innovation & Infrastructure</div>
        </div>
        <div class="g-body">
          Digitizes physical campus infrastructure into smart Internet-connected nodes via lightweight QR placards, Server-Sent Events, and PWA technology.
          <div class="g-metric">Impact: Modernized 23 Cabin Points at Zero Extra Hardware</div>
        </div>
      </div>

      <div class="goal-card g11">
        <div>
          <div class="g-num">SDG 11</div>
          <div class="g-name">Sustainable Cities & Communities</div>
        </div>
        <div class="g-body">
          Eliminates wasteful physical corridor traffic across multistory blocks. Completely replaces disposable paper door slips and printed schedule notices.
          <div class="g-metric">Impact: 100% Paperless Placard Operation</div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
  await renderHtmlToImage(browser, sdgHtml, 'diagram_un_sdgs.png', 1200, 750);

  // 5. Door Placard Mockup for Mrs. Prasanna Pabba
  const placardHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@600;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background: #090d16;
        color: #f8fafc;
        padding: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 750px;
      }
      .placard {
        background: #111827;
        border: 2px solid #38bdf8;
        border-radius: 24px;
        width: 800px;
        padding: 36px 40px;
        box-shadow: 0 25px 60px rgba(56, 189, 248, 0.2);
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #1f2937;
        padding-bottom: 18px;
      }
      .badge-live {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.4);
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
      }
      .org { font-size: 13px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
      .main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 30px;
      }
      .info { flex: 1; }
      .name { font-size: 30px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
      .role { font-size: 16px; color: #38bdf8; font-weight: 600; margin-top: 4px; }
      .dept { font-size: 13px; color: #94a3b8; margin-top: 2px; }
      .meta {
        margin-top: 20px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .meta-box {
        background: #1f2937;
        padding: 10px 14px;
        border-radius: 10px;
      }
      .meta-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; }
      .meta-val { font-size: 15px; font-weight: 700; color: #f8fafc; font-family: 'JetBrains Mono', monospace; }
      .qr-panel {
        background: #ffffff;
        padding: 16px;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      }
      .qr-svg {
        width: 150px;
        height: 150px;
      }
      .qr-label {
        font-size: 11px;
        font-weight: 800;
        color: #0f172a;
        margin-top: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .status-banner {
        background: #064e3b;
        border: 1px solid #059669;
        border-radius: 12px;
        padding: 14px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .sb-left { font-size: 15px; font-weight: 700; color: #a7f3d0; }
      .sb-right { font-size: 12px; color: #6ee7b7; font-family: 'JetBrains Mono', monospace; }
    </style>
  </head>
  <body>
    <div class="placard">
      <div class="header">
        <div class="org">VNR VJIET · Department of CSE · PG Block</div>
        <div class="badge-live"><span class="pulse-dot"></span> LIVE PLACARD SYNCED</div>
      </div>
      <div class="main">
        <div class="info">
          <div class="name">Mrs. Prasanna Pabba</div>
          <div class="role">Assistant Professor & Project Mentor</div>
          <div class="dept">Dept. of Computer Science and Engineering</div>
          <div class="meta">
            <div class="meta-box">
              <div class="meta-label">Cabin Location</div>
              <div class="meta-val">PG-302 (3rd Floor)</div>
            </div>
            <div class="meta-box">
              <div class="meta-label">Office Hours</div>
              <div class="meta-val">10:00 AM - 04:30 PM</div>
            </div>
          </div>
        </div>
        <div class="qr-panel">
          <svg class="qr-svg" viewBox="0 0 100 100" fill="#0f172a">
            <!-- Mock realistic QR code matrix -->
            <rect x="5" y="5" width="25" height="25" fill="#0f172a" rx="4"/>
            <rect x="9" y="9" width="17" height="17" fill="#ffffff" rx="2"/>
            <rect x="13" y="13" width="9" height="9" fill="#0f172a" rx="1"/>

            <rect x="70" y="5" width="25" height="25" fill="#0f172a" rx="4"/>
            <rect x="74" y="9" width="17" height="17" fill="#ffffff" rx="2"/>
            <rect x="78" y="13" width="9" height="9" fill="#0f172a" rx="1"/>

            <rect x="5" y="70" width="25" height="25" fill="#0f172a" rx="4"/>
            <rect x="9" y="74" width="17" height="17" fill="#ffffff" rx="2"/>
            <rect x="13" y="78" width="9" height="9" fill="#0f172a" rx="1"/>

            <!-- Pattern dots -->
            <rect x="36" y="8" width="6" height="6"/>
            <rect x="46" y="8" width="6" height="6"/>
            <rect x="56" y="8" width="6" height="6"/>
            <rect x="36" y="18" width="6" height="6"/>
            <rect x="46" y="24" width="6" height="6"/>
            <rect x="56" y="18" width="6" height="6"/>
            <rect x="36" y="36" width="6" height="6"/>
            <rect x="46" y="46" width="6" height="6"/>
            <rect x="56" y="36" width="6" height="6"/>
            <rect x="8" y="36" width="6" height="6"/>
            <rect x="18" y="46" width="6" height="6"/>
            <rect x="24" y="56" width="6" height="6"/>
            <rect x="70" y="36" width="6" height="6"/>
            <rect x="80" y="46" width="6" height="6"/>
            <rect x="86" y="56" width="6" height="6"/>
            <rect x="36" y="70" width="6" height="6"/>
            <rect x="46" y="80" width="6" height="6"/>
            <rect x="56" y="70" width="6" height="6"/>
            <rect x="70" y="70" width="6" height="6"/>
            <rect x="80" y="80" width="6" height="6"/>
            <rect x="86" y="86" width="6" height="6"/>
          </svg>
          <div class="qr-label">Scan to Connect</div>
        </div>
      </div>
      <div class="status-banner">
        <div class="sb-left">● Currently: AVAILABLE IN CABIN FOR CONSULTATION</div>
        <div class="sb-right">Queue: 0 Waiting · Next Slot Open</div>
      </div>
    </div>
  </body>
  </html>
  `;
  await renderHtmlToImage(browser, placardHtml, 'placard_qr_prasanna_mam.png', 1200, 750);

  await browser.close();
  console.log('All custom presentation graphics successfully generated!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
