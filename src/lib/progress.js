/* PMHub 进度存储深模块：隐藏 localStorage 键名与数据结构。
 * 通过规则（≥80 分 = 章节完成）收敛在此，视图层不再各自判断。
 */
export const STATUS_LABEL = { todo: '未开始', doing: '进行中', done: '已完成' };
const DEFAULT_KEY = 'pmhub_v2_progress';
const PASS_PERCENT = 80;

function defaults() { return { quizBest: {}, flashKnown: {} }; }

export function createProgressStore(storage, key = DEFAULT_KEY) {
  if (!storage) throw new Error('storage is required (browser: localStorage, tests: Map-like)');

  function read() {
    try {
      const raw = JSON.parse(storage.getItem(key)) || {};
      return { ...defaults(), ...raw, quizBest: raw.quizBest || {}, flashKnown: raw.flashKnown || {} };
    } catch (e) {
      return defaults();
    }
  }
  function write(p) { storage.setItem(key, JSON.stringify(p)); }

  return {
    best(catId) { return read().quizBest[catId]; },
    /** 记录一次测验成绩，返回是否有进步 */
    recordQuiz(catId, percent) {
      const p = read();
      const improved = percent > (p.quizBest[catId] || 0);
      if (improved) { p.quizBest[catId] = percent; write(p); }
      return improved;
    },
    addFlashKnown(deckId, n) {
      const p = read();
      const id = deckId || 'all';
      p.flashKnown[id] = (p.flashKnown[id] || 0) + n;
      write(p);
    },
    status(catId) {
      const best = read().quizBest[catId];
      if (best == null) return 'todo';
      return best >= PASS_PERCENT ? 'done' : 'doing';
    },
    quizBestMap() { return { ...read().quizBest }; }
  };
}
