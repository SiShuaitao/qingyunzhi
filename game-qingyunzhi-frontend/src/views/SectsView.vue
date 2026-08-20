<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchSects } from '@/api/portal'
import { useReveal, refreshReveal } from '@/composables/useReveal'
import { coverGradient } from '@/utils'
import type { Sect } from '@/types'

useReveal()

const sects = ref<Sect[]>([])

async function load() {
  sects.value = await fetchSects()
  requestAnimationFrame(() => refreshReveal())
}

onMounted(load)
</script>

<template>
  <div class="sects-view">
    <!-- 顶部 Banner -->
    <section class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="page-hero-fog"></div>
      <div class="page-hero-particles">
        <span v-for="n in 14" :key="n" class="ph-particle" :style="{
          left: (n * 7) + '%',
          animationDelay: (n * 0.6) + 's',
          animationDuration: (7 + (n % 4) * 2) + 's'
        }"></span>
      </div>
      <div class="container page-hero-content">
        <p class="page-kicker reveal">SECTS</p>
        <h1 class="page-title reveal">门派势力</h1>
        <p class="page-desc reveal">青云七界，四宗立世。冷雾缭绕间，各有清冷信仰。</p>
      </div>
    </section>

    <!-- 门派列表 -->
    <section class="section sects-list">
      <div class="container">
        <div class="sects-stack">
          <article
            v-for="(s, idx) in sects"
            :key="s.id"
            class="sect-row reveal"
            :class="{ reverse: idx % 2 === 1 }"
            :style="{ transitionDelay: (idx * 0.1) + 's' }"
          >
            <div class="sect-visual" :style="{ background: coverGradient(s.cover) }">
              <div class="sect-visual-fog"></div>
              <div class="sect-visual-ring"></div>
              <span class="sect-visual-glyph">{{ s.name.charAt(0) }}</span>
              <div class="sect-visual-particles">
                <span v-for="n in 10" :key="n" class="sv-particle" :style="{
                  left: (n * 10) + '%',
                  animationDelay: (n * 0.5) + 's',
                  animationDuration: (6 + (n % 3) * 2) + 's'
                }"></span>
              </div>
            </div>
            <div class="sect-text">
              <p class="sect-subtitle">{{ s.subtitle }}</p>
              <h2 class="sect-name">{{ s.name }}</h2>
              <p class="sect-philosophy">{{ s.philosophy }}</p>
              <p class="sect-desc">{{ s.description }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sects-view {
  position: relative;
}

/* ===== Page Hero ===== */
.page-hero {
  position: relative;
  height: 420px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--bg);
}

.page-hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 50%, rgba(95, 179, 161, 0.16), transparent 55%),
    radial-gradient(ellipse at 70% 50%, rgba(110, 168, 196, 0.12), transparent 55%),
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
  box-shadow: 0 0 6px var(--accent-2);
  animation: ph-float linear infinite;
}

@keyframes ph-float {
  0% { transform: translateY(0); opacity: 0; }
  20% { opacity: 0.8; }
  100% { transform: translateY(-300px); opacity: 0; }
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

/* ===== 门派列表 ===== */
.sects-list {
  background: var(--bg);
  padding: 80px 0 120px;
}

.sects-stack {
  display: flex;
  flex-direction: column;
  gap: 80px;
}

.sect-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

.sect-row.reverse .sect-visual {
  order: 2;
}

.sect-visual {
  position: relative;
  height: 420px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-card);
}

.sect-visual-fog {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(212, 224, 232, 0.16), transparent 55%),
    linear-gradient(180deg, transparent 50%, rgba(5, 11, 20, 0.7) 100%);
}

.sect-visual-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 260px;
  height: 260px;
  border: 1px solid rgba(110, 168, 196, 0.25);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ring-spin 24s linear infinite;
}

.sect-visual-ring::before {
  content: '';
  position: absolute;
  inset: -36px;
  border: 1px dashed rgba(110, 168, 196, 0.16);
  border-radius: 50%;
}

@keyframes ring-spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.sect-visual-glyph {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 140px;
  font-weight: 200;
  color: rgba(212, 224, 232, 0.92);
  text-shadow: 0 0 40px rgba(110, 168, 196, 0.5);
  line-height: 1;
}

.sect-visual-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sv-particle {
  position: absolute;
  bottom: 0;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(212, 224, 232, 0.7);
  box-shadow: 0 0 4px var(--accent);
  animation: sv-float linear infinite;
}

@keyframes sv-float {
  0% { transform: translateY(0); opacity: 0; }
  20% { opacity: 0.8; }
  100% { transform: translateY(-420px); opacity: 0; }
}

.sect-text {
  padding: 24px 0;
}

.sect-subtitle {
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--accent);
  margin-bottom: 14px;
}

.sect-name {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 200;
  letter-spacing: 10px;
  color: var(--text);
  margin-bottom: 16px;
  text-shadow: 0 0 24px rgba(110, 168, 196, 0.3);
}

.sect-philosophy {
  font-size: 18px;
  letter-spacing: 4px;
  color: var(--accent-hover);
  margin-bottom: 28px;
  font-style: italic;
  font-weight: 300;
}

.sect-desc {
  font-size: 15px;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  line-height: 2.2;
}

@media (max-width: 960px) {
  .sect-row {
    grid-template-columns: 1fr;
    gap: 36px;
  }
  .sect-row.reverse .sect-visual {
    order: 0;
  }
  .sect-visual {
    height: 320px;
  }
  .sect-visual-glyph {
    font-size: 100px;
  }
}

@media (max-width: 768px) {
  .page-hero {
    height: 320px;
  }
  .sects-list {
    padding: 60px 0 80px;
  }
  .sects-stack {
    gap: 56px;
  }
}
</style>
