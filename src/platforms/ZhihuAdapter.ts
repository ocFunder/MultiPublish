import { BaseAdapter } from './BaseAdapter';
import { UnifiedContent, PlatformContent, PublishResult, PlatformRules } from '../core/types';

/**
 * 知乎适配器
 * 知乎无公开内容发布 API，仅支持模拟发布
 */
export class ZhihuAdapter extends BaseAdapter {
  readonly platformId = 'zhihu';
  readonly displayName = '知乎';
  readonly supportsRealPublish = false;
  readonly contentRules: PlatformRules = {
    maxTitleLength: 50,
    maxBodyLength: 100000,
    maxImages: 20,
    requiresCoverImage: false,
    supportsMarkdown: true,
    supportsTags: true,
    supportedImageFormats: ['jpg', 'png', 'gif', 'webp'],
  };

  transform(content: UnifiedContent): PlatformContent {
    return {
      platformId: this.platformId,
      platformName: this.displayName,
      originalId: content.id || '',
      title: this.truncateTitle(content.title),
      body: this.toZhihuMarkdown(content.body),
      coverImage: content.coverImage,
      images: content.images.slice(0, this.contentRules.maxImages),
      tags: content.tags,
      metadata: {
        wordCount: content.body.length,
        hasLaTeX: /\$\$[\s\S]*?\$\$|\$[\s\S]*?\$/.test(content.body),
      },
    };
  }

  async publish(content: PlatformContent): Promise<PublishResult> {
    return this.simulatePublish(content);
  }

  private toZhihuMarkdown(markdown: string): string {
    return this.truncateBody(markdown)
      .replace(/\n{3,}/g, '\n\n')                // 压缩多余空行
      .replace(/\n(#{1,3}\s)/g, '\n\n$1')        // 标题前确保有空行
      .replace(/^#{1,3}\s/gm, m => `\n\n${m}`)   // 全文首个标题前加空行
      .replace(/^\n+/, '')                        // 清理开头多余空行
      .trim();
  }
}
