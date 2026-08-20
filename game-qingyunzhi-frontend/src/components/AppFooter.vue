<script setup lang="ts">
import { ref } from 'vue'

const year = ref(new Date().getFullYear())
</script>

<template>
  <footer class="site-footer">
    <div class="footer-fog" aria-hidden="true"></div>
    <div class="container footer-grid">
      <div class="footer-brand">
        <div class="brand-row">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="34" height="34">
              <defs>
                <linearGradient id="fg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#6ea8c4" />
                  <stop offset="100%" stop-color="#5fb3a1" />
                </linearGradient>
              </defs>
              <path d="M16 5 L16 27 M8 11 L24 21 M24 11 L8 21"
                    stroke="url(#fg)" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.9" />
              <circle cx="16" cy="16" r="2.4" fill="url(#fg)" />
              <circle cx="16" cy="5" r="1" fill="#d4e0e8" opacity="0.85" />
              <circle cx="16" cy="27" r="0.8" fill="#d4e0e8" opacity="0.65" />
              <circle cx="8" cy="11" r="0.7" fill="#8a92a8" opacity="0.8" />
              <circle cx="24" cy="21" r="0.7" fill="#8a92a8" opacity="0.8" />
            </svg>
          </span>
          <div class="brand-text">
            <span class="brand-cn">青云志</span>
            <span class="brand-en">QING YUN</span>
          </div>
        </div>
        <p class="brand-slogan">文艺仙侠 · 轻科幻 · 清冷唯美</p>
        <p class="brand-slogan">油画质感海报，冷调光影，人物立绘动态悬浮。</p>
        <p class="brand-slogan">极简高级的科幻浪漫，藏在每一帧清冷叙事中。</p>
      </div>

      <div class="footer-cols">
        <div class="footer-col">
          <h4 class="footer-title">游戏</h4>
          <ul>
            <li><router-link to="/characters">人物档案</router-link></li>
            <li><router-link to="/sects">门派势力</router-link></li>
            <li><a href="/#features">玩法特色</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">动态</h4>
          <ul>
            <li><router-link to="/news">资讯中心</router-link></li>
            <li><a href="/#news">最新资讯</a></li>
            <li><a href="/#about">世界观</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">关于</h4>
          <ul>
            <li><router-link to="/about">关于青云志</router-link></li>
            <li><a href="mailto:hr@shixingxu.com">加入我们</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="container footer-bottom">
      <p class="footer-copy">© {{ year }} 青云志 QING YUN · 版权所有</p>
      <p class="footer-icp">沪ICP备XXXXXXXX号-1 · 沪公网安备 XXXXXXXXXXXX号</p>
      <p class="footer-tip">
        健康游戏忠告：抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  position: relative;
  background: #03060c;
  border-top: 1px solid var(--border);
  padding: 72px 0 28px;
  overflow: hidden;
}

.footer-fog {
  position: absolute;
  top: -50%;
  left: 0;
  right: 0;
  height: 100%;
  background:
    radial-gradient(ellipse at 30% 100%, rgba(110, 168, 196, 0.08), transparent 60%),
    radial-gradient(ellipse at 70% 100%, rgba(95, 179, 161, 0.05), transparent 60%);
  pointer-events: none;
}

.footer-grid {
  position: relative;
  display: grid;
  grid-template-columns: 1.4fr 2fr;
  gap: 60px;
  padding-bottom: 52px;
  border-bottom: 1px solid var(--border);
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-cn {
  font-size: 22px;
  font-weight: 300;
  letter-spacing: 5px;
  color: var(--text);
}

.brand-en {
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--accent);
  margin-top: 5px;
}

.brand-slogan {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 2px;
  line-height: 2;
}

.footer-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.footer-title {
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 4px;
  color: var(--accent);
  margin-bottom: 20px;
}

.footer-col ul {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-col a {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1.5px;
  transition: color 0.25s ease, transform 0.25s ease;
  display: inline-block;
}

.footer-col a:hover {
  color: var(--accent);
  transform: translateX(3px);
}

.footer-bottom {
  position: relative;
  padding-top: 26px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-copy {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1.5px;
}

.footer-icp {
  font-size: 12px;
  color: var(--text-dim);
  letter-spacing: 1px;
}

.footer-tip {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 1px;
  line-height: 1.8;
  max-width: 720px;
  margin: 8px auto 0;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 40px;
    padding-bottom: 36px;
  }

  .footer-cols {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 520px) {
  .footer-cols {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
