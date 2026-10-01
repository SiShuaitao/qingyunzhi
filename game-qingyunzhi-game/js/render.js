/* ============================================================
 * render.js —— Canvas 水墨渲染
 * 按 bgTheme 数据驱动绘制六类场景、角色、敌人、特效、小地图
 * ============================================================ */
(function () {
  'use strict';
  var QY = window.QY = window.QY || {};
  var CFG = QY.CONFIG;
  var game = QY.game, u = QY.utils;
  var canvas = document.getElementById('gameCanvas');
  var ctx = canvas.getContext('2d');
  QY.ctx = ctx;
  /* 视口剔除：世界坐标点是否在屏幕可见范围内（margin 为外延像素） */
  function inView(x, y, margin) {
    var sx = x - game.camera.x, sy = y - game.camera.y;
    return sx > -margin && sx < game.view.w + margin && sy > -margin && sy < game.view.h + margin;
  }

  /* 装饰缓存：同一场景的山水 / 道具位置只生成一次（按场景元数据种子） */
  var cache = {};
  function sceneCache(sc) {
    if (cache[sc.id]) return cache[sc.id];
    var rng = u.makeRng(u.hashStr(sc.id));
    var ridges = [];
    for (var r = 0; r < 3; r++) {
      var arr = [];
      for (var i = 0; i < 24; i++) arr.push(rng());
      ridges.push(arr);
    }
    var washes = [], n;
    for (n = 0; n < 26; n++) washes.push({ x: rng() * sc.width, y: rng() * sc.height, rx: 80 + rng() * 220, ry: 40 + rng() * 90 });
    var props = [];
    for (n = 0; n < 14; n++) props.push({ x: 60 + rng() * (sc.width - 120), y: 80 + rng() * (sc.height - 160), s: .7 + rng() * .6, v: rng() });
    cache[sc.id] = { ridges: ridges, washes: washes, props: props };
    return cache[sc.id];
  }
  var Renderer = {};
  QY.Renderer = Renderer;
  /* 场景切换时由 SceneManager 调用：丢弃旧场景地面层（地面层按 id 也会自建，双保险） */
  Renderer.invalidate = function () { groundLayer = null; groundId = null; };
/* 天空 + 多层视差远山（屏幕空间） */
  function drawSky(sc) {
    var g = ctx.createLinearGradient(0, 0, 0, game.view.h);
    g.addColorStop(0, sc.palette.sky);
    g.addColorStop(1, sc.palette.fog);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, game.view.w, game.view.h);
  }
  function drawRidgeLayer(sc, layerIdx, factor, baseY, amp, color) {
    var peaks = sceneCache(sc).ridges[layerIdx];
    var step = 130;
    var off = -game.camera.x * factor;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-200, game.view.h);
    for (var i = -1; i < 12; i++) {
      var x = off + i * step;
      var y = baseY - peaks[((i % 24) + 24) % 24] * amp;
      ctx.lineTo(x, y);
      ctx.lineTo(x + step / 2, baseY - peaks[(((i + 1) % 24) + 24) % 24] * amp * .55);
    }
    ctx.lineTo(game.view.w + 200, game.view.h);
    ctx.closePath(); ctx.fill();
  }
  function drawMountains(sc) {
    drawRidgeLayer(sc, 0, .15, 260, 150, 'rgba(150,158,152,.55)');
    drawRidgeLayer(sc, 1, .32, 330, 130, 'rgba(110,118,112,.65)');
    drawRidgeLayer(sc, 2, .5, 410, 110, 'rgba(82,90,84,.75)');
  }
/* 地面：静态内容（宣底 / 淡墨晕染 / 边缘墨晕）预渲染到离屏画布，
   每帧直接 drawImage，省去 26 次椭圆填充与世界级渐变重建。
   仅保留当前场景一张，进入新场景时 invalidate 重建。 */
  var groundLayer = null, groundId = null;
  function buildGroundLayer(sc) {
    var off = document.createElement('canvas');
    off.width = sc.width; off.height = sc.height;
    var g2 = off.getContext('2d');
    g2.fillStyle = sc.palette.ground;
    g2.fillRect(0, 0, sc.width, sc.height);
    var c = sceneCache(sc);
    g2.fillStyle = 'rgba(30,30,30,.05)';
    c.washes.forEach(function (w) {
      g2.beginPath(); g2.ellipse(w.x, w.y, w.rx, w.ry, 0, 0, Math.PI * 2); g2.fill();
    });
    /* 场景边缘墨晕 */
    var rg = g2.createRadialGradient(sc.width / 2, sc.height / 2, Math.min(sc.width, sc.height) * .35,
      sc.width / 2, sc.height / 2, sc.width * .72);
    rg.addColorStop(0, 'rgba(0,0,0,0)');
    rg.addColorStop(1, 'rgba(20,20,20,.38)');
    g2.fillStyle = rg; g2.fillRect(0, 0, sc.width, sc.height);
    groundLayer = off; groundId = sc.id;
  }
  function drawGround(sc) {
    if (!groundLayer || groundId !== sc.id) buildGroundLayer(sc);
    ctx.drawImage(groundLayer, 0, 0);
  }
/* 场景主题元素（按 bgTheme 分支，位置取自元数据生成） */
  function drawHut(x, y, s) {
    ctx.fillStyle = '#6e5a42';
    ctx.fillRect(x - 26 * s, y - 10 * s, 52 * s, 34 * s);
    ctx.fillStyle = '#4a4038';
    ctx.beginPath();
    ctx.moveTo(x - 34 * s, y - 10 * s); ctx.lineTo(x, y - 40 * s); ctx.lineTo(x + 34 * s, y - 10 * s);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a322a'; ctx.fillRect(x - 7 * s, y + 4 * s, 14 * s, 20 * s);
  }
  function drawThemeProps(sc) {
    var c = sceneCache(sc), t = sc.bgTheme;
    c.props.forEach(function (p) {
      var bob = Math.sin(game.time * 1.4 + p.v * 9) * 2;
      if (t === 'mountain_gate') {
        /* 石阶 */
        ctx.strokeStyle = 'rgba(60,60,60,.4)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 70 * p.s, p.y + 26 * p.s); ctx.stroke();
      } else if (t === 'village') {
        if (p.v < .55) drawHut(p.x, p.y, p.s);
        else { /* 田垄 */ ctx.strokeStyle = 'rgba(90,80,50,.5)';
          for (var k = 0; k < 3; k++) { ctx.beginPath();
            ctx.moveTo(p.x - 30, p.y + k * 8); ctx.lineTo(p.x + 30, p.y + k * 8); ctx.stroke(); } }
      } else if (t === 'bamboo') {
        drawBamboo(p.x, p.y, p.s, p.v);
      } else if (t === 'mist_forest') {
        drawDeadTree(p.x, p.y, p.s);
      } else if (t === 'snow_waste') {
        /* 雪丘与枯木 */
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        ctx.beginPath(); ctx.ellipse(p.x, p.y, 60 * p.s, 26 * p.s, 0, 0, Math.PI * 2); ctx.fill();
        if (p.v < .4) drawDeadTree(p.x, p.y - 10, p.s * .9);
      } else if (t === 'altar') {
        drawBonePillar(p.x, p.y, p.s + .3);
      }
      void bob;
    });
    /* 固定地标：山门牌坊 / 村中水井 */
    if (t === 'mountain_gate') drawPaifang(330, 470);
    if (t === 'village' && sc.decor) sc.decor.forEach(function (d) {
      if (d.type === 'well') {
        ctx.fillStyle = '#5a5048'; ctx.beginPath(); ctx.arc(d.x, d.y, 22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(d.x, d.y, 15, 0, Math.PI * 2); ctx.fill();
      }
    });
    if (t === 'altar') drawAltar(sc);
  }
  function drawPaifang(x, y) {
    ctx.strokeStyle = '#4a3a2c'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(x - 60, y + 120); ctx.lineTo(x - 60, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 60, y + 120); ctx.lineTo(x + 60, y); ctx.stroke();
    ctx.fillStyle = '#5a4632';
    ctx.fillRect(x - 78, y - 14, 156, 16);
    ctx.fillRect(x - 64, y - 34, 128, 14);
    ctx.fillStyle = '#b83b3b';
    ctx.font = '20px ' + CFG.FONT; ctx.textAlign = 'center';
    ctx.fillText('青云门', x, y - 2);
  }
  function drawBamboo(x, y, s, v) {
    var sway = Math.sin(game.time * 1.2 + v * 10) * 6;
    ctx.strokeStyle = '#3c4a35'; ctx.lineWidth = 6 * s;
    ctx.beginPath(); ctx.moveTo(x, y + 80 * s);
    ctx.quadraticCurveTo(x + sway, y, x + sway * 1.6, y - 130 * s); ctx.stroke();
    ctx.strokeStyle = 'rgba(50,60,45,.9)'; ctx.lineWidth = 3;
    for (var k = 0; k < 4; k++) {
      var ly = y + 50 * s - k * 45 * s;
      ctx.beginPath(); ctx.moveTo(x - 5, ly); ctx.lineTo(x + 5, ly); ctx.stroke();
    }
  }
  function drawDeadTree(x, y, s) {
    ctx.strokeStyle = '#3a3530'; ctx.lineWidth = 6 * s;
    ctx.beginPath(); ctx.moveTo(x, y + 40 * s); ctx.lineTo(x, y - 30 * s); ctx.stroke();
    ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(x, y - 10 * s); ctx.lineTo(x - 20 * s, y - 34 * s);
    ctx.moveTo(x, y - 18 * s); ctx.lineTo(x + 18 * s, y - 40 * s); ctx.stroke();
  }
  function drawBonePillar(x, y, s) {
    ctx.fillStyle = '#d8d2c4';
    ctx.fillRect(x - 8 * s, y - 70 * s, 16 * s, 110 * s);
    ctx.beginPath(); ctx.arc(x, y - 74 * s, 10 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(184,59,59,.6)';
    ctx.beginPath(); ctx.arc(x, y - 30 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
  }
  /* 祭坛：朱砂阵纹 */
  function drawAltar(sc) {
    var tg = sc.special.trigger;
    ctx.fillStyle = '#b8b0a0';
    ctx.beginPath(); ctx.arc(tg.x, tg.y, 170, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(184,59,59,.8)'; ctx.lineWidth = 3;
    for (var k = 0; k < 3; k++) {
      ctx.beginPath(); ctx.arc(tg.x, tg.y, 60 + k * 38, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.beginPath();
    for (var a = 0; a < 8; a++) {
      var ang = Math.PI / 4 * a;
      ctx.moveTo(tg.x + Math.cos(ang) * 40, tg.y + Math.sin(ang) * 40);
      ctx.lineTo(tg.x + Math.cos(ang) * 140, tg.y + Math.sin(ang) * 140);
    }
    ctx.stroke();
  }
/* 险情 / 线索光点 / 传送门 / 掉落 */
  function drawHazards() {
    game.hazards.forEach(function (h) {
      /* 屏外险情不绘制（矩形取中心点判断） */
      var cxh = h.type === 'thorn' ? h.x + h.w / 2 : h.x;
      var cyh = h.type === 'thorn' ? h.y + h.h / 2 : h.y;
      if (!inView(cxh, cyh, 120)) return;
      if (h.type === 'thorn') {
        ctx.fillStyle = 'rgba(70,50,40,.55)';
        ctx.fillRect(h.x, h.y, h.w, h.h);
        ctx.strokeStyle = '#5a4636'; ctx.lineWidth = 2;
        for (var x = h.x + 8; x < h.x + h.w; x += 14) {
          ctx.beginPath(); ctx.moveTo(x, h.y + h.h); ctx.lineTo(x + 5, h.y);
          ctx.lineTo(x + 10, h.y + h.h); ctx.stroke();
        }
      } else {
        ctx.fillStyle = 'rgba(150,190,210,.35)';
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(190,220,235,.7)';
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.stroke();
      }
    });
  }
  function drawClues() {
    game.clues.forEach(function (c) {
      if (c.done) return;
      var a = .5 + Math.sin(game.time * 4) * .4;
      ctx.fillStyle = 'rgba(245,215,110,' + a + ')';
      ctx.beginPath(); ctx.arc(c.x, c.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(245,215,110,.4)';
      ctx.beginPath(); ctx.arc(c.x, c.y, 20 + Math.sin(game.time * 4) * 4, 0, Math.PI * 2); ctx.stroke();
    });
  }
  function drawPortals() {
    var sc = QY.SceneManager.scene();
    sc.portals.forEach(function (pt) {
      var unlocked = !pt.requireQuest || game.quest.completed.indexOf(pt.requireQuest) >= 0;
      var a = .45 + Math.sin(game.time * 3) * .25;
      if (unlocked) {
        /* 双层实心圆替代每帧创建径向渐变，保持辉光感 */
        ctx.fillStyle = 'rgba(74,107,125,' + (0.3 + a * 0.4) + ')';
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(245,240,230,.55)';
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * .32, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(80,40,40,.5)';
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = unlocked ? '#f5f0e6' : '#b83b3b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.stroke();
      if (!unlocked) {
        ctx.fillStyle = '#b83b3b'; ctx.font = '16px ' + CFG.FONT;
        ctx.textAlign = 'center'; ctx.fillText('封', pt.x, pt.y + 6);
      }
    });
  }
  function drawDrops() {
    game.drops.forEach(function (d) {
      if (!inView(d.x, d.y, 30)) return;
      var y = d.y + Math.sin(d.t / 200) * 3;
      if (d.kind === 'gold') {
        ctx.fillStyle = '#f5d76e';
        ctx.beginPath(); ctx.arc(d.x, y, 6, 0, Math.PI * 2); ctx.fill();
      } else {
        var def = CFG.ITEMS[d.id];
        ctx.fillStyle = def.color;
        ctx.beginPath(); ctx.arc(d.x, y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#f5f0e6'; ctx.lineWidth = 1; ctx.stroke();
      }
    });
  }
/* NPC：水墨道袍 + 头顶 ！/？ */
  function drawNPC(n) {
    if (!inView(n.x, n.y, 40)) return;
    /* 影 */
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(n.x, n.y + 18, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
    /* 袍 */
    ctx.fillStyle = n.color;
    ctx.beginPath();
    ctx.moveTo(n.x - 13, n.y + 20); ctx.lineTo(n.x - 7, n.y - 8);
    ctx.lineTo(n.x + 7, n.y - 8); ctx.lineTo(n.x + 13, n.y + 20);
    ctx.closePath(); ctx.fill();
    /* 首 */
    ctx.fillStyle = '#e8dfca';
    ctx.beginPath(); ctx.arc(n.x, n.y - 15, 7, 0, Math.PI * 2); ctx.fill();
    /* 任务标记 */
    var mark = npcMarker(n);
    if (mark) {
      ctx.font = 'bold 20px ' + CFG.FONT; ctx.textAlign = 'center';
      ctx.fillStyle = mark === '?' ? '#6b8e7f' : '#b83b3b';
      ctx.fillText(mark, n.x, n.y - 34 + Math.sin(game.time * 4) * 2);
    }
  }
  function npcMarker(n) {
    var q = QY.activeMain();
    if (q) {
      var step = QY.curStep(q);
      if (step.type === 'talk') {
        if (step.target === n.id || (step.target === n.group && n.group)) return '!';
      }
    }
    if (n.id === 'yaotong') {
      if (game.sides.q2s === 'none') return '!';
      if (game.sides.q2s === 'active' && QY.stepIdxOf('q2s') === 1) return '?';
    }
    return null;
  }
/* 敌人绘制（按 type 分支） */
  function drawEnemy(e) {
    if (!inView(e.x, e.y, e.radius + 24)) return;
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(e.x, e.y + e.radius * .8, e.radius, e.radius * .4, 0, 0, Math.PI * 2); ctx.fill();
    if (e.type === 'moyao') drawMoyao(e);
    else if (e.type === 'moyao_king') drawMoyaoKing(e);
    else if (e.type === 'yingsha') drawYingsha(e);
    else if (e.type === 'yingsha_leader') drawLeader(e);
    else if (e.type === 'shuanggu') drawShuanggu(e);
    else if (e.type === 'hanya') drawHanya(e);
    else if (e.type === 'shiling') drawShiling(e);
    else if (e.type === 'shuanggu_boss') drawBoss(e);
    /* 蓄力预警 */
    if (e.state === 'wind' || (e.type === 'shuanggu_boss' && e.state === 'dash')) {
      ctx.strokeStyle = 'rgba(184,59,59,.7)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.radius + 6, 0, Math.PI * 2); ctx.stroke();
    }
  }
  function eyes(e, dy) {
    ctx.fillStyle = '#f5d76e';
    ctx.beginPath(); ctx.arc(e.x - 5, e.y + dy, 2.4, 0, Math.PI * 2);
    ctx.arc(e.x + 5, e.y + dy, 2.4, 0, Math.PI * 2); ctx.fill();
  }
  function drawMoyao(e) {
    ctx.fillStyle = e.def.color;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = e.def.color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(e.x - 8, e.y - 12, 6, Math.PI, Math.PI * 1.9);
    ctx.arc(e.x + 8, e.y - 12, 6, Math.PI * .1, Math.PI); ctx.stroke();
    eyes(e, -2);
  }
  function drawMoyaoKing(e) {
    ctx.fillStyle = e.def.color;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    for (var k = 0; k < 8; k++) {
      var a = Math.PI * 2 / 8 * k;
      ctx.beginPath();
      ctx.moveTo(e.x + Math.cos(a) * (e.radius - 4), e.y + Math.sin(a) * (e.radius - 4));
      ctx.lineTo(e.x + Math.cos(a) * (e.radius + 9), e.y + Math.sin(a) * (e.radius + 9));
      ctx.lineTo(e.x + Math.cos(a + .2) * (e.radius - 2), e.y + Math.sin(a + .2) * (e.radius - 2));
      ctx.fill();
    }
    ctx.fillStyle = '#b83b3b';
    ctx.beginPath(); ctx.arc(e.x - 7, e.y - 3, 3.4, 0, Math.PI * 2);
    ctx.arc(e.x + 7, e.y - 3, 3.4, 0, Math.PI * 2); ctx.fill();
  }
  function drawYingsha(e) {
    ctx.fillStyle = e.def.color;
    ctx.beginPath();
    ctx.moveTo(e.x, e.y - e.radius); ctx.lineTo(e.x + e.radius, e.y);
    ctx.lineTo(e.x, e.y + e.radius); ctx.lineTo(e.x - e.radius, e.y);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(20,30,35,.7)';
    ctx.beginPath();
    ctx.moveTo(e.x, e.y - 6); ctx.lineTo(e.x + 6, e.y); ctx.lineTo(e.x, e.y + 6);
    ctx.lineTo(e.x - 6, e.y); ctx.closePath(); ctx.fill();
  }
  function drawLeader(e) {
    ctx.fillStyle = e.def.color;
    ctx.beginPath();
    ctx.moveTo(e.x, e.y - e.radius); ctx.lineTo(e.x + e.radius, e.y);
    ctx.lineTo(e.x, e.y + e.radius); ctx.lineTo(e.x - e.radius, e.y);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b83b3b';
    ctx.beginPath(); ctx.arc(e.x, e.y, 6, 0, Math.PI * 2); ctx.fill();
  }
  function drawShuanggu(e) {
    ctx.fillStyle = '#c7d2c9';
    ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#9fc7d6'; ctx.lineWidth = 3;
    for (var k = 0; k < 6; k++) {
      var a = Math.PI * 2 / 6 * k;
      ctx.beginPath();
      ctx.moveTo(e.x + Math.cos(a) * (e.radius - 3), e.y + Math.sin(a) * (e.radius - 3));
      ctx.lineTo(e.x + Math.cos(a) * (e.radius + 8), e.y + Math.sin(a) * (e.radius + 8));
      ctx.stroke();
    }
    ctx.fillStyle = '#33505f';
    ctx.beginPath(); ctx.arc(e.x - 6, e.y - 3, 2.6, 0, Math.PI * 2);
    ctx.arc(e.x + 6, e.y - 3, 2.6, 0, Math.PI * 2); ctx.fill();
  }
  function drawHanya(e) {
    var flap = Math.sin(game.time * 10) * 8;
    ctx.fillStyle = e.def.color;
    ctx.beginPath(); ctx.moveTo(e.x, e.y - 8); ctx.lineTo(e.x + 14, e.y + 4 + flap);
    ctx.lineTo(e.x, e.y + 6); ctx.lineTo(e.x - 14, e.y + 4 + flap);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b83b3b';
    ctx.beginPath(); ctx.arc(e.x, e.y - 2, 2, 0, Math.PI * 2); ctx.fill();
  }
  function drawShiling(e) {
    ctx.fillStyle = e.def.color;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(30,15,35,.6)';
    ctx.beginPath(); ctx.arc(e.x, e.y, e.radius * .55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d6a6cf';
    for (var k = 0; k < 3; k++) {
      var a = game.time * 2 + k * Math.PI * 2 / 3;
      ctx.beginPath();
      ctx.arc(e.x + Math.cos(a) * (e.radius + 5), e.y + Math.sin(a) * (e.radius + 5), 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function drawBoss(e) {
    var col = e.phase === 2 ? '#a8d0e0' : e.def.color;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
    /* 冰冠骨刺 */
    ctx.strokeStyle = '#dceef5'; ctx.lineWidth = 5;
    for (var k = 0; k < 10; k++) {
      var a = Math.PI * 2 / 10 * k;
      ctx.beginPath();
      ctx.moveTo(e.x + Math.cos(a) * (e.radius - 4), e.y + Math.sin(a) * (e.radius - 4));
      ctx.lineTo(e.x + Math.cos(a) * (e.radius + 16), e.y + Math.sin(a) * (e.radius + 16));
      ctx.stroke();
    }
    ctx.fillStyle = e.phase === 2 ? '#b83b3b' : '#f5d76e';
    ctx.beginPath(); ctx.arc(e.x - 10, e.y - 4, 4.5, 0, Math.PI * 2);
    ctx.arc(e.x + 10, e.y - 4, 4.5, 0, Math.PI * 2); ctx.fill();
  }
/* 玩家：水墨剑客 */
  function drawPlayer() {
    var p = game.player;
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 15, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
    var flash = p.hurtT > 0;
    /* 道袍 */
    ctx.fillStyle = flash ? '#f5f0e6' : '#4a6b7d';
    ctx.beginPath();
    ctx.moveTo(p.x - 13, p.y + 18); ctx.lineTo(p.x - 8, p.y - 8);
    ctx.lineTo(p.x + 8, p.y - 8); ctx.lineTo(p.x + 13, p.y + 18);
    ctx.closePath(); ctx.fill();
    /* 朱砂腰带 */
    ctx.fillStyle = '#b83b3b'; ctx.fillRect(p.x - 12, p.y + 3, 24, 5);
    /* 首 */
    ctx.fillStyle = '#e8dfca';
    ctx.beginPath(); ctx.arc(p.x, p.y - 14, 7, 0, Math.PI * 2); ctx.fill();
    /* 长剑：朝鼠标方向 */
    ctx.strokeStyle = '#d8dcd6'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(p.angle) * 6, p.y + Math.sin(p.angle) * 6);
    ctx.lineTo(p.x + Math.cos(p.angle) * 34, p.y + Math.sin(p.angle) * 34);
    ctx.stroke();
  }
/* 剑气 / 冰锥 / 特效 / 粒子 / 飘字 */
  function drawBolts() {
    game.bolts.forEach(function (b) {
      if (!inView(b.x, b.y, 24)) return;
      ctx.save();
      ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx));
      ctx.strokeStyle = 'rgba(245,240,230,.9)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 12, -0.9, 0.9); ctx.stroke();
      ctx.strokeStyle = 'rgba(30,30,30,.7)'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(0, 2, 13, -0.7, 0.7); ctx.stroke();
      ctx.restore();
    });
    game.enemyBolts.forEach(function (q) {
      if (!inView(q.x, q.y, 20)) return;
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(Math.atan2(q.vy, q.vx));
      ctx.fillStyle = '#bfe0ee';
      ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(0, 5); ctx.lineTo(-8, 0);
      ctx.lineTo(0, -5); ctx.closePath(); ctx.fill();
      ctx.restore();
    });
  }
  function drawGroundEffects() {
    game.effects.forEach(function (f) {
      if (f.kind !== 'frost') return;
      var k = QY.utils.clamp((f.until - game.time) / 400, 0, 1);
      ctx.fillStyle = 'rgba(150,195,215,.22)';
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(220,240,248,' + (.5 + k * .4) + ')'; ctx.lineWidth = 2;
      for (var i = 0; i < 8; i++) {
        var a = Math.PI * 2 / 8 * i + game.time;
        ctx.beginPath();
        ctx.moveTo(f.x + Math.cos(a) * f.r * .6, f.y + Math.sin(a) * f.r * .6);
        ctx.lineTo(f.x + Math.cos(a) * f.r, f.y + Math.sin(a) * f.r);
        ctx.stroke();
      }
    });
  }
  function drawTopEffects() {
    game.effects.forEach(function (f) {
      if (f.kind === 'fan') {
        var k = f.t / 350;
        ctx.strokeStyle = 'rgba(220,240,248,' + k + ')'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.range * (1 - k * .3), f.angle - f.arc, f.angle + f.arc); ctx.stroke();
      } else if (f.kind === 'shock') {
        /* 进度按效果自带时长计算（精英 450ms / BOSS 520ms），并钳制防负半径 */
        var p2 = u.clamp(1 - f.t / (f.dur || 520), 0, 1);
        ctx.strokeStyle = 'rgba(230,240,245,' + (1 - p2) + ')'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r * p2, 0, Math.PI * 2); ctx.stroke();
      } else if (f.kind === 'rain') {
        f.swords.forEach(function (sw) {
          if (sw.delay > 0 || !sw.done) return;
          ctx.strokeStyle = 'rgba(30,30,30,.8)'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(sw.x, sw.y - 46); ctx.lineTo(sw.x, sw.y); ctx.stroke();
          ctx.strokeStyle = '#b83b3b'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(sw.x - 6, sw.y - 38); ctx.lineTo(sw.x + 6, sw.y - 38); ctx.stroke();
        });
      }
    });
  }
  function drawParticles() {
    game.particles.forEach(function (p) {
      if (!inView(p.x, p.y, 10)) return;
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  function drawFloaters() {
    ctx.font = '16px ' + CFG.FONT; ctx.textAlign = 'center';
    game.floaters.forEach(function (f) {
      if (!inView(f.x, f.y, 50)) return;
      ctx.globalAlpha = Math.max(0, f.life / 850);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
    });
    ctx.globalAlpha = 1;
  }
/* 屏幕空间：雾气视野遮罩 / 受击红晕 / 墨晕过渡 */
  function drawVisionMask() {
    var sc = QY.SceneManager.scene();
    if (!sc.special || !sc.special.vision) return;
    var p = game.player, sx = p.x - game.camera.x, sy = p.y - game.camera.y, r = sc.special.vision;
    var g = ctx.createRadialGradient(sx, sy, r * .4, sx, sy, r);
    g.addColorStop(0, 'rgba(210,222,220,.35)');
    g.addColorStop(1, sc.palette.fog);
    ctx.fillStyle = g; ctx.fillRect(0, 0, game.view.w, game.view.h);
  }
  function drawHurtVignette() {
    var p = game.player;
    if (!p || p.hurtT <= 0) return;
    var a = p.hurtT / CFG.PLAYER.hurtInvuln * .35;
    var g = ctx.createRadialGradient(game.view.w / 2, game.view.h / 2, game.view.h * .3,
      game.view.w / 2, game.view.h / 2, game.view.h * .75);
    g.addColorStop(0, 'rgba(184,59,59,0)');
    g.addColorStop(1, 'rgba(184,59,59,' + a + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, game.view.w, game.view.h);
  }
  function drawTransition() {
    var tr = game.transition; if (!tr) return;
    var p1 = tr.t / CFG.TRANSITION_MS;
    var cover = p1 < .5 ? p1 * 2 : 1 - (p1 - .5) * 2;
    var diag = Math.hypot(game.view.w, game.view.h) / 2;
    var sc = QY.SCENES[tr.portal.target];
    /* 墨晕圆（半径必须 >=0：过渡首帧 cover=0，cover*diag-10 为负会抛
       IndexSizeError，异常发生在 rAF 回调中会导致主循环永久停转） */
    var rCover = Math.max(0, cover * diag);
    ctx.fillStyle = '#0c0c0c';
    ctx.beginPath(); ctx.arc(game.view.w / 2, game.view.h / 2, rCover, 0, Math.PI * 2); ctx.fill();
    if (rCover > 12) {
      ctx.strokeStyle = 'rgba(60,60,60,.8)'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(game.view.w / 2, game.view.h / 2, rCover - 10, 0, Math.PI * 2); ctx.stroke();
    }
    /* 居中场景名与副标题 */
    if (cover > .55) {
      ctx.globalAlpha = Math.min(1, (cover - .55) * 2.4);
      ctx.fillStyle = '#f5f0e6'; ctx.textAlign = 'center';
      ctx.font = '44px ' + CFG.FONT;
      ctx.fillText(sc.name, game.view.w / 2, game.view.h / 2 - 6);
      ctx.font = '17px ' + CFG.FONT; ctx.fillStyle = '#9aa8a3';
      ctx.fillText(sc.subtitle, game.view.w / 2, game.view.h / 2 + 30);
      ctx.globalAlpha = 1;
    }
  }
/* 小地图（右上） */
  var mini = document.getElementById('miniCanvas'), mctx = mini.getContext('2d');
  function drawMinimap() {
    var sc = QY.SceneManager.scene();
    var kx = mini.width / sc.width, ky = mini.height / sc.height;
    mctx.fillStyle = 'rgba(30,32,30,.9)'; mctx.fillRect(0, 0, mini.width, mini.height);
    /* 传送门 */
    sc.portals.forEach(function (pt) {
      var unlocked = !pt.requireQuest || game.quest.completed.indexOf(pt.requireQuest) >= 0;
      mctx.fillStyle = unlocked ? '#8fb0a3' : '#b83b3b';
      mctx.beginPath(); mctx.arc(pt.x * kx, pt.y * ky, 3, 0, Math.PI * 2); mctx.fill();
    });
    /* 线索 */
    game.clues.forEach(function (c) {
      if (c.done) return;
      mctx.fillStyle = '#f5d76e';
      mctx.fillRect(c.x * kx - 1.5, c.y * ky - 1.5, 3, 3);
    });
    /* NPC / 敌人 */
    game.npcs.forEach(function (n) { mctx.fillStyle = '#e8dfca'; mctx.fillRect(n.x * kx - 1.5, n.y * ky - 1.5, 3, 3); });
    game.enemies.forEach(function (e) { mctx.fillStyle = '#c14b4b'; mctx.fillRect(e.x * kx - 1, e.y * ky - 1, 2, 2); });
    /* 玩家 */
    var p = game.player;
    mctx.fillStyle = '#ffffff';
    mctx.beginPath(); mctx.arc(p.x * kx, p.y * ky, 3, 0, Math.PI * 2); mctx.fill();
    /* 场景名只在变化时写 DOM */
    var mnEl = document.getElementById('miniName');
    if (mnEl._qv !== sc.name) { mnEl._qv = sc.name; mnEl.textContent = sc.name; }
  }
/* 主绘制 */
  Renderer.draw = function () {
    var sc = QY.SceneManager.scene();
    if (!sc) return;
    drawSky(sc);
    drawMountains(sc);
    ctx.save();
    ctx.translate(-game.camera.x, -game.camera.y);
    drawGround(sc);
    drawThemeProps(sc);
    drawHazards();
    drawGroundEffects();
    drawPortals();
    drawClues();
    drawDrops();
    game.npcs.forEach(drawNPC);
    game.enemies.forEach(drawEnemy);
    drawPlayer();
    drawBolts();
    drawTopEffects();
    drawParticles();
    drawFloaters();
    ctx.restore();
    drawVisionMask();
    drawHurtVignette();
    drawMinimap();
    drawTransition();
  };
})();
