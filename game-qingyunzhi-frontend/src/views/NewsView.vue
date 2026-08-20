<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchLatestNews } from '@/api/portal'
import { useReveal, refreshReveal } from '@/composables/useReveal'
import { newsCategoryLabel, newsCategoryColor, formatDate, formatMonthDay } from '@/utils'
import type { NewsItem } from '@/types'

const router = useRouter()
useReveal()

const news = ref<NewsItem[]>([])
const activeCategory = ref<string>('全部')

const categories = computed(() => ['全部', ...Array.from(new Set(news.value.map(n => n.category)))])

const filtered = computed(() => {
  if (activeCategory.value === '全部') return news.value
  return news.value.filter(n => n.category === activeCategory.value)
})

async function load() {
  news.value = await fetchLatestNews(20)
  requestAnimationFrame(() => refreshReveal())
}

onMounted(load)

function goDetail(id: number) {
  router.push(`/news/${id}`)
}
</script>

<template>
  <div class="news-view">
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
        <p class="page-kicker reveal">NEWS</p>
        <h1 class="page-title reveal">资讯中心</h1>
        <p class="page-desc reveal">清冷唯美幕后，世界观解读与限量测试动态。</p>
      </div>
    </section>

    <!-- 分类筛选 -->
    <section class="filter-bar">
      <div class="container filter-inner">
        <button
          v-for="c in categories"
          :key="c"
          class="filter-chip"
          :class="{ active: activeCategory === c }"
          @click="activeCategory = c"
        >{{ c === '全部' ? '全部' : newsCategoryLabel(c) }}</button>
      </div>
    </section>

    <!-- 资讯列表 -->
    <section class="section news-section">
      <div class="container">
        <div class="news-list" v-if="filtered.length">
          <article
            v-for="(n, idx) in filtered"
            :key="n.id"
            class="news-item reveal"
            :style="{ transitionDelay: (idx * 0.06) + 's' }"
            @click="goDetail(n.id)"
          >
            <div class="news-date-box">
              <span class="date-day">{{ formatMonthDay(n.publishTime).day }}</span>
              <span class="date-month">{{ formatMonthDay(n.publishTime).year }}.{{ formatMonthDay(n.publishTime).month }}</span>
            </div>
            <div class="news-body">
              <div class="news-meta">
                <span class="news-tag" :style="{ color: newsCategoryColor(n.category), borderColor: newsCategoryColor(n.category) }">
                  {{ newsCategoryLabel(n.category) }}
                </span>
                <span class="news-date-text">{{ formatDate(n.publishTime, 'iso') }}</span>
              </div>
              <h3 class="news-title">{{ n.title }}</h3>
              <p class="news-summary">{{ n.summary }}</p>
              <span class="news-more">阅读全文 →</span>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">
          <p>暂无资讯。</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.news-view {
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
    radial-gradient(ellipse at 30% 50%, rgba(168, 150, 212, 0.14), transparent 55%),
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
  box-shadow: 0 0 6px var(--accent-3);
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
  padding: 18px 0;
}

.filter-inner {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 6px 18px;
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

/* ===== 资讯列表 ===== */
.news-section {
  background: var(--bg);
  padding: 60px 0 100px;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 32px;
  padding: 32px 36px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform 0.4s var(--ease), border-color 0.4s var(--ease), box-shadow 0.4s var(--ease);
}

.news-item:hover {
  transform: translateX(6px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-card);
}

.news-date-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding-right: 28px;
  border-right: 1px solid var(--border);
}

.date-day {
  font-size: 48px;
  font-weight: 200;
  color: var(--accent);
  line-height: 1;
  text-shadow: 0 0 16px rgba(110, 168, 196, 0.4);
}

.date-month {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-muted);
  margin-top: 8px;
}

.news-body {
  display: flex;
  flex-direction: column;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.news-tag {
  padding: 3px 12px;
  font-size: 11px;
  letter-spacing: 2px;
  border: 1px solid;
  border-radius: 999px;
}

.news-date-text {
  font-size: 12px;
  letter-spacing: 1.5px;
  color: var(--text-dim);
}

.news-title {
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 3px;
  color: var(--text);
  margin-bottom: 12px;
  line-height: 1.4;
}

.news-summary {
  font-size: 14px;
  letter-spacing: 1px;
  color: var(--text-muted);
  line-height: 1.9;
  margin-bottom: 16px;
}

.news-more {
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--accent);
  margin-top: auto;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
  font-size: 14px;
  letter-spacing: 2px;
}

@media (max-width: 768px) {
  .page-hero {
    height: 320px;
  }

  .news-section {
    padding: 40px 0 80px;
  }

  .news-item {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 24px 22px;
  }

  .news-date-box {
    flex-direction: row;
    align-items: baseline;
    gap: 12px;
    padding-right: 0;
    padding-bottom: 14px;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .date-day {
    font-size: 32px;
  }

  .news-title {
    font-size: 18px;
    letter-spacing: 2px;
  }
}
</style>
