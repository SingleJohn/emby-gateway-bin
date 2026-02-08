# 通知系统

Feiyue Emby Gateway 提供了灵活的通知系统，当前用于发送安全告警通知与手动测试通知。本文档将详细介绍通知系统的配置和使用方法。

## 通知系统架构

通知系统基于配置驱动架构，支持多种通知渠道：

- **通知渠道**：配置多个通知渠道，如企业微信 Webhook、钉钉机器人、Telegram Bot、Bark、Server酱
- **通知发送**：通过 HTTP 客户端发送通知
- **集成接口**：与安全告警系统集成，发送告警通知
- **测试功能**：支持发送测试通知，验证配置是否正确

## 启用通知系统

**操作步骤**：

1. 登录 Feiyue Emby Gateway 管理界面
2. 点击左侧菜单中的「通知中心」
3. 开启「启用通知系统」开关
4. 点击页面底部的「保存」按钮

## 通知渠道配置

### 渠道类型

Feiyue Emby Gateway 支持以下通知渠道类型：

- **wecom_webhook**：企业微信通知（通过企业微信机器人）
- **dingtalk**：钉钉通知
- **telegram_bot**：Telegram 机器人通知
- **bark**：Bark 通知（iOS 设备通知应用）
- **serverchan**：Server酱通知

### 配置示例

#### 企业微信通知配置

**操作步骤**：

1. 登录 Feiyue Emby Gateway 管理界面
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

1. 登录 Feiyue Emby Gateway 管理界面
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

1. 登录 Feiyue Emby Gateway 管理界面
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

1. 登录 Feiyue Emby Gateway 管理界面
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

1. 登录 Feiyue Emby Gateway 管理界面
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

## 通知内容

通知内容由系统自动生成，包含以下信息：

- **通知标题**：根据告警类型自动生成，如「安全告警：访问频率」
- **通知内容**：包含告警详情，如来源服务器、时间范围、统计维度、具体数据等

系统会根据不同类型的告警自动生成合适的通知内容，确保您能够清晰了解告警的具体情况。

## 测试通知

在 Web UI 中，可以通过「发送测试 / 测试此通道」功能验证通知渠道配置是否正确：

**操作步骤**：

1. 登录 Feiyue Emby Gateway 管理界面
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

在安全告警规则中，指定要使用的通知渠道，系统会根据配置自动发送告警通知。