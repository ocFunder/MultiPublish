import { Router, Request, Response } from 'express';
import { ContentEngine } from '../core/ContentEngine';
import { PublishEngine } from '../core/PublishEngine';
import { PlatformRegistry } from '../core/PlatformRegistry';
import { getContent } from '../db/database';
import { listPublishRecords, getPublishRecordsByContent } from '../db/database';

export function createPublishRouter(
  engine: ContentEngine,
  publishEngine: PublishEngine,
  registry: PlatformRegistry
): Router {
  const router = Router();

  // 发布内容到指定平台
  router.post('/', async (req: Request, res: Response) => {
    const { contentId, platformIds } = req.body;

    if (!contentId) {
      res.status(400).json({ error: '缺少 contentId' });
      return;
    }

    if (!platformIds || platformIds.length === 0) {
      res.status(400).json({ error: '请选择至少一个目标平台' });
      return;
    }

    // 从数据库获取内容
    const row = getContent(contentId);
    if (!row) {
      res.status(404).json({ error: '内容不存在' });
      return;
    }

    const content = {
      id: row.id,
      title: row.title,
      body: row.body,
      coverImage: row.cover_image || undefined,
      images: JSON.parse(row.images),
      tags: JSON.parse(row.tags),
      category: row.category || undefined,
    };

    // 先验证
    const validations = engine.validateAll(content, platformIds);
    const hasErrors = validations.some(v => v.result.errors.length > 0);

    if (hasErrors) {
      res.status(400).json({
        error: '内容验证失败',
        validations,
      });
      return;
    }

    // 转换并发布
    const contents = engine.transformAll(content, platformIds);
    const result = await publishEngine.publishAll(contents);

    res.json({
      ...result,
      warnings: validations.flatMap(v => v.result.warnings.map(w => ({
        platformId: v.platformId,
        platformName: v.platformName,
        ...w,
      }))),
    });
  });

  // 获取发布历史
  router.get('/history', (req: Request, res: Response) => {
    const contentId = req.query.contentId as string | undefined;

    let records;
    if (contentId) {
      records = getPublishRecordsByContent(contentId);
    } else {
      records = listPublishRecords();
    }

    res.json(records.map(r => ({
      id: r.id,
      contentId: r.content_id,
      platformId: r.platform_id,
      platformName: r.platform_name,
      status: r.status,
      message: r.message,
      publishedAt: r.published_at,
      simulatedUrl: r.simulated_url,
      createdAt: r.created_at,
    })));
  });

  return router;
}
