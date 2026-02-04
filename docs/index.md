---
layout: home

hero:
  name: "EMBY-GATEWAY"
  text: ""
  tagline: "一站式emby网关代理解决方案，帮助你快速搭建、稳定运行并高效排障。"
  actions:
    - theme: brand
      text: 功能总览
      link: /guide/features-overview
    - theme: alt
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 配置参考
      link: /reference/configuration

features:
  - title: 5-10 分钟上手
    details: 最小可用部署路径，优先跑通核心链路。
  - title: 配置可查
    details: 参数含义、默认值与推荐配置集中管理。
  - title: 运维可控
    details: 提供日志、监控与常见故障处理流程。
---

## 架构总览

```mermaid
flowchart LR
    U[用户/播放器] --> S[Emby Source 入口]
    S --> R[路由规则匹配]
    R --> M[路径映射]
    M --> P[资源池]
    P --> B1[主后端]
    P --> B2[备后端]
    B1 --> C[(对象存储/CDN/GDrive/本地)]
    B2 --> C

    A[管理后台] --> CFG[(配置数据库)]
    CFG --> R
    CFG --> P

    S --> L[(请求日志/统计)]
```

架构图源文件：`docs/assets/diagrams/01-arch-overview.mmd`

## 先看这三篇

- 先了解能做什么：`功能总览`
- 新部署用户先读：`快速开始`
- 需要实操配置：`一步步配置指南`
- 看不懂术语时：`术语速查`
