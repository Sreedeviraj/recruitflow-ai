// RecruitFlow AI — Frontend Application
// Powered by OpenAI GPT-4o · 6 Agents

const API_BASE = '/api';

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
const state = {
  currentTab: 'rank',
  isRanking: false,
  uploadedFiles: [],
  pasteAreas: 1,
  currentResults: null,
  historyLoaded: false,
  analyticsLoaded: false
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const $ = id => document.getElementById(id);
const scoreColor = score => score >= 80 ? 'score-green' : score >= 60 ? 'score-amber' : 'score-red';
const recClass = rec => {
  if (rec === 'Strongly Recommended') return 'rec-strong';
  if (rec === 'Recommended') return 'rec-recommended';
  if (rec === 'Consider') return 'rec-consider';
  return 'rec-not';
};
const rankClass = rank => rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
const fmtDate = iso => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────
function switchTab(tab) {
  state.currentTab = tab;
  document.querySelectorAll('.nav-pill').forEach(p => p.classList.toggle('active', p.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tab}`));
  if (tab === 'history' && !state.historyLoaded) loadHistory();
  if (tab === 'analytics' && !state.analyticsLoaded) loadAnalytics();
}

// ─────────────────────────────────────────────
// AGENT PIPELINE VISUALIZER
// ─────────────────────────────────────────────
const AGENT_IDS = ['agent-orchestrator', 'agent-parser', 'agent-analyzer', 'agent-scorer', 'agent-ranker', 'agent-db'];

function resetPipeline() {
  AGENT_IDS.forEach(id => {
    const el = $(id);
    if (el) { el.classList.remove('active', 'done'); }
  });
}

function animatePipeline() {
  resetPipeline();
  const delays = [0, 2000, 4000, 6000, 9000, 11000];
  const doneTimes = [1800, 3800, 5800, 8800, 10800, 13000];

  AGENT_IDS.forEach((id, i) => {
    setTimeout(() => {
      const el = $(id);
      if (el) el.classList.add('active');
    }, delays[i]);
    setTimeout(() => {
      const el = $(id);
      if (el) { el.classList.remove('active'); el.classList.add('done'); }
    }, doneTimes[i]);
  });
}

// ─────────────────────────────────────────────
// FILE UPLOAD
// ─────────────────────────────────────────────
function setupUploadZone() {
  const zone = $('upload-zone');
  const input = $('file-input');

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });
  input.addEventListener('change', e => handleFiles(e.target.files));
}

function handleFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.name.match(/\.(txt|pdf|doc|docx)$/i)) {
      alert(`Unsupported file: ${file.name}. Use TXT, PDF, DOC, or DOCX.`);
      return;
    }
    if (!state.uploadedFiles.find(f => f.name === file.name)) {
      state.uploadedFiles.push(file);
    }
  });
  renderFileList();
}

function renderFileList() {
  const list = $('file-list');
  if (state.uploadedFiles.length === 0) { list.innerHTML = ''; return; }
  list.innerHTML = state.uploadedFiles.map((f, i) => `
    <div class="file-item">
      <span class="file-item-name">📄 ${f.name}</span>
      <button class="file-remove" onclick="removeFile(${i})">✕</button>
    </div>
  `).join('');
}

function removeFile(index) {
  state.uploadedFiles.splice(index, 1);
  renderFileList();
}

// ─────────────────────────────────────────────
// PASTE AREAS
// ─────────────────────────────────────────────
function addPasteArea(value = '') {
  state.pasteAreas++;
  const id = `paste-${state.pasteAreas}`;
  const wrap = document.createElement('div');
  wrap.className = 'paste-area-wrap';
  wrap.id = `wrap-${id}`;
  wrap.innerHTML = `
    <textarea class="paste-textarea" id="${id}" placeholder="Paste resume text here..." rows="4">${value}</textarea>
    <button class="paste-remove" onclick="removePasteArea('wrap-${id}')">✕</button>
  `;
  $('paste-areas').appendChild(wrap);
}

function removePasteArea(wrapId) {
  const el = $(wrapId);
  if (el) el.remove();
}

function getPastedResumes() {
  const areas = document.querySelectorAll('.paste-textarea');
  return Array.from(areas).map(a => a.value.trim()).filter(Boolean);
}

// ─────────────────────────────────────────────
// EXAMPLE DATA
// ─────────────────────────────────────────────
function loadExampleJob() {
  $('job-title').value = 'Senior Full Stack Developer';
  $('job-description').value = `We are looking for a Senior Full Stack Developer to join our growing engineering team.

RESPONSIBILITIES:
- Build scalable web applications with React and Node.js
- Design RESTful APIs and microservices
- Manage MongoDB and PostgreSQL databases
- Mentor junior developers, conduct code reviews
- Participate in architecture discussions

REQUIRED QUALIFICATIONS:
- 5+ years full stack development experience
- React.js, Node.js, TypeScript proficiency
- MongoDB, PostgreSQL experience
- Docker, Kubernetes, AWS experience
- Bachelor's in Computer Science or equivalent

PREFERRED QUALIFICATIONS:
- Redis, GraphQL, React Native
- Open source contributions
- Agile/Scrum experience`;
}

function loadExampleResumes() {
  // Clear existing paste areas and start fresh
  $('paste-areas').innerHTML = `
    <div class="paste-area-wrap" id="wrap-paste-1">
      <textarea class="paste-textarea" id="paste-1" placeholder="Paste resume text here..." rows="4"></textarea>
    </div>
  `;
  state.pasteAreas = 1;

  const resumes = [
    `Name: Sarah Chen
Email: sarah.chen@email.com
Phone: +1-555-0101
Experience: 7 years total

Skills: React, Node.js, MongoDB, TypeScript, Docker, AWS, Redis, GraphQL, PostgreSQL, Kubernetes

Work History:
- Senior Full Stack Developer at TechCorp (3 years): Led development of microservices architecture serving 1M+ users
- Full Stack Developer at StartupXYZ (2.5 years): Built React/Node.js applications from scratch
- Junior Developer at WebAgency (1.5 years): Developed client websites and web applications

Education: BS Computer Science, Stanford University, 2016`,

    `Name: James Okafor
Email: james.okafor@gmail.com
Phone: +1-555-0102
Experience: 4 years total

Skills: React, Node.js, MySQL, Docker basics, JavaScript, Vue.js, Python

Work History:
- Full Stack Developer at DigitalSolutions (2 years): Built web applications using React and Node.js
- Junior Developer at CodeFactory (1.5 years): Frontend development with React
- Intern at WebStartup (6 months): Assisted with web development tasks

Education: BS Software Engineering, State University, 2019`,

    `Name: Priya Sharma
Email: priya.sharma@outlook.com
Phone: +1-555-0103
Experience: 1.5 years total

Skills: React basics, Node.js basics, HTML, CSS, MySQL, Git

Work History:
- Junior Developer at LocalTech (1.5 years): Basic web development tasks and maintenance
- Intern at University IT Dept (8 months): IT support and minor development tasks

Education: BS Information Technology, Regional College, 2021`
  ];

  // Fill first area
  $('paste-1').value = resumes[0];

  // Add other areas
  resumes.slice(1).forEach(r => addPasteArea(r));
}

// ─────────────────────────────────────────────
// RANK CANDIDATES
// ─────────────────────────────────────────────
async function rankCandidates() {
  if (state.isRanking) return;

  const jobTitle = $('job-title').value.trim();
  const jobDescription = $('job-description').value.trim();
  const pastedResumes = getPastedResumes();

  if (jobDescription.length < 20) {
    alert('Please enter a job description (at least 20 characters).');
    return;
  }
  if (state.uploadedFiles.length === 0 && pastedResumes.length === 0) {
    alert('Please upload at least one resume or paste resume text.');
    return;
  }

  state.isRanking = true;
  const btn = $('rank-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> GPT-4o Agents Working...';
  $('rank-status').textContent = 'Initializing pipeline...';

  animatePipeline();

  const statusMessages = [
    'Analyzing job description...',
    'Parsing candidate resumes...',
    'Saving to database...',
    'Scoring candidates with GPT-4o...',
    'Ranking candidates...',
    'Saving results...',
    'Finalizing...'
  ];
  let msgIndex = 0;
  const statusInterval = setInterval(() => {
    if (msgIndex < statusMessages.length) {
      $('rank-status').textContent = statusMessages[msgIndex++];
    }
  }, 2000);

  try {
    const formData = new FormData();
    formData.append('jobTitle', jobTitle);
    formData.append('jobDescription', jobDescription);
    state.uploadedFiles.forEach(f => formData.append('resumes', f));
    formData.append('pastedResumes', JSON.stringify(pastedResumes));

    const res = await fetch(`${API_BASE}/rank`, { method: 'POST', body: formData });
    const data = await res.json();

    clearInterval(statusInterval);

    if (!data.success) throw new Error(data.error || 'Ranking failed');

    state.currentResults = data;
    renderResults(data);
    $('rank-status').textContent = `✅ Done! ${data.summary.totalCandidates} candidates ranked in ${data.processingTime}`;

  } catch (err) {
    clearInterval(statusInterval);
    $('rank-status').textContent = `❌ Error: ${err.message}`;
    console.error('Ranking error:', err);
    alert(`Error: ${err.message}`);
  } finally {
    state.isRanking = false;
    btn.disabled = false;
    btn.innerHTML = 'Rank All Candidates';
    resetPipeline();
  }
}

// ─────────────────────────────────────────────
// RENDER RESULTS
// ─────────────────────────────────────────────
function renderResults(data) {
  const { summary, candidates, jobRequirements, jobTitle } = data;
  const section = $('results-section');

  // Summary cards
  $('card-total').textContent = summary.totalCandidates;
  $('card-top').textContent = summary.topScore;
  $('card-avg').textContent = summary.averageScore;
  $('card-rec').textContent = (summary.breakdown.stronglyRecommended || 0) + (summary.breakdown.recommended || 0);

  // Job requirements
  $('req-title').textContent = `${jobTitle || 'Position'} — Extracted Requirements`;
  $('req-required').innerHTML = (jobRequirements.requiredSkills || []).map(s => `<span class="chip chip-amber">${s}</span>`).join('');
  $('req-preferred').innerHTML = (jobRequirements.preferredSkills || []).map(s => `<span class="chip chip-blue">${s}</span>`).join('');
  $('req-meta').textContent = `${jobRequirements.requiredExperienceYears}+ years experience · ${jobRequirements.requiredEducation}`;

  // Candidates list
  const list = $('candidates-list');
  list.innerHTML = candidates.map((c, i) => `
    <div class="candidate-row" onclick="openModal(${i})" style="animation-delay:${i * 0.07}s">
      <div class="rank-badge ${rankClass(c.rank)}">#${c.rank}</div>
      <div class="candidate-info">
        <div class="candidate-name">${escHtml(c.candidateName)}</div>
        <div class="candidate-scores">
          <span class="mini-score">Skills: <span>${c.skillScore}</span></span>
          <span class="mini-score">Exp: <span>${c.experienceScore}</span></span>
          <span class="mini-score">Edu: <span>${c.educationScore}</span></span>
        </div>
      </div>
      <div class="candidate-right">
        <span class="total-score ${scoreColor(c.totalScore)}">${c.totalScore}</span>
        <span class="rec-badge ${recClass(c.recommendation)}">${c.recommendation}</span>
      </div>
    </div>
  `).join('');

  section.classList.remove('hidden');
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─────────────────────────────────────────────
// CANDIDATE MODAL
// ─────────────────────────────────────────────
function openModal(index) {
  const c = state.currentResults?.candidates?.[index];
  if (!c) return;

  $('modal-rank').textContent = `Rank #${c.rank}`;
  $('modal-rec').className = `rec-badge ${recClass(c.recommendation)}`;
  $('modal-rec').textContent = c.recommendation;
  $('modal-name').textContent = c.candidateName;

  $('modal-total').textContent = c.totalScore;
  $('modal-total').className = `score-card-value ${scoreColor(c.totalScore)}`;
  $('modal-skills').textContent = c.skillScore;
  $('modal-exp').textContent = c.experienceScore;
  $('modal-edu').textContent = c.educationScore;

  $('modal-matched').innerHTML = (c.matchedSkills || []).map(s => `<span class="chip chip-green">${escHtml(s)}</span>`).join('') || '<span class="chip chip-gray">None</span>';
  $('modal-missing').innerHTML = (c.missingSkills || []).map(s => `<span class="chip chip-red">${escHtml(s)}</span>`).join('') || '<span class="chip chip-green">None missing!</span>';
  $('modal-summary').textContent = c.aiSummary || 'No assessment available.';
  $('modal-bottom-rec').className = `rec-badge ${recClass(c.recommendation)}`;
  $('modal-bottom-rec').textContent = c.recommendation;

  $('modal-backdrop').classList.add('open');
}

function closeModal() {
  $('modal-backdrop').classList.remove('open');
}

// ─────────────────────────────────────────────
// HISTORY TAB
// ─────────────────────────────────────────────
async function loadHistory() {
  state.historyLoaded = true;
  const container = $('history-list');
  container.innerHTML = `<div class="loading-state"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>`;

  try {
    const res = await fetch(`${API_BASE}/sessions`);
    const data = await res.json();

    if (!data.success || data.sessions.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No ranking sessions yet. Go to the Rank tab to analyze resumes.</p></div>`;
      return;
    }

    container.innerHTML = data.sessions.map(s => `
      <div class="session-card" onclick="loadSessionDetail('${s.sessionId}', this)">
        <div class="session-info">
          <div class="session-title">${escHtml(s.jobTitle)}</div>
          <div class="session-meta">
            <span>🆔 ${s.sessionId}</span>
            <span>👥 ${s.totalCandidates} candidates</span>
            <span>📊 Avg ${s.averageScore}</span>
            <span>🕐 ${fmtDate(s.createdAt)}</span>
          </div>
        </div>
        <div class="session-score">${s.topScore}</div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><p>Error loading sessions: ${err.message}</p></div>`;
  }
}

async function loadSessionDetail(sessionId, cardEl) {
  let detail = $('history-detail');
  if (!detail) {
    detail = document.createElement('div');
    detail.id = 'history-detail';
    detail.className = 'history-detail';
    $('tab-history').appendChild(detail);
  }

  detail.innerHTML = `<div class="loading-state"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>`;
  detail.scrollIntoView({ behavior: 'smooth' });

  try {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const { session, candidates } = data;
    detail.innerHTML = `
      <button class="back-btn" onclick="$('history-detail').innerHTML = ''">← Back to sessions</button>
      <div class="history-detail-title">${escHtml(session.jobTitle)} — Session ${session.sessionId}</div>
      <div class="summary-cards" style="grid-template-columns:repeat(4,1fr);margin-bottom:1rem">
        <div class="summary-card"><div class="summary-card-label">Total</div><div class="summary-card-value">${session.totalCandidates}</div></div>
        <div class="summary-card"><div class="summary-card-label">Top Score</div><div class="summary-card-value">${session.topScore}</div></div>
        <div class="summary-card"><div class="summary-card-label">Avg Score</div><div class="summary-card-value">${session.averageScore}</div></div>
        <div class="summary-card"><div class="summary-card-label">Processing</div><div class="summary-card-value" style="font-size:1.2rem">${session.processingTime}</div></div>
      </div>
      <div class="candidates-title">Ranked Candidates</div>
      ${candidates.map(c => `
        <div class="candidate-row" style="cursor:default">
          <div class="rank-badge ${rankClass(c.rank)}">#${c.rank}</div>
          <div class="candidate-info">
            <div class="candidate-name">${escHtml(c.candidateName)}</div>
            <div class="candidate-scores">
              <span class="mini-score">Skills: <span>${c.skillScore}</span></span>
              <span class="mini-score">Exp: <span>${c.experienceScore}</span></span>
              <span class="mini-score">Edu: <span>${c.educationScore}</span></span>
            </div>
          </div>
          <div class="candidate-right">
            <span class="total-score ${scoreColor(c.totalScore)}">${c.totalScore}</span>
            <span class="rec-badge ${recClass(c.recommendation)}">${c.recommendation}</span>
          </div>
        </div>
      `).join('')}
    `;
  } catch (err) {
    detail.innerHTML = `<div class="empty-state"><p>Error: ${err.message}</p></div>`;
  }
}

// ─────────────────────────────────────────────
// ANALYTICS TAB
// ─────────────────────────────────────────────
async function loadAnalytics() {
  state.analyticsLoaded = true;
  const container = $('analytics-container');
  container.innerHTML = `<div class="loading-state"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>`;

  try {
    const [ovRes, distRes] = await Promise.all([
      fetch(`${API_BASE}/analytics/overview`),
      fetch(`${API_BASE}/analytics/score-distribution`)
    ]);
    const overview = await ovRes.json();
    const distribution = await distRes.json();

    const distColors = ['dist-bar-0','dist-bar-1','dist-bar-2','dist-bar-3','dist-bar-4'];
    const total = distribution.buckets ? distribution.buckets.reduce((s,b) => s + b.count, 0) : 0;

    container.innerHTML = `
      <div class="analytics-grid">
        <div class="analytics-card">
          <div class="analytics-card-label">Total Sessions</div>
          <div class="analytics-card-value">${overview.totalSessions || 0}</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-card-label">Total Resumes</div>
          <div class="analytics-card-value">${overview.totalResumes || 0}</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-card-label">Average Score</div>
          <div class="analytics-card-value">${overview.averageScore || 0}</div>
        </div>
      </div>

      <div class="dist-panel">
        <div class="dist-title">Score Distribution</div>
        ${(distribution.buckets || []).map((b, i) => `
          <div class="dist-row">
            <span class="dist-label">${b.range}</span>
            <div class="dist-bar-wrap">
              <div class="dist-bar ${distColors[i]}" style="width:${total > 0 ? Math.round((b.count/total)*100) : 0}%"></div>
            </div>
            <span class="dist-count">${b.count}</span>
          </div>
        `).join('')}
        ${(!distribution.buckets || distribution.buckets.every(b => b.count === 0)) ?
          '<p style="color:var(--text-2);font-size:13px;padding:0.5rem 0">No score data yet. Rank some candidates first.</p>' : ''}
      </div>

      <div class="skills-panel">
        <div class="skills-title">Top Skills Found</div>
        <div class="skills-cloud">
          ${(overview.topSkillsFound || []).length > 0
            ? overview.topSkillsFound.map(s => `
                <div class="skill-chip">
                  ${escHtml(s.skill)}
                  <span class="skill-count">${s.count}</span>
                </div>
              `).join('')
            : '<p style="color:var(--text-2);font-size:13px">No skills data yet.</p>'
          }
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>Error loading analytics: ${err.message}</p></div>`;
  }
}

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Tab navigation
  document.querySelectorAll('.nav-pill').forEach(p => {
    p.addEventListener('click', () => switchTab(p.dataset.tab));
  });

  // Upload zone
  setupUploadZone();

  // Rank button
  $('rank-btn').addEventListener('click', rankCandidates);

  // Add paste area button
  $('add-paste-btn').addEventListener('click', () => addPasteArea());

  // Load example buttons
  $('example-job-btn').addEventListener('click', loadExampleJob);
  $('example-resumes-btn').addEventListener('click', loadExampleResumes);

  // Modal close
  $('modal-close').addEventListener('click', closeModal);
  $('modal-backdrop').addEventListener('click', e => {
    if (e.target === $('modal-backdrop')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});
