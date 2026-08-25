# 项目架构

Feiyue Emby Gateway 是 Emby 播放请求网关。它不保存媒体文件，核心职责是识别播放请求、匹配路由、生成临时直链，并尽可能让客户端直接访问存储或 CDN。

## 系统边界

系统分为两个平面：

- **控制面**：管理后台、Admin API、配置版本、许可证、安全策略和观测查询。
- **数据面**：Source 监听、Emby 请求代理、播放拦截、路径映射、后端选路和 302 响应。

![Feiyue Emby Gateway 架构图](/diagrams/architecture-overview.svg)

主要组件：

| 组件 | 职责 |
|---|---|
| `go-gateway` | Source 监听、路由、后端适配、管理 API、日志与任务调度 |
| WebUI | 配置网关并查看运行状态，不直接处理播放流量 |
| PostgreSQL | 保存关系化配置、请求日志、统计和安全事件；生产环境推荐 |
| Local Agent | 部署在存储侧，提供目录枚举和签名直链 |
| 存储后端 | S3、CDN、Google Drive、本地、123 网盘和 115 网盘等 |

## 播放请求链路

![播放请求时序图](/diagrams/playback-sequence-multi-routes-pools.svg)

一次可被重定向的播放请求按以下顺序处理：

1. 客户端请求进入某个启用的 Emby Source。
2. 网关从 Emby 请求中解析真实媒体路径。
3. 路由按 `priority` 升序匹配真实路径，命中第一条后停止。
4. 路由引用的路径映射集把 Emby 路径转换为后端 object key。
5. 网关先尝试资源池主后端，失败后再尝试备后端。
6. 后端适配器生成临时 URL，网关返回 `302 Location`。
7. 客户端随后直接访问目标 URL；这部分流量通常不再经过网关。

以下情况不会走标准 302 直链：

- 请求没有命中播放拦截条件，继续代理到上游 Emby。
- 已命中的路由无法生成直链，回退到原始 Emby 代理链路。
- 115 后端显式选择 `Relay` 模式，由网关中转响应内容。

> 302 日志只能记录网关发放跳转的事实。客户端跳转后的真实字节数和 Range 请求通常不可见。

## 路由与故障切换

当前资源池模型是一个主后端加一个可选备后端，不支持权重、多主轮询或多个备后端。

路由一旦命中，后续失败不会继续尝试下一条路由，而是在当前资源池完成主备尝试后回退到 Emby 代理。详细规则参见 [路由匹配规则](/guide/route-matching-rules) 和 [路由与故障切换](/reference/routing-and-failover)。

## 配置与热更新

- PostgreSQL 使用关系化配置和 revision 激活机制。
- SQLite 作为轻量兼容模式保存配置快照，不建议用于长期生产运行。
- 后端、资源池、路径映射、路由和安全策略保存后会热更新。
- Source 的新增、停用以及监听地址或端口变更也会动态调整监听器。
- 命令行或环境变量提供的管理端、数据库和许可证覆盖项优先于数据库配置。

## 可观测与安全

- `request_logs` 保存请求、状态、耗时、路由、重定向和媒体语义。
- `daily_stats` 保存聚合统计，清理明细日志时默认保留。
- `security_events` 独立保存 `deny` 和 `rate_limit` 事件。
- 敏感 Query 和 Header 会在结构化日志中脱敏，但仍应限制管理后台访问权限。

更多内容参见 [可观测性](/ops/observability)、[数据库维护](/ops/database-maintenance) 和 [安全功能](/guide/security)。
