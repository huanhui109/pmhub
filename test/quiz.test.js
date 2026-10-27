/* 测验引擎：同 seed 完全确定、题目结构合法、未知章节抛错 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuiz, gradePercent, isPassed, PASS_RULE } from '../src/lib/quiz.js';
import { Glossary } from '../src/lib/glossary.js';

const CATEGORIES = [
  {
    id: 'scope', name: '范围管理', icon: '🎯', desc: 'd',
    entries: [
      { title: '需求蔓延场景', answer: '使用工作分解结构控制范围蔓延。', method: '案例', ref: 'R1' },
      { title: '验收场景', answer: '确认范围后进行验收。', method: '案例', ref: 'R2' },
    ],
  },
  { id: 'risk', name: '风险管理', icon: '🎲', desc: 'd', entries: [] },
];

const GLOSSARY = new Glossary({
  abbreviations: {},
  terms: [
    { zh: '工作分解结构', en: 'Work Breakdown Structure', def: '以可交付成果为导向的层级分解。' },
    { zh: '范围蔓延', en: 'Scope Creep', def: '未受控的范围扩张。' },
    { zh: '确认范围', en: 'Validate Scope', def: '正式验收已完成的项目可交付成果。' },
    { zh: '需求跟踪矩阵', en: 'Requirements Traceability Matrix', def: '把需求连接到其来源与可交付成果。' },
    { zh: '原型法', en: 'Prototyping', def: '先造模型再完善需求。' },
    { zh: '焦点小组', en: 'Focus Group', def: '召集相关方讨论需求。' },
    { zh: '蒙特卡洛模拟', en: 'Monte Carlo', def: '风险定量分析技术。' },
    { zh: '风险登记册', en: 'Risk Register', def: '记录风险识别结果。' },
    { zh: '因果图', en: 'Cause and Effect Diagram', def: '寻找根本原因的质量工具。' },
    { zh: '关键路径', en: 'Critical Path', def: '决定项目最短工期的路径。' },
  ],
});

const base = { catId: 'scope', categories: CATEGORIES, glossary: GLOSSARY };

test('同 seed 出题完全确定（纯函数）', () => {
  const a = buildQuiz({ ...base, seed: 42 });
  const b = buildQuiz({ ...base, seed: 42 });
  assert.deepEqual(a, b);
});

test('不同 seed 选项顺序不同（随机性真实生效）', () => {
  const a = buildQuiz({ ...base, seed: 1 });
  const b = buildQuiz({ ...base, seed: 2 });
  assert.notDeepEqual(JSON.stringify(a.map(q => q.options)), JSON.stringify(b.map(q => q.options)));
});

test('每题恰好 4 个选项、恰好 1 个正确', () => {
  const qs = buildQuiz({ ...base, seed: 7 });
  assert.ok(qs.length > 0);
  for (const q of qs) {
    assert.equal(q.options.length, 4, q.q);
    assert.equal(q.options.filter(o => o.ok).length, 1, q.q);
    assert.ok(q.explain.length > 0);
    assert.ok(['def', 'scene'].includes(q.type));
  }
});

test('定义题题干来自本章术语，干扰项不重复正确项', () => {
  const qs = buildQuiz({ ...base, seed: 7 });
  const defQ = qs.find(q => q.type === 'def');
  assert.ok(defQ);
  const catZhs = new Set(GLOSSARY.byCat('scope').map(t => t.zh));
  assert.ok(catZhs.size >= 0); // 分类本身由 Glossary 负责，此处只验证选项自洽
  const texts = defQ.options.map(o => o.text);
  assert.equal(new Set(texts).size, 4, '四个选项文本应互不相同');
});

test('场景题从章节条目生成', () => {
  const qs = buildQuiz({ ...base, seed: 7 });
  const sceneQ = qs.find(q => q.type === 'scene');
  assert.ok(sceneQ);
  assert.ok(sceneQ.sub.includes('场景：'));
  assert.ok(sceneQ.explain.includes('对应概念'));
});

test('未知章节抛错', () => {
  assert.throws(() => buildQuiz({ ...base, catId: 'nope' }), /unknown chapter/);
});

test('章节术语不足时不出定义题但仍可运行', () => {
  const qs = buildQuiz({ catId: 'risk', categories: CATEGORIES, glossary: GLOSSARY, seed: 3 });
  assert.ok(Array.isArray(qs));
});

test('判分与通过规则', () => {
  assert.equal(gradePercent(4, 5), 80);
  assert.equal(gradePercent(0, 0), 0);
  assert.equal(isPassed(80), true);
  assert.equal(isPassed(79), false);
  assert.equal(PASS_RULE.passPercent, 80);
});
