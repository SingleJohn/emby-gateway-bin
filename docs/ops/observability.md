# 可观测性

本文档说明网关内置日志与统计能力，帮助你快速定位“请求去了哪、为什么失败”。

## 1. 可观测数据分层

### 文件日志（本地）

- `logs/error.log`：程序错误与 panic 日志
- `logs/admin-access.log`：管理端访问日志
- `logs/proxy-<source_id>-access.log`：Source 访问日志

### 数据库日志（结构化）

- `request_logs`：请求明细（路径、状态码、耗时、重定向后端等）
- `daily_stats`：按天聚合统计（请求量、302 数、4xx/5xx、流量、时延）

## 2. 关键字段（request_logs）

常用分析字段：

- 请求维度：`tag`、`source_id`、`client_ip`、`method`、`path`、`query`
- 结果维度：`status`、`latency_ms`、`bytes_in`、`bytes_out`
- 重定向维度：`redirect_backend`、`redirect_source`、`redirect_location`
- 路由维度：`route_id`、`pool_id`
- 用户维度：`emby_user_id`、`emby_user_name`

安全处理：

- Query 中敏感参数（如 `api_key`、`token`）会做脱敏
- 敏感 Header（`Authorization`、`Cookie`、含 token/key 的键）会脱敏

## 3. 管理后台可看什么

| 功能 | 你能看到什么 |
|---|---|
| 请求日志 | 每次访问的来源、路径、状态码、耗时 |
| 重定向统计 | 各后端命中占比、高频用户、高频来源 IP |
| 错误日志 | 最近异常、启动失败、后端初始化失败 |
| 上游健康状态 | 每个 Source 对应上游 Emby 是否正常 |

## 4. 普通用户建议关注的 4 个信号

1. 最近 10 分钟是否有大量失败请求（4xx/5xx）
2. 重定向成功率是否突然下降
3. 某个后端命中是否突然归零（可能已失效）
4. 上游健康是否长期异常

## 5. 留存与写入参数（按需）

可在配置中调整（`observability`）：

- `request_log_retention_days`：请求日志留存天数（默认 30）
- `stat_retention_days`：统计留存天数（默认 180）
- `db_batch_size`：写库批量大小（默认 200）
- `db_flush_interval_ms`：写库刷新间隔（默认 1000ms）

系统会周期性清理过期数据。

## 6. 告警建议（实践）

建议接入外部监控平台并设置：

1. `5xx 比例` 持续升高
2. `302 成功率` 短时间显著下降
3. 某后端 `redirect_backend` 占比突降（可能后端失效）
4. `emby 健康检查` 连续失败
