# 后端配置指南

本文档详细介绍 Emby Gateway 支持的各种后端存储配置方法，包括 S3、CDN、Google Drive 和本地存储等。

## 1. 后端类型概述

Emby Gateway 支持以下几种后端类型：

| 后端类型 | 适用场景 | 优势 | 配置难度 |
|---------|---------|------|---------|
| S3 | 云存储场景 | 可靠性高、扩展性强 | 简单 |
| 阿里云CDN | 加速分发场景 | 访问速度快、全球覆盖 | 简单 |
| Google Drive | 低成本存储场景 | 存储空间大、成本低 | 复杂 |
| 本地存储 | 局域网场景 | 访问速度快、成本低 | 简单 |
| 本地代理 LocalAgent | 本地代理场景 | 访问速度快、成本低 | 中等 |
| 123网盘 Open | 123网盘存储场景 | 访问速度快 | 简单 |

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

## 3. 阿里云CDN 后端配置

### 3.1 功能说明

阿里云CDN 后端用于连接内容分发网络，加速媒体文件的访问速度，目前适配的验签方式为TypeA。

### 3.2 配置步骤

1. 点击左侧菜单中的 **Backends**
2. 点击 **添加** 按钮
3. 选择 **阿里云CDN** 作为后端类型
4. 填写以下信息：
   - **名称**：给后端起一个易于识别的名称
   - **Base URL**：阿里云CDN 的基础 URL
   - **Path Prefix**：路径前缀（可选）
   - **是否启用**：勾选启用
5. 点击 **保存**


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
- 考虑使用 GDrive Worker 来提高性能（详见 [GDrive Worker 指南](gdrive-worker.md)）

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


## 6. 123网盘 Open 后端配置

### 6.1 功能说明

123网盘 Open 后端用于连接 123 网盘存储服务，利用 123 网盘的存储空间存储和访问媒体文件。支持通过 API 获取直链或通过拼接直链两种模式。

### 6.2 前置条件

- 一个 123 网盘账号
- 创建 123 网盘开放平台应用并获取 Client ID 和 Client Secret
- 了解 123 网盘的根目录 ID（默认为 "0"）

### 6.3 配置步骤

1. 点击左侧菜单中的 **Backends**
2. 点击 **添加** 按钮
3. 选择 **123 网盘 Open** 作为后端类型
4. 填写以下信息：
   - **名称**：给后端起一个易于识别的名称
   - **Client ID**：123 网盘开放平台应用的 Client ID
   - **Client Secret**：123 网盘开放平台应用的 Client Secret
   - **Root Folder ID**：根文件夹 ID（默认为 "0"）
   - **直链模式**：选择 "API 获取直链" 或 "拼接直链 (UID + objectKey)"
   - **302 缓存有效期 (秒)**：控制网关返回的 `Cache-Control: max-age`
   - **启用 URL 鉴权**：建议开启，避免裸链被长期传播
   - **UID**：123 账号 UID（用于 URL 鉴权和拼接直链模式）
   - **签名有效期 (分钟)**：URL 鉴权的有效期
   - **Private Key**：URL 鉴权密钥
   - **objectKey→fileID 映射缓存**：建议开启，减少 API 调用
   - **映射缓存时间 (秒)**：缓存有效期
   - **是否启用**：勾选启用
5. 点击 **保存**

### 6.4 直链模式说明

123 网盘支持两种直链模式：

#### API 获取直链
- 通过调用 123 网盘 API 获取文件直链
- 适用于所有文件类型
- 需要先解析文件路径到 fileID
- 支持路径缓存，减少 API 调用

#### 拼接直链 (UID + objectKey)

> ⚠️ **123网盘有直链空间概念，如使用拼接模式，且根目录不为0，需要前面`路径映射`功能处理完成的文件地址包含直链空间路经**

例如：

从根目录开始的文件路径： 

`/媒体库文件夹/电影/熊出没·熊心归来 (2016)/熊出没·熊心归来.2016.2160p.WEB-DL.H.264.DDP.5.1.mp4`

Root Folder ID 配置了 `媒体库文件夹` 的目录id “123456”

拼接模式生成的路径会从 `媒体库文件夹` 目录开始 

`/电影/熊出没·熊心归来 (2016)/熊出没·熊心归来.2016.2160p.WEB-DL.H.264.DDP.5.1.mp4`

这个路径是不能播放的，需要在 `路径映射` 功能配置规则，在前面加上 `/媒体库文件夹`

通俗理解：拼接模式，如果根目录不是网盘的根目录，就需要在路径映射上，把它处理到网盘的根目录

- 直接通过 UID 和 objectKey 拼接直链
- 格式：`https://{uid}.v.123pan.cn/{uid}/{objectKey}`
- 减少 API 调用，性能更好
- 要求 objectKey 与 123 网盘中的实际路径一致

### 6.5 注意事项

- 123 网盘 API 有请求速率限制，已经内置访问频率限制，会遵守官方的api速率要求
- 建议开启路径缓存，减少 API 调用
- 建议开启 URL 鉴权，避免裸链被长期传播
- 对于大型媒体库，推荐使用拼接直链模式以提高性能
- 确保 Client ID 和 Client Secret 正确配置
- 确保 UID 正确配置，特别是在使用拼接直链模式时

## 总结

正确配置后端存储是 Emby Gateway 正常运行的关键。通过本文档的指南，您应该能够成功配置各种类型的后端存储，根据实际需求选择合适的存储方案，优化媒体文件的存储和访问性能。

如果您在配置过程中遇到问题，请参考本文档的常见问题与解决方案部分，或查看系统日志获取更多信息。