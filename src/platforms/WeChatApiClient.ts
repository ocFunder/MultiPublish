/**
 * 微信公众号 API 客户端
 * 封装 access_token 获取、草稿创建、发布等接口
 *
 * API 文档：https://developers.weixin.qq.com/doc/offiaccount/Draft_Box/Add_draft.html
 */

const WECHAT_API = 'https://api.weixin.qq.com/cgi-bin';

interface AccessTokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: AccessTokenCache | null = null;

/** 获取 access_token（带缓存） */
export async function getAccessToken(appId: string, appSecret: string): Promise<string> {
  // 检查缓存（提前 5 分钟过期）
  if (tokenCache && tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
    return tokenCache.token;
  }

  const url = `${WECHAT_API}/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  const res = await fetch(url);
  const data = await res.json() as Record<string, unknown>;

  if ((data as { errcode?: number }).errcode) {
    const err = data as { errcode: number; errmsg: string };
    throw new Error(`微信 access_token 获取失败 [${err.errcode}]: ${err.errmsg}`);
  }

  const token = data.access_token as string;
  const expiresIn = (data.expires_in as number) || 7200;

  tokenCache = {
    token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return token;
}

/** 添加草稿 */
export async function addDraft(
  accessToken: string,
  articles: Array<{
    title: string;
    content: string;
    content_source_url?: string;
    thumb_media_id?: string;
    need_open_comment?: number;
    only_fans_can_comment?: number;
    digest?: string;
  }>
): Promise<{ media_id: string }> {
  const url = `${WECHAT_API}/draft/add?access_token=${accessToken}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articles }),
  });
  const data = await res.json() as Record<string, unknown>;

  if ((data as { errcode?: number }).errcode) {
    const err = data as { errcode: number; errmsg: string };
    throw new Error(`微信草稿创建失败 [${err.errcode}]: ${err.errmsg}`);
  }

  return { media_id: data.media_id as string };
}

/** 发布草稿（通过 free publish 接口，适用于服务号） */
export async function submitFreePublish(
  accessToken: string,
  mediaId: string
): Promise<{ publish_id: string; msg_data_id?: string }> {
  const url = `${WECHAT_API}/freepublish/submit?access_token=${accessToken}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_id: mediaId }),
  });
  const data = await res.json() as Record<string, unknown>;

  if ((data as { errcode?: number }).errcode) {
    const err = data as { errcode: number; errmsg: string };
    throw new Error(`微信发布失败 [${err.errcode}]: ${err.errmsg}`);
  }

  return {
    publish_id: data.publish_id as string,
    msg_data_id: data.msg_data_id as string | undefined,
  };
}

/** 批量获取已发布文章列表 */
export async function getFreePublishList(
  accessToken: string,
  offset = 0,
  count = 20
): Promise<unknown> {
  const url = `${WECHAT_API}/freepublish/batchget?access_token=${accessToken}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offset, count, no_content: 1 }),
  });
  return res.json();
}
