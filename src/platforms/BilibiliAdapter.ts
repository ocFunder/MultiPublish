import { BaseAdapter } from './BaseAdapter';
import { UnifiedContent, PlatformContent, PublishResult, PlatformRules } from '../core/types';

/**
 * B站专栏适配器
 * 特性：专栏富文本格式、封面图必须、标签/分类系统、标题≤80字
 */
export class BilibiliAdapter extends BaseAdapter {
  readonly platformId = 'bilibili';
  readonly displayName = 'B站';
  readonly contentRules: PlatformRules = {
    maxTitleLength: 80,
    maxBodyLength: 50000,
    maxImages: 20,
    requiresCoverImage: true,
    supportsMarkdown: false,
    supportsTags: true,
    supportedImageFormats: ['jpg', 'png', 'gif', 'bmp'],
  };

  transform(content: UnifiedContent): PlatformContent {
    return {
      platformId: this.platformId,
      platformName: this.displayName,
      originalId: content.id || '',
      title: this.truncateTitle(content.title),
      body: this.toBilibiliFormat(content.body),
      coverImage: content.coverImage,
      images: content.images.slice(0, this.contentRules.maxImages),
      tags: this.formatTags(content.tags),
      metadata: {
        needCoverImage: !content.coverImage,
        wordCount: content.body.length,
        category: content.category || '未分类',
      },
    };
  }

  async publish(content: PlatformContent): Promise<PublishResult> {
    return this.simulatePublish(content);
  }

  /** 将 Markdown 转换为 B站专栏格式 */
  private toBilibiliFormat(markdown: string): string {
    const truncated = this.truncateBody(markdown);
    return truncated
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<figure><img src="$2" alt="$1"><figcaption>$1</figcaption></figure>')
      .replace(/^---$/gm, '<hr>')
      .split('\n\n')
      .map(block => {
        const trimmed = block.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<h') || trimmed.startsWith('<figure') || trimmed.startsWith('<hr'))
          return trimmed;
        return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
      })
      .filter(Boolean)
      .join('\n');
  }

  /** 格式化标签 */
  private formatTags(tags: string[]): string[] {
    return tags.map(t => t.replace(/^#/, '')).slice(0, 10);
  }

  private async simulatePublish(content: PlatformContent): Promise<PublishResult> {
    await this.delay();
    return {
      platformId: this.platformId,
      platformName: this.displayName,
      status: 'success',
      publishedAt: new Date().toISOString(),
      message: '模拟发布成功（B站专栏）',
      simulatedUrl: this.mockUrl(),
    };
  }

  private delay(ms = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
