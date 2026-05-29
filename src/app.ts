import express from 'express';
import { PlatformRegistry } from './core/PlatformRegistry';
import { ContentEngine } from './core/ContentEngine';
import { PublishEngine } from './core/PublishEngine';

// 平台适配器
import { WeChatAdapter } from './platforms/WeChatAdapter';
import { ZhihuAdapter } from './platforms/ZhihuAdapter';
import { BilibiliAdapter } from './platforms/BilibiliAdapter';
import { XiaohongshuAdapter } from './platforms/XiaohongshuAdapter';

// 路由
import { createContentRouter } from './routes/content';
import { createPlatformsRouter } from './routes/platforms';
import { createPublishRouter } from './routes/publish';

export function createApp() {
  const app = express();
  app.use(express.json());

  // 初始化注册中心并注册所有平台适配器
  const registry = new PlatformRegistry();
  registry.register(new WeChatAdapter());
  registry.register(new ZhihuAdapter());
  registry.register(new BilibiliAdapter());
  registry.register(new XiaohongshuAdapter());

  // 初始化引擎
  const contentEngine = new ContentEngine(registry);
  const publishEngine = new PublishEngine(registry);

  // 挂载路由
  app.use('/api/content', createContentRouter(contentEngine, registry));
  app.use('/api/platforms', createPlatformsRouter(registry));
  app.use('/api/publish', createPublishRouter(contentEngine, publishEngine, registry));

  return app;
}
