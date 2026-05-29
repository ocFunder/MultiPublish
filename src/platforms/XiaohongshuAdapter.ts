import { BaseAdapter } from './BaseAdapter';
import { UnifiedContent, PlatformContent, PublishResult, PlatformRules } from '../core/types';

/**
 * 小红书适配器
 * 特性：图片优先(1-9张)、短文案≤1000字、话题标签 #、标题≤20字
 */
export class XiaohongshuAdapter extends BaseAdapter {
  readonly platformId = 'xiaohongshu';
  readonly displayName = '小红书';
  readonly contentRules: PlatformRules = {
    maxTitleLength: 20,
    maxBodyLength: 1000,
    maxImages: 9,
    requiresCoverImage: false,
    supportsMarkdown: false,
    supportsTags: true,
    supportedImageFormats: ['jpg', 'png', 'webp'],
  };

  transform(content: UnifiedContent): PlatformContent {
    return {
      platformId: this.platformId,
      platformName: this.displayName,
      originalId: content.id || '',
      title: this.truncateTitle(content.title),
      body: this.toXiaohongshuText(content.body, content.tags),
      coverImage: content.coverImage || content.images[0],
      images: content.images.slice(0, this.contentRules.maxImages),
      tags: this.extractHashtags(content.tags),
      metadata: {
        imageCount: Math.min(content.images.length, this.contentRules.maxImages),
        wordCount: Math.min(content.body.length, this.contentRules.maxBodyLength),
        imageFirst: content.images.length > 0,
      },
    };
  }

  async publish(content: PlatformContent): Promise<PublishResult> {
    return this.simulatePublish(content);
  }

  /** 将 Markdown 转换为小红书纯文本 + 话题标签 */
  private toXiaohongshuText(markdown: string, tags: string[]): string {
    // 去掉 Markdown 标记，保留纯文本
    let text = markdown
      .replace(/^#{1,3} (.+)$/gm, '【$1】')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/^[-*] (.+)$/gm, '· $1')
      .replace(/^\d+\. (.+)$/gm, '· $1')
      .replace(/^>/gm, '')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/---/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // 截断正文
    if (text.length > this.contentRules.maxBodyLength) {
      text = text.substring(0, this.contentRules.maxBodyLength - 5) + '...';
    }

    // 追加话题标签
    const hashtags = this.extractHashtags(tags);
    if (hashtags.length > 0) {
      text += '\n\n' + hashtags.join(' ');
    }

    return text;
  }

  /** 生成话题标签 */
  private extractHashtags(tags: string[]): string[] {
    return tags
      .map(t => t.startsWith('#') ? t : `#${t}`)
      .slice(0, 10);
  }

  private async simulatePublish(content: PlatformContent): Promise<PublishResult> {
    await this.delay();
    return {
      platformId: this.platformId,
      platformName: this.displayName,
      status: 'success',
      publishedAt: new Date().toISOString(),
      message: '模拟发布成功（小红书）',
      simulatedUrl: this.mockUrl(),
    };
  }

  private delay(ms = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
