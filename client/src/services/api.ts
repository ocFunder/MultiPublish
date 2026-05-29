const BASE_URL = '/api';

export interface Platform {
  platformId: string;
  displayName: string;
  contentRules: {
    maxTitleLength: number;
    maxBodyLength: number;
    maxImages: number;
    requiresCoverImage: boolean;
    supportsMarkdown: boolean;
    supportsTags: boolean;
  };
}

export interface UnifiedContent {
  id?: string;
  title: string;
  body: string;
  coverImage?: string;
  images: string[];
  tags: string[];
  category?: string;
}

export interface PlatformContent {
  platformId: string;
  platformName: string;
  title: string;
  body: string;
  images: string[];
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface ValidationResult {
  platformId: string;
  platformName: string;
  result: {
    valid: boolean;
    errors: { field: string; message: string }[];
    warnings: { field: string; message: string }[];
  };
}

export interface PublishSummary {
  total: number;
  success: number;
  failed: number;
}

export interface PublishRecord {
  id: string;
  contentId: string;
  platformId: string;
  platformName: string;
  status: string;
  message: string;
  publishedAt: string;
  simulatedUrl: string;
  createdAt: string;
}

// --- API functions ---

export async function fetchPlatforms(): Promise<Platform[]> {
  const res = await fetch(`${BASE_URL}/platforms`);
  return res.json();
}

export async function saveContent(content: UnifiedContent): Promise<UnifiedContent> {
  const res = await fetch(`${BASE_URL}/content/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  });
  return res.json();
}

export async function transformContent(content: UnifiedContent, platformIds: string[]) {
  const res = await fetch(`${BASE_URL}/content/transform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...content, platformIds }),
  });
  return res.json();
}

export async function publishContent(contentId: string, platformIds: string[]) {
  const res = await fetch(`${BASE_URL}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentId, platformIds }),
  });
  return res.json();
}

export async function fetchHistory(): Promise<PublishRecord[]> {
  const res = await fetch(`${BASE_URL}/publish/history`);
  return res.json();
}

export async function fetchContents(): Promise<UnifiedContent[]> {
  const res = await fetch(`${BASE_URL}/content`);
  return res.json();
}
