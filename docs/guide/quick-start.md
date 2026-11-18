---
title: 快速开始
description: 用 Docker Compose 部署网关，设置管理密码，配出第一条 302 直链播放链路并验证。
---

# 快速开始

本页用 Docker Compose 部署网关，然后配出第一条播放链路：播放器连接网关，视频由存储直接提供。第一次使用时按顺序做下来即可；需要 PostgreSQL、二进制部署或反向代理时，再看 [部署与升级](/guide/deployment)。

## 准备

- 一台 Linux 服务器，装好 Docker 和 Docker Compose v2。
- 一个正在运行的 Emby 服务器，以及它的 API Key（在 Emby 控制台的「API 密钥」里创建）。
- 至少一个存储后端的访问凭据，例如 S3 的 Access Key，或网盘的开放平台授权。
- 一个授权码，用于在网关里激活授权。
- 知道媒体文件在 Emby 里的路径，例如 `/mnt/media/movies/阿凡达 (2009)/阿凡达.mkv`。

## 部署

新建一个目录，在里面创建 `docker-compose.yml`。下面是最小配置，数据库使用内置的 SQLite，不需要额外服务：

```yaml
services:
  emby-gateway:
    image: renzhengfei/emby-gateway:latest
    container_name: emby-gateway
    restart: unless-stopped
    network_mode: host
    volumes:
      - ./gateway-data:/app/data
      - ./gateway-cache:/app/cache
      - /etc/localtime:/etc/localtime:ro
    environment:
      TZ: Asia/Shanghai
      GATEWAY_ADMIN_HOST: 0.0.0.0
      GATEWAY_ADMIN_PORT: 19999
```

| 配置 | 说明 |
|---|---|
| `./gateway-data:/app/data` | 数据库 `gateway.db` 和授权文件都在这里，必须持久化 |
| `./gateway-cache:/app/cache` | 磁盘缓存（Emby 网页资源与图片）。缓存不在 `data` 目录里，需要单独挂载，丢失不影响配置 |
| `GATEWAY_ADMIN_PORT: 19999` | 管理端口。不设置时使用配置里的端口，默认 `18888` |

::: tip 管理端口 19999 与 18888 的关系
网关的管理端口默认是 `18888`，保存在数据库配置里，可以在 <span class="ui-path">系统 › 系统设置</span> 的「Admin Port」里修改。设置了 `GATEWAY_ADMIN_PORT`（或启动参数 `-admin-port`）后，每次启动都以它为准，配置里的值会被覆盖。本文示例统一使用 `19999`。
:::

::: tip 为什么用 host 网络
每新增一个 Emby 源，网关就会多监听一个端口。用 `network_mode: host` 时新端口直接可用，不用每次改 compose 文件。host 网络只在 Linux 上有效；其他系统或不想用 host 网络时，见 [部署与升级](/guide/deployment#端口规划)。
:::

### 启动

```bash
docker compose up -d
docker compose logs -f emby-gateway
```

日志里出现管理端开始监听的记录、没有报错，就可以打开管理界面了。

## 打开管理界面

浏览器访问 `http://服务器地址:19999/`，会自动跳到管理界面。

刚部署时还没有设置管理密码，管理界面**不需要登录**就能进入，任何能访问这个端口的人都能修改配置。所以下面的第一步就是设置密码。

## 完成第一条播放链路

一条播放链路由下面几样东西组成，按顺序创建，后一步会用到前一步的结果：

| 顺序 | 对象 | 作用 |
|---|---|---|
| 1 | 管理密码 | 让管理界面需要登录 |
| 2 | 授权 | 未激活时不能保存 Emby 源和存储后端，也不会返回直链 |
| 3 | 存储后端 | 媒体实际存放的地方，以及访问它的凭据 |
| 4 | 资源池 | 选定主用后端，可选一个备用后端 |
| 5 | 路径映射 | 把 Emby 里的路径换成存储里的路径 |
| 6 | Emby 源与路由规则 | 播放器的连接入口，以及哪些路径走哪个资源池 |

各对象的含义见 [核心概念](/guide/concepts)。

### 1. 设置管理密码

::: danger 部署后第一件事
没有设置管理密码时，网关不启用登录认证。请在继续之前完成这一步。
:::

1. 打开 <span class="ui-path">系统 › 系统设置</span>。
2. 在「全局设置」里填写「Admin Password（留空禁用鉴权）」。
3. 点击页面底部的「保存」。
4. 之后管理界面会跳到登录页，用刚设置的密码登录。

需要给别人只读权限时，可以再设置「Viewer Password（合作方只读）」，见 [管理界面基础](/guide/management-ui#登录与角色)。

### 2. 激活授权

1. 打开 <span class="ui-path">系统 › 授权</span>。
2. 在「激活授权」里填写「授权码」，点击「激活」。

激活后网关会在后台自动续租，需要保持网关能访问授权服务。详见 [授权](/guide/license)。

### 3. 新建存储后端

1. 打开 <span class="ui-path">接入与路由 › 存储后端</span>，点击「新建」。
2. 在「新建存储后端 · 选择类型」里选择存储类型，每种类型下面有一句适用场景说明。
3. 起一个名字（只用于在界面上区分，ID 会自动生成），点击「创建并填写配置」。
4. 在右侧详情里填写该类型需要的字段，例如 S3 的 Endpoint、Bucket 和密钥。
5. 点击页面底部的「保存」。

<Shot name="backend-wizard" alt="新建存储后端向导：按分组列出各存储类型" />

各类型的字段说明见 [后端总览](/guide/backend-configuration)。

### 4. 新建资源池

1. 打开 <span class="ui-path">接入与路由 › 资源池</span>，点击「新建资源池」。
2. 「主用后端」选第 3 步创建的后端。另有一份内容相同的存储时，可以在「备用后端」里选上它，主用失败时会自动切换。
3. 点击「保存」。

此时卡片底部会显示「尚未被任何路由使用，不会参与播放分发」，第 6 步配好路由后就会变成被路由使用。详见 [资源池与故障切换](/guide/routing-and-pool)。

### 5. 配置路径映射

Emby 里的路径和存储里的路径通常不一样，需要一条映射把前者换成后者。例如：

| Emby 里的路径 | 存储里的路径 |
|---|---|
| `/mnt/media/movies/阿凡达.mkv` | `/movies/阿凡达.mkv` |

1. 打开 <span class="ui-path">接入与路由 › 路径映射</span>，点击「新建规则集」。
2. 点击「添加映射」，「Emby 中的路径前缀」填 `/mnt/media/movies`，「存储中的路径前缀」填 `/movies`。
3. 在下方「映射测试」里输入一个完整的 Emby 路径，确认显示「命中第 1 条」以及转换后的路径正确。
4. 点击「保存」。

前缀按整段目录匹配，区分大小写。详见 [路径映射](/guide/path-mapping)。

### 6. 新建 Emby 源和路由规则

1. 打开 <span class="ui-path">接入与路由 › Emby 源</span>，点击「新建 Emby 源」。
2. 在「监听配置」里确认「监听端口」。新建时会自动填一个未被占用的端口（从 `18889` 开始），播放器之后连接的就是这个端口。
3. 在「Emby 上游」里填写 Host（如 `http://127.0.0.1:8096`）和「API Key」。
4. 在「路由规则」里点击「新增规则」：
   - 点「Prefix」添加匹配前缀 `/mnt/media/movies`；
   - 「映射集」选第 5 步的规则集；
   - 「资源池」选第 4 步的资源池。
5. 在「匹配测试」里输入 `/mnt/media/movies/阿凡达 (2009)/阿凡达.mkv`，确认显示「命中规则」，并列出刚才的路径映射和资源池。
6. 点击页面底部的「保存」。网关会立即开始监听新端口，不需要重启。

<Shot name="route-test" alt="Emby 源页面的匹配测试，显示命中的规则、路径映射与资源池" />

::: warning API Key 必须填写
网关要用 API Key 向 Emby 查询媒体的真实路径。没有填写 API Key 时，播放请求会照常交给 Emby，不会返回直链。
:::

如果匹配测试提示「没有命中任何启用的规则」，这个路径的请求会回退到反代，由网关直接转发给 Emby，不走直链。检查匹配前缀是否与 Emby 里的路径完全一致。路由规则的完整说明见 [Emby 源与路由规则](/guide/emby-sources)。

### 7. 用客户端播放

1. 确认服务器防火墙和云服务器安全组已放行第 6 步的监听端口。
2. 在 Emby 客户端里把服务器地址改成 `http://服务器地址:18889`（换成你的监听端口），用原来的 Emby 账号登录。
3. 播放一个在第 6 步测试过的媒体。

### 8. 在 302 链路里验证

打开 <span class="ui-path">监控 › 流量分析</span>，切到「302 链路」：

- 「302 后端分布」里能看到第 3 步的后端；
- 「链路阶段耗时」里有样本，可以看到从查询 Emby、匹配路由、路径映射到生成直链各阶段花了多久。

想看单次请求，切到「请求日志」按「302 直链」筛选。能看到 302 记录，说明链路已经跑通：视频数据由播放器直接从存储下载，不经过网关。

<Shot name="overview" alt="控制台首页：今日指标、趋势与需要关注的事项" caption="链路跑通后，控制台会开始显示请求量和 302 命中情况。" />

播放失败或没有 302 记录时，先看 [故障排查](/ops/troubleshooting)。

## 下一步

- [部署与升级](/guide/deployment)：PostgreSQL、端口规划、反向代理、升级与备份。
- [防护策略](/guide/security)：对外开放前配置登录防护和并发限制。
- [STRM 任务](/guide/strm-guide)：媒体只在网盘或对象存储里时，用 STRM 让 Emby 入库。
