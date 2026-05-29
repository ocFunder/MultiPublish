# MultiPublish - 多平台内容发布工具

帮助创作者在公众号、知乎、B站、小红书等平台同步发布内容，自动适配各平台格式与风格。

## 功能特性

- **统一内容编辑**：Markdown 格式输入，一次编写多处发布
- **智能格式适配**：自动转换内容以适配各平台的内容规范
- **一键模拟发布**：统一下达发布指令，模拟发布流程
- **发布历史追踪**：记录每次发布的状态和结果
- **可扩展架构**：基于策略模式，新增平台只需实现适配器接口

## 技术栈

- **后端**：Node.js + Express.js + TypeScript
- **前端**：React + TypeScript + Vite
- **数据库**：SQLite (better-sqlite3)
- **Markdown 解析**：marked

## 快速启动

```bash
# 安装依赖
npm install

# 开发模式启动
npm run dev

# 构建
npm run build

# 启动
npm start
```

## 项目结构

```
MultiPublish/
├── src/                    # 后端源码
│   ├── server.ts           # 入口
│   ├── app.ts              # Express 应用
│   ├── core/               # 核心领域层
│   │   ├── types.ts        # 类型定义
│   │   ├── ContentEngine.ts
│   │   ├── PublishEngine.ts
│   │   └── PlatformRegistry.ts
│   ├── platforms/          # 平台适配器
│   │   ├── IPlatformAdapter.ts
│   │   ├── BaseAdapter.ts
│   │   ├── WeChatAdapter.ts
│   │   ├── ZhihuAdapter.ts
│   │   ├── BilibiliAdapter.ts
│   │   └── XiaohongshuAdapter.ts
│   ├── routes/             # API 路由
│   └── db/                 # 数据库
├── client/                 # 前端源码 (React + Vite)
└── docs/                   # 文档
```

## 扩展新平台

1. 在 `src/platforms/` 下创建 `XxxAdapter.ts`
2. 继承 `BaseAdapter` 并实现 `IPlatformAdapter` 接口
3. 在 `PlatformRegistry` 中注册
4. 前端自动发现新平台（通过 `/api/platforms` API）

## License

MIT
