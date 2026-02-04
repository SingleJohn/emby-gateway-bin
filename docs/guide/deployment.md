# 部署指南

本文档给出可落地的部署方式与生产建议，目标是稳定运行、可维护、可排障。

## 1. 部署模式

```mermaid
flowchart TB
    Internet[公网用户] --> RP[反向代理/HTTPS]
    RP --> GW[emby-gateway]
    GW --> DB[(PostgreSQL)]

    subgraph Optional[可选组件]
        LA[Local Agent]
        WK[GDrive Worker]
    end

    GW --> LA
    GW --> WK

    GW --> OB[(日志与统计)]
```

拓扑图源文件：`docs/assets/diagrams/04-deployment-topology.mmd`

### 单机模式（推荐起步）

- 组件：`emby-gateway + PostgreSQL`
- 适用：个人/小团队、先跑通业务链路
- 优点：部署简单，故障域小

### 分离模式（推荐生产）

- 组件：`emby-gateway` 与 `PostgreSQL` 分机部署
- 适用：生产环境、需要独立扩容数据库
- 建议：数据库启用定期备份与监控

## 2. 端口与网络

| 项目 | 默认值 | 说明 |
|---|---|---|
| 管理端口 | `18888` | 管理后台访问端口 |
| Source 监听端口 | 按配置 | 每个启用的 Source 独立监听 |
| Stream 前缀 | `/stream` | 可按 Source 自定义 `stream_path_prefix` |

说明：
- 管理端监听地址/端口可由 `GATEWAY_ADMIN_HOST`、`GATEWAY_ADMIN_PORT` 覆盖
- Source 端口由业务配置决定，新增 Source 后通常需要重启进程使监听生效

## 3. Docker Compose 参考

```yaml
services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: gatewayuser
      POSTGRES_PASSWORD: change_me_to_a_strong_password
      POSTGRES_DB: gateway
    volumes:
      - ./pg-data:/var/lib/postgresql/data

  emby-gateway:
    image: ghcr.io/zyd16888/emby-gateway:latest
    restart: unless-stopped
    depends_on:
      - postgres
    ports:
      - "18888:18888"
    volumes:
      - ./gateway-data:/app/data
    environment:
      GATEWAY_DB_DRIVER: postgres
      GATEWAY_DB_DSN: postgresql://gatewayuser:change_me_to_a_strong_password@postgres:5432/gateway?sslmode=disable
      GATEWAY_ADMIN_HOST: 0.0.0.0
      GATEWAY_ADMIN_PORT: 18888
```

启动：

```bash
docker compose up -d
```

## 4. 反向代理与 HTTPS（生产必做）

建议在网关前增加 Nginx/Caddy：

- 对外只暴露 443（HTTPS）
- 管理面板可挂子路径或独立子域
- 配置合理的 `X-Forwarded-Proto` / `X-Forwarded-Host`

如果启用 `admin.path_prefix`，必须满足：

- 只允许单段路径（不能包含 `/`）
- 长度不超过 64
- 仅允许字母、数字、`-`、`_`

## 5. 安全基线（最低要求）

1. 使用强密码和随机密钥（数据库密码、Token、Sign Secret）
2. 管理面板不要直接裸露公网（至少加反代鉴权/IP 白名单）
3. 定期轮换敏感配置（数据库账号、Worker/Agent 同步 Token）
4. 持久化目录做好权限控制（`gateway-data`、`pg-data`）

## 6. 发布前检查清单

- [ ] 管理端可访问：`/ui/index.html`
- [ ] 可以正常登录并保存配置
- [ ] 至少一个 Source、一个后端、一个资源池已配置并可重定向
- [ ] 日志目录可写（`logs/error.log`、`logs/admin-access.log`）
- [ ] 数据库备份策略已启用

## 7. go-gateway 启动参数与环境变量

以下内容与根目录 `README.md` 保持一致，基于 `go-gateway/main.go` 与 `go-gateway/v2_app.go` 的实际实现。

### 7.1 启动示例

默认启动（SQLite）：

```bash
./emby-s3-gateway
```

命令行参数启动（PostgreSQL）：

```bash
./emby-s3-gateway \
  -db-driver postgres \
  -db-dsn 'postgresql://user:pass@127.0.0.1:5432/gateway?sslmode=disable' \
  -admin-host 0.0.0.0 \
  -admin-port 19999
```

仅使用环境变量启动（PostgreSQL）：

```bash
GATEWAY_DB_DRIVER=postgres \
GATEWAY_DB_DSN='postgresql://user:pass@127.0.0.1:5432/gateway?sslmode=disable' \
GATEWAY_ADMIN_HOST=0.0.0.0 \
GATEWAY_ADMIN_PORT=19999 \
./emby-s3-gateway
```

### 7.2 命令行参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| `-config` | `config.yaml` | 已废弃，当前版本会忽略该参数 |
| `-db` | `data/gateway.db` | 兼容参数：可传 SQLite 文件路径，也可传 DSN |
| `-db-driver` | 自动推断 | `sqlite` 或 `postgres` |
| `-db-dsn` | 空（或来自环境变量） | 数据库 DSN；设置后优先于 `-db` |
| `-db-allow-destructive` | `false`（或来自环境变量） | 允许破坏性迁移（drop/recreate） |
| `-admin-host` | 空（或来自环境变量） | 覆盖数据库中的管理端监听地址 |
| `-admin-port` | `0`（或来自环境变量） | 覆盖数据库中的管理端端口；`>0` 才生效 |
| `-license-server-url` | 空（或来自环境变量） | 许可证服务器地址 |
| `-license-token` | 空（或来自环境变量） | 许可证 Bearer Token |
| `-license-public-key` | 空（或来自环境变量） | 许可证公钥内容（base64 或 `ssh-ed25519`） |
| `-license-dir` | 空（或来自环境变量） | 本地许可证目录（最终默认 `data/license`） |
| `-license-renew-seconds` | `0`（或来自环境变量） | 许可证续期周期（秒），`>0` 才覆盖配置 |
| `-license-rollback-tolerance-seconds` | `0`（或来自环境变量） | 许可证时间回拨容忍（秒），`>0` 才覆盖配置 |
| `-license-activate-timeout-seconds` | `0`（或来自环境变量） | 许可证激活请求超时（秒），`>0` 才覆盖配置 |

### 7.3 环境变量

| 环境变量 | 对应参数/行为 | 说明 |
|---|---|---|
| `GATEWAY_DB_DRIVER` | `-db-driver` 默认值 | `sqlite` / `postgres` |
| `GATEWAY_DB_DSN` | `-db-dsn` 默认值 | PostgreSQL DSN |
| `DATABASE_URL` | `-db-dsn` 兜底默认值 | 仅当 `GATEWAY_DB_DSN` 为空时使用 |
| `GATEWAY_DB_ALLOW_DESTRUCTIVE_MIGRATIONS` | `-db-allow-destructive` 默认值 | `1` / `true` 视为开启 |
| `GATEWAY_ADMIN_HOST` | `-admin-host` 默认值 | 管理端地址覆盖 |
| `GATEWAY_ADMIN_PORT` | `-admin-port` 默认值 | 管理端端口覆盖 |
| `GATEWAY_LICENSE_SERVER_URL` | `-license-server-url` 默认值 | 许可证服务地址 |
| `GATEWAY_LICENSE_SERVER_TOKEN` | `-license-token` 默认值 | 许可证 token（优先） |
| `GATEWAY_LICENSE_TOKEN` | `-license-token` 默认值 | 当 `GATEWAY_LICENSE_SERVER_TOKEN` 为空时使用 |
| `GATEWAY_LICENSE_PUBLIC_KEY` | `-license-public-key` 默认值 | 许可证公钥 |
| `GATEWAY_LICENSE_DIR` | `-license-dir` 默认值 | 许可证本地目录 |
| `GATEWAY_LICENSE_RENEW_SECONDS` | `-license-renew-seconds` 默认值 | 续期周期（秒） |
| `GATEWAY_LICENSE_ROLLBACK_TOLERANCE_SECONDS` | `-license-rollback-tolerance-seconds` 默认值 | 回拨容忍（秒） |
| `GATEWAY_LICENSE_ACTIVATE_TIMEOUT_SECONDS` | `-license-activate-timeout-seconds` 默认值 | 激活超时（秒） |

### 7.4 优先级与生效规则（重要）

- 参数优先级：命令行参数 > 环境变量 > 程序内默认值
- `-db-dsn` 非空时覆盖 `-db`；若 `-db-dsn` 为空但 `-db` 看起来像 DSN，也会按 DSN 处理
- `-db-driver` 为空时自动推断：有 DSN 则 `postgres`，否则 `sqlite`
- `-admin-host` 仅在非空时覆盖配置；`-admin-port` 仅在 `>0` 时覆盖配置
- `-license-*-seconds` 仅在 `>0` 时覆盖配置
- `-config` 为兼容保留参数，不参与当前配置加载

### 7.5 Local Agent（可选）环境变量

| 环境变量 | 说明 |
|---|---|
| `LOCAL_AGENT_HOST` | 监听地址（默认 `0.0.0.0`） |
| `LOCAL_AGENT_PORT` | 监听端口（必填） |
| `LOCAL_AGENT_SYNC_TOKEN` | 同步鉴权 token（必填） |
| `LOCAL_AGENT_CORS_ALLOW_ORIGINS` | 允许跨域来源，逗号分隔 |

## 8. 截图规划

页面截图与命名规则统一见：

- [系统页面截图规划](/guide/ui-screenshot-plan)
