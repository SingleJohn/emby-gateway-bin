# GDrive Worker 配置说明

本文档说明如何在网关与 Cloudflare Workers 之间启用 GDrive Worker 代理，以及各配置项的作用与对应关系。

## 1. 功能概览

- 默认模式（旧逻辑）：网关生成 302，跳转到网关自身的 `/stream/gdrive/<token>`，由网关代理拉取 Google Drive。
- Worker 模式（新增）：网关生成标准签名 token，302 跳转到 Worker，由 Worker 直连 Google Drive。
- Worker 模式通过**每个 GDrive backend 的开关**启用，未开启时仍走旧逻辑。

## 2. 网关侧配置（UI 入口）

### 2.1 全局配置（网关设置 -> GDrive Worker）

| 字段 | 作用 | 说明 |
| --- | --- | --- |
| Worker Base URL | 网关 302 的目标地址 | 必须包含 `/stream`，例如 `https://worker.example.com/stream`，最终请求为 `/stream/gdrive/<token>` |
| Sign Key | token 签名/验签密钥 | 网关签名，Worker 校验，必须与 Worker 的 `SIGN_KEY` 一致 |
| Sync Token | Worker 拉取配置的 Bearer Token | 必须与 Worker 的 `WORKER_SYNC_TOKEN` 一致 |

### 2.2 GDrive 后端配置（后端资源池 -> GDrive backend）

新增开关：**启用 Worker 代理**

- 开启：302 跳转到 Worker Base URL
- 关闭：使用旧逻辑（网关 `/stream/gdrive/<token>`）

> 提示：`Base URL` 仅在**未启用 Worker**时生效。

## 3. Worker 侧配置

`gdrive-worker.js` 需要以下环境变量：

### 必需
- `GATEWAY_BASE_URL`
  - 网关外网地址，例如 `https://gateway.example.com`
  - Worker 会请求：`/internal/worker/gdrive-config`

- `WORKER_SYNC_TOKEN`
  - 对应网关 `gdrive_worker.sync_token`
  - 以 `Authorization: Bearer <token>` 方式访问配置同步接口

- `SIGN_KEY`
  - 对应网关 `gdrive_worker.sign_key`
  - 用于校验网关签发的 `payload.sig` token

### 可选
- `CONFIG_TTL_SECONDS`
  - 配置同步缓存时间（秒），默认 300

- `GDRIVE_KV`（KV 绑定）
  - 用于缓存配置与 access token
  - 不绑定也可运行，但缓存仅在 Worker 实例内有效

## 4. 对应关系速查

| 网关配置 | Worker 环境变量 | 说明 |
| --- | --- | --- |
| `gdrive_worker.base_url` | - | 网关 302 的目标地址 |
| `gdrive_worker.sign_key` | `SIGN_KEY` | token 签名/验签密钥 |
| `gdrive_worker.sync_token` | `WORKER_SYNC_TOKEN` | 配置同步鉴权 |
| - | `GATEWAY_BASE_URL` | Worker 访问网关的外网地址 |

## 5. 典型配置流程

1) 网关 UI -> 网关设置 -> GDrive Worker：
   - 填 `Worker Base URL` / `Sign Key` / `Sync Token`

2) 网关 UI -> 后端资源池 -> GDrive backend：
   - 开启 “启用 Worker 代理”

3) Worker 环境变量：
   - `GATEWAY_BASE_URL` 设置为网关外网地址
   - `WORKER_SYNC_TOKEN` 与 `SIGN_KEY` 与网关保持一致
   - 可选绑定 KV、设置 `CONFIG_TTL_SECONDS`

4) 测试：
   - Emby 播放请求应 302 到 `https://worker.example.com/stream/gdrive/<token>`
   - Worker 正常回源 GDrive 即完成

## 6. 注意事项

- **Sign Key 与 Sync Token 必须保密**，建议使用强随机值且两者不要复用。
- Worker 模式开启后，网关不再承担 GDrive 流量，带宽转移到 Worker。
- 多个 GDrive backend 可共用一个 Worker：token 中包含 `backend_id`，Worker 会根据 backend_id 取对应配置。
- Worker 拉取配置仅包含启用了 `use_worker` 的 GDrive backend。

