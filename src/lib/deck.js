/* PMHub 闪卡会话状态机：纯逻辑，无 DOM，可单测 */
import { shuffle } from './util.js';

export function createSession(cards, { rand }) {
  const deck = shuffle(cards, rand);
  let pos = 0, known = 0;
  const again = [];
  return {
    get current() { return deck[pos]; },
    get pos() { return pos; },
    get total() { return deck.length; },
    get knownCount() { return known; },
    get againCards() { return again.slice(); },
    get done() { return pos >= deck.length; },
    know() { known++; pos++; },
    markAgain() { again.push(deck[pos]); pos++; }
  };
}

export function drawDeck(pool, { rand, limit = 20 }) {
  return shuffle(pool, rand).slice(0, limit);
}
