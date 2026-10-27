/* PMHub 测验引擎深模块：纯逻辑，无 DOM、无全局状态。
 * buildQuiz({catId, categories, glossary, seed}) → 题目数组（可注入种子，完全确定性，可边界测试）
 * 题目: {type, q, sub, options: [{text, ok}], explain}
 */
import { hashStr, mulberry32, shuffle } from './util.js';

const DEF_QUESTIONS_PER_QUIZ = 7;
const SCENE_QUESTIONS_PER_QUIZ = 3;
const PASS_PERCENT = 80;

export function buildQuiz({ catId, categories, glossary, seed }) {
  const cat = categories.find(c => c.id === catId);
  if (!cat) throw new Error(`unknown chapter: ${catId}`);
  const rand = mulberry32(typeof seed === 'number' ? seed : hashStr(String(seed)));
  const catTerms = glossary.byCat(catId);
  const others = glossary.terms.filter(t => t.cat !== catId);
  const questions = [];

  // A. 术语定义题
  for (const t of shuffle(catTerms, rand).slice(0, DEF_QUESTIONS_PER_QUIZ)) {
    const distractors = shuffle(others, rand).slice(0, 3);
    questions.push({
      type: 'def',
      q: `『${t.zh}』（${t.en}）的定义是哪一项？`,
      sub: 'PMBOK 术语理解',
      options: shuffle([
        { text: t.def, ok: true },
        ...distractors.map(d => ({ text: d.def, ok: false }))
      ], rand),
      explain: `${t.zh}（${t.en}）：${t.def}`
    });
  }

  // B. 场景判断题：场景卡片中出现的本章术语
  const used = new Set();
  let sceneCount = 0;
  for (const e of cat.entries) {
    if (sceneCount >= SCENE_QUESTIONS_PER_QUIZ) break;
    const hit = catTerms.find(t => !used.has(t.zh)
      && (e.answer.includes(t.zh) || e.title.includes(t.zh)));
    if (!hit) continue;
    used.add(hit.zh);
    const distractors = shuffle(catTerms.filter(t => t.zh !== hit.zh), rand).slice(0, 3);
    questions.push({
      type: 'scene',
      q: '阅读以下项目场景，判断它最直接对应哪个管理概念。',
      sub: `场景：${e.title}`,
      options: shuffle([
        { text: `${hit.zh}（${hit.en}）`, ok: true },
        ...distractors.map(d => ({ text: `${d.zh}（${d.en}）`, ok: false }))
      ], rand),
      explain: `场景解析：${e.answer.slice(0, 140)}…… —— 对应概念「${hit.zh}」：${hit.def.slice(0, 100)}……`
    });
    sceneCount++;
  }
  return shuffle(questions, rand);
}

export function gradePercent(correct, total) {
  return total === 0 ? 0 : Math.round(correct / total * 100);
}

export function isPassed(percent) {
  return percent >= PASS_PERCENT;
}

export const PASS_RULE = { passPercent: PASS_PERCENT };
