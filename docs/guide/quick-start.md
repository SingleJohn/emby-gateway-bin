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
- 已开放管理端端口（默认建议 `18888`）
- 已开放 Emby Source 端口（根据配置而定）
- 如果使用云服务器，需在安全组中放行相应端口

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

**注意**：请将 `change_me_to_a_strong_password` 替换为强密码。

### 步骤 3：启动服务

执行以下命令启动服务：

```bash
docker compose up -d
```

### 步骤 4：查看服务状态

```bash
docker compose ps
```

确保所有服务都处于 `Up` 状态。

## 3. 方式二：二进制直接启动（可选）

### 步骤 1：下载二进制文件

从项目发布页面下载适合您系统的二进制文件。

### 步骤 2：启动服务

下文统一使用 `emby-gateway` 表示网关可执行文件（部分发行包文件名可能是 `emby-s3-gateway`）。

#### SQLite 方式（快速验证）

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
http://<你的IP>:18888/ui/index.html
```

### 步骤 2：登录验证

- 默认情况下，管理后台可能不需要密码（首次访问）
- 如果设置了管理密码，请输入正确的密码登录

### 步骤 3：功能验证

1. 检查是否能正常加载配置页面
2. 尝试修改一个非敏感配置并保存（例如修改系统名称）
3. 确认保存成功，没有错误提示

## 5. 最小配置指南

进入管理后台后，按以下顺序完成初始配置：

### 步骤 1：添加 Emby Source

1. 点击左侧菜单中的 **Emby Sources**
2. 点击 **添加** 按钮
3. 填写以下信息：
   - **名称**：给 Source 起一个易于识别的名称
   - **监听端口**：设置一个未被占用的端口
   - **上游 Emby 地址**：填写您的 Emby 服务器地址
4. 点击 **保存**

### 步骤 2：添加后端存储

1. 点击左侧菜单中的 **Backends**
2. 点击 **添加** 按钮
3. 选择后端类型（例如 S3、CDN、Google Drive 或本地存储）
4. 填写相应的配置信息：
   - **S3**：填写 Endpoint、Bucket、Access Key、Secret Key 等
   - **CDN**：填写 CDN 基础 URL
   - **Google Drive**：配置相关认证信息
   - **本地存储**：通过 Local Agent 配置
5. 点击 **保存**

### 步骤 3：创建资源池

1. 点击左侧菜单中的 **资源池**
2. 点击 **添加** 按钮
3. 填写 **名称**
4. 在 **后端** 部分，添加至少一个主后端
5. 可选：添加备后端以提高可用性
6. 点击 **保存**

### 步骤 4：配置路由规则

1. 点击左侧菜单中的 **路由规则**
2. 点击 **添加** 按钮
3. 填写以下信息：
   - **名称**：规则名称
   - **路径前缀**：例如 `/movies` 或 `/tv`
   - **资源池**：选择之前创建的资源池
   - **优先级**：设置规则优先级（数字越小优先级越高）
4. 点击 **保存**
5. 建议添加一条默认规则（路径前缀为 `/`）作为兜底

### 步骤 5：验证配置

1. 保存所有配置后，重启网关服务以确保配置生效
2. 在 Emby 客户端中添加新的媒体库，指向网关的 Source 地址
3. 尝试播放一个媒体文件，检查是否能正常播放
4. 查看网关日志，确认请求是否正确路由到后端存储

## 6. 常见问题与解决方案

### 问题 1：端口不是 18888

**原因**：
- 可能已加载历史数据库配置，数据库中的 Admin 端口会生效
- 端口可能被其他服务占用

**解决方案**：
- 启动时显式指定 `GATEWAY_ADMIN_PORT` 或 `-admin-port` 参数
- 检查端口占用情况，选择一个未被占用的端口

### 问题 2：设置了管理密码后无法进入后台

**原因**：
- 密码输入错误
- 浏览器缓存问题

**解决方案**：
- 确认输入的是当前保存的管理密码
- 清理浏览器缓存或使用无痕模式重新登录
- 如果忘记密码，可能需要重置数据库

### 问题 3：容器内无法连接 Postgres

**原因**：
- 网络配置问题
- 数据库连接字符串错误

**解决方案**：
- 在 Compose 内部网络，DSN 主机应写服务名（如 `postgres`），不要写 `127.0.0.1`
- 检查数据库服务是否正常运行
- 确认数据库用户名和密码正确

### 问题 4：播放请求失败

**原因**：
- 后端配置错误
- 路由规则未匹配
- 路径映射错误

**解决方案**：
- 检查后端配置是否正确，测试后端连接
- 检查路由规则是否正确匹配请求路径
- 检查路径映射是否正确配置
- 查看网关日志，了解具体错误信息

### 问题 5：管理后台加载缓慢

**原因**：
- 服务器资源不足
- 数据库性能问题

**解决方案**：
- 增加服务器资源（CPU、内存）
- 对于生产环境，建议使用 PostgreSQL 数据库
- 定期清理日志和临时文件

## 7. 下一步操作

完成最小配置后，您可以：

1. **优化配置**：根据实际使用情况调整路由规则和后端配置
2. **增加监控**：配置日志收集和监控系统
3. **扩展存储**：添加更多后端存储，实现存储分层
4. **高可用部署**：配置多个网关实例，实现负载均衡

## 8. 截图参考

页面截图位置与命名规则已统一放在：

- [系统页面截图规划](/guide/ui-screenshot-plan)
