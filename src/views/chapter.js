/* 视图：章节详情 */
import { esc } from '../lib/util.js';
import { STATUS_LABEL } from '../lib/progress.js';
import { cardHtml, notFoundHtml, termCardHtml } from './shared.js';

export function viewChapter({ categories, glossary, progress }, catId) {
  const c = categories.find(x => x.id === catId);
  if (!c) return notFoundHtml();
  const idx = categories.indexOf(c);
  const terms = glossary.byCat(catId);
  const st = progress.status(catId);
  const cards = c.entries.map(cardHtml).join('');
  const termChips = terms.slice(0, 24).map(t => termCardHtml(t)).join('');
  const prev = categories[idx - 1], next = categories[idx + 1];

  return `
    <div class="crumbs"><a href="#/">课程</a> / ${esc(c.name)}</div>
    <section class="ch-hero">
      <div class="glow"></div>
      <div class="ch-no">第 ${idx + 1} 章 · 共 ${categories.length} 章 · ${STATUS_LABEL[st]}</div>
      <h1>${c.icon} ${esc(c.name)}</h1>
      <p>${esc(c.desc)}。本章 ${c.entries.length} 个实战场景，${terms.length} 条相关 PMBOK 术语。</p>
      <div class="ch-tools">
        <a class="btn" href="#/quiz/${catId}">📝 开始本章测验</a>
        <a class="btn" href="#/flash/${catId}">🃏 本章闪卡</a>
      </div>
    </section>
    <div class="section-title"><h2>实战场景</h2><span class="more">${c.entries.length} 条</span></div>
    <p class="section-desc">每个场景都来自真实 IT 项目——点击卡片展开应对方法。</p>
    <div class="card-grid">${cards}</div>
    <div class="section-title"><h2>本章术语</h2><span class="more"><a href="#/terms">全部术语 →</a></span></div>
    <p class="section-desc">PMBOK 官方定义，点击查看配图详解${terms.length > 24 ? `（仅显示前 24 条，本章共 ${terms.length} 条）` : ''}。</p>
    ${termChips ? `<div class="term-grid">${termChips}</div>` : '<p class="section-desc">本章暂无映射术语。</p>'}
    <div class="term-nav" style="margin-top:36px">
      ${prev ? `<a href="#/chapter/${prev.id}"><span class="pn-label">← 上一章</span>${prev.icon} ${esc(prev.name)}</a>` : '<a href="#/"><span class="pn-label">← 返回</span>课程首页</a>'}
      ${next ? `<a class="next" href="#/chapter/${next.id}"><span class="pn-label">下一章 →</span>${next.icon} ${esc(next.name)}</a>` : ''}
    </div>`;
}
