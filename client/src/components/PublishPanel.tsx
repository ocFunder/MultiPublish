import React from 'react';
import { PublishRecord } from '../services/api';

interface Props {
  selectedPlatforms: string[];
  onPublish: () => void;
  publishing: boolean;
  publishResults: PublishRecord[];
  onViewHistory: () => void;
}

export function PublishPanel({
  selectedPlatforms, onPublish, publishing, publishResults, onViewHistory,
}: Props) {
  return (
    <div className="publish-panel">
      <h2>发布</h2>

      <div className="publish-actions">
        <button
          className="btn-publish"
          disabled={selectedPlatforms.length === 0 || publishing}
          onClick={onPublish}
        >
          {publishing ? '发布中...' : `一键发布 (${selectedPlatforms.length} 个平台)`}
        </button>

        <button className="btn-secondary" onClick={onViewHistory}>
          查看发布历史
        </button>
      </div>

      {publishResults.length > 0 && (
        <div className="publish-results">
          <h3>发布结果</h3>
          {publishResults.map(r => (
            <div key={r.id} className={`publish-result ${r.status}`}>
              <span className="platform-badge">{r.platformName}</span>
              <span className={`status-badge ${r.status}`}>
                {r.status === 'success' ? '成功' : '失败'}
              </span>
              <span className="result-message">{r.message}</span>
              {r.simulatedUrl && (
                <a href={r.simulatedUrl} className="result-url" target="_blank" rel="noreferrer">
                  模拟链接
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
