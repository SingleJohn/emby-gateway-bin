---
title: 本地目录与 Local Agent
description: 用本地存储后端直接提供网关所在机器上的媒体文件，或在存放媒体的另一台机器上运行 Local Agent，让播放器直接从那台机器拉流。
---

# 本地目录与 Local Agent

媒体文件放在普通磁盘上、而不是对象存储或网盘里时，用这两类后端：

- **本地存储**（`local`）：媒体就在网关所在的机器上，由网关直接把文件发给播放器。
- **Local Agent 代理**（`local_agent`）：媒体在另一台机器上。在那台机器上运行一个轻量服务 Local Agent，播放器直接从它拉流，视频流量不经过网关。

| | 本地存储 | Local Agent 代理 |
|---|---|---|
| 媒体所在机器 | 网关本机 | 另一台机器（下文称存储机） |
| 播放器拉流的地址 | 网关的 `/stream/local/<令牌>` | 存储机的 `/stream/local/<令牌>` |
| 视频流量经过 | 网关 | 存储机 |
| 需要额外部署 | 不需要 | 在存储机上运行 Local Agent |

两类后端都会先返回 302。跳转地址里的令牌用「签名密钥」加密，带有效期，不会暴露真实的目录结构。

## 本地存储

在 <span class="ui-path">接入与路由 › 存储后端</span> 新建后端，类型选「本地存储」。

| 界面字段 | 配置字段 | 默认值 | 说明 |
|---|---|---|---|
| Base Dir | `base_dir` | — | 媒体根目录，例如 `/mnt`。必填 |
| Base URL (可选) | `base_url` | 空 | 播放器访问网关用的外部地址。留空时使用播放器请求网关时的地址 |
| 链接有效期 (秒) | `link_ttl_seconds` | `3600` | 播放令牌的有效期 |
| 签名密钥 | `sign_secret` | — | 加密播放令牌用的密钥，必填，用足够长的随机字符串 |

路径映射得到的对象路径会接在「Base Dir」后面。例如「Base Dir」是 `/mnt`，映射后的路径是 `movies/阿凡达.mkv`，网关读取的就是 `/mnt/movies/阿凡达.mkv`。网关支持 Range 请求，播放器可以正常拖动进度条。

::: tip Docker 部署
网关跑在容器里时，「Base Dir」填的是**容器内**的路径。记得在 compose 文件里把媒体目录挂进容器，例如 `- /data/media:/mnt:ro`。
:::

## Local Agent 代理

适合这种情况：网关（A 机）只负责调度，媒体放在另一台带宽更好的机器（B 机）上。网关签发链接，B 机直接把文件发给播放器。

### 工作方式

1. 网关通过「Agent API URL」把这个后端的「Base Dir」和「签名密钥」同步给 Local Agent。保存配置时同步一次，之后每 45 秒同步一次。
2. 播放时，网关生成加密令牌，302 到「Public Base URL」下的 `/stream/local/<令牌>`。
3. Local Agent 校验令牌、读取文件，直接响应播放器。
4. 对象浏览和 STRM 任务列目录时，网关通过「Agent API URL」向 Local Agent 查询。

### 在存储机上运行 Local Agent

Local Agent 的程序文件在[下载页](https://github.com/SingleJohn/emby-gateway-bin/releases)，文件名为 `emby-local-agent-<系统>-<架构>`，提供 Linux、Windows、macOS 的 amd64 和 arm64 版本。

```bash
./emby-local-agent-linux-amd64 \
  --host 0.0.0.0 \
  --port 19090 \
  --sync-token '换成一串足够长的随机字符串' \
  --cors-allow-origins 'https://emby.example.com'
```

也可以用环境变量：

| 参数 | 环境变量 | 默认值 | 说明 |
|---|---|---|---|
| `--host` | `LOCAL_AGENT_HOST` | `0.0.0.0` | 监听地址 |
| `--port` | `LOCAL_AGENT_PORT` | — | 监听端口，必填 |
| `--sync-token` | `LOCAL_AGENT_SYNC_TOKEN` | — | 网关访问 Local Agent 内部接口用的令牌，必填 |
| `--cors-allow-origins` | `LOCAL_AGENT_CORS_ALLOW_ORIGINS` | `*` | 允许跨域访问 `/stream` 的来源，多个用英文逗号分隔，`*` 表示全部允许 |

启动后访问 `http://存储机地址:19090/healthz`，返回 `{"status":"ok"}` 说明服务正常。

### 在网关里添加后端

在 <span class="ui-path">接入与路由 › 存储后端</span> 新建后端，类型选「Local Agent 代理」。

| 界面字段 | 配置字段 | 默认值 | 说明 |
|---|---|---|---|
| Base Dir (B 机目录) | `base_dir` | — | 存储机上的媒体根目录，例如 `/mnt/media` |
| Public Base URL (给客户端) | `public_base_url` | — | **播放器**访问 Local Agent 的地址，例如 `https://storage-b.example.com`。必填 |
| Agent API URL (网关访问代理) | `agent_api_url` | — | **网关**访问 Local Agent 的地址，可以是内网地址，例如 `http://10.0.0.12:19090`。必填 |
| 链接有效期 (秒) | `link_ttl_seconds` | `3600` | 播放令牌的有效期 |
| 签名密钥 | `sign_secret` | — | 加密播放令牌用的密钥，必填 |
| Sync Token | `sync_token` | — | 与 Local Agent 的 `--sync-token` 相同。必填 |

「Public Base URL」和「Agent API URL」可以指向同一个地址，也可以分开：播放器走公网域名，网关走内网直连。

### 网络与安全建议

- Local Agent 的同一个端口同时提供 `/stream`（给播放器）和 `/internal`（给网关）两组接口。`/internal` 需要 Sync Token，但仍建议在反向代理上只对公网放行 `/stream`。
- 播放器从浏览器（例如 Emby Web）播放时会跨域请求 Local Agent。把 `--cors-allow-origins` 设成你的 Emby 访问域名，比默认的 `*` 更安全。
- 签名密钥和 Sync Token 用不同的随机字符串。
- Emby Web 页面是 HTTPS 时，「Public Base URL」也要用 HTTPS，否则浏览器会拦截播放。

## 验证

1. 在 <span class="ui-path">媒体库工具 › 对象浏览</span> 选择这个后端，能列出目录，说明网关能访问到文件（Local Agent 还说明同步正常）。
2. 播放一个视频，在 <span class="ui-path">监控 › 流量分析</span> 的「302 链路」里确认跳转地址指向网关（本地存储）或存储机（Local Agent）。

## 常见问题

**播放返回 410 `expired or invalid token`**
令牌过期，或者签名密钥改过之后播放器还在用旧链接。重新起播即可。Local Agent 的情况下，也可能是网关还没把新的签名密钥同步过去，等一分钟再试。

**播放返回 404 `file not found`**
「Base Dir」加上映射后的路径在磁盘上不存在。检查路径映射和「Base Dir」，容器部署时检查目录挂载。

**对象浏览列不出 Local Agent 的目录**
检查「Agent API URL」能否从网关所在机器访问，Sync Token 是否和 Local Agent 启动参数一致。同步失败会记录在 <span class="ui-path">系统 › 系统日志</span>。

## 相关文档

- [后端总览](/guide/backend-configuration)
- [路径映射](/guide/path-mapping)
- [部署与升级](/guide/deployment)
