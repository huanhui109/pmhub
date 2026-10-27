/* PMHub 术语库深模块：隐藏 glossary.json 结构、关键词分类映射与缩写索引。
 * 接口：load(url) → Glossary 实例；get/byCat/search/abbrOf。
 * 调用方不需要知道 terms 数组如何被分类、缩写表如何倒排。
 */
import { hashStr } from './util.js';

// 术语 -> 章节 关键词映射（按优先级匹配，命中第一个即归类）
const TERM_MAP = [
  ['scope', ['范围', 'WBS', '工作分解', '需求', '验收', '产品分析', '原型', '焦点小组', '引导', '需求跟踪', '范围说明书', '标杆对照']],
  ['schedule', ['进度', '关键路径', '里程碑', '网络', '紧前', '紧后', '提前量', '滞后量', '赶工', '快速跟进', '资源平衡', '资源平滑', '浮动', '最早开始', '最晚开始', '最早完成', '最晚完成', '持续时间', '滚动式规划', '提前完成', '路径汇聚', '路径分支']],
  ['cost', ['成本', '预算', '挣值', '完工', '储备', '资金', '估算', '类比', '参数', '自下而上', '三点估算', '价值工程', '绩效审查']],
  ['quality', ['质量', '缺陷', '审计', '核对单', '控制图', '因果', '帕累托', '散点图', '直方图', '检查', '测试', '统计抽样', '持续改进', '根本原因', '质量保证', '质量管理']],
  ['communication', ['沟通', '报告', '会议', '演示', '反馈', '信息发射', '沟通模型', '沟通方法', '沟通技术', '报告系统']],
  ['stakeholder', ['相关方', '团队', '冲突', '谈判', '领导力', '激励', '团队章程', '集中办公', '虚拟团队', '认可与奖励', '培训', '个人和团队评估', '情商', '决策', '影响力', '政治意识', '文化意识']],
  ['risk', ['风险', '威胁', '机会', '应急应对', '弹回计划', '风险登记', '风险分解', '定性', '定量', '敏感性', '决策树', '风险应对', '整体风险', '风险偏好', '风险承受力', '风险临界值', '暴露', '风险审计', '技术绩效分析', '储备分析']],
  ['procurement', ['采购', '合同', '卖方', '买方', '投标', '招标', '协议', '索赔', '工作说明书', '邀请书', '建议书', '资格预审', '预审']],
  ['agile', ['敏捷', '迭代', '增量', 'Scrum', '看板', '燃尽', '用户故事', '待办', '冲刺', '自组织', '回顾', '每日站会', '故事点', '在制品', '结对', '敏捷', '发布规划', '刺探', '仆人式', '时间盒', '评审会', '规划会']],
  ['change', ['变更', '配置', '收尾', '移交', '经验教训', '最终报告', '行政收尾']],
  ['metrics', ['度量', '指标', '测量', '偏差分析', '趋势分析', '核对表', '挣值分析', '绩效', '基准']],
  ['initiating', ['章程', '商业论证', '效益', '项目集', '项目组合', '发起人', '事业环境', '组织过程资产', '生命周期', '治理', '项目办公室', 'PMO', '项目说明']]
];

export function classifyTerm(zh, en) {
  const text = (zh || '') + ' ' + (en || '');
  for (const [cat, kws] of TERM_MAP) {
    for (const k of kws) if (text.includes(k)) return cat;
  }
  return 'common';
}

export class Glossary {
  constructor(raw) {
    this.abbreviations = raw.abbreviations || {};
    this.terms = (raw.terms || []).map((t, i) => ({
      zh: t.zh, en: t.en, def: t.def,
      cat: classifyTerm(t.zh, t.en), idx: i
    }));
    this._abbrRev = {};
    Object.entries(this.abbreviations).forEach(([a, zh]) => { this._abbrRev[zh] = a; });
  }

  get size() { return this.terms.length; }
  get abbreviationCount() { return Object.keys(this.abbreviations).length; }

  abbrOf(zh) { return this._abbrRev[zh]; }
  get(idx) { return this.terms[idx]; }
  byCat(catId) { return this.terms.filter(t => t.cat === catId); }

  search({ q = '', letter = '' } = {}) {
    const query = q.trim().toLowerCase();
    return this.terms.filter(t => {
      if (letter && t.en.trim().charAt(0).toUpperCase() !== letter) return false;
      if (query && !(t.zh.toLowerCase().includes(query)
        || t.en.toLowerCase().includes(query)
        || t.def.toLowerCase().includes(query))) return false;
      return true;
    });
  }

  static async load(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`glossary load failed: HTTP ${resp.status}`);
    return new Glossary(await resp.json());
  }
}
