---
title: 启动参数与环境变量
description: 飞跃 Emby 网关与 Local Agent 支持的全部启动参数、对应的环境变量、默认值和生效规则。
---

# 启动参数与环境变量

网关的大部分配置保存在数据库里，在管理界面修改。启动参数和环境变量只用来指定数据库、管理端监听地址等「启动前就要知道」的东西。

每个参数都可以用命令行或环境变量设置，两者同时设置时以命令行为准。Docker 部署一般用环境变量。

## 数据库

| 命令行参数 | 环境变量 | 默认值 | 说明 |
|---|---|---|---|
| `-db-driver` | `GATEWAY_DB_DRIVER` | 自动判断 | `sqlite` 或 `postgres`（也接受 `pg`、`postgresql`）。不填时：设置了 DSN 用 `postgres`，否则用 `sqlite` |
| `-db-dsn` | `GATEWAY_DB_DSN` | 空 | PostgreSQL 连接串，例如 `postgresql://用户:密码@127.0.0.1:5432/gateway?sslmode=disable`。设置后优先于 `-db` |
| — | `DATABASE_URL` | 空 | 仅在 `GATEWAY_DB_DSN` 为空时作为连接串使用，方便部署平台自动注入 |
| `-db` | — | `data/gateway.db` | SQLite 数据库文件路径（相对于程序的工作目录；Docker 里即 `/app/data/gateway.db`） |
| `-db-allow-destructive` | `GATEWAY_DB_ALLOW_DESTRUCTIVE_MIGRATIONS` | 关闭 | 允许在升级数据库结构时删除并重建表。环境变量填 `1` 或 `true` 开启 |

::: danger 关于 `-db-allow-destructive`
开启后，数据库升级可能删除旧表中的数据。只有在升级说明明确要求，或者你确认可以丢弃旧数据时才开启，开启前务必备份。
:::

## 管理端

| 命令行参数 | 环境变量 | 默认值 | 说明 |
|---|---|---|---|
| `-admin-host` | `GATEWAY_ADMIN_HOST` | `0.0.0.0` | 管理端监听地址。只想本机访问时填 `127.0.0.1` |
| `-admin-port` | `GATEWAY_ADMIN_PORT` | `18888` | 管理端监听端口 |

不设置这两项时，使用 <span class="ui-path">系统 › 系统设置</span> 里的「Admin Host」「Admin Port」（首次启动为上表的默认值）。设置后以启动参数为准，界面里的对应值不生效。

管理密码、只读密码和控制台路径前缀没有对应的启动参数，只能在系统设置里修改。

## 配置加密

| 环境变量 | 默认值 | 说明 |
|---|---|---|
| `GATEWAY_CFG_ENC_KEY` | 内置密钥 | 数据库中密钥类配置字段的加密密钥。32 字节，写成 `base64:` 开头的 Base64，或 `hex:` 开头的 64 位十六进制 |

::: warning
如果要使用自己的加密密钥，请在**第一次启动前**设置，之后不要更换或删除。数据用某个密钥加密后，换了密钥就无法解密已保存的配置。换机器迁移时，也要带上同一个密钥。
:::

生成一个随机密钥：

```bash
echo "base64:$(openssl rand -base64 32)"
```

## 授权

| 命令行参数 | 环境变量 | 默认值 | 说明 |
|---|---|---|---|
| `-license-dir` | `GATEWAY_LICENSE_DIR` | `data/license` | 授权文件的保存目录。Docker 部署时位于数据卷内，一般不需要修改 |
| `-license-server-url` | `GATEWAY_LICENSE_SERVER_URL` | 空 | 授权服务地址。也可以在 <span class="ui-path">系统 › 授权</span> 的「授权服务配置」里设置；用启动参数设置后，界面里会提示该项被覆盖 |

激活和续租的操作见 [授权](/guide/license)。

## 已废弃

| 命令行参数 | 说明 |
|---|---|
| `-config` | 早期版本用于指定配置文件，现在配置全部保存在数据库中，传入也会被忽略 |

## Local Agent

Local Agent 运行在存放媒体的机器上，为网关的「Local Agent」后端提供目录列表和直链。用法见 [本地目录与 Local Agent](/guide/backend-local)。

| 命令行参数 | 环境变量 | 默认值 | 说明 |
|---|---|---|---|
| `-host` | `LOCAL_AGENT_HOST` | `0.0.0.0` | 监听地址 |
| `-port` | `LOCAL_AGENT_PORT` | 无，必填 | 监听端口 |
| `-sync-token` | `LOCAL_AGENT_SYNC_TOKEN` | 无，必填 | 网关访问 Agent 时使用的令牌，必须和网关里该后端配置的令牌一致 |
| `-cors-allow-origins` | `LOCAL_AGENT_CORS_ALLOW_ORIGINS` | `*` | 允许跨域访问视频流的来源，多个用逗号分隔，`*` 表示全部允许 |

端口或令牌没有设置时，Agent 会直接退出并提示缺少哪一项。

示例：

```bash
LOCAL_AGENT_PORT=18900 \
LOCAL_AGENT_SYNC_TOKEN='换成一串足够长的随机字符' \
./local-agent
```

## 示例

### Docker Compose

```yaml
environment:
  TZ: Asia/Shanghai
  GATEWAY_ADMIN_HOST: 0.0.0.0
  GATEWAY_ADMIN_PORT: 19999
  GATEWAY_DB_DRIVER: postgres
  GATEWAY_DB_DSN: postgresql://gatewayuser:密码@127.0.0.1:5432/gateway?sslmode=disable
```

### 命令行

```bash
./emby-s3-gateway-linux-amd64 \
  -admin-port 19999 \
  -db-dsn 'postgresql://gatewayuser:密码@127.0.0.1:5432/gateway?sslmode=disable'
```
