import React from 'react';
import { PlatformContent, ValidationResult } from '../services/api';

interface Props {
  contents: PlatformContent[];
  validations: ValidationResult[];
}

export function Preview({ contents, validations }: Props) {
  if (contents.length === 0) return null;

  return (
    <div className="preview">
      <h2>预览</h2>
      <div className="preview-tabs">
        {contents.map((c) => {
          const validation = validations.find(v => v.platformId === c.platformId);
          const warnings = validation?.result.warnings || [];

          return (
            <details key={c.platformId} className="preview-panel" open>
              <summary>
                <span className="platform-dot" />
                {c.platformName}
                {warnings.length > 0 && (
                  <span className="warning-badge">{warnings.length} 个提醒</span>
                )}
              </summary>

              {warnings.length > 0 && (
                <div className="warnings">
                  {warnings.map((w, j) => (
                    <div key={j} className="warning-item">{w.message}</div>
                  ))}
                </div>
              )}

              <div className="preview-field">
                <strong>标题：</strong>{c.title}
              </div>

              <div className="preview-field">
                <strong>正文：</strong>
                <div
                  className="preview-body"
                  dangerouslySetInnerHTML={{ __html: c.body }}
                />
              </div>

              {c.tags.length > 0 && (
                <div className="preview-field">
                  <strong>标签：</strong>
                  {c.tags.map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              )}
            </details>
          );
        })}
      </div>
    </div>
  );
}
