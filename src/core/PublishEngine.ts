import { v4 as uuidv4 } from 'uuid';
import { PlatformRegistry } from './PlatformRegistry';
import { PlatformContent, PublishResult, PublishResponse } from './types';
import { savePublishRecord, getCredentials } from '../db/database';

/**
 * 发布引擎 — 负责编排批量发布的完整流程
 * 自动根据平台凭证选择真实发布或模拟发布
 */
export class PublishEngine {
  constructor(private registry: PlatformRegistry) {}

  async publishAll(contents: PlatformContent[]): Promise<PublishResponse> {
    const contentId = contents[0]?.originalId || '';
    const results: PublishResult[] = [];

    for (const content of contents) {
      const adapter = this.registry.get(content.platformId);
      if (!adapter) {
        results.push({
          platformId: content.platformId,
          platformName: content.platformName,
          status: 'failed',
          publishedAt: new Date().toISOString(),
          message: `未找到平台适配器: ${content.platformId}`,
          simulated: true,
        });
        continue;
      }

      try {
        // 读取该平台的凭证，传给适配器
        const credentials = getCredentials(content.platformId) || undefined;
        const result = await adapter.publish(content, credentials);
        results.push(result);

        savePublishRecord({
          id: uuidv4(),
          contentId,
          platformId: result.platformId,
          platformName: result.platformName,
          status: result.status,
          message: result.message,
          publishedAt: result.publishedAt,
          simulated: result.simulated,
          url: result.url,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '未知发布错误';
        results.push({
          platformId: content.platformId,
          platformName: content.platformName,
          status: 'failed',
          publishedAt: new Date().toISOString(),
          message: errorMsg,
          simulated: true,
        });
      }
    }

    return {
      contentId,
      results,
      summary: {
        total: results.length,
        success: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
      },
    };
  }
}
