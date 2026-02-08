// 类型定义
declare const process: {
  env: {
    GITHUB_REPOSITORY?: string;
    DOCS_BASE?: string;
    DOCS_SITE_URL?: string;
    CI?: string;
  };
};

const repository = process.env.GITHUB_REPOSITORY || "SingleJohn/emby-gateway-bin";
const repoUrl = `https://github.com/${repository}`;
const siteUrl = (process.env.DOCS_SITE_URL || "https://gateway-doc.henhendeaini.com").replace(/\/+$/, "");
const siteName = "Feiyue Emby Gateway 文档";
const siteDescription = "Emby 网关文档：多后端分流、主备切换、安全防护、日志统计与告警通知。";
const ogImage = `${siteUrl}/diagrams/hero-gateway-overview.svg`;
const websiteJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  description: siteDescription,
  url: siteUrl,
  inLanguage: "zh-CN",
  publisher: {
    "@type": "Organization",
    name: "emby-gateway"
  }
});
const defaultBase = repository.endsWith(".github.io")
  ? "/"
  : `/${repository.split("/")[1] || "emby-gateway-doc"}/`;

function toCanonicalUrl(relativePath: string) {
  const clean = relativePath.replace(/\\/g, "/");
  if (clean === "index.md") return `${siteUrl}/`;
  if (clean.endsWith("/index.md")) return `${siteUrl}/${clean.slice(0, -9)}/`;
  if (clean.endsWith(".md")) return `${siteUrl}/${clean.slice(0, -3)}`;
  return `${siteUrl}/${clean}`;
}

export default {
  lang: "zh-CN",
  base: process.env.DOCS_BASE || (process.env.CI ? defaultBase : "/"),
  title: siteName,
  description: siteDescription,
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: siteUrl
  },
  head: [
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
    ["link", { rel: "shortcut icon", href: "/favicon.svg" }],
    ["link", { rel: "apple-touch-icon", href: "/favicon.svg" }],
    ["meta", { name: "google-site-verification", content: "syCor37aAP06jJ1DTnTTwb4rbyVQy6CVbx9y4cL-wjY" }],
    ["meta", { name: "author", content: "emby-gateway" }],
    ["meta", { name: "robots", content: "index,follow,max-image-preview:large" }],
    ["meta", { name: "theme-color", content: "#0f7ae5" }],
    ["meta", { name: "keywords", content: "Emby,Emby Gateway,Feiyue Emby Gateway,媒体网关,多后端分流,高可用,故障切换,安全规则,STRM 生成,STRM 文件,S3,CDN,GDrive,Google Drive,123 网盘,本地存储,对象存储,路径映射,资源池" }],
    ["meta", { property: "og:site_name", content: siteName }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: siteName }],
    ["meta", { property: "og:description", content: siteDescription }],
    ["meta", { property: "og:image", content: ogImage }],
    ["meta", { property: "og:locale", content: "zh_CN" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: siteName }],
    ["meta", { name: "twitter:description", content: siteDescription }],
    ["meta", { name: "twitter:image", content: ogImage }],
    ["script", { type: "application/ld+json" }, websiteJsonLd]
  ],
  transformHead({ pageData }) {
    const canonical = toCanonicalUrl(pageData.relativePath);
    return [
      ["link", { rel: "canonical", href: canonical }],
      ["meta", { property: "og:url", content: canonical }]
    ];
  },
  themeConfig: {
    siteTitle: siteName,
    logo: "/favicon.svg",
    search: {
      provider: 'local'
    },
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
            { text: "页面截图", link: "/guide/ui-screenshot-plan" }
          ]
        },
        {
          text: "配置指南",
          items: [
            { text: "管理界面", link: "/guide/management-ui" },
            { text: "基础配置", link: "/guide/basic-configuration" },
            { text: "后端配置", link: "/guide/backend-configuration" },
            { text: "STRM 功能", link: "/guide/strm-guide" },
            { text: "路由匹配规则", link: "/guide/route-matching-rules" },
            { text: "路由规则和资源池", link: "/guide/routing-and-pool" },
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
    footer: {
      message: "",
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
