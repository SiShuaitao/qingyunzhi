<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchGameInfo, fetchFeatures } from '@/api/portal'
import { useReveal, refreshReveal } from '@/composables/useReveal'
import type { GameMeta, Feature } from '@/types'

const router = useRouter()
useReveal()

const game = ref<GameMeta | null>(null)
const features = ref<Feature[]>([])

async function load() {
  const [g, f] = await Promise.all([
    fetchGameInfo(),
    fetchFeatures()
  ])
  game.value = g
  features.value = f
  requestAnimationFrame(() => refreshReveal())
}

onMounted(load)
</script>

<template>
  <div class="about-view">
    <!-- 顶部 Banner -->
    <section class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="page-hero-fog"></div>
      <div class="page-hero-particles">
        <span v-for="n in 16" :key="n" class="ph-particle" :style="{
          left: (n * 6) + '%',
          animationDelay: (n * 0.5) + 's',
          animationDuration: (7 + (n % 4) * 2) + 's'
        }"></span>
      </div>
      <div class="container page-hero-content">
        <p class="page-kicker reveal">ABOUT QING YUN</p>
        <h1 class="page-title reveal">关于青云志</h1>
        <p class="page-desc reveal">{{ game?.tagline || '轻科幻 · 文艺清冷 · 唯美叙事' }}</p>
      </div>
    </section>

    <!-- 世界观 -->
    <section class="section worldview-section">
      <div class="cool-fog"></div>
      <div class="container worldview-content">
        <p class="worldview-kicker reveal">WORLDVIEW</p>
        <h2 class="worldview-title reveal">星河为引<br/>剑意为锋</h2>
        <div class="worldview-text reveal">
          <p>{{ game?.description || '《青云志》以轻科幻笔触重写仙侠。油画质感海报、柔和冷调光影、粒子特效流转，人物立绘于光雾中动态悬浮。极简高级的科幻浪漫中，藏着一段清冷唯美的叙事。' }}</p>
          <p>星河为引，剑意为锋，在冷色调的夜空之下，每一帧都是一张可驻足的油画，每一剑都是一句未说出口的告白。我们以油画质感与冷调光影，为东方仙侠题材注入一种极简高级的科幻浪漫，让传统与现代在青云之上相遇。</p>
        </div>
        <p class="worldview-quote reveal">「在冷色调的现实与光雾笼罩的幻境之间，<br/>揭开一段跨越两界的清冷唯美叙事。」</p>
      </div>
    </section>

    <!-- 核心特色 -->
    <section class="section features-section">
      <div class="container">
        <div class="section-head reveal">
          <p class="section-kicker">CORE FEATURES</p>
          <h2 class="section-title">核心特色</h2>
          <p class="section-desc">油画质感与冷调光影，定义文艺清冷的轻科幻仙侠叙事。</p>
        </div>

        <div class="features-list">
          <article
            v-for="(feat, idx) in features"
            :key="feat.id"
            class="feature-row reveal"
            :style="{ transitionDelay: (idx * 0.1) + 's' }"
          >
            <div class="feature-row-num">{{ String(idx + 1).padStart(2, '0') }}</div>
            <div class="feature-row-body">
              <div class="feature-row-head">
                <span class="feature-row-icon" aria-hidden="true">{{ feat.icon }}</span>
                <h3 class="feature-row-title">{{ feat.title }}</h3>
              </div>
              <p class="feature-row-summary">{{ feat.summary }}</p>
              <p class="feature-row-desc">{{ feat.description }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 游戏信息 -->
    <section class="section info-section">
      <div class="container info-grid">
        <div class="info-card reveal">
          <p class="info-label">游戏名称</p>
          <p class="info-value">{{ game?.name || '青云志' }}</p>
          <p class="info-sub">{{ game?.subtitle || 'QING YUN' }}</p>
        </div>
        <div class="info-card reveal">
          <p class="info-label">游戏类型</p>
          <p class="info-value">{{ game?.category || '文艺仙侠' }}</p>
          <p class="info-sub">轻科幻 · 清冷唯美</p>
        </div>
        <div class="info-card reveal">
          <p class="info-label">核心标签</p>
          <p class="info-value">{{ game?.tagline || '清冷唯美叙事' }}</p>
          <p class="info-sub">油画质感 · 冷调光影 · 粒子特效</p>
        </div>
        <div class="info-card reveal">
          <p class="info-label">发行状态</p>
          <p class="info-value">首轮测试定档</p>
          <p class="info-sub">限量技术测试即将开启</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section cta-section">
      <div class="cool-fog"></div>
      <div class="container cta-content">
        <p class="cta-kicker reveal">JOIN QING YUN</p>
        <h2 class="cta-title reveal">共赴一场清冷之约</h2>
        <p class="cta-text reveal">
          限量技术测试招募通道现已开放。期待与你，在冷色调的夜空之下，<br/>
          于光雾中遇见那柄引星河倒悬的剑。
        </p>
        <div class="cta-actions reveal">
          <button class="btn btn-primary" @click="router.push('/characters')">查看人物档案</button>
          <button class="btn btn-ghost" @click="router.push('/news')">最新动态</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-view {
  position: relative;
}

/* ===== Page Hero ===== */
.page-hero {
  position: relative;
  height: 440px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--bg);
}

.page-hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 50%, rgba(110, 168, 196, 0.18), transparent 55%),
    radial-gradient(ellipse at 70% 50%, rgba(95, 179, 161, 0.12), transparent 55%),
    linear-gradient(180deg, var(--bg-elev) 0%, var(--bg) 100%);
}

.page-hero-fog {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 60%, var(--bg) 100%);
}

.page-hero-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ph-particle {
  position: absolute;
  bottom: 20%;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(212, 224, 232, 0.7);
  box-shadow: 0 0 6px var(--accent);
  animation: ph-float linear infinite;
}

@keyframes ph-float {
  0% { transform: translateY(0); opacity: 0; }
  20% { opacity: 0.8; }
  100% { transform: translateY(-320px); opacity: 0; }
}

.page-hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.page-kicker {
  font-size: 12px;
  letter-spacing: 8px;
  color: var(--accent);
  margin-bottom: 22px;
}

.page-title {
  font-size: clamp(40px, 5.5vw, 64px);
  font-weight: 200;
  letter-spacing: 12px;
  color: var(--text);
  margin-bottom: 22px;
  text-shadow: 0 0 40px rgba(110, 168, 196, 0.35);
}

.page-desc {
  font-size: 15px;
  letter-spacing: 2px;
  color: var(--text-muted);
  max-width: 560px;
  margin: 0 auto;
  line-height: 2;
}

/* ===== 世界观 ===== */
.worldview-section {
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-elev) 100%);
  text-align: center;
}

.worldview-content {
  position: relative;
  max-width: 820px;
  margin: 0 auto;
}

.worldview-kicker {
  font-size: 12px;
  letter-spacing: 8px;
  color: var(--accent);
  margin-bottom: 32px;
}

.worldview-title {
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 200;
  letter-spacing: 12px;
  color: var(--text);
  margin-bottom: 48px;
  line-height: 1.5;
  text-shadow: 0 0 32px rgba(110, 168, 196, 0.3);
}

.worldview-text {
  margin-bottom: 48px;
}

.worldview-text p {
  font-size: 16px;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  line-height: 2.4;
  margin-bottom: 24px;
  text-align: left;
  text-indent: 2em;
}

.worldview-quote {
  font-size: 20px;
  letter-spacing: 4px;
  color: var(--accent-hover);
  font-style: italic;
  font-weight: 300;
  line-height: 2;
  padding: 32px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

/* ===== 核心特色 ===== */
.features-section {
  background: var(--bg);
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feature-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 36px;
  padding: 40px 0;
  border-bottom: 1px solid var(--border);
  transition: padding 0.4s var(--ease);
}

.feature-row:last-child {
  border-bottom: none;
}

.feature-row:hover {
  padding-left: 12px;
}

.feature-row-num {
  font-size: 56px;
  font-weight: 200;
  color: var(--accent);
  line-height: 1;
  text-shadow: 0 0 24px rgba(110, 168, 196, 0.35);
  opacity: 0.85;
}

.feature-row-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}

.feature-row-icon {
  font-size: 24px;
  color: var(--accent);
  text-shadow: 0 0 16px var(--accent);
}

.feature-row-title {
  font-size: 24px;
  font-weight: 300;
  letter-spacing: 5px;
  color: var(--text);
}

.feature-row-summary {
  font-size: 14px;
  letter-spacing: 1.5px;
  color: var(--accent-hover);
  margin-bottom: 14px;
}

.feature-row-desc {
  font-size: 14px;
  letter-spacing: 1px;
  color: var(--text-muted);
  line-height: 2;
  max-width: 720px;
}

/* ===== 游戏信息 ===== */
.info-section {
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-elev) 100%);
  padding: 100px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.info-card {
  padding: 32px 28px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: transform 0.4s var(--ease), border-color 0.4s var(--ease);
}

.info-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-strong);
}

.info-label {
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--accent);
  margin-bottom: 14px;
}

.info-value {
  font-size: 22px;
  font-weight: 300;
  letter-spacing: 4px;
  color: var(--text);
  margin-bottom: 8px;
}

.info-sub {
  font-size: 12px;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  line-height: 1.7;
}

/* ===== CTA ===== */
.cta-section {
  background: linear-gradient(180deg, var(--bg-elev) 0%, var(--bg) 100%);
  text-align: center;
}

.cta-content {
  position: relative;
  max-width: 760px;
  margin: 0 auto;
}

.cta-kicker {
  font-size: 12px;
  letter-spacing: 8px;
  color: var(--accent);
  margin-bottom: 28px;
}

.cta-title {
  font-size: clamp(32px, 4.5vw, 52px);
  font-weight: 200;
  letter-spacing: 10px;
  color: var(--text);
  margin-bottom: 32px;
  text-shadow: 0 0 32px rgba(110, 168, 196, 0.3);
}

.cta-text {
  font-size: 15px;
  letter-spacing: 2px;
  color: var(--text-muted);
  line-height: 2.2;
  margin-bottom: 44px;
}

.cta-actions {
  display: flex;
  gap: 18px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .page-hero {
    height: 340px;
  }

  .worldview-text p {
    font-size: 14px;
    line-height: 2.2;
  }

  .worldview-quote {
    font-size: 16px;
    letter-spacing: 3px;
  }

  .feature-row {
    grid-template-columns: 60px 1fr;
    gap: 20px;
    padding: 28px 0;
  }

  .feature-row-num {
    font-size: 36px;
  }

  .feature-row-title {
    font-size: 20px;
    letter-spacing: 3px;
  }

  .info-section,
  .worldview-section,
  .features-section,
  .cta-section {
    padding: 80px 0;
  }
}
</style>
