import { BaseAdapter } from './BaseAdapter';
import { UnifiedContent, PlatformContent, PublishResult, PlatformRules } from '../core/types';

/**
 * B站专栏适配器
 * B站开放平台 (openhome.bilibili.com) 支持专栏发布，但需开发者申请
 * 当前默认模拟发布，配置凭证后可接入真实 API
 */
export class BilibiliAdapter extends BaseAdapter {
  readonly platformId = 'bilibili';
  readonly displayName = 'B站';
  readonly supportsRealPublish = true;
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

  async publish(content: PlatformContent, credentials?: Record<string, string>): Promise<PublishResult> {
    // B站开放平台需要在 openhome.bilibili.com 注册应用获取 access_token
    // 如果提供了 access_token 则尝试真实发布
    if (credentials?.accessToken) {
      return this.realPublish(content, credentials.accessToken);
    }
    return this.simulatePublish(content);
  }

  private async realPublish(content: PlatformContent, accessToken: string): Promise<PublishResult> {
    try {
      const res = await fetch('https://member.bilibili.com/x/v2/article/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: content.title,
          content: content.body,
          category: content.metadata?.category || 0,
          tags: content.tags.join(','),
          cover: content.coverImage || '',
        }),
      });
      const data = await res.json() as Record<string, unknown>;
      if ((data as { code?: number }).code !== 0) {
        throw new Error(`B站返回错误: ${data.message || JSON.stringify(data)}`);
      }

      return {
        platformId: this.platformId,
        platformName: this.displayName,
        status: 'success',
        publishedAt: new Date().toISOString(),
        message: '已成功发布到B站专栏',
        simulated: false,
        url: `https://www.bilibili.com/read/cv${data.data}`,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : '未知错误';
      return {
        platformId: this.platformId,
        platformName: this.displayName,
        status: 'failed',
        publishedAt: new Date().toISOString(),
        message: `B站发布失败: ${msg}`,
        simulated: false,
      };
    }
  }

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

  private formatTags(tags: string[]): string[] {
    return tags.map(t => t.replace(/^#/, '')).slice(0, 10);
  }
}
