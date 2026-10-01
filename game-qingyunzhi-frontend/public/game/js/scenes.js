/* ============================================================
 * scenes.js —— SceneManager
 * 进入 / 切换场景、传送门、水墨过渡动画、任务门控、
 * 场景脚本（精英、头领、波次、BOSS 苏醒）
 * ============================================================ */
(function () {
  'use strict';
  var QY = window.QY = window.QY || {};
  var game = QY.game;
  var u = QY.utils;

  var SceneManager = {};
  QY.SceneManager = SceneManager;

  SceneManager.scene = function () {
    return game.sceneId ? QY.SCENES[game.sceneId] : null;
  };

  /* 敌人类型是否存活 */
  function aliveOf(type) {
    for (var i = 0; i < game.enemies.length; i++) if (game.enemies[i].type === type) return true;
    return false;
  }

  /* ============================================================
   * 进入场景：重置敌人 / 相机，玩家落在 tx,ty
   * ============================================================ */
  SceneManager.enterScene = function (id, tx, ty) {
    var sc = QY.SCENES[id];
    game.sceneId = id;
    game.enemies = []; game.bolts = []; game.enemyBolts = [];
    game.effects = []; game.drops = [];
    game.boss = null; game.pending = null; game.pendingStory = null;

    /* NPC 运行时副本 */
    game.npcs = sc.npcs.map(function (n) {
      return { id: n.id, name: n.name, x: n.x, y: n.y, color: n.color, group: n.group || null };
    });

    /* 地形险情运行时（附加伤害计时） */
    game.hazards = sc.hazards.map(function (h) {
      return Object.assign({ tickT: 0 }, h);
    });

    /* 阴谋线索：按任务进度恢复已找到状态 */
    game.clues = [];
    if (sc.special && sc.special.clues) {
      var found = (QY.activeMain() && QY.activeMain().id === 'q4' && QY.stepIdxOf('q4') === 1)
        ? (game.quest.progress.q4 || 0) : 0;
      game.clues = sc.special.clues.map(function (c, i) {
        return { x: c.x, y: c.y, done: i < found };
      });
    }

    /* 玩家落位（默认场景出生点） */
    var p = game.player;
    p.x = tx == null ? sc.start.x : tx;
    p.y = ty == null ? sc.start.y : ty;
    game.sceneEntry = { id: id, x: p.x, y: p.y };

    /* 相机立即对齐 */
    game.camera.x = u.clamp(p.x - game.view.w / 2, 0, Math.max(0, sc.width - game.view.w));
    game.camera.y = u.clamp(p.y - game.view.h / 2, 0, Math.max(0, sc.height - game.view.h));

    /* 荒原波次运行时：按已清波数恢复 */
    if (id === 'waste' && QY.activeMain() && QY.activeMain().id === 'q5' && QY.stepIdxOf('q5') === 0) {
      var cleared = game.quest.progress.q5 || 0;
      game.waves = { idx: cleared, state: 'wait', t: 1700 };
      if (!QY.flag('waves_announced')) { QY.setFlag('waves_announced'); QY.UI.toast('妖潮将至，准备迎战！'); }
    } else game.waves = null;

    /* 首次进入：播放场景过场字幕（墨晕结束后再播） */
    var seenK = 'seen_' + id;
    if (!QY.flag(seenK)) {
      QY.setFlag(seenK);
      if (sc.story) {
        if (game.transition) game.pendingStory = sc.story;
        else QY.UI.showCutscene(QY.STORY[sc.story]);
      }
    }

    /* 新场景：失效地面层缓存、任务面板标记重建 */
    if (QY.Renderer && QY.Renderer.invalidate) QY.Renderer.invalidate();
    if (QY.UI && QY.UI.questDirty) QY.UI.questDirty();
  };

  /* ============================================================
   * E 键交互：寻找最近 NPC
   * ============================================================ */
  SceneManager.interactE = function () {
    var p = game.player, best = null, bd = 72;
    game.npcs.forEach(function (n) {
      var d = u.dist(p.x, p.y, n.x, n.y);
      if (d < bd) { bd = d; best = n; }
    });
    if (best) QY.UI.openDialogue(best);
  };

  /* ============================================================
   * 场景切换：墨晕过渡（800ms），中点切换、结尾播剧情
   * ============================================================ */
  SceneManager.startTransition = function (portal) {
    if (game.transition) return;
    game.transition = { portal: portal, t: 0, switched: false };
  };

  function updateTransition(dt) {
    var tr = game.transition, ms = QY.CONFIG.TRANSITION_MS;
    tr.t += dt * 1000;
    if (!tr.switched && tr.t >= ms / 2) {
      tr.switched = true;
      SceneManager.enterScene(tr.portal.target, tr.portal.tx, tr.portal.ty);
    }
    if (tr.t >= ms) {
      var story = game.pendingStory;
      game.transition = null; game.pendingStory = null;
      if (story) QY.UI.showCutscene(QY.STORY[story]);
    }
  }
  SceneManager.updateTransition = updateTransition;

  /* ---------------- 传送门检测（走入即触发） ---------------- */
  function updatePortals() {
    var sc = SceneManager.scene(), p = game.player;
    var hint = null;
    sc.portals.forEach(function (pt) {
      if (u.dist(p.x, p.y, pt.x, pt.y) < pt.r) {
        var unlocked = !pt.requireQuest || game.quest.completed.indexOf(pt.requireQuest) >= 0;
        if (unlocked) SceneManager.startTransition(pt);
        else {
          var q = QY.QUESTS[pt.requireQuest];
          hint = '朱砂封印未破 · 需完成「' + q.name + '」';
        }
      }
    });
    /* 仅在提示内容变化时操作 DOM，避免每帧 display 切换 */
    var el = document.getElementById('portalHint');
    if (hint && el._last !== hint) {
      el._last = hint; el.textContent = hint; el.style.display = 'block';
    } else if (!hint && el._last !== null) {
      el._last = null; el.style.display = 'none';
    }
  }

  /* ---------------- 险情：荆棘 / 寒冰陷阱 ---------------- */
  function updateHazards(dt) {
    var p = game.player;
    game.hazards.forEach(function (h) {
      h.tickT -= dt * 1000;
      var inside = false;
      if (h.type === 'thorn') {
        inside = p.x > h.x && p.x < h.x + h.w && p.y > h.y && p.y < h.y + h.h;
      } else if (h.type === 'ice') {
        inside = u.dist(p.x, p.y, h.x, h.y) < h.r;
      }
      if (inside && h.tickT <= 0) {
        h.tickT = 650;
        QY.hurtPlayer(h.type === 'thorn' ? 9 : 7);
        if (h.type === 'ice') p.slowT = 700;
      }
    });
  }

  /* ---------------- 阴谋线索光点 ---------------- */
  function updateClues() {
    var p = game.player;
    game.clues.forEach(function (c) {
      if (!c.done && u.dist(p.x, p.y, c.x, c.y) < 32) {
        c.done = true;
        QY.progressEvent('reach', { id: 'clue' });
        QY.UI.toast('寻得阴谋线索');
      }
    });
  }

  /* ---------------- 延迟生成精英 / 头领 / BOSS ---------------- */
  function queuePending(type, x, y, toastMsg) {
    if (game.pending) return;
    game.pending = { type: type, x: x, y: y, t: 500, msg: toastMsg };
  }
  function updatePending(dt) {
    if (!game.pending) return;
    var pd = game.pending;
    pd.t -= dt * 1000;
    if (pd.t <= 0) {
      QY.spawnEnemy(pd.type, pd.x, pd.y);
      if (pd.msg) QY.UI.toast(pd.msg);
      game.pending = null;
    }
  }

  /* ---------------- 脚本：按当前主线步骤驱动 ---------------- */
  function updateScript() {
    var q = QY.activeMain();
    if (!q) return;
    var idx = QY.stepIdxOf(q.id), sp = SceneManager.scene().special;

    /* 第二章：杀满 10 墨妖后，墨妖王现身 */
    if (q.id === 'q3' && idx === 1 && sp && sp.elite && !QY.flag('moyao_king_dead') && !aliveOf('moyao_king')) {
      queuePending('moyao_king', sp.elite.x, sp.elite.y, '墨妖王现身！');
    }
    /* 第三章：击杀与线索完成后，影煞头领现身 */
    if (q.id === 'q4' && idx === 2 && sp && sp.leader && !QY.flag('leader_dead') && !aliveOf('yingsha_leader')) {
      queuePending('yingsha_leader', sp.leader.x, sp.leader.y, '影煞头领拦住了去路！');
    }
    /* 终章：登上祭坛 → 巨灵苏醒 */
    if (q.id === 'q6' && sp) {
      if (idx === 0 && !QY.flag('trigger_reached')) {
        var tg = sp.trigger;
        if (u.dist(game.player.x, game.player.y, tg.x, tg.y) < tg.r) {
          QY.setFlag('trigger_reached');
          QY.progressEvent('reach', { id: 'altar_center' });
        }
      }
      if (idx === 1 && !QY.flag('boss_dead') && !aliveOf('shuanggu_boss')) {
        queuePending('shuanggu_boss', sp.boss.x, sp.boss.y, '霜骨巨灵苏醒了！');
        if (!QY.flag('awaken_shown')) {
          QY.setFlag('awaken_shown');
          setTimeout(function () { if (game.state === 'playing' && !game.dialogue) QY.UI.showCutscene(QY.STORY.boss_awaken); }, 520);
        }
      }
    }
  }

  /* ---------------- 波次生存（霜骨荒原） ---------------- */
  function spawnWaveAround(waveDef) {
    var p = game.player, sc = SceneManager.scene();
    waveDef.groups.forEach(function (g) {
      for (var i = 0; i < g.count; i++) {
        var a = u.rand(0, Math.PI * 2), d = u.rand(380, 520);
        var x = u.clamp(p.x + Math.cos(a) * d, 60, sc.width - 60);
        var y = u.clamp(p.y + Math.sin(a) * d, 60, sc.height - 60);
        QY.spawnEnemy(g.type, x, y);
      }
    });
  }

  function updateWaves(dt) {
    if (!game.waves) return;
    var w = game.waves, sc = SceneManager.scene(), def = sc.special.waves;
    if (w.state === 'wait') {
      w.t -= dt * 1000;
      if (w.t <= 0) {
        w.state = 'fight';
        spawnWaveAround(def[w.idx]);
        QY.UI.toast('第 ' + (w.idx + 1) + ' 波妖物来袭！');
      }
    } else if (w.state === 'fight') {
      /* 本波清空：推进波数（唯一上报），步骤离开第0步即三波已清 */
      if (game.enemies.length === 0) {
        QY.progressEvent('wave', {});
        var aq = QY.activeMain();
        if (!aq || aq.id !== 'q5' || QY.stepIdxOf('q5') !== 0) {
          game.waves = null;
          QY.setFlag('waves_cleared');
          QY.UI.toast('三波已退！与先锋将叙话');
        } else { w.state = 'wait'; w.t = 1600; w.idx = game.quest.progress.q5; }
      }
    }
  }

  /* ============================================================
   * 敌人死亡剧情钩子（由 core.killEnemy 调用）
   * ============================================================ */
  SceneManager.hookKill = function (e) {
    /* 支线进行时：村内墨妖概率掉落霜华露 */
    if (e.type === 'moyao' && game.sceneId === 'village' && game.sides.q2s === 'active'
        && QY.stepIdxOf('q2s') === 0 && Math.random() < 0.45) {
      game.drops.push({ kind: 'item', id: 'shuanghualu', x: e.x, y: e.y, t: 0 });
    }
    if (e.type === 'moyao_king') {
      QY.setFlag('moyao_king_dead');
      QY.UI.toast('墨妖王伏诛！前去救助弟子');
    }
    if (e.type === 'yingsha_leader') {
      QY.setFlag('leader_dead');
      QY.UI.showCutscene(QY.STORY.leader_last);
    }
    if (e.type === 'shuanggu_boss') {
      QY.setFlag('boss_dead');
      game.boss = null;
      QY.UI.hideBossBar();
    }
  };

  /* 死亡重生：保留等级背包，回到最近场景入口 */
  SceneManager.respawn = function () {
    var entry = game.sceneEntry;
    var p = game.player;
    SceneManager.enterScene(entry.id, entry.x, entry.y);
    p.alive = true; p.hp = p.maxHP; p.mp = p.maxMP;
    p.hurtT = 0; p.slowT = 0;
    game.state = 'playing';
  };

  /* ============================================================
   * 场景侧每帧更新
   * ============================================================ */
  SceneManager.update = function (dt) {
    if (game.transition) { updateTransition(dt); return; }
    updatePortals();
    updateHazards(dt);
    updateClues();
    updateScript();
    updatePending(dt);
    updateWaves(dt);
  };
})();
