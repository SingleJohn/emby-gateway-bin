---
layout: home

hero:
  name: "EMBY-GATEWAY"
  text: "Emby 网关"
  tagline: "稳定可靠、聚焦路由分流、高可用、安全防护与告警通知，让播放链路更稳"
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

features:
  - title: 多后端智能分流
    details: 基于路径规则将请求路由到 S3/CDN/GDrive/本地等后端。
  - title: 主备切换与高可用
    details: 通过资源池主备策略自动故障切换，降低播放失败率。
  - title: 安全规则防护
    details: 支持按 IP、路径、User-Agent 等维度做访问控制与限流。
  - title: 安全告警与通知
    details: 异常访问命中规则后，支持通过企业微信、钉钉、Telegram、Bark、Server酱通知。
  - title: 可观测与排障
    details: 提供请求日志、统计与告警关联信息，便于快速定位问题。
  - title: 管理端集中配置
    details: 在统一后台完成来源、后端、路由、缓存、安全与告警配置。
---

## 适用场景

- 多emby部署，统一出口、快速搭建稳定播放链路
- 多后端混合存储，需要统一路由与主备容灾
- 需要降低服务器压力，实现302跳转
- 对账号共享、异常请求、失败率波动有安全监控需求
- 希望通过可观测数据和告警通知提升运维效率



