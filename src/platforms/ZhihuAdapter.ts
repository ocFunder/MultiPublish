import { BaseAdapter } from './BaseAdapter';
import { UnifiedContent, PlatformContent, PublishResult, PlatformRules } from '../core/types';

/**
 * 知乎适配器
 * 特性：支持 Markdown + LaTeX 公式、标题≤50字
 */
export class ZhihuAdapter extends BaseAdapter {
  readonly platformId = 'zhihu';
  readonly displayName = '知乎';
  readonly contentRules: PlatformRules = {
    maxTitleLength: 50,
    maxBodyLength: 100000, // 知乎无硬限制，设置较大值
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

  /** 知乎保留 Markdown 格式，保护 LaTeX 公式 */
  private toZhihuMarkdown(markdown: string): string {
    const truncated = this.truncateBody(markdown);
    return truncated
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private async simulatePublish(content: PlatformContent): Promise<PublishResult> {
    await this.delay();
    return {
      platformId: this.platformId,
      platformName: this.displayName,
      status: 'success',
      publishedAt: new Date().toISOString(),
      message: '模拟发布成功（知乎）',
      simulatedUrl: this.mockUrl(),
    };
  }

  private delay(ms = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
