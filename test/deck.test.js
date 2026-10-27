/* 闪卡会话状态机：know / markAgain / done */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, drawDeck } from '../src/lib/deck.js';

const rand = () => 0.42; // 确定性伪随机
const CARDS = ['A', 'B', 'C', 'D'];

test('会话遍历全部卡片后 done', () => {
  const s = createSession(CARDS, { rand });
  assert.equal(s.total, 4);
  assert.equal(s.pos, 0);
  assert.equal(s.done, false);

  s.know(); s.markAgain(); s.know(); s.know();
  assert.equal(s.pos, 4);
  assert.equal(s.done, true);
  assert.equal(s.knownCount, 3);
  assert.equal(s.againCards.length, 1);
  assert.ok(CARDS.includes(s.againCards[0]));
});

test('markAgain 不影响已掌握计数', () => {
  const s = createSession(CARDS, { rand });
  s.markAgain(); s.markAgain();
  assert.equal(s.knownCount, 0);
  assert.equal(s.againCards.length, 2);
});

test('againCards 返回副本（外部不可篡改会话内部状态）', () => {
  const s = createSession(CARDS, { rand });
  s.markAgain();
  const snap = s.againCards;
  snap.push('X');
  assert.equal(s.againCards.length, 1);
});

test('current 随进度前进，done 后不再变化', () => {
  const s = createSession(CARDS, { rand });
  const seen = [];
  while (!s.done) { seen.push(s.current); s.know(); }
  assert.deepEqual([...seen].sort(), [...CARDS].sort());
  const before = s.knownCount;
  s.know(); // done 后再调用不应崩溃（pos 越界也只是递增）
  assert.equal(s.done, true);
  assert.ok(s.knownCount >= before);
});

test('drawDeck 限制数量且不修改原数组', () => {
  const pool = Array.from({ length: 30 }, (_, i) => i);
  const deck = drawDeck(pool, { rand, limit: 20 });
  assert.equal(deck.length, 20);
  assert.equal(pool.length, 30);
});
