import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { saveContent, getContent, listContents } from '../db/database';
import { ContentEngine } from '../core/ContentEngine';
import { PlatformRegistry } from '../core/PlatformRegistry';

export function createContentRouter(engine: ContentEngine, registry: PlatformRegistry): Router {
  const router = Router();

  // 获取所有内容
  router.get('/', (_req: Request, res: Response) => {
    const contents = listContents();
    res.json(contents.map(row => ({
      id: row.id,
      title: row.title,
      body: row.body,
      coverImage: row.cover_image,
      images: JSON.parse(row.images),
      tags: JSON.parse(row.tags),
      category: row.category,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })));
  });

  // 获取单条内容
  router.get('/:id', (req: Request, res: Response) => {
    const row = getContent(req.params.id);
    if (!row) {
      res.status(404).json({ error: '内容不存在' });
      return;
    }
    res.json({
      id: row.id,
      title: row.title,
      body: row.body,
      coverImage: row.cover_image,
      images: JSON.parse(row.images),
      tags: JSON.parse(row.tags),
      category: row.category,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  });

  // 保存内容
  router.post('/save', (req: Request, res: Response) => {
    const { title, body, coverImage, images, tags, category } = req.body;
    const content = {
      id: req.body.id || uuidv4(),
      title: title || '',
      body: body || '',
      coverImage,
      images: images || [],
      tags: tags || [],
      category,
    };
    const saved = saveContent(content);
    res.json({
      id: saved.id,
      title: saved.title,
      body: saved.body,
      coverImage: saved.cover_image,
      images: JSON.parse(saved.images),
      tags: JSON.parse(saved.tags),
      category: saved.category,
      createdAt: saved.created_at,
      updatedAt: saved.updated_at,
    });
  });

  // 转换内容
  router.post('/transform', (req: Request, res: Response) => {
    const { title, body, coverImage, images, tags, category, platformIds } = req.body;

    if (!platformIds || platformIds.length === 0) {
      res.status(400).json({ error: '请选择至少一个目标平台' });
      return;
    }

    const unifiedContent = {
      title: title || '',
      body: body || '',
      coverImage,
      images: images || [],
      tags: tags || [],
      category,
    };

    const result = engine.process(unifiedContent, platformIds);
    res.json(result);
  });

  return router;
}
