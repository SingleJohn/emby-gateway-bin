# GDrive Worker 指南

这篇文档说明如何开启 GDrive Worker 模式（适合需要把 GDrive 流量从网关侧卸载出去的场景）。

## 1. 什么时候需要开启

建议开启的场景：

- GDrive 播放量大，希望减轻网关带宽压力
- 希望由 Worker 直接回源 GDrive
- 希望多个 GDrive 后端共用一套 Worker 能力

不需要开启的场景：

- 流量很小，只想先快速跑通
- 暂时不使用 GDrive 后端

## 2. 模式区别（你只要知道这个）

- **默认模式**：网关自己处理 GDrive 直链与回源
- **Worker 模式**：网关把请求转给 Worker，由 Worker 处理回源

## 3. 网关侧怎么配

进入管理后台的 GDrive Worker 设置，填写：

- `Worker Base URL`
  - 示例：`https://worker.example.com/stream`
- `Sign Key`
  - 用于签名校验，建议强随机字符串
- `Sync Token`
  - 用于同步配置，建议强随机字符串

然后到 GDrive 后端配置里，打开：

- `启用 Worker 代理`

## 4. Worker 侧怎么配

Worker 侧需要和网关保持一致的关键项：

- 网关外网地址（供 Worker 拉配置）
- `WORKER_SYNC_TOKEN`（与网关 Sync Token 一致）
- `SIGN_KEY`（与网关 Sign Key 一致）

可选项：

- 配置缓存时长
- 绑定 KV 做缓存（性能更稳）

## 5. 最小验证方法

1. 开启 GDrive Worker 模式后发起播放
2. 在后台观察到请求已走 Worker 相关链路
3. 播放可连续进行，无频繁中断

## 6. 常见问题

### 开启后仍走旧链路

- 检查 GDrive 后端里是否真的打开了“启用 Worker 代理”

### 偶发无法播放

- 优先检查 Sign Key / Sync Token 两端是否一致
- 再检查 Worker 的外网连通性与缓存配置

### 多个 GDrive 后端是否能共用

- 可以，共用同一 Worker 是常见做法

## 7. 截图补充位（后续可直接替换）

- GDrive Worker 设置页：`docs/assets/images/03-backend-config.png`
- 播放成功统计页：`docs/assets/images/06-redirect-stats.png`
