/* 视图：闪卡记忆（选卡组、翻面、已掌握/仍陌生、陌生重练） */
import { esc } from '../lib/util.js';
import { createSession, drawDeck } from '../lib/deck.js';

export function viewFlash({ categories, glossary }, catId) {
  const decks = [{ id: '', name: '🌍 全部术语' }]
    .concat(categories.map(c => ({ id: c.id, name: `${c.icon} ${esc(c.name)}` })));
  const size = id => id ? glossary.byCat(id).length : glossary.size;
  return `
    <div class="crumbs"><a href="#/">课程</a> / 闪卡练习</div>
    <div class="section-title"><h2>🃏 闪卡记忆</h2></div>
    <p class="section-desc">看术语回忆定义，点击卡片翻面核对；标记「已掌握 / 仍陌生」进入下一张。陌生卡片会在本轮结束后重练。</p>
    <div class="flash-shell">
      <div class="flash-deck" id="deckRow">
        ${decks.map(d => `<button class="mini-btn ${(catId || '') === d.id ? 'solid' : ''}" data-deck="${d.id}">${esc(d.name)}（${size(d.id)}）</button>`).join('')}
      </div>
      <div id="flashBody"></div>
    </div>`;
}

export function bindFlash(ctx, catId) {
  const { categories, glossary, progress } = ctx;
  const body = document.getElementById('flashBody');
  const deckRow = document.getElementById('deckRow');
  let deckCat = categories.some(c => c.id === catId) ? catId : '';
  let session = null;

  deckRow.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    deckCat = b.dataset.deck;
    deckRow.querySelectorAll('button').forEach(x => x.classList.toggle('solid', x === b));
    start();
  }));

  const catInfo = id => categories.find(c => c.id === id);

  function start(poolOverride) {
    const rand = Math.random;
    const pool = poolOverride
      || (deckCat ? glossary.byCat(deckCat) : glossary.terms);
    session = createSession(drawDeck(pool, { rand }), { rand });
    render();
  }

  function render() {
    if (session.done) {
      progress.addFlashKnown(deckCat, session.knownCount);
      const again = session.againCards;
      body.innerHTML = `
        <div class="quiz-card" style="text-align:center">
          <div class="score-big">${session.knownCount} / ${session.total}</div>
          <div class="score-msg">本轮已掌握 ${session.knownCount} 张${again.length ? `，${again.length} 张陌生卡片建议再来一轮` : '，全部掌握！'}</div>
          <div class="quiz-actions" style="justify-content:center">
            <button class="btn btn-ghost" id="reDeckBtn">${again.length ? '♻️ 重练陌生卡片' : '🔄 再来一轮'}</button>
            <a class="btn btn-ghost" href="#/">← 返回课程</a>
          </div>
        </div>`;
      document.getElementById('reDeckBtn').addEventListener('click', () => {
        if (again.length) start(again);
        else start();
      });
      return;
    }
    const t = session.current;
    const info = catInfo(t.cat);
    body.innerHTML = `
      <div class="flash-stat">第 ${session.pos + 1} / ${session.total} 张 · 已掌握 ${session.knownCount} 张</div>
      <div class="flash-card" id="flashCard">
        <div class="flash-inner">
          <div class="flash-face flash-front">
            <div class="f-cat">${info ? info.icon + ' ' + esc(info.name) : '📘 通用'}</div>
            <div class="f-zh">${esc(t.zh)}</div>
            <div class="f-en">${esc(t.en)}</div>
            <div class="f-hint">点击翻面看定义</div>
          </div>
          <div class="flash-face flash-back">
            <div class="f-def">${esc(t.def)}</div>
            <div class="f-hint" style="color:#fff">点击翻回正面</div>
          </div>
        </div>
      </div>
      <div class="flash-ctrl">
        <button class="btn btn-ghost" id="btnAgain">😅 仍陌生</button>
        <button class="btn btn-primary" id="btnKnow">💪 已掌握</button>
      </div>`;
    document.getElementById('flashCard').addEventListener('click', function () {
      this.classList.toggle('flipped');
    });
    document.getElementById('btnKnow').addEventListener('click', () => { session.know(); render(); });
    document.getElementById('btnAgain').addEventListener('click', () => { session.markAgain(); render(); });
  }

  start();
}
