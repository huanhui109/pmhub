/* 视图：术语库浏览（搜索 / 字母筛选 / 缩写表） */
import { esc } from '../lib/util.js';
import { termTile, termCardHtml, notFoundHtml } from './shared.js';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

let termQuery = '', termLetter = '';

export function viewTerms({ glossary }) {
  return `
    <div class="crumbs"><a href="#/">课程</a> / 术语库</div>
    <div class="section-title"><h2>📖 PMBOK 术语库</h2><span class="more">${glossary.size} 条 · ${glossary.abbreviationCount} 个缩写</span></div>
    <p class="section-desc">《PMBOK 指南》第六版术语表完整收录。点击任意术语查看配图详解；按英文首字母或关键词筛选。</p>
    <div class="term-tools">
      <input id="termSearch" type="search" placeholder="搜索：关键路径 / Scope Creep / 挣值……" value="${esc(termQuery)}">
      <button class="mini-btn" id="abbrToggle">📎 常用缩写表</button>
    </div>
    <div class="letter-row" id="letterRow">
      <button data-letter="" class="${!termLetter ? 'active' : ''}">全部</button>
      ${LETTERS.map(l => `<button data-letter="${l}" class="${termLetter === l ? 'active' : ''}">${l}</button>`).join('')}
    </div>
    <div id="abbrPanel"></div>
    <div class="term-grid" id="termGrid"></div>`;
}

export function bindTerms({ glossary }) {
  const input = document.getElementById('termSearch');
  const grid = document.getElementById('termGrid');
  const row = document.getElementById('letterRow');

  function render() {
    const list = glossary.search({ q: termQuery, letter: termLetter });
    grid.innerHTML = list.length
      ? list.map(t => termCardHtml(t, { withDef: true })).join('')
      : `<div class="empty" style="grid-column:1/-1"><div class="big">🔍</div>没有匹配的术语</div>`;
  }

  input.addEventListener('input', () => { termQuery = input.value; render(); });
  row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    termLetter = b.dataset.letter;
    row.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
    render();
  }));
  document.getElementById('abbrToggle').addEventListener('click', () => {
    const panel = document.getElementById('abbrPanel');
    if (panel.innerHTML) { panel.innerHTML = ''; return; }
    const rows = Object.entries(glossary.abbreviations).map(([a, zh]) =>
      `<tr><td style="font-weight:700;white-space:nowrap">${esc(a)}</td><td>${esc(zh)}</td></tr>`).join('');
    panel.innerHTML = `<div class="card" style="margin-bottom:16px;cursor:default"><table style="width:100%;border-collapse:collapse;font-size:13px">${rows}</table></div>`;
  });
  render();
}
