## 阿里云基础设施落地清单（一期：邮箱登录 + 签名下载）

### 目标域名结构（推荐）
- `www.jitaoguo-edu.cn`：前端静态站（OSS 静态托管 + CDN）
- `api.jitaoguo-edu.cn`：后端 API（ECS + Nginx 反代）

### 1) ECS（后端服务器）
- [ ] 系统：Ubuntu 22.04 LTS
- [ ] 配置：2c2g（起步）/ 2c4g（更稳）
- [ ] 安全组：
  - [ ] 80/443 允许公网访问
  - [ ] 22 SSH 仅允许你的固定 IP（强烈建议）
- [ ] 安装基础软件：
  - [ ] Node.js 22（建议用 nvm）
  - [ ] Nginx
  - [ ] pm2 或 systemd（进程守护）
- [ ] 后端部署步骤与排错：见 `docs/BACKEND_ECS_DEPLOY.md`（**必须先 `npm run build` 再 `start:prod`**）

### 2) RDS MySQL（用户数据库）
- [ ] 新建 RDS MySQL（入门规格）
- [ ] 创建数据库：`teacher_site`
- [ ] 创建用户与最小权限账号（只授予该库权限）
- [ ] 配置白名单/安全组允许 ECS 访问

### 3) OSS（下载文件存储）
- [ ] 创建私有 bucket：`downloads`
- [ ] 建议目录结构：
  - `publications/<paperKey>.pdf`
  - `resources/<fileKey>`
- [ ] 配置 CORS（若将来前端直连 OSS 预览/分片上传，可再补）
- [ ] 后端将使用 OSS SDK 生成短期签名 URL（GET）

### 4) CDN（可选但推荐）
- [ ] 给 OSS 静态站绑定 CDN，加速全国访问
- [ ] 给下载域名（可选 `dl.jitaoguo-edu.cn`）配置 CDN 回源 OSS（注意私有资源的鉴权策略）

### 5) 证书与 HTTPS
- [ ] 备案通过后申请证书（阿里云或 Let’s Encrypt）
- [ ] Nginx 配置 HTTPS，强制 HTTP→HTTPS

