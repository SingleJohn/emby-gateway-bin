# emby-gateway-doc

Feiyue Emby Gateway（飞跃 Emby 网关）的官网与文档站，使用 VitePress 构建。

站点地址：https://gateway-doc.henhendeaini.com/

## 本地开发

```bash
npm ci
npm run docs:dev      # 本地预览，改动实时生效
npm run docs:build    # 构建到 docs/.vitepress/dist
npm run docs:preview  # 预览构建产物
```

推送到 `main` 后由 GitHub Actions 自动构建并发布到 GitHub Pages。

## 目录

- `docs/index.md`：官网首页，内容在 `docs/.vitepress/theme/components/home/HomePage.vue`
- `docs/guide/`、`docs/ops/`、`docs/reference/`：文档正文，侧栏在 `docs/.vitepress/config.ts`
- `docs/public/shots/`：管理界面截图，每张都有 `*.light.webp` 与 `*.dark.webp` 两版，文中用 `<Shot name="..." />` 引用
- 已下线页面的旧地址在 `config.ts` 的 `redirects` 中登记，构建时自动生成跳转页
