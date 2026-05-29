import React, { useState, useEffect, useCallback } from 'react';
import { ContentEditor } from '../components/ContentEditor';
import { PlatformSelector } from '../components/PlatformSelector';
import { Preview } from '../components/Preview';
import { PublishPanel } from '../components/PublishPanel';
import {
  Platform, PlatformContent, ValidationResult, PublishRecord,
  fetchPlatforms, saveContent, transformContent, publishContent,
} from '../services/api';

interface Props {
  onViewHistory: () => void;
}

export function EditorPage({ onViewHistory }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [contents, setContents] = useState<PlatformContent[]>([]);
  const [validations, setValidations] = useState<ValidationResult[]>([]);

  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<PublishRecord[]>([]);
  const [contentId, setContentId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlatforms().then(setPlatforms);
  }, []);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handlePreview = useCallback(async () => {
    if (!title || !body || selectedPlatforms.length === 0) return;
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const result = await transformContent(
        { title, body, coverImage: coverImage || undefined, images: [], tags: tagList, category: category || undefined },
        selectedPlatforms,
      );
      setValidations(result.validations);
      setContents(result.contents);
    } catch (err) {
      console.error('转换失败:', err);
    }
  }, [title, body, coverImage, tags, category, selectedPlatforms]);

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) return;
    setPublishing(true);

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    try {
      // 先保存内容
      const saved = await saveContent({
        title, body, coverImage: coverImage || undefined,
        images: [], tags: tagList, category: category || undefined,
      });
      setContentId(saved.id!);

      // 发布
      const result = await publishContent(saved.id!, selectedPlatforms);
      if (result.results) {
        setPublishResults(result.results.map((r: Record<string, unknown>) => ({
          id: Math.random().toString(36).slice(2),
          contentId: saved.id!,
          platformId: r.platformId,
          platformName: r.platformName,
          status: r.status,
          message: r.message,
          publishedAt: r.publishedAt,
          simulatedUrl: r.simulatedUrl,
          createdAt: new Date().toISOString(),
        })));
      }
    } catch (err) {
      console.error('发布失败:', err);
    }
    setPublishing(false);
  };

  return (
    <div className="editor-page">
      <header className="app-header">
        <h1>MultiPublish</h1>
        <span className="subtitle">多平台内容发布工具</span>
      </header>

      <div className="editor-layout">
        <div className="editor-left">
          <ContentEditor
            title={title} body={body} coverImage={coverImage}
            tags={tags} category={category}
            onTitleChange={setTitle} onBodyChange={setBody}
            onCoverImageChange={setCoverImage}
            onTagsChange={setTags} onCategoryChange={setCategory}
          />

          <PlatformSelector
            platforms={platforms}
            selected={selectedPlatforms}
            onToggle={togglePlatform}
          />

          <div className="preview-action">
            <button
              className="btn-preview"
              disabled={!title || !body || selectedPlatforms.length === 0}
              onClick={handlePreview}
            >
              预览转换效果
            </button>
          </div>

          <PublishPanel
            selectedPlatforms={selectedPlatforms}
            onPublish={handlePublish}
            publishing={publishing}
            publishResults={publishResults}
            onViewHistory={onViewHistory}
          />
        </div>

        <div className="editor-right">
          <Preview contents={contents} validations={validations} />
        </div>
      </div>
    </div>
  );
}

