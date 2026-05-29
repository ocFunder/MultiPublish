import { BaseAdapter } from './BaseAdapter';
import { UnifiedContent, PlatformContent, PublishResult, PlatformRules } from '../core/types';
import { getAccessToken, addDraft, submitFreePublish } from './WeChatApiClient';

/**
 * 微信公众号适配器
 * 支持模拟发布和真实 API 发布（需要 AppID + AppSecret）
 */
export class WeChatAdapter extends BaseAdapter {
  readonly platformId = 'wechat';
  readonly displayName = '微信公众号';
  readonly supportsRealPublish = true;
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

  async publish(content: PlatformContent, credentials?: Record<string, string>): Promise<PublishResult> {
    // 有凭证则尝试真实发布
    if (credentials?.appId && credentials?.appSecret) {
      return this.realPublish(content, credentials.appId, credentials.appSecret);
    }
    return this.simulatePublish(content);
  }

  /** 真实微信 API 发布：获取 token → 创建草稿 → 发布 */
  private async realPublish(
    content: PlatformContent,
    appId: string,
    appSecret: string
  ): Promise<PublishResult> {
    try {
      const token = await getAccessToken(appId, appSecret);

      const { media_id } = await addDraft(token, [{
        title: content.title,
        content: content.body,
        digest: content.metadata?.wordCount
          ? `${content.metadata.wordCount}字` : undefined,
      }]);

      const result = await submitFreePublish(token, media_id);

      return {
        platformId: this.platformId,
        platformName: this.displayName,
        status: 'success',
        publishedAt: new Date().toISOString(),
        message: `已成功发布到微信公众号 (publish_id: ${result.publish_id})`,
        simulated: false,
        url: result.msg_data_id
          ? `https://mp.weixin.qq.com/s/${result.msg_data_id}`
          : undefined,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : '未知错误';
      return {
        platformId: this.platformId,
        platformName: this.displayName,
        status: 'failed',
        publishedAt: new Date().toISOString(),
        message: `微信发布失败: ${msg}`,
        simulated: false,
      };
    }
  }

  private toWeChatHTML(markdown: string): string {
    const truncated = this.truncateBody(markdown);
    return truncated
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
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
}
