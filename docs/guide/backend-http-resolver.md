---
title: HTTP Resolver
description: 外部解析后端：网关把对象路径交给外部解析服务（如 hls2strm）换取真实播放地址，再 302 或经网关中转给播放器。说明请求与响应约定和两种链路模式。
---

# HTTP Resolver

外部解析后端（类型 `http_resolver`，界面上叫「外部解析 (http_resolver)」）不直接对接某个存储，而是把播放请求交给一个外部解析服务，由它决定真实的播放地址。典型用法是对接 hls2strm 这类把在线视频源转成 STRM 的服务。

适合这些情况：

- 媒体的真实地址需要实时解析，并且会过期，不能写死在 STRM 里
- 解析逻辑已经由外部服务实现，网关只需要负责路由、鉴权和观测
- 希望在 Emby 里以原格式（MP4 或 HLS）直接播放，不经过 Emby 转码

## 配置

在 <span class="ui-path">接入与路由 › 存储后端</span> 新建后端，类型选「外部解析服务」。

| 界面字段 | 配置字段 | 默认值 | 说明 |
|---|---|---|---|
| 解析接口地址 | `api_url` | — | 解析服务的接口地址，例如 `http://jable-strm:8080/api/resolve` |
| Token (Bearer) | `token` | 空 | 与解析服务约定的令牌，网关以 `Authorization: Bearer <令牌>` 发送 |
| 超时 (秒) | `timeout_seconds` | `135` | 起播阶段等待解析服务的最长时间，范围 135–600 |
| 链路模式（要中转的片） | `link_mode` | `redirect` | 「302 重定向」或「网关中转 (Relay)」，见下文 |

::: warning 超时不要低于 135 秒
解析服务选源最长可能用 120 秒，网关在此基础上预留了交付时间。小于 135 的值会按 135 处理。这个时限只约束起播，不限制后续的媒体传输。
:::

## 播放流程

1. 播放器请求 `PlaybackInfo` 时，网关按路由找到使用外部解析后端的资源池，先向解析服务做一次**播放准备**，拿到真实的容器格式（例如 `mp4` 或 `m3u8`），并据此改写返回给播放器的媒体信息，让播放器按原格式直接播放。
2. 播放器请求视频流时，网关使用准备阶段的结果生成跳转地址。准备结果按用户、媒体版本和播放会话分别记录，不会在用户之间共用。
3. 解析失败时，网关会尝试资源池里的备用后端；都失败时返回错误，提示重新发起播放。走外部解析的路由**不会回退到 Emby 代理**，以免把内部的 STRM 地址暴露给播放器。

## 请求与响应约定

需要自己实现解析服务时，按下面的约定对接。

### 网关发出的请求

```http
GET {api_url}/{对象路径}?prepare=1&container=mp4&ua=...&origin=...&fetch_mode=...&relay=gateway
Authorization: Bearer <令牌>
```

| 参数 | 何时出现 | 含义 |
|---|---|---|
| 路径中的 `{对象路径}` | 总是 | 路径映射后的对象路径，按段做 URL 编码 |
| `prepare=1` | 播放准备阶段 | 要求返回准备好的播放信息 |
| `container` | 已知容器格式时 | 要求返回与之相同的容器格式 |
| `ua` | 能拿到时 | 播放器的 User-Agent |
| `origin` | 能拿到时 | 播放器请求的 Origin（浏览器播放时） |
| `fetch_mode` | 能拿到时 | 播放器请求的 `Sec-Fetch-Mode` |
| `relay=gateway` | 链路模式为网关中转时 | 告诉解析服务：需要中转的片会经网关中转 |

`ua`、`origin`、`fetch_mode` 用来帮助解析服务判断播放器能不能直连某个地址，例如有的 CDN 会拒绝特定 User-Agent，浏览器播放需要 CORS。

### 解析服务的响应

返回 HTTP 200 和 JSON：

```json
{
  "url": "https://cdn.example.com/hls/index.m3u8",
  "ttl": 600,
  "relay": false,
  "protocol_version": 1,
  "container": "m3u8",
  "media_type": "hls",
  "transcoding": false
}
```

| 字段 | 说明 |
|---|---|
| `url` | 播放地址，必须是 `http` 或 `https`，不能带用户名密码 |
| `ttl` | 地址的有效期（秒） |
| `relay` | `true` 表示这个地址播放器无法直连，需要中转 |
| `protocol_version` | 播放准备阶段必须为 `1` |
| `container` | 容器格式，取值 `m3u8`、`mp4`、`mov`、`mkv`、`webm`、`ts` 之一。请求里带了 `container` 时必须一致 |
| `media_type` | `container` 为 `m3u8` 时必须是 `hls`；其他容器格式时不能是 `hls` |
| `transcoding` | 播放准备阶段必须为 `false`，网关只支持原格式播放 |
| `reason` / `detail` | 出错时的原因说明。非 200 响应里的这两个字段会写进网关日志 |

不满足上面的要求时，网关会报错并提示「需要先升级 hls2strm」或「返回的格式不一致」，这次播放失败。

## 两种链路模式

解析服务返回 `relay: false` 的地址，两种模式下都直接 302 给播放器。区别只在 `relay: true` 的地址怎么处理：

| | 302 重定向（`redirect`） | 网关中转（`relay`） |
|---|---|---|
| 播放器访问 | 解析服务给的中转地址 | 网关的 `/stream/http_resolver/<令牌>/...` |
| 解析服务是否要暴露公网 | 要 | 不用，只要网关能访问 |
| 中转流量 | 走解析服务 | 走网关，计入网关统计 |

网关中转时，解析服务返回的中转地址路径必须以 `/play/`、`/media/` 或 `/hls/` 开头。网关只取路径和查询串，转发到解析服务地址（「解析接口地址」去掉末尾的 `/api/resolve`，没有这个后缀时取协议加主机）。中转令牌绑定当前用户。

## 对接 hls2strm

- hls2strm 需要升级到支持播放准备协议的版本，否则网关会提示升级。
- hls2strm 的 `resolve_mode` 决定哪些地址让播放器直连、哪些需要中转；`play_mode` 只影响普通播放，不影响经网关的播放。
- 想让这个后端的媒体**全部**经过网关：hls2strm 设置 `resolve_mode=proxy`，网关这边「链路模式」选「网关中转 (Relay)」。

## 常见问题

**播放提示「播放源准备失败，请重新发起播放」**
解析服务超时、返回错误，或者资源池里的后端都失败了。到 <span class="ui-path">系统 › 系统日志</span> 查看解析服务返回的 `reason`。

**提示需要先升级 hls2strm**
解析服务在播放准备阶段没有返回 `protocol_version: 1`、合法的 `container`，或者返回了 `transcoding: true`。

**拖动进度条后报「续播请求缺少有效播放准备会话」**
播放准备记录已经过期或者丢失，重新从头起播即可。

## 相关文档

- [后端总览](/guide/backend-configuration)
- [资源池与故障切换](/guide/routing-and-pool)
- [STRM 任务](/guide/strm-guide)
