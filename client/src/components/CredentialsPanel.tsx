import React, { useEffect, useState } from 'react';
import { CredentialStatus, fetchCredentials, saveCredentials, deleteCredentials } from '../services/api';

export function CredentialsPanel() {
  const [creds, setCreds] = useState<CredentialStatus[]>([]);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCredentials().then(setCreds);
  }, []);

  const handleSave = async (platformId: string) => {
    await saveCredentials(platformId, formValues);
    setEditingPlatform(null);
    setFormValues({});
    fetchCredentials().then(setCreds);
  };

  const handleDelete = async (platformId: string) => {
    await deleteCredentials(platformId);
    fetchCredentials().then(setCreds);
  };

  const handleEdit = (c: CredentialStatus) => {
    setEditingPlatform(c.platformId);
    setFormValues({});
  };

  return (
    <div className="credentials-panel">
      <h2>平台凭证配置</h2>
      <p className="section-desc">
        配置平台的 API 凭证后即可真实发布；未配置的平台将自动使用模拟发布。
      </p>

      <div className="creds-list">
        {creds.map(c => (
          <div key={c.platformId} className={`cred-card ${c.configured ? 'configured' : ''}`}>
            <div className="cred-header">
              <span className="cred-platform">{c.displayName}</span>
              <span className={`cred-status ${c.configured ? 'active' : 'inactive'}`}>
                {c.configured ? '已配置' : '模拟模式'}
              </span>
            </div>

            {!c.supportsRealPublish && (
              <p className="cred-note">该平台暂无可用的公开内容发布 API</p>
            )}

            {c.supportsRealPublish && editingPlatform === c.platformId ? (
              <div className="cred-form">
                {c.platformId === 'wechat' && (
                  <>
                    <label>AppID</label>
                    <input
                      type="text"
                      placeholder="wxXXXXXXXXXXXXXXXX"
                      onChange={e => setFormValues({ ...formValues, appId: e.target.value })}
                    />
                    <label>AppSecret</label>
                    <input
                      type="password"
                      placeholder="输入 AppSecret"
                      onChange={e => setFormValues({ ...formValues, appSecret: e.target.value })}
                    />
                  </>
                )}
                {c.platformId === 'bilibili' && (
                  <>
                    <label>Access Token</label>
                    <input
                      type="password"
                      placeholder="B站开放平台 access_token"
                      onChange={e => setFormValues({ ...formValues, accessToken: e.target.value })}
                    />
                  </>
                )}
                <div className="cred-actions">
                  <button className="btn-save" onClick={() => handleSave(c.platformId)}>保存</button>
                  <button className="btn-cancel" onClick={() => setEditingPlatform(null)}>取消</button>
                </div>
              </div>
            ) : (
              c.supportsRealPublish && (
                <div className="cred-actions">
                  <button className="btn-secondary-sm" onClick={() => handleEdit(c)}>
                    {c.configured ? '修改凭证' : '配置凭证'}
                  </button>
                  {c.configured && (
                    <button className="btn-danger-sm" onClick={() => handleDelete(c.platformId)}>
                      删除凭证
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
