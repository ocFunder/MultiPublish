import { Router, Request, Response } from 'express';
import { PlatformRegistry } from '../core/PlatformRegistry';
import { saveCredentials, getCredentials, deleteCredentials } from '../db/database';

export function createCredentialsRouter(registry: PlatformRegistry): Router {
  const router = Router();

  // 获取所有平台的凭证状态
  router.get('/', (_req: Request, res: Response) => {
    const platforms = registry.listPlatforms();
    const credentials = platforms.map(p => {
      const creds = getCredentials(p.platformId);
      return {
        platformId: p.platformId,
        displayName: p.displayName,
        supportsRealPublish: registry.get(p.platformId)?.supportsRealPublish || false,
        configured: creds !== null && Object.keys(creds).length > 0,
        keys: creds ? Object.keys(creds) : [],
      };
    });
    res.json(credentials);
  });

  // 保存平台凭证
  router.put('/:platformId', (req: Request, res: Response) => {
    const { platformId } = req.params;
    const adapter = registry.get(platformId);
    if (!adapter) {
      res.status(404).json({ error: `未找到平台: ${platformId}` });
      return;
    }
    const { credentials } = req.body;
    if (!credentials || typeof credentials !== 'object') {
      res.status(400).json({ error: '请提供有效的 credentials 对象' });
      return;
    }
    saveCredentials(platformId, credentials);
    res.json({ platformId, configured: true, message: '凭证已保存' });
  });

  // 删除平台凭证
  router.delete('/:platformId', (req: Request, res: Response) => {
    const { platformId } = req.params;
    deleteCredentials(platformId);
    res.json({ platformId, configured: false, message: '凭证已删除' });
  });

  return router;
}
