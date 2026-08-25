# 页面导览

以下截图来自 `v1.8.11` 线上部署。控制台和观测页保留汇总 KPI 与趋势曲线；用户、IP、媒体路径、地址、端口、策略参数和凭据不进入文档，安全与配置页的实际参数已遮挡。

## 控制台

控制台提供系统当前状态摘要，并引导进入观测中心查看明细。

![控制台](/screenshots/overview.png)

## 观测中心

### 实时看板

展示当前播放会话、并发限制状态和短时并发趋势。

![实时看板](/screenshots/observability-live.png)

### 流量分析

整合请求日志、流量趋势和 302 路由链路。

![流量分析](/screenshots/observability-traffic.png)

### 媒体与用户

从媒体交付和用户使用两个角度查看播放行为。

![媒体与用户](/screenshots/observability-media.png)

### 访问来源

查看客户端 IP 的地域、运营商和网络类型分布。

![访问来源](/screenshots/observability-access.png)

### 日志与事件

在安全拦截和控制台日志之间切换，排障时可按同一时间范围对照。

![日志与事件](/screenshots/observability-logs.png)

## STRM 任务

任务配置与最近运行分为两个视图。

![STRM 任务](/screenshots/strm-tasks.png)

## 安全规则

安全页集中管理接口防护、真实 IP、登录失败防护、并发播放和访问规则。

![安全规则，实际策略值已遮挡](/screenshots/security-redacted.png)

## 网关配置

网关配置包含管理端、观察员、观测保留、IP 查询、GDrive Worker 和数据库维护。

![网关配置，实际配置值已遮挡](/screenshots/config-redacted.png)
