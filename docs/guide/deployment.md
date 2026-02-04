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

## 7. 截图补充位（后续可直接替换）

- 后台登录页：`docs/assets/images/01-login-page.png`
- 部署后运行状态页：`docs/assets/images/06-redirect-stats.png`
