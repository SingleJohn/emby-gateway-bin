---
layout: home
title: Feiyue Emby Gateway 文档 | Emby 网关分流与高可用
description: Feiyue Emby Gateway 官方文档，覆盖多后端分流、主备切换、STRM、安全、播放并发、观测和数据库维护。

hero:
  name: "Feiyue Emby Gateway"
  text: "飞跃 emby 网关"
  tagline: "302 智能分流、多后端主备、安全防护、播放并发与完整观测。"
  image:
    src: /diagrams/hero-gateway-overview.svg
    alt: EMBY-GATEWAY 架构图
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 功能总览
      link: /guide/features-overview
    - theme: alt
      text: 故障排查
      link: /ops/troubleshooting
    - theme: brand
      text: 下载
      link: https://github.com/SingleJohn/emby-gateway-bin/releases

features:
  - title: 智能分流与路径映射
    details: 按路径前缀精准匹配路由，自动映射存储路径，适配多套媒体目录结构。
  - title: 资源池主备自动切换
    details: 主后端优先，异常时自动切换到备后端，降低播放中断和回源失败概率。
  - title: 多后端统一接入
    details: 支持 S3、CDN、GDrive、本地、123 与 115 系列后端，统一管理直链和 Relay。
  - title: 安全引擎与访问控制
    details: 基于 IP、路径、User-Agent、方法等条件实现允许、拒绝与限流策略。
  - title: 五页观测中心
    details: 覆盖实时会话、流量、媒体与用户、访问来源以及安全事件和控制台日志。
  - title: 后台集中配置管理
    details: 管理来源、后端、路由、STRM、安全、并发限制、通知、数据库维护与许可证。
---

<ImageCompare />

## 适用场景

- 多 emby 部署，统一出口、快速搭建稳定播放链路
- 多后端混合存储，需要统一路由与固定一主一备容灾
- 需要降低服务器压力，实现 302 跳转
- 对账号共享、并发播放、登录失败和异常请求有安全监控需求
- 希望通过可观测数据和告警通知提升运维效率

## 功能介绍

<div class="home-panels">
  <article class="home-panel">
    <h3>1) 播放链路更稳定</h3>
    <p>通过路由规则 + 资源池主备机制，优先命中可用后端，异常自动切换，减少播放失败。</p>
  </article>
  <article class="home-panel">
    <h3>2) 存储策略更灵活</h3>
    <p>同一套网关同时接入对象存储、网盘和本地盘，支持按媒体路径做精细化分流。</p>
  </article>
  <article class="home-panel">
    <h3>3) 运营安全更可控</h3>
    <p>安全规则、防刷限流、日志统计与告警通知形成闭环，便于快速定位和响应异常。</p>
  </article>
</div>
