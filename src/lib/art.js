/* PMHub 术语配图深模块：termArt(term) → SVG 字符串。
 * 10 个旗舰术语手工图解 + 其余术语按哈希生成确定性唯一配图，全部为纯函数。
 */
import { esc, hashStr, mulberry32 } from './util.js';

const CUSTOM_ART = [
  { match: en => /Work Breakdown Structure/.test(en) && !/Dictionary/.test(en), art: artWBS },
  { match: en => /Critical Path Method/.test(en), art: artCPM },
  { match: en => /Earned Value Management/.test(en), art: artEVM },
  { match: en => /RACI Chart/.test(en), art: artRACI },
  { match: en => /Probability and Impact Matrix/.test(en), art: artMatrix },
  { match: en => /Project Life Cycle/.test(en), art: artLifecycle },
  { match: en => /Iterative Life Cycle|Incremental/.test(en), art: artIterative },
  { match: en => /Kanban/.test(en), art: artKanban },
  { match: en => /Cost Baseline/.test(en), art: artBaseline },
  { match: en => /Burndown/.test(en), art: artBurndown }
];

function svgWrap(inner, hueA, hueB) {
  return `<svg viewBox="0 0 800 340" xmlns="http://www.w3.org/2000/svg" role="img">
    <defs><linearGradient id="g${hueA}${hueB}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hueA},72%,52%)"/><stop offset="1" stop-color="hsl(${hueB},70%,44%)"/>
    </linearGradient></defs>
    <rect width="800" height="340" fill="url(#g${hueA}${hueB})"/>${inner}</svg>`;
}

// 生成式配图：节点网络 + 首字母，同术语每次生成结果一致
function generativeArt(zh, en) {
  const seed = hashStr(zh + '|' + en);
  const rand = mulberry32(seed);
  const hue = 200 + Math.floor(rand() * 140);
  const hue2 = (hue + 50) % 360;
  let inner = '';
  const nodes = [];
  for (let i = 0; i < 16; i++) {
    nodes.push({ x: 40 + rand() * 720, y: 30 + rand() * 280, r: 3 + rand() * 9 });
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
      if (Math.hypot(dx, dy) < 200) {
        inner += `<line x1="${nodes[i].x.toFixed(0)}" y1="${nodes[i].y.toFixed(0)}" x2="${nodes[j].x.toFixed(0)}" y2="${nodes[j].y.toFixed(0)}" stroke="rgba(255,255,255,.28)" stroke-width="1.2"/>`;
      }
    }
  }
  nodes.forEach(n => {
    inner += `<circle cx="${n.x.toFixed(0)}" cy="${n.y.toFixed(0)}" r="${n.r.toFixed(1)}" fill="rgba(255,255,255,${(0.35 + rand() * 0.4).toFixed(2)})"/>`;
  });
  const initial = (en || '?').trim().charAt(0).toUpperCase();
  inner += `<circle cx="400" cy="170" r="86" fill="rgba(255,255,255,.14)"/>`;
  inner += `<text x="400" y="206" font-size="110" font-weight="800" fill="rgba(255,255,255,.92)" text-anchor="middle" font-family="Arial">${esc(initial)}</text>`;
  inner += `<text x="400" y="300" font-size="20" font-weight="700" fill="rgba(255,255,255,.85)" text-anchor="middle">${esc(zh)}</text>`;
  return svgWrap(inner, hue, hue2);
}

function artWBS() {
  const box = (x, y, w, h, t, fs) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.7)" stroke-width="1.5"/><text x="${x + w / 2}" y="${y + h / 2 + 5}" font-size="${fs}" fill="#fff" text-anchor="middle" font-weight="600">${t}</text>`;
  let inner = box(320, 30, 160, 44, '项目 100%', 15);
  const xs = [60, 230, 400, 570];
  const labels = ['1.0 需求', '2.0 开发', '3.0 测试', '4.0 交付'];
  xs.forEach((x, i) => {
    inner += `<line x1="400" y1="74" x2="${x + 65}" y2="110" stroke="rgba(255,255,255,.6)" stroke-width="1.5"/>`;
    inner += box(x, 110, 130, 40, labels[i], 13);
    inner += `<line x1="${x + 65}" y1="150" x2="${x + 30}" y2="185" stroke="rgba(255,255,255,.45)" stroke-width="1.2"/>`;
    inner += `<line x1="${x + 65}" y1="150" x2="${x + 100}" y2="185" stroke="rgba(255,255,255,.45)" stroke-width="1.2"/>`;
    inner += box(x + 5, 185, 55, 34, '工作包', 11);
    inner += box(x + 72, 185, 55, 34, '工作包', 11);
  });
  return svgWrap(inner, 210, 260);
}
function artCPM() {
  let inner = '';
  const path = [[70, 240], [240, 160], [410, 240], [580, 120], [730, 180]];
  for (let i = 0; i < path.length - 1; i++) {
    inner += `<line x1="${path[i][0]}" y1="${path[i][1]}" x2="${path[i + 1][0]}" y2="${path[i + 1][1]}" stroke="#fde047" stroke-width="4"/>`;
  }
  inner += `<line x1="240" y1="160" x2="410" y2="60" stroke="rgba(255,255,255,.55)" stroke-width="2.5" stroke-dasharray="6 5"/>`;
  inner += `<line x1="410" y1="60" x2="580" y2="120" stroke="rgba(255,255,255,.55)" stroke-width="2.5" stroke-dasharray="6 5"/>`;
  path.forEach((p, i) => {
    inner += `<circle cx="${p[0]}" cy="${p[1]}" r="24" fill="rgba(255,255,255,.2)" stroke="#fff" stroke-width="2"/>`;
    inner += `<text x="${p[0]}" y="${p[1] + 5}" font-size="15" fill="#fff" text-anchor="middle" font-weight="700">${'ABCDE'[i]}</text>`;
  });
  inner += `<circle cx="410" cy="60" r="20" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.8)" stroke-width="1.5"/>`;
  inner += `<text x="410" y="65" font-size="13" fill="#fff" text-anchor="middle">F</text>`;
  inner += `<text x="400" y="305" font-size="18" font-weight="700" fill="rgba(255,255,255,.9)" text-anchor="middle">A→B→C→D→E = 关键路径（最长路径决定最短工期）</text>`;
  return svgWrap(inner, 190, 240);
}
function artEVM() {
  const axis = `<line x1="70" y1="280" x2="740" y2="280" stroke="rgba(255,255,255,.8)" stroke-width="2"/><line x1="70" y1="280" x2="70" y2="50" stroke="rgba(255,255,255,.8)" stroke-width="2"/>`;
  const curve = (d, color, w, dash) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
  let inner = axis;
  inner += curve('M70 60 C 260 80, 420 170, 740 258', 'rgba(255,255,255,.85)', 3, '8 6');
  inner += curve('M70 60 C 240 105, 400 210, 600 262', '#fde047', 4);
  inner += curve('M70 60 C 230 130, 380 240, 560 268', '#f472b6', 4);
  inner += `<circle cx="600" cy="262" r="6" fill="#fde047"/><circle cx="560" cy="268" r="6" fill="#f472b6"/>`;
  inner += `<text x="620" y="250" font-size="14" fill="#fde047" font-weight="700">EV 挣值</text>`;
  inner += `<text x="580" y="290" font-size="14" fill="#f472b6" font-weight="700">AC 实际成本</text>`;
  inner += `<text x="700" y="230" font-size="14" fill="rgba(255,255,255,.85)" font-weight="700">PV</text>`;
  inner += `<text x="400" y="320" font-size="17" font-weight="700" fill="rgba(255,255,255,.9)" text-anchor="middle">SV = EV − PV · CV = EV − AC · CPI = EV / AC</text>`;
  return svgWrap(inner, 200, 280);
}
function artRACI() {
  const head = ['R 执行', 'A 负责', 'C 咨询', 'I 知情'];
  const rows = [['需求分析师', 'A', 'C', 'R', 'I'], ['开发工程师', 'C', 'A', 'R', 'I'], ['测试工程师', 'I', 'C', 'R', 'A'], ['项目经理', 'A', 'R', 'C', 'I']];
  let inner = `<text x="150" y="52" font-size="16" fill="#fff" font-weight="700">任务 ↓ / 角色 →</text>`;
  head.forEach((h, i) => {
    inner += `<rect x="${270 + i * 110}" y="30" width="100" height="34" rx="7" fill="rgba(255,255,255,.25)"/><text x="${320 + i * 110}" y="53" font-size="14" fill="#fff" text-anchor="middle" font-weight="700">${h}</text>`;
  });
  rows.forEach((r, ri) => {
    const y = 78 + ri * 58;
    inner += `<rect x="60" y="${y}" width="180" height="48" rx="7" fill="rgba(255,255,255,.14)"/><text x="150" y="${y + 30}" font-size="14" fill="#fff" text-anchor="middle">${r[0]}</text>`;
    for (let i = 1; i <= 4; i++) {
      const v = r[i];
      const color = v === 'A' ? '#fbbf24' : v === 'R' ? '#34d399' : 'rgba(255,255,255,.25)';
      const txt = v === 'A' || v === 'R' ? '#0f172a' : '#fff';
      inner += `<rect x="${270 + (i - 1) * 110}" y="${y}" width="100" height="48" rx="7" fill="${color}"/><text x="${320 + (i - 1) * 110}" y="${y + 30}" font-size="16" fill="${txt}" text-anchor="middle" font-weight="800">${v}</text>`;
    }
  });
  return svgWrap(inner, 250, 210);
}
function artMatrix() {
  const labels = [['低', '中', '高'], ['低', '中', '高']];
  const colors = [['#34d399', '#fbbf24', '#f87171'], ['#fbbf24', '#f87171', '#ef4444'], ['#f87171', '#ef4444', '#dc2626']];
  let inner = '';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    inner += `<rect x="${230 + c * 110}" y="${190 - r * 55}" width="104" height="51" rx="7" fill="${colors[r][c]}" opacity=".92"/>`;
  }
  for (let i = 0; i < 3; i++) {
    inner += `<text x="${282 + i * 110}" y="315" font-size="14" fill="#fff" text-anchor="middle" font-weight="600">概率 ${labels[0][i]}</text>`;
    inner += `<text x="205" y="${222 - i * 55}" font-size="14" fill="#fff" text-anchor="middle" font-weight="600">${labels[1][i]}</text>`;
  }
  const dots = [[282, 190], [502, 135], [392, 80], [502, 80], [282, 135]];
  dots.forEach(d => { inner += `<circle cx="${d[0]}" cy="${d[1]}" r="7" fill="#1e293b" stroke="#fff" stroke-width="2"/>`; });
  inner += `<text x="230" y="52" font-size="17" font-weight="700" fill="#fff">↑ 影响</text>`;
  return svgWrap(inner, 15, 345);
}
function artLifecycle() {
  const stages = [['概念', '启动'], ['规划', '设计'], ['执行', '开发'], ['收尾', '上线']];
  let inner = '';
  stages.forEach((s, i) => {
    const x = 60 + i * 180;
    inner += `<path d="M${x} 140 L${x + 150} 140 L${x + 172} 190 L${x + 150} 240 L${x} 240 L${x + 22} 190 Z" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.75)" stroke-width="1.6"/>`;
    inner += `<text x="${x + 86}" y="182" font-size="16" fill="#fff" text-anchor="middle" font-weight="700">${s[0]}</text>`;
    inner += `<text x="${x + 86}" y="208" font-size="12.5" fill="rgba(255,255,255,.8)" text-anchor="middle">${s[1]}</text>`;
  });
  inner += `<text x="400" y="300" font-size="17" fill="rgba(255,255,255,.9)" text-anchor="middle" font-weight="600">成本与人力投入：执行阶段最高，风险：启动阶段最大</text>`;
  return svgWrap(inner, 220, 200);
}
function artIterative() {
  let inner = '';
  [70, 120, 170, 220].forEach((r, i) => {
    inner += `<circle cx="400" cy="190" r="${r}" fill="none" stroke="rgba(255,255,255,${0.9 - i * 0.18})" stroke-width="2.5" stroke-dasharray="340 ${r * 6.28 - 340}"/>`;
    inner += `<text x="${400 + r * 0.72}" y="${190 - r * 0.72 + 5}" font-size="14" fill="#fff" font-weight="700">迭代 ${i + 1}</text>`;
  });
  inner += `<circle cx="400" cy="190" r="16" fill="#fde047"/>`;
  inner += `<text x="400" y="330" font-size="16" fill="rgba(255,255,255,.9)" text-anchor="middle" font-weight="600">每轮迭代产出更接近目标的可工作版本</text>`;
  return svgWrap(inner, 160, 210);
}
function artKanban() {
  const cols = [['待办', 3, 'rgba(255,255,255,.18)'], ['进行中', 2, 'rgba(255,255,255,.32)'], ['已完成', 4, 'rgba(255,255,255,.5)']];
  let inner = '';
  cols.forEach((c, i) => {
    const x = 70 + i * 240;
    inner += `<rect x="${x}" y="50" width="210" height="230" rx="12" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.5)" stroke-width="1.5"/>`;
    inner += `<text x="${x + 105}" y="80" font-size="16" fill="#fff" text-anchor="middle" font-weight="700">${c[0]}${i === 1 ? '（WIP ≤ 3）' : ''}</text>`;
    for (let k = 0; k < c[1]; k++) {
      inner += `<rect x="${x + 18}" y="${100 + k * 42}" width="174" height="32" rx="7" fill="${c[2]}"/>`;
    }
  });
  inner += `<text x="400" y="315" font-size="16" fill="rgba(255,255,255,.9)" text-anchor="middle" font-weight="600">限制在制品数量，让瓶颈无处可藏</text>`;
  return svgWrap(inner, 190, 260);
}
function artBaseline() {
  let inner = `<line x1="70" y1="280" x2="740" y2="280" stroke="rgba(255,255,255,.8)" stroke-width="2"/><line x1="70" y1="280" x2="70" y2="50" stroke="rgba(255,255,255,.8)" stroke-width="2"/>`;
  const steps = [[70, 250], [200, 250], [200, 205], [350, 205], [350, 150], [520, 150], [520, 95], [740, 95]];
  let d = `M${steps[0][0]} ${steps[0][1]}`;
  for (let i = 1; i < steps.length; i++) d += ` L${steps[i][0]} ${steps[i][1]}`;
  inner += `<path d="${d}" fill="none" stroke="#fde047" stroke-width="4"/>`;
  steps.forEach((p, i) => { if (i % 2 === 0) inner += `<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="#fff"/>`; });
  inner += `<text x="400" y="55" font-size="15" fill="rgba(255,255,255,.9)" font-weight="700">成本基准 = 按时间段分配的批准预算（累计 S 曲线）</text>`;
  inner += `<text x="400" y="315" font-size="14" fill="rgba(255,255,255,.85)" text-anchor="middle">变更只能走正式的变更控制程序</text>`;
  return svgWrap(inner, 205, 255);
}
function artBurndown() {
  let inner = `<line x1="70" y1="280" x2="740" y2="280" stroke="rgba(255,255,255,.8)" stroke-width="2"/><line x1="70" y1="280" x2="70" y2="50" stroke="rgba(255,255,255,.8)" stroke-width="2"/>`;
  inner += `<line x1="70" y1="60" x2="740" y2="270" stroke="rgba(255,255,255,.55)" stroke-width="2.5" stroke-dasharray="8 6"/>`;
  const pts = [[70, 65], [170, 110], [260, 95], [350, 160], [450, 190], [540, 215], [640, 255], [740, 268]];
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  pts.forEach(p => { d += ` L${p[0]} ${p[1]}`; });
  inner += `<path d="${d}" fill="none" stroke="#fde047" stroke-width="4"/>`;
  pts.forEach(p => { inner += `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#fff"/>`; });
  inner += `<text x="700" y="105" font-size="14" fill="rgba(255,255,255,.85)" font-weight="700">理想线</text>`;
  inner += `<text x="150" y="45" font-size="14" fill="#fde047" font-weight="700">剩余工作量</text>`;
  inner += `<text x="400" y="315" font-size="15" fill="rgba(255,255,255,.9)" text-anchor="middle" font-weight="600">迭代燃尽图：实际线持续高于理想线 = 范围可能过大</text>`;
  return svgWrap(inner, 150, 220);
}

/** 术语配图唯一入口 */
export function termArt(term) {
  for (const c of CUSTOM_ART) {
    try { if (c.match(term.en, term.zh)) return c.art(); } catch (e) { /* fallback */ }
  }
  return generativeArt(term.zh, term.en);
}
