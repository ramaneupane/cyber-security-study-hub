const STORAGE_KEYS = {
  theme: 'securityplus-theme',
  progress: 'securityplus-progress',
  favorites: 'securityplus-favorites',
  quizHistory: 'securityplus-quiz-history',
  sessions: 'securityplus-sessions',
};

const state = {
  theme: localStorage.getItem(STORAGE_KEYS.theme) || 'dark',
  favorites: JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '[]'),
  progress: JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || '{}'),
  quizHistory: JSON.parse(localStorage.getItem(STORAGE_KEYS.quizHistory) || '[]'),
  sessions: Number(localStorage.getItem(STORAGE_KEYS.sessions) || 0),
};

async function loadJSON(path) {
  const response = await fetch(path);
  return response.json();
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(state.progress));
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(state.favorites));
  localStorage.setItem(STORAGE_KEYS.quizHistory, JSON.stringify(state.quizHistory));
  localStorage.setItem(STORAGE_KEYS.sessions, String(state.sessions));
}

function updateHomeMetrics() {
  const progressEl = document.getElementById('home-progress');
  const sessionsEl = document.getElementById('home-sessions');
  if (progressEl) {
    const percent = Object.keys(state.progress).length ? Math.min(100, Math.round((Object.values(state.progress).filter(Boolean).length / 5) * 100)) : 0;
    progressEl.textContent = `${percent}% complete`;
  }
  if (sessionsEl) sessionsEl.textContent = `${state.sessions} study sessions`;
}

async function renderStudyGuide() {
  const container = document.getElementById('study-guide-content');
  if (!container) return;
  const data = await loadJSON('data/study-guide.json');
  container.innerHTML = data.map((section) => `
    <article class="topic-card">
      <h2>${section.title}</h2>
      <p>${section.description}</p>
      <ul class="resource-list">
        ${section.points.map((point) => `<li>${point}</li>`).join('')}
      </ul>
      <p><strong>Exam tip:</strong> ${section.examTip}</p>
      <p><strong>Common mistake:</strong> ${section.commonMistake}</p>
    </article>
  `).join('');
}

async function renderFlashcards() {
  const container = document.getElementById('flashcard-grid');
  const filter = document.getElementById('flashcard-filter');
  if (!container) return;
  const data = await loadJSON('data/flashcards.json');
  const domains = ['all', ...new Set(data.map((card) => card.domain))];
  if (filter) {
    filter.innerHTML = domains.map((domain) => `<option value="${domain}">${domain === 'all' ? 'All' : domain}</option>`).join('');
    filter.addEventListener('change', () => renderFlashcards());
  }
  const selected = filter?.value || 'all';
  const visible = selected === 'all' ? data : data.filter((card) => card.domain === selected);
  container.innerHTML = visible.map((card) => `
    <article class="flashcard" data-id="${card.id}">
      <div>
        <h3>${card.front}</h3>
        <p class="back">${card.back}</p>
      </div>
    </article>
  `).join('');
  document.querySelectorAll('.flashcard').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      const detail = card.querySelector('.back');
      if (detail) detail.classList.toggle('hidden');
    });
  });
}

async function renderQuiz() {
  const container = document.getElementById('quiz-container');
  const difficulty = document.getElementById('quiz-difficulty');
  if (!container) return;
  const data = await loadJSON('data/questions.json');
  const filtered = difficulty?.value && difficulty.value !== 'mixed'
    ? data.filter((q) => q.difficulty === difficulty.value)
    : data;
  const questions = filtered.sort(() => 0.5 - Math.random()).slice(0, 20);
  container.innerHTML = `
    <h2>Quiz Review</h2>
    ${questions.map((question, index) => `
      <div class="topic-card">
        <p><strong>${index + 1}. ${question.question}</strong></p>
        <ul class="resource-list">
          ${question.options.map((option) => `<li>${option}</li>`).join('')}
        </ul>
        <p><em>Answer:</em> ${question.correctAnswer}</p>
        <p>${question.explanation}</p>
      </div>
    `).join('')}
  `;
  state.quizHistory.push({ type: 'quiz', count: questions.length, difficulty: difficulty?.value || 'mixed' });
  state.sessions += 1;
  saveProgress();
  updateHomeMetrics();
}

async function renderExam() {
  const container = document.getElementById('exam-container');
  if (!container) return;
  const data = await loadJSON('data/questions.json');
  const questions = data.slice(0, 90);
  container.innerHTML = `
    <h2>Practice Exam</h2>
    ${questions.map((question, index) => `
      <div class="topic-card">
        <p><strong>${index + 1}. ${question.question}</strong></p>
        <ul class="resource-list">
          ${question.options.map((option) => `<li>${option}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  `;
}

async function renderPorts() {
  const container = document.getElementById('ports-table');
  const search = document.getElementById('port-search');
  if (!container) return;
  const data = await loadJSON('data/ports.json');
  const render = (items) => {
    container.innerHTML = `
      <table>
        <thead><tr><th>Port</th><th>Protocol</th><th>TCP/UDP</th><th>Description</th><th>Exam Tip</th></tr></thead>
        <tbody>
          ${items.map((item) => `<tr><td>${item.port}</td><td>${item.protocol}</td><td>${item.transport}</td><td>${item.description}</td><td>${item.examTip}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
  };
  render(data);
  search?.addEventListener('input', (event) => {
    const term = event.target.value.toLowerCase();
    const filtered = data.filter((item) => `${item.port} ${item.protocol} ${item.description}`.toLowerCase().includes(term));
    render(filtered);
  });
}

async function renderAcronyms() {
  const container = document.getElementById('acronym-list');
  const search = document.getElementById('acronym-search');
  if (!container) return;
  const data = await loadJSON('data/acronyms.json');
  const render = (items) => {
    container.innerHTML = items.map((item) => `
      <article class="topic-card">
        <h3>${item.term}</h3>
        <p>${item.definition}</p>
      </article>
    `).join('');
  };
  render(data);
  search?.addEventListener('input', (event) => {
    const term = event.target.value.toLowerCase();
    const filtered = data.filter((item) => `${item.term} ${item.definition}`.toLowerCase().includes(term));
    render(filtered);
  });
}

async function renderTools() {
  const container = document.getElementById('tools-list');
  if (!container) return;
  const data = await loadJSON('data/tools.json');
  container.innerHTML = data.map((item) => `
    <article class="tool-card">
      <h3>${item.name}</h3>
      <p><strong>Purpose:</strong> ${item.purpose}</p>
      <p><strong>Use cases:</strong> ${item.useCases}</p>
      <p><strong>Advantages:</strong> ${item.advantages}</p>
      <p><strong>Limitations:</strong> ${item.limitations}</p>
    </article>
  `).join('');
}

async function renderLabs() {
  const container = document.getElementById('labs-list');
  if (!container) return;
  const data = await loadJSON('data/study-guide.json');
  const labs = data[0]?.labs || [];
  container.innerHTML = labs.map((lab) => `
    <article class="lab-card">
      <h3>${lab.title}</h3>
      <p>${lab.description}</p>
      <p><strong>Outcome:</strong> ${lab.outcome}</p>
    </article>
  `).join('');
}

function renderDashboard() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;
  const percent = Object.keys(state.progress).length ? Math.min(100, Math.round((Object.values(state.progress).filter(Boolean).length / 5) * 100)) : 0;
  container.innerHTML = `
    <div class="stats-grid">
      <article class="metric-card"><h3>Study Progress</h3><p>${percent}%</p></article>
      <article class="metric-card"><h3>Completed Domains</h3><p>${Object.values(state.progress).filter(Boolean).length}/5</p></article>
      <article class="metric-card"><h3>Quiz History</h3><p>${state.quizHistory.length} attempts</p></article>
      <article class="metric-card"><h3>Flashcards Reviewed</h3><p>${state.favorites.length}</p></article>
      <article class="metric-card"><h3>Study Streak</h3><p>${state.sessions} days</p></article>
      <article class="metric-card"><h3>Favorites</h3><p>${state.favorites.length} cards</p></article>
    </div>
  `;
}

function renderResources() {
  const container = document.getElementById('resources-content');
  if (!container) return;
  container.innerHTML = `
    <div class="card-list">
      <article class="resource-card"><h3>Study Checklist</h3><p>Review domains, practice labs, and flashcards weekly.</p></article>
      <article class="resource-card"><h3>Exam-Day Tips</h3><p>Arrive early, read questions carefully, and eliminate distractors.</p></article>
      <article class="resource-card"><h3>Recommended Books</h3><p>CompTIA Security+ Study Guide, Official Practice Tests, and lab guides.</p></article>
      <article class="resource-card"><h3>Video Resources</h3><p>Professor Messer, Jason Dion, and official CompTIA training.</p></article>
      <article class="resource-card"><h3>Printable Cheat Sheets</h3><p>Downloadable domain summaries for quick review.</p></article>
      <article class="resource-card"><h3>FAQ</h3><p>How long should I study? What score do I need to pass? Use the dashboard to track it.</p></article>
    </div>
  `;
}

function setupSearch() {
  const searchInput = document.getElementById('site-search');
  if (!searchInput) return;
  searchInput.addEventListener('input', (event) => {
    const term = event.target.value.toLowerCase();
    const cards = document.querySelectorAll('.topic-card, .tool-card, .resource-card, .lab-card, .flashcard');
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(term) ? 'block' : 'none';
    });
  });
}

function setupTheme() {
  setTheme(state.theme);
  const toggle = document.getElementById('theme-toggle');
  toggle?.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(state.theme);
  });
}

function setupScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function setupEvents() {
  document.getElementById('new-quiz')?.addEventListener('click', renderQuiz);
  document.getElementById('start-exam')?.addEventListener('click', renderExam);
  document.getElementById('shuffle-cards')?.addEventListener('click', renderFlashcards);
  document.getElementById('favorite-toggle')?.addEventListener('click', () => {
    const cards = document.querySelectorAll('.flashcard');
    cards.forEach((card) => card.classList.toggle('hidden'));
  });
}

async function init() {
  setupTheme();
  setupSearch();
  setupScrollTop();
  setupEvents();
  updateHomeMetrics();
  const path = window.location.pathname.split('/').pop();
  if (path === 'study.html') await renderStudyGuide();
  if (path === 'flashcards.html') await renderFlashcards();
  if (path === 'quiz.html') await renderQuiz();
  if (path === 'practice-exam.html') await renderExam();
  if (path === 'ports.html') await renderPorts();
  if (path === 'acronyms.html') await renderAcronyms();
  if (path === 'tools.html') await renderTools();
  if (path === 'labs.html') await renderLabs();
  if (path === 'dashboard.html') renderDashboard();
  if (path === 'resources.html') renderResources();
}

document.addEventListener('DOMContentLoaded', init);
