# 快速开始

本文档目标是 **5-10 分钟跑通最小可用链路**：服务启动、管理后台可访问、基础配置可保存，确保 Emby 媒体能够正常通过网关播放。

## 1. 前置条件

### 硬件要求
- 一台可联网的主机（Linux、Windows 或 macOS）
- 建议配置：2 核 CPU、4GB 内存、50GB 磁盘空间
- 网络：稳定的互联网连接，确保端口可访问

### 软件要求
- **Docker 与 Docker Compose**（推荐部署方式）
  - Docker 版本：20.10.0 或更高
  - Docker Compose 版本：1.29.0 或更高
- **或** 直接使用二进制文件（适用于高级用户）

### 网络要求
- 已开放管理端端口（默认 `18888`）
- 已开放 Emby Source 端口（根据配置而定）
- 如果使用云服务器，需在安全组中放行相应端口
- 能够稳定访问 Cloudflare Workers 服务（用于处理授权续期）

## 2. 方式一：Docker Compose（推荐）

### 步骤 1：准备目录

创建一个专门的目录用于存放配置和数据：

```bash
mkdir -p emby-gateway
cd emby-gateway
```

### 步骤 2：创建 docker-compose.yml 文件

在目录中创建 `docker-compose.yml` 文件，内容如下：

```yaml
services:
  postgres:
    image: postgres:16
    container_name: pg-emby-gateway
    restart: unless-stopped
    environment:
      POSTGRES_USER: gatewayuser  # 数据库用户名
      POSTGRES_PASSWORD: password # 数据库密码
      POSTGRES_DB: gateway
      TZ: Asia/Shanghai
    ports:
      - "5432:5432"
    volumes:
      - ./pg-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -h 127.0.0.1 -p 5432 -U gatewayuser -d gateway"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 10s

  emby-gateway:
    image: renzhengfei/emby-gateway:latest
    container_name: emby-gateway
    restart: unless-stopped

    # 使用 host 网络，直接连本机 5432, 新增emby source后不需要端口映射
    network_mode: host  

    # 如果不使用 host 网络，可以使用下面的端口映射, 注意新增 emby source 后需要映射端口
    # ports:
    #   - "19999:19999"
    #   - "127.0.0.1:18889:18889"
    #   - "18899:18899"

    depends_on:
      postgres:
        condition: service_healthy

    volumes:
      - ./gateway-data:/app/data
      - ./gateway-cache:/app/cache
      - /etc/localtime:/etc/localtime:ro

    environment:
      TZ: Asia/Shanghai

      # ===== Admin Server ===== 管理后台监听地址和端口
      GATEWAY_ADMIN_HOST: 0.0.0.0
      GATEWAY_ADMIN_PORT: 19999   

      # ===== Database =====
      GATEWAY_DB_DRIVER: postgres
      GATEWAY_DB_DSN: postgresql://gatewayuser:password@127.0.0.1:5432/gateway?sslmode=disable  # 数据库连接字符串(用户名/密码/地址/端口/数据库名)
```

**注意**：请将 `password` 替换为强密码。

### 步骤 3：启动服务

执行以下命令启动服务：

```bash
docker compose up -d
```

### 步骤 4：查看服务状态 与 日志

```bash
docker compose ps
docker compose logs -f
```

确保所有服务都处于 `Up` 状态，没有异常日志。

## 3. 方式二：二进制直接启动

### 步骤 1：下载二进制文件

从项目发布页面下载适合您系统的二进制文件

[github release](https://github.com/SingleJohn/emby-gateway-bin/releases)

### 步骤 2：启动服务

#### SQLite 方式（快速验证）

SQLite 方式会有日志性能问题，建议在生产环境使用 PostgreSQL 方式。

> **❗** SQLite 未经完整测试，可能会有各种奇奇怪怪的问题，适合快速体验，不建议在生产环境使用，后续可能会移除 SQLite 支持。

```bash
./emby-gateway
```

#### PostgreSQL 方式（推荐生产环境）

```bash
GATEWAY_DB_DRIVER=postgres \
GATEWAY_DB_DSN='postgresql://user:pass@127.0.0.1:5432/gateway?sslmode=disable' \
GATEWAY_ADMIN_HOST=0.0.0.0 \
GATEWAY_ADMIN_PORT=18888 \
./emby-gateway
```

**注意**：请确保 PostgreSQL 数据库已创建，并且用户有适当的权限。

## 4. 启动后验证

### 步骤 1：访问管理页面

打开浏览器，访问以下地址：

```
http://<你的IP>:18888/ui/
```

### 步骤 2：登录验证

- 默认情况下，管理后台不需要密码（首次访问）
- 如果设置了管理密码，请输入正确的密码登录

### 步骤 3：功能验证

1. 检查是否能正常加载配置页面
2. 尝试修改一个非敏感配置并保存（例如修改系统名称）
3. 确认保存成功，没有错误提示

## 5. 最小配置指南

参看[基础配置](/guide/basic-configuration.md)页面.
