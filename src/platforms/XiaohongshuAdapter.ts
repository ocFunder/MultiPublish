import { BaseAdapter } from './BaseAdapter';
import { UnifiedContent, PlatformContent, PublishResult, PlatformRules } from '../core/types';

/**
 * 小红书适配器
 * 小红书目前无公开内容发布 API，仅支持模拟发布
 */
export class XiaohongshuAdapter extends BaseAdapter {
  readonly platformId = 'xiaohongshu';
  readonly displayName = '小红书';
  readonly supportsRealPublish = false;
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

  private toXiaohongshuText(markdown: string, tags: string[]): string {
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

    if (text.length > this.contentRules.maxBodyLength) {
      text = text.substring(0, this.contentRules.maxBodyLength - 5) + '...';
    }

    const hashtags = this.extractHashtags(tags);
    if (hashtags.length > 0) {
      text += '\n\n' + hashtags.join(' ');
    }

    return text;
  }

  private extractHashtags(tags: string[]): string[] {
    return tags
      .flatMap(t => t.split(/[,，]/))
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => t.startsWith('#') ? t : `#${t}`)
      .slice(0, 10);
  }
}
