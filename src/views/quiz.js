/* 视图：章节测验（出题、判分、成绩记录） */
import { esc } from '../lib/util.js';
import { buildQuiz, gradePercent, isPassed } from '../lib/quiz.js';
import { notFoundHtml } from './shared.js';

export function viewQuiz({ categories }, catId) {
  const cat = categories.find(c => c.id === catId);
  if (!cat) return notFoundHtml();
  return `
    <div class="crumbs"><a href="#/">课程</a> / <a href="#/chapter/${catId}">${esc(cat.name)}</a> / 章节测验</div>
    <div class="quiz-shell" id="quizShell"></div>`;
}

export function bindQuiz(ctx, catId) {
  const { categories, glossary, progress } = ctx;
  const cat = categories.find(c => c.id === catId);
  if (!cat) return;
  const shell = document.getElementById('quizShell');
  const questions = buildQuiz({ catId, categories, glossary, seed: Date.now() });
  let cur = 0, score = 0, answered = false;

  function renderQ() {
    answered = false;
    const q = questions[cur];
    shell.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-head">
          <span>${cat.icon} ${esc(cat.name)} · 第 ${cur + 1} / ${questions.length} 题</span>
          <span>已得分 ${score}</span>
        </div>
        <div class="progress-bar" style="margin-bottom:20px"><div class="progress-fill" style="width:${Math.round(cur / questions.length * 100)}%"></div></div>
        <div class="quiz-q">${esc(q.q)}</div>
        <div class="quiz-sub">${esc(q.sub)}</div>
        ${q.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o.text)}</button>`).join('')}
        <div class="quiz-explain" id="explain"></div>
        <div class="quiz-actions"><button class="btn btn-primary" id="nextBtn" style="display:none">${cur === questions.length - 1 ? '查看结果' : '下一题'}</button></div>
      </div>`;
    shell.querySelectorAll('.opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const pick = q.options[+btn.dataset.i];
        shell.querySelectorAll('.opt').forEach((b, i) => {
          b.disabled = true;
          if (q.options[i].ok) b.classList.add('correct');
        });
        if (!pick.ok) btn.classList.add('wrong'); else score++;
        const ex = document.getElementById('explain');
        ex.innerHTML = `<strong>${pick.ok ? '✅ 回答正确！' : '❌ 回答错误。'}</strong><br>${esc(q.explain)}`;
        ex.classList.add('show');
        document.getElementById('nextBtn').style.display = 'inline-flex';
        shell.querySelector('.quiz-head span:last-child').textContent = '已得分 ' + score;
      });
    });
    document.getElementById('nextBtn').addEventListener('click', () => {
      cur++;
      if (cur < questions.length) renderQ(); else renderResult();
    });
  }

  function renderResult() {
    const pct = gradePercent(score, questions.length);
    progress.recordQuiz(catId, pct);
    const passed = isPassed(pct);
    shell.innerHTML = `
      <div class="quiz-card" style="text-align:center">
        <div class="score-big">${pct} 分</div>
        <div class="score-msg">答对 ${score} / ${questions.length} 题 · ${passed ? '🎉 恭喜，本章已掌握！（≥80 分，章节标记为已完成）' : '还需巩固，建议回到章节复习后再试（≥80 分通过）'}</div>
        <div class="quiz-actions" style="justify-content:center">
          <a class="btn btn-ghost" href="#/chapter/${catId}">← 返回章节</a>
          <button class="btn btn-primary" id="retryBtn">🔄 再测一次</button>
        </div>
      </div>`;
    document.getElementById('retryBtn').addEventListener('click', () => { cur = 0; score = 0; renderQ(); });
  }

  renderQ();
}
