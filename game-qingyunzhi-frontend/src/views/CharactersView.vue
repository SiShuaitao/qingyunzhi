<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchCharacters, fetchSects } from '@/api/portal'
import { useReveal, refreshReveal } from '@/composables/useReveal'
import { coverGradient, roleColor, difficultyColor } from '@/utils'
import type { Character, Sect } from '@/types'

useReveal()

const characters = ref<Character[]>([])
const sects = ref<Sect[]>([])
const activeRole = ref<string>('全部')
const activeFaction = ref<string>('全部')

const roleOptions = computed(() => ['全部', ...Array.from(new Set(characters.value.map(c => c.role)))])
const factionOptions = computed(() => ['全部', ...Array.from(new Set(characters.value.map(c => c.faction)))])

const filtered = computed(() => {
  return characters.value.filter(c => {
    const roleOk = activeRole.value === '全部' || c.role === activeRole.value
    const factionOk = activeFaction.value === '全部' || c.faction === activeFaction.value
    return roleOk && factionOk
  })
})

async function load() {
  const [c, s] = await Promise.all([
    fetchCharacters(),
    fetchSects()
  ])
  characters.value = c
  sects.value = s
  requestAnimationFrame(() => refreshReveal())
}

onMounted(load)
</script>

<template>
  <div class="characters-view">
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
        <p class="page-kicker reveal">CHARACTERS</p>
        <h1 class="page-title reveal">青云七子</h1>
        <p class="page-desc reveal">冷雾中独行，剑出无声。每一道身影，皆是清冷叙事中的一笔。</p>
      </div>
    </section>

    <!-- 筛选 -->
    <section class="filter-bar">
      <div class="container filter-inner">
        <div class="filter-group">
          <span class="filter-label">定位</span>
          <button
            v-for="r in roleOptions"
            :key="r"
            class="filter-chip"
            :class="{ active: activeRole === r }"
            @click="activeRole = r"
          >{{ r }}</button>
        </div>
        <div class="filter-group">
          <span class="filter-label">门派</span>
          <button
            v-for="f in factionOptions"
            :key="f"
            class="filter-chip"
            :class="{ active: activeFaction === f }"
            @click="activeFaction = f"
          >{{ f }}</button>
        </div>
      </div>
    </section>

    <!-- 角色网格 -->
    <section class="section chars-section">
      <div class="container">
        <div class="chars-grid" v-if="filtered.length">
          <article
            v-for="(c, idx) in filtered"
            :key="c.id"
            class="char-card reveal"
            :style="{ transitionDelay: (idx * 0.06) + 's' }"
          >
            <div class="char-cover" :style="{ background: coverGradient(c.cover) }">
              <div class="char-cover-fog"></div>
              <div class="char-cover-ring"></div>
              <span class="char-cover-glyph">{{ c.name.charAt(0) }}</span>
              <span class="char-cover-role" :style="{ color: roleColor(c.role), borderColor: roleColor(c.role) }">{{ c.role }}</span>
            </div>
            <div class="char-info">
              <p class="char-faction">{{ c.faction }}</p>
              <h3 class="char-name">{{ c.name }}</h3>
              <p class="char-title">{{ c.title }}</p>
              <div class="char-meta">
                <span class="meta-tag" :style="{ color: difficultyColor(c.difficulty), borderColor: difficultyColor(c.difficulty) }">难度 · {{ c.difficulty }}</span>
              </div>
              <p class="char-desc">{{ c.description }}</p>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">
          <p>暂无符合条件的人物档案。</p>
        </div>
      </div>
    </section>

    <!-- 门派速览 -->
    <section class="section sects-quick">
      <div class="cool-fog"></div>
      <div class="container">
        <div class="section-head reveal">
          <p class="section-kicker">SECTS</p>
          <h2 class="section-title">所属门派</h2>
          <p class="section-desc">青云七界，四宗立世。</p>
        </div>
        <div class="sects-quick-grid">
          <div
            v-for="(s, idx) in sects"
            :key="s.id"
            class="sect-quick-card reveal"
            :style="{ transitionDelay: (idx * 0.1) + 's' }"
          >
            <p class="sq-subtitle">{{ s.subtitle }}</p>
            <h3 class="sq-name">{{ s.name }}</h3>
            <p class="sq-philosophy">{{ s.philosophy }}</p>
            <p class="sq-desc">{{ s.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.characters-view {
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
    radial-gradient(ellipse at 30% 50%, rgba(110, 168, 196, 0.18), transparent 55%),
    radial-gradient(ellipse at 70% 50%, rgba(95, 179, 161, 0.1), transparent 55%),
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

/* ===== 筛选 ===== */
.filter-bar {
  position: sticky;
  top: var(--header-h);
  z-index: 20;
  background: rgba(5, 11, 20, 0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  padding: 20px 0;
}

.filter-inner {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--text-dim);
  margin-right: 4px;
}

.filter-chip {
  padding: 6px 16px;
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s var(--ease);
}

.filter-chip:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.filter-chip.active {
  color: #050b14;
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 16px rgba(110, 168, 196, 0.35);
}

/* ===== 角色网格 ===== */
.chars-section {
  background: var(--bg);
  padding: 80px 0 100px;
}

.chars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 28px;
}

.char-card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform 0.5s var(--ease), border-color 0.5s var(--ease), box-shadow 0.5s var(--ease);
}

.char-card:hover {
  transform: translateY(-8px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-hover);
}

.char-cover {
  position: relative;
  height: 360px;
  display: flex;
  align-items: flex-end;
  padding: 24px;
}

.char-cover-fog {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(212, 224, 232, 0.16), transparent 55%),
    linear-gradient(180deg, transparent 50%, rgba(5, 11, 20, 0.85) 100%);
}

.char-cover-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 220px;
  height: 220px;
  border: 1px solid rgba(110, 168, 196, 0.22);
  border-radius: 50%;
  transform: translate(-50%, -60%);
}

.char-cover-ring::before {
  content: '';
  position: absolute;
  inset: -30px;
  border: 1px dashed rgba(110, 168, 196, 0.15);
  border-radius: 50%;
}

.char-cover-glyph {
  position: relative;
  font-size: 80px;
  font-weight: 200;
  color: rgba(212, 224, 232, 0.92);
  text-shadow: 0 0 24px rgba(110, 168, 196, 0.5);
  line-height: 1;
  margin-right: auto;
}

.char-cover-role {
  position: relative;
  padding: 4px 14px;
  font-size: 11px;
  letter-spacing: 2px;
  border: 1px solid;
  border-radius: 999px;
  background: rgba(5, 11, 20, 0.5);
  backdrop-filter: blur(6px);
}

.char-info {
  padding: 26px 24px 28px;
}

.char-faction {
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--accent-2);
  margin-bottom: 8px;
}

.char-name {
  font-size: 26px;
  font-weight: 300;
  letter-spacing: 6px;
  color: var(--text);
  margin-bottom: 6px;
}

.char-title {
  font-size: 14px;
  letter-spacing: 3px;
  color: var(--accent-hover);
  margin-bottom: 16px;
  font-weight: 300;
}

.char-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.meta-tag {
  padding: 4px 12px;
  font-size: 11px;
  letter-spacing: 1.5px;
  border: 1px solid;
  border-radius: 999px;
}

.char-desc {
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--text-muted);
  line-height: 2;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
  font-size: 14px;
  letter-spacing: 2px;
}

/* ===== 门派速览 ===== */
.sects-quick {
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-elev) 100%);
  padding: 100px 0;
}

.sects-quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.sect-quick-card {
  padding: 32px 26px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: transform 0.4s var(--ease), border-color 0.4s var(--ease);
}

.sect-quick-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-strong);
}

.sq-subtitle {
  font-size: 10px;
  letter-spacing: 3px;
  color: var(--accent);
  margin-bottom: 8px;
}

.sq-name {
  font-size: 20px;
  font-weight: 300;
  letter-spacing: 5px;
  color: var(--text);
  margin-bottom: 10px;
}

.sq-philosophy {
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--accent-hover);
  margin-bottom: 16px;
  font-style: italic;
}

.sq-desc {
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--text-muted);
  line-height: 1.9;
}

@media (max-width: 768px) {
  .page-hero {
    height: 320px;
  }

  .filter-inner {
    gap: 20px;
  }

  .chars-section {
    padding: 60px 0 80px;
  }

  .sects-quick {
    padding: 80px 0;
  }
}
</style>
