// ============================================================
// 统一内容模型 (Unified Content Model)
// ============================================================

/** 用户输入的原始内容 */
export interface UnifiedContent {
  id?: string;
  title: string;
  body: string;          // Markdown 格式
  coverImage?: string;    // 封面图 URL/路径
  images: string[];       // 插图列表
  tags: string[];         // 标签
  category?: string;      // 分类
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// 平台相关类型
// ============================================================

/** 各平台的内容限制规则 */
export interface PlatformRules {
  maxTitleLength: number;
  maxBodyLength: number;
  maxImages: number;
  requiresCoverImage: boolean;
  supportsMarkdown: boolean;
  supportsTags: boolean;
  supportedImageFormats: string[];
}

/** 转换后的平台特定内容 */
export interface PlatformContent {
  platformId: string;
  platformName: string;
  originalId: string;
  title: string;
  body: string;           // 平台格式化后的正文
  coverImage?: string;
  images: string[];
  tags: string[];
  metadata: Record<string, unknown>;
}

/** 内容验证结果 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

// ============================================================
// 发布相关类型
// ============================================================

/** 发布状态枚举 */
export type PublishStatus = 'pending' | 'publishing' | 'success' | 'failed';

/** 单平台发布结果 */
export interface PublishResult {
  platformId: string;
  platformName: string;
  status: PublishStatus;
  publishedAt: string;
  message: string;
  /** 是否为模拟发布 */
  simulated: boolean;
  /** 真实发布后的 URL 或模拟 URL */
  url?: string;
}

/** 批量发布请求 */
export interface PublishRequest {
  contentId: string;
  platformIds: string[];
}

/** 批量发布响应 */
export interface PublishResponse {
  contentId: string;
  results: PublishResult[];
  summary: {
    total: number;
    success: number;
    failed: number;
  };
}

// ============================================================
// 平台凭证
// ============================================================

/** 平台凭证 */
export interface PlatformCredentials {
  platformId: string;
  credentials: Record<string, string>;
  configured: boolean;
}

/** 微信公众号凭证 */
export interface WeChatCredentials {
  appId: string;
  appSecret: string;
}

// ============================================================
// 平台适配器接口 (Strategy Pattern)
// ============================================================

/** 平台适配器接口 - 扩展新平台只需实现此接口 */
export interface IPlatformAdapter {
  readonly platformId: string;
  readonly displayName: string;
  readonly contentRules: PlatformRules;

  /** 将统一内容转换为平台特定格式 */
  transform(content: UnifiedContent): PlatformContent;

  /** 验证内容是否符合平台要求 */
  validate(content: UnifiedContent): ValidationResult;

  /** 发布内容到平台（有凭证则真实发布，无凭证则模拟） */
  publish(content: PlatformContent, credentials?: Record<string, string>): Promise<PublishResult>;

  /** 是否有真实 API 支持 */
  readonly supportsRealPublish: boolean;
}
