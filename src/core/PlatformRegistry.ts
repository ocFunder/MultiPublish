import { IPlatformAdapter } from './types';

/**
 * 平台适配器注册中心
 * 管理所有平台适配器的注册、查找和列表
 */
export class PlatformRegistry {
  private adapters: Map<string, IPlatformAdapter> = new Map();

  /** 注册适配器 */
  register(adapter: IPlatformAdapter): void {
    if (this.adapters.has(adapter.platformId)) {
      throw new Error(`平台 ${adapter.platformId} 已注册`);
    }
    this.adapters.set(adapter.platformId, adapter);
  }

  /** 获取指定平台的适配器 */
  get(platformId: string): IPlatformAdapter | undefined {
    return this.adapters.get(platformId);
  }

  /** 批量获取适配器 */
  getAll(platformIds: string[]): IPlatformAdapter[] {
    return platformIds
      .map(id => this.adapters.get(id))
      .filter((a): a is IPlatformAdapter => a !== undefined);
  }

  /** 列出所有已注册平台的信息 */
  listPlatforms(): Array<{
    platformId: string;
    displayName: string;
    contentRules: IPlatformAdapter['contentRules'];
  }> {
    return Array.from(this.adapters.values()).map(a => ({
      platformId: a.platformId,
      displayName: a.displayName,
      contentRules: a.contentRules,
    }));
  }

  /** 检查平台是否已注册 */
  has(platformId: string): boolean {
    return this.adapters.has(platformId);
  }

  /** 获取已注册平台数量 */
  get count(): number {
    return this.adapters.size;
  }
}
