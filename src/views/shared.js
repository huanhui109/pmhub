/* 视图共享片段 */
import { esc, tileColor } from '../lib/util.js';

export function catTag(categories, catId) {
  const c = categories.find(x => x.id === catId);
  if (c) return `<span class="tag" style="background:var(--accent-soft);color:var(--accent)">${c.icon} ${esc(c.name)}</span>`;
  return `<span class="tag" style="background:var(--surface2);color:var(--text3)">📘 通用</span>`;
}

export function termTile(zh, en) {
  return `<div class="term-tile" style="background:hsl(${tileColor(zh, en)},65%,55%)">${esc(en.charAt(0).toUpperCase())}</div>`;
}

export function cardHtml(e) {
  return `
    <article class="card">
      <div class="q">${esc(e.title)}</div>
      <div class="a">${esc(e.answer)}</div>
      <div class="meta">
        <span class="tag tag-${e.method}">${e.method}</span>
        <span class="ref">${esc(e.ref)}</span>
        <span class="hint">点击展开 ▸</span>
      </div>
    </article>`;
}

export function termCardHtml(t, { withDef = false } = {}) {
  return `
    <div class="term-card" onclick="location.hash='#/term/${t.idx}'">
      ${termTile(t.zh, t.en)}
      <div>
        <div class="t-zh">${esc(t.zh)}</div>
        <div class="t-en">${esc(t.en)}</div>
        ${withDef ? `<div class="t-def">${esc(t.def)}</div>` : ''}
      </div>
    </div>`;
}

export function notFoundHtml() {
  return `<div class="empty"><div class="big">🧭</div>页面不存在。<br><br><a class="btn btn-primary" href="#/">返回课程首页</a></div>`;
}
