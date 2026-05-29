import React from 'react';

interface Props {
  title: string;
  body: string;
  coverImage: string;
  tags: string;
  category: string;
  onTitleChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onCoverImageChange: (v: string) => void;
  onTagsChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
}

export function ContentEditor({
  title, body, coverImage, tags, category,
  onTitleChange, onBodyChange, onCoverImageChange, onTagsChange, onCategoryChange,
}: Props) {
  return (
    <div className="content-editor">
      <h2>内容编辑</h2>

      <div className="form-group">
        <label>标题</label>
        <input
          type="text"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="输入文章标题"
        />
      </div>

      <div className="form-row">
        <div className="form-group flex-1">
          <label>分类</label>
          <input
            type="text"
            value={category}
            onChange={e => onCategoryChange(e.target.value)}
            placeholder="如：科技、生活、教程"
          />
        </div>
        <div className="form-group flex-1">
          <label>封面图 URL（可选）</label>
          <input
            type="text"
            value={coverImage}
            onChange={e => onCoverImageChange(e.target.value)}
            placeholder="https://example.com/cover.jpg"
          />
        </div>
      </div>

      <div className="form-group">
        <label>标签（逗号分隔）</label>
        <input
          type="text"
          value={tags}
          onChange={e => onTagsChange(e.target.value)}
          placeholder="科技, 产品, AI"
        />
      </div>

      <div className="form-group">
        <label>正文（Markdown 格式）</label>
        <textarea
          value={body}
          onChange={e => onBodyChange(e.target.value)}
          placeholder={`# 标题

这是正文内容，支持 **Markdown** 格式

- 列表项 1
- 列表项 2

> 引用文字`}
          rows={16}
        />
      </div>
    </div>
  );
}
