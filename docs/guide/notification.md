# 通知系统

Emby Gateway 提供了灵活的通知系统，当前用于发送安全告警通知与手动测试通知。本文档将详细介绍通知系统的配置和使用方法。

## 通知系统架构

通知系统基于配置驱动架构，支持多种通知渠道：

- **通知渠道**：配置多个通知渠道，如企业微信 Webhook、钉钉机器人、Telegram Bot、Bark、Server酱
- **通知发送**：通过 HTTP 客户端发送通知
- **集成接口**：与安全告警系统集成，发送告警通知
- **测试功能**：支持发送测试通知，验证配置是否正确

## 启用通知系统

**操作步骤**：

1. 登录 Emby Gateway 管理界面
2. 点击左侧菜单中的「通知中心」
3. 开启「启用通知系统」开关
4. 点击页面底部的「保存」按钮

## 通知渠道配置

### 渠道类型

Emby Gateway 支持以下通知渠道类型：

- **wecom_webhook**：企业微信通知（通过企业微信机器人）
- **dingtalk**：钉钉通知
- **telegram_bot**：Telegram 机器人通知
- **bark**：Bark 通知（iOS 设备通知应用）
- **serverchan**：Server酱通知

### 配置示例

#### 企业微信通知配置

**操作步骤**：

1. 登录 Emby Gateway 管理界面
2. 点击左侧菜单中的「通知中心」
3. 点击「添加通知渠道」按钮
4. 填写配置信息：
   - **渠道 ID**：wecom_ops（自定义唯一 ID）
   - **渠道名称**：企业微信通知
   - **启用**：开启开关
   - **渠道类型**：wecom_webhook
   - **Key**：填写企业微信机器人的密钥，例如 `your_key`
5. 点击「保存」按钮

#### 钉钉通知配置

**操作步骤**：

1. 登录 Emby Gateway 管理界面
2. 点击左侧菜单中的「通知中心」
3. 点击「添加通知渠道」按钮
4. 填写配置信息：
   - **渠道 ID**：dingtalk_oncall（自定义唯一 ID）
   - **渠道名称**：钉钉通知
   - **启用**：开启开关
   - **渠道类型**：dingtalk
   - **Token**：填写钉钉机器人的 Token
   - **Secret**：填写钉钉机器人的 Secret
5. 点击「保存」按钮

#### Telegram 机器人通知配置

**操作步骤**：

1. 登录 Emby Gateway 管理界面
2. 点击左侧菜单中的「通知中心」
3. 点击「添加通知渠道」按钮
4. 填写配置信息：
   - **渠道 ID**：tg_alerts（自定义唯一 ID）
   - **渠道名称**：Telegram 通知
   - **启用**：开启开关
   - **渠道类型**：telegram_bot
   - **Bot Token**：填写 Telegram 机器人的 Token
   - **Chat ID**：填写接收通知的聊天 ID
   - **API Base**：（可选）填写 Telegram API 的基础 URL
   - **Proxy URL**：（可选）填写代理服务器 URL
5. 点击「保存」按钮

#### Bark 通知配置

**操作步骤**：

1. 登录 Emby Gateway 管理界面
2. 点击左侧菜单中的「通知中心」
3. 点击「添加通知渠道」按钮
4. 填写配置信息：
   - **渠道 ID**：bark_ios（自定义唯一 ID）
   - **渠道名称**：Bark 通知
   - **启用**：开启开关
   - **渠道类型**：bark
   - **Token**：填写 Bark 的设备 Token
   - **Push**：（可选）填写 Bark 服务器的 URL
5. 点击「保存」按钮

#### Server酱通知配置

**操作步骤**：

1. 登录 Emby Gateway 管理界面
2. 点击左侧菜单中的「通知中心」
3. 点击「添加通知渠道」按钮
4. 填写配置信息：
   - **渠道 ID**：sc_ops（自定义唯一 ID）
   - **渠道名称**：Server酱通知
   - **启用**：开启开关
   - **渠道类型**：serverchan
   - **Key**：填写 Server酱 的 Key
5. 点击「保存」按钮

### 配置参数说明

- **id**：渠道唯一标识
- **name**：渠道名称（用于显示）
- **enabled**：是否启用该渠道
- **type**：渠道类型

### 各渠道配置参数

#### wecom_webhook（企业微信）
- **WeComWebhook.Key**：企业微信机器人的密钥

#### dingtalk（钉钉）
- **DingTalk.Token**：钉钉机器人的 Token
- **DingTalk.Secret**：钉钉机器人的 Secret

#### telegram_bot（Telegram）
- **TelegramBot.BotToken**：Telegram 机器人的 Token
- **TelegramBot.ChatID**：接收通知的聊天 ID
- **TelegramBot.APIBase**：（可选）Telegram API 的基础 URL
- **TelegramBot.ProxyURL**：（可选）代理服务器 URL，支持以下格式：
  - HTTP 代理：`http://proxy_host:proxy_port`
  - HTTPS 代理：`https://proxy_host:proxy_port`
  - SOCKS5 代理：`socks5://proxy_host:proxy_port`
  - SOCKS4 代理：`socks4://proxy_host:proxy_port`

#### bark（Bark）
- **Bark.Token**：Bark 的设备 Token
- **Bark.Push**：（可选）Bark 服务器的 URL

#### serverchan（Server酱）
- **ServerChan.Key**：Server酱 的 Key

## 通知模板

**注意**：Emby Gateway 的通知模板是系统硬编码的，不可通过配置文件或用户界面修改。

通知内容由系统自动生成，包含以下信息：

- **通知标题**：根据告警类型自动生成，如「安全告警：访问频率」
- **通知内容**：包含告警详情，如来源服务器、时间范围、统计维度、具体数据等

系统会根据不同类型的告警自动生成合适的通知内容，确保您能够清晰了解告警的具体情况。

## 测试通知

在 Web UI 中，可以通过「发送测试 / 测试此通道」功能验证通知渠道配置是否正确：

**操作步骤**：

1. 登录 Emby Gateway 管理界面
2. 点击左侧菜单中的「通知中心」
3. 选择测试方式：
   - 方式 A：顶部「发送测试」先选择通道后发送
   - 方式 B：在通道卡片点击「测试此通道」
4. 检查是否收到测试通知

**提示**：测试通知可以帮助您验证通知渠道配置是否正确，确保在发生安全告警时能够及时收到通知。

## 与安全告警集成

通知系统与安全告警系统紧密集成，用于发送安全告警通知：

### 告警通知流程

1. 安全告警系统检测到异常行为
2. 触发告警规则
3. 通过配置的通知渠道发送告警
4. 通知内容包含告警类型、触发条件等详细信息

### 配置告警通知渠道

在安全告警规则中，指定要使用的通知渠道：

```json
{
  "id": "alert_rule_1",
  "name": "安全告警",
  "enabled": true,
  "type": "user_frequency",
  "channels": ["wecom_ops", "dingtalk_oncall"],
  "user_frequency": {
    "max_requests": 200
  }
}
```

- **channels**：指定要使用的通知渠道 ID 列表

## 通知内容格式

### 安全告警通知

安全告警通知包含以下内容：

- **告警类型**：访问频率、身份漂移或失败率
- **统计维度**：用户 ID 或 IP 地址
- **统计窗口**：告警统计的时间范围
- **触发条件**：具体的触发原因和阈值
- **相关信息**：请求数、IP 数、UA 数等详细信息

### 测试通知（手动触发）

测试通知由「通知中心」页面手动触发，便于验证渠道可用性：

- **通知标题**：默认 `通知测试`
- **通知内容**：默认 `这是一条来自 Emby Gateway 的测试消息。`

## 最佳实践

### 渠道配置建议

1. **多渠道配置**：配置多个通知渠道，提高通知可靠性
2. **优先级设置**：为不同类型的通知设置不同的渠道
3. **通道分组**：按值班、运维、安全等场景拆分通道
4. **测试验证**：定期测试通知渠道，确保其正常工作

### 通知内容建议

1. **简明扼要**：通知内容要简明扼要，突出重点
2. **信息完整**：包含足够的信息，便于理解和处理
3. **格式规范**：使用一致的格式，提高可读性
4. **敏感信息**：避免在通知中包含敏感信息

### 集成建议

1. **与监控系统集成**：将通知系统与其他监控系统集成
2. **自动化响应**：根据通知内容实现自动化响应
3. **告警聚合**：对相似告警进行聚合，减少通知数量
4. **通知优先级**：为不同级别的通知设置不同的优先级

## 故障排查

如果遇到通知系统相关问题，请参考 [排障指南](../ops/troubleshooting.md#84-通知系统故障排查) 中的相关部分。

## 配置示例

### 完整的通知配置

**操作步骤**：

1. 登录 Emby Gateway 管理界面
2. 点击左侧菜单中的「通知中心」
3. 开启「启用通知系统」开关
4. 添加以下通知渠道：

   **渠道 1：企业微信通知**
   - 渠道 ID：wecom_ops
   - 渠道名称：企业微信通知
   - 启用：开启开关
   - 渠道类型：wecom_webhook
   - Key：`your_key`

   **渠道 2：钉钉通知**
   - 渠道 ID：dingtalk_oncall
   - 渠道名称：钉钉通知
   - 启用：开启开关
   - 渠道类型：dingtalk
   - Token：`your_dingtalk_token`
   - Secret：`your_dingtalk_secret`

   **渠道 3：Telegram 通知**
   - 渠道 ID：tg_alerts
   - 渠道名称：Telegram 通知
   - 启用：开启开关
   - 渠道类型：telegram_bot
   - Bot Token：`your_telegram_bot_token`
   - Chat ID：`your_chat_id`

   **渠道 4：Bark 通知**
   - 渠道 ID：bark_ios
   - 渠道名称：Bark 通知
   - 启用：开启开关
   - 渠道类型：bark
   - Token：`your_bark_token`

   **渠道 5：Server酱通知**
   - 渠道 ID：sc_ops
   - 渠道名称：Server酱通知
   - 启用：开启开关
   - 渠道类型：serverchan
   - Key：`your_serverchan_key`

5. 点击页面底部的「保存」按钮

**配置完成后**，您可以通过顶部「发送测试」或每个渠道的「测试此通道」验证通知配置是否正确。

## 总结

通知系统是 Emby Gateway 的重要组成部分，通过配置合适的通知渠道，可以及时接收安全告警并快速验证通道可用性。建议根据实际需求配置多个通知渠道，提高通知的可靠性和及时性。
