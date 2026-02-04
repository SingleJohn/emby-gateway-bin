# 快速开始

本文档目标是 **5-10 分钟跑通最小可用链路**：服务启动、管理后台可访问、基础配置可保存。

## 1. 前置条件

- 一台可联网的 Linux 主机（建议 2C4G 起步）
- 已安装 Docker 与 Docker Compose
- 已开放管理端端口（默认建议 `18888`）

## 2. 方式一：Docker Compose（推荐）

在空目录创建 `docker-compose.yml`：

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

## 3. 方式二：二进制直接启动（可选）

下文统一使用 `emby-gateway` 表示网关可执行文件（部分发行包文件名可能是 `emby-s3-gateway`）。

SQLite（快速验证）：

```bash
./emby-gateway
```

Postgres（推荐）：

```bash
GATEWAY_DB_DRIVER=postgres \
GATEWAY_DB_DSN='postgresql://user:pass@127.0.0.1:5432/gateway?sslmode=disable' \
GATEWAY_ADMIN_HOST=0.0.0.0 \
GATEWAY_ADMIN_PORT=18888 \
./emby-gateway
```

## 4. 启动后验证

1. 打开管理页面：`http://<你的IP>:18888/ui/index.html`
2. 可以正常登录并看到配置页面
3. 随便修改一个非敏感配置并保存成功（例如名称字段）

## 5. 最小配置建议

进入管理后台后，按下面顺序完成初始配置：

1. 添加至少 1 个 Emby Source
2. 添加至少 1 个后端（S3/CDN/GDrive/Local Agent 等）
3. 绑定资源池与路由规则
4. 保存配置并发起一次播放请求验证重定向链路

## 6. 常见问题

### 端口不是 18888

- 你可能已加载历史数据库配置；数据库中的 Admin 端口会生效
- 启动时显式指定 `GATEWAY_ADMIN_PORT` 或 `-admin-port` 可覆盖

### 设置了管理密码后无法进入后台

- 确认输入的是当前保存的管理密码
- 清理浏览器缓存或无痕模式后重新登录

### 容器内无法连接 Postgres

- 在 Compose 内部网络，DSN 主机应写服务名（如 `postgres`），不要写 `127.0.0.1`

## 7. 截图补充位（后续可直接替换）

- 后台登录页：`docs/assets/images/01-login-page.png`
- Source 配置页：`docs/assets/images/02-source-config.png`
