/* 视图：术语详情（配图 + 定义 + 相关实战场景 + 上一条/下一条） */
import { esc } from '../lib/util.js';
import { termArt } from '../lib/art.js';
import { cardHtml, notFoundHtml } from './shared.js';

export function viewTerm({ categories, glossary }, idx) {
  const t = glossary.get(+idx);
  if (!t) return notFoundHtml();
  const abbr = glossary.abbrOf(t.zh);
  const rel = t.cat !== 'common' ? categories.find(c => c.id === t.cat) : null;
  const relCards = rel
    ? rel.entries.filter(e => e.answer.includes(t.zh) || e.title.includes(t.zh)).slice(0, 3)
    : [];
  const prev = glossary.get(+idx - 1), next = glossary.get(+idx + 1);

  return `
    <div class="crumbs"><a href="#/">课程</a> / <a href="#/terms">术语库</a> / ${esc(t.zh)}</div>
    <div class="term-hero">
      <div class="art">${termArt(t)}</div>
      <div class="term-body">
        <span class="t-cat" style="background:var(--accent-soft);color:var(--accent)">${rel ? rel.icon + ' ' + esc(rel.name) : '📘 通用术语'}</span>
        <h1>${esc(t.zh)}</h1>
        <div class="en">${esc(t.en)}${abbr ? ` · 常用缩写：${esc(abbr)}` : ''}</div>
        <div class="def">${esc(t.def)}</div>
        <div class="ch-tools" style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap">
          ${rel ? `<a class="mini-btn solid" href="#/chapter/${rel.id}">${rel.icon} 相关章节：${esc(rel.name)}</a>` : ''}
          <a class="mini-btn" href="#/flash/${t.cat !== 'common' ? t.cat : ''}">🃏 闪卡记忆</a>
        </div>
      </div>
    </div>
    ${relCards.length ? `
      <div class="term-section-title">💡 相关实战场景</div>
      <div class="card-grid">${relCards.map(cardHtml).join('')}</div>` : ''}
    <div class="term-nav">
      ${prev ? `<a href="#/term/${prev.idx}"><span class="pn-label">← 上一个术语</span>${esc(prev.zh)} · ${esc(prev.en)}</a>` : '<a></a>'}
      ${next ? `<a class="next" href="#/term/${next.idx}"><span class="pn-label">下一个术语 →</span>${esc(next.zh)} · ${esc(next.en)}</a>` : ''}
    </div>`;
}
