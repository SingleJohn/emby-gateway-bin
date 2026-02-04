const repository = process.env.GITHUB_REPOSITORY || "your-org/emby-gateway-doc";
const repoUrl = `https://github.com/${repository}`;
const defaultBase = repository.endsWith(".github.io")
  ? "/"
  : `/${repository.split("/")[1] || "emby-gateway-doc"}/`;

export default {
  lang: "zh-CN",
  base: process.env.DOCS_BASE || (process.env.CI ? defaultBase : "/"),
  title: "emby-gateway 文档",
  description: "emby-gateway 公开文档站",
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    siteTitle: "emby-gateway 文档",
    nav: [
      { text: "功能总览", link: "/guide/features-overview" },
      { text: "快速开始", link: "/guide/quick-start" },
      { text: "配置参考", link: "/reference/configuration" },
      { text: "故障排查", link: "/ops/troubleshooting" }
    ],
    sidebar: {
      "/guide/": [
        {
          text: "使用指南",
          items: [
            { text: "功能总览", link: "/guide/features-overview" },
            { text: "快速开始", link: "/guide/quick-start" },
            { text: "部署指南", link: "/guide/deployment" },
            { text: "一步步配置指南", link: "/guide/basic-configuration" },
            { text: "GDrive Worker 指南", link: "/guide/gdrive-worker" },
            { text: "术语速查", link: "/guide/glossary" }
          ]
        }
      ],
      "/reference/": [
        {
          text: "参考文档",
          items: [
            { text: "配置说明", link: "/reference/configuration" },
            { text: "路由与故障切换", link: "/reference/routing-and-failover" }
          ]
        }
      ],
      "/ops/": [
        {
          text: "运维与排障",
          items: [
            { text: "可观测性", link: "/ops/observability" },
            { text: "故障排查", link: "/ops/troubleshooting" }
          ]
        }
      ]
    },
    editLink: {
      pattern: `${repoUrl}/edit/main/docs/:path`,
      text: "在 GitHub 上编辑此页"
    },
    footer: {
      message: "文档面向公开使用场景，避免披露私有实现细节。",
      copyright: "Copyright © 2026 emby-gateway"
    },
    docFooter: {
      prev: "上一页",
      next: "下一页"
    },
    outline: {
      level: [2, 3],
      label: "本页导航"
    },
    socialLinks: [{ icon: "github", link: repoUrl }]
  }
};
