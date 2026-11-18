<script setup lang="ts">
import { withBase } from 'vitepress'

import FlowDiagram from '../FlowDiagram.vue'
import HeroShowcase from './HeroShowcase.vue'

const releasesUrl = 'https://github.com/SingleJohn/emby-gateway-bin/releases'

type Capability = {
  key: string
  eyebrow: string
  title: string
  desc: string
  points: string[]
  shot: string
  shotAlt: string
  link: string
  tone: string
}

const capabilities: Capability[] = [
  {
    key: 'routing',
    eyebrow: '播放分流与容灾',
    title: '每个播放请求，都按路径找到该去的存储',
    desc: '按媒体路径匹配路由规则，把 Emby 里的路径换成存储里的路径，再从资源池选出可用后端，返回 302 直链。',
    points: [
      '路由规则支持路径前缀和正则，按优先级依次匹配',
      '资源池一主一备，主后端取不到直链时自动改用备用',
      '保存前可以用「路由匹配测试」和「映射测试」先验证',
      '规则没命中或主备都失败时，请求原样交给 Emby 推流',
    ],
    shot: 'emby-sources',
    shotAlt: 'Emby 源页面与路由匹配测试',
    link: '/guide/emby-sources',
    tone: 'violet',
  },
  {
    key: 'storage',
    eyebrow: '存储统一接入',
    title: '对象存储、网盘和本地盘，放在同一张表里管',
    desc: '八类存储后端统一配置。新建向导按类型只问需要的字段，配好之后可以直接浏览文件、批量生成 STRM。',
    points: [
      'S3、阿里云 CDN、Google Drive、本地目录、Local Agent、123、115、HTTP Resolver',
      '对象浏览：直接看存储里的目录和文件，预览、复制直链',
      'STRM 任务：增量扫描存储，生成 .strm 文件给 Emby 入库',
      '123 网盘热门视频按需转码，带容量保护',
    ],
    shot: 'backends',
    shotAlt: '存储后端列表与详情',
    link: '/guide/backend-configuration',
    tone: 'teal',
  },
  {
    key: 'security',
    eyebrow: '安全防护',
    title: '拦得住异常请求，也查得到每一次处置',
    desc: '访问规则、自动防护和播放限制在网关层生效。拦截、封禁、锁定和告警投递都留有记录，可以随时回看和解除。',
    points: [
      '按 IP、User-Agent、路径、方法允许、拒绝或限流',
      '登录失败锁定、用户多 IP 临时封禁、并发播放限制',
      '五类告警规则，推送到企业微信、钉钉、Telegram、Bark、Server 酱',
      '告警记录里能看到每条通知送达了哪些渠道、失败原因是什么',
    ],
    shot: 'security-records',
    shotAlt: '防护记录页面',
    link: '/guide/security',
    tone: 'rose',
  },
  {
    key: 'observe',
    eyebrow: '播放与流量观测',
    title: '谁在看、走了哪条链路、慢在哪里，一眼看清',
    desc: '实时播放会话、请求日志、302 链路耗时、用户与媒体统计、访问来源分布。控制台把需要处理的事集中到一处。',
    points: [
      '实时播放：当前会话、客户端与设备、来源 IP、已播放时长',
      '流量分析：请求趋势、状态码分布、302 链路各阶段耗时',
      '用户与媒体：播放记录、使用统计、用户播放时长排行',
      '「需要关注」汇总授权、上游、配置和安全异常',
    ],
    shot: 'obs-traffic',
    shotAlt: '流量分析页面',
    link: '/ops/observability',
    tone: 'sky',
  },
]

const backends = [
  { name: 'S3 兼容存储', desc: 'AWS S3、MinIO 等，签名直链', tone: 'amber' },
  { name: '阿里云 CDN', desc: '鉴权 URL、单请求限速、123 回源鉴权', tone: 'sky' },
  { name: 'Google Drive', desc: '可配合 Worker 中转与签名', tone: 'emerald' },
  { name: '本地目录', desc: '网关所在机器上的媒体目录', tone: 'slate' },
  { name: 'Local Agent', desc: '在存放媒体的机器上运行的轻量服务', tone: 'blue' },
  { name: '123 网盘', desc: '开放平台直链，热门视频按需转码', tone: 'violet' },
  { name: '115 网盘', desc: '开放平台、Cookie、附盘轮询', tone: 'rose' },
  { name: 'HTTP Resolver', desc: '对接外部解析服务，兼容 hls2strm', tone: 'teal' },
]

const compose = `services:
  emby-gateway:
    image: renzhengfei/emby-gateway:latest
    restart: unless-stopped
    network_mode: host
    volumes:
      - ./gateway-data:/app/data
      - ./gateway-cache:/app/cache
    environment:
      TZ: Asia/Shanghai
      GATEWAY_ADMIN_PORT: 19999`
</script>

<template>
  <div class="home">
    <!-- 首屏 -->
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Emby 网关 · 302 直链分流</span>
        <h1>
          Emby 播放，<br />
          <span class="grad">直达存储</span>
        </h1>
        <p class="lead">
          飞跃 Emby 网关部署在 Emby 前面，把播放请求按路径分流到对象存储、网盘或本地磁盘，用
          302 直链交给播放器。视频流量不再经过服务器中转，主后端取不到直链时自动改用备用。
        </p>
        <div class="actions">
          <a class="btn primary" :href="withBase('/guide/quick-start')">快速开始</a>
          <a class="btn" :href="releasesUrl" target="_blank" rel="noopener">下载</a>
          <a class="btn ghost" :href="withBase('/guide/introduction')">它是怎么工作的 →</a>
        </div>
        <ul class="facts">
          <li>Docker / Linux / Windows / macOS</li>
          <li>SQLite 或 PostgreSQL</li>
          <li>配置改完即时生效</li>
        </ul>
      </div>
      <div class="hero-visual">
        <HeroShowcase name="overview" alt="管理界面控制台" />
      </div>
    </section>

    <!-- 工作原理 -->
    <section class="block">
      <header class="block-head">
        <span class="eyebrow">工作原理</span>
        <h2>播放器只拿到一个直链，剩下的交给存储</h2>
        <p>网关只负责决定「去哪个存储拿」，视频数据由播放器直接从存储下载。元数据、海报等其他请求照常代理到 Emby。</p>
      </header>
      <FlowDiagram />
    </section>

    <!-- 四大能力 -->
    <section
      v-for="(c, i) in capabilities"
      :key="c.key"
      class="block cap"
      :class="{ flip: i % 2 === 1 }"
    >
      <div class="cap-copy">
        <span class="eyebrow" :class="`t-${c.tone}`">{{ c.eyebrow }}</span>
        <h2>{{ c.title }}</h2>
        <p>{{ c.desc }}</p>
        <ul class="points">
          <li v-for="p in c.points" :key="p">{{ p }}</li>
        </ul>
        <a class="more" :href="withBase(c.link)">查看文档 →</a>
      </div>
      <figure class="cap-shot">
        <img class="light" :src="withBase(`/shots/${c.shot}.light.webp`)" :alt="c.shotAlt" loading="lazy" decoding="async" />
        <img class="dark" :src="withBase(`/shots/${c.shot}.dark.webp`)" :alt="c.shotAlt" loading="lazy" decoding="async" />
      </figure>
    </section>

    <!-- 支持的后端 -->
    <section class="block">
      <header class="block-head">
        <span class="eyebrow">存储后端</span>
        <h2>八类后端，一套配置方式</h2>
        <p>同一个网关可以同时接入多种存储，按媒体路径分流，也可以互为主备。</p>
      </header>
      <div class="backends">
        <a
          v-for="b in backends"
          :key="b.name"
          class="backend"
          :href="withBase('/guide/backend-configuration')"
        >
          <span class="dot" :class="`g-${b.tone}`" aria-hidden="true" />
          <b>{{ b.name }}</b>
          <small>{{ b.desc }}</small>
        </a>
      </div>
    </section>

    <!-- 部署 -->
    <section class="block deploy">
      <div class="deploy-copy">
        <span class="eyebrow">部署</span>
        <h2>一个容器，几分钟跑起来</h2>
        <ol class="steps">
          <li><b>写好 compose 文件</b>默认使用内置 SQLite，数据放在 <code>gateway-data</code> 目录。</li>
          <li><b>启动容器</b>执行 <code>docker compose up -d</code>。</li>
          <li><b>打开管理界面</b>访问 <code>http://服务器地址:19999</code>，先设置管理密码，再添加 Emby 源。</li>
        </ol>
        <a class="btn primary" :href="withBase('/guide/quick-start')">按步骤部署</a>
      </div>
      <div class="code">
        <div class="code-head"><span>docker-compose.yml</span></div>
        <pre><code>{{ compose }}</code></pre>
      </div>
    </section>

    <!-- 收尾 -->
    <section class="cta">
      <h2>准备好了就开始吧</h2>
      <p>从部署到第一条直链播放，跟着快速开始一步步来。</p>
      <div class="actions center">
        <a class="btn primary" :href="withBase('/guide/quick-start')">快速开始</a>
        <a class="btn" :href="releasesUrl" target="_blank" rel="noopener">下载最新版本</a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  --max: 1200px;
  padding: 0 24px 96px;
}

.home > section {
  max-width: var(--max);
  margin: 0 auto;
}

.eyebrow {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--vp-c-brand-1);
}

.t-violet { color: #7c3aed; }
.t-teal { color: #0d9488; }
.t-rose { color: #e11d48; }
.t-sky { color: #0284c7; }
html.dark .t-violet { color: #c4b5fd; }
html.dark .t-teal { color: #5eead4; }
html.dark .t-rose { color: #fda4af; }
html.dark .t-sky { color: #7dd3fc; }

h1,
h2 {
  margin: 0;
  color: var(--vp-c-text-1);
  border: none;
  padding: 0;
}

/* ── 首屏 ── */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: center;
  gap: 56px;
  padding: 72px 0 40px;
}

.hero h1 {
  margin-top: 14px;
  font-size: clamp(40px, 5.2vw, 60px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.03em;
}

.grad {
  background: linear-gradient(120deg, #2563eb 10%, #0ea5e9 60%, #7c3aed 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

html.dark .grad {
  background-image: linear-gradient(120deg, #60a5fa 10%, #38bdf8 60%, #a78bfa 100%);
}

.lead {
  margin: 20px 0 0;
  max-width: 520px;
  font-size: 17px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
}

.actions.center {
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  height: 42px;
  padding: 0 20px;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  text-decoration: none;
  background: var(--eg-surface);
  border: 1px solid var(--eg-border-strong);
  border-radius: 999px;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.btn:hover {
  border-color: var(--eg-primary);
  transform: translateY(-1px);
}

.btn.primary {
  color: #fff;
  background: var(--eg-primary);
  border-color: transparent;
  box-shadow: 0 10px 24px -10px rgba(37, 99, 235, 0.7);
}

.btn.primary:hover {
  background: #1d4ed8;
}

.btn.ghost {
  padding: 0 6px;
  border-color: transparent;
  background: transparent;
  color: var(--vp-c-brand-1);
}

.btn.ghost:hover {
  transform: none;
  text-decoration: underline;
}

.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.facts li {
  position: relative;
  padding-left: 14px;
}

.facts li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 6px;
  height: 6px;
  margin-top: -3px;
  border-radius: 50%;
  background: var(--eg-sky);
}

/* ── 通用区块 ── */
.block {
  padding: 72px 0 0;
}

.block-head {
  max-width: 720px;
}

.block-head h2,
.cap-copy h2,
.deploy-copy h2 {
  margin-top: 10px;
  font-size: clamp(26px, 3vw, 34px);
  font-weight: 750;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.block-head p,
.cap-copy > p {
  margin: 14px 0 0;
  font-size: 16px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}

/* ── 能力 ── */
.cap {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  align-items: center;
  gap: 56px;
}

.cap.flip .cap-copy {
  order: 2;
}

.points {
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.points li {
  position: relative;
  padding-left: 26px;
  font-size: 15px;
  line-height: 1.65;
  color: var(--vp-c-text-1);
}

.points li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 8.2l2.2 2.2 4.8-4.9' fill='none' stroke='%23fff' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
      center / 16px no-repeat,
    var(--eg-grad-blue);
}

.more {
  display: inline-block;
  margin-top: 22px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.more:hover {
  text-decoration: underline;
}

.cap-shot {
  margin: 0;
  padding: 10px;
  border-radius: 20px;
  background: var(--eg-surface);
  border: 1px solid var(--eg-border);
  box-shadow: var(--eg-shadow-shot);
}

.cap-shot img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: top left;
  border-radius: 12px;
  background: var(--eg-surface-2);
}

.cap-shot .dark {
  display: none;
}

html.dark .cap-shot .light {
  display: none;
}

html.dark .cap-shot .dark {
  display: block;
}

/* ── 后端 ── */
.backends {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 28px;
}

.backend {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 18px;
  text-decoration: none;
  background: var(--eg-surface);
  border: 1px solid var(--eg-border);
  border-radius: var(--eg-radius-card);
  box-shadow: var(--eg-shadow-flat);
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.backend:hover {
  border-color: color-mix(in srgb, var(--eg-primary) 40%, var(--eg-border));
  box-shadow: var(--eg-shadow-raised);
  transform: translateY(-2px);
}

.backend b {
  font-size: 15px;
  color: var(--vp-c-text-1);
}

.backend small {
  font-size: 13px;
  line-height: 1.55;
  color: var(--vp-c-text-3);
}

.dot {
  width: 28px;
  height: 28px;
  margin-bottom: 8px;
  border-radius: 9px;
}

.g-amber { background: var(--eg-grad-amber); }
.g-sky { background: var(--eg-grad-sky); }
.g-emerald { background: var(--eg-grad-emerald); }
.g-slate { background: var(--eg-grad-slate); }
.g-blue { background: var(--eg-grad-blue); }
.g-violet { background: var(--eg-grad-violet); }
.g-rose { background: var(--eg-grad-rose); }
.g-teal { background: var(--eg-grad-teal); }

/* ── 部署 ── */
.deploy {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: center;
  gap: 56px;
}

.deploy .steps {
  margin: 20px 0 28px;
  padding: 0;
  list-style: none;
  counter-reset: s;
  display: grid;
  gap: 14px;
}

.deploy .steps li {
  position: relative;
  padding-left: 40px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  counter-increment: s;
}

.deploy .steps li::before {
  content: counter(s);
  position: absolute;
  left: 0;
  top: 0;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-radius: 50%;
}

.deploy .steps b {
  display: block;
  color: var(--vp-c-text-1);
}

.deploy code,
.code pre {
  font-family: var(--vp-font-family-mono);
}

.deploy-copy code {
  padding: 1px 6px;
  font-size: 13px;
  background: var(--eg-surface-2);
  border-radius: 6px;
}

.code {
  overflow: hidden;
  border-radius: var(--eg-radius-card);
  background: #0f172a;
  border: 1px solid #1e293b;
  box-shadow: var(--eg-shadow-shot);
}

.code-head {
  padding: 10px 16px;
  font-size: 12px;
  color: #94a3b8;
  border-bottom: 1px solid #1e293b;
}

.code pre {
  margin: 0;
  padding: 18px 20px;
  overflow-x: auto;
  font-size: 13.5px;
  line-height: 1.7;
  color: #e2e8f0;
}

/* ── 收尾 ── */
.cta {
  margin-top: 96px !important;
  padding: 56px 24px;
  text-align: center;
  border-radius: 24px;
  background:
    radial-gradient(600px 260px at 15% 0%, rgba(56, 189, 248, 0.22), transparent 70%),
    radial-gradient(600px 260px at 85% 100%, rgba(167, 139, 250, 0.2), transparent 70%),
    var(--eg-surface);
  border: 1px solid var(--eg-border);
}

.cta h2 {
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 750;
}

.cta p {
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
}

/* ── 响应式 ── */
@media (max-width: 960px) {
  .hero,
  .cap,
  .deploy {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .hero {
    padding-top: 40px;
  }

  .cap.flip .cap-copy {
    order: 0;
  }

  .backends {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .block {
    padding-top: 56px;
  }
}

@media (max-width: 520px) {
  .home {
    padding: 0 16px 64px;
  }

  .backends {
    grid-template-columns: 1fr;
  }

  .lead {
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn,
  .backend {
    transition: none;
  }
}
</style>
