# 站台 · 卡牌对战平台 - 前端（zhanshuangFE）

> 基于 [RuoYi-Vue3](https://gitee.com/y_project/RuoYi-Vue) v3.9.2 二次开发的**集换式卡牌对战模拟器前端**，与后端仓库 [`zhanshuangHoutai`](https://github.com/shiki916/zhanshuangHoutai) 配套使用。

---

## 1. 项目是干什么的？

这是一个**1v1 卡牌对战（TCG/CCG）模拟器**的运营管理 + 对战界面前端，重点服务于"自研卡牌"的规则演练、组卡管理、对局回放。

### 已落地的玩法核心（前端可见部分）

- **标准/有序 两种起手模式**：先手 / 后手由系统随机指定，先手玩家优先进行"换牌（Mulligan）"。
- **50 张构筑牌组**：双方必须正好 50 张牌才能开战，牌组可命名、保存、复用。
- **侵蚀（Erosion）生命体系**：每位玩家有 `erosion / 7` 的"侵蚀"生命值，每承受 1 次伤害，侵蚀数 +1；当某玩家侵蚀达到 7 时失败。界面顶部为双方摘要，下方为侵蚀轨道。
- **战场分区**：左右两块大棋盘（玩家一、玩家二），每边包含 5 格战场（Battlefield）、牌组区、墓地、套牌预览、手牌、侵蚀计数区 6 个分区。
- **完整的战斗流程**：换牌 → 抽牌 → 攻/防摆放 → 触发卡牌效果（已实现自动 resolution）→ 回合推进。
- **自动效果解析 + 人工接管**：若某张卡的效果未在 `engine/effect` 中预置编码，对局会被 `halt` 住，弹窗保留现场，可人工补判，避免数据丢失。
- **规则表浏览（rules-table）**：可开 `complete-table` 页面查看双方完整版面，便于远端裁判或复盘。
- **组卡管理**：在 `src/game-platform/stores/decks` 下用 Pinia 管理保存的多套牌组。

> 这套前端不仅是个对战 UI，更是一个**对局引擎的"驾驶舱"**——所有规则判定都由后端 `ruoyi-game` 完成，前端只负责渲染与操作。

### 与标准 RuoYi 模板的差异

| 区域 | 原 RuoYi | 本项目 |
| --- | --- | --- |
| `src/views/` | 系统管理类页面 | 系统管理 + 新增「对战平台」菜单（`src/game-platform/views`） |
| `src/game-platform/` | 不存在 | 本项目**增量**目录：平台入口、对局界面、组卡 store、卡牌 service |
| `vite.config.js` | 默认后端 `localhost:8080` | 保持默认，可直接对接后端 |
| 路由 | RuoYi 静态菜单 | 增加 `/game-platform/*` 一组动态菜单（在 RuoYi「菜单管理」里挂载） |

---

## 2. 技术栈

| 层 | 选型 | 版本 |
| --- | --- | --- |
| 框架 | Vue | 3.5.26 |
| UI | Element Plus | 2.13.1 |
| 构建 | Vite | 6.4.1 |
| 状态管理 | Pinia | 3.0.4 |
| 路由 | Vue Router | 4.6.4 |
| 图表 | ECharts | 5.6.0（监控页用） |
| 请求 | Axios | 1.13.2 |
| 富文本 | @vueup/vue-quill | 1.2.0 |
| 工具 | js-cookie / nprogress / fuse.js / jsencrypt / papaparse | — |

> 若启用 TypeScript 模块（`game-platform/*.ts`），已内置路径别名 `@` → `src/` 与 `~` → 项目根。

---

## 3. 目录结构（重点部分）

```
src/
├── api/                     # RuoYi 内置：登录/用户/角色等 RESTful 请求
├── layout/                  # RuoYi 内置：总体布局、侧边栏、顶栏
├── views/                   # RuoYi 内置：各业务页面
├── router/  store/  utils/  # RuoYi 内置
├── components/              # 通用组件
├── assets/                  # 图片、图标、SCSS 资源
└── game-platform/           # ⭐ 站台 · 卡牌对战自定义模块
    ├── GamePlatform.vue     # 平台主入口（含嵌入的子视图）
    ├── views/
    │   ├── GameTable.vue    # ⭐ 完整对局台（双方版面 + 手牌 + 侵蚀）
    │   └── …                # 其余规则浏览、组卡、战绩等视图
    ├── stores/              # decks / cards / game（Pinia）
    ├── services/            # 与后端 ruoyi-game 通信的 axios 封装
    ├── game/                # 26 个 .ts：纯前端状态计算、动画、派生
    ├── components/          # 平台内的子组件（卡牌、弃牌堆…）
    ├── catalog-types.ts     # 卡牌/牌组/效果的 DTO 类型
    ├── types.ts             # 全局 TS 类型
    └── *.css                # 平台专用样式（rules-table / mulligan …）
```

> **`game/` 目录说明**：这里的 26 个 TS 文件是前端本地维护的对局快照、动画队列、回合切换等逻辑。**任何 "什么时候扣 1 点侵蚀"、"什么时候切到对方回合"、"换牌怎么洗切"** 这些边角逻辑都在这里。

---

## 4. 快速开始

### 4.1 环境要求

- Node.js ≥ 18
- npm / pnpm / yarn 任选
- 后端仓库 [`zhanshuangHoutai`](https://github.com/shiki916/zhanshuangHoutai) 已能在 `http://localhost:8080` 启动

### 4.2 启动

```bash
cd RuoYi-Vue3-master
npm install            # 或 pnpm install / yarn
npm run dev            # 启动开发服，默认 http://localhost:80
```

构建产物：

```bash
npm run build:prod     # 生产构建 → dist/
npm run build:stage    # 预发构建
npm run preview        # 本地预览构建产物
```

### 4.3 接入后端

`vite.config.js` 已经把 `/dev-api` 代理到 `http://localhost:8080`，所以只要**先**启后端（Spring Boot 监听 8080）**再**启前端，登录、调用都走代理，无跨域问题。

如需切换后端地址，修改 `vite.config.js` 第 5 行：

```js
const baseUrl = 'http://localhost:8080' // 改成你的后端地址
```

或新建 `.env.development` / `.env.production`，将后端地址放进 `VITE_APP_BASE_API`，再让代码引用 `import.meta.env.VITE_APP_BASE_API`。

---

## 5. 未来如何扩展 / 接入新功能

### 5.1 新增一个【业务菜单】

1. 在 **后端 → 菜单管理** 录入：路由、组件路径、权限标识。
2. 在 `src/views/` 下新建一个 `.vue` 文件，组件路径要和后端保持一致（如 `game/replay/index`）。
3. 在 `src/api/` 下编写对应的 axios 方法。
4. 在 `src/permission.js` 确认动态路由刷新后能命中你的组件名。

### 5.2 新增一个【对战模式 / 新卡牌 / 新效果】

所有**规则/动作/效果/解析**都由后端引擎承担：

| 改的内容 | 前端要做的 | 后端要做的 |
| --- | --- | --- |
| 新增一种**起手规则** | 1）在 `views/GameTable.vue` 的 mode 下拉里加新值 2）传给 `game.start(..., mode)` | 在 `ruoyi-game/engine/start/` 加起始策略类 |
| 新增一种**卡牌效果** | 一般**不用改**——前端只负责显示"我方执行 X，对方执行 Y" | 在 `ruoyi-game/engine/effect/` 加 EffectHandler，引擎自动派发 |
| 新增一种**回合阶段** | 在 `src/game-platform/game/` 加阶段切换的纯函数 | 在 `engine/state/` 加状态机节点 |
| 新增一种**伤害类型** | 调整 `services/` 里 fight 调用的 payload | 在 `engine/resolution/` 里落地判定 |

> **原则**：前端尽量保持"薄"，把规则全部下沉到后端 `ruoyi-game`。任何"看起来很简单但前后端都要改"的改动，都应该**先在 `ruoyi-game` 加引擎类，再在前端补 UI**。

### 5.3 新增独立模块（例如战绩 / 好友 / 商城）

1. 后端：在 `ruoyi-system` 或新建 `ruoyi-xxx` 模块，写 Controller / Service / Mapper / SQL。
2. 前端：在 `src/api/systemXxx.js` 加 axios，在 `src/views/systemXxx/` 加页面，在「菜单管理」注册。
3. 如果页面需要嵌入对战台 iframe，按以下结构承载即可：

```vue
<!-- 在 src/views/game/embed.vue 中 -->
<iframe :src="'/game-platform/table?matchId=' + id" class="full-iframe" />
```

### 5.4 打包上线

```bash
npm run build:prod            # 生成 dist/
# 把 dist/ 整个目录丢到 Nginx / 静态服务器
# Nginx 配置 try_files + 反代 /dev-api 到真正的后端即可
```

---

## 6. 与后端的对接清单

| 接口前缀 | 用途 | 后端 Controller |
| --- | --- | --- |
| `/dev-api/login` | 登录 | `RuoYi 内置 SysLoginController` |
| `/dev-api/getInfo` | 取用户/权限 | `SysLoginController.getInfo` |
| `/dev-api/game/**` | 对战相关 | `ruoyi-game/controller/*Controller` |

> 登录/权限完全沿用 RuoYi 的 JWT 流程，前端无需改造任何鉴权代码，**只要 RuoYi 登录跑通，业务接口的 token 也能用**。

---

## 7. 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 开发模式（默认 :80，自动打开浏览器） |
| `npm run build:prod` | 生产构建 |
| `npm run build:stage` | 预发构建 |
| `npm run preview` | 预览构建产物 |

---

## 8. 仓库信息

- 仓库地址：https://github.com/shiki916/zhanshuangFE
- 配套后端：https://github.com/shiki916/zhanshuangHoutai
- 基于框架：[RuoYi-Vue3 v3.9.2](https://gitee.com/y_project/RuoYi-Vue)
- License：MIT（沿用 RuoYi）
