# PMHub · IT 项目管理知识库

面向 IT 从业者的项目管理课程式知识库：**12 章实战场景问答 + 465 条 PMBOK 官方术语详解（配图）+ 章节测验与闪卡练习**，参考交互式课程（course）模式组织，纯静态站点、零前端依赖。

**线上地址：<https://pmcore.pages.dev>**

![技术栈](https://img.shields.io/badge/stack-ES%20Modules%20%C2%B7%20zero--dep-brightgreen) ![license](https://img.shields.io/badge/license-MIT-blue)

## ✨ 功能

| 模块 | 说明 |
| --- | --- |
| 📚 课程章节 | 12 章按真实项目推进顺序组织，共 **86 个实战场景**，点击卡片展开应对方法 |
| 📖 术语库 | 《PMBOK® 指南》第六版术语表 **465 条**完整收录，支持搜索 / 英文首字母筛选 / 45 个常用缩写速查 |
| 🎨 术语配图 | 每个术语配专属图解：10 个旗舰术语定制 SVG 插画 + 按术语生成的几何艺术图 |
| 📝 章节测验 | 每章自动生成 10 题（7 术语定义题 + 3 场景判断题），≥80 分章节标记完成 |
| 🃏 闪卡记忆 | 抽 20 张卡片翻面自测，标记「已掌握 / 仍陌生」，陌生卡片本轮结束后重练 |
| 📈 进度追踪 | 测验最佳成绩与章节完成状态保存在本地浏览器（localStorage） |

## 🚀 快速开始

```bash
npm run dev          # 启动本地服务器，默认 http://127.0.0.1:7100
npm run dev -- --port 7102   # 指定端口
```

无需安装任何依赖（Node.js ≥ 18 即可）。注意：必须通过本地服务器访问（ES Modules + fetch 术语库），直接双击 `index.html` 无法运行。

```bash
npm test             # 运行单元测试（node:test，18 个用例）
```

## 🗂 目录结构

```
pmbook-site/
├── index.html            # 入口页（含全部样式与导航）
├── glossary.json         # 术语库数据（PMBOK 第六版术语表提取）
├── server.js             # 零依赖静态服务器（ESM，支持 --host/--port）
├── deploy.py             # Cloudflare Pages 直传部署脚本
├── src/
│   ├── main.js           # 启动 + hash 路由（路由表即全部页面映射）
│   ├── data/scenarios.js # 12 章 × 86 个实战场景数据
│   ├── lib/              # 深模块：纯逻辑，无 DOM，可独立测试
│   │   ├── glossary.js   #   术语库：load/get/byCat/search/abbrOf（隐藏分类映射）
│   │   ├── quiz.js       #   测验引擎：buildQuiz(seed) 纯函数出题
│   │   ├── deck.js       #   闪卡会话状态机 + 抽卡组
│   │   ├── progress.js   #   进度存储：localStorage 键与判分规则收敛于此
│   │   ├── art.js        #   术语配图：10 个定制 SVG + 生成式几何图
│   │   └── util.js       #   esc / hash / 随机 / 洗牌等纯函数
│   └── views/            # 视图层：view(ctx, params) 返回 HTML，bind 绑事件
│       ├── home.js       #   课程首页
│       ├── chapter.js    #   章节详情
│       ├── terms.js      #   术语库浏览
│       ├── term.js       #   术语详情（配图 + 相关场景）
│       ├── quiz.js       #   章节测验
│       ├── flash.js      #   闪卡练习
│       └── shared.js     #   共享片段（卡片 / 术语瓦片 / 404）
└── test/                 # node:test 单元测试（glossary / quiz / deck）
```

## 🧠 架构：深模块设计

重构前全部逻辑挤在一个 755 行的 IIFE 里（`app.js`），术语分类映射、判分规则、洗牌算法、localStorage 键名散落于视图代码中，无法在边界处测试。重构遵循 John Ousterhout《软件设计哲学》的**深模块**原则——接口简单、隐藏实现复杂度：

- **`buildQuiz({catId, categories, glossary, seed})`**：调用方只需给一个种子，出题、抽样、干扰项、洗牌全部在模块内完成；注入相同种子即完全确定，使测验逻辑可以脱离浏览器测试。
- **`Glossary.load(url)`**：调用方不需要知道 `glossary.json` 的结构、关键词分类映射表 `TERM_MAP`、缩写表如何倒排——这些都隐藏在模块内部。
- **`createProgressStore(storage, key)`**：localStorage 键名与「≥80 分 = 完成」规则只存在于这一处，视图层不再各自判断；测试时注入 Map-like 对象即可。
- **刻意保持零依赖**：视图层只是「返回 HTML 字符串 + 绑定事件」的函数，没有引入任何组件框架——对一个 86 场景的静态站，框架的复杂度高于收益。

详见仓库 Issue 中的重构 RFC。

## ☁️ 部署（Cloudflare Pages）

`deploy.py` 复刻了 `wrangler pages deploy` 的 API 流程（upload-token → check-missing → blake3 上传 → upsert-hashes → 创建 deployment），但直接用 REST 调用，不依赖 wrangler CLI。

```bash
export CF_TOKEN="cfat_xxx"        # Cloudflare API Token（需 Pages:Edit 权限）
export CF_ACCOUNT_ID="xxxxxxxx"   # Cloudflare 账户 ID
python3 deploy.py                 # 或 npm run deploy
```

> Token 从环境变量读取，**不要**写入源码或提交到仓库。首次使用需 `pip install blake3`。

也可以直接把 `index.html`、`glossary.json`、`src/` 作为静态资产接入任何托管服务（GitHub Pages / Netlify / Vercel 均可，无需构建步骤）。

## ⚠️ 版权与商标声明

- 术语定义摘自《PMBOK® 指南》第六版术语表，**仅供学习参考**；场景内容为基于 PMBOK 第 6/7 版及敏捷实践的原创整理。
- **PMBOK®、PMP® 为 PMI, Inc. 的注册商标**，本项目与 PMI 无隶属关系，未获得其背书。
- 本项目代码以 MIT 协议开源；`glossary.json` 数据版权归原作者所有，如涉版权问题请联系删除。

## 📄 License

[MIT](LICENSE) © 2026 jason (@huanhui109)
