## 当前版本基线（用于后续国内化迁移回归）

### 技术栈
- **前端**：Astro v6 + Tailwind
- **内容**：Astro Content Collections（Markdown + frontmatter）
- **双语**：`/` 中文 + `/en` 英文
- **临时鉴权/下载**：Supabase Auth + Supabase Storage（后续将迁移为阿里云 OSS + 自建后端）

### 本地运行
- **Node**：>= 22
- **启动**：`npm run dev -- --host --port 4321`
- **本地地址**：`http://localhost:4321/`

### 页面路由（核心）
- **首页**：`/`、`/en`
- **团队**：`/team`、`/team/<key>`；`/en/team`、`/en/team/<key>`
- **新闻**：`/news`、`/news/<key>`；`/en/news`、`/en/news/<key>`
- **科研成果**：`/publications`、`/publications/<key>`；`/en/publications`、`/en/publications/<key>`
- **联系**：`/contact`、`/en/contact`
- **资源下载（受保护示例）**：`/resources`、`/en/resources`
- **登录/注册（Supabase 版本）**：
  - `/login`、`/signup`、`/signup/success`
  - `/en/login`、`/en/signup`、`/en/signup/success`

### 内容集合（Content Collections）
配置文件：
- `src/content.config.ts`

集合目录：
- `src/content/people/*.md`
- `src/content/news/*.md`
- `src/content/publications/*.md`

跨语言固定主键：
- `people/news/publications` 均使用 frontmatter 的 `key` 字段（中英一致）

### 科研成果筛选（当前实现）
列表页：
- `src/pages/publications.astro`
- `src/pages/en/publications.astro`

支持筛选：
- 年份（year）
- 标签（tag）
- 作者（author）
并写入 URL query（便于分享与回退）。

### 下载鉴权（当前 Supabase 实现）
- 前端下载脚本：`src/scripts/download.ts`
- 下载接口（Astro API route）：`src/pages/api/download/[...key].ts`
  - 需要 `Authorization: Bearer <supabase_access_token>`
  - 成功返回 `{ url }`（signed URL）或 302（浏览器直连）

### 登录状态按钮（当前 Supabase 实现）
- 顶部状态脚本：`src/scripts/auth-status.ts`
- 组件逻辑：`src/components/AuthStatus.ts`
- Supabase 客户端：`src/lib/supabaseClient.ts`
- Supabase 服务端：`src/lib/supabaseServer.ts`

### 迁移目标（下一阶段）
- 用阿里云 **ECS + RDS(MySQL) + OSS(私有) + CDN(可选)** 替换 Supabase
- 鉴权改为 **httpOnly Cookie**（access/refresh）
- 下载改为 **后端生成 OSS 签名 URL**

