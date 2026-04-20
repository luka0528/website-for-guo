# Backend (teacher-api) — ECS 运行与排错

## 推荐启动流程（在 `backend/teacher-api` 目录）

```bash
npm ci
npm run build
ls -la dist/main.js dist/app.module.js
nohup npm run start:prod > server.log 2>&1 &
tail -n 40 server.log
```

- **`npm run build`** 会执行 `prisma generate` 与 `nest build`，生成整个 `dist/`。**不要**只上传 `dist/main.js` 或跳过构建。
- 若 `.env` 中 `DATABASE_URL` 等缺失导致 `prisma generate` 失败，构建会中断；请先配置 `.env`（可参考 `.env.example`）。

## 常见错误：`Cannot find module './app.module'`

含义：Node 已执行 `dist/main.js`，但同目录下没有 **`dist/app.module.js`**（或其它编译产物）。

**处理：**

1. 在服务器项目根目录确认路径为 `.../backend/teacher-api`（与 `package.json` 同级）。
2. 执行 `npm run build`，再检查：
   - `test -f dist/app.module.js && echo ok`
3. 若构建报错，根据日志修复（常见：未安装依赖、Prisma schema、环境变量）。

`prestart:prod` 会在启动前检查 `dist/main.js` 与 `dist/app.module.js` 是否存在；若缺失会提示先执行 `npm run build`。

## 进程守护（二选一）

- **pm2**：`pm2 start dist/main.js --name teacher-api`
- **systemd**：将 `WorkingDirectory` 设为 `backend/teacher-api`，`ExecStart=/usr/bin/node dist/main.js`（需与 Node 路径一致）

## CORS 与 Cookie

生产环境请将 `CORS_ORIGIN` 设为前端实际来源（含协议与端口），与浏览器 `credentials: 'include'` 配合使用。
