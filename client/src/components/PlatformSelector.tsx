import React from 'react';
import { Platform } from '../services/api';

interface Props {
  platforms: Platform[];
  selected: string[];
  onToggle: (platformId: string) => void;
}

export function PlatformSelector({ platforms, selected, onToggle }: Props) {
  return (
    <div className="platform-selector">
      <h2>选择发布平台</h2>
      <div className="platform-grid">
        {platforms.map(p => {
          const isSelected = selected.includes(p.platformId);
          return (
            <button
              key={p.platformId}
              className={`platform-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onToggle(p.platformId)}
            >
              <div className="platform-name">{p.displayName}</div>
              <div className="platform-rules">
                <span>标题≤{p.contentRules.maxTitleLength}字</span>
                <span>正文≤{p.contentRules.maxBodyLength}字</span>
                <span>图片≤{p.contentRules.maxImages}张</span>
                {p.contentRules.requiresCoverImage && <span className="required">需封面</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
