import { IPlatformAdapter, UnifiedContent, PlatformContent, ValidationResult, PublishResult, PlatformRules } from '../core/types';

/**
 * 平台适配器抽象基类
 * 提供通用的转换、验证和发布逻辑，子类只需实现平台特定的部分
 */
export abstract class BaseAdapter implements IPlatformAdapter {
  abstract readonly platformId: string;
  abstract readonly displayName: string;
  abstract readonly contentRules: PlatformRules;

  /** 子类必须实现：平台特定的内容转换 */
  abstract transform(content: UnifiedContent): PlatformContent;

  /** 子类必须实现：平台特定的发布逻辑 */
  abstract publish(content: PlatformContent): Promise<PublishResult>;

  /** 通用验证逻辑，子类可覆盖以添加平台特定规则 */
  validate(content: UnifiedContent): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];
    const rules = this.contentRules;

    if (!content.title || content.title.trim().length === 0) {
      errors.push({ field: 'title', message: '标题不能为空' });
    } else if (content.title.length > rules.maxTitleLength) {
      warnings.push({
        field: 'title',
        message: `标题超过${this.displayName}限制(${rules.maxTitleLength}字)，将自动截断`
      });
    }

    if (!content.body || content.body.trim().length === 0) {
      errors.push({ field: 'body', message: '正文不能为空' });
    } else if (content.body.length > rules.maxBodyLength) {
      warnings.push({
        field: 'body',
        message: `正文超过${this.displayName}限制(${rules.maxBodyLength}字)，将自动截断`
      });
    }

    if (rules.requiresCoverImage && !content.coverImage) {
      warnings.push({
        field: 'coverImage',
        message: `${this.displayName}要求封面图，请添加`
      });
    }

    if (content.images.length > rules.maxImages) {
      warnings.push({
        field: 'images',
        message: `${this.displayName}最多支持${rules.maxImages}张图片，超出部分将被忽略`
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /** 默认标题截断 */
  protected truncateTitle(title: string): string {
    if (title.length <= this.contentRules.maxTitleLength) return title;
    return title.substring(0, this.contentRules.maxTitleLength);
  }

  /** 默认正文截断 */
  protected truncateBody(body: string): string {
    if (body.length <= this.contentRules.maxBodyLength) return body;
    return body.substring(0, this.contentRules.maxBodyLength) + '\n\n...(内容已截断)';
  }

  /** 生成模拟发布 URL */
  protected mockUrl(): string {
    return `https://mock.publish/${this.platformId}/${Date.now()}`;
  }
}
