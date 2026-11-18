<script setup lang="ts">
/**
 * 请求流程图（HTML + CSS 绘制，跟随亮暗主题）。
 * 首页与「介绍与工作原理」共用。
 */
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>

<template>
  <div class="flow" :class="{ compact }" role="img" aria-label="请求流程：播放器请求先到网关，网关依次做路由匹配、路径映射、选择资源池后端，再把 302 直链返回给播放器，播放器直接从存储拉流；未匹配的请求原样代理到 Emby。">
    <div class="node client">
      <span class="node-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2.5" /><path d="M8 21h8M12 17v4" /><path d="M10.5 8.5v5l4-2.5z" class="fill" /></svg>
      </span>
      <b>播放器</b>
      <small>Emby 各端 / Infuse 等</small>
    </div>

    <div class="arrow" aria-hidden="true"><span>播放请求</span></div>

    <div class="node gateway">
      <div class="gw-head">
        <span class="node-icon brand" aria-hidden="true">
          <svg viewBox="0 0 40 40"><path d="M13 12.5c0-1.2 1.3-1.9 2.3-1.3l9.4 6.3c.9.6.9 1.9 0 2.5l-9.4 6.3c-1 .7-2.3-.1-2.3-1.3V12.5z" class="fill" /></svg>
        </span>
        <b>Feiyue Emby Gateway</b>
      </div>
      <ol class="steps">
        <li><em>1</em><span><b>路由规则</b>按媒体路径找到对应规则</span></li>
        <li><em>2</em><span><b>路径映射</b>把 Emby 里的路径换成存储里的路径</span></li>
        <li><em>3</em><span><b>资源池</b>优先主后端，异常时切到备用</span></li>
      </ol>
      <div class="fallback">没有匹配的规则或映射：原样代理给 Emby，播放不中断</div>
    </div>

    <div class="arrow" aria-hidden="true"><span>302 直链</span></div>

    <div class="node storage">
      <span class="node-icon teal" aria-hidden="true">
        <svg viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="2.5" /><path d="M5 6v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" /><path d="M5 12v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" /></svg>
      </span>
      <b>存储后端</b>
      <small>S3 · CDN · 网盘 · 本地</small>
      <span class="note">播放器直接从这里拉流</span>
    </div>
  </div>
</template>

<style scoped>
.flow {
  display: grid;
  grid-template-columns: minmax(130px, 0.8fr) 92px minmax(280px, 1.7fr) 92px minmax(130px, 0.8fr);
  align-items: center;
  gap: 0;
  margin: 24px 0;
}

.node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 16px;
  text-align: center;
  background: var(--eg-surface);
  border: 1px solid var(--eg-border);
  border-radius: var(--eg-radius-card);
  box-shadow: var(--eg-shadow-flat);
}

.node b {
  font-size: 15px;
  color: var(--vp-c-text-1);
}

.node small {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.node-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  margin-bottom: 6px;
  border-radius: 11px;
  background: var(--eg-grad-slate);
}

.node-icon.brand {
  background: linear-gradient(135deg, #38bdf8 0%, #2563eb 55%);
  margin-bottom: 0;
}

.node-icon.teal {
  background: var(--eg-grad-teal);
}

.node-icon svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: #fff;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.node-icon.brand svg {
  width: 30px;
  height: 30px;
}

.node-icon .fill {
  fill: #fff;
  stroke: none;
}

.gateway {
  align-items: stretch;
  text-align: left;
  padding: 18px 20px;
  border-color: color-mix(in srgb, var(--eg-primary) 35%, var(--eg-border));
  box-shadow: var(--eg-shadow-raised);
}

.gw-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.steps li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  background: var(--eg-surface-2);
  border-radius: 10px;
}

.steps em {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  font-style: normal;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: var(--eg-primary);
  border-radius: 50%;
}

.steps b {
  margin-right: 6px;
  font-size: 13px;
  color: var(--vp-c-text-1);
}

.fallback {
  margin-top: 10px;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--vp-c-text-3);
  border: 1px dashed var(--eg-border-strong);
  border-radius: 10px;
}

.note {
  margin-top: 8px;
  padding: 2px 10px;
  font-size: 12px;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-radius: 999px;
}

.arrow {
  position: relative;
  height: 2px;
  margin: 0 8px;
  background: linear-gradient(90deg, var(--eg-border-strong), var(--eg-primary));
}

.arrow::after {
  content: '';
  position: absolute;
  right: -2px;
  top: -5px;
  border: 6px solid transparent;
  border-left: 8px solid var(--eg-primary);
  border-right: 0;
}

.arrow span {
  position: absolute;
  left: 50%;
  bottom: 8px;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

@media (max-width: 860px) {
  .flow {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }

  .arrow {
    width: 2px;
    height: 44px;
    margin: 0 auto;
    background: linear-gradient(180deg, var(--eg-border-strong), var(--eg-primary));
  }

  .arrow::after {
    right: auto;
    left: -5px;
    top: auto;
    bottom: -2px;
    border: 6px solid transparent;
    border-top: 8px solid var(--eg-primary);
    border-bottom: 0;
  }

  .arrow span {
    left: 14px;
    bottom: 50%;
    transform: translateY(50%);
  }
}
</style>
