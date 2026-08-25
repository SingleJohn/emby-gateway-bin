# 后端配置

后端负责把映射后的 object key 转换成客户端可访问的 URL。后端创建后还需要加入资源池，并由 Source 路由引用，才能参与播放链路。

## 支持类型

| 类型 | 交付方式 | 典型用途 |
|---|---|---|
| S3 对象存储 | 预签名 302 | AWS S3、MinIO、OSS、COS 等兼容服务 |
| 阿里云 CDN | Type A 签名 302 | 已有 CDN 域名的媒体分发 |
| Google Drive | 网关代理或 Worker | Google Drive 文件访问 |
| 本地存储 | 签名直链 | 网关与媒体在同一主机 |
| Local Agent | Agent 签名直链 | 媒体位于另一台主机 |
| 123 网盘 Open | API 直链或拼接直链 | 123 开放平台 |
| 115 Open | 302 或 Relay | 115 开放接口 |
| 115 Cookie | 302 或 Relay | Cookie 凭据访问 |
| 115 分流聚合 | 302 或 Relay | 主盘与动态附盘分流 |

115 系列配置较多，参见 [115 后端指南](/guide/backend-115)。

## 通用操作

进入「流量与路由 → 资源池与后端」：

1. 新增后端并选择类型。
2. 填写名称和类型专属字段。
3. 保持后端启用并保存配置。
4. 能执行连接测试的类型先完成测试。
5. 创建资源池并选择该后端为主后端或备后端。

保存后后端配置会热更新，无需重启。

## 后端独立密码

管理员可以给单个后端设置独立密码。后端被锁定后：

- 普通后台会隐藏其敏感配置。
- 已经登录后台的用户需要输入该后端密码才能解锁配置。
- 解锁状态只在当前浏览器会话中保存，刷新页面后需要重新解锁。

独立密码不能直接登录管理后台。它用于缩小后端配置可见范围，不替代全局管理员密码，也不会改变播放链路。

## S3 对象存储

必需字段：

- Endpoint、Region、Bucket
- Access Key、Secret Key
- 签名有效期

常用选项：

- **Force Path Style**：MinIO 等服务常需要开启。
- **Key Prefix**：桶内媒体统一位于某个前缀时使用。

建议保存前使用 S3 连接测试，确认 Endpoint、凭据和 Bucket 均可访问。

## 阿里云 CDN

配置 Base URL、是否转义路径，以及 Type A 鉴权参数。CDN 后端不负责目录扫描，STRM 任务不能把 CDN 当作媒体目录来源。

可使用页面的 CDN 签名测试核对 object key 生成结果。

## Google Drive

主要字段：

- Client ID、Client Secret、Refresh Token
- 可选 Base URL、Drive ID 和共享盘选项
- 直链有效期与 object key 缓存
- 是否使用 GDrive Worker

启用 Worker 时，还需在「系统 → 网关配置」设置 Worker Base URL、Sign Key 和 Sync Token，并确保 Worker 侧使用相同密钥。详见 [GDrive Worker](/guide/gdrive-worker)。

## 本地存储

- **Base Dir**：媒体在网关主机上的根目录。
- **Base URL**：客户端访问网关本地直链的公开地址。
- **Sign Secret**：签名密钥。
- **Link TTL**：临时链接有效期。

Base Dir 必须由网关进程读取；Base URL 必须从客户端网络访问。

## Local Agent

- **Base Dir**：媒体在 Agent 主机上的根目录。
- **Public Base URL**：客户端访问 Agent 的地址。
- **Agent API URL**：网关访问 Agent 内部 API 的地址。
- **Sign Secret**：网关与 Agent 一致的签名密钥。
- **Sync Token**：与 Agent 启动参数一致。

网关会周期同步后端元信息到 Agent。Public Base URL 和 Agent API URL 面向不同网络角色，不应混用。

## 123 网盘 Open

### API 获取直链

通过 Client ID、Client Secret 和 Root Folder ID 查询文件并获取直链。可启用 object key 到 file ID 缓存以减少 API 调用。

### 拼接直链

使用 UID 和 object key 直接拼接地址。可配置：

- 自定义拼接直链 Base URL
- 隐藏 UID
- URL 鉴权、Private Key 和有效期

如果 Root Folder ID 不是网盘根目录，路径映射必须补齐直链空间所需的目录前缀。自定义 Base URL 只影响拼接模式。

## 选择主备后端

资源池只支持一个主后端和一个可选备后端。两者必须能处理相同的映射后 object key。

主后端在生成 URL 阶段失败时才会尝试备后端；客户端收到 302 后访问目标失败，不会回到网关触发第二次选择。

## 配置检查清单

- 后端已启用并成功保存。
- 凭据字段没有多余空格且仍有效。
- 路径映射结果与后端根目录一致。
- 资源池已引用后端，Source 路由已引用资源池。
- 客户端可以访问最终 Base URL 或 `Location` 域名。
- 敏感字段未出现在公开日志、截图或问题单中。
