import { createApp } from './app';

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`MultiPublish server running at http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  POST /api/content/transform - 转换内容`);
  console.log(`  POST /api/content/save      - 保存内容`);
  console.log(`  GET  /api/content/:id       - 获取内容`);
  console.log(`  GET  /api/content           - 列出内容`);
  console.log(`  GET  /api/platforms          - 平台列表`);
  console.log(`  POST /api/publish            - 发布内容`);
  console.log(`  GET  /api/publish/history    - 发布历史`);
});
