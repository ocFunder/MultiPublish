import React, { useEffect, useState } from 'react';
import { PublishRecord, fetchHistory } from '../services/api';

interface Props {
  onBack: () => void;
}

export function HistoryPage({ onBack }: Props) {
  const [records, setRecords] = useState<PublishRecord[]>([]);

  useEffect(() => {
    fetchHistory().then(setRecords);
  }, []);

  return (
    <div className="history-page">
      <header className="app-header">
        <button className="btn-back" onClick={onBack}>← 返回</button>
        <h1>发布历史</h1>
      </header>

      {records.length === 0 ? (
        <div className="empty-state">暂无发布记录</div>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>平台</th>
              <th>状态</th>
              <th>消息</th>
              <th>发布时间</th>
              <th>模拟链接</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td>{r.platformName}</td>
                <td>
                  <span className={`status-badge ${r.status}`}>
                    {r.status === 'success' ? '成功' : r.status === 'failed' ? '失败' : r.status}
                  </span>
                </td>
                <td className="msg-cell">{r.message}</td>
                <td>{new Date(r.publishedAt).toLocaleString('zh-CN')}</td>
                <td>
                  {r.simulatedUrl && (
                    <a href={r.simulatedUrl} target="_blank" rel="noreferrer">查看</a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
