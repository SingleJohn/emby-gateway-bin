# emby-gateway-bin

emby代理网关

## 特点
- 多emby反向代理
- 多路由规则映射（可按优先级、前缀、正则匹配）
- 多存储服务重定向适配
- 全链路日志审计
- 自定义安全规则（可基于IP、header、访问频率等多维度自定义）
- 安全告警与通知

## 启动参数与环境变量

默认启动（SQLite）：
> SQLite启动方式，会有日志性能问题，建议使用Postgres，后期可能会完全移除SQLite支持
```bash
./emby-gateway
```

指定参数启动（Postgres）：

```bash
./emby-gateway \
  -db-driver postgres \
  -db-dsn 'postgresql://user:pass@127.0.0.1:5432/gateway?sslmode=disable' \
  -admin-host 0.0.0.0 \
  -admin-port 19999
```

仅使用环境变量启动（Postgres）：

```bash
GATEWAY_DB_DRIVER=postgres \
GATEWAY_DB_DSN='postgresql://user:pass@127.0.0.1:5432/gateway?sslmode=disable' \
GATEWAY_ADMIN_HOST=0.0.0.0 \
GATEWAY_ADMIN_PORT=19999 \
./emby-gateway
```

### 命令行参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| `-db` | `data/gateway.db` | 兼容参数：可传 SQLite 文件路径，也可传 DSN |
| `-db-driver` | 自动推断 | `sqlite` 或 `postgres` |
| `-db-dsn` | 空（或来自环境变量） | 数据库 DSN；设置后优先于 `-db` |
| `-db-allow-destructive` | `false`（或来自环境变量） | 允许破坏性迁移（drop/recreate） |
| `-admin-host` | 空（或来自环境变量） | 覆盖数据库中的管理端监听地址 |
| `-admin-port` | `19999`（或来自环境变量） | 覆盖数据库中的管理端端口；`>0` 才生效 |
| `-license-server-url` | 空（或来自环境变量） | 许可证服务器地址 |
| `-license-token` | 空（或来自环境变量） | 请求许可证使用的 Bearer Token |
| `-license-public-key` | 空（或来自环境变量） | 许可证公钥 |

### 环境变量

| 环境变量 | 对应参数/行为 | 说明 |
|---|---|---|
| `GATEWAY_DB_DRIVER` | `-db-driver` 默认值 | `sqlite` / `postgres` |
| `GATEWAY_DB_DSN` | `-db-dsn` 默认值 | Postgres DSN |
| `GATEWAY_DB_ALLOW_DESTRUCTIVE_MIGRATIONS` | `-db-allow-destructive` 默认值 | `1`/`true` 视为开启 |
| `GATEWAY_ADMIN_HOST` | `-admin-host` 默认值 | 管理端地址覆盖 |
| `GATEWAY_ADMIN_PORT` | `-admin-port` 默认值 | 管理端端口覆盖 |
| `GATEWAY_LICENSE_SERVER_URL` | `-license-server-url` 默认值 | 许可证服务地址 |
| `GATEWAY_LICENSE_SERVER_TOKEN` | `-license-token` 默认值 | 请求许可证使用的 Bearer Token |
| `GATEWAY_LICENSE_PUBLIC_KEY` | `-license-public-key` 默认值 | 许可证公钥 |

### 优先级与规则（重要）

- 参数优先级：命令行参数 > 环境变量 > 程序内默认值。
- `-db-dsn` 非空时，会覆盖 `-db`；如果 `-db-dsn` 为空但 `-db` 看起来像 DSN，也会按 DSN 处理。
- `-db-driver` 为空时自动推断：有 DSN 则 `postgres`，否则 `sqlite`。
- `-admin-host` 仅在非空时覆盖配置；`-admin-port` 仅在 `>0` 时覆盖配置。


## local-agent 启动与使用

`local-agent` 用于部署在文件所在机器（如 B 机），供网关（如 A 机的 `emby-gateway`）同步本地目录配置并提供文件流式访问。

### 启动

你给的命令可以直接用：

```bash
./local-agent-linux-amd64 --port 19090 --sync-token test123
```

说明：
- `--host` 默认 `0.0.0.0`（未传时自动使用）
- `--port` 必填（或用 `LOCAL_AGENT_PORT`）
- `--sync-token` 必填（或用 `LOCAL_AGENT_SYNC_TOKEN`）
- `--cors-allow-origins` 默认 `*`，支持逗号分隔多个来源

等价环境变量启动示例：

```bash
LOCAL_AGENT_PORT=19090 \
LOCAL_AGENT_SYNC_TOKEN=test123 \
./local-agent-linux-amd64
```

可用环境变量：
- `LOCAL_AGENT_HOST`
- `LOCAL_AGENT_PORT`
- `LOCAL_AGENT_SYNC_TOKEN`
- `LOCAL_AGENT_CORS_ALLOW_ORIGINS`（如 `https://a.example.com,https://emby.example.com`）

### 在 go-gateway 中如何接入

在后端里新增一个 `type=local_agent`，并配置以下字段（缺一不可）：
- `base_dir`：B 机本地目录（例如 `/mnt/media`）
- `public_base_url`：对客户端可访问的 agent 地址（例如 `https://b.example.com`）
- `agent_api_url`：A 机访问 agent 内部接口的地址（例如 `http://10.0.0.2:19090`）
- `sign_secret`：签名密钥（A/B 两端一致）
- `sync_token`：同步鉴权 token（需与 agent 启动时一致）
- `link_ttl_seconds`：可选，直链有效期（秒）

### 使用流程（简版）

1. 启动 `local-agent`（B 机）。
2. 在 `go-gateway` 配置 `local_agent` 后端（A 机）并保存。
3. `go-gateway` 会在启动时和后续周期性（约 45 秒）向 agent 的 `/internal/sync` 同步后端配置。
4. 客户端访问时，网关会下发 `public_base_url/stream/local/{token}` 的临时直链，由 agent 实际回源本地文件。






