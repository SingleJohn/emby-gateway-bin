// 类型定义
declare const process: {
  env: {
    GITHUB_REPOSITORY?: string;
    DOCS_BASE?: string;
    CI?: string;
  };
};

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
      { text: "首页", link: "/" },
      { text: "功能总览", link: "/guide/features-overview" },
      { text: "快速开始", link: "/guide/quick-start" },
      { text: "部署指南", link: "/guide/deployment" },
      { text: "故障排查", link: "/ops/troubleshooting" }
    ],
    sidebar: {
      "/guide/": [
        {
          text: "入门指南",
          items: [
            { text: "功能总览", link: "/guide/features-overview" },
            { text: "项目架构", link: "/guide/architecture" },
            { text: "快速开始", link: "/guide/quick-start" },
            { text: "部署指南", link: "/guide/deployment" },
            { text: "系统页面截图规划", link: "/guide/ui-screenshot-plan" }
          ]
        },
        {
          text: "配置指南",
          items: [
            { text: "管理界面使用", link: "/guide/management-ui" },
            { text: "后端配置", link: "/guide/backend-configuration" },
            { text: "路由规则和资源池", link: "/guide/routing-and-pool" },
            { text: "基础配置", link: "/guide/basic-configuration" },
            { text: "高级配置", link: "/guide/advanced-configuration" }
          ]
        },
        {
          text: "安全与监控",
          items: [
            { text: "安全功能", link: "/guide/security" },
            { text: "安全告警", link: "/guide/security-alerts" },
            { text: "通知系统", link: "/guide/notification" }
          ]
        },
        {
          text: "其他功能",
          items: [
            { text: "GDrive Worker", link: "/guide/gdrive-worker" },
            { text: "激活与许可证", link: "/guide/license" }
          ]
        }
      ],
      "/reference/": [
        {
          text: "参考文档",
          items: [
            { text: "路由与故障切换", link: "/reference/routing-and-failover" },
            { text: "术语速查", link: "/guide/glossary" }
          ]
        }
      ],
      "/ops/": [
        {
          text: "故障排查",
          items: [
            { text: "排障指南", link: "/ops/troubleshooting" },
            { text: "可观测性", link: "/ops/observability" }
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
