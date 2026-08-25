# 快速开始

本页使用 PostgreSQL 和 Docker Compose，在约 10 分钟内完成服务启动、后台登录和最小播放链路配置。

## 前置条件

- Docker 20.10+ 和 Docker Compose v2
- 一台可被 Emby 和客户端访问的主机
- 一个未被占用的管理端口，示例统一使用 `19999`
- 至少一个可用的存储后端

生产环境推荐 PostgreSQL。SQLite 适合临时体验，不建议承载长期请求日志。

## Docker Compose 部署

创建工作目录：

```bash
mkdir -p emby-gateway
cd emby-gateway
```

创建 `docker-compose.yml`：

```yaml
services:
  postgres:
    image: postgres:16
    container_name: pg-emby-gateway
    restart: unless-stopped
    environment:
      POSTGRES_USER: gatewayuser
      POSTGRES_PASSWORD: replace-with-a-strong-password
      POSTGRES_DB: gateway
      TZ: Asia/Shanghai
    ports:
      - "5432:5432"
    volumes:
      - ./pg-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gatewayuser -d gateway"]
      interval: 5s
      timeout: 3s
      retries: 10

  emby-gateway:
    image: renzhengfei/emby-gateway:latest
    container_name: emby-gateway
    restart: unless-stopped
    network_mode: host
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./gateway-data:/app/data
      - ./gateway-cache:/app/cache
      - /etc/localtime:/etc/localtime:ro
    environment:
      TZ: Asia/Shanghai
      GATEWAY_ADMIN_HOST: 0.0.0.0
      GATEWAY_ADMIN_PORT: 19999
      GATEWAY_DB_DRIVER: postgres
      GATEWAY_DB_DSN: postgresql://gatewayuser:replace-with-a-strong-password@127.0.0.1:5432/gateway?sslmode=disable
```

> `network_mode: host` 仅适用于 Linux。使用 bridge 网络时，需要同时调整数据库地址，并显式映射管理端口和每个 Source 监听端口。

启动并查看状态：

```bash
docker compose up -d
docker compose ps
docker compose logs -f emby-gateway
```

## 登录后台

示例访问地址：

```text
http://<服务器IP>:19999/ui/
```

未配置管理员密码和观察员密码时，后台不要求登录。首次进入后请在「系统 → 网关配置」设置管理员密码。

## 最小播放配置

按依赖顺序完成以下对象：

1. **Emby 源**：填写监听地址、监听端口、上游 Emby 地址和 API Key。
2. **后端**：选择存储类型并完成认证配置。
3. **资源池**：选择主后端和可选备后端。
4. **路径映射**：需要时把 Emby 真实路径转换为后端 object key。
5. **路由**：在 Source 中按真实媒体路径绑定映射集和资源池。

保存后无需重启。请确认防火墙、云安全组和 Docker 网络已放行 Source 监听端口。

## 验证链路

1. 在 Emby 客户端播放一个测试媒体。
2. 打开「观测中心 → 流量分析 → 302 链路」。
3. 确认请求命中了预期路由、资源池和后端。
4. 若没有生成 302，查看同页请求详情和「日志与事件」。

继续阅读 [基础配置](/guide/basic-configuration)、[后端配置](/guide/backend-configuration) 和 [路由规则和资源池](/guide/routing-and-pool)。

## 二进制启动

正式版本与滚动 nightly 构建均发布在 [GitHub Releases](https://github.com/SingleJohn/emby-gateway-bin/releases)。生产环境优先使用明确版本号的正式 Release；`nightly` 会随 `main` 更新，适合验证最新修复。

PostgreSQL 示例：

```bash
GATEWAY_DB_DRIVER=postgres \
GATEWAY_DB_DSN='postgresql://user:pass@127.0.0.1:5432/gateway?sslmode=disable' \
GATEWAY_ADMIN_HOST=0.0.0.0 \
GATEWAY_ADMIN_PORT=19999 \
./emby-s3-gateway
```
