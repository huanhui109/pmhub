/* PMHub 入口：加载数据 → 构建上下文 → hash 路由 */
import { CATEGORIES, UPDATED } from './data/scenarios.js';
import { Glossary } from './lib/glossary.js';
import { createProgressStore } from './lib/progress.js';
import { notFoundHtml } from './views/shared.js';
import { viewHome } from './views/home.js';
import { viewChapter } from './views/chapter.js';
import { viewTerms, bindTerms } from './views/terms.js';
import { viewTerm } from './views/term.js';
import { viewQuiz, bindQuiz } from './views/quiz.js';
import { viewFlash, bindFlash } from './views/flash.js';

const ROUTES = [
  { re: /^\/?$/, nav: 'home', view: viewHome },
  { re: /^\/chapter\/([\w-]+)$/, nav: 'home', view: viewChapter },
  { re: /^\/terms$/, nav: 'terms', view: viewTerms, bind: bindTerms },
  { re: /^\/term\/(\d+)$/, nav: 'terms', view: viewTerm },
  { re: /^\/quiz\/([\w-]+)$/, nav: 'home', view: viewQuiz, bind: bindQuiz },
  { re: /^\/flash(?:\/([\w-]+))?$/, nav: 'flash', view: viewFlash, bind: bindFlash },
];

let ctx = null;

function setActiveNav(route) {
  document.querySelectorAll('#topNav a').forEach(a => {
    a.classList.toggle('active', a.dataset.route === route);
  });
}

function route() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const app = document.getElementById('app');
  window.scrollTo({ top: 0 });
  for (const r of ROUTES) {
    const m = hash.match(r.re);
    if (!m) continue;
    setActiveNav(r.nav);
    app.innerHTML = r.view(ctx, m[1]);
    if (r.bind) r.bind(ctx, m[1]);
    break;
  }
  if (!ROUTES.some(r => r.re.test(hash))) {
    setActiveNav('');
    app.innerHTML = notFoundHtml();
  }
  // 场景卡片展开
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('open'));
  });
}

function initTheme() {
  const themeBtn = document.getElementById('themeBtn');
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('pmhub-theme', t);
  }
  const saved = localStorage.getItem('pmhub-theme');
  if (saved) setTheme(saved);
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  themeBtn.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
}

async function boot() {
  document.getElementById('updated').textContent = UPDATED;
  initTheme();
  try {
    const glossary = await Glossary.load('glossary.json');
    ctx = { categories: CATEGORIES, glossary, progress: createProgressStore(localStorage) };
    route();
  } catch (e) {
    document.getElementById('app').innerHTML =
      '<div class="empty"><div class="big">⚠️</div>术语库加载失败，请通过本地服务器访问（npm run dev）。</div>';
  }
  window.addEventListener('hashchange', route);
}

boot();
