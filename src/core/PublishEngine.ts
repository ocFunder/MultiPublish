import { v4 as uuidv4 } from 'uuid';
import { PlatformRegistry } from './PlatformRegistry';
import { PlatformContent, PublishResult, PublishResponse } from './types';
import { savePublishRecord } from '../db/database';

/**
 * 发布引擎
 * 负责编排批量发布的完整流程（含模拟发布）
 */
export class PublishEngine {
  constructor(private registry: PlatformRegistry) {}

  /**
   * 批量发布内容到指定平台
   * @param contents 已转换的各平台内容
   * @returns 各平台发布结果汇总
   */
  async publishAll(contents: PlatformContent[]): Promise<PublishResponse> {
    const contentId = contents[0]?.originalId || '';
    const results: PublishResult[] = [];

    // 逐平台发布（串行保证顺序，实际可改为并行）
    for (const content of contents) {
      const adapter = this.registry.get(content.platformId);
      if (!adapter) {
        results.push({
          platformId: content.platformId,
          platformName: content.platformName,
          status: 'failed',
          publishedAt: new Date().toISOString(),
          message: `未找到平台适配器: ${content.platformId}`,
        });
        continue;
      }

      try {
        const result = await adapter.publish(content);
        results.push(result);

        // 持久化发布记录
        savePublishRecord({
          id: uuidv4(),
          contentId,
          platformId: result.platformId,
          platformName: result.platformName,
          status: result.status,
          message: result.message,
          publishedAt: result.publishedAt,
          simulatedUrl: result.simulatedUrl,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '未知发布错误';
        results.push({
          platformId: content.platformId,
          platformName: content.platformName,
          status: 'failed',
          publishedAt: new Date().toISOString(),
          message: errorMsg,
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
