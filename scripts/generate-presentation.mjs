import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const assetsDir = path.join(root, 'scripts/slides_assets');
const outputPdf = path.join(root, 'Find_My_Professor_Design_Thinking_VNRVJIET.pdf');

// Read images as base64 data URIs so the HTML is completely self-contained
function getBase64Image(filename) {
  const filePath = path.join(assetsDir, filename);
  if (!fs.existsSync(filePath)) return '';
  const ext = path.extname(filename).slice(1);
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext};base64,${data}`;
}

const teamPhoto = getBase64Image('team_cpdt.png');
const productDirectory = getBase64Image('product_directory.png');
const productPlacard = getBase64Image('product_placard.png');
const productWorkspace = getBase64Image('product_workspace.png');
const productMobilePlacard = getBase64Image('product_mobile_placard.png');
const productMobileScanner = getBase64Image('product_mobile_scanner.png');

console.log('Loaded slide assets into base64 strings.');

// Build full HTML presentation
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Where Is My Professor · Design Thinking Presentation · VNR VJIET</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #0f0a1c;
      color: #1e1b4b;
      -webkit-font-smoothing: antialiased;
    }
    @page {
      size: 1920px 1080px;
      margin: 0;
    }
    .slide {
      width: 1920px;
      height: 1080px;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      background: #f8fafc;
      padding: 70px 90px;
    }

    /* Common Top Bar */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      position: relative;
      z-index: 2;
    }
    .slide-header-left {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .slide-category {
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #7c3aed;
    }
    .slide-title {
      font-size: 44px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -1px;
      line-height: 1.15;
    }
    .slide-subtitle {
      font-size: 18px;
      color: #64748b;
      font-weight: 500;
      margin-top: 4px;
    }
    .vnr-badge {
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(255, 255, 255, 0.9);
      padding: 10px 22px;
      border-radius: 40px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 14px rgba(0,0,0,0.03);
    }
    .vnr-badge-text {
      text-align: right;
    }
    .vnr-badge-title {
      font-size: 13px;
      font-weight: 800;
      color: #1e1b4b;
      letter-spacing: 0.5px;
    }
    .vnr-badge-sub {
      font-size: 11px;
      font-weight: 600;
      color: #6d28d9;
    }

    /* Common Slide Footer */
    .slide-footer {
      position: absolute;
      bottom: 30px;
      left: 90px;
      right: 90px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      z-index: 2;
    }

    /* Cards & Containers */
    .card {
      background: #ffffff;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
      padding: 32px;
      position: relative;
    }
    .card-purple {
      background: linear-gradient(135deg, #2e1065 0%, #4c1d95 100%);
      color: #ffffff;
      border: none;
    }
    .card-purple h3, .card-purple p, .card-purple span {
      color: #ffffff;
    }
    .card-amber {
      background: #fffbeb;
      border: 1px solid #fef3c7;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-purple { background: #ede9fe; color: #6d28d9; }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-amber { background: #fef3c7; color: #b45309; }

    /* Tables */
    .styled-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 18px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      background: #ffffff;
    }
    .styled-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 800;
      font-size: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 16px 20px;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
    }
    .styled-table td {
      padding: 16px 20px;
      font-size: 15px;
      color: #1e293b;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
      line-height: 1.5;
    }
    .styled-table tr:last-child td {
      border-bottom: none;
    }
    .styled-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* SLIDE 1: Title Slide */
    .title-slide {
      background: linear-gradient(135deg, #18092e 0%, #2e1065 50%, #4c1d95 100%);
      color: white;
      justify-content: center;
      padding: 80px 100px;
    }
    .title-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 50px;
    }
    .college-name {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #e9d5ff;
    }
    .college-sub {
      font-size: 13px;
      color: #c4b5fd;
      font-weight: 500;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .title-content {
      max-width: 1100px;
    }
    .title-tag {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 8px 20px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 700;
      color: #fbbf24;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 24px;
    }
    .main-heading {
      font-size: 76px;
      font-weight: 800;
      line-height: 1.05;
      color: #ffffff;
      letter-spacing: -2px;
      margin-bottom: 20px;
      font-family: 'Space Grotesk', sans-serif;
    }
    .main-heading span {
      background: linear-gradient(90deg, #fbbf24 0%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .main-tagline {
      font-size: 26px;
      color: #e2e8f0;
      font-weight: 400;
      line-height: 1.4;
      margin-bottom: 50px;
    }
    .title-bottom-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
      margin-top: 30px;
    }
    .info-box {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 24px 30px;
    }
    .info-label {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #fbbf24;
      font-weight: 800;
      margin-bottom: 12px;
    }
    .team-member-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .member-chip {
      background: rgba(255, 255, 255, 0.12);
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .mentor-box {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .mentor-name {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
    }
    .mentor-title {
      font-size: 14px;
      color: #cbd5e1;
      margin-top: 4px;
    }

    /* SLIDE 2: The Team */
    .team-container {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 40px;
      height: 100%;
      align-items: center;
    }
    .team-image-wrapper {
      position: relative;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.12);
      border: 5px solid #ffffff;
      height: 640px;
    }
    .team-image-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .team-details-card {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .team-member-row {
      display: flex;
      align-items: center;
      gap: 20px;
      background: #ffffff;
      padding: 18px 24px;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }
    .member-avatar {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #7c3aed, #4c1d95);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 18px;
      flex-shrink: 0;
    }
    .member-info h4 {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
    }
    .member-info p {
      font-size: 13px;
      color: #64748b;
      margin-top: 2px;
      font-weight: 500;
    }

    /* SLIDE 3: Agenda */
    .agenda-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: 10px;
    }
    .agenda-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 24px 28px;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: flex-start;
      gap: 20px;
      transition: all 0.2s;
    }
    .agenda-card:hover {
      border-color: #8b5cf6;
      box-shadow: 0 10px 25px rgba(124, 58, 237, 0.08);
    }
    .agenda-num {
      font-size: 24px;
      font-weight: 800;
      color: #7c3aed;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1;
    }
    .agenda-content h3 {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .agenda-content p {
      font-size: 13px;
      color: #64748b;
      line-height: 1.4;
    }

    /* SLIDE 4 & 5: Problem Statement */
    .problem-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 36px;
    }
    .problem-box {
      background: #ffffff;
      border-radius: 24px;
      padding: 36px;
      border: 1px solid #e2e8f0;
    }
    .problem-stat {
      font-size: 54px;
      font-weight: 800;
      color: #dc2626;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1;
      margin-bottom: 10px;
    }
    .hmw-card {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      color: white;
      border-radius: 24px;
      padding: 40px;
      margin-top: 24px;
    }
    .hmw-card h3 {
      color: #fbbf24;
      font-size: 16px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
    }
    .hmw-card p {
      font-size: 26px;
      font-weight: 600;
      line-height: 1.4;
      color: #ffffff;
    }

    /* SLIDE 6: Empathy Map */
    .empathy-quadrants {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .quadrant-box {
      background: #ffffff;
      border-radius: 20px;
      padding: 26px 30px;
      border: 1px solid #e2e8f0;
      position: relative;
    }
    .quadrant-box.says { border-top: 5px solid #3b82f6; }
    .quadrant-box.thinks { border-top: 5px solid #8b5cf6; }
    .quadrant-box.does { border-top: 5px solid #f59e0b; }
    .quadrant-box.feels { border-top: 5px solid #ec4899; }
    .quadrant-title {
      font-size: 16px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .quadrant-box.says .quadrant-title { color: #2563eb; }
    .quadrant-box.thinks .quadrant-title { color: #7c3aed; }
    .quadrant-box.does .quadrant-title { color: #d97706; }
    .quadrant-box.feels .quadrant-title { color: #db2777; }
    .quadrant-box ul {
      list-style-type: none;
    }
    .quadrant-box li {
      font-size: 14.5px;
      color: #334155;
      margin-bottom: 10px;
      line-height: 1.5;
      padding-left: 20px;
      position: relative;
    }
    .quadrant-box li::before {
      content: "•";
      position: absolute;
      left: 4px;
      font-size: 18px;
      color: #94a3b8;
    }

    /* SLIDE 9: SCAMPER */
    .scamper-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 16px;
      margin-top: 20px;
    }
    .scamper-item {
      background: #ffffff;
      border-radius: 18px;
      padding: 20px 16px;
      border: 1px solid #e2e8f0;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .scamper-letter {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #7c3aed;
      color: white;
      font-size: 22px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Space Grotesk', sans-serif;
      margin-bottom: 12px;
    }
    .scamper-word {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .scamper-desc {
      font-size: 12px;
      color: #64748b;
      line-height: 1.4;
      text-align: left;
    }

    /* SLIDE 11: Prototype & Workflow */
    .prototype-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      align-items: center;
    }
    .workflow-steps {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .workflow-step {
      display: flex;
      align-items: flex-start;
      gap: 18px;
      background: #ffffff;
      padding: 16px 20px;
      border-radius: 18px;
      border: 1px solid #e2e8f0;
    }
    .step-number {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: #ede9fe;
      color: #6d28d9;
      font-weight: 800;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-content h4 {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }
    .step-content p {
      font-size: 13px;
      color: #64748b;
      margin-top: 2px;
    }
    .prototype-mockups {
      display: flex;
      gap: 20px;
      align-items: center;
      justify-content: center;
    }
    .mockup-frame {
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
      border: 4px solid #ffffff;
      background: #000;
    }
    .mockup-frame img {
      display: block;
      width: 100%;
      height: auto;
    }

    /* SLIDE 14: SDGs */
    .sdg-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .sdg-card {
      border-radius: 20px;
      padding: 30px;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 380px;
    }
    .sdg-4 { background: linear-gradient(135deg, #c5192d, #a21020); }
    .sdg-9 { background: linear-gradient(135deg, #f36e25, #d95614); }
    .sdg-11 { background: linear-gradient(135deg, #f99d26, #dd8214); }
    .sdg-number {
      font-size: 40px;
      font-weight: 800;
      font-family: 'Space Grotesk', sans-serif;
      opacity: 0.9;
    }
    .sdg-title {
      font-size: 22px;
      font-weight: 800;
      line-height: 1.25;
      margin-top: 8px;
    }
    .sdg-desc {
      font-size: 14px;
      line-height: 1.5;
      margin-top: 16px;
      color: rgba(255, 255, 255, 0.9);
    }
  </style>
</head>
<body>

  <!-- ==========================================
       SLIDE 1: Title Slide
       ========================================== -->
  <div class="slide title-slide">
    <div class="title-top">
      <div>
        <div class="college-name">VNR VJIET</div>
        <div class="college-sub">VALLURUPALLI NAGESWARA RAO VIGNANA JYOTHI INSTITUTE OF ENGINEERING &amp; TECHNOLOGY</div>
      </div>
      <div class="vnr-badge" style="background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.25);">
        <div class="vnr-badge-text" style="text-align: right;">
          <div class="vnr-badge-title" style="color: #ffffff;">CPDT</div>
          <div class="vnr-badge-sub" style="color: #fbbf24;">Centre for Presencing &amp; Design Thinking</div>
        </div>
      </div>
    </div>

    <div class="title-content">
      <div class="title-tag">💡 Design Thinking Engineering Project · 2026</div>
      <h1 class="main-heading">Find My Professor <span>· VNR Connect</span></h1>
      <p class="main-tagline">Dynamic QR Office Placards &amp; Real-Time Consultation Scheduling Ecosystem for Modern Engineering Campuses</p>

      <div class="title-bottom-grid">
        <div class="info-box">
          <div class="info-label">Student Engineering Team (CSE &amp; AI)</div>
          <div class="team-member-chips">
            <span class="member-chip">Sai Koushik Pallapolu</span>
            <span class="member-chip">Team Member 2</span>
            <span class="member-chip">Team Member 3</span>
            <span class="member-chip">Team Member 4</span>
          </div>
        </div>

        <div class="info-box mentor-box">
          <div class="info-label">Under the Guidance of</div>
          <div class="mentor-name">Mrs. Prasanna Pabba</div>
          <div class="mentor-title">Assistant Professor, Dept. of CSE · VNR VJIET</div>
        </div>
      </div>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 2: The Team
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">00 · Team Introduction</span>
        <h2 class="slide-title">The Team</h2>
        <p class="slide-subtitle">Centre for Presencing and Design Thinking (CPDT) · VNR VJIET</p>
      </div>
      <div class="vnr-badge">
        <div class="vnr-badge-text">
          <div class="vnr-badge-title">CPDT Studio</div>
          <div class="vnr-badge-sub">Team Collaboration</div>
        </div>
      </div>
    </div>

    <div class="team-container">
      <div class="team-image-wrapper">
        <img src="${teamPhoto}" alt="Team Photo at CPDT VNR VJIET">
      </div>

      <div class="team-details-card">
        <div class="card card-purple" style="padding: 24px;">
          <h3 style="font-size: 20px; font-weight: 800;">Our Innovation Commitment</h3>
          <p style="font-size: 14px; margin-top: 8px; line-height: 1.5; color: #e2e8f0;">
            Driven by real campus pain points, our team applied the human-centered Design Thinking methodology to eliminate wasted foot transit and scheduling chaos across VNR VJIET academic corridors.
          </p>
        </div>

        <div class="team-member-row">
          <div class="member-avatar">SK</div>
          <div class="member-info">
            <h4>Sai Koushik Pallapolu</h4>
            <p>Full-Stack Architecture · Real-time SSE Engine &amp; Mobile Responsive Web</p>
          </div>
        </div>

        <div class="team-member-row">
          <div class="member-avatar">T2</div>
          <div class="member-info">
            <h4>Co-Developer &amp; Researcher</h4>
            <p>User Empathy Research · Corridor Interviews &amp; Student Needs Mapping</p>
          </div>
        </div>

        <div class="team-member-row">
          <div class="member-avatar">T3</div>
          <div class="member-info">
            <h4>Systems &amp; Database Lead</h4>
            <p>PostgreSQL Schema Design · Prisma ORM &amp; Conflict Scheduling Logic</p>
          </div>
        </div>

        <div class="team-member-row">
          <div class="member-avatar">T4</div>
          <div class="member-info">
            <h4>Design &amp; Quality Lead</h4>
            <p>UI/UX Design Tokens · Placard Print Generation &amp; Field Verification</p>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 02 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 3: Agenda
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">Overview</span>
        <h2 class="slide-title">Agenda &amp; Presentation Flow</h2>
        <p class="slide-subtitle">Structured through the complete 5-stage Design Thinking journey</p>
      </div>
      <div class="vnr-badge">
        <div class="vnr-badge-text">
          <div class="vnr-badge-title">Design Thinking</div>
          <div class="vnr-badge-sub">11 Core Milestones</div>
        </div>
      </div>
    </div>

    <div class="agenda-grid">
      <div class="agenda-card">
        <div class="agenda-num">01</div>
        <div class="agenda-content">
          <h3>Problem Statement</h3>
          <p>Campus corridor transit friction &amp; zero cabin visibility.</p>
        </div>
      </div>

      <div class="agenda-card">
        <div class="agenda-num">02</div>
        <div class="agenda-content">
          <h3>Research Approach</h3>
          <p>Empathy interviews, corridor observations &amp; user mapping.</p>
        </div>
      </div>

      <div class="agenda-card">
        <div class="agenda-num">03</div>
        <div class="agenda-content">
          <h3>Defining Insights</h3>
          <p>Categorized user needs: Primary, Secondary, Latent.</p>
        </div>
      </div>

      <div class="agenda-card">
        <div class="agenda-num">04</div>
        <div class="agenda-content">
          <h3>POV Statement</h3>
          <p>Actionable Point of View for faculty &amp; students.</p>
        </div>
      </div>

      <div class="agenda-card">
        <div class="agenda-num">05</div>
        <div class="agenda-content">
          <h3>Ideation Method</h3>
          <p>Brainstorming &amp; SCAMPER innovation methodology.</p>
        </div>
      </div>

      <div class="agenda-card">
        <div class="agenda-num">06</div>
        <div class="agenda-content">
          <h3>The Solution</h3>
          <p>Live QR placards, 1-tap workspace &amp; notify alerts.</p>
        </div>
      </div>

      <div class="agenda-card">
        <div class="agenda-num">07</div>
        <div class="agenda-content">
          <h3>Our Innovation</h3>
          <p>Desirability, technical feasibility, and institutional viability.</p>
        </div>
      </div>

      <div class="agenda-card">
        <div class="agenda-num">08</div>
        <div class="agenda-content">
          <h3>Design for Environment</h3>
          <p>Sustainable campus infrastructure aligned with UN SDGs.</p>
        </div>
      </div>

      <div class="agenda-card">
        <div class="agenda-num">09</div>
        <div class="agenda-content">
          <h3>Mentor Interactions</h3>
          <p>Actionable guidance from Mrs. Prasanna Pabba.</p>
        </div>
      </div>

      <div class="agenda-card">
        <div class="agenda-num">10</div>
        <div class="agenda-content">
          <h3>Team Experiences</h3>
          <p>Course Outcomes (CO-1 to CO-4) &amp; member roles.</p>
        </div>
      </div>

      <div class="agenda-card">
        <div class="agenda-num">11</div>
        <div class="agenda-content">
          <h3>Conclusion &amp; Scope</h3>
          <p>Deployment roadmap for multi-block campus integration.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 03 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 4: Problem Statement
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">01 · Empathize &amp; Discover</span>
        <h2 class="slide-title">Problem Statement</h2>
        <p class="slide-subtitle">The hidden cost of campus transit and physical availability blindness</p>
      </div>
    </div>

    <div class="problem-grid">
      <div class="problem-box">
        <div class="badge badge-purple" style="margin-bottom: 16px;">Context &amp; Background</div>
        <h3 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 14px;">The Campus Scale Challenge</h3>
        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 16px;">
          Across multi-acre engineering institutions like <strong>VNR VJIET</strong>, faculty members frequently move between lecture halls, laboratory sessions, department evaluation meetings, administrative offices, and research centers.
        </p>
        <p style="font-size: 16px; color: #475569; line-height: 1.6;">
          Students seeking urgent doubt clarification, project reviews, or recommendation signatures routinely walk across Academic Blocks 1, 2, and 3 only to find locked cabins or empty desks.
        </p>
      </div>

      <div class="problem-box" style="background: #f8fafc; border-color: #cbd5e1;">
        <div class="badge badge-amber" style="margin-bottom: 16px;">Field Observation</div>
        <h3 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 14px;">The Static Placard Breakdown</h3>
        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 16px;">
          Traditional door signboards are <strong>completely static</strong>. Even printed paper timetables become inaccurate immediately due to impromptu meetings, lab substitutions, or short corridor discussions.
        </p>
        <div style="background: #ffffff; border-radius: 16px; padding: 18px 24px; border: 1px solid #e2e8f0; margin-top: 20px;">
          <p style="font-size: 15px; font-weight: 700; color: #b45309;">
            ⚠️ Core Consequence: Over 40% of student cabin visits end in wasted trips, while faculty experience unplanned drop-in interruptions during grading and research hours.
          </p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 04 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 5: Key Problems & How Might We
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">01 · Define Phase</span>
        <h2 class="slide-title">Problem Statement: Core Friction Points</h2>
        <p class="slide-subtitle">Synthesizing institutional bottlenecks into a clear design challenge</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
      <div class="card">
        <div style="font-size: 28px; margin-bottom: 10px;">👁️</div>
        <h4 style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">Zero Desk Visibility</h4>
        <p style="font-size: 14px; color: #64748b; line-height: 1.5;">Physical presence at desk is unknown until the student physically climbs multiple floors and knocks.</p>
      </div>

      <div class="card">
        <div style="font-size: 28px; margin-bottom: 10px;">⏳</div>
        <h4 style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">Wasted Time &amp; Energy</h4>
        <p style="font-size: 14px; color: #64748b; line-height: 1.5;">Students waste 15-25 minutes between lectures trekking to cabins, causing frustration and crowded corridors.</p>
      </div>

      <div class="card">
        <div style="font-size: 28px; margin-bottom: 10px;">📅</div>
        <h4 style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">Scheduling Chaos</h4>
        <p style="font-size: 14px; color: #64748b; line-height: 1.5;">Ad-hoc knocking disrupts faculty grading; booking appointments currently requires slow email threads.</p>
      </div>

      <div class="card">
        <div style="font-size: 28px; margin-bottom: 10px;">📴</div>
        <h4 style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">No Passive Feedback</h4>
        <p style="font-size: 14px; color: #64748b; line-height: 1.5;">When a professor steps away for 10 minutes, students have no way to get alerted when they return.</p>
      </div>
    </div>

    <div class="hmw-card">
      <h3>Design Challenge — How Might We...</h3>
      <p>
        "How might we provide students with glanceable, real-time awareness of faculty availability and effortless consultation booking right at the cabin door, while empowering professors with a 1-tap, non-intrusive status management tool?"
      </p>
    </div>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 05 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 6: Research Approach & Empathy Map
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">02 · Empathize Phase</span>
        <h2 class="slide-title">Research Approach &amp; Empathy Map</h2>
        <p class="slide-subtitle">Field interviews across CSE &amp; IT departments (Cabins 127, 201, 031)</p>
      </div>
      <div class="vnr-badge">
        <div class="vnr-badge-text">
          <div class="vnr-badge-title">Qualitative Research</div>
          <div class="vnr-badge-sub">Students &amp; Faculty</div>
        </div>
      </div>
    </div>

    <div class="empathy-quadrants">
      <div class="quadrant-box says">
        <div class="quadrant-title">🗣️ What Users SAY</div>
        <ul>
          <li><strong>Student:</strong> "I climbed to 2nd floor B-Block three times today, but sir was in an evaluation."</li>
          <li><strong>Professor:</strong> "I step away for 10 minutes to submit a report, and return to find students left."</li>
          <li><strong>Student:</strong> "I don't know whether to wait outside the door or go back to class."</li>
        </ul>
      </div>

      <div class="quadrant-box thinks">
        <div class="quadrant-title">🧠 What Users THINK</div>
        <ul>
          <li>"Is ma'am actually absent today or just in a quick 5-minute meeting?"</li>
          <li>"If I knock now, am I disturbing an important project review?"</li>
          <li>"I wish there was a live status screen right beside their nameplate."</li>
        </ul>
      </div>

      <div class="quadrant-box does">
        <div class="quadrant-title">🚶 What Users DO</div>
        <ul>
          <li>Walk back and forth repeatedly between campus buildings during class breaks.</li>
          <li>Hover awkwardly outside faculty room glass doors trying to peer inside.</li>
          <li>Send repetitive WhatsApp messages or emails asking "Sir are you in cabin?"</li>
        </ul>
      </div>

      <div class="quadrant-box feels">
        <div class="quadrant-title">❤️ What Users FEEL</div>
        <ul>
          <li><strong>Frustrated:</strong> Wasting valuable free study periods searching for teachers.</li>
          <li><strong>Hesitant:</strong> Anxious about knocking on the wrong cabin door during busy hours.</li>
          <li><strong>Overwhelmed:</strong> Faculty feeling interrupted when focusing on paper evaluation.</li>
        </ul>
      </div>
    </div>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 06 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 7: Defining Insights: User Needs
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">03 · Define Phase</span>
        <h2 class="slide-title">Defining Insights: User Needs Matrix</h2>
        <p class="slide-subtitle">Transforming user empathy into prioritized engineering requirements</p>
      </div>
    </div>

    <table class="styled-table">
      <thead>
        <tr>
          <th style="width: 18%;">Need Type</th>
          <th style="width: 42%;">Identified Campus Need</th>
          <th style="width: 40%;">Find My Professor Feature Response</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="badge badge-purple">Primary</span></td>
          <td><strong>Instant Live Desk Availability:</strong> Students need to verify whether a professor is in office before walking across campus blocks.</td>
          <td><strong>Persistent QR Door Placard &amp; Live Directory:</strong> Instant scan with smartphone camera reveals live status with zero app installation.</td>
        </tr>
        <tr>
          <td><span class="badge badge-purple">Primary</span></td>
          <td><strong>Expected Return Estimates:</strong> Knowing when a stepped-away professor will be back so students can plan their study schedule.</td>
          <td><strong>Return Time Target Countdown:</strong> Professor sets "+15m", "+30m", or exact return time with optional note (e.g., "In Lab 3").</td>
        </tr>
        <tr>
          <td><span class="badge badge-green">Secondary</span></td>
          <td><strong>Organized Consultations:</strong> Booking formal 15-30 min doubt slots without back-and-forth emails or double-booking.</td>
          <td><strong>1-Click Consultation Request:</strong> Automatic conflict check preventing overlap; instant professor accept/decline dashboard.</td>
        </tr>
        <tr>
          <td><span class="badge badge-green">Secondary</span></td>
          <td><strong>Glanceable Office Hours:</strong> Routine availability posted clearly without paper printouts that fade or tear.</td>
          <td><strong>Digital Weekly Office Hours:</strong> Formatted daily schedule with next upcoming availability badge.</td>
        </tr>
        <tr>
          <td><span class="badge badge-amber">Latent</span></td>
          <td><strong>Passive Real-Time Awareness:</strong> Relieving students from constantly polling or refreshing their screens.</td>
          <td><strong>"Notify When Available" Subscriber Bell:</strong> Instant push notification / toast alert sent the moment faculty marks "Available".</td>
        </tr>
      </tbody>
    </table>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 07 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 8: Point of View (POV) Statement
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">04 · Define Phase</span>
        <h2 class="slide-title">Point of View (POV) Statement</h2>
        <p class="slide-subtitle">Framing the core design challenge through User, Need, and Insight</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 36px;">
      <div class="card" style="border-top: 6px solid #7c3aed;">
        <span class="badge badge-purple" style="margin-bottom: 12px;">User Profile</span>
        <h3 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">The Academic Community</h3>
        <p style="font-size: 15px; color: #64748b; line-height: 1.6;">
          Undergraduate students seeking guidance and faculty members balancing lectures, research, and consultations across large campus blocks.
        </p>
      </div>

      <div class="card" style="border-top: 6px solid #d97706;">
        <span class="badge badge-amber" style="margin-bottom: 12px;">Specific Need</span>
        <h3 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Zero-Friction Truth</h3>
        <p style="font-size: 15px; color: #64748b; line-height: 1.6;">
          Immediate visibility into real-time physical desk availability and a direct, respectful way to schedule micro-consultations right at the cabin door.
        </p>
      </div>

      <div class="card" style="border-top: 6px solid #10b981;">
        <span class="badge badge-green" style="margin-bottom: 12px;">Deep Insight</span>
        <h3 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Physical-Digital Gap</h3>
        <p style="font-size: 15px; color: #64748b; line-height: 1.6;">
          Physical door signs are completely disconnected from live schedules, while existing ERP apps are too slow and cumbersome for quick 2-minute status updates.
        </p>
      </div>
    </div>

    <div class="hmw-card" style="background: linear-gradient(135deg, #2e1065 0%, #4c1d95 100%);">
      <h3 style="color: #fbbf24;">Actionable POV Statement</h3>
      <p style="font-size: 24px; line-height: 1.5;">
        "College students seeking academic guidance need a glanceable, instant way to verify faculty availability and request consultations at the door because physical absence is currently invisible until arrived, causing wasted transit time and disruptive interruptions for busy professors."
      </p>
    </div>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 08 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 9: Ideation Method (Brainstorming & SCAMPER)
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">05 · Ideate Phase</span>
        <h2 class="slide-title">Ideation Method: Brainstorming &amp; SCAMPER</h2>
        <p class="slide-subtitle">Systematically exploring alternatives and landing on the optimal solution</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 30px; margin-bottom: 24px;">
      <div class="card card-purple" style="padding: 28px;">
        <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 14px; color: #fbbf24;">Brainstorming Ideas Evaluated</h3>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 14px;">
          <li>❌ <strong>Biometric/RFID door sensors:</strong> Expensive hardware &amp; privacy concerns.</li>
          <li>❌ <strong>Timetable auto-tracking:</strong> Impromptu corridor talks make it inaccurate.</li>
          <li>❌ <strong>NFC chips on doors:</strong> Incompatible with older student phones.</li>
          <li>✅ <strong>Durable QR Door Placards + Real-time Web App:</strong> Zero hardware cost, universal camera compatibility, sub-second sync.</li>
        </ul>
      </div>

      <div class="card" style="padding: 28px;">
        <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 14px;">The SCAMPER Innovation Framework</h3>
        <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
          We applied the SCAMPER creative thinking tool to take traditional door nameplates and radically elevate them into intelligent communication hubs.
        </p>
      </div>
    </div>

    <div class="scamper-grid">
      <div class="scamper-item">
        <div class="scamper-letter">S</div>
        <div class="scamper-word">Substitute</div>
        <div class="scamper-desc">Replace static printed door timetables with cloud-linked dynamic QR placards.</div>
      </div>

      <div class="scamper-item">
        <div class="scamper-letter">C</div>
        <div class="scamper-word">Combine</div>
        <div class="scamper-desc">Combine physical door placarding with automatic real-time push alerts.</div>
      </div>

      <div class="scamper-item">
        <div class="scamper-letter">A</div>
        <div class="scamper-word">Adapt</div>
        <div class="scamper-desc">Adapt real-time flight departure boards for university faculty offices.</div>
      </div>

      <div class="scamper-item">
        <div class="scamper-letter">M</div>
        <div class="scamper-word">Modify</div>
        <div class="scamper-desc">Modify appointment scheduling into quick 30-min conflict-checked slots.</div>
      </div>

      <div class="scamper-item">
        <div class="scamper-letter">P</div>
        <div class="scamper-word">Put to Use</div>
        <div class="scamper-desc">Use placards as emergency notices and weekly office hour guidelines.</div>
      </div>

      <div class="scamper-item">
        <div class="scamper-letter">E</div>
        <div class="scamper-word">Eliminate</div>
        <div class="scamper-desc">Eliminate wasted multi-floor campus trips and disruptive cabin knocking.</div>
      </div>

      <div class="scamper-item">
        <div class="scamper-letter">R</div>
        <div class="scamper-word">Rearrange</div>
        <div class="scamper-desc">Invert booking: students scan and request; faculty approves in 1 tap.</div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 09 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 10: The Solution
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">06 · Solution Overview</span>
        <h2 class="slide-title">The Solution: Find My Professor</h2>
        <p class="slide-subtitle">A unified, real-time campus availability &amp; scheduling ecosystem</p>
      </div>
      <div class="vnr-badge">
        <div class="vnr-badge-text">
          <div class="vnr-badge-title">Full-Stack Solution</div>
          <div class="vnr-badge-sub">Live at VNR VJIET</div>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 36px; align-items: center;">
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="card card-purple" style="padding: 28px;">
          <h3 style="font-size: 22px; font-weight: 800; color: #fbbf24; margin-bottom: 10px;">Core Vision</h3>
          <p style="font-size: 15px; line-height: 1.6; color: #e2e8f0;">
            A frictionless campus bridge that connects physical faculty office doors to students' smartphones in sub-second latency, eliminating wasted foot travel and empowering academic productivity.
          </p>
        </div>

        <div class="card" style="padding: 24px;">
          <h4 style="font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Key Differentiator</h4>
          <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
            <strong>Zero App Store Friction:</strong> Works directly in standard mobile Safari &amp; Chrome via camera scan. Real-time updates push via Server-Sent Events (SSE) with no manual page refreshing needed.
          </p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div class="card" style="padding: 20px 24px; border-left: 5px solid #7c3aed;">
          <h4 style="font-size: 16px; font-weight: 800; color: #0f172a;">1. Permanent QR Placards</h4>
          <p style="font-size: 13.5px; color: #64748b; margin-top: 2px;">Durable QR codes pasted outside cabin doors. Never need reprinting when timetables change.</p>
        </div>

        <div class="card" style="padding: 20px 24px; border-left: 5px solid #10b981;">
          <h4 style="font-size: 16px; font-weight: 800; color: #0f172a;">2. 1-Tap Faculty Workspace</h4>
          <p style="font-size: 13.5px; color: #64748b; margin-top: 2px;">Professors toggle status (Available, In Class, In Meeting, Stepped Away) with return time in 3 seconds.</p>
        </div>

        <div class="card" style="padding: 20px 24px; border-left: 5px solid #f59e0b;">
          <h4 style="font-size: 16px; font-weight: 800; color: #0f172a;">3. "Notify When Available" Subscriber Alerts</h4>
          <p style="font-size: 13.5px; color: #64748b; margin-top: 2px;">Students favorite teachers and receive instant live notifications the moment they return to office.</p>
        </div>

        <div class="card" style="padding: 20px 24px; border-left: 5px solid #3b82f6;">
          <h4 style="font-size: 16px; font-weight: 800; color: #0f172a;">4. Conflict-Checked Micro-Consultations</h4>
          <p style="font-size: 13.5px; color: #64748b; margin-top: 2px;">Students book 30-minute consultation slots; professors accept or decline with 1 click.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 10 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 11: Prototype & Workflow (With Actual UI Snips)
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">06 · Prototype Phase</span>
        <h2 class="slide-title">Prototype &amp; End-to-End Workflow</h2>
        <p class="slide-subtitle">Live interactive product demonstration and user touchpoints</p>
      </div>
      <div class="vnr-badge">
        <div class="vnr-badge-text">
          <div class="vnr-badge-title">Working System</div>
          <div class="vnr-badge-sub">React 19 &amp; Node</div>
        </div>
      </div>
    </div>

    <div class="prototype-container">
      <div class="workflow-steps">
        <div class="workflow-step">
          <div class="step-number">01</div>
          <div class="step-content">
            <h4>Scan Door Placard or Search Directory</h4>
            <p>Student uses phone camera at cabin door (e.g. Room 127) or browses the campus directory.</p>
          </div>
        </div>

        <div class="workflow-step">
          <div class="step-number">02</div>
          <div class="step-content">
            <h4>View Real-Time Availability &amp; Hours</h4>
            <p>Live status card renders with color badges, return countdown, and weekly office hours.</p>
          </div>
        </div>

        <div class="workflow-step">
          <div class="step-number">03</div>
          <div class="step-content">
            <h4>Tap "Notify When Available"</h4>
            <p>If teacher is away, student enables the bell toggle to subscribe to live arrival alerts.</p>
          </div>
        </div>

        <div class="workflow-step">
          <div class="step-number">04</div>
          <div class="step-content">
            <h4>Request Consultation Slot</h4>
            <p>Student selects time window and reason; system verifies no overlapping meetings exist.</p>
          </div>
        </div>

        <div class="workflow-step">
          <div class="step-number">05</div>
          <div class="step-content">
            <h4>Instant SSE Synchronization</h4>
            <p>Professor workspace receives instant alert; changes propagate to student screen in sub-second.</p>
          </div>
        </div>
      </div>

      <div class="prototype-mockups">
        <div class="mockup-frame" style="width: 250px;">
          <img src="${productMobilePlacard}" alt="Mobile Placard Screen">
        </div>
        <div class="mockup-frame" style="width: 380px;">
          <img src="${productWorkspace}" alt="Professor Workspace Screen">
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 11 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 12: Technical Feasibility & System Architecture
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">07 · Technical Implementation</span>
        <h2 class="slide-title">Technical Feasibility &amp; Architecture</h2>
        <p class="slide-subtitle">Engineered for lightweight high-throughput campus execution</p>
      </div>
      <div class="vnr-badge">
        <div class="vnr-badge-text">
          <div class="vnr-badge-title">Enterprise Stack</div>
          <div class="vnr-badge-sub">PostgreSQL &amp; TypeScript</div>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 36px;">
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="card" style="padding: 26px;">
          <h4 style="font-size: 18px; font-weight: 800; color: #7c3aed; margin-bottom: 14px;">Technology Stack</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 14px;">
            <div style="background: #f8fafc; padding: 12px 16px; border-radius: 12px;">
              <strong>Frontend UI:</strong> React 19, Vite, Tailwind CSS v4, Lucide Icons
            </div>
            <div style="background: #f8fafc; padding: 12px 16px; border-radius: 12px;">
              <strong>Backend Service:</strong> Express.js, TypeScript, Server-Sent Events (SSE)
            </div>
            <div style="background: #f8fafc; padding: 12px 16px; border-radius: 12px;">
              <strong>Database:</strong> PostgreSQL, Prisma ORM, JSONB audit logging
            </div>
            <div style="background: #f8fafc; padding: 12px 16px; border-radius: 12px;">
              <strong>QR &amp; Vision:</strong> HTML5-QRCode, Canvas 2D Placard Generator
            </div>
          </div>
        </div>

        <div class="card card-purple" style="padding: 26px;">
          <h4 style="font-size: 18px; font-weight: 800; color: #fbbf24; margin-bottom: 10px;">Reactive Real-Time Architecture</h4>
          <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0;">
            Rather than battery-draining client polling, a lightweight SSE stream (<code>/api/v1/events</code>) maintains an open connection. On state changes, the server broadcasts an event that prompts connected mobile clients to refetch authorized data in sub-second latency.
          </p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="card" style="padding: 26px; border-top: 5px solid #10b981;">
          <h4 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Mobile Network Resilience</h4>
          <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
            Mobile browsers frequently sleep SSE connections when screens lock. Our custom <code>LiveSync</code> engine listens to <code>visibilitychange</code> and network events, automatically re-syncing within 100ms the instant the student turns on their phone.
          </p>
        </div>

        <div class="card" style="padding: 26px; border-top: 5px solid #f59e0b;">
          <h4 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">System Limitations &amp; Mitigation</h4>
          <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
            <strong>Limitation:</strong> Self-reported availability requires faculty participation.<br>
            <strong>Mitigation:</strong> Configurable TTL (Time-To-Live). If a status expires without confirmation, it automatically displays as "Stale/Unconfirmed" to prevent misleading students.
          </p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 12 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 13: Innovation: Desirability, Feasibility, Viability
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">07 · Innovation Analysis</span>
        <h2 class="slide-title">Innovation: Desirability, Feasibility &amp; Viability</h2>
        <p class="slide-subtitle">Assessing practical sustainability and campus-wide institutional viability</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-bottom: 30px;">
      <div class="card" style="border-top: 6px solid #3b82f6;">
        <span class="badge" style="background: #dbeafe; color: #1d4ed8; margin-bottom: 12px;">Desirability</span>
        <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 10px;">Human Adoption</h3>
        <p style="font-size: 14.5px; color: #64748b; line-height: 1.6;">
          Students already carry smartphones and instinctively scan QR codes daily. For faculty, a 1-tap mobile toggle respects their autonomy and takes less than 3 seconds—eliminating complex bureaucratic overhead.
        </p>
      </div>

      <div class="card" style="border-top: 6px solid #8b5cf6;">
        <span class="badge" style="background: #ede9fe; color: #6d28d9; margin-bottom: 12px;">Feasibility</span>
        <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 10px;">Engineering Viability</h3>
        <p style="font-size: 14.5px; color: #64748b; line-height: 1.6;">
          Built entirely on modern, robust web standards (React 19, TypeScript, PostgreSQL, SSE). Zero hardware dependencies: uses standard laminated QR placards outside faculty rooms with zero maintenance.
        </p>
      </div>

      <div class="card" style="border-top: 6px solid #10b981;">
        <span class="badge" style="background: #dcfce7; color: #15803d; margin-bottom: 12px;">Viability</span>
        <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 10px;">Institutional Value</h3>
        <p style="font-size: 14.5px; color: #64748b; line-height: 1.6;">
          Can scale across all 15+ engineering departments of VNR VJIET at near-zero incremental cost. Can be hosted on internal college servers or lightweight cloud tiers with negligible bandwidth consumption.
        </p>
      </div>
    </div>

    <div class="card card-purple" style="padding: 30px;">
      <h4 style="font-size: 16px; text-transform: uppercase; letter-spacing: 1.5px; color: #fbbf24; margin-bottom: 8px;">Innovation Statement</h4>
      <p style="font-size: 22px; font-weight: 600; line-height: 1.45;">
        "Where Is My Professor transforms passive campus doors into interactive, real-time communication portals, bridging the physical-digital divide in higher education through zero-cost QR infrastructure and instantaneous live event streams."
      </p>
    </div>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 13 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 14: Design for Environment & SDGs
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">08 · Sustainability</span>
        <h2 class="slide-title">Design for Environment and SDGs</h2>
        <p class="slide-subtitle">Contributing to institutional sustainability and United Nations Sustainable Development Goals</p>
      </div>
      <div class="vnr-badge">
        <div class="vnr-badge-text">
          <div class="vnr-badge-title">UN SDGs</div>
          <div class="vnr-badge-sub">3 Core Alignments</div>
        </div>
      </div>
    </div>

    <div class="sdg-grid">
      <div class="sdg-card sdg-4">
        <div>
          <div class="sdg-number">04</div>
          <div class="sdg-title">Quality Education</div>
        </div>
        <p class="sdg-desc">
          <strong>Target 4.4 &amp; 4.7:</strong> Maximizes direct faculty-student mentorship efficiency. Removes scheduling barriers for doubts, final-year project guidance, and research discussions, dramatically enhancing academic productivity.
        </p>
      </div>

      <div class="sdg-card sdg-9">
        <div>
          <div class="sdg-number">09</div>
          <div class="sdg-title">Industry, Innovation &amp; Infrastructure</div>
        </div>
        <p class="sdg-desc">
          <strong>Target 9.4:</strong> Upgrades traditional university infrastructure into a smart, digital campus ecosystem using lightweight web technologies and cloud databases rather than expensive proprietary hardware.
        </p>
      </div>

      <div class="sdg-card sdg-11">
        <div>
          <div class="sdg-number">11</div>
          <div class="sdg-title">Sustainable Cities &amp; Communities</div>
        </div>
        <p class="sdg-desc">
          <strong>Target 11.6:</strong> Reduces wasted inter-building foot transit and elevator electricity consumption across multi-story blocks. Completely eliminates recurring paper reprinting for notices and door schedules.
        </p>
      </div>
    </div>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 14 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 15: Mentor Interactions
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">09 · Feedback &amp; Iteration</span>
        <h2 class="slide-title">Mentor Interactions &amp; Refinements</h2>
        <p class="slide-subtitle">Guidance and evolutionary feedback from Mrs. Prasanna Pabba (Assistant Professor, CSE)</p>
      </div>
    </div>

    <table class="styled-table" style="margin-top: 10px;">
      <thead>
        <tr>
          <th style="width: 14%;">Stage</th>
          <th style="width: 22%;">Focus Area</th>
          <th style="width: 32%;">Mentor's Guidance &amp; Suggestions</th>
          <th style="width: 32%;">Action Taken by Engineering Team</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="badge badge-purple">Iteration 1</span></td>
          <td><strong>Initial Problem Definition</strong></td>
          <td>"Do not build an intrusive tracking tool. Faculty will resist any system that attempts automated location surveillance or complex check-in routines."</td>
          <td>Pivoted strictly to an <strong>autonomous, self-reported 1-tap workspace</strong> with automated expiration TTLs that respect faculty dignity and privacy.</td>
        </tr>
        <tr>
          <td><span class="badge badge-amber">Iteration 2</span></td>
          <td><strong>Physical Door Experience</strong></td>
          <td>"Students who scan the door still need to know general weekly availability when a teacher is stepped away for class."</td>
          <td>Integrated <strong>weekly recurring consultation hours</strong> directly into the placard card with automated day-of-week highlighting.</td>
        </tr>
        <tr>
          <td><span class="badge badge-green">Iteration 3</span></td>
          <td><strong>Passive Real-Time Alerts</strong></td>
          <td>"Students waiting outside shouldn't have to keep refreshing their phones. Make the system proactive."</td>
          <td>Engineered the <strong>"Notify When Available"</strong> subscriber pipeline and real-time floating toast alerts powered by Server-Sent Events.</td>
        </tr>
      </tbody>
    </table>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 15 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 16: Team Experiences and Learnings
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">10 · Reflection &amp; Outcomes</span>
        <h2 class="slide-title">Team Experiences and Learnings</h2>
        <p class="slide-subtitle">Course Outcomes (COs) and collaborative Design Thinking growth</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 36px;">
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div class="card" style="padding: 22px;">
          <div class="badge badge-purple" style="margin-bottom: 8px;">CO-1 · Engineering Problem Definition</div>
          <p style="font-size: 14px; color: #334155; line-height: 1.5;">Applied the 5 phases of Design Thinking (Empathize, Define, Ideate, Prototype, Test) to solve real-world campus inefficiency.</p>
        </div>

        <div class="card" style="padding: 22px;">
          <div class="badge badge-green" style="margin-bottom: 8px;">CO-2 · Human-Centered Sustainability</div>
          <p style="font-size: 14px; color: #334155; line-height: 1.5;">Connected user empathy with UN Sustainable Development Goals (SDG 4, 9, 11), saving paper and student transit energy.</p>
        </div>

        <div class="card" style="padding: 22px;">
          <div class="badge badge-amber" style="margin-bottom: 8px;">CO-3 · Rapid Interactive Prototyping</div>
          <p style="font-size: 14px; color: #334155; line-height: 1.5;">Designed, coded, and iterated a production-grade full-stack web application with responsive mobile camera scanning.</p>
        </div>

        <div class="card" style="padding: 22px;">
          <div class="badge badge-purple" style="margin-bottom: 8px;">CO-4 · Real-World Engineering Deployment</div>
          <p style="font-size: 14px; color: #334155; line-height: 1.5;">Successfully deployed to cloud infrastructure with managed PostgreSQL, automated migrations, and seed pipelines.</p>
        </div>
      </div>

      <div class="card card-purple" style="padding: 30px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h3 style="font-size: 22px; font-weight: 800; color: #fbbf24; margin-bottom: 14px;">Key Team Takeaway</h3>
          <p style="font-size: 15px; line-height: 1.6; color: #e2e8f0;">
            "The greatest lesson from the CPDT Design Thinking curriculum was that engineering solutions succeed not because of algorithm complexity, but because of how deeply they respect human habits. By eliminating the barrier of installing apps and keeping faculty updates to 1 tap, we turned a perennial campus frustration into a joyful, effortless interaction."
          </p>
        </div>

        <div style="background: rgba(255,255,255,0.1); padding: 16px 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.15);">
          <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #fbbf24;">CPDT Design Thinking Lab</div>
          <div style="font-size: 13px; color: #ffffff; margin-top: 2px;">VNR Vignana Jyothi Institute of Engineering &amp; Technology</div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 16 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 17: Conclusion & Future Scope
       ========================================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-header-left">
        <span class="slide-category">11 · Outlook</span>
        <h2 class="slide-title">Conclusion &amp; Future Scope</h2>
        <p class="slide-subtitle">Scalable roadmap for institution-wide deployment across VNR VJIET</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 36px; margin-bottom: 24px;">
      <div class="card card-purple" style="padding: 32px;">
        <h3 style="font-size: 24px; font-weight: 800; color: #fbbf24; margin-bottom: 14px;">Project Conclusion</h3>
        <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0; margin-bottom: 16px;">
          Find My Professor demonstrates how lightweight, modern web software can transform everyday physical architecture into dynamic, connected systems.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
          The system is fully functional, verified with automated end-to-end tests, supports 23 faculty accounts across 5 engineering branches, and is ready for departmental corridor rollout.
        </p>
      </div>

      <div class="card" style="padding: 32px;">
        <h3 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 14px;">Future Expansion Scope</h3>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px; font-size: 14.5px; color: #475569;">
          <li>📍 <strong>Indoor Campus Navigation:</strong> Integrating interactive route maps guiding students from entrance gates directly to Room 127/201.</li>
          <li>📟 <strong>Low-Power E-Ink Cabin Displays:</strong> Battery-powered electronic door placards that sync status over Bluetooth/Wi-Fi automatically.</li>
          <li>📱 <strong>WhatsApp / Telegram Notification Bot:</strong> Direct push alerts to students' messaging apps when favorited faculty returns.</li>
          <li>🔗 <strong>Official ERP (Automation4U) Integration:</strong> Auto-populating verified class schedules and semester examination duties.</li>
        </ul>
      </div>
    </div>

    <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 18px; padding: 20px 30px; text-align: center;">
      <p style="font-size: 18px; font-weight: 700; color: #b45309;">
        "We don't replace personal faculty-student mentorship; we remove the friction that stands in its way."
      </p>
    </div>

    <div class="slide-footer">
      <span>Find My Professor · VNR VJIET</span>
      <span>Slide 17 / 18</span>
    </div>
  </div>


  <!-- ==========================================
       SLIDE 18: Thank You
       ========================================== -->
  <div class="slide title-slide" style="text-align: center; align-items: center; justify-content: center;">
    <div style="max-width: 900px;">
      <div class="title-tag" style="margin-bottom: 20px;">VNR VJIET · CPDT 2026</div>
      <h1 class="main-heading" style="font-size: 84px; margin-bottom: 16px;">Thank You!</h1>
      <p style="font-size: 24px; color: #e2e8f0; font-weight: 400; margin-bottom: 40px;">
        Open for Questions, Demonstration &amp; Feedback
      </p>

      <div style="display: inline-flex; flex-direction: column; gap: 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 24px 40px; border-radius: 20px;">
        <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #fbbf24; font-weight: 800;">Project Mentor</div>
        <div style="font-size: 20px; font-weight: 800; color: #ffffff;">Mrs. Prasanna Pabba</div>
        <div style="font-size: 14px; color: #cbd5e1;">Assistant Professor, Department of Computer Science &amp; Engineering · VNR VJIET</div>
      </div>
    </div>

    <div class="slide-footer" style="border-top-color: rgba(255,255,255,0.15); color: #94a3b8;">
      <span>Find My Professor · Design Thinking Project Presentation</span>
      <span>VNR VJIET · 2026</span>
    </div>
  </div>

</body>
</html>
`;

// Write the presentation HTML
const htmlPath = path.join(root, 'scripts/presentation_deck.html');
fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('Saved presentation HTML to scripts/presentation_deck.html');

// Render to PDF using Playwright + Edge
console.log('Rendering high-resolution 16:9 PDF with Playwright...');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();

await page.goto('file:///' + htmlPath.replace(/\\\\/g, '/'), { waitUntil: 'networkidle' });
await page.waitForTimeout(2000); // Allow Google Fonts to render

await page.pdf({
  path: outputPdf,
  width: '1920px',
  height: '1080px',
  printBackground: true,
  preferCSSPageSize: true,
});

console.log('PDF generated successfully at:', outputPdf);

// Also copy to brain artifacts directory for direct user download
const artifactPdf = 'C:/Users/saiko/.gemini/antigravity-ide/brain/3a84fc56-7bbb-4089-af83-6586facec08c/Find_My_Professor_Design_Thinking_VNRVJIET.pdf';
fs.copyFileSync(outputPdf, artifactPdf);
console.log('Copied PDF to artifacts:', artifactPdf);

await browser.close();
