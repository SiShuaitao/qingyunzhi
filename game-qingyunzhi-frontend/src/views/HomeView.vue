<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchGameInfo, fetchBanners, fetchFeatures, fetchCharacters, fetchSects, fetchLatestNews } from '@/api/portal'
import { useReveal, refreshReveal } from '@/composables/useReveal'
import { coverGradient, newsCategoryLabel, newsCategoryColor, roleColor, difficultyColor, formatDate } from '@/utils'
import type { GameMeta, Banner, Feature, Character, Sect, NewsItem } from '@/types'

const router = useRouter()
useReveal()

const game = ref<GameMeta | null>(null)
const banners = ref<Banner[]>([])
const features = ref<Feature[]>([])
const characters = ref<Character[]>([])
const sects = ref<Sect[]>([])
const news = ref<NewsItem[]>([])
const loading = ref(true)

const currentBanner = ref(0)
let bannerTimer: number | null = null

const activeCharacter = ref(0)

const activeBanner = computed(() => banners.value[currentBanner.value] || null)

function startBannerTimer() {
  stopBannerTimer()
  if (banners.value.length <= 1) return
  bannerTimer = window.setInterval(() => {
    currentBanner.value = (currentBanner.value + 1) % banners.value.length
  }, 6500)
}

function stopBannerTimer() {
  if (bannerTimer !== null) {
    clearInterval(bannerTimer)
    bannerTimer = null
  }
}

function goBanner(index: number) {
  currentBanner.value = index
  startBannerTimer()
}

function selectCharacter(index: number) {
  activeCharacter.value = index
}

async function loadAll() {
  const [g, b, f, c, s, n] = await Promise.all([
    fetchGameInfo(),
    fetchBanners(),
    fetchFeatures(),
    fetchCharacters(),
    fetchSects(),
    fetchLatestNews(3)
  ])
  game.value = g
  banners.value = b
  features.value = f
  characters.value = c
  sects.value = s
  news.value = n
  loading.value = false
  startBannerTimer()
  requestAnimationFrame(() => refreshReveal())
}

onMounted(loadAll)
onBeforeUnmount(stopBannerTimer)

const featuredCharacters = computed(() => characters.value.slice(0, 4))
const activeChar = computed(() => featuredCharacters.value[activeCharacter.value] || null)

// ============ 预约表单 ============
const reserveForm = ref({ phone: '', platform: 'iOS' })
const reserveDone = ref(false)
const reserveError = ref('')

function submitReserve() {
  reserveError.value = ''
  const phone = reserveForm.value.phone.trim()
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    reserveError.value = '请输入有效的 11 位手机号'
    return
  }
  // 前端模拟预约成功（无后端持久化）
  reserveDone.value = true
}

function resetReserve() {
  reserveDone.value = false
  reserveForm.value = { phone: '', platform: 'iOS' }
}
</script>

<template>
  <div class="home">
    <!-- Hero 主视觉 · 水墨山水画卷 -->
    <section class="hero">
      <!-- 卷轴左右木轴 -->
      <div class="scroll-rod scroll-rod-left" aria-hidden="true"></div>
      <div class="scroll-rod scroll-rod-right" aria-hidden="true"></div>

      <!-- 水墨底色（多 Banner 轮播） -->
      <div class="hero-slides">
        <transition-group name="banner-fade">
          <div
            v-for="(banner, idx) in banners"
            v-show="idx === currentBanner"
            :key="banner.id"
            class="hero-slide"
            :style="{ background: coverGradient(banner.cover) }"
          ></div>
        </transition-group>
      </div>

      <!-- 水墨山水场景 -->
      <div class="hero-scene" aria-hidden="true">
        <svg class="mountains mountains-far" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice">
          <path d="M0,300 L120,235 L240,280 L360,205 L500,262 L640,212 L780,272 L900,222 L1040,282 L1180,232 L1320,290 L1440,252 L1440,400 L0,400 Z" fill="#4a4a4a" opacity="0.5"/>
        </svg>
        <svg class="mountains mountains-mid" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice">
          <path d="M0,330 L100,282 L220,322 L340,252 L460,312 L580,262 L700,322 L820,272 L940,322 L1080,282 L1200,332 L1320,292 L1440,332 L1440,400 L0,400 Z" fill="#383838" opacity="0.65"/>
        </svg>
        <svg class="mountains mountains-near" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice">
          <path d="M0,362 L120,332 L260,362 L400,322 L540,362 L680,332 L820,366 L960,336 L1100,366 L1240,340 L1380,372 L1440,352 L1440,400 L0,400 Z" fill="#262626" opacity="0.85"/>
        </svg>

        <div class="river"></div>

        <!-- 飞鸟剪影 -->
        <svg class="birds" viewBox="0 0 200 60" preserveAspectRatio="xMinYMin meet">
          <path class="bird bird-1" d="M0,10 q3,-5 6,0 q3,-5 6,0" stroke="#d8d0bc" stroke-width="1.2" fill="none" opacity="0.7"/>
          <path class="bird bird-2" d="M0,10 q2.5,-4 5,0 q2.5,-4 5,0" stroke="#d8d0bc" stroke-width="1" fill="none" opacity="0.6"/>
          <path class="bird bird-3" d="M0,10 q3.5,-6 7,0 q3.5,-6 7,0" stroke="#d8d0bc" stroke-width="1.2" fill="none" opacity="0.55"/>
        </svg>

        <!-- 烟雨 / 雾气 -->
        <div class="mist mist-1"></div>
        <div class="mist mist-2"></div>
        <div class="mist mist-3"></div>

        <!-- 落霜 / 雪花 -->
        <div class="snow-layer">
          <span
            v-for="n in 24"
            :key="'snow-' + n"
            class="snowflake"
            :style="{
              left: (n * 4 + (n % 3) * 2) + '%',
              animationDelay: (n * 0.5) + 's',
              animationDuration: (6 + (n % 5) * 2) + 's',
              opacity: 0.4 + (n % 3) * 0.2
            }"
          ></span>
        </div>
      </div>

      <!-- 卷轴展开遮罩 -->
      <div class="scroll-unfurl" aria-hidden="true">
        <div class="unfurl-panel unfurl-left"></div>
        <div class="unfurl-panel unfurl-right"></div>
      </div>

      <!-- 朱砂印章 -->
      <div class="hero-seal-wrap" aria-hidden="true">
        <span class="hero-seal">青雲</span>
      </div>

      <div class="hero-overlay"></div>

      <div class="hero-content container">
        <div class="hero-text" :class="{ show: !loading }">
          <p class="hero-kicker">{{ game?.subtitle || 'QING YUN' }}</p>
          <h1 class="hero-title">
            <span class="title-cn">{{ activeBanner?.title || game?.name || '青云志' }}</span>
          </h1>
          <p class="hero-subtitle">{{ activeBanner?.subtitle || game?.tagline || '水墨工笔 · 烟雨留白 · 国风仙侠' }}</p>
          <p class="hero-desc">{{ game?.summary || '水墨晕染、烟雨霜雪，人物立绘于画卷中浮现。' }}</p>
          <div class="hero-actions">
            <a href="#features" class="btn btn-primary">探索青云</a>
            <a href="#about" class="btn btn-ghost">世界观</a>
          </div>
        </div>
      </div>

      <!-- Banner 指示器 -->
      <div class="hero-dots" v-if="banners.length > 1">
        <button
          v-for="(b, idx) in banners"
          :key="b.id"
          class="hero-dot"
          :class="{ active: idx === currentBanner }"
          @click="goBanner(idx)"
          :aria-label="b.title"
        ></button>
      </div>

      <!-- 滚动提示 -->
      <div class="hero-scroll">
        <span class="scroll-text">展卷</span>
        <span class="scroll-line"></span>
      </div>
    </section>

    <!-- 世界观引言 -->
    <section class="intro section">
      <div class="cool-fog"></div>
      <svg class="bamboo bamboo-left" viewBox="0 0 60 300" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">
        <path d="M30,300 L30,20" stroke="#6b8e7f" stroke-width="2" fill="none" opacity="0.35"/>
        <path d="M30,80 q-12,-6 -20,-18 M30,80 q12,-6 20,-18" stroke="#6b8e7f" stroke-width="1.5" fill="none" opacity="0.3"/>
        <path d="M30,150 q-14,-7 -24,-20 M30,150 q14,-7 24,-20" stroke="#6b8e7f" stroke-width="1.5" fill="none" opacity="0.28"/>
        <path d="M30,220 q-12,-6 -20,-18 M30,220 q12,-6 20,-18" stroke="#6b8e7f" stroke-width="1.5" fill="none" opacity="0.26"/>
      </svg>
      <svg class="bamboo bamboo-right" viewBox="0 0 60 300" preserveAspectRatio="xMinYMid meet" aria-hidden="true">
        <path d="M30,300 L30,20" stroke="#6b8e7f" stroke-width="2" fill="none" opacity="0.35"/>
        <path d="M30,70 q12,-6 20,-18 M30,70 q-12,-6 -20,-18" stroke="#6b8e7f" stroke-width="1.5" fill="none" opacity="0.3"/>
        <path d="M30,140 q14,-7 24,-20 M30,140 q-14,-7 -24,-20" stroke="#6b8e7f" stroke-width="1.5" fill="none" opacity="0.28"/>
        <path d="M30,215 q12,-6 20,-18 M30,215 q-12,-6 -20,-18" stroke="#6b8e7f" stroke-width="1.5" fill="none" opacity="0.26"/>
      </svg>
      <div class="container intro-content">
        <p class="intro-kicker reveal">QING YUN · 世界观</p>
        <h2 class="intro-title reveal">星河为引，剑意为锋</h2>
        <p class="intro-text reveal">
          《青云志》以水墨工笔重写仙侠。远山如黛，烟雨如诗，剑气霜华皆化作笔尖流转。
          极简留白之中，藏着一段清冷唯美的叙事。
        </p>
        <p class="intro-quote reveal">
          「每一帧都是一卷可驻足的水墨，每一剑都是一句未说出口的告白。」
        </p>
        <span class="intro-seal reveal" aria-hidden="true">雲</span>
      </div>
    </section>

    <!-- 玩法特色 -->
    <section id="features" class="section features-section">
      <div class="container">
        <div class="section-head reveal">
          <p class="section-kicker">FEATURES</p>
          <h2 class="section-title">玩法特色</h2>
          <p class="section-desc">水墨工笔与烟雨光影，定义清冷唯美的国风仙侠叙事。</p>
        </div>

        <div class="features-grid">
          <article
            v-for="(feat, idx) in features"
            :key="feat.id"
            class="feature-card reveal"
            :style="{ transitionDelay: (idx * 0.08) + 's' }"
          >
            <span class="feature-seal" aria-hidden="true">{{ feat.icon }}</span>
            <span class="feature-num" aria-hidden="true">◎ {{ String(idx + 1).padStart(2, '0') }}</span>
            <h3 class="feature-title">{{ feat.title }}</h3>
            <p class="feature-summary">{{ feat.summary }}</p>
            <p class="feature-desc">{{ feat.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 人物立绘 · 悬浮展示 -->
    <section id="characters" class="section characters-section">
      <div class="container">
        <div class="section-head reveal">
          <p class="section-kicker">CHARACTERS</p>
          <h2 class="section-title">青云七子</h2>
          <p class="section-desc">烟雨中独行，剑出无声。每一道身影，皆是水墨长卷中的一笔。</p>
        </div>

        <div class="characters-stage" v-if="activeChar">
          <div class="stage-left reveal">
            <p class="char-faction">{{ activeChar.faction }}</p>
            <h3 class="char-name">{{ activeChar.name }}</h3>
            <p class="char-title">{{ activeChar.title }}</p>
            <div class="char-meta">
              <span class="meta-tag" :style="{ color: roleColor(activeChar.role), borderColor: roleColor(activeChar.role) }">{{ activeChar.role }}</span>
              <span class="meta-tag meta-diff" :style="{ color: difficultyColor(activeChar.difficulty), borderColor: difficultyColor(activeChar.difficulty) }">难度 · {{ activeChar.difficulty }}</span>
            </div>
            <p class="char-desc">{{ activeChar.description }}</p>
            <button class="btn btn-ghost char-more" @click="router.push('/characters')">查看全部人物</button>
          </div>

          <div class="stage-right reveal">
            <div class="char-portrait" :style="{ background: coverGradient(activeChar.cover) }">
              <div class="portrait-mist"></div>
              <div class="portrait-ring"></div>
              <div class="portrait-rain">
                <span
                  v-for="n in 14"
                  :key="'rain-' + n"
                  class="r-drop"
                  :style="{
                    left: (n * 7) + '%',
                    animationDelay: (n * 0.4) + 's',
                    animationDuration: (3 + (n % 3)) + 's'
                  }"
                ></span>
              </div>
              <span class="portrait-glyph">{{ activeChar.name.charAt(0) }}</span>
              <span class="portrait-seal" aria-hidden="true">青</span>
            </div>
          </div>
        </div>

        <div class="characters-thumbs">
          <button
            v-for="(c, idx) in featuredCharacters"
            :key="c.id"
            class="char-thumb"
            :class="{ active: idx === activeCharacter }"
            @click="selectCharacter(idx)"
          >
            <span class="thumb-bg" :style="{ background: coverGradient(c.cover) }"></span>
            <span class="thumb-name">{{ c.name }}</span>
            <span class="thumb-role">{{ c.role }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 门派势力 -->
    <section id="sects" class="section sects-section">
      <div class="cool-fog"></div>
      <div class="container">
        <div class="section-head reveal">
          <p class="section-kicker">SECTS</p>
          <h2 class="section-title">门派势力</h2>
          <p class="section-desc">青云七界，四宗立世。烟雨缭绕间，各有清冷信仰。</p>
        </div>

        <div class="sects-grid">
          <article
            v-for="(sect, idx) in sects"
            :key="sect.id"
            class="sect-card reveal"
            :style="{ transitionDelay: (idx * 0.1) + 's' }"
          >
            <div class="sect-cover" :style="{ background: coverGradient(sect.cover) }">
              <div class="sect-cover-mist"></div>
              <span class="sect-philosophy">{{ sect.philosophy }}</span>
              <span class="sect-seal" aria-hidden="true">宗</span>
            </div>
            <div class="sect-body">
              <p class="sect-subtitle">{{ sect.subtitle }}</p>
              <h3 class="sect-name">{{ sect.name }}</h3>
              <p class="sect-desc">{{ sect.description }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 资讯 -->
    <section id="news" class="section news-section">
      <div class="container">
        <div class="section-head reveal">
          <p class="section-kicker">NEWS</p>
          <h2 class="section-title">最新资讯</h2>
          <p class="section-desc">水墨幕后，世界观解读与限量测试动态。</p>
        </div>

        <div class="news-grid">
          <article
            v-for="(n, idx) in news"
            :key="n.id"
            class="news-card reveal"
            :style="{ transitionDelay: (idx * 0.1) + 's' }"
            @click="router.push(`/news/${n.id}`)"
          >
            <div class="news-meta">
              <span class="news-tag" :style="{ color: newsCategoryColor(n.category), borderColor: newsCategoryColor(n.category) }">
                {{ newsCategoryLabel(n.category) }}
              </span>
              <span class="news-date">{{ formatDate(n.publishTime, 'iso') }}</span>
            </div>
            <h3 class="news-title">{{ n.title }}</h3>
            <p class="news-summary">{{ n.summary }}</p>
            <span class="news-more">展卷阅读 →</span>
          </article>
        </div>

        <div class="news-all reveal">
          <button class="btn btn-ghost" @click="router.push('/news')">查看全部资讯</button>
        </div>
      </div>
    </section>

    <!-- 预约 · 清冷之约 -->
    <section id="reserve" class="section reserve-section">
      <div class="cool-fog"></div>
      <div class="container">
        <div class="section-head reveal">
          <p class="section-kicker">RESERVE</p>
          <h2 class="section-title">预约青云</h2>
          <p class="section-desc">留下印记，共赴一场清冷之约。水墨长卷因你而展开。</p>
        </div>

        <div class="reserve-grid">
          <!-- 左：预约信息 -->
          <div class="reserve-info reveal">
            <div class="reserve-block">
              <p class="reserve-label">上线平台</p>
              <div class="platform-badges">
                <span class="platform-badge">iOS</span>
                <span class="platform-badge">Android</span>
                <span class="platform-badge">PC</span>
                <span class="platform-badge">鸿蒙</span>
              </div>
            </div>

            <div class="reserve-block">
              <p class="reserve-label">公测定档</p>
              <p class="reserve-date">2026 年 · 秋</p>
              <p class="reserve-sub">烟雨霜雪之时，青云七界启程</p>
            </div>

            <div class="reserve-block">
              <p class="reserve-label">里程碑奖励</p>
              <ul class="milestone-list">
                <li>
                  <span class="milestone-num">10 万</span>
                  <span class="milestone-reward">水墨立绘壁纸一套</span>
                </li>
                <li>
                  <span class="milestone-num">50 万</span>
                  <span class="milestone-reward">「清冷之约」限定称号</span>
                </li>
                <li>
                  <span class="milestone-num">100 万</span>
                  <span class="milestone-reward">首轮内测资格 · 七子头像框</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- 右：预约表单 -->
          <div class="reserve-form-wrap reveal">
            <div class="reserve-seal" aria-hidden="true">约</div>

            <form v-if="!reserveDone" class="reserve-form" @submit.prevent="submitReserve">
              <p class="form-title">立即预约</p>
              <p class="form-desc">填写手机号，第一时间获取测试资格与清冷之礼。</p>

              <label class="form-field">
                <span class="field-label">手机号</span>
                <input
                  v-model="reserveForm.phone"
                  type="tel"
                  maxlength="11"
                  placeholder="请输入 11 位手机号"
                  class="field-input"
                />
              </label>

              <label class="form-field">
                <span class="field-label">预约平台</span>
                <select v-model="reserveForm.platform" class="field-select">
                  <option value="iOS">iOS</option>
                  <option value="Android">Android</option>
                  <option value="PC">PC</option>
                  <option value="鸿蒙">鸿蒙</option>
                </select>
              </label>

              <p v-if="reserveError" class="form-error">{{ reserveError }}</p>

              <button type="submit" class="btn btn-primary reserve-submit">预约青云</button>
              <p class="form-hint">预约即同意接收青云志测试与上线通知</p>
            </form>

            <div v-else class="reserve-success">
              <span class="success-glyph" aria-hidden="true">✦</span>
              <p class="success-title">预约成功</p>
              <p class="success-desc">清冷之约已立。烟雨霜雪之时，青云七界等你归来。</p>
              <p class="success-platform">预约平台：{{ reserveForm.platform }}</p>
              <button class="btn btn-ghost" @click="resetReserve">重新填写</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 关于 · 世界观 CTA -->
    <section id="about" class="section about-cta">
      <div class="about-scene" aria-hidden="true">
        <svg class="mountains mountains-far" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice">
          <path d="M0,300 L120,235 L240,280 L360,205 L500,262 L640,212 L780,272 L900,222 L1040,282 L1180,232 L1320,290 L1440,252 L1440,400 L0,400 Z" fill="#3a3a3a" opacity="0.55"/>
        </svg>
        <svg class="mountains mountains-near" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice">
          <path d="M0,362 L120,332 L260,362 L400,322 L540,362 L680,332 L820,366 L960,336 L1100,366 L1240,340 L1380,372 L1440,352 L1440,400 L0,400 Z" fill="#222" opacity="0.8"/>
        </svg>
        <div class="about-mist"></div>
      </div>
      <div class="about-overlay"></div>
      <div class="container about-content">
        <p class="about-kicker reveal">ABOUT QING YUN</p>
        <h2 class="about-title reveal">于水墨山水之间<br/>共赴一场清冷之约</h2>
        <p class="about-text reveal">
          星河为引，剑意为锋。在烟雨笼罩的山水与幻境之间，揭开一段跨越两界的清冷唯美叙事。
        </p>
        <div class="about-actions reveal">
          <button class="btn btn-primary" @click="router.push('/about')">了解青云志</button>
          <button class="btn btn-ghost" @click="router.push('/characters')">人物档案</button>
        </div>
        <span class="about-seal" aria-hidden="true">志</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  position: relative;
}

/* ===== Hero · 水墨山水画卷 ===== */
.hero {
  position: relative;
  height: 100vh;
  min-height: 660px;
  overflow: hidden;
  background: linear-gradient(180deg, #1a1a1a 0%, #2c2c2c 100%);
}

/* 卷轴木轴 */
.scroll-rod {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 14px;
  z-index: 6;
  background:
    linear-gradient(90deg, rgba(0,0,0,0.45), rgba(120,90,60,0.85) 45%, rgba(180,150,100,0.9) 50%, rgba(120,90,60,0.85) 55%, rgba(0,0,0,0.45));
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.5);
}
.scroll-rod::before,
.scroll-rod::after {
  content: '';
  position: absolute;
  left: -5px;
  right: -5px;
  height: 22px;
  background: linear-gradient(90deg, #5a4332, #8a6a48 50%, #5a4332);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.5);
}
.scroll-rod::before { top: -6px; }
.scroll-rod::after { bottom: -6px; }
.scroll-rod-left { left: 0; }
.scroll-rod-right { right: 0; }

.hero-slides {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.banner-fade-enter-active,
.banner-fade-leave-active {
  transition: opacity 1.4s var(--ease);
}
.banner-fade-enter-from,
.banner-fade-leave-to {
  opacity: 0;
}

/* 水墨山水场景 */
.hero-scene {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.mountains {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 46%;
}
.mountains-far { height: 50%; opacity: 0.8; }
.mountains-mid { height: 38%; }
.mountains-near { height: 28%; }

.river {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 14%;
  background:
    linear-gradient(180deg, rgba(20,20,20,0.0), rgba(10,10,10,0.85) 60%, #0e0e0e),
    repeating-linear-gradient(90deg, rgba(220,210,190,0.05) 0 2px, transparent 2px 14px);
}

.birds {
  position: absolute;
  top: 22%;
  right: 16%;
  width: 120px;
  height: 40px;
}
.bird {
  transform-origin: center;
}
.bird-1 { animation: bird-fly 26s linear infinite; }
.bird-2 { transform: translate(28px, 14px); animation: bird-fly 30s linear infinite 2s; }
.bird-3 { transform: translate(54px, 6px); animation: bird-fly 34s linear infinite 4s; }

@keyframes bird-fly {
  0% { transform: translate(-40px, 0) scale(1); opacity: 0; }
  10% { opacity: 0.7; }
  50% { transform: translate(40vw, -20px) scale(0.85); }
  90% { opacity: 0.5; }
  100% { transform: translate(80vw, 10px) scale(0.7); opacity: 0; }
}

/* 烟雨 / 雾气 */
.mist {
  position: absolute;
  left: -20%;
  width: 140%;
  height: 120px;
  background: radial-gradient(ellipse at center, rgba(230,225,210,0.16), transparent 70%);
  filter: blur(8px);
  pointer-events: none;
}
.mist-1 { top: 38%; animation: mist-drift 28s linear infinite; }
.mist-2 { top: 52%; height: 160px; opacity: 0.7; animation: mist-drift 36s linear infinite reverse; }
.mist-3 { top: 66%; height: 90px; opacity: 0.6; animation: mist-drift 24s linear infinite 4s; }

@keyframes mist-drift {
  0% { transform: translateX(-8%); }
  50% { transform: translateX(8%); }
  100% { transform: translateX(-8%); }
}

/* 落霜 / 雪花 */
.snow-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.snowflake {
  position: absolute;
  top: -10px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(245, 240, 230, 0.85);
  box-shadow: 0 0 4px rgba(245, 240, 230, 0.5);
  animation: snow-fall linear infinite;
}
@keyframes snow-fall {
  0% { transform: translateY(-10px) translateX(0); opacity: 0; }
  15% { opacity: 0.9; }
  100% { transform: translateY(100vh) translateX(20px); opacity: 0; }
}

/* 卷轴展开遮罩 */
.scroll-unfurl {
  position: absolute;
  inset: 0;
  z-index: 7;
  pointer-events: none;
}
.unfurl-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50.5%;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(120,100,70,0.10), transparent 60%),
    linear-gradient(180deg, #efe8d8, #e8dfc9);
  box-shadow: 0 0 40px rgba(0,0,0,0.4);
}
.unfurl-left {
  left: 0;
  border-right: 1px solid rgba(90,67,50,0.4);
  animation: unfurl-left 1.8s var(--ease-out) 0.2s forwards;
}
.unfurl-right {
  right: 0;
  border-left: 1px solid rgba(90,67,50,0.4);
  animation: unfurl-right 1.8s var(--ease-out) 0.2s forwards;
}
@keyframes unfurl-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-101%); }
}
@keyframes unfurl-right {
  0% { transform: translateX(0); }
  100% { transform: translateX(101%); }
}

/* 朱砂印章 */
.hero-seal-wrap {
  position: absolute;
  top: 22%;
  right: 9%;
  z-index: 4;
  animation: seal-stamp 1s var(--ease-out) 1.6s both;
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
  box-shadow: inset 0 0 0 3px rgba(245,240,230,0.6), 0 6px 22px rgba(0,0,0,0.45);
  transform: rotate(-6deg);
}
@keyframes seal-stamp {
  0% { opacity: 0; transform: scale(1.6) rotate(-12deg); }
  60% { opacity: 1; transform: scale(0.94) rotate(-4deg); }
  100% { opacity: 1; transform: scale(1) rotate(-6deg); }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.30) 55%, rgba(10,10,10,0.55) 100%),
    linear-gradient(180deg, rgba(10,10,10,0.35) 0%, transparent 40%, rgba(8,8,8,0.85) 100%);
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  height: 100%;
  display: flex;
  align-items: center;
}

.hero-text {
  max-width: 660px;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 1s var(--ease-out), transform 1s var(--ease-out);
}
.hero-text.show {
  opacity: 1;
  transform: translateY(0);
}

.hero-kicker {
  font-family: var(--font-song);
  font-size: 13px;
  letter-spacing: 10px;
  color: #d96565;
  margin-bottom: 24px;
  text-transform: uppercase;
}

.hero-title {
  font-family: var(--font-kai);
  font-size: clamp(52px, 7.5vw, 96px);
  font-weight: 500;
  letter-spacing: 14px;
  line-height: 1.1;
  margin-bottom: 22px;
  color: var(--moon);
  text-shadow: 0 2px 24px rgba(0,0,0,0.6);
}
.title-cn {
  display: inline-block;
  border-left: 3px solid var(--accent);
  padding-left: 18px;
}

.hero-subtitle {
  font-family: var(--font-kai);
  font-size: 19px;
  letter-spacing: 6px;
  color: #c9b98a;
  margin-bottom: 28px;
  font-weight: 400;
}

.hero-desc {
  font-family: var(--font-song);
  font-size: 15px;
  letter-spacing: 1.5px;
  color: #a89e84;
  line-height: 2.1;
  margin-bottom: 40px;
  max-width: 540px;
}

.hero-actions {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.hero-dots {
  position: absolute;
  bottom: 56px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 14px;
  z-index: 5;
}
.hero-dot {
  width: 30px;
  height: 2px;
  background: rgba(237, 230, 211, 0.25);
  cursor: pointer;
  transition: background 0.4s ease, box-shadow 0.4s ease;
  padding: 0;
}
.hero-dot.active {
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
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

/* ===== 通用 section ===== */
.section {
  position: relative;
  padding: 120px 0;
}

/* ===== 世界观引言 ===== */
.intro {
  text-align: center;
  background: linear-gradient(180deg, var(--bg-soft) 0%, var(--bg-elev) 100%);
  overflow: hidden;
}
.bamboo {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 90px;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
.bamboo-left { left: 4%; }
.bamboo-right { right: 4%; }
.intro-content {
  position: relative;
  max-width: 840px;
  margin: 0 auto;
  z-index: 1;
}
.intro-kicker {
  font-family: var(--font-song);
  font-size: 12px;
  letter-spacing: 8px;
  color: var(--accent);
  margin-bottom: 28px;
}
.intro-title {
  font-family: var(--font-kai);
  font-size: clamp(32px, 4.5vw, 54px);
  font-weight: 500;
  letter-spacing: 14px;
  margin-bottom: 36px;
  color: var(--ink);
}
.intro-text {
  font-family: var(--font-song);
  font-size: 16px;
  letter-spacing: 2px;
  color: var(--text-muted);
  line-height: 2.3;
  margin-bottom: 36px;
}
.intro-quote {
  font-family: var(--font-kai);
  font-size: 19px;
  letter-spacing: 4px;
  color: var(--accent-3);
  font-style: normal;
  font-weight: 400;
  line-height: 2;
}
.intro-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  margin-top: 40px;
  font-family: var(--font-kai);
  font-size: 20px;
  color: var(--moon);
  background: var(--accent);
  border: 2px solid var(--accent);
  border-radius: 4px;
  box-shadow: inset 0 0 0 2px rgba(245,240,230,0.6);
  transform: rotate(-5deg);
}

/* ===== 玩法特色 ===== */
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
    linear-gradient(180deg, rgba(255,253,247,0.7), rgba(232,223,201,0.5)),
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
.feature-card::after {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(26,26,26,0.06);
  border-radius: 6px;
  pointer-events: none;
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
  box-shadow: inset 0 0 0 2px rgba(245,240,230,0.55);
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
.feature-summary {
  font-family: var(--font-kai);
  font-size: 14px;
  letter-spacing: 1.5px;
  color: var(--accent-3);
  margin-bottom: 18px;
}
.feature-desc {
  font-family: var(--font-song);
  font-size: 14px;
  letter-spacing: 1px;
  color: var(--text-muted);
  line-height: 2.1;
}

/* ===== 人物立绘 ===== */
.characters-section {
  background: linear-gradient(180deg, var(--bg-elev) 0%, var(--bg) 100%);
  overflow: hidden;
}
.characters-stage {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  margin-bottom: 56px;
}
.stage-left {
  padding: 24px 0;
}
.char-faction {
  font-family: var(--font-song);
  font-size: 12px;
  letter-spacing: 6px;
  color: var(--accent-2);
  margin-bottom: 18px;
}
.char-name {
  font-family: var(--font-kai);
  font-size: clamp(40px, 5vw, 66px);
  font-weight: 500;
  letter-spacing: 12px;
  color: var(--ink);
  margin-bottom: 12px;
}
.char-title {
  font-family: var(--font-kai);
  font-size: 18px;
  letter-spacing: 4px;
  color: var(--accent-3);
  margin-bottom: 28px;
  font-weight: 400;
}
.char-meta {
  display: flex;
  gap: 14px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.meta-tag {
  padding: 5px 16px;
  font-family: var(--font-kai);
  font-size: 13px;
  letter-spacing: 2px;
  border: 1px solid;
  border-radius: 999px;
  background: rgba(255,253,247,0.5);
}
.char-desc {
  font-family: var(--font-song);
  font-size: 15px;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  line-height: 2.2;
  margin-bottom: 36px;
  max-width: 480px;
}
.char-more {
  margin-top: 4px;
}
.stage-right {
  display: flex;
  justify-content: center;
}
.char-portrait {
  position: relative;
  width: 380px;
  height: 520px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-hover), 0 0 60px rgba(26,26,26,0.25);
  animation: portrait-float 6s ease-in-out infinite;
}
@keyframes portrait-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
.portrait-mist {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(230,225,210,0.16), transparent 55%),
    linear-gradient(180deg, transparent 45%, rgba(10,10,10,0.78) 100%);
}
.portrait-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 280px;
  height: 280px;
  border: 1px solid rgba(230,225,210,0.22);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ring-rotate 22s linear infinite;
}
.portrait-ring::before,
.portrait-ring::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  border: 1px dashed rgba(230,225,210,0.14);
}
.portrait-ring::before { inset: -40px; }
.portrait-ring::after {
  inset: 40px;
  border-style: solid;
  border-color: rgba(107,142,127,0.22);
}
@keyframes ring-rotate {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
.portrait-rain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.r-drop {
  position: absolute;
  top: -20px;
  width: 1px;
  height: 18px;
  background: linear-gradient(180deg, transparent, rgba(230,225,210,0.55));
  animation: rain-fall linear infinite;
}
@keyframes rain-fall {
  0% { transform: translateY(-20px); opacity: 0; }
  20% { opacity: 0.8; }
  100% { transform: translateY(540px); opacity: 0; }
}
.portrait-glyph {
  position: absolute;
  bottom: 32px;
  left: 32px;
  font-family: var(--font-kai);
  font-size: 104px;
  font-weight: 500;
  color: rgba(237,230,211,0.92);
  text-shadow: 0 2px 20px rgba(0,0,0,0.5);
  line-height: 1;
}
.portrait-seal {
  position: absolute;
  top: 26px;
  right: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-family: var(--font-kai);
  font-size: 20px;
  color: var(--moon);
  background: var(--accent);
  border: 2px solid var(--accent);
  border-radius: 4px;
  box-shadow: inset 0 0 0 2px rgba(245,240,230,0.6), 0 4px 12px rgba(0,0,0,0.4);
  transform: rotate(-5deg);
}

.characters-thumbs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.char-thumb {
  position: relative;
  padding: 24px 20px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.4s var(--ease), border-color 0.4s var(--ease);
  text-align: left;
}
.char-thumb:hover {
  transform: translateY(-4px);
  border-color: var(--border-strong);
}
.char-thumb.active {
  border-color: var(--accent);
  box-shadow: 0 0 24px rgba(184,59,59,0.18);
}
.thumb-bg {
  position: absolute;
  inset: 0;
  opacity: 0.32;
  transition: opacity 0.4s ease;
}
.char-thumb:hover .thumb-bg,
.char-thumb.active .thumb-bg {
  opacity: 0.58;
}
.thumb-name {
  position: relative;
  display: block;
  font-family: var(--font-kai);
  font-size: 19px;
  letter-spacing: 4px;
  color: var(--text);
  margin-bottom: 6px;
  font-weight: 500;
}
.thumb-role {
  position: relative;
  display: block;
  font-family: var(--font-song);
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-muted);
}

/* ===== 门派 ===== */
.sects-section {
  background: var(--bg);
}
.sects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}
.sect-card {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform 0.5s var(--ease), border-color 0.5s var(--ease), box-shadow 0.5s var(--ease);
}
.sect-card:hover {
  transform: translateY(-6px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-hover);
}
.sect-cover {
  position: relative;
  height: 168px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sect-cover-mist {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 60%, rgba(230,225,210,0.14), transparent 60%),
    linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.62) 100%);
}
.sect-philosophy {
  position: relative;
  font-family: var(--font-kai);
  font-size: 21px;
  letter-spacing: 6px;
  color: rgba(237,230,211,0.94);
  font-weight: 500;
  text-shadow: 0 2px 14px rgba(0,0,0,0.6);
  text-align: center;
  padding: 0 12px;
}
.sect-seal {
  position: absolute;
  top: 16px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  font-family: var(--font-kai);
  font-size: 18px;
  color: var(--moon);
  background: var(--accent);
  border: 2px solid var(--accent);
  border-radius: 4px;
  box-shadow: inset 0 0 0 2px rgba(245,240,230,0.6), 0 3px 10px rgba(0,0,0,0.4);
  transform: rotate(-5deg);
}
.sect-body {
  padding: 28px 24px;
}
.sect-subtitle {
  font-family: var(--font-song);
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--accent);
  margin-bottom: 10px;
}
.sect-name {
  font-family: var(--font-kai);
  font-size: 23px;
  font-weight: 500;
  letter-spacing: 6px;
  color: var(--ink);
  margin-bottom: 16px;
}
.sect-desc {
  font-family: var(--font-song);
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--text-muted);
  line-height: 2.1;
}

/* ===== 资讯 ===== */
.news-section {
  background: linear-gradient(180deg, var(--bg-elev) 0%, var(--bg) 100%);
}
.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}
.news-card {
  position: relative;
  padding: 34px 28px;
  background:
    linear-gradient(180deg, rgba(255,253,247,0.7), rgba(232,223,201,0.45)),
    var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform 0.4s var(--ease), border-color 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.news-card::after {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(26,26,26,0.06);
  border-radius: 6px;
  pointer-events: none;
}
.news-card:hover {
  transform: translateY(-6px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-hover);
}
.news-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}
.news-tag {
  padding: 3px 12px;
  font-family: var(--font-kai);
  font-size: 12px;
  letter-spacing: 2px;
  border: 1px solid;
  border-radius: 999px;
  background: rgba(255,253,247,0.6);
}
.news-date {
  font-family: var(--font-song);
  font-size: 12px;
  letter-spacing: 1.5px;
  color: var(--text-dim);
}
.news-title {
  font-family: var(--font-kai);
  font-size: 19px;
  font-weight: 500;
  letter-spacing: 2px;
  color: var(--ink);
  margin-bottom: 14px;
  line-height: 1.5;
}
.news-summary {
  font-family: var(--font-song);
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--text-muted);
  line-height: 1.95;
  margin-bottom: 20px;
}
.news-more {
  font-family: var(--font-kai);
  font-size: 14px;
  letter-spacing: 3px;
  color: var(--accent);
}
.news-all {
  text-align: center;
  margin-top: 56px;
}

/* ===== 预约 ===== */
.reserve-section {
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-elev) 100%);
  overflow: hidden;
}
.reserve-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 56px;
  align-items: start;
  margin-top: 16px;
}
.reserve-info {
  display: flex;
  flex-direction: column;
  gap: 36px;
}
.reserve-block {
  position: relative;
  padding-left: 20px;
  border-left: 2px solid var(--accent);
}
.reserve-label {
  font-family: var(--font-song);
  font-size: 12px;
  letter-spacing: 5px;
  color: var(--accent);
  margin-bottom: 14px;
}
.platform-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.platform-badge {
  padding: 6px 18px;
  font-family: var(--font-kai);
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--ink);
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: rgba(255, 253, 247, 0.6);
}
.reserve-date {
  font-family: var(--font-kai);
  font-size: 32px;
  font-weight: 500;
  letter-spacing: 8px;
  color: var(--ink);
  margin-bottom: 6px;
}
.reserve-sub {
  font-family: var(--font-song);
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--text-muted);
}
.milestone-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.milestone-list li {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 14px 18px;
  background: rgba(255, 253, 247, 0.55);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color 0.35s var(--ease), transform 0.35s var(--ease);
}
.milestone-list li:hover {
  border-color: var(--accent);
  transform: translateX(6px);
}
.milestone-num {
  flex-shrink: 0;
  min-width: 64px;
  font-family: var(--font-kai);
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 1px;
  color: var(--moon);
  background: var(--accent);
  border-radius: 4px;
  padding: 6px 10px;
  text-align: center;
  box-shadow: inset 0 0 0 2px rgba(245, 240, 230, 0.5);
}
.milestone-reward {
  font-family: var(--font-kai);
  font-size: 15px;
  letter-spacing: 2px;
  color: var(--text);
}

.reserve-form-wrap {
  position: relative;
  padding: 40px 36px 36px;
  background:
    linear-gradient(180deg, rgba(255, 253, 247, 0.75), rgba(232, 223, 201, 0.5)),
    var(--bg-soft);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-hover);
}
.reserve-form-wrap::after {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(26, 26, 26, 0.06);
  border-radius: 6px;
  pointer-events: none;
}
.reserve-seal {
  position: absolute;
  top: -18px;
  right: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  font-family: var(--font-kai);
  font-size: 24px;
  color: var(--moon);
  background: var(--accent);
  border: 2px solid var(--accent);
  border-radius: 6px;
  box-shadow: inset 0 0 0 2px rgba(245, 240, 230, 0.6), 0 4px 14px rgba(0, 0, 0, 0.25);
  transform: rotate(-5deg);
  z-index: 2;
}
.form-title {
  font-family: var(--font-kai);
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 6px;
  color: var(--ink);
  margin-bottom: 8px;
}
.form-desc {
  font-family: var(--font-song);
  font-size: 13px;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  line-height: 1.9;
  margin-bottom: 26px;
}
.form-field {
  display: block;
  margin-bottom: 20px;
}
.field-label {
  display: block;
  font-family: var(--font-song);
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--text-dim);
  margin-bottom: 8px;
}
.field-input,
.field-select {
  width: 100%;
  padding: 12px 16px;
  font-family: var(--font-kai);
  font-size: 15px;
  letter-spacing: 2px;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
}
.field-input:focus,
.field-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(184, 59, 59, 0.12);
}
.field-select {
  cursor: pointer;
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, var(--accent) 50%), linear-gradient(135deg, var(--accent) 50%, transparent 50%);
  background-position: calc(100% - 18px) center, calc(100% - 12px) center;
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
  padding-right: 36px;
}
.form-error {
  font-family: var(--font-kai);
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--accent);
  margin-bottom: 16px;
}
.reserve-submit {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  letter-spacing: 6px;
  margin-top: 4px;
}
.form-hint {
  font-family: var(--font-song);
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--text-dim);
  text-align: center;
  margin-top: 14px;
}

.reserve-success {
  text-align: center;
  padding: 20px 0 8px;
}
.success-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  font-size: 30px;
  color: var(--moon);
  background: var(--accent-2);
  border-radius: 50%;
  margin-bottom: 20px;
  animation: success-pop 0.6s var(--ease-out);
}
@keyframes success-pop {
  0% { opacity: 0; transform: scale(0.4); }
  60% { opacity: 1; transform: scale(1.12); }
  100% { opacity: 1; transform: scale(1); }
}
.success-title {
  font-family: var(--font-kai);
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 6px;
  color: var(--ink);
  margin-bottom: 10px;
}
.success-desc {
  font-family: var(--font-song);
  font-size: 13px;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  line-height: 1.9;
  margin-bottom: 8px;
}
.success-platform {
  font-family: var(--font-kai);
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--accent-2);
  margin-bottom: 24px;
}

/* ===== 关于 CTA ===== */
.about-cta {
  position: relative;
  background: linear-gradient(180deg, #1a1a1a 0%, #2c2c2c 100%);
  text-align: center;
  overflow: hidden;
}
.about-scene {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.about-mist {
  position: absolute;
  left: 0;
  right: 0;
  top: 48%;
  height: 140px;
  background: radial-gradient(ellipse at center, rgba(230,225,210,0.12), transparent 70%);
  filter: blur(8px);
}
.about-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.2) 50%, rgba(8,8,8,0.85) 100%);
}
.about-content {
  position: relative;
  z-index: 2;
  max-width: 780px;
  margin: 0 auto;
}
.about-kicker {
  font-family: var(--font-song);
  font-size: 12px;
  letter-spacing: 8px;
  color: #d96565;
  margin-bottom: 28px;
}
.about-title {
  font-family: var(--font-kai);
  font-size: clamp(30px, 4.2vw, 48px);
  font-weight: 500;
  letter-spacing: 10px;
  color: var(--moon);
  margin-bottom: 32px;
  line-height: 1.5;
}
.about-text {
  font-family: var(--font-song);
  font-size: 16px;
  letter-spacing: 2px;
  color: #a89e84;
  line-height: 2.3;
  margin-bottom: 44px;
}
.about-actions {
  display: flex;
  gap: 18px;
  justify-content: center;
  flex-wrap: wrap;
}
.about-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-top: 44px;
  font-family: var(--font-kai);
  font-size: 24px;
  color: var(--moon);
  background: var(--accent);
  border: 2px solid var(--accent);
  border-radius: 4px;
  box-shadow: inset 0 0 0 2px rgba(245,240,230,0.6), 0 4px 14px rgba(0,0,0,0.4);
  transform: rotate(-5deg);
}

/* ===== 响应式 ===== */
@media (max-width: 960px) {
  .characters-stage {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .char-portrait {
    width: 300px;
    height: 420px;
  }
  .portrait-glyph {
    font-size: 80px;
  }
  .reserve-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 768px) {
  .section {
    padding: 80px 0;
  }

  .hero {
    min-height: 560px;
  }

  .hero-scroll {
    display: none;
  }

  .hero-dots {
    bottom: 32px;
  }

  .hero-title {
    letter-spacing: 10px;
  }

  .bamboo {
    display: none;
  }

  .characters-thumbs {
    grid-template-columns: repeat(2, 1fr);
  }

  .char-portrait {
    width: 260px;
    height: 360px;
  }

  .portrait-glyph {
    font-size: 64px;
    bottom: 20px;
    left: 20px;
  }

  .about-title {
    letter-spacing: 6px;
  }
}

@media (max-width: 480px) {
  .feature-card,
  .news-card {
    padding: 30px 22px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions .btn {
    width: 100%;
  }
}
</style>
