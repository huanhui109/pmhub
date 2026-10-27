/* 视图：课程首页 */
import { esc } from '../lib/util.js';
import { STATUS_LABEL } from '../lib/progress.js';
import { TOTAL_SCENARIOS } from '../data/scenarios.js';

export function viewHome({ categories, glossary, progress }) {
  const doneCount = categories.filter(c => progress.status(c.id) === 'done').length;
  const pct = Math.round(doneCount / categories.length * 100);
  const chapters = categories.map((c, i) => {
    const st = progress.status(c.id);
    const best = progress.best(c.id);
    return `<div class="chapter-card ${st}">
      <div class="ch-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="ch-main">
        <h3>${c.icon} ${esc(c.name)} <span class="status ${st}">${STATUS_LABEL[st]}</span></h3>
        <p>${esc(c.desc)}</p>
        <div class="ch-meta"><span>${c.entries.length} 个实战场景</span><span>·</span><span>${glossary.byCat(c.id).length} 条相关术语</span>
        ${best != null ? `<span>·</span><span>测验最佳 ${best} 分</span>` : ''}</div>
      </div>
      <div class="ch-actions">
        <a class="mini-btn solid" href="#/chapter/${c.id}">进入章节</a>
        <a class="mini-btn" href="#/quiz/${c.id}">章节测验</a>
      </div>
    </div>`;
  }).join('');

  return `
    <section class="hero">
      <span class="kicker">PMBOK 体系 · 课程式知识库 · 含练习</span>
      <h1>IT 项目管理实战课<br><em>场景 + 术语 + 测验，一站学透</em></h1>
      <p>参考交互式课程设计：12 个章节按真实项目推进顺序组织，每章包含实战场景问答、PMBOK 官方术语详解（配图）与配套测验；术语库收录《PMBOK 指南》第六版术语表 ${glossary.size} 条全部定义。</p>
      <div class="hero-stats">
        <div class="hero-stat"><div class="num">${categories.length}</div><div class="lbl">课程章节</div></div>
        <div class="hero-stat"><div class="num">${TOTAL_SCENARIOS}</div><div class="lbl">实战场景</div></div>
        <div class="hero-stat"><div class="num">${glossary.size}</div><div class="lbl">PMBOK 术语</div></div>
        <div class="hero-stat"><div class="num">${glossary.abbreviationCount}</div><div class="lbl">常用缩写</div></div>
      </div>
      <div class="progress-wrap">
        <div class="progress-label"><span>课程进度</span><span>${doneCount}/${categories.length} 章 · ${pct}%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="cta-row">
        <a class="btn btn-primary" href="#/chapter/${categories[0].id}">▶ 从第 1 章开始</a>
        <a class="btn btn-ghost" href="#/terms">📖 浏览术语库</a>
        <a class="btn btn-ghost" href="#/flash">🃏 闪卡练习</a>
      </div>
    </section>
    <div class="section-title"><h2>课程章节</h2></div>
    <p class="section-desc">完成章节测验且得分 ≥ 80 分，该章标记为已完成；进度保存在本地浏览器。</p>
    <div class="chapter-list">${chapters}</div>`;
}
