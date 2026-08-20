<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchNewsById, fetchLatestNews } from '@/api/portal'
import { useReveal, refreshReveal } from '@/composables/useReveal'
import { newsCategoryLabel, newsCategoryColor, formatDate } from '@/utils'
import type { NewsItem } from '@/types'

const route = useRoute()
const router = useRouter()
useReveal()

const news = ref<NewsItem | null>(null)
const related = ref<NewsItem[]>([])
const loading = ref(true)

async function loadDetail(id: string | string[]) {
  loading.value = true
  news.value = await fetchNewsById(id as string)
  loading.value = false
  const all = await fetchLatestNews(20)
  related.value = all.filter(n => String(n.id) !== String(id)).slice(0, 3)
  requestAnimationFrame(() => refreshReveal())
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  if (route.params.id) {
    loadDetail(route.params.id)
  }
})

watch(() => route.params.id, (newId) => {
  if (newId) loadDetail(newId)
})

function goDetail(id: number) {
  router.push(`/news/${id}`)
}

function back() {
  router.push('/news')
}
</script>

<template>
  <div class="news-detail-view">
    <!-- 顶部 Banner -->
    <section class="page-hero" v-if="news">
      <div class="page-hero-bg"></div>
      <div class="page-hero-fog"></div>
      <div class="page-hero-particles">
        <span v-for="n in 12" :key="n" class="ph-particle" :style="{
          left: (n * 8) + '%',
          animationDelay: (n * 0.6) + 's',
          animationDuration: (7 + (n % 4) * 2) + 's'
        }"></span>
      </div>
      <div class="container page-hero-content">
        <div class="hero-meta reveal">
          <span class="news-tag" :style="{ color: newsCategoryColor(news.category), borderColor: newsCategoryColor(news.category) }">
            {{ newsCategoryLabel(news.category) }}
          </span>
          <span class="news-date">{{ formatDate(news.publishTime, 'iso') }}</span>
        </div>
        <h1 class="page-title reveal">{{ news.title }}</h1>
        <p class="page-summary reveal">{{ news.summary }}</p>
      </div>
    </section>

    <!-- 加载中 -->
    <section v-if="loading" class="loading-state">
      <div class="container">
        <p>正在加载资讯...</p>
      </div>
    </section>

    <!-- 内容 -->
    <section class="section detail-section" v-if="news">
      <div class="container detail-container">
        <button class="back-btn reveal" @click="back">← 返回资讯列表</button>
        <article class="detail-article reveal">
          <p class="article-content">{{ news.content }}</p>
          <div class="article-footer">
            <div class="article-divider"></div>
            <p class="article-tip">本文由《青云志》运营团队发布 · 转载请注明出处</p>
          </div>
        </article>

        <!-- 相关资讯 -->
        <div class="related" v-if="related.length">
          <h3 class="related-title reveal">相关资讯</h3>
          <div class="related-grid">
            <article
              v-for="(r, idx) in related"
              :key="r.id"
              class="related-card reveal"
              :style="{ transitionDelay: (idx * 0.08) + 's' }"
              @click="goDetail(r.id)"
            >
              <div class="related-meta">
                <span class="news-tag" :style="{ color: newsCategoryColor(r.category), borderColor: newsCategoryColor(r.category) }">
                  {{ newsCategoryLabel(r.category) }}
                </span>
                <span class="news-date">{{ formatDate(r.publishTime, 'iso') }}</span>
              </div>
              <h4 class="related-card-title">{{ r.title }}</h4>
              <p class="related-card-summary">{{ r.summary }}</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.news-detail-view {
  position: relative;
}

/* ===== Page Hero ===== */
.page-hero {
  position: relative;
  padding: 100px 0 60px;
  overflow: hidden;
  background: var(--bg);
}

.page-hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 30%, rgba(110, 168, 196, 0.14), transparent 55%),
    radial-gradient(ellipse at 70% 70%, rgba(168, 150, 212, 0.1), transparent 55%),
    linear-gradient(180deg, var(--bg-elev) 0%, var(--bg) 100%);
}

.page-hero-fog {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 70%, var(--bg) 100%);
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
  100% { transform: translateY(-200px); opacity: 0; }
}

.page-hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 820px;
  margin: 0 auto;
}

.hero-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 26px;
}

.news-tag {
  padding: 4px 14px;
  font-size: 11px;
  letter-spacing: 2px;
  border: 1px solid;
  border-radius: 999px;
}

.news-date {
  font-size: 13px;
  letter-spacing: 1.5px;
  color: var(--text-muted);
}

.page-title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 300;
  letter-spacing: 4px;
  color: var(--text);
  margin-bottom: 22px;
  line-height: 1.4;
  text-shadow: 0 0 32px rgba(110, 168, 196, 0.3);
}

.page-summary {
  font-size: 16px;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  line-height: 2;
  max-width: 640px;
  margin: 0 auto;
}

/* ===== Loading ===== */
.loading-state {
  padding: 120px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  letter-spacing: 2px;
}

/* ===== 详情 ===== */
.detail-section {
  background: var(--bg);
  padding: 60px 0 120px;
}

.detail-container {
  max-width: 820px;
}

.back-btn {
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--accent);
  margin-bottom: 36px;
  padding: 0;
  transition: color 0.25s ease, transform 0.25s ease;
}

.back-btn:hover {
  color: var(--accent-hover);
  transform: translateX(-4px);
}

.detail-article {
  padding: 48px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.article-content {
  font-size: 16px;
  letter-spacing: 1.5px;
  color: var(--text);
  line-height: 2.4;
  text-indent: 2em;
}

.article-footer {
  margin-top: 48px;
  text-align: center;
}

.article-divider {
  width: 60px;
  height: 1px;
  background: var(--accent);
  margin: 0 auto 24px;
  box-shadow: 0 0 12px var(--accent);
}

.article-tip {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-dim);
}

/* ===== 相关资讯 ===== */
.related {
  margin-top: 64px;
}

.related-title {
  font-size: 22px;
  font-weight: 300;
  letter-spacing: 6px;
  color: var(--text);
  margin-bottom: 28px;
  padding-left: 16px;
  border-left: 2px solid var(--accent);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.related-card {
  padding: 24px 22px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform 0.4s var(--ease), border-color 0.4s var(--ease);
}

.related-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-strong);
}

.related-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.related-card-title {
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 2px;
  color: var(--text);
  margin-bottom: 10px;
  line-height: 1.5;
}

.related-card-summary {
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--text-muted);
  line-height: 1.8;
}

@media (max-width: 768px) {
  .page-hero {
    padding: 80px 0 40px;
  }

  .detail-section {
    padding: 40px 0 80px;
  }

  .detail-article {
    padding: 32px 0;
  }

  .article-content {
    font-size: 15px;
    line-height: 2.2;
  }
}
</style>
