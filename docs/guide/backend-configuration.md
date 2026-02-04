# 后端配置指南

本文档详细介绍 Emby Gateway 支持的各种后端存储配置方法，包括 S3、CDN、Google Drive 和本地存储等。

## 1. 后端类型概述

Emby Gateway 支持以下几种后端类型：

| 后端类型 | 适用场景 | 优势 | 配置难度 |
|---------|---------|------|---------|
| S3 | 云存储场景 | 可靠性高、扩展性强 | 中等 |
| CDN | 加速分发场景 | 访问速度快、全球覆盖 | 简单 |
| Google Drive | 低成本存储场景 | 存储空间大、成本低 | 复杂 |
| 本地存储 | 局域网场景 | 访问速度快、成本低 | 中等 |

## 2. S3 后端配置

### 2.1 功能说明

S3 后端用于连接各种兼容 S3 协议的对象存储服务，如 Amazon S3、MinIO、阿里云 OSS、腾讯云 COS 等。

### 2.2 配置步骤

1. 点击左侧菜单中的 **Backends**
2. 点击 **添加** 按钮
3. 选择 **S3** 作为后端类型
4. 填写以下信息：
   - **名称**：给后端起一个易于识别的名称
   - **Endpoint**：S3 服务的端点 URL
   - **Bucket**：存储桶名称
   - **Access Key**：访问密钥
   - **Secret Key**：秘密密钥
   - **Region**：区域（可选）
   - **Path Style**：是否使用路径风格（可选）
   - **Base Path**：基础路径（可选）
   - **是否启用**：勾选启用
5. 点击 **保存**

### 2.3 常见 S3 服务配置示例

#### Amazon S3

```
Endpoint: https://s3.amazonaws.com
Bucket: your-bucket-name
Region: us-east-1
```

#### MinIO

```
Endpoint: http://minio-server:9000
Bucket: your-bucket-name
Path Style: true
```

#### 阿里云 OSS

```
Endpoint: https://oss-cn-hangzhou.aliyuncs.com
Bucket: your-bucket-name
Region: oss-cn-hangzhou
```

#### 腾讯云 COS

```
Endpoint: https://cos.ap-guangzhou.myqcloud.com
Bucket: your-bucket-name
Region: ap-guangzhou
```

### 2.4 注意事项

- 确保 Access Key 和 Secret Key 有足够的权限
- 确保存储桶已正确创建并设置了适当的权限
- 对于私有存储桶，需要确保网关能够正确认证
- 对于使用路径风格的服务，需要勾选 **Path Style** 选项

## 3. CDN 后端配置

### 3.1 功能说明

CDN 后端用于连接内容分发网络，加速媒体文件的访问速度。

### 3.2 配置步骤

1. 点击左侧菜单中的 **Backends**
2. 点击 **添加** 按钮
3. 选择 **CDN** 作为后端类型
4. 填写以下信息：
   - **名称**：给后端起一个易于识别的名称
   - **Base URL**：CDN 的基础 URL
   - **Path Prefix**：路径前缀（可选）
   - **是否启用**：勾选启用
5. 点击 **保存**

### 3.3 配置示例

#### 通用 CDN

```
Base URL: https://cdn.example.com
Path Prefix: /media
```

#### Cloudflare CDN

```
Base URL: https://example.com
Path Prefix: /cdn-cgi/access/logging
```

### 3.4 注意事项

- 确保 CDN 已正确配置并能够访问媒体文件
- 确保 CDN 的缓存策略适合媒体文件的访问模式
- 对于需要认证的 CDN，可能需要额外的配置

## 4. Google Drive 后端配置

### 4.1 功能说明

Google Drive 后端用于连接 Google Drive 存储，利用 Google Drive 的存储空间存储和访问媒体文件。

### 4.2 前置条件

- 一个 Google 账号
- 创建 Google Cloud 项目并启用 Google Drive API
- 创建 OAuth 2.0 客户端 ID
- 获取授权码和刷新令牌（或使用 rclone 的令牌）

### 4.3 配置步骤

1. 点击左侧菜单中的 **Backends**
2. 点击 **添加** 按钮
3. 选择 **Google Drive** 作为后端类型
4. 填写以下信息：
   - **名称**：给后端起一个易于识别的名称
   - **Client ID**：OAuth 2.0 客户端 ID
   - **Client Secret**：OAuth 2.0 客户端密钥
   - **Refresh Token**：刷新令牌
   - **Root Folder ID**：根文件夹 ID（可选）
   - **是否启用**：勾选启用
   - **Use Worker**：是否使用 Worker 模式（可选，提高性能）
5. 点击 **保存**

### 4.4 获取授权码和刷新令牌

#### 方法一：手动获取

1. 访问 Google Cloud Console
2. 创建新项目或选择现有项目
3. 启用 Google Drive API
4. 创建 OAuth 2.0 客户端 ID，选择 **桌面应用** 类型
5. 复制 Client ID 和 Client Secret
6. 访问以下 URL 并登录 Google 账号：
   ```
   https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/drive.readonly&response_type=code
   ```
7. 复制授权码
8. 使用授权码获取刷新令牌：
   ```bash
   curl -X POST "https://oauth2.googleapis.com/token" \
     -d "code=YOUR_AUTH_CODE&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&redirect_uri=urn:ietf:wg:oauth:2.0:oob&grant_type=authorization_code"
   ```
9. 从响应中复制刷新令牌

#### 方法二：使用 rclone 的令牌

1. 安装并配置 rclone
2. 运行以下命令创建 Google Drive 远程：
   ```bash
   rclone config
   ```
3. 按照提示完成 Google Drive 授权
4. 查看 rclone 配置文件（通常位于 `~/.config/rclone/rclone.conf`）
5. 从配置文件中复制 `client_id`、`client_secret` 和 `refresh_token` 到 Emby Gateway 配置中

### 4.5 Worker 模式配置

Worker 模式可以提高 Google Drive 后端的性能，特别是在处理大文件时。

#### 配置步骤

1. 确保已安装并配置了 GDrive Worker
2. 在 Google Drive 后端配置中，勾选 **Use Worker** 选项
3. 在系统配置中，设置 GDrive Worker 的 Base URL 和 Sign Key
4. 保存配置并重启服务

#### Worker 模式优势

- 减少网关的直接 API 调用
- 提高大文件的下载速度
- 减轻网关的负载

### 4.6 注意事项

- Google Drive API 有请求速率限制，请注意控制访问频率
- 建议使用专门的 Google 账号存储媒体文件
- 对于大型媒体库，强烈建议使用 Worker 模式
- Google Drive 后端不是真正的 302 重定向，而是通过网关转发媒体数据
- 考虑使用 GDrive Worker 来提高性能（详见 GDrive Worker 指南）

## 5. 本地存储后端配置

本地存储后端有两种实现方式：本地直接访问和 Local Agent 代理。

### 5.1 本地直接访问

#### 功能说明

本地直接访问通过直接读取本地文件系统来提供媒体文件访问，适用于网关和存储在同一机器的场景。

#### 配置步骤

1. 点击左侧菜单中的 **Backends**
2. 点击 **添加** 按钮
3. 选择 **Local** 作为后端类型
4. 填写以下信息：
   - **名称**：给后端起一个易于识别的名称
   - **Base Dir**：本地目录路径（例如 `/mnt/media`）
   - **Base URL**：网关的基础 URL（例如 `http://localhost:18888`）
   - **Sign Secret**：签名密钥
   - **Link TTL Seconds**：可选，直链有效期（秒）
   - **是否启用**：勾选启用
5. 点击 **保存**

#### 注意事项

- 适用于网关和存储在同一机器的场景
- 配置简单，访问速度快
- 需要确保网关有访问本地文件系统的权限

### 5.2 Local Agent 代理

#### 功能说明

Local Agent 代理通过部署在文件所在机器的 Agent 服务来提供媒体文件访问，适用于存储在其他机器的场景。

#### 前置条件

- 在文件所在机器上部署 Local Agent
- 确保 Local Agent 服务正常运行

#### 部署 Local Agent

1. 下载 Local Agent 可执行文件
2. 在文件所在机器上运行以下命令：
   ```bash
   ./local-agent-linux-amd64 --port 19090 --sync-token test123
   ```

   或使用环境变量：
   ```bash
   LOCAL_AGENT_PORT=19090 \
   LOCAL_AGENT_SYNC_TOKEN=test123 \
   ./local-agent-linux-amd64
   ```

#### 配置步骤

1. 点击左侧菜单中的 **Backends**
2. 点击 **添加** 按钮
3. 选择 **Local Agent** 作为后端类型
4. 填写以下信息：
   - **名称**：给后端起一个易于识别的名称
   - **Base Dir**：本地目录路径（例如 `/mnt/media`）
   - **Public Base URL**：对客户端可访问的 agent 地址（例如 `https://b.example.com`）
   - **Agent API URL**：网关访问 agent 内部接口的地址（例如 `http://10.0.0.2:19090`）
   - **Sign Secret**：签名密钥（两端一致）
   - **Sync Token**：同步鉴权 token（需与 agent 启动时一致）
   - **Link TTL Seconds**：可选，直链有效期（秒）
   - **是否启用**：勾选启用
5. 点击 **保存**

#### 注意事项

- 适用于存储在其他机器的场景
- 可跨网络访问，灵活性高
- 确保 Local Agent 服务正常运行
- 确保网关能够访问 Local Agent 的 API 地址
- 确保客户端能够访问 Local Agent 的 Public Base URL
- 确保签名密钥和同步 token 在两端保持一致

## 6. 后端测试与验证

### 6.1 测试后端连接

1. 在后端列表中找到要测试的后端
2. 点击 **测试** 按钮
3. 查看测试结果

### 6.2 验证后端访问

1. 添加后端到资源池
2. 配置路由规则指向该资源池
3. 发起播放请求
4. 查看网关日志，确认请求是否正确路由到后端

## 7. 后端管理最佳实践

### 7.1 后端命名规范

- 使用描述性名称，如 `s3-primary`、`cdn-backup` 等
- 包含后端类型和用途，便于识别

### 7.2 后端配置备份

- 定期导出后端配置
- 保存配置文件的备份

### 7.3 后端监控

- 定期检查后端健康状态
- 监控后端访问延迟和错误率
- 设置后端故障告警

### 7.4 后端优化

- 对于频繁访问的内容，考虑使用 CDN 加速
- 对于大文件，考虑使用 S3 等对象存储
- 对于局域网内的内容，使用本地存储提高访问速度

## 8. 常见问题与解决方案

### 8.1 S3 后端连接失败

**原因**：
- Endpoint 配置错误
- Access Key 或 Secret Key 错误
- Bucket 不存在或无权限
- 网络连接问题

**解决方案**：
- 检查 Endpoint 是否正确
- 验证 Access Key 和 Secret Key
- 确认 Bucket 存在且有正确的权限
- 检查网络连接

### 8.2 Google Drive 后端授权失败

**原因**：
- Client ID 或 Client Secret 错误
- Refresh Token 过期或无效
- Google Drive API 未启用
- 权限不足

**解决方案**：
- 检查 Client ID 和 Client Secret
- 重新获取授权码和刷新令牌
- 确保启用了 Google Drive API
- 确保授权时授予了足够的权限

### 8.3 本地存储后端访问失败

**原因**：
- Local Agent 未运行
- Agent API URL 配置错误
- Sync Token 不匹配
- 本地文件权限问题

**解决方案**：
- 确保 Local Agent 服务正常运行
- 检查 Agent API URL 是否正确
- 确认 Sync Token 在两端一致
- 检查本地文件权限

### 8.4 CDN 后端访问速度慢

**原因**：
- CDN 缓存未命中
- CDN 节点问题
- 源站速度慢

**解决方案**：
- 预热 CDN 缓存
- 联系 CDN 服务提供商检查节点状态
- 优化源站性能

## 9. 高级配置选项

### 9.1 后端优先级

在资源池中，可以设置后端的优先级，决定请求的分发顺序：

- **主后端**：优先使用的后端
- **备后端**：主后端失败时使用的后端

### 9.2 后端权重

在资源池中，可以设置后端的权重，决定请求的分发比例（适用于负载均衡场景）。

### 9.3 后端健康检查

系统会定期检查后端的健康状态，自动将不健康的后端从资源池中移除。

### 9.4 后端访问控制

可以通过路径映射和路由规则，控制哪些请求可以访问特定的后端。

## 10. 总结

正确配置后端存储是 Emby Gateway 正常运行的关键。通过本文档的指南，您应该能够成功配置各种类型的后端存储，根据实际需求选择合适的存储方案，优化媒体文件的存储和访问性能。

如果您在配置过程中遇到问题，请参考本文档的常见问题与解决方案部分，或查看系统日志获取更多信息。