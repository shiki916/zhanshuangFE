# 战双 TCG · 管理后台前端（zhanshuangFE）

> 基于 [RuoYi-Vue3](https://gitee.com/y_project/RuoYi-Vue) v3.9.2 二次开发的 **"战双 TCG" 联机卡牌游戏**管理后台 + 对战平台前端，与后端 [`zhanshuangHoutai`](https://github.com/shiki916/zhanshuangHoutai) 配套使用。
>
> "战双 TCG" 是把本地 Vue 3 卡牌模拟器改造为"前后端分离 + 联机对局"的项目。所有规则、判定和随机都由后端权威结算，前端只提交操作意图并展示状态。

---

## 1. 项目是干什么的？

### 1.1 一句话定义

> 战双 TCG = 一款自研卡牌对战游戏的后台前端，**同时承担卡池管理后台和 1v1 联网对战平台两个角色**。

### 1.2 当前实际能做到的事

| 能力 | 在前端哪里 |
| --- | --- |
| **运营后台**（卡池 CRUD、用户、角色/菜单/字典） | 标准 RuoYi 页面 `src/views/` |
| **卡池管理**（卡牌列表、CSV 导入入口） | 菜单「卡池管理」 |
| **登录分流**（admin 进后台，否则进对战平台） | `src/permission.js` + 登录页 |
| **对战平台首页** | `/game` 全屏路由 |
| **组卡器**（50 张构筑、与后端公共卡池联动） | `src/game-platform/views/deck` |
| **对局桌面**（双方版面、手牌、5 卡位战场、侵蚀轨道） | `src/game-platform/views/GameTable.vue` |
| **数值纠错**、规则浏览 | `src/game-platform/views/...` |

### 1.3 玩法铁律（必须知道）

- **50 张牌组**：同编号最多 4 张；红 / 蓝 / 黄信号球各 4 张。
- **5 卡位战场**：固定 5 个卡位，角色 / 道具落位前必须校验合法性。
- **7 点侵蚀生命**：`erosion / 7`，达到即败北。
- **8 个顶层回合阶段**：`OPENING → STAND → DRAW_FILL → MAIN → END`。其他瞬时自由时点（攻击宣言、阻挡、结算暂停）走独立子状态，不混入顶层阶段。
- **后端权威**：洗切、合法性、效果、胜负完全由后端 `ruoyi-game` 决定；前端 Pinia store 改为展示层。客户端不能下发随机数。
- **未知效果自动 halt**：若卡牌的 `effectKey` 在后端引擎无对应 Handler，对局被 halt，前端保留现场等人工补判。
- **385 张卡牌**：覆盖 ST01～ST06 + BP01～BP03 + PR 共 385 个唯一 `cardNo`。
- **卡表来源**：管理后台录入 + CSV 导入；前端 `GET /dev-api/game/card/public/list` 取公共卡池（无需 Token）。

### 1.4 与标准 RuoYi 模板的差异

| 区域 | 原 RuoYi | 本项目 |
| --- | --- | --- |
| 菜单 | 仅系统管理类 | +「卡池管理」「对战平台」 |
| `src/views/` | 标准业务页 | + 卡池 CRUD 页 |
| `src/game-platform/` | 不存在 | ⭐ 原模拟器整套迁入，作为对战平台 |
| 路由 | 静态 | 动态路由 + 登录分流 |
| 状态管理 | Pinia 只管后台 | Pinia 同时管对局展示层（仅展示权威状态） |
| 资源 | 默认资源 | 624 个卡图版本（`card-variants.csv`）保留 |

---

## 2. 技术栈

| 层 | 选型 | 版本 |
| --- | --- | --- |
| 框架 | Vue | 3.5.26 |
| UI | Element Plus | 2.13.1 |
| 构建 | Vite | 6.4.1 |
| 状态管理 | Pinia | 3.0.4 |
| 路由 | Vue Router | 4.6.4 |
| 图表 | ECharts | 5.6.0 |
| 请求 | Axios | 1.13.2 |
| 富文本 | @vueup/vue-quill | 1.2.0 |
| 工具 | js-cookie / nprogress / fuse.js / jsencrypt / papaparse | — |

> `papaparse 5.5.3` 用于卡牌 CSV（仅在游戏平台内使用）。
> `game-platform/*.ts`：项目内 TypeScript 子集（与原模拟器保持一致）。

---

## 3. 目录结构

```
RuoYi-Vue3-master/
├── src/
│   ├── api/                      # RuoYi RESTful 请求层
│   ├── layout/                   # RuoYi 布局 / 侧边栏 / 顶栏
│   ├── views/                    # 标准后台页面 + 卡池管理
│   ├── router/  store/  utils/   # RuoYi 内置
│   ├── components/               # 通用组件
│   ├── permission.js             # 登录动态路由 + 角色分流
│   └── game-platform/            # ⭐ 战双 TCG 对战平台（迁入自原模拟器）
│       ├── GamePlatform.vue      # 平台主入口
│       ├── views/
│       │   ├── GameTable.vue     # ⭐ 完整对局台
│       │   ├── deck/             # 组卡器
│       │   └── ...               # 规则浏览、数值纠错
│       ├── stores/               # Pinia（cards / decks / game）— 仅展示层
│       ├── services/             # 后端 ruoyi-game 的 axios 封装
│       ├── game/                 # 26 个本地状态机 .ts（不含随机判定）
│       ├── components/           # 卡牌、弃牌堆等子组件
│       └── *.css                 # 平台专用样式
├── public/                       # 资源 + 624 个卡图版本 CSV
├── docs/                         # ⭐ 协作与规划文档
└── vite.config.js                # dev-api 反代到 :8080
```

> **`game/` 是纯展示层**：只负责动画、UI 状态机、回合切换的临时状态，**所有规则判定和随机都从后端拿**。

---

## 4. 快速开始

### 4.1 环境要求

- Node.js ≥ 18
- npm / pnpm / yarn 任选
- 后端 [`zhanshuangHoutai`](https://github.com/shiki916/zhanshuangHoutai) 已在 `http://localhost:8080` 启动

### 4.2 启动

```bash
cd RuoYi-Vue3-master
npm install                # 或 pnpm install / yarn
npm run dev                # http://localhost:80（自动打开浏览器）
```

构建产物：

```bash
npm run build:prod         # 产线构建 → dist/
npm run build:stage        # 预发构建
npm run preview            # 本地预览构建产物
```

### 4.3 接入后端

`vite.config.js` 已经把 `/dev-api` 和 `/v3/api-docs` 代理到 `http://localhost:8080`，**先启后端、再启前端**即可。

如需切换后端地址，改 `vite.config.js` 第 5 行：

```js
const baseUrl = 'http://localhost:8080' // 改成你的后端地址
```

或新建 `.env.production`：

```
VITE_APP_BASE_API=http://your-backend/
```

代码里用 `import.meta.env.VITE_APP_BASE_API` 取。

### 4.4 登录分流

- 角色包含 `admin` → **运营后台**（卡池、用户、字典等菜单）
- 其他用户（含 `player`、默认角色）→ **对战平台** `/game`
- 退出登录入口已在对战平台页面提供

### 4.5 默认账号

- `admin / admin123`（运营后台入口，需执行 `sql/ry_*.sql` 初始化数据库）
- 任意 `player` 或自建用户，进入对战平台

---

## 5. 未来怎么接入 / 扩展

### 5.1 新增【运营后台业务菜单】

1. 后端 → 「菜单管理」录入：路由、组件路径、权限标识。
2. `src/views/<biz>/index.vue` 加页面。
3. `src/api/<biz>.js` 加 axios。
4. `src/permission.js` 确认动态路由能命中组件名。

### 5.2 新增【卡牌 / 效果】

> **铁律**：规则下沉到后端 `ruoyi-game/engine/`，前端只改 UI。

| 改的内容 | 前端要做的 | 后端要做的 |
| --- | --- | --- |
| 新增卡牌数据 | 公共卡池接口自动拉取，**前端无代码改动** | `game_card` 表插入；或 `POST /game/card/import` 上传 CSV |
| 新增一种卡牌效果 | 一般**不动** | `ruoyi-game/engine/effect/` 加 EffectHandler 注册到派发表 |
| 新增一种阶段 | `game/` 改动画 + 提示 | `engine/state/` 改状态机 |
| 新增回合阶段内行动 | 改 `services/` 里调用 payload | `engine/resolution/` 落地判定 |

### 5.3 新增独立模块（房间、匹配、好友…）

后端依赖 `room` / `match` 等模块；前端需要时：

1. 新建 `src/views/<biz>/` 页面。
2. 在「菜单管理」注册或在 `game-platform` 路由里新增。
3. 用 `src/api/<biz>.js` 调后端。
4. 若要 WebSocket 推送，新建 `src/services/<biz>-ws.ts` 用浏览器原生 WebSocket。

### 5.4 上线

```bash
npm run build:prod   # dist/
# Nginx 反代：
#   / → 前端静态
#   /dev-api / /v3/api-docs / /ws → 后端
```

---

## 6. 对接接口速查

| 路径前缀 | 用途 | 后端位置 |
| --- | --- | --- |
| `/dev-api/login` `/getInfo` `/logout` | 鉴权 | `RuoYi SysLoginController` |
| `/dev-api/system/**` | 用户/角色/菜单/字典 | `RuoYi system` 模块 |
| `/dev-api/game/card/list` | 卡池管理（需 Token） | `ruoyi-game.controller.GameCardController` |
| `/dev-api/game/card/public/list` | 公共卡池（无需 Token） | 同上 |
| `/dev-api/game/card/import` | CSV 导入（`POST` multipart） | 同上 |
| `/dev-api/game/deck/**` | 当前用户卡组 CRUD | `GameDeckController` |

> 登录 / 权限沿用 RuoYi JWT，前端**无须额外鉴权代码**，业务接口直接共用 `Authorization` Header。

---

## 7. 仓库附带文档（请同时阅读）

| 文档 | 作用 |
| --- | --- |
| [`docs/AGENTS.md`](docs/AGENTS.md) | AI 协作规则：教学方式、规则依据、审查冻结 |
| [`docs/ENGINE_IMPLEMENTATION_PLAN.md`](docs/ENGINE_IMPLEMENTATION_PLAN.md) | 长期路线图：6 个阶段的实施顺序与验收标准 |
| [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) | 当前进度：已闭环、下一步、踩坑记录 |

---

## 8. 仓库信息

- 仓库地址：https://github.com/shiki916/zhanshuangFE
- 配套后端：https://github.com/shiki916/zhanshuangHoutai
- 原始模拟器位置：`E:\zhanshuangmoniqi`（已迁入 `src/game-platform/`）
- 规则知识库：`D:\download\战双TCG规则知识库.md`
- 基于框架：[RuoYi-Vue3 v3.9.2](https://gitee.com/y_project/RuoYi-Vue)
- License：MIT（沿用 RuoYi）
