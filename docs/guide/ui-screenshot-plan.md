# 系统页面截图规划

本文用于统一规划管理端截图位置。你截图后按约定文件名放到 `docs/public/screenshots/`，文档可直接通过 `/screenshots/...` 引用。

## 1. 截图规范

- 分辨率建议：`1920x1080`（桌面端）
- 浏览器缩放：`100%`
- 主题建议：浅色主题（必要时可补一张深色）
- 脱敏要求：域名、IP、密钥、Token、用户名等必须打码
- 文件格式：`PNG`

## 2. 命名规则

统一格式：`ui-序号-页面-内容.png`

示例：`ui-03-backends-list.png`

## 3. 截图清单（建议）

| 编号 | 截图内容 | 建议文件名 | 建议放置位置 |
|---|---|---|---|
| 01 | 登录页 | `ui-01-login.png` | `guide/quick-start.md`（启动后验证） |
| 02 | 概览页（状态卡片） | `ui-02-overview.png` | `guide/management-ui.md`（概览页面） |
| 03 | Emby 源列表/编辑页 | `ui-03-emby-sources.png` | `guide/management-ui.md`（Emby Sources） |
| 04 | 后端管理页（列表） | `ui-04-backends-list.png` | `guide/backend-configuration.md`（概览） |
| 05 | 后端管理页（编辑表单） | `ui-05-backends-form.png` | `guide/backend-configuration.md`（配置步骤） |
| 06 | 路径规则集页 | `ui-06-path-rule-sets.png` | `guide/routing-and-pool.md`（路径映射） |
| 07 | 资源池页 | `ui-07-resource-pools.png` | `guide/routing-and-pool.md`（资源池） |
| 08 | 安全规则页 | `ui-08-security-rules.png` | `guide/security.md`（规则配置） |
| 09 | 安全告警页（规则配置） | `ui-09-security-alerts.png` | `guide/security-alerts.md`（告警规则） |
| 10 | 通知中心页 | `ui-10-notify-center.png` | `guide/notification.md`（通知渠道） |
| 11 | 可观测性页（请求日志） | `ui-11-observability-logs.png` | `ops/observability.md`（日志） |
| 12 | 可观测性页（统计图表） | `ui-12-observability-stats.png` | `ops/observability.md`（指标/趋势） |

## 4. 放图示例

```md
![通知中心页面](/screenshots/ui-10-notify-center.png)
```

