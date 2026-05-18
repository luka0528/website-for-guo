## 安全说明（密钥与环境变量）

### 已确认
- `.env` 已在 `.gitignore` 中忽略（不会被提交到 Git）
- 代码库内未发现 `sb_secret_`、`sb_publishable_` 等明文 key

### 仍需你在控制台完成（必须做）
由于你曾在截图中暴露过 Supabase 的 `service_role` key，建议你在 Supabase 控制台立刻执行：
- **Rotate/重新生成 `service_role` key**
- 并同步更新本地 `.env`

### 迁移到阿里云后的安全建议
- 后端所有 secret（JWT 密钥、OSS AccessKey、DB 密码）只放在：
  - ECS 环境变量 / 配置文件（权限最小化）
  - 或阿里云 KMS/Secrets Manager（可选）
- 前端只保留非敏感配置（公开 API base URL）

