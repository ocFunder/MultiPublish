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
import { createCredentialsRouter } from './routes/credentials';

export function createApp() {
  const app = express();
  app.use(express.json());

  const registry = new PlatformRegistry();
  registry.register(new WeChatAdapter());
  registry.register(new ZhihuAdapter());
  registry.register(new BilibiliAdapter());
  registry.register(new XiaohongshuAdapter());

  const contentEngine = new ContentEngine(registry);
  const publishEngine = new PublishEngine(registry);

  app.use('/api/content', createContentRouter(contentEngine, registry));
  app.use('/api/platforms', createPlatformsRouter(registry));
  app.use('/api/publish', createPublishRouter(contentEngine, publishEngine, registry));
  app.use('/api/credentials', createCredentialsRouter(registry));

  return app;
}
