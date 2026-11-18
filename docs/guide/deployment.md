---
title: 部署与升级
description: 飞跃 Emby 网关的端口规划、Docker 与二进制部署、数据目录、数据库选择、反向代理、升级回滚和安全基线。
---

# 部署与升级

本页讲正式部署前需要想清楚的事：端口怎么分、数据放在哪、用哪种数据库、怎么升级。只想先跑起来，看 [快速开始](/guide/quick-start) 就够了。

所有启动参数和环境变量的完整列表见 [启动参数与环境变量](/reference/cli-env)。

## 端口规划

网关会监听两类端口：

| 端口 | 谁访问 | 默认值 | 说明 |
|---|---|---|---|
| 管理端口 | 管理员的浏览器 | `18888` | 管理界面和管理 API。可用 `GATEWAY_ADMIN_PORT` 或在系统设置里修改 |
| Emby 源端口 | 播放器 | 无，每个源单独设置 | 每个 Emby 源的「监听端口」，播放器连接这里 |

文档示例里的 `19999` 是通过 `GATEWAY_ADMIN_PORT` 指定的，不是默认值。

### host 网络与端口映射

**host 网络（推荐，仅 Linux）**：容器直接使用宿主机的网络，新增 Emby 源或修改端口后不需要改 compose 文件。

**端口映射**：不能用 host 网络时（例如 macOS、Windows 的 Docker Desktop），需要把管理端口和每个 Emby 源端口都列出来：

```yaml
services:
  emby-gateway:
    image: renzhengfei/emby-gateway:latest
    ports:
      - "127.0.0.1:19999:19999"   # 管理端口，只允许本机访问
      - "18889:18889"             # Emby 源 1
      - "18899:18899"             # Emby 源 2
```

这时每新增一个 Emby 源，都要在这里加一行并重建容器。如果用的是 PostgreSQL，数据库地址也不能再写 `127.0.0.1`，要改成数据库容器的服务名（如 `postgres:5432`）。

::: warning
网关会自动监听新端口，但防火墙、云服务器安全组和 Docker 端口映射都不会自动变化，需要你手动放行。
:::

## 部署方式

### Docker

镜像：`renzhengfei/emby-gateway:latest`，支持 `amd64` 和 `arm64`。compose 示例见 [快速开始](/guide/quick-start#部署)。

容器内的工作目录是 `/app`，需要挂载的目录：

| 容器内路径 | 内容 | 是否必须 |
|---|---|---|
| `/app/data` | SQLite 数据库 `gateway.db`、授权文件（`data/license`） | 必须持久化 |
| `/app/cache` | 磁盘缓存（Emby 网页资源和图片） | 建议挂载，丢失不影响配置 |

::: tip 缓存不在数据目录里
磁盘缓存默认写在 `/app/cache`，不在 `/app/data` 下。不单独挂载时，缓存会留在容器里，重建容器后清空。缓存默认上限 5 GB，可在 <span class="ui-path">系统 › 系统设置</span> 的「缓存」里调整或清理。
:::

### 二进制

在 [下载页](https://github.com/SingleJohn/emby-gateway-bin/releases) 选择对应系统的文件：

| 系统 | 文件名 |
|---|---|
| Linux | `emby-s3-gateway-linux-amd64`、`emby-s3-gateway-linux-arm64` |
| Windows | `emby-s3-gateway-windows-amd64.exe`、`emby-s3-gateway-windows-arm64.exe` |
| macOS | `emby-s3-gateway-darwin-amd64`、`emby-s3-gateway-darwin-arm64` |

```bash
chmod +x emby-s3-gateway-linux-amd64
GATEWAY_ADMIN_PORT=19999 ./emby-s3-gateway-linux-amd64
```

程序会在**当前目录**下创建 `data/`（数据库与授权）和 `cache/`（缓存），所以请在固定的目录里启动。长期运行建议用 systemd 托管。

下载页里除了正式版本，还有随开发进度更新的 `nightly` 预发布版本，适合想提前验证修复的用户。生产环境请用正式版本。

## 数据库

| | SQLite | PostgreSQL |
|---|---|---|
| 适合 | 体验、个人使用、请求量不大 | 长期运行、多用户、需要长期保留请求日志 |
| 部署 | 不需要额外服务 | 需要单独运行数据库 |
| 配置 | 什么都不用设置 | 设置 `GATEWAY_DB_DRIVER=postgres` 和 `GATEWAY_DB_DSN` |

设置了 `GATEWAY_DB_DSN` 时，网关会自动使用 PostgreSQL；否则使用 `data/gateway.db`。

请求日志会持续增长，请在 <span class="ui-path">系统 › 系统设置</span> 里设置合适的保留天数，并定期查看 [数据库维护](/ops/database-maintenance)。

## 反向代理与 HTTPS

### Emby 源

给播放器提供 HTTPS 时，用 Nginx、Caddy 等把域名转发到 Emby 源端口。注意：

- 开启 WebSocket 转发，Emby 客户端需要它推送状态。
- 把真实客户端 IP 通过 `X-Forwarded-For` 或 `X-Real-IP` 传给网关，并在 <span class="ui-path">安全 › 防护策略</span> 的「真实 IP」里把反向代理的地址加入「可信代理白名单 (CIDR)」。否则网关看到的所有请求都来自反向代理，登录防护和封禁会误伤所有人。
- 不要在反向代理上缓存视频请求。

### 管理界面

管理界面最好只在内网、VPN 或受 IP 限制的反向代理后访问。需要放在公网域名下时：

- 在 <span class="ui-path">系统 › 系统设置</span> 里设置「控制台路径前缀」（例如 `asdfg`），管理界面的地址会变成 `http://服务器地址:管理端口/asdfg/`，其他路径一律返回 404。
- 配合反向代理的访问控制（IP 白名单或额外认证）一起使用。

## Local Agent

媒体存放在另一台机器的本地磁盘上时，可以在那台机器上运行 Local Agent：它负责列出目录，并给播放器提供带签名的直链。网关里对应的后端类型是「Local Agent」。

部署方法和变量见 [本地目录与 Local Agent](/guide/backend-local) 与 [启动参数与环境变量](/reference/cli-env#local-agent)。

## 升级与回滚

### 升级前

1. 记下当前版本：管理界面顶栏右侧显示当前版本号，点开可以检查更新。
2. 备份数据库：
   - SQLite：停止网关后复制 `gateway-data/gateway.db`；
   - PostgreSQL：`docker exec pg-emby-gateway pg_dump -U gatewayuser gateway > gateway-backup.sql`。
3. 一并备份 `gateway-data/license` 目录。

### 升级

Docker：

```bash
docker compose pull emby-gateway
docker compose up -d emby-gateway
```

二进制：停止进程，替换文件，用同样的参数重新启动。

网关启动时会自动升级数据库结构，不需要手动执行脚本。

### 升级后检查

- 顶栏版本号已经变化；
- <span class="ui-path">首页 › 控制台</span> 的「需要关注」里没有新出现的授权或配置异常；
- 每个 Emby 源都能连上，播放一个媒体后能在流量分析的「302 链路」里看到记录。

### 回滚

数据库结构升级后不一定能被旧版本识别。回滚时换回旧版本程序，**同时**恢复升级前的数据库备份。

## 安全基线

1. **设置管理密码**。没有设置「Admin Password」时，管理界面不需要登录。
2. **按需设置只读账号**。给协作者「Viewer Password」而不是管理密码，只读账号看到的密钥、Token 会被隐藏，见 [管理界面基础](/guide/management-ui#登录与角色)。
3. **管理端口不暴露到公网**。示例里可以把端口映射写成 `127.0.0.1:19999:19999`，再通过 SSH 隧道、VPN 或受限的反向代理访问。
4. **数据库只在本机或内网可访问**，使用独立的强密码。
5. **配置加密密钥**。配置里的密钥类字段在数据库中加密保存。如需使用自己的加密密钥，在第一次启动前设置 `GATEWAY_CFG_ENC_KEY`，之后不要更换，见 [启动参数与环境变量](/reference/cli-env)。
6. **定期更换凭据**：Emby API Key、网盘授权、Worker 和 Local Agent 的 Token、签名密钥。
7. 反馈问题时，不要公开带真实凭据的配置、日志或截图。
