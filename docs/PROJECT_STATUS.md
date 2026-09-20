# 战双卡牌联机项目进度

更新时间：2026-09-08

## 最终架构

- 游戏前端：现有 Vue 3 + TypeScript + Vite + Pinia 卡牌模拟器
- 管理后台：RuoYi Vue3，用于卡池、用户、卡组及运营数据管理
- 后端：RuoYi / Spring Boot 4、Java 17
- 基础设施：MySQL、Redis，后续加入 WebSocket 和 Docker 部署

## 已完成

- JDK 17 已配置，RuoYi 3.9.2 后端可正常启动。
- MySQL 8.4.11 LTS 已安装为 Windows 服务，端口 `3306`，数据目录在 E 盘。
- `ry-vue` 数据库已创建，并导入 RuoYi 主库及 Quartz SQL。
- Redis 3.2.100 当前在本机 `6379` 端口可用；后续计划换成 Docker Redis 7.4。
- Docker Desktop 已安装并运行，数据盘迁移到 `E:\docker\DockerDesktopWSL`。
- 后端创建 `ruoyi-game` Maven 模块，并接入根聚合工程和 `ruoyi-admin`。
- 创建 `game_card` 表，共 21 个字段；`card_no` 有唯一索引 `uk_game_card_card_no`。
- 使用 RuoYi 代码生成器生成卡牌 CRUD：包名 `com.ruoyi.game`、模块名 `game`、业务名 `card`。
- 生成的 Java、Mapper XML、管理后台 API 和页面已复制到对应工程。
- `cardMenu.sql` 已完整执行：7/7 条语句成功，新增 1 条菜单和 5 条按钮权限。
- 重新登录后，“卡池管理”页面已正常出现。
- 卡池页面已能加载；初始空列表状态已完成验证，随后通过页面新增过一张测试卡。
- 已验证 `GET /game/card/list` 完整链路，返回若依标准分页结构。
- 已通过管理后台新增测试卡，验证 Controller、Service、Mapper、MySQL 链路正常。
- `ruoyi-game` 已引入 Apache Commons CSV 1.11.0，并建立卡牌 CSV 导入的 DTO、Parser、ImportService 和 `POST /game/card/import` 接口。
- 已使用 Postman 上传真实 `cards.csv`，接口返回“成功解析 385 张卡牌”；当前已完成解析、计数和基础字段校验，尚未转换实体或写入数据库。
- IDEA 启动 `ruoyi-admin` 时未自动带入 `ruoyi-game` 的 Commons CSV 传递依赖，已在 `ruoyi-admin` 显式声明该运行时依赖，启动恢复正常。
- 已补齐导入基础校验：`card_no`、`name` 非空，`cost`、`dp_value` 转 `Integer`，`pp_value` 转 `BigDecimal`；格式错误会返回 CSV 行号、字段名和实际值。
- 已完成 `GameCardImportRow` 到 `GameCard` 的实体转换，服务端固定 `status = '0'`、`delFlag = '0'`，忽略 CSV 的 `id`；`pp_value`、`dp_value` 空值按 `null` 处理。
- 已增加 CSV 内部重复卡号校验，并通过 MyBatis `<foreach>` 实现 `game_card` 固定字段批量插入；导入服务使用事务及插入数量校验。
- 已通过 Postman 将真实 `cards.csv` 一次性成功写入 385 张卡牌，Mapper 返回实际影响行数 385，卡牌批量导入后端闭环已跑通；Controller 成功文案仍为“成功解析”，待改为“成功导入”。
- 已新增免登录公开卡池接口 `GET /game/card/public/list`，固定查询 `status = '0'` 且 `del_flag = '0'` 的卡牌；无管理员 Token 的 Postman 请求已成功返回 385 张数据库卡牌。
- 对战平台卡牌主数据已从本地 `cards.csv` 切换为后端公开卡池接口，Vite 开发环境使用 `/api` 代理到 `localhost:8080`；后端 camelCase 数据已适配为游戏现有 snake_case `CardRecord`。
- 对战平台仍从本地 `card-variants.csv` 加载 624 条卡图版本；卡表、组卡器和对局展开牌组时使用的卡牌规则数据均来自后端公开卡池。前端生产构建已通过，实际请求链路已确认正常。
- 学习笔记 `C:\Users\zjl\Desktop\后端学习笔记.md` 已补充本日知识点与实际踩坑。
- 已建立用户卡组数据模型：创建 `game_deck` 卡组主表和 `game_deck_card` 卡组明细表；卡组通过 `user_id` 逻辑关联 `sys_user`，明细通过 `deck_id`、`card_id` 逻辑关联卡组和卡池。
- 已为 `game_deck.user_id` 建立普通索引，并为 `game_deck_card(deck_id, card_id)` 建立联合唯一索引；已使用用户 `ry`、3 张真实卡牌完成主表、明细表插入及四表 JOIN 查询验证。
- 已使用若依主子表模板生成并接入用户卡组后端骨架，`ruoyi-game` Maven 编译通过；新增接口已从登录态覆盖 `userId`、创建人、状态和删除标记，并通过 Postman 伪造字段测试，主表与 3 条明细均正确写入。
- 已完成当前用户卡组基础 CRUD 的用户隔离：列表、详情和修改均按登录 `userId` 限定，删除前校验卡组归属；Postman 已验证查询、修改、删除全部成功。
- 已创建正式玩家角色标识 `player`，用于区分玩家与管理员登录后的前端入口。
- 已将原对战平台页面、组件、Pinia Store、卡牌规则、样式、卡图及版本 CSV 迁入若依前端的独立 `src/game-platform` 功能区；原组卡器、对战桌面和数值纠错页面均保留。
- 若依前端新增全屏 `/game` 路由；登录分流已按最初目标收敛为“角色包含 `admin` 进入后台，否则所有普通用户（包括 `player`、其他用户角色及默认角色）进入完整对战平台”，并在游戏平台提供退出登录入口。
- 原卡组 Store 已由浏览器 `localStorage` 改为若依卡组 API：支持读取当前用户卡组、创建、载入后更新及删除；卡池请求已改用若依统一请求封装。
- 若依前端已安装 `papaparse` 5.5.3，迁入的游戏 CSS 已限制在 `.game-platform` 范围内；生产构建通过，共转换 2594 个模块。
- 已确认用户保存的最初官网卡表 `D:\download\cards.csv` 与项目最早备份 SHA-256 完全一致：共 624 条版本记录、385 个唯一卡号；原始 `cost`、`pp_value`、`dp_value` 为内部编码而非卡面最终数值。
- 已完成卡牌数值编码转换巡检：同一卡号异画版本数值冲突为 0，905 个适用数值字段全部转换，34 项人工卡图校准与转换结果全部一致；已在 `artifacts/card-data-audit` 生成 385 张修正版牌表、逐字段转换报告和当前牌表差异预览。本轮未修改实际工程或 MySQL。
- 已在 MySQL 创建 `game_card_backup_20260903` 完整备份，并通过 Navicat 执行卡牌数值事务更新：补丁 385 张、缺失卡号 0、更新后数值不一致 0、`game_card` 仍为 385 张；现有 35 条卡组明细全部保留，失效卡牌关联为 0。数据库 `cost`、`pp_value`、`dp_value` 已切换为卡面真实数值。
- 已通过玩家端页面确认修正后的卡牌费用、PP、DP显示正确，完成“数据库数值修正 → 公开卡池接口 → 前端页面展示”闭环。
- 已完成规则引擎第一阶段的卡组基础闭环：支持50张总数校验、归一化卡号同编号最多4张校验、数据库可用卡号校验、红蓝黄信号球各4张校验，并将卡组统计条目展开为50个具有唯一 `instanceId` 的本局卡牌实例；固定随机种子的服务端洗牌复现验证通过。
- Java 规则引擎已完成首个基础规则闭环：建立本局 `CardInstance`、`PlayerState` 基础牌组/手牌/墓地状态，实现牌组顶到手牌、手牌丢弃到墓地、墓地洗回牌组、服务端随机洗切、牌组更新侵蚀记录及败北中断；Demo 已验证抽牌中途牌组更新后继续剩余抽牌、牌组与墓地同时为空败北、侵蚀达到 7 败北。
- 已完成服务端双方掷 D6 决定先攻闭环：`FirstPlayerDecision` 保存最终点数、先攻玩家与重掷次数，`FirstPlayerDecider` 在平点时重掷；Demo 已验证点数范围、平点重掷、高点数玩家先攻及固定种子复现，种子 `3` 触发 1 次重掷。
- `FirstPlayerDecider` 已接入 `GameInitializer`，同时修正玩家2卡组异常错用玩家1错误列表的问题；完整开局 Demo 已验证双方洗切、掷骰决定先攻、双方各抽4张、牌组各剩46张、回合数为1且固定种子的先攻结果可复现。
- 已完成开局单方换牌规则：按 `instanceId` 完整预校验所选起始手牌及重复选择，全部合法后才将所选牌放到牌组底、补抽同数量并洗切；换 0 张时不洗切。`MulliganRuleDemo` 已验证正常换2张、重复选择、非法选择不产生部分修改，以及换0张不改变牌组顺序，退出代码为0。
- 已完成开局双方顺序换牌协调：后攻不能抢先提交，先攻成功提交后进入等待后攻，后攻成功提交后状态转为 `COMPLETED`；顺序换牌 Demo 退出代码为0。
- 已建立费用牌状态 `CostCardState` 和玩家费用区，并完成 `StartingCostRule`：从牌组顶逐张设置2张正面竖直的起始明费，拒绝重复设置及牌组不足且不产生部分修改；Demo 退出代码为0。
- 已将双方顺序换牌与起始明费串联：先攻提交后不提前设置费用，后攻换牌成功后双方各从牌组顶设置2张正面竖直明费；完整开局 Demo 同时验证换牌状态完成、费用区数量、卡牌正反面/横竖状态、先攻玩家与第1回合保持正确，退出代码为0。
- 已建立基础战场牌状态及战场区域，并完成 `StandPhaseRule`：竖直阶段仅将当前回合玩家费用区和战场中的卡牌全部竖直，非回合玩家保持不变；Demo 退出代码为0。冰冻等特殊效果留待卡牌效果阶段接入。
- `GameState` 已加入顶层 `GamePhase`，开局完成后由 `OPENING` 进入 `STAND`；`StandPhaseRule` 执行完成后进入 `DRAW_FILL`。更新后的竖直阶段 Demo 已验证区域状态与阶段切换，退出代码为0。
- 已为 `GameState` 增加顶层阶段 `OPENING/STAND/DRAW_FILL/MAIN/END`；完整开局流程已验证先攻提交后仍为 `OPENING`，后攻换牌、双方起始明费全部完成后才进入第一回合 `STAND`，Demo 退出代码为0。攻击步骤和瞬时自由时点后续使用独立子状态，不混入顶层回合阶段。
- 已完成开局双方顺序换牌：`MulliganPhase` 与 `OpeningMulliganState` 记录等待先攻、等待后攻、已完成三个状态；`OpeningMulliganCoordinator` 校验提交玩家、执行单方换牌并仅在成功后推进。Demo 已验证后攻不能抢先提交、先攻换0张、后攻换1张及最终完成状态，退出代码为0。
- 已完成抽牌填充阶段的自动抽牌子步骤：`DrawFillStep` 区分 `DRAW/FILL`，先攻第一回合抽1张，抽牌后进入等待设置明费状态；重复自动抽牌请求会在修改状态前被拒绝。Demo 已验证玩家区域、阶段流转及重复请求无副作用，退出代码为0。
- 已完成抽牌填充阶段设置明费闭环：玩家可从当前回合玩家手牌设置0或1张正面竖直明费，非法卡牌ID、空白ID及重复提交均在状态修改前被拒绝，完成后进入 `MAIN` 并清空抽牌填充子步骤。费用区达到当前实际上限时，新费用牌改进墓地；移动方法接收动态 `costZoneLimit`，已验证默认上限10、效果提高至11及非法上限无副作用，Demo 退出代码为0。
- 已完成基础模型校正闸门第1项“操作发起者校验”：`finishFill` 接收提交玩家ID，非当前回合玩家和局外玩家即使选择设置0张也会在阶段推进前被拒绝，权威状态无变化；更新后的完整 Demo 退出代码为0。

## 当前数据模型注意点

- 现有卡牌 CSV 共约 385 张，字段为：
  `id,card_no,name,package_name,rarity,cost,attribute,pp_value,dp_value,signal_color,card_types,features,effect,image_url`
- 数据库字段使用 `card_attribute`，CSV 使用 `attribute`，导入时需要显式映射。
- `pp_value` 存在 `5.5`，Java 使用 `BigDecimal`，MySQL 使用 `DECIMAL(6,1)`。
- `cost`、`dp_value` 在 Java 中应为 `Integer`。
- `game_card` 还包含若依通用字段：`status`、`del_flag`、`create_by`、`create_time`、`update_by`、`update_time`、`remark`。

## 下一步

规则引擎及完整联机牌桌的固定实施路线见 `ENGINE_IMPLEMENTATION_PLAN.md`。后续按该文件的阶段和验收条件推进，不再根据单张卡临时改变整体架构。

### 新对话接续点（2026-09-04）

- 当前仍处于实施计划“阶段一：完成无特殊效果也能游玩的核心牌桌”。
- 已完成并通过 Demo：`CardInstance`、`PlayerState` 基础区域、`DrawRule`、牌组更新、侵蚀与败北、`GameState` 双方/先攻/当前玩家识别、固定随机种子洗牌、`DeckEntry`、`CardNoNormalizer`、`DeckValidationRule`、`DeckInstanceFactory`。
- 完整卡组校验 Demo 已验证：合法50张返回空错误列表；第51张及未知卡号能够同时返回错误；`BP01-056a/b` 按基础卡号归一后参与同编号最多4张校验；红蓝黄信号球按 `GameCard.signalColor` 各检查4张。
- 卡组实例展开 Demo 已验证：13条卡组统计记录展开为50个 `CardInstance`，唯一实例ID数量为50，ID前缀为对局ID和玩家ID。
- `FirstPlayerDecision`、`FirstPlayerDecider` 及 Demo 已完成并通过人工运行验证；`FirstPlayerDecider` 已接入 `GameInitializer`，玩家2错误列表引用也已修正。
- `GameInitializerDemo` 已验证：双方洗切、骰子决定先攻、当前玩家为先攻玩家、回合数为1、双方各抽4张、牌组各剩46张，且固定种子的先攻结果可复现。
- `PlayerState` 已实现 `hasCardInHand(String instanceId)` 和 `moveHandCardToDeckBottom(String instanceId)`；`MulliganRule` 单方换牌闭环及 Demo 已完成。
- 完整开局、阶段一第10步“竖直阶段”和第11步“抽牌填充阶段”首回合闭环已完成。规则审查确认整体方向正确，但进入第12步前必须先完成 `ENGINE_IMPLEMENTATION_PLAN.md` 4.2.1 基础模型校正闸门。第1项操作发起者校验已完成；当前进入第2项败北后阻断流程推进，随后处理缺失区域、5卡位战场、卡牌所属玩家、开局状态一致性及动态费用上限查询接缝。其他正常回合抽2张待结束阶段的合法回合切换能力建立后补充验证。
- 换牌顺序固定为：选中的起始手牌放到牌组底 → 从牌组顶抽相同数量 → 洗切牌组；从先攻玩家开始依次处理。
- 协作约定：规则/业务实现由用户亲自编写，Demo 验证代码由 Codex 直接生成；Codex 修改代码后不主动执行编译或 Demo，由用户在 IDEA 中手动运行。

继续完成卡牌批量导入闭环：

1. 以规则知识库、卡牌原文和现有 TypeScript 行为模块为依据，建立纯 Java 卡牌规则引擎骨架，从 `GameAction`、结算队列和第一张代表卡开始迁移。
2. 将导入接口成功文案由“成功解析”改为“成功导入”，补充数据库已有卡号的导入前校验，避免重复上传只暴露底层唯一索引异常。
3. 补充后端卡组合法性及禁限卡规则。
4. 补充 `game:card:import` 权限和管理后台上传入口。
5. 完成逻辑删除改造：列表查询已过滤 `del_flag = '0'`，仍需让详情查询过滤已删除数据，并将物理删除 SQL 改为更新 `del_flag = '2'`。

完成以上内容后，再进入用户卡组模型设计；暂时不要提前开始 WebSocket 对局实现。

## 后续路线

1. 卡池管理与图片资源策略
2. 用户、卡组、卡组明细及禁限卡规则
3. 单机规则引擎后端化与卡牌效果架构
4. 房间、匹配、准备、断线重连和 WebSocket 对局同步
5. Redis 会话/房间状态及持久化边界
6. 单元测试、接口测试、并发与安全
7. Docker Compose 本地部署及低成本外网部署
