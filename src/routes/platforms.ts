import { Router, Request, Response } from 'express';
import { PlatformRegistry } from '../core/PlatformRegistry';

export function createPlatformsRouter(registry: PlatformRegistry): Router {
  const router = Router();

  // 获取所有已注册平台
  router.get('/', (_req: Request, res: Response) => {
    res.json(registry.listPlatforms());
  });

  // 获取指定平台信息
  router.get('/:id', (req: Request, res: Response) => {
    const adapter = registry.get(req.params.id);
    if (!adapter) {
      res.status(404).json({ error: `未找到平台: ${req.params.id}` });
      return;
    }
    res.json({
      platformId: adapter.platformId,
      displayName: adapter.displayName,
      contentRules: adapter.contentRules,
    });
  });

  return router;
}
