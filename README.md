# emby-gateway-doc

这是 emby-gateway 的公开文档仓库，使用 VitePress 构建。

## 文档入口

- 首页：`docs/index.md`
- 功能总览：`docs/guide/features-overview.md`
- 快速开始：`docs/guide/quick-start.md`
- 一步步配置：`docs/guide/basic-configuration.md`
- GDrive Worker：`docs/guide/gdrive-worker.md`
- 术语速查：`docs/guide/glossary.md`
- 兼容入口（历史路径）：`gdrive-worker-config.md`
- 配置说明：`docs/reference/configuration.md`
- 故障排查：`docs/ops/troubleshooting.md`

## 本地预览

```bash
npm ci
npm run docs:dev
```

## 构建静态站点

```bash
npm run docs:build
```

构建产物目录：`docs/.vitepress/dist`

## 自动发布

已提供 GitHub Pages 工作流：`.github/workflows/docs-deploy.yml`

- 推送 `main` 分支后自动构建并发布
- 首次启用请在仓库 Settings -> Pages 中选择 GitHub Actions 作为 Source

## 配图维护

Mermaid 源图统一放在：

- `docs/assets/diagrams/01-arch-overview.mmd`
- `docs/assets/diagrams/02-playback-sequence.mmd`
- `docs/assets/diagrams/03-routing-failover.mmd`
- `docs/assets/diagrams/04-deployment-topology.mmd`
- `docs/assets/diagrams/05-troubleshooting-flow.mmd`
