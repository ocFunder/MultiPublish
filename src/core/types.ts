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
  simulatedUrl?: string;
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

  /** 发布内容到平台 */
  publish(content: PlatformContent): Promise<PublishResult>;
}
