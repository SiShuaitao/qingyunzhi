<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const scrolled = ref(false)
const menuOpen = ref(false)
const route = useRoute()

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header class="app-header" :class="{ scrolled: scrolled || menuOpen }">
    <div class="header-ink-line" aria-hidden="true"></div>
    <div class="header-inner">
      <router-link to="/" class="logo" @click="closeMenu">
        <span class="logo-seal" aria-hidden="true">青</span>
        <span class="logo-text">
          <span class="logo-cn">青云志</span>
          <span class="logo-en">QING YUN</span>
        </span>
      </router-link>

      <nav class="nav" :class="{ open: menuOpen }">
        <router-link to="/" class="nav-link" :class="{ active: route.path === '/' }" @click="closeMenu">首页</router-link>
        <router-link to="/characters" class="nav-link" :class="{ active: route.path === '/characters' }" @click="closeMenu">人物</router-link>
        <router-link to="/sects" class="nav-link" :class="{ active: route.path === '/sects' }" @click="closeMenu">门派</router-link>
        <a href="/#features" class="nav-link" @click="closeMenu">玩法</a>
        <a href="/#news" class="nav-link" @click="closeMenu">资讯</a>
        <router-link to="/play" class="nav-link nav-link-play" :class="{ active: route.path === '/play' }" @click="closeMenu">试玩</router-link>
        <a href="/#reserve" class="nav-link nav-link-cta" @click="closeMenu">预约</a>
        <router-link to="/about" class="nav-link" :class="{ active: route.path === '/about' }" @click="closeMenu">关于</router-link>
      </nav>

      <button class="nav-toggle" :class="{ open: menuOpen }" @click="toggleMenu" aria-label="菜单">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--header-h);
  background: rgba(245, 240, 230, 0.72);
  backdrop-filter: blur(14px) saturate(1.1);
  -webkit-backdrop-filter: blur(14px) saturate(1.1);
  transition: background 0.4s var(--ease), box-shadow 0.4s var(--ease);
}

.app-header.scrolled {
  background: rgba(245, 240, 230, 0.94);
  box-shadow: 0 6px 24px rgba(60, 50, 40, 0.10);
}

/* 底部水墨细线 */
.header-ink-line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(26, 26, 26, 0.12) 12%,
    rgba(184, 59, 59, 0.45) 50%,
    rgba(26, 26, 26, 0.12) 88%,
    transparent 100%);
  opacity: 0.7;
}

.header-inner {
  max-width: var(--container);
  height: 100%;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* 朱砂印章 logo */
.logo-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  font-family: var(--font-kai);
  font-size: 22px;
  font-weight: 500;
  color: var(--moon);
  background: var(--accent);
  border: 2px solid var(--accent);
  border-radius: 4px;
  box-shadow: inset 0 0 0 2px rgba(245, 240, 230, 0.55), 0 3px 10px rgba(184, 59, 59, 0.32);
  transform: rotate(-3deg);
  transition: transform 0.4s var(--ease);
}

.logo:hover .logo-seal {
  transform: rotate(2deg) scale(1.04);
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.logo-cn {
  font-family: var(--font-kai);
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 5px;
  color: var(--ink);
}

.logo-en {
  font-family: var(--font-song);
  font-size: 10px;
  letter-spacing: 4px;
  color: var(--accent);
  margin-top: 4px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  position: relative;
  padding: 8px 18px;
  font-family: var(--font-kai);
  font-size: 16px;
  letter-spacing: 4px;
  color: var(--text-muted);
  transition: color 0.25s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--ink);
}

/* 水墨下划线 */
.nav-link::after {
  content: '';
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 2px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.35s var(--ease);
}

.nav-link:hover::after,
.nav-link.active::after {
  transform: scaleX(1);
}

.nav-link-cta {
  color: var(--moon) !important;
  border: 1px solid var(--accent);
  border-radius: var(--radius);
  padding: 6px 20px;
  margin-left: 12px;
  background: var(--accent);
}

.nav-link-cta::after {
  display: none;
}

.nav-link-cta:hover {
  background: var(--accent-hover);
  color: var(--moon) !important;
  box-shadow: 0 4px 14px rgba(184, 59, 59, 0.32);
}

/* 试玩入口 · 青瓷描边按钮 */
.nav-link-play {
  color: var(--accent-2) !important;
  border: 1px solid var(--accent-2);
  border-radius: var(--radius);
  padding: 6px 20px;
  margin-left: 12px;
  background: var(--accent-2-soft);
  position: relative;
}

.nav-link-play::after {
  display: none;
}

.nav-link-play:hover {
  background: rgba(107, 142, 127, 0.18);
  color: var(--accent-2-hover) !important;
  box-shadow: 0 4px 14px rgba(107, 142, 127, 0.28);
}

.nav-link-play.active {
  background: var(--accent-2);
  color: var(--moon) !important;
  box-shadow: 0 4px 14px rgba(107, 142, 127, 0.35);
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
}

.nav-toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--ink);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.nav-toggle.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.nav-toggle.open span:nth-child(2) {
  opacity: 0;
}

.nav-toggle.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 768px) {
  .nav-toggle {
    display: flex;
  }

  .nav {
    position: fixed;
    top: var(--header-h);
    right: 0;
    width: 72%;
    max-width: 300px;
    height: calc(100vh - var(--header-h));
    flex-direction: column;
    gap: 0;
    background: rgba(245, 240, 230, 0.97);
    backdrop-filter: blur(16px);
    padding: 24px 0;
    transform: translateX(100%);
    transition: transform 0.35s var(--ease);
    border-left: 1px solid var(--border);
  }

  .nav.open {
    transform: translateX(0);
  }

  .nav-link {
    display: block;
    padding: 14px 28px;
    font-size: 17px;
    border-bottom: 1px solid var(--border);
  }

  .nav-link::after {
    left: 28px;
    right: auto;
    width: 24px;
    background: var(--accent);
  }

  .nav-link-cta {
    margin: 16px 28px 0;
    text-align: center;
  }

  .nav-link-play {
    margin: 16px 28px 0;
    text-align: center;
  }

  .logo-en {
    display: none;
  }
}
</style>
