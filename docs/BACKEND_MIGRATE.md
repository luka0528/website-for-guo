# RDS：执行 Prisma 迁移（第一步：建表）

在 ECS 上 `backend/teacher-api` 目录、且已配置 `.env` 中的 `DATABASE_URL` 后：

```bash
cd ~/deploy-test/website-for-guo-deploy-test/backend/teacher-api
npm run migrate:deploy
```

成功后再 `npm run build` 与重启后端（若已在运行）。

仅首次部署需要；之后若修改 `schema.prisma` 会新增迁移，同样用 `migrate:deploy`。
