/* Glossary 深模块：分类关键词映射、搜索、缩写索引 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyTerm, Glossary } from '../src/lib/glossary.js';

const RAW = {
  abbreviations: { WBS: '工作分解结构', PMO: '项目管理办公室' },
  terms: [
    { zh: '工作分解结构', en: 'Work Breakdown Structure', def: '以可交付成果为导向的层级分解。' },
    { zh: '关键路径', en: 'Critical Path', def: '决定项目最短工期的路径。' },
    { zh: '挣值管理', en: 'Earned Value Management', def: '整合范围、进度与成本的绩效方法。' },
    { zh: '示例词汇', en: 'Foobar', def: 'IT 通用词汇，专门用于测试。' },
  ],
};

test('classifyTerm 命中关键词映射', () => {
  assert.equal(classifyTerm('工作分解结构', 'WBS'), 'scope');
  assert.equal(classifyTerm('关键路径', 'Critical Path'), 'schedule');
  assert.equal(classifyTerm('挣值管理', 'Earned Value'), 'cost');
  assert.equal(classifyTerm('敏捷迭代', 'Agile'), 'agile');
});

test('classifyTerm 未命中归入 common', () => {
  assert.equal(classifyTerm('示例词汇', 'Foobar'), 'common');
  assert.equal(classifyTerm('', ''), 'common');
});

test('Glossary 构造：补充分类、idx 与缩写倒排', () => {
  const g = new Glossary(RAW);
  assert.equal(g.size, 4);
  assert.equal(g.abbreviationCount, 2);
  assert.equal(g.get(0).cat, 'scope');
  assert.equal(g.get(0).idx, 0);
  assert.equal(g.get(3).cat, 'common');
  assert.equal(g.abbrOf('工作分解结构'), 'WBS');
  assert.equal(g.abbrOf('不存在'), undefined);
});

test('Glossary.byCat 按分类过滤', () => {
  const g = new Glossary(RAW);
  assert.deepEqual(g.byCat('scope').map(t => t.zh), ['工作分解结构']);
  assert.deepEqual(g.byCat('common').map(t => t.zh), ['示例词汇']);
  assert.equal(g.byCat('risk').length, 0);
});

test('Glossary.search 关键词 + 首字母组合过滤', () => {
  const g = new Glossary(RAW);
  assert.equal(g.search({ q: '关键' }).length, 1);
  assert.equal(g.search({ q: 'value' }).length, 1);          // 英文命中
  assert.equal(g.search({ q: '绩效' }).length, 1);           // 定义命中
  assert.equal(g.search({ q: '关键', letter: 'C' }).length, 1);
  assert.equal(g.search({ q: '关键', letter: 'W' }).length, 0);
  assert.equal(g.search({}).length, 4);                      // 无条件 = 全量
  assert.equal(g.search().length, 4);                        // 默认参数
});
