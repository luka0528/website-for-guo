# 后端认证 API（一期：邮箱 + httpOnly Cookie）

Base URL 示例：`http://<ECS公网IP>:3000`（上线后改为 `https://api.xxx`）。

所有接口 JSON。登录成功后会在响应里 **Set-Cookie**：

- `access_token`：JWT（短期）
- `refresh_token`：随机串（长期；库里仅存 SHA-256 哈希）

前端请求需带 Cookie：`credentials: 'include'`（且 CORS 需配置 `CORS_ORIGIN`）。

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/signup` | body: `{ "email", "password" }`（密码 ≥ 8 位） |
| POST | `/auth/login` | body: `{ "email", "password" }` |
| POST | `/auth/refresh` | 用 `refresh_token` Cookie 换新 access |
| POST | `/auth/logout` | 作废 refresh、清 Cookie |
| GET | `/auth/me` | 需要 `access_token` Cookie |

环境变量见 `backend/teacher-api/.env.example`（**务必设置 `JWT_ACCESS_SECRET`**）。
