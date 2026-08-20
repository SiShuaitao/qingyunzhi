<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useReveal, refreshReveal } from '@/composables/useReveal'

useReveal()

// 试玩特性
const features = ref([
  {
    icon: '✦',
    title: '水墨开放世界',
    desc: 'WASD 自由探索 2400×1600 水墨山水，相机平滑跟随，烟雨霜雪随行。'
  },
  {
    icon: '✧',
    title: '即时动作战斗',
    desc: '鼠标挥剑，水墨剑气破空。走位、连招、节奏，皆是清冷一击。'
  },
  {
    icon: '✦',
    title: '三系剑修技能',
    desc: '霜刃斩 · 寒霜剑阵 · 万剑归宗，数字键 1/2/3 释放，灵力与冷却并重。'
  },
  {
    icon: '✧',
    title: '升级养成',
    desc: '生命 · 灵力 · 等级 · 经验 · 攻防，击杀墨妖升级，道心不灭。'
  },
  {
    icon: '✦',
    title: 'NPC 任务',
    desc: '青云门使者立约，诛杀墨妖换取灵石与经验，水墨长卷由此展开。'
  },
  {
    icon: '✧',
    title: '背包掉落',
    desc: '墨玉 · 霜华露 · 剑意残片，击杀掉落，霜华露可即席回血续命。'
  }
])

// 操作说明
const controls = ref([
  { key: 'W A S D', action: '四方向移动' },
  { key: '鼠标左键', action: '挥剑攻击' },
  { key: '1 / 2 / 3', action: '释放技能' },
  { key: 'E', action: '与 NPC 交互' },
  { key: 'B', action: '打开背包' }
])

const opening = ref(false)

function startPlay() {
  opening.value = true
  // 试玩在新窗口打开，保留官网上下文
  window.open('/game/index.html', '_blank', 'width=1280,height=800')
  setTimeout(() => { opening.value = false }, 1200)
}

onMounted(() => {
  requestAnimationFrame(() => refreshReveal())
})
</script>

<template>
  <div class="play-view">
    <!-- 主视觉 -->
    <section class="play-hero">
      <div class="hero-bg"></div>
      <div class="hero-fog"></div>

      <!-- 烟雨粒子 -->
      <div class="hero-particles">
        <span
          v-for="n in 18"
          :key="'p-' + n"
          class="hero-particle"
          :style="{
            left: (n * 5.4) + '%',
            animationDelay: (n * 0.5) + 's',
            animationDuration: (7 + (n % 4) * 2) + 's'
          }"
        ></span>
      </div>

      <!-- 朱砂印章 -->
      <div class="hero-seal-wrap" aria-hidden="true">
        <span class="hero-seal">青雲</span>
      </div>

      <div class="container hero-content">
        <p class="hero-kicker reveal">QING YUN · TRIAL</p>
        <h1 class="hero-title reveal">青云志 · 试玩</h1>
        <p class="hero-subtitle reveal">水墨开放世界 · 即时动作 · MMORPG</p>
        <p class="hero-desc reveal">
          于水墨山水之间，执剑问心。WASD 探索青云七界，挥剑斩墨妖，立约守清冷。
          <br />试玩版本将在独立窗口中开启，沉浸于烟雨霜雪的仙侠长卷。
        </p>

        <div class="hero-actions reveal">
          <button class="btn btn-primary btn-launch" :class="{ opening }" @click="startPlay">
            <span class="launch-text">{{ opening ? '展卷中…' : '开始试玩' }}</span>
            <span class="launch-arrow" aria-hidden="true">↗</span>
          </button>
          <a href="#play-features" class="btn btn-ghost">了解玩法</a>
        </div>

        <p class="hero-hint reveal">点击按钮将在新窗口打开试玩客户端</p>
      </div>

      <div class="hero-scroll">
        <span class="scroll-text">展卷</span>
        <span class="scroll-line"></span>
      </div>
    </section>

    <!-- 玩法特性 -->
    <section id="play-features" class="section features-section">
      <div class="container">
        <div class="section-head reveal">
          <p class="section-kicker">FEATURES</p>
          <h2 class="section-title">试玩内容</h2>
          <p class="section-desc">水墨国风 MMORPG 核心玩法，于清冷长卷中体验仙侠之约。</p>
        </div>

        <div class="features-grid">
          <article
            v-for="(feat, idx) in features"
            :key="feat.title"
            class="feature-card reveal"
            :style="{ transitionDelay: (idx * 0.08) + 's' }"
          >
            <span class="feature-seal" aria-hidden="true">{{ feat.icon }}</span>
            <span class="feature-num" aria-hidden="true">◎ {{ String(idx + 1).padStart(2, '0') }}</span>
            <h3 class="feature-title">{{ feat.title }}</h3>
            <p class="feature-desc">{{ feat.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 操作说明 -->
    <section class="section controls-section">
      <div class="cool-fog"></div>
      <div class="container">
        <div class="section-head reveal">
          <p class="section-kicker">CONTROLS</p>
          <h2 class="section-title">操作指引</h2>
          <p class="section-desc">水墨剑修，一念之间。</p>
        </div>

        <div class="controls-grid reveal">
          <div v-for="c in controls" :key="c.key" class="control-row">
            <span class="control-key">{{ c.key }}</span>
            <span class="control-action">{{ c.action }}</span>
          </div>
        </div>

        <div class="cta-wrap reveal">
          <button class="btn btn-primary btn-launch" :class="{ opening }" @click="startPlay">
            <span class="launch-text">{{ opening ? '展卷中…' : '踏入青云' }}</span>
            <span class="launch-arrow" aria-hidden="true">↗</span>
          </button>
          <p class="cta-hint">新窗口独立运行 · 无需安装 · 即开即玩</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.play-view {
  position: relative;
}

/* ===== Hero ===== */
.play-hero {
  position: relative;
  height: 100vh;
  min-height: 620px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(180deg, #1a1a1a 0%, #2c2c2c 100%);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(110, 168, 196, 0.18), transparent 55%),
    radial-gradient(ellipse at 70% 60%, rgba(107, 142, 127, 0.12), transparent 55%),
    linear-gradient(180deg, #0e1828 0%, #1a2a48 50%, #0e1828 100%);
}

.hero-fog {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 10, 10, 0.3) 0%, transparent 40%, rgba(8, 8, 8, 0.85) 100%);
}

.hero-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.hero-particle {
  position: absolute;
  bottom: 18%;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(212, 224, 232, 0.7);
  box-shadow: 0 0 6px var(--accent);
  animation: particle-float linear infinite;
}
@keyframes particle-float {
  0% { transform: translateY(0); opacity: 0; }
  20% { opacity: 0.8; }
  100% { transform: translateY(-340px); opacity: 0; }
}

.hero-seal-wrap {
  position: absolute;
  top: 24%;
  right: 12%;
  z-index: 2;
}
.hero-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 78px;
  height: 78px;
  font-family: var(--font-kai);
  font-size: 26px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--moon);
  background: var(--accent);
  border: 3px solid var(--accent);
  border-radius: 6px;
  box-shadow: inset 0 0 0 3px rgba(245, 240, 230, 0.6), 0 6px 22px rgba(0, 0, 0, 0.45);
  transform: rotate(-6deg);
}

.hero-content {
  position: relative;
  z-index: 3;
  max-width: 760px;
}
.hero-kicker {
  font-family: var(--font-song);
  font-size: 13px;
  letter-spacing: 10px;
  color: #d96565;
  margin-bottom: 24px;
}
.hero-title {
  font-family: var(--font-kai);
  font-size: clamp(48px, 7vw, 88px);
  font-weight: 500;
  letter-spacing: 14px;
  line-height: 1.1;
  margin-bottom: 22px;
  color: var(--moon);
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.6);
}
.hero-subtitle {
  font-family: var(--font-kai);
  font-size: 19px;
  letter-spacing: 6px;
  color: #c9b98a;
  margin-bottom: 28px;
}
.hero-desc {
  font-family: var(--font-song);
  font-size: 15px;
  letter-spacing: 1.5px;
  color: #a89e84;
  line-height: 2.1;
  margin-bottom: 40px;
  max-width: 600px;
}
.hero-actions {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.hero-hint {
  font-family: var(--font-song);
  font-size: 12px;
  letter-spacing: 2px;
  color: #8a8068;
}

/* 启动按钮 */
.btn-launch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  font-size: 16px;
  letter-spacing: 6px;
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
}
.btn-launch:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(184, 59, 59, 0.4);
}
.btn-launch.opening {
  pointer-events: none;
  opacity: 0.7;
}
.launch-arrow {
  font-size: 18px;
  transition: transform 0.3s var(--ease);
}
.btn-launch:hover .launch-arrow {
  transform: translate(4px, -4px);
}

.hero-scroll {
  position: absolute;
  bottom: 24px;
  right: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 5;
}
.scroll-text {
  font-family: var(--font-kai);
  font-size: 13px;
  letter-spacing: 6px;
  color: var(--moon);
  writing-mode: vertical-rl;
}
.scroll-line {
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, var(--accent), transparent);
  animation: scroll-pulse 2s ease-in-out infinite;
}
@keyframes scroll-pulse {
  0%, 100% { opacity: 0.4; transform: scaleY(0.7); transform-origin: top; }
  50% { opacity: 1; transform: scaleY(1); }
}

/* ===== 特性 ===== */
.features-section {
  background: var(--bg);
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}
.feature-card {
  position: relative;
  padding: 44px 32px 38px;
  background:
    linear-gradient(180deg, rgba(255, 253, 247, 0.7), rgba(232, 223, 201, 0.5)),
    var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform 0.5s var(--ease), border-color 0.5s var(--ease), box-shadow 0.5s var(--ease);
}
.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0;
  transition: opacity 0.5s ease;
}
.feature-card:hover {
  transform: translateY(-6px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-hover);
}
.feature-card:hover::before {
  opacity: 1;
}
.feature-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  font-size: 24px;
  color: var(--moon);
  background: var(--accent);
  border-radius: 6px;
  box-shadow: inset 0 0 0 2px rgba(245, 240, 230, 0.55);
  margin-bottom: 24px;
  transform: rotate(-3deg);
}
.feature-num {
  position: absolute;
  top: 22px;
  right: 24px;
  font-family: var(--font-song);
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--text-dim);
}
.feature-title {
  font-family: var(--font-kai);
  font-size: 21px;
  font-weight: 500;
  letter-spacing: 4px;
  color: var(--ink);
  margin-bottom: 14px;
}
.feature-desc {
  font-family: var(--font-song);
  font-size: 14px;
  letter-spacing: 1px;
  color: var(--text-muted);
  line-height: 2.1;
}

/* ===== 操作 + CTA ===== */
.controls-section {
  position: relative;
  background: linear-gradient(180deg, var(--bg-elev) 0%, var(--bg) 100%);
  overflow: hidden;
}
.controls-grid {
  max-width: 680px;
  margin: 0 auto 56px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.control-row {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 24px;
  background: rgba(255, 253, 247, 0.55);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color 0.3s var(--ease), transform 0.3s var(--ease);
}
.control-row:hover {
  border-color: var(--accent);
  transform: translateX(6px);
}
.control-key {
  flex-shrink: 0;
  min-width: 120px;
  font-family: var(--font-kai);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 2px;
  color: var(--moon);
  background: var(--accent-3);
  border-radius: 4px;
  padding: 6px 14px;
  text-align: center;
  box-shadow: inset 0 0 0 2px rgba(245, 240, 230, 0.4);
}
.control-action {
  font-family: var(--font-kai);
  font-size: 16px;
  letter-spacing: 3px;
  color: var(--text);
}

.cta-wrap {
  text-align: center;
}
.cta-hint {
  font-family: var(--font-song);
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-dim);
  margin-top: 18px;
}

@media (max-width: 768px) {
  .play-hero {
    min-height: 560px;
  }
  .hero-scroll {
    display: none;
  }
  .control-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
