# 下载 API（OSS 签名 URL）

## 端点

`GET /download?key=<objectKey>&filename=<optional>`

- **鉴权**：必须携带 `access_token` httpOnly cookie（和 `/auth/me` 同源策略）。未登录返回 `401`。
- **query 参数**：
  - `key`（必需）：OSS 对象 key，必须以 `publications/` 或 `resources/` 开头；不允许 `..`、`\`、以 `/` 开头。
  - `filename`（可选）：浏览器下载时显示的文件名（`Content-Disposition`）。

## 响应

```json
{
  "url": "https://<bucket>.<region>.aliyuncs.com/publications/foo.pdf?OSSAccessKeyId=...&Expires=...&Signature=...",
  "expiresIn": 180,
  "key": "publications/foo.pdf"
}
```

前端拿到 `url` 后，`location.href = url` 或 `window.open(url)` 即可直接从 OSS 下载；签名链接默认 **180 秒** 后失效。

## 错误码

| 状态 | 说明 |
|---|---|
| 400 | `key` 缺失或格式非法 |
| 401 | 未登录 / access_token 过期 |
| 403 | `key` 不在白名单前缀内（防止越权） |
| 500 | 服务器未配置 OSS 环境变量 |

## 环境变量

```env
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=<your-bucket>
OSS_ACCESS_KEY_ID=<ram-sub-account-AK>
OSS_ACCESS_KEY_SECRET=<ram-sub-account-secret>
DOWNLOAD_URL_TTL=180
```

**强烈建议**使用**RAM 子账号**且只授予目标 bucket 的 **读权限**（`oss:GetObject`）。不要用主账号 AK。

## 审计

每次成功签名都会写入 `DownloadLog` 表：

```
id, userId, objectKey, ip, userAgent, createdAt
```

示例：查看最近下载记录

```sql
SELECT u.email, d.objectKey, d.createdAt
FROM DownloadLog d JOIN User u ON u.id = d.userId
ORDER BY d.createdAt DESC LIMIT 20;
```

## curl 验证

```bash
# 先登录拿 cookie
curl -sS -c /tmp/c.txt -X POST http://127.0.0.1:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"Test1234!"}' > /dev/null

# 合法 key
curl -sS -b /tmp/c.txt 'http://127.0.0.1:3000/download?key=publications/demo.pdf&filename=demo.pdf'

# 非法前缀 → 403
curl -sS -b /tmp/c.txt 'http://127.0.0.1:3000/download?key=private/secret.txt'

# 未登录 → 401
curl -sS 'http://127.0.0.1:3000/download?key=publications/demo.pdf'
```
