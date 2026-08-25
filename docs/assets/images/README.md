# 页面截图维护说明

页面截图统一放在 `docs/public/screenshots/`，Markdown 通过 `/screenshots/<name>.png` 引用。

维护规则：

1. 优先使用固定页面名称，例如 `overview.png`、`observability-traffic.png`。
2. 汇总 KPI 和趋势曲线可以保留真实数据，增强页面可信度。
3. 用户名、IP、媒体路径、Source/后端名称、内部地址、端口和错误详情必须遮挡。
4. Token、API Key、Cookie、密码、签名参数和完整 URL 不得进入截图。
5. 安全规则和网关配置页只展示布局，实际参数值统一遮挡。
6. 更新截图后逐张按原始分辨率复核，并运行文档构建检查引用。
