---
title: Google Drive 与 Worker
description: 配置 Google Drive 存储后端，并按需部署 GDrive Worker，把 Google Drive 的播放流量从网关转移出去。
---

# Google Drive 与 Worker

这页讲怎么把 Google Drive 接成存储后端（类型 `gdrive`），以及什么时候、怎样部署 GDrive Worker 来分担播放流量。

## 两种播放方式

| | 默认方式 | Worker 方式 |
|---|---|---|
| 播放器拿到的地址 | 网关自己的 `/stream/gdrive/<令牌>` | Worker 的 `/stream/gdrive/<令牌>` |
| 谁去 Google Drive 拉数据 | 网关 | Worker |
| 视频流量经过哪里 | 网关所在服务器 | Worker（例如 Cloudflare Workers） |
| 需要额外部署 | 不需要 | 需要部署 Worker 脚本 |

两种方式下播放器都拿到一个 302 跳转，区别只在于跳到哪里、由谁回源。默认方式先用起来最简单；播放量上来、网关带宽吃紧时再换成 Worker。

::: tip
Google Drive 文件不会直接 302 给播放器，因为大文件直链会被 Google 的病毒扫描页拦截。所以默认方式由网关中转，Worker 方式由 Worker 中转。
:::

## 配置 Google Drive 后端

在 <span class="ui-path">接入与路由 › 存储后端</span> 新建后端，类型选「Google Drive」。

### OAuth 凭证

| 界面字段 | 配置字段 | 说明 |
|---|---|---|
| Client ID | `client_id` | Google Cloud 里创建的 OAuth 客户端 ID |
| Client Secret | `client_secret` | 对应的客户端密钥 |
| Refresh Token | `refresh_token` | 用上面的客户端授权 Drive 后得到的刷新令牌，网关用它换取访问令牌 |

### 高级设置

| 界面字段 | 配置字段 | 默认值 | 说明 |
|---|---|---|---|
| 启用 Worker 代理 | `use_worker` | 关闭 | 开启后 302 跳到 Worker，见下文 |
| Base URL (可选) | `base_url` | 空 | 默认方式下播放器访问网关用的外部地址。留空时使用播放器请求网关时的地址。只在未启用 Worker 时生效 |
| 共享盘 Drive ID (可选) | `drive_id` | 空 | 文件在共享盘里时填写，例如 `0AGW1q8hHv29tUk9PVA` |
| 共享盘 | `include_all_drives` | 关闭 | 查找文件时包含共享盘 |
| 链接有效期 (秒) | `link_ttl_seconds` | `3600` | 网关签发的播放令牌多久后失效，最长 24 小时 |
| 路径缓存 | `cache_enabled` | 开启 | 缓存路径到文件 ID 的对应关系，减少 Drive API 调用 |
| 缓存时间 (秒) | `cache_ttl_seconds` | `10800` | 路径缓存的保留时间 |

::: warning Base URL 什么时候要填
网关前面还有反向代理或 CDN、播放器看到的域名和网关实际地址不一样时，填播放器能访问到的那个地址，例如 `https://emby.example.com`。网关会自动在后面拼上 `/stream/gdrive`。
:::

## 什么时候需要 Worker

建议开启：

- Google Drive 播放量大，网关服务器带宽不够用
- 网关所在服务器访问 Google 速度慢
- 有多个 Google Drive 后端，想共用一个出口

可以先不开：

- 播放量不大，只是想先跑通
- 网关本身带宽充足、访问 Google 稳定

## 部署 Worker

Worker 脚本 `gdrive-worker.js` 在[下载页](https://github.com/SingleJohn/emby-gateway-bin/releases)的发布文件里，按 Cloudflare Workers 的方式部署。

### 1. 在网关里填 Worker 信息

打开 <span class="ui-path">系统 › 系统设置</span>，找到「GDrive Worker」分区：

| 界面字段 | 配置字段 | 说明 |
|---|---|---|
| Worker Base URL | `gdrive_worker.base_url` | Worker 的访问地址，以 `/stream` 结尾，例如 `https://worker.example.com/stream` |
| 签名密钥 (Sign Key) | `gdrive_worker.sign_key` | 网关签发令牌、Worker 校验令牌用的密钥 |
| 同步令牌 (Sync Token) | `gdrive_worker.sync_token` | Worker 向网关拉取后端配置时使用的 Bearer 令牌 |

签名密钥和同步令牌都用足够长的随机字符串，两者不要相同。

### 2. 配置 Worker 环境变量

| 变量 | 必填 | 说明 |
|---|---|---|
| `GATEWAY_BASE_URL` | 是 | Worker 访问网关**管理端**的地址，例如 `https://gateway-admin.example.com` |
| `WORKER_SYNC_TOKEN` | 是 | 与网关的「同步令牌 (Sync Token)」相同 |
| `SIGN_KEY` | 是 | 与网关的「签名密钥 (Sign Key)」相同 |
| `CONFIG_TTL_SECONDS` | 否 | Worker 缓存后端配置的时间，默认 `300`，最小 `30` |
| `GDRIVE_KV` | 否 | KV 命名空间绑定，用来缓存配置和访问令牌。不绑定也能用，但缓存只在单个 Worker 实例内有效 |

Worker 会请求 `GATEWAY_BASE_URL` 下的 `/internal/worker/gdrive-config` 拉取配置。这个接口由管理端口提供，返回的内容包含 Google Drive 的 OAuth 凭证。

::: danger 管理端口不要整个暴露到公网
如果 Worker 需要从公网访问网关，建议用反向代理只放行 `/internal/worker/gdrive-config` 这一个路径，管理界面本身仍然只在内网或受保护的地址上开放。
:::

### 3. 打开后端的 Worker 开关

回到 <span class="ui-path">接入与路由 › 存储后端</span>，在要走 Worker 的 Google Drive 后端里打开「启用 Worker 代理」，然后保存。

- 只有打开了这个开关的 Google Drive 后端，才会出现在 Worker 拉到的配置里。
- 多个后端可以共用同一个 Worker：令牌里带有后端 ID，Worker 会取对应后端的凭证去回源。
- 打开开关后如果「Worker Base URL」或「签名密钥 (Sign Key)」没填，播放会失败，报错 `gdrive worker not configured`。

## 验证

1. 用播放器播放一个走这个后端的视频。
2. 在 <span class="ui-path">监控 › 流量分析</span> 的「302 链路」里找到这次请求，跳转地址应该是 `https://worker.example.com/stream/gdrive/...`。
3. 视频能连续播放、可以拖动进度条，说明 Worker 回源正常。

## 常见问题

**Worker 返回 `invalid token`**
网关和 Worker 的签名密钥不一致，或者令牌已经超过「链接有效期 (秒)」。

**Worker 返回 `backend not found`**
后端没有打开「启用 Worker 代理」，或者开关刚打开、Worker 还在用缓存的旧配置。等 `CONFIG_TTL_SECONDS` 过后再试。

**Worker 日志里是 `gateway sync failed: 401`**
`WORKER_SYNC_TOKEN` 和网关的同步令牌不一致。返回 404 则表示网关没有填同步令牌。

**默认方式下播放地址的域名不对**
填写后端的「Base URL (可选)」，改成播放器能访问到的地址。

## 相关文档

- [后端总览](/guide/backend-configuration)
- [资源池与故障切换](/guide/routing-and-pool)
- [系统设置](/guide/system-settings)
