import React, { useState, useEffect, useRef } from 'react';
import { ContentEditor } from '../components/ContentEditor';
import { PlatformSelector } from '../components/PlatformSelector';
import { Preview } from '../components/Preview';
import {
  Platform, PlatformContent, ValidationResult, PublishRecord,
  fetchPlatforms, saveContent, transformContent, publishContent,
} from '../services/api';

interface Props {
  onViewHistory: () => void;
  onViewSettings: () => void;
}

export function EditorPage({ onViewHistory, onViewSettings }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [contents, setContents] = useState<PlatformContent[]>([]);
  const [validations, setValidations] = useState<ValidationResult[]>([]);
  const [previewing, setPreviewing] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<PublishRecord[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fetchPlatforms().then(setPlatforms);
  }, []);

  // 自动预览：内容或平台变化时，debounce 后自动请求转换
  useEffect(() => {
    if (!title || !body || selectedPlatforms.length === 0) {
      setContents([]);
      setValidations([]);
      return;
    }

    setPreviewing(true);
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const tagList = tags.split(/[,，]/).map(t => t.trim()).filter(Boolean);
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
      setPreviewing(false);
    }, 400); // 400ms 防抖

    return () => clearTimeout(debounceRef.current);
  }, [title, body, coverImage, tags, category, selectedPlatforms]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
    // 切换平台时清空上次发布结果
    setPublishResults([]);
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) return;
    setPublishing(true);

    const tagList = tags.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    try {
      const saved = await saveContent({
        title, body, coverImage: coverImage || undefined,
        images: [], tags: tagList, category: category || undefined,
      });

      const result = await publishContent(saved.id!, selectedPlatforms);
      if (result.results) {
        setPublishResults(result.results.map((r: Record<string, unknown>) => ({
          id: Math.random().toString(36).slice(2),
          contentId: saved.id!,
          platformId: r.platformId as string,
          platformName: r.platformName as string,
          status: r.status as string,
          message: r.message as string,
          publishedAt: r.publishedAt as string,
          simulated: r.simulated as boolean,
          url: r.url as string | undefined,
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
        <div className="header-spacer" />
        <button className="btn-header" onClick={onViewSettings}>
          设置
        </button>
        <button className="btn-header" onClick={onViewHistory}>
          发布历史
        </button>
      </header>

      <div className="editor-layout">
        {/* 左侧：内容编辑 */}
        <div className="editor-left">
          <ContentEditor
            title={title} body={body} coverImage={coverImage}
            tags={tags} category={category}
            onTitleChange={setTitle} onBodyChange={setBody}
            onCoverImageChange={setCoverImage}
            onTagsChange={setTags} onCategoryChange={setCategory}
          />
        </div>

        {/* 右侧：选择平台 → 自动预览 → 发布 */}
        <div className="editor-right">
          <PlatformSelector
            platforms={platforms}
            selected={selectedPlatforms}
            onToggle={togglePlatform}
          />

          {selectedPlatforms.length === 0 ? (
            <div className="preview-empty">
              <div className="empty-icon">&#x1F4E3;</div>
              <p>请选择目标发布平台</p>
              <p className="hint">选择平台后将自动预览各平台格式效果</p>
            </div>
          ) : !title || !body ? (
            <div className="preview-empty">
              <div className="empty-icon">&#x270D;&#xFE0F;</div>
              <p>请输入内容标题和正文</p>
              <p className="hint">输入内容后将自动转换并预览</p>
            </div>
          ) : (
            <>
              {previewing && contents.length === 0 && (
                <div className="preview-loading">正在转换格式...</div>
              )}
              <Preview contents={contents} validations={validations} />
            </>
          )}

          {/* 发布按钮 */}
          <button
            className="btn-publish"
            disabled={selectedPlatforms.length === 0 || !title || !body || publishing}
            onClick={handlePublish}
          >
            {publishing
              ? '发布中...'
              : selectedPlatforms.length === 0
                ? '请先选择平台'
                : `一键发布到 ${selectedPlatforms.length} 个平台`}
          </button>

          {/* 发布结果 */}
          {publishResults.length > 0 && (
            <div className="publish-results">
              <h3>发布结果</h3>
              {publishResults.map(r => (
                <div key={r.id} className={`publish-result ${r.status}`}>
                  <span className="platform-badge">{r.platformName}</span>
                  <span className={`status-badge ${r.status}`}>
                    {r.status === 'success' ? '成功' : '失败'}
                  </span>
                  <span className={`mode-badge ${r.simulated ? 'simulated' : 'real'}`}>
                    {r.simulated ? '模拟' : '真实'}
                  </span>
                  <span className="result-message">{r.message}</span>
                  {r.url && (
                    <a href={r.url} className="result-url" target="_blank" rel="noreferrer">
                      查看
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
