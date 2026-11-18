import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { defineConfig, type DefaultTheme } from "vitepress";
import { tokenize } from "./theme/tokenize";

const repository = process.env.GITHUB_REPOSITORY || "SingleJohn/emby-gateway-bin";
const repoUrl = `https://github.com/${repository}`;
const releasesUrl = `${repoUrl}/releases`;
const siteUrl = (process.env.DOCS_SITE_URL || "https://gateway-doc.henhendeaini.com").replace(/\/+$/, "");
const siteName = "Feiyue Emby Gateway";
const siteTitle = "Feiyue Emby Gateway 文档";
const siteDescription =
  "飞跃 Emby 网关：把 Emby 播放请求 302 分流到 S3、CDN、网盘与本地存储，主备自动切换，内置安全防护、告警通知与完整的播放观测。";
const ogImage = `${siteUrl}/og-cover.png`;

const defaultBase = repository.endsWith(".github.io")
  ? "/"
  : `/${repository.split("/")[1] || "emby-gateway-doc"}/`;

/**
 * 已下线页面 → 新地址。
 * GitHub Pages 没有服务端重定向，构建结束时为每个旧地址写一个跳转页，
 * 保住已被收录和被用户收藏的链接。
 */
const redirects: Record<string, string> = {
  "guide/features-overview": "/guide/introduction",
  "guide/architecture": "/guide/introduction#工作原理",
  "guide/basic-configuration": "/guide/quick-start#完成第一条播放链路",
  "guide/glossary": "/guide/concepts",
  "guide/route-matching-rules": "/guide/emby-sources#路由规则",
  "guide/ui-screenshot-plan": "/guide/management-ui",
  "reference/routing-and-failover": "/guide/routing-and-pool",
  "assets/images/README": "/"
};

function toCanonicalUrl(relativePath: string) {
  const clean = relativePath.replace(/\\/g, "/");
  if (clean === "index.md") return `${siteUrl}/`;
  if (clean.endsWith("/index.md")) return `${siteUrl}/${clean.slice(0, -9)}/`;
  if (clean.endsWith(".md")) return `${siteUrl}/${clean.slice(0, -3)}`;
  return `${siteUrl}/${clean}`;
}

function redirectPage(base: string, to: string) {
  const target = `${base.replace(/\/$/, "")}${to}`;
  const canonical = `${siteUrl}${to.split("#")[0]}`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>页面已迁移 | ${siteTitle}</title>
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="${canonical}">
<meta http-equiv="refresh" content="0; url=${encodeURI(target)}">
<script>location.replace(${JSON.stringify(target)} + location.search)</script>
</head>
<body><p>本页已迁移至 <a href="${encodeURI(target)}">${target}</a>。</p></body>
</html>
`;
}

const sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "开始",
    items: [
      { text: "介绍与工作原理", link: "/guide/introduction" },
      { text: "快速开始", link: "/guide/quick-start" },
      { text: "部署与升级", link: "/guide/deployment" },
      { text: "管理界面基础", link: "/guide/management-ui" },
      { text: "核心概念", link: "/guide/concepts" }
    ]
  },
  {
    text: "接入与路由",
    items: [
      { text: "Emby 源与路由规则", link: "/guide/emby-sources" },
      { text: "路径映射", link: "/guide/path-mapping" },
      { text: "资源池与故障切换", link: "/guide/routing-and-pool" }
    ]
  },
  {
    text: "存储后端",
    items: [
      { text: "后端总览", link: "/guide/backend-configuration" },
      { text: "S3 与阿里云 CDN", link: "/guide/backend-s3-cdn" },
      { text: "Google Drive 与 Worker", link: "/guide/gdrive-worker" },
      { text: "本地目录与 Local Agent", link: "/guide/backend-local" },
      { text: "123 网盘", link: "/guide/backend-123" },
      { text: "115 网盘", link: "/guide/backend-115" },
      { text: "HTTP Resolver", link: "/guide/backend-http-resolver" }
    ]
  },
  {
    text: "媒体库工具",
    items: [
      { text: "STRM 任务", link: "/guide/strm-guide" },
      { text: "对象浏览", link: "/guide/file-browser" },
      { text: "123 转码", link: "/guide/pan123-transcode" }
    ]
  },
  {
    text: "安全",
    items: [
      { text: "防护策略", link: "/guide/security" },
      { text: "防护记录", link: "/guide/security-records" },
      { text: "告警规则与告警记录", link: "/guide/security-alerts" },
      { text: "通知渠道", link: "/guide/notification" }
    ]
  },
  {
    text: "监控",
    items: [
      { text: "控制台与关注中心", link: "/guide/dashboard" },
      { text: "播放与流量监控", link: "/ops/observability" },
      { text: "系统日志", link: "/guide/system-logs" }
    ]
  },
  {
    text: "系统",
    items: [
      { text: "系统设置", link: "/guide/system-settings" },
      { text: "数据库维护", link: "/ops/database-maintenance" },
      { text: "授权", link: "/guide/license" }
    ]
  },
  {
    text: "运维与参考",
    items: [
      { text: "故障排查", link: "/ops/troubleshooting" },
      { text: "启动参数与环境变量", link: "/reference/cli-env" },
      { text: "更新日志", link: "/changelog" }
    ]
  }
];

export default defineConfig({
  lang: "zh-CN",
  base: process.env.DOCS_BASE || (process.env.CI ? defaultBase : "/"),
  title: siteTitle,
  titleTemplate: `:title | ${siteName}`,
  description: siteDescription,
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ["**/README.md"],
  sitemap: {
    hostname: siteUrl
  },
  head: [
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
    ["link", { rel: "apple-touch-icon", href: "/apple-touch-icon.png" }],
    ["meta", { name: "google-site-verification", content: "syCor37aAP06jJ1DTnTTwb4rbyVQy6CVbx9y4cL-wjY" }],
    ["meta", { name: "author", content: "Feiyue Emby Gateway" }],
    ["meta", { name: "robots", content: "index,follow,max-image-preview:large" }],
    ["meta", { name: "theme-color", content: "#2563eb" }],
    ["meta", { name: "keywords", content: "Emby,Emby 网关,Emby Gateway,Feiyue Emby Gateway,飞跃 Emby 网关,302 直链,多后端分流,主备切换,STRM,S3,阿里云 CDN,Google Drive,123 网盘,115 网盘,Local Agent,Emby 安全,并发播放限制" }],
    ["meta", { property: "og:site_name", content: siteName }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:image", content: ogImage }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { property: "og:locale", content: "zh_CN" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:image", content: ogImage }],
    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: siteName,
        alternateName: "飞跃 Emby 网关",
        description: siteDescription,
        url: siteUrl,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Linux, Windows, macOS, Docker",
        inLanguage: "zh-CN"
      })
    ]
  ],
  transformHead({ pageData }) {
    const canonical = toCanonicalUrl(pageData.relativePath);
    const title = pageData.frontmatter.title || pageData.title || siteTitle;
    const description = pageData.frontmatter.description || pageData.description || siteDescription;
    return [
      ["link", { rel: "canonical", href: canonical }],
      ["meta", { property: "og:url", content: canonical }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { name: "twitter:title", content: title }],
      ["meta", { name: "twitter:description", content: description }]
    ];
  },
  async buildEnd(config) {
    await Promise.all(
      Object.entries(redirects).map(async ([from, to]) => {
        const file = join(config.outDir, `${from}.html`);
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, redirectPage(config.site.base, to), "utf8");
      })
    );
  },
  themeConfig: {
    siteTitle: "Feiyue Emby Gateway",
    logo: "/favicon.svg",
    search: {
      provider: "local",
      options: {
        miniSearch: {
          // 构建期索引用；浏览器端的同名函数在 theme/index.ts 里补上
          options: { tokenize },
          searchOptions: { combineWith: "AND", fuzzy: 0.15, prefix: true }
        },
        translations: {
          button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
          modal: {
            displayDetails: "显示详细列表",
            resetButtonTitle: "清除查询",
            backButtonTitle: "关闭搜索",
            noResultsText: "没有找到相关结果",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭"
            }
          }
        }
      }
    },
    nav: [
      { text: "首页", link: "/" },
      { text: "文档", link: "/guide/introduction", activeMatch: "^/(guide|ops|reference)/" },
      { text: "更新日志", link: "/changelog" },
      { text: "下载", link: releasesUrl }
    ],
    sidebar: {
      "/guide/": sidebar,
      "/ops/": sidebar,
      "/reference/": sidebar,
      "/changelog": sidebar
    },
    footer: {
      message: "Feiyue Emby Gateway · 飞跃 Emby 网关",
      copyright: `Copyright © ${new Date().getFullYear()} Feiyue Emby Gateway`
    },
    docFooter: {
      prev: "上一页",
      next: "下一页"
    },
    outline: {
      level: [2, 3],
      label: "本页目录"
    },
    lastUpdated: {
      text: "最后更新"
    },
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "目录",
    darkModeSwitchLabel: "外观",
    lightModeSwitchTitle: "切换到亮色",
    darkModeSwitchTitle: "切换到暗色",
    notFound: {
      title: "页面不存在",
      quote: "这个地址可能已经迁移。可以从文档首页或搜索找到你要的内容。",
      linkText: "返回首页"
    },
    socialLinks: [{ icon: "github", link: repoUrl }]
  }
});
