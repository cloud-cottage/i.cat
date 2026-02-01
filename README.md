# 猫猫之家 (i.cat)

一个 Web3 个人主页平台 —— 通过钱包登录，创建你的专属页面 `i.catcat.meme/username`，支持外部链接展示、主题切换和社交媒体集成。

## 技术栈

- Frontend: Next.js + TypeScript
- Web Components: 链接列表、主题切换、推文小组件
- Backend: Next.js API routes（MVP 内存数据存储）
- Styling: CSS 变量 + 9 套主题
- Deployment: Vercel（免费计划）

## 快速开始

```bash
npm install
npm run dev
```

访问 http://localhost:3000，示例博客页：
- http://localhost:3000/alice

## 核心 MVP 功能

- Web3 登录（SIWE 占位）
- 动态路由 /[username] 个人博客页
- 0–9 条外部链接的增删改查 + 拖拽排序
- 9 套主题一键切换
- 推文区域（Twitter API v2 占位，缓存 1 小时）
- 不对外暴露 API，仅站内使用

## 项目结构

- `pages/[username].tsx` — 动态博客页
- `pages/api/*` — 内部 API（用户、链接、推文）
- `src/webcomponents/*` — Web Components 实现
- `styles/globals.css` — 主题 CSS 变量与通用样式
- `lib/db.ts` — MVP 内存数据库实现

## 后续路线

- 完整 Web3 登录与真实数据库迁移
- Twitter/X 集成与推文展示
- Vercel 部署与域名配置
- 更多主题风格与个性化选项

## License

MIT