# MultiPublish 架构文档

## 概述

MultiPublish 是一个多平台内容发布工具，帮助创作者在微信公众号、知乎、B站、小红书等平台同步发布内容。核心能力：统一内容输入 → 自动适配各平台格式 → 一键发布。

## 架构设计

### 分层架构

```
┌──────────────────────────────────────┐
│         Presentation Layer           │   React + TypeScript + Vite
│    ContentEditor, PlatformSelector,  │
│    Preview, PublishPanel             │
├──────────────────────────────────────┤
│         Application Layer            │   Express.js
│    Routes: /api/content              │
│            /api/platforms            │
│            /api/publish              │
├──────────────────────────────────────┤
│           Domain Layer               │
│  ┌────────────────────────────────┐  │
│  │  Platform Adapter System       │  │   策略模式 (Strategy Pattern)
│  │  IPlatformAdapter (interface)  │  │
│  │  BaseAdapter (abstract class)  │  │
│  │  WeChat | Zhihu | B站 | 小红书 │  │
│  └────────────────────────────────┘  │
│  ContentEngine | PublishEngine       │
├──────────────────────────────────────┤
│       Infrastructure Layer           │
│    SQLite (better-sqlite3)           │
└──────────────────────────────────────┘
```

### 核心设计模式：策略模式

每个平台是一个独立的 Adapter，实现 `IPlatformAdapter` 接口：

```typescript
interface IPlatformAdapter {
  platformId: string;
  displayName: string;
  contentRules: PlatformRules;
  transform(content: UnifiedContent): PlatformContent;
  validate(content: UnifiedContent): ValidationResult;
  publish(content: PlatformContent): Promise<PublishResult>;
}
```

### 扩展新平台

1. 在 `src/platforms/` 下新建 `XxxAdapter.ts`
2. 继承 `BaseAdapter`，实现 `transform()` 方法
3. 在 `app.ts` 中注册：`registry.register(new XxxAdapter())`
4. 前端自动发现新平台（通过 `GET /api/platforms`）

无需修改任何核心代码。

## 数据流

```
User Input (Markdown) → ContentEngine.validate()
    → PlatformRegistry.getAdapters(selected)
    → adapter.transform(unifiedContent) × N
    → User Preview (per platform)
    → PublishEngine.publishAll()
    → Publish History (SQLite)
```

## 各平台适配规则

| 平台 | 标题上限 | 正文上限 | 图片上限 | 封面图 | 格式 |
|------|---------|---------|---------|--------|------|
| 微信公众号 | 64字 | 20000字 | 10张 | 必须 | 有限HTML |
| 知乎 | 50字 | 100000字 | 20张 | 可选 | Markdown |
| B站 | 80字 | 50000字 | 20张 | 必须 | 专栏HTML |
| 小红书 | 20字 | 1000字 | 9张 | 可选 | 纯文本+话题 |

## 技术选型

| 层 | 技术 |
|----|------|
| 后端框架 | Express.js + TypeScript |
| 前端框架 | React 18 + TypeScript + Vite |
| 数据库 | SQLite (better-sqlite3) |
| Markdown | marked |

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/platforms | 获取已注册平台列表 |
| POST | /api/content/transform | 内容转换（验证+适配） |
| POST | /api/content/save | 保存内容 |
| GET | /api/content | 内容列表 |
| GET | /api/content/:id | 获取单条内容 |
| POST | /api/publish | 发布内容（模拟） |
| GET | /api/publish/history | 发布历史 |
