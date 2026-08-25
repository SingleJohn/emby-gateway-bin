# 部署指南

推荐生产拓扑为 `emby-gateway + PostgreSQL`。SQLite 保留为轻量兼容模式，不适合长期、高写入量的请求日志。

部署示例参见 [快速开始](/guide/quick-start)。

## 网络规划

| 端口 | 用途 | 是否固定 |
|---|---|---|
| 管理端口 | WebUI 与 Admin API | 默认 `18888`，可覆盖 |
| Source 端口 | Emby 客户端访问入口 | 每个 Source 独立配置 |
| PostgreSQL | 配置、日志与统计 | 默认 `5432`，不建议暴露公网 |
| Local Agent | 目录枚举和本地直链 | 按 Agent 部署配置 |

示例使用 `19999` 作为管理端口只是部署覆盖值，不是程序默认值。

Source 的新增、停用以及监听地址或端口变更支持热更新，但操作系统防火墙、云安全组和 Docker 端口映射不会自动变化。

## 配置优先级

- 命令行参数高于环境变量默认值和数据库配置。
- `-db-dsn` 非空时覆盖 `-db`。
- `-db-driver` 为空时，有 DSN 推断为 `postgres`，否则使用 `sqlite`。
- `-admin-host` 仅在非空时覆盖数据库配置。
- `-admin-port` 和许可证秒数参数仅在大于 `0` 时覆盖数据库配置。
- `-config` 仅为兼容保留，当前版本不会从该文件加载配置。

## 命令行参数

| 参数 | 启动默认值 | 说明 |
|---|---|---|
| `-config` | `config.yaml` | 已废弃并忽略 |
| `-db` | `data/gateway.db` | SQLite 路径或兼容 DSN |
| `-db-driver` | 自动推断 | `sqlite` 或 `postgres` |
| `-db-dsn` | 空 | 数据库 DSN，优先于 `-db` |
| `-db-allow-destructive` | `false` | 允许破坏性数据库迁移；只在明确理解影响时开启 |
| `-admin-host` | 空 | 非空时覆盖数据库中的监听地址 |
| `-admin-port` | `0` | 大于 `0` 时覆盖数据库中的端口 |
| `-license-server-url` | 空 | 许可证服务地址 |
| `-license-token` | 空 | 许可证 Bearer Token |
| `-license-public-key` | 空 | Base64 或 `ssh-ed25519` 公钥 |
| `-license-dir` | 空 | 最终默认 `data/license` |
| `-license-renew-seconds` | `0` | 续期周期覆盖值 |
| `-license-rollback-tolerance-seconds` | `0` | 时间回拨容忍覆盖值 |
| `-license-activate-timeout-seconds` | `0` | 激活请求超时覆盖值 |

## 环境变量

| 环境变量 | 说明 |
|---|---|
| `GATEWAY_DB_DRIVER` | `sqlite` 或 `postgres` |
| `GATEWAY_DB_DSN` | PostgreSQL DSN |
| `DATABASE_URL` | 仅在 `GATEWAY_DB_DSN` 为空时作为 DSN 兜底 |
| `GATEWAY_DB_ALLOW_DESTRUCTIVE_MIGRATIONS` | `1` 或 `true` 开启破坏性迁移 |
| `GATEWAY_ADMIN_HOST` | 管理端监听地址覆盖值 |
| `GATEWAY_ADMIN_PORT` | 管理端端口覆盖值 |
| `GATEWAY_LICENSE_SERVER_URL` | 许可证服务地址 |
| `GATEWAY_LICENSE_SERVER_TOKEN` | 首选许可证 Token |
| `GATEWAY_LICENSE_TOKEN` | 前一变量为空时的 Token 兜底 |
| `GATEWAY_LICENSE_PUBLIC_KEY` | 许可证公钥 |
| `GATEWAY_LICENSE_DIR` | 许可证本地目录 |
| `GATEWAY_LICENSE_RENEW_SECONDS` | 续期周期 |
| `GATEWAY_LICENSE_ROLLBACK_TOLERANCE_SECONDS` | 时间回拨容忍 |
| `GATEWAY_LICENSE_ACTIVATE_TIMEOUT_SECONDS` | 激活请求超时 |
| `GATEWAY_CFG_ENC_KEY` | 配置敏感字段加密密钥；已加密数据库启动时必须提供同一密钥 |

## Local Agent

| 环境变量 | 说明 |
|---|---|
| `LOCAL_AGENT_HOST` | 监听地址，默认 `0.0.0.0` |
| `LOCAL_AGENT_PORT` | 监听端口，必填 |
| `LOCAL_AGENT_SYNC_TOKEN` | 网关同步鉴权 Token，必填 |
| `LOCAL_AGENT_CORS_ALLOW_ORIGINS` | 允许的浏览器来源，逗号分隔 |

网关的 `local_agent` 后端还需要配置客户端可访问的 `public_base_url`、网关可访问的 `agent_api_url`、`base_dir`、签名密钥和相同的同步 Token。

## 数据与升级

- 持久化 `gateway-data`、`gateway-cache` 和 PostgreSQL 数据目录。
- 升级前备份 PostgreSQL，并记录当前正式版本号。
- 不要在未知数据库结构上随意开启破坏性迁移。
- 正式版本使用版本号或 `latest`；`nightly` 是滚动预发布，可能包含尚未形成正式版本的变更。
- 升级后检查控制台版本、Source 监听、许可证状态、数据库维护页和一次真实播放链路。

## 安全基线

1. 设置管理员密码；需要只读协作时另设观察员密码。
2. 管理端通过反向代理、VPN 或 IP 策略限制访问。
3. 数据库只允许受信网络访问，并使用独立强密码。
4. 定期轮换 Emby API Key、网盘凭据、Worker/Agent Token 和签名密钥。
5. 不要把带真实凭据的配置、日志或截图发布到公开问题单。
