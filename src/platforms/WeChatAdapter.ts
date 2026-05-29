import { BaseAdapter } from './BaseAdapter';
import { UnifiedContent, PlatformContent, PublishResult, PlatformRules } from '../core/types';

/**
 * 微信公众号适配器
 * 特性：富文本(有限HTML标签)、封面图必须(900×500)、正文≤20000字
 */
export class WeChatAdapter extends BaseAdapter {
  readonly platformId = 'wechat';
  readonly displayName = '微信公众号';
  readonly contentRules: PlatformRules = {
    maxTitleLength: 64,
    maxBodyLength: 20000,
    maxImages: 10,
    requiresCoverImage: true,
    supportsMarkdown: false,
    supportsTags: false,
    supportedImageFormats: ['jpg', 'png', 'gif'],
  };

  transform(content: UnifiedContent): PlatformContent {
    return {
      platformId: this.platformId,
      platformName: this.displayName,
      originalId: content.id || '',
      title: this.truncateTitle(content.title),
      body: this.toWeChatHTML(content.body),
      coverImage: content.coverImage,
      images: content.images.slice(0, this.contentRules.maxImages),
      tags: [],
      metadata: {
        needCoverImage: !content.coverImage,
        wordCount: content.body.length,
      },
    };
  }

  async publish(content: PlatformContent): Promise<PublishResult> {
    return this.simulatePublish(content);
  }

  /** 将 Markdown 转换为微信公众号支持的有限 HTML */
  private toWeChatHTML(markdown: string): string {
    const truncated = this.truncateBody(markdown);
    return truncated
      // 标题
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // 粗体和斜体
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // 链接
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      // 图片
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">')
      // 列表
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
      // 段落
      .split('\n\n')
      .map(block => {
        const trimmed = block.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<h') || trimmed.startsWith('<li') || trimmed.startsWith('<img'))
          return trimmed;
        return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
      })
      .filter(Boolean)
      .join('\n');
  }

  private async simulatePublish(content: PlatformContent): Promise<PublishResult> {
    await this.delay();
    return {
      platformId: this.platformId,
      platformName: this.displayName,
      status: 'success',
      publishedAt: new Date().toISOString(),
      message: '模拟发布成功（微信公众号）',
      simulatedUrl: this.mockUrl(),
    };
  }

  private delay(ms = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
