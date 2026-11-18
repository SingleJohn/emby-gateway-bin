---
title: 系统设置
description: 管理密码与只读密码、管理端口和路径前缀、数据保留天数、本地缓存、IP 归属地查询和 GDrive Worker 等全局设置。
---

# 系统设置

系统设置里是对整个网关生效的设置：管理界面怎么访问，观测数据保留多久，本地缓存，IP 归属地查询，以及 GDrive Worker 的对接参数。

位置：<span class="ui-path">系统 › 系统设置</span>

<Shot name="system-settings" alt="系统设置：左侧分区导航与全局设置表单" />

页面左侧是分区导航，点击可以跳到对应分区。改完后保存，会提示「系统设置已保存，立即生效」（个别例外见下文）。只读账号可以查看，但所有输入框都不可编辑。保存方式（改动摘要、离开提醒、版本冲突）见 [管理界面基础](/guide/management-ui)。

## 全局设置

### 管理界面访问

| 字段 | 配置项 | 说明 |
|---|---|---|
| Admin Host | `admin.host` | 管理界面监听地址，默认 `0.0.0.0` |
| Admin Port | `admin.port` | 管理界面端口，默认 `18888` |
| Admin Password（留空禁用鉴权） | `admin.password` | 管理员密码，拥有全部权限 |
| Viewer Password（合作方只读） | `admin.viewer_password` | 只读账号的密码，必须先设置管理员密码才能填写 |
| 控制台路径前缀 | `admin.path_prefix` | 给管理界面加一段访问路径，例如填 `asdfg` |

::: danger 第一件事：设置管理员密码
「Admin Password」留空时，管理界面**不需要登录**，任何能访问这个端口的人都能修改配置。部署完成后请立即设置密码。
:::

几点注意：

- **Admin Host 和 Admin Port 改完要重启网关才会生效**，因为它们只在启动时读取。如果启动时用 `-admin-host`、`-admin-port` 参数或 `GATEWAY_ADMIN_HOST`、`GATEWAY_ADMIN_PORT` 环境变量指定了值，以启动参数为准，界面上的修改会在下次启动时被覆盖。参见 [启动参数与环境变量](/reference/cli-env)。
- **管理员和只读账号用同一个登录框**，网关根据输入的密码判断身份。登录有效期为 24 小时。
- **控制台路径前缀**保存后立即生效，只能填一段路径，不能包含 `/`。设置之后只能通过 `http://地址:端口/<前缀>/` 访问管理界面，其他路径一律返回 404，可以减少被扫描到的机会。改之前请先记住新地址。

### 观测与数据保留

| 字段 | 配置项 | 默认值 | 说明 |
|---|---|---|---|
| 请求日志保留天数 | `observability.request_log_retention_days` | 30 | 流量分析中的请求明细保留多久 |
| 统计保留天数 | `observability.stat_retention_days` | 180 | 每日统计、播放记录、媒体访问统计保留多久 |
| DB 批量写入条数 | `observability.db_batch_size` | 200 | 请求日志攒多少条批量写一次，最大 1000 |
| DB 刷新间隔(ms) | `observability.db_flush_interval_ms` | 1000 | 最长多久写一次，最小 200 |
| 用户识别调试日志 | `observability.debug_user_resolution` | 关闭 | 在系统日志里输出用户识别过程，排查「请求没有对应到用户」时临时打开 |
| 用户识别 IP 回退 | `observability.user_resolution_ip_fallback` | 关闭 | 按播放会话、设备和令牌都认不出是哪个用户时，再用同一 IP 最近出现过的用户兜底。多人共用一个出口 IP 时可能认错 |

保存后网关会立即按新的保留天数清理一次过期数据。安全事件和告警记录固定保留 90 天，不受这里影响。详见 [数据库维护](/ops/database-maintenance)。

## 缓存

网关可以把 Emby 的部分响应缓存到本地磁盘，减少对上游 Emby 的重复请求，让网页端和海报加载得更快。这里缓存的是**经过网关代理的 Emby 内容**，和视频直链无关。

| 字段 | 配置项 | 默认值 | 说明 |
|---|---|---|---|
| 全局开关 | `cache.enabled` | 开启 | 关闭后不再缓存 |
| 存储目录 | `cache.dir` | `cache` | 相对网关工作目录，Docker 中是 `/app/cache` |
| 尊重上游缓存头 | `cache.respect_upstream` | 开启 | 上游返回 `no-store`、`private` 时不缓存；带 `max-age` 时按它设置有效期 |
| 缓存图片资源 | `cache.include_images` | 开启 | 缓存海报、背景图等媒体图片 |
| 默认有效期 (TTL) | `cache.default_ttl_seconds` | 2 小时 | 上游没有指定有效期时使用 |
| 最大磁盘占用 | `cache.max_size_bytes` | 5 GB | 超过后自动清理较旧的缓存 |
| 路径前缀白名单 | `cache.include_prefixes` | `/web/` | 只缓存这些路径开头的请求 |

`/web/` 是 Emby 官方网页客户端的静态资源路径，建议保留。分区顶部会显示缓存状态、最大占用和默认 TTL，也可以点「清空缓存」手动清空。

::: tip Docker 部署记得挂载缓存目录
缓存目录不在 `/app/data` 里。不挂载也能用，只是容器重建后缓存会清空。快速开始里的 compose 示例已经把它挂载到了 `./gateway-cache`。
:::

## IP 归属地查询

分区标题为「IP 归属地查询配置」。访问来源、流量分析等页面里的 IP 归属地、运营商、IP 类型，都是网关调用 ip9.com.cn 的接口查询得到的。

| 字段 | 配置项 | 默认值 | 说明 |
|---|---|---|---|
| IP 查询使用付费接口 | `observability.ip_lookup_vip_enabled` | 关闭 | 打开后改用付费接口，需要同时填 Token |
| 付费接口 Token | `observability.ip_lookup_vip_token` | 空 | 从 ip9.com.cn 获取 |
| 缓存有效期(天) | `observability.ip_lookup_cache_days` | 30 | 查过的 IP 多久之后重新查询 |

点「清空缓存」会清掉所有已查到的归属地，之后相关页面会在下次查询时重新解析。归属地是在后台陆续查询的，「访问来源」里的「待解析 IP」就是还没查到结果的 IP 数量。

## 数据库维护

只有管理员能看到这个分区，用来查看请求日志的占用，并手动清理过期数据。它只支持 PostgreSQL。用法和注意事项见 [数据库维护](/ops/database-maintenance)。

## GDrive Worker

使用 Google Drive 后端并通过 Worker 中转播放时，在这里填写 Worker 的对接参数：

| 字段 | 配置项 | 说明 |
|---|---|---|
| Worker Base URL | `gdrive_worker.base_url` | Worker 对外的播放地址，例如 `https://worker.example.com/stream` |
| 签名密钥 (Sign Key) | `gdrive_worker.sign_key` | 网关给播放链接签名、Worker 验签用，两边必须一致 |
| 同步令牌 (Sync Token) | `gdrive_worker.sync_token` | Worker 向网关拉取配置时使用的 Bearer Token |

Worker 怎么部署、怎么验证，见 [Google Drive 与 Worker](/guide/gdrive-worker)。

## 相关文档

- [管理界面基础](/guide/management-ui)
- [部署与升级](/guide/deployment)
- [数据库维护](/ops/database-maintenance)
