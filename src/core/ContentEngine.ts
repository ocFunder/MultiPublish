import { UnifiedContent, PlatformContent, ValidationResult, IPlatformAdapter } from './types';
import { PlatformRegistry } from './PlatformRegistry';

/**
 * 内容转换引擎
 * 负责编排内容验证和跨平台转换流程
 */
export class ContentEngine {
  constructor(private registry: PlatformRegistry) {}

  /** 验证内容在所有目标平台上的合规性 */
  validateAll(content: UnifiedContent, platformIds: string[]): {
    platformId: string;
    platformName: string;
    result: ValidationResult;
  }[] {
    const adapters = this.registry.getAll(platformIds);
    return adapters.map(adapter => ({
      platformId: adapter.platformId,
      platformName: adapter.displayName,
      result: adapter.validate(content),
    }));
  }

  /** 将统一内容转换为所有目标平台的格式 */
  transformAll(content: UnifiedContent, platformIds: string[]): PlatformContent[] {
    const adapters = this.registry.getAll(platformIds);
    return adapters.map(adapter => adapter.transform(content));
  }

  /** 预览单平台转换结果 */
  preview(content: UnifiedContent, platformId: string): PlatformContent | null {
    const adapter = this.registry.get(platformId);
    if (!adapter) return null;
    return adapter.transform(content);
  }

  /** 批量验证与转换：先验证，全部通过后再转换 */
  process(
    content: UnifiedContent,
    platformIds: string[]
  ): {
    validations: ReturnType<ContentEngine['validateAll']>;
    contents: PlatformContent[];
    allValid: boolean;
  } {
    const validations = this.validateAll(content, platformIds);
    const allValid = validations.every(v => v.result.valid);

    if (!allValid) {
      return { validations, contents: [], allValid };
    }

    const contents = this.transformAll(content, platformIds);
    return { validations, contents, allValid };
  }
}
