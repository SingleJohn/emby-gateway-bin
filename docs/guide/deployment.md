# 部署指南

本文档给出详细的部署参数与部署建议，目标是稳定运行、可维护、可排障。

部署方式参见 [快速开始](quick-start.md)

## 单机模式（推荐起步）

- 组件：`emby-gateway + PostgreSQL`
- 适用：个人/小团队、先跑通业务链路
- 优点：部署简单，故障域小

## 分离模式（推荐生产）

- 组件：`emby-gateway` 与 `PostgreSQL` 分机部署
- 适用：生产环境、需要独立扩容数据库
- 建议：数据库启用定期备份与监控

## 系统配置项

| 项目 | 默认值 | 说明 |
|---|---|---|
| 管理端口 | `18888` | 管理后台访问端口 |
| Source 监听端口 | 按配置 | 每个启用的 Source 独立监听 |
| 控制台路径前缀 | `` | 可自定义以保护管理后台 |
| Stream 前缀 | `/stream` | 可按 Source 自定义 `stream_path_prefix` |

说明：
- 管理端监听地址/端口可由 `GATEWAY_ADMIN_HOST`、`GATEWAY_ADMIN_PORT` 覆盖
- Source 端口由业务配置决定，新增 Source 后通常需要重启进程使监听生效


## 优先级与生效规则（重要）

- 参数优先级：命令行参数 > 环境变量 > 程序内默认值
- `-db-dsn` 非空时覆盖 `-db`；若 `-db-dsn` 为空但 `-db` 看起来像 DSN，也会按 DSN 处理
- `-db-driver` 为空时自动推断：有 DSN 则 `postgres`，否则 `sqlite`
- `-admin-host` 仅在非空时覆盖配置；`-admin-port` 仅在 `>0` 时覆盖配置
- `-license-*-seconds` 仅在 `>0` 时覆盖配置


## 命令行参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| `-db` | `data/gateway.db` | 兼容参数：可传 SQLite 文件路径，也可传 DSN |
| `-db-driver` | 自动推断 | `sqlite` 或 `postgres` |
| `-db-dsn` | 空 | 数据库 DSN；设置后优先于 `-db` |
| `-db-allow-destructive` | `false`| 允许破坏性迁移（drop/recreate） |
| `-admin-host` | `0.0.0.0` | 覆盖默认的管理端监听地址 |
| `-admin-port` | `18888` | 覆盖默认的管理端端口；`>0` 才生效 |
| `-license-server-url` | 空 | 许可证服务器地址 |
| `-license-token` | 空 | Bearer Token, 用与授权与续期接口 |
| `-license-public-key` | 空 | 许可证公钥内容|
| `-license-dir` | `data/license` | 本地许可证目录 |

## 环境变量

| 环境变量 | 对应参数/行为 | 说明 |
|---|---|---|
| `GATEWAY_DB_DRIVER` | `-db-driver` | `sqlite` / `postgres` |
| `GATEWAY_DB_DSN` | `-db-dsn` | PostgreSQL DSN |
| `GATEWAY_DB_ALLOW_DESTRUCTIVE_MIGRATIONS` | `-db-allow-destructive` | `1` / `true` 视为开启 |
| `GATEWAY_ADMIN_HOST` | `-admin-host` | 管理端地址覆盖 |
| `GATEWAY_ADMIN_PORT` | `-admin-port` | 管理端端口覆盖 |
| `GATEWAY_LICENSE_SERVER_URL` | `-license-server-url` | 许可证服务地址 |
| `GATEWAY_LICENSE_SERVER_TOKEN` | `-license-token` | Bearer Token, 用与授权与续期接口 |
| `GATEWAY_LICENSE_PUBLIC_KEY` | `-license-public-key` | 许可证公钥 |
| `GATEWAY_LICENSE_DIR` | `-license-dir` | 许可证本地目录 |



## Local Agent 环境变量

| 环境变量 | 说明 |
|---|---|
| `LOCAL_AGENT_HOST` | 监听地址（默认 `0.0.0.0`） |
| `LOCAL_AGENT_PORT` | 监听端口（必填） |
| `LOCAL_AGENT_SYNC_TOKEN` | 同步鉴权 token（必填） |
| `LOCAL_AGENT_CORS_ALLOW_ORIGINS` | 允许跨域来源，逗号分隔 |

## 安全

1. 首次部署后，配置页面配置登录密码
2. 强密码和随机密钥（数据库密码、Token、Sign Secret）
3. 管理面板不要直接裸露公网（至少加反代鉴权/IP 白名单）
4. 定期轮换敏感配置（数据库账号、Worker/Agent 同步 Token）
5. 持久化目录做好权限控制（`gateway-data`、`pg-data`）
