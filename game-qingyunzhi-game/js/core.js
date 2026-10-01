/* ============================================================
 * core.js —— 全局状态、工具函数、玩家、刷怪、战斗、
 *            技能、掉落、碰撞、任务结算
 * ============================================================ */
(function () {
  'use strict';
  var QY = window.QY = window.QY || {};
  var CFG = QY.CONFIG;
  /* ---------------- 工具函数 ---------------- */
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }
  function hashStr(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return Math.abs(h); }
  function makeRng(seed) { var s = seed; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }
  /* ---------------- 全局游戏状态 ---------------- */
  var game = {
    state: 'menu',           // menu / playing / dead / ending
    sceneId: null,
    sceneEntry: null,        // 最近的场景入口 {id,x,y}，死亡回归用
    view: { w: 960, h: 600 },
    player: null,
    enemies: [], bolts: [], enemyBolts: [], drops: [],
    particles: [], floaters: [], effects: [],
    npcs: [], hazards: [], clues: [], waves: null, boss: null,
    camera: { x: 0, y: 0 },
    keys: {}, mouse: { sx: 0, sy: 0, wx: 0, wy: 0, down: false },
    quest: { completed: [], stepIdx: {}, progress: {} },
    sides: { q2s: 'none' },  // none / active / done
    flags: {},
    inventory: {},
    spawnTimer: 0,
    time: 0,
    dialogue: null, cutscene: null, transition: null, menuOpen: false
  };
  QY.game = game;
  QY.utils = { rand: rand, clamp: clamp, dist: dist, hashStr: hashStr, makeRng: makeRng };
  /* 通知 UI：任务面板需要重建（运行时 QY.UI 已加载） */
  function questDirty() { if (QY.UI && QY.UI.questDirty) QY.UI.questDirty(); }
  /* 万剑归宗每次施法的唯一序号：伤害去重标记在敌人实例上，
     避免按数组索引去重在敌人死亡 / 新增后错位 */
  var rainSeq = 0;
/* 玩家 */
  function expForLevel(lv) { return Math.round(CFG.PLAYER.expBase * Math.pow(CFG.PLAYER.expGrow, lv - 1)); }
  function createPlayer(x, y) {
    var P = CFG.PLAYER;
    return {
      x: x, y: y, angle: 0, face: 1, radius: P.radius,
      level: 1, exp: 0, expNext: expForLevel(1), gold: 0,
      maxHP: P.baseHP, hp: P.baseHP, maxMP: P.baseMP, mp: P.baseMP,
      atk: P.baseAtk, def: P.baseDef,
      speedMul: 1, slowT: 0, hurtT: 0, touchT: 0,
      attackCD: 0, skillCD: { 1: 0, 2: 0, 3: 0 },
      skills: { 1: false, 2: false, 3: false },
      alive: true
    };
  }
  QY.createPlayer = createPlayer;
  /* 新档初始化：重置全部可玩数据 */
  QY.newGame = function () {
    game.enemies = []; game.bolts = []; game.enemyBolts = []; game.drops = [];
    game.particles = []; game.floaters = []; game.effects = [];
    game.npcs = []; game.hazards = []; game.clues = []; game.waves = null; game.boss = null;
    game.quest = { completed: [], stepIdx: {}, progress: {} };
    game.sides = { q2s: 'none' };
    game.flags = {}; game.inventory = {};
    game.camera = { x: 0, y: 0 };
    game.dialogue = null; game.cutscene = null; game.transition = null; game.menuOpen = false;
    game.player = createPlayer(0, 0);
  };
  /* ---------------- 受伤 / 死亡 ---------------- */
  function hurtPlayer(raw) {
    var p = game.player, P = CFG.PLAYER;
    if (!p.alive || p.hurtT > 0) return;
    var dmg = Math.max(1, Math.round(raw - p.def * 0.5));
    p.hp -= dmg; p.hurtT = P.hurtInvuln;
    addFloater(p.x, p.y - 18, '-' + dmg, CFG.COLOR.cinnabar);
    burst(p.x, p.y, 6, '#b83b3b', 90);
    if (p.hp <= 0) {
      p.hp = 0; p.alive = false;
      game.state = 'dead';
      QY.UI.showDeath();
    }
  }
  QY.hurtPlayer = hurtPlayer;
  /* ---------------- 经验 / 升级 ---------------- */
  function gainExp(n) {
    var p = game.player;
    p.exp += n;
    while (p.exp >= p.expNext) {
      p.exp -= p.expNext; p.level++;
      p.expNext = expForLevel(p.level);
      var P = CFG.PLAYER;
      p.maxHP += P.hpGrow; p.maxMP += P.mpGrow;
      p.atk += P.atkGrow; p.def += P.defGrow;
      p.hp = p.maxHP; p.mp = p.maxMP;
      ringBurst(p.x, p.y);
      QY.UI.toast('境界提升 · 第 ' + p.level + ' 重');
    }
  }
  QY.gainExp = gainExp;
/* 背包 / 物品 */
  function addItem(id, n) {
    n = n || 1;
    game.inventory[id] = (game.inventory[id] || 0) + n;
  }
  function itemCount(id) { return game.inventory[id] || 0; }
  function useItem(id) {
    var def = CFG.ITEMS[id], p = game.player;
    if (!def || itemCount(id) <= 0) return;
    if (def.heal) { p.hp = Math.min(p.maxHP, p.hp + def.heal); addFloater(p.x, p.y - 20, '+' + def.heal, '#6b8e7f'); }
    if (def.mana) { p.mp = Math.min(p.maxMP, p.mp + def.mana); addFloater(p.x, p.y - 20, '+' + def.mana, '#7fb8d6'); }
    game.inventory[id]--;
    QY.UI.renderInventory();
  }
  QY.addItem = addItem; QY.itemCount = itemCount; QY.useItem = useItem;
  /* ============================================================
   * 任务系统 —— 唯一结算入口
   * completeStep() → completeQuest() 发奖，杜绝重复发奖
   * ============================================================ */
  function activeMain() {
    for (var i = 0; i < QY.QUEST_ORDER.length; i++) {
      var id = QY.QUEST_ORDER[i];
      if (game.quest.completed.indexOf(id) < 0) return QY.QUESTS[id];
    }
    return null;
  }
  function stepIdxOf(qid) { return game.quest.stepIdx[qid] || 0; }
  function curStep(q) { return q.steps[stepIdxOf(q.id)]; }
  QY.activeMain = activeMain; QY.stepIdxOf = stepIdxOf; QY.curStep = curStep;
  function talkTarget(step, npc) {
    if (step.target === npc.id) return true;
    if (step.target === npc.group && npc.group) return true;
    if (step.targets && step.targets.indexOf(npc.id) >= 0) return true;
    return false;
  }
  /* 判断某步是否响应某事件 */
  function stepMatch(step, kind, p) {
    if (step.type === 'kill' && kind === 'kill') return step.target === p.type;
    if (step.type === 'talk' && kind === 'talk') return talkTarget(step, p.npc);
    if (step.type === 'collect' && kind === 'collect') return step.target === p.id;
    if (step.type === 'reach' && kind === 'reach') return step.target === p.id;
    if (step.type === 'survive_wave' && kind === 'wave') return true;
    return false;
  }
  /* 统一进度事件入口：先主线，后支线 */
  QY.progressEvent = function (kind, p) {
    var q = activeMain();
    if (q) {
      var step = curStep(q);
      if (stepMatch(step, kind, p)) record(q, step, p);
    }
    /* 支线任务同步判定 */
    for (var sid in game.sides) {
      if (game.sides[sid] !== 'active') continue;
      var sq = QY.QUESTS[sid], ss = sq.steps[stepIdxOf(sid)];
      if (stepMatch(ss, kind, p)) record(sq, ss, p);
    }
  };
  /* 记录本步进度，达到 count 则 completeStep */
  function record(q, step, p) {
    /* talk 步骤按 NPC 身份去重：同一 NPC 在同一步只计一次。
       talkedIds 随 game.quest 持久化，读档后仍生效；
       旧存档无此数据时视为空，卡住的“2/3”可与任一未计村民交谈后自愈 */
    if (step.type === 'talk' && p && p.npc) {
      if (!game.quest.talkedIds) game.quest.talkedIds = {};
      var ids0 = game.quest.talkedIds[q.id];
      if (!ids0) ids0 = game.quest.talkedIds[q.id] = [];
      if (ids0.indexOf(p.npc.id) >= 0) return;
      ids0.push(p.npc.id);
    }
    if (!step.count) { completeStep(q); return; }
    var key = q.id;
    game.quest.progress[key] = (game.quest.progress[key] || 0) + 1;
    var n = game.quest.progress[key];
    questDirty(); // 进度数字变化
    if (n >= step.count) completeStep(q);
  }
  QY.completeStep = function (q) { completeStep(q); };
  function completeStep(q) {
    var idx = stepIdxOf(q.id) + 1;
    game.quest.stepIdx[q.id] = idx;
    game.quest.progress[q.id] = 0;
    /* 新步骤新计数：清空本任务的已谈 NPC 列表 */
    if (game.quest.talkedIds) delete game.quest.talkedIds[q.id];
    questDirty(); // 步骤切换
    if (idx >= q.steps.length) completeQuest(q);
    else QY.UI.toast('任务进展 · ' + q.steps[idx].desc);
  }
  function completeQuest(q) {
    if (game.quest.completed.indexOf(q.id) >= 0) return; // 防重复发奖
    game.quest.completed.push(q.id);
    questDirty(); // 任务完成 / 解锁变化
    var r = q.rewards || {};
    if (r.gold) game.player.gold += r.gold;
    if (r.exp) gainExp(r.exp);
    if (r.skill) { game.player.skills[r.skill] = true; }
    if (r.items) for (var it in r.items) addItem(it, r.items[it]);
    if (q.side) {
      game.sides[q.id] = 'done';
      var cs0 = q.steps[0]; // 支线交付时扣除采集物
      if (cs0.type === 'collect') {
        game.inventory[cs0.target] = Math.max(0, (game.inventory[cs0.target] || 0) - cs0.count);
      }
    }
    var msg = '任务完成 · ' + q.name;
    if (r.skill) msg += '（习得 ' + CFG.SKILLS[r.skill].name + '）';
    QY.UI.toast(msg);
    if (q.id === 'q6') QY.Main.onGameEnd();
  }
  /* 接受支线 */
  QY.acceptSide = function (id) {
    if (game.sides[id] === 'none') { game.sides[id] = 'active'; questDirty(); }
  };
  /* ---------------- 剧情 flags ---------------- */
  QY.setFlag = function (k, v) { game.flags[k] = (v === undefined ? true : v); };
  QY.flag = function (k) { return !!game.flags[k]; };
/* 刷怪 */
  function spawnEnemy(type, x, y) {
    var def = CFG.ENEMIES[type], sc = QY.SceneManager.scene();
    var mul = sc.spawn || { hpMul: 1, atkMul: 1 };
    var e = {
      type: type, def: def,
      x: x, y: y, radius: def.radius,
      hp: Math.round(def.hp * (mul.hpMul || 1)), maxHP: Math.round(def.hp * (mul.hpMul || 1)),
      atk: Math.round(def.atk * (mul.atkMul || 1)),
      speed: def.speed,
      shockT: def.shockCD || 0, chargeT: def.chargeCD || 0, shootT: def.shootCD || 0,
      state: 'run', stateT: 0, vx: 0, vy: 0, dashAng: 0,
      slowT: 0, freezeT: 0, touchT: 0
    };
    game.enemies.push(e);
    if (def.boss) { game.boss = e; e.phase = 1; QY.UI.showBossBar(e); }
    return e;
  }
  QY.spawnEnemy = spawnEnemy;
  /* 定时刷怪（波次战期间由 scenes 接管，此处不刷） */
  function spawnTick(dt) {
    var sc = QY.SceneManager.scene(); if (!sc) return;
    var sp = sc.spawn;
    if (!sp.interval || !sp.pool.length || game.waves) return;
    game.spawnTimer -= dt * 1000;
    if (game.spawnTimer <= 0 && game.enemies.length < sp.max) {
      game.spawnTimer = sp.interval;
      var p = game.player, x, y, tries = 0;
      do {
        x = rand(60, sc.width - 60); y = rand(60, sc.height - 60); tries++;
      } while (dist(x, y, p.x, p.y) < 320 && tries < 12);
      spawnEnemy(sp.pool[Math.floor(rand(0, sp.pool.length))], x, y);
    }
  }
/* 战斗：剑气 / 技能 */
  function basicAttack() {
    var p = game.player, B = CFG.BASIC_ATTACK;
    if (p.attackCD > 0) return;
    p.attackCD = B.cd;
    var a = p.angle;
    game.bolts.push({
      x: p.x + Math.cos(a) * 22, y: p.y + Math.sin(a) * 22,
      vx: Math.cos(a) * B.speed, vy: Math.sin(a) * B.speed,
      traveled: 0, dmg: Math.round(p.atk * B.damage), radius: B.radius, hit: {}
    });
  }
  function castSkill(i) {
    var p = game.player, sk = CFG.SKILLS[i];
    if (!p.skills[i] || p.skillCD[i] > 0 || p.mp < sk.cost) return;
    p.mp -= sk.cost; p.skillCD[i] = sk.cd;
    if (sk.type === 'fan') {
      /* 霜刃斩：前方扇形，重创扇形内单体/多个敌人 */
      game.effects.push({ kind: 'fan', x: p.x, y: p.y, angle: p.angle, arc: sk.arc, range: sk.range, t: 350 });
      for (var k = 0; k < game.enemies.length; k++) {
        var e = game.enemies[k];
        var d = dist(p.x, p.y, e.x, e.y);
        if (d <= sk.range + e.radius) {
          var da = Math.atan2(e.y - p.y, e.x - p.x);
          var diff = Math.abs(((da - p.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
          if (diff <= sk.arc) damageEnemy(e, Math.round(p.atk * sk.damage) + sk.fix);
        }
      }
    } else if (sk.type === 'frost') {
      /* 寒霜剑阵：鼠标位置，冰冻减速 + 持续伤害
         game.time 单位为秒，duration 配置为毫秒，需换算，否则剑阵近一小时不消失 */
      game.effects.push({
        kind: 'frost', x: game.mouse.wx, y: game.mouse.wy, r: sk.radius,
        until: game.time + sk.duration / 1000, tickT: 0, dmg: Math.round(p.atk * sk.damage) + sk.fix
      });
      QY.UI.toast('寒霜剑阵已布下');
    } else if (sk.type === 'rain') {
      /* 万剑归宗：当前视野全屏剑雨（hitId 为本次施法去重凭证） */
      var r = { kind: 'rain', t: 900, swords: [], dmg: Math.round(p.atk * sk.damage) + sk.fix, hitId: ++rainSeq };
      for (var s = 0; s < sk.swords; s++) {
        r.swords.push({ x: game.camera.x + rand(0, game.view.w), y: game.camera.y + rand(-120, game.view.h),
          delay: rand(0, 700), done: false });
      }
      game.effects.push(r);
      QY.UI.toast('万剑归宗！');
    }
  }
  QY.castSkill = castSkill;
  function damageEnemy(e, dmg) {
    if (e.hp <= 0) return;
    e.hp -= dmg;
    addFloater(e.x, e.y - e.radius - 6, dmg, '#f5f0e6');
    burst(e.x, e.y, 3, '#2c2c2c', 70);
    if (e.hp <= 0) killEnemy(e);
  }
  QY.damageEnemy = damageEnemy;
  function killEnemy(e) {
    e.hp = 0;
    var i = game.enemies.indexOf(e);
    if (i >= 0) game.enemies.splice(i, 1);
    /* 实例级覆盖值优先（噬灵分裂子体被弱化时使用），避免改坏完整 def */
    var expVal = e.expVal != null ? e.expVal : e.def.exp;
    var goldVal = e.goldVal != null ? e.goldVal : e.def.gold;
    gainExp(expVal);
    /* 金币与掉落物 */
    var g = Math.round(rand(CFG.DROP_RATE.gold[0], CFG.DROP_RATE.gold[1]));
    game.drops.push({ kind: 'gold', x: e.x + rand(-8, 8), y: e.y + rand(-8, 8), amount: g + goldVal, t: 0 });
    if (Math.random() * 1000 < CFG.DROP_RATE.hp_yao) game.drops.push({ kind: 'item', id: 'hp_yao', x: e.x, y: e.y, t: 0 });
    if (Math.random() * 1000 < CFG.DROP_RATE.mp_yao) game.drops.push({ kind: 'item', id: 'mp_yao', x: e.x, y: e.y, t: 0 });
    burst(e.x, e.y, 12, e.def.color, 130);
    /* 噬灵死亡分裂 */
    if (e.def.split) {
      for (var k2 = 0; k2 < e.def.split; k2++) {
        var child = spawnEnemy('moyao', e.x + rand(-20, 20), e.y + rand(-20, 20));
        /* 保留完整 def（含 ai/gold 等），仅做实例级弱化；
           此前直接覆盖 def 导致子体无 AI 原地不动、死亡时金币 NaN */
        child.hp = child.maxHP = 26; child.radius = 10;
        child.atk = Math.max(4, Math.round(child.atk * 0.6));
        child.expVal = 10; child.goldVal = 2;
      }
      QY.UI.toast('噬灵分裂了！');
    }
    /* 主线 / 支线击杀计数（唯一上报点） */
    QY.progressEvent('kill', { type: e.type });
    /* 场景脚本钩子（精英/头领/BOSS死亡剧情、BOSS血条关闭） */
    QY.SceneManager.hookKill(e);
  }
/* 敌人 AI */
  function moveToward(e, tx, ty, sp, dt) {
    var a = Math.atan2(ty - e.y, tx - e.x);
    e.x += Math.cos(a) * sp * dt; e.y += Math.sin(a) * sp * dt;
    return a;
  }
  function touchDamage(e, dt) {
    var p = game.player;
    e.touchT -= dt * 1000;
    if (dist(e.x, e.y, p.x, p.y) < e.radius + p.radius && e.touchT <= 0) {
      e.touchT = CFG.PLAYER.touchCD;
      hurtPlayer(e.atk);
    }
  }
  function updateEnemy(e, dt) {
    var p = game.player;
    e.stateT -= dt * 1000;
    if (e.slowT > 0) e.slowT -= dt * 1000;
    var slow = e.slowT > 0 ? 0.45 : 1;
    if (e.def.ai === 'chase') {
      moveToward(e, p.x, p.y, e.speed * slow, dt);
    } else if (e.def.ai === 'elite') {
      moveToward(e, p.x, p.y, e.speed * slow, dt);
      e.shockT -= dt * 1000;
      if (e.shockT <= 0 && dist(e.x, e.y, p.x, p.y) < e.def.shockR + 60) {
        e.shockT = e.def.shockCD;
        game.effects.push({ kind: 'shock', x: e.x, y: e.y, r: e.def.shockR, t: 450, dur: 450 });
        if (dist(e.x, e.y, p.x, p.y) < e.def.shockR) {
          hurtPlayer(Math.round(e.atk * e.def.shockDmg));
          var a = Math.atan2(p.y - e.y, p.x - e.x);
          p.x += Math.cos(a) * 34; p.y += Math.sin(a) * 34;
        }
      }
    } else if (e.def.ai === 'charger') {
      e.chargeT -= dt * 1000;
      if (e.state === 'run') {
        moveToward(e, p.x, p.y, e.speed * slow, dt);
        if (e.chargeT <= 0 && dist(e.x, e.y, p.x, p.y) < 420) {
          e.state = 'wind'; e.stateT = 420; e.dashAng = Math.atan2(p.y - e.y, p.x - e.x);
        }
      } else if (e.state === 'wind') {
        if (e.stateT <= 0) { e.state = 'dash'; e.stateT = 560; }
      } else {
        e.x += Math.cos(e.dashAng) * e.def.chargeSpeed * dt;
        e.y += Math.sin(e.dashAng) * e.def.chargeSpeed * dt;
        if (e.stateT <= 0) { e.state = 'run'; e.chargeT = e.def.chargeCD; }
      }
    } else if (e.def.ai === 'ranged') {
      var d = dist(e.x, e.y, p.x, p.y), a;
      if (d > 300) a = moveToward(e, p.x, p.y, e.speed, dt);
      else if (d < 200) a = moveToward(e, p.x, p.y, -e.speed, dt);
      else { a = Math.atan2(p.y - e.y, p.x - e.x) + Math.cos(game.time * 2) * 0.5;
        e.x += Math.cos(a) * e.speed * 0.6 * dt; e.y += Math.sin(a) * e.speed * 0.6 * dt; }
      e.shootT -= dt * 1000;
      if (e.shootT <= 0) {
        e.shootT = e.def.shootCD;
        var aa = Math.atan2(p.y - e.y, p.x - e.x);
        game.enemyBolts.push({ x: e.x, y: e.y, vx: Math.cos(aa) * e.def.boltSpeed,
          vy: Math.sin(aa) * e.def.boltSpeed, r: 6, dmg: e.atk, t: 4000 });
      }
    } else if (e.def.ai === 'boss') {
      updateBoss(e, dt, slow);
    }
    /* 场景边界与接触伤害 */
    var sc = QY.SceneManager.scene();
    e.x = clamp(e.x, e.radius, sc.width - e.radius);
    e.y = clamp(e.y, e.radius, sc.height - e.radius);
    touchDamage(e, dt);
  }
  /* BOSS 霜骨巨灵：两阶段 */
  function updateBoss(e, dt, slow) {
    var p = game.player;
    /* 阶段切换：HP 低于 40% */
    if (e.phase === 1 && e.hp / e.maxHP <= 0.4) {
      e.phase = 2;
      QY.UI.toast('霜骨巨灵 · 风雪葬阶段');
      burst(e.x, e.y, 30, '#9fc7d6', 240);
    }
    if (e.phase === 1) {
      moveToward(e, p.x, p.y, e.speed * slow, dt);
      e.shockT -= dt * 1000;
      if (e.shockT <= 0) {
        e.shockT = e.def.shockCD;
        game.effects.push({ kind: 'shock', x: e.x, y: e.y, r: e.def.shockR, t: 520, dur: 520 });
        if (dist(e.x, e.y, p.x, p.y) < e.def.shockR) hurtPlayer(Math.round(e.atk * e.def.shockDmg));
      }
      e.shootT -= dt * 1000;
      if (e.shootT <= 0) {
        e.shootT = e.def.summonCD;
        spawnEnemy('shiling', e.x + rand(-70, 70), e.y + rand(-70, 70));
        spawnEnemy('shiling', e.x + rand(-70, 70), e.y + rand(-70, 70));
        QY.UI.toast('巨灵召唤了噬灵！');
      }
    } else {
      /* 阶段二：冰锥弹幕 + 冲撞 */
      moveToward(e, p.x, p.y, e.speed * 1.6 * slow, dt);
      e.shootT -= dt * 1000;
      if (e.shootT <= 0) {
        e.shootT = e.def.shootCD;
        for (var k = 0; k < 10; k++) {
          var aa = (Math.PI * 2 / 10) * k + game.time;
          game.enemyBolts.push({ x: e.x, y: e.y, vx: Math.cos(aa) * e.def.boltSpeed,
            vy: Math.sin(aa) * e.def.boltSpeed, r: 7, dmg: e.atk * 0.6, t: 5000 });
        }
      }
      e.chargeT -= dt * 1000;
      if (e.chargeT <= 0 && e.state !== 'dash') {
        e.state = 'dash'; e.stateT = 800;
        e.dashAng = Math.atan2(p.y - e.y, p.x - e.x);
      }
      if (e.state === 'dash') {
        e.x += Math.cos(e.dashAng) * e.def.chargeSpeed * dt;
        e.y += Math.sin(e.dashAng) * e.def.chargeSpeed * dt;
        if (e.stateT <= 0) { e.state = 'run'; e.chargeT = e.def.chargeCD; }
      }
    }
  }
  /* 敌人之间简单分离，避免重叠（平方距离先行，避免 hypot 开销） */
  function separate() {
    var es = game.enemies;
    for (var i = 0; i < es.length; i++) {
      var a = es[i];
      for (var j = i + 1; j < es.length; j++) {
        var b = es[j], min = a.radius + b.radius;
        var dx = b.x - a.x, dy = b.y - a.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < min * min && (dx !== 0 || dy !== 0)) {
          var d = Math.sqrt(d2), push = (min - d) / 2, ang = Math.atan2(dy, dx);
          a.x -= Math.cos(ang) * push; a.y -= Math.sin(ang) * push;
          b.x += Math.cos(ang) * push; b.y += Math.sin(ang) * push;
        }
      }
    }
  }
/* 投射物 / 掉落 / 特效 / 粒子 */
  function updateBolts(dt) {
    for (var i = game.bolts.length - 1; i >= 0; i--) {
      var b = game.bolts[i];
      b.x += b.vx * dt; b.y += b.vy * dt;
      /* 射程按实际速度模长累计（此前只取 vx，斜向剑气射程偏长） */
      b.traveled += Math.hypot(b.vx, b.vy) * dt;
      for (var k = 0; k < game.enemies.length; k++) {
        var e = game.enemies[k];
        if (!b.hit[e.type + k] && dist(b.x, b.y, e.x, e.y) < b.radius + e.radius) {
          damageEnemy(e, b.dmg); b.hit[e.type + k] = 1; b.traveled = 999; // 剑气命中即散
        }
      }
      if (b.traveled > CFG.BASIC_ATTACK.range) game.bolts.splice(i, 1);
    }
    for (var i2 = game.enemyBolts.length - 1; i2 >= 0; i2--) {
      var q = game.enemyBolts[i2];
      q.x += q.vx * dt; q.y += q.vy * dt; q.t -= dt * 1000;
      var p = game.player;
      if (dist(q.x, q.y, p.x, p.y) < q.r + p.radius) { hurtPlayer(q.dmg); game.enemyBolts.splice(i2, 1); continue; }
      if (q.t <= 0) game.enemyBolts.splice(i2, 1);
    }
  }
  function updateDrops(dt) {
    var p = game.player;
    for (var i = game.drops.length - 1; i >= 0; i--) {
      var d = game.drops[i]; d.t += dt * 1000;
      if (dist(d.x, d.y, p.x, p.y) < CFG.PLAYER.pickRadius) {
        if (d.kind === 'gold') { p.gold += d.amount; addFloater(p.x, p.y - 24, '+' + d.amount + '文', '#f5d76e'); }
        else {
          addItem(d.id, 1);
          if (CFG.ITEMS[d.id].kind !== 'quest') QY.UI.toast('获得 ' + CFG.ITEMS[d.id].name);
          QY.progressEvent('collect', { id: d.id });
        }
        game.drops.splice(i, 1);
      }
    }
  }
  function updateEffects(dt) {
    for (var i = game.effects.length - 1; i >= 0; i--) {
      var f = game.effects[i];
      if (f.kind === 'frost') {
        f.tickT -= dt * 1000;
        if (f.tickT <= 0) {
          f.tickT = CFG.SKILLS[2].tick;
          for (var k = 0; k < game.enemies.length; k++) {
            var e = game.enemies[k];
            if (dist(f.x, f.y, e.x, e.y) < f.r + e.radius) {
              damageEnemy(e, f.dmg); e.slowT = 600;
              burst(e.x, e.y, 2, '#9fc7d6', 60);
            }
          }
        }
        if (game.time > f.until) game.effects.splice(i, 1);
      } else if (f.kind === 'rain') {
        f.t -= dt * 1000;
        for (var s2 = 0; s2 < f.swords.length; s2++) {
          var sw = f.swords[s2];
          sw.delay -= dt * 1000;
          if (sw.delay <= 0 && !sw.done) {
            sw.done = true;
            for (var k2 = 0; k2 < game.enemies.length; k2++) {
              var en = game.enemies[k2];
              /* 同一敌人在同一次剑雨中只受一次伤，与数组索引无关 */
              if (en._rainHit !== f.hitId && dist(sw.x, sw.y, en.x, en.y) < en.radius + 26) {
                damageEnemy(en, f.dmg); en._rainHit = f.hitId;
              }
            }
          }
        }
        if (f.t <= 0) game.effects.splice(i, 1);
      } else {
        f.t -= dt * 1000;
        if (f.t <= 0) game.effects.splice(i, 1);
      }
    }
  }
  /* ---------------- 粒子 / 飘字 ---------------- */
  function burst(x, y, n, color, sp) {
    for (var i = 0; i < n; i++) {
      /* 超出上限丢弃最老粒子，防止激战时粒子无限堆积 */
      if (game.particles.length >= CFG.MAX_PARTICLES) game.particles.shift();
      var a = rand(0, Math.PI * 2), v = rand(sp * 0.3, sp);
      game.particles.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: rand(300, 700), max: 700, color: color, size: rand(2, 5) });
    }
  }
  function ringBurst(x, y) {
    /* 升级金光 */
    for (var i = 0; i < 26; i++) {
      var a = (Math.PI * 2 / 26) * i;
      game.particles.push({ x: x, y: y, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130,
        life: 800, max: 800, color: '#f5d76e', size: 4 });
    }
  }
  function addFloater(x, y, text, color) {
    if (game.floaters.length >= CFG.MAX_FLOATERS) game.floaters.shift();
    game.floaters.push({ x: x + rand(-6, 6), y: y, text: text, color: color, life: 850 });
  }
  function updateParticles(dt) {
    for (var i = game.particles.length - 1; i >= 0; i--) {
      var p = game.particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94;
      p.life -= dt * 1000;
      if (p.life <= 0) game.particles.splice(i, 1);
    }
    for (var j = game.floaters.length - 1; j >= 0; j--) {
      var f = game.floaters[j];
      f.y -= 38 * dt; f.life -= dt * 1000;
      if (f.life <= 0) game.floaters.splice(j, 1);
    }
  }
/* 主更新：每帧由 main 调用（dt 秒） */
  QY.CoreUpdate = function (dt) {
    var p = game.player, sc = QY.SceneManager.scene();
    game.time += dt;
    /* 计时器 / 恢复 */
    p.hurtT -= dt * 1000; p.touchT -= dt * 1000; p.slowT -= dt * 1000;
    p.attackCD -= dt * 1000;
    for (var ci in p.skillCD) p.skillCD[ci] -= dt * 1000;
    p.hp = Math.min(p.maxHP, p.hp + CFG.PLAYER.hpRegen * dt);
    p.mp = Math.min(p.maxMP, p.mp + CFG.PLAYER.mpRegen * dt);
    p.speedMul = p.slowT > 0 ? 0.55 : 1;
    /* 移动：WASD / 方向键 */
    var mx = (game.keys.d ? 1 : 0) - (game.keys.a ? 1 : 0);
    var my = (game.keys.s ? 1 : 0) - (game.keys.w ? 1 : 0);
    if (game.keys.arrowleft) mx -= 1; if (game.keys.arrowright) mx += 1;
    if (game.keys.arrowup) my -= 1; if (game.keys.arrowdown) my += 1;
    if (mx || my) {
      var l = Math.hypot(mx, my);
      p.x += mx / l * CFG.PLAYER.speed * p.speedMul * dt;
      p.y += my / l * CFG.PLAYER.speed * p.speedMul * dt;
      p.face = mx >= 0 ? 1 : -1;
    }
    p.x = clamp(p.x, p.radius, sc.width - p.radius);
    p.y = clamp(p.y, p.radius, sc.height - p.radius);
    p.angle = Math.atan2(game.mouse.wy - p.y, game.mouse.wx - p.x);
    /* 长按左键持续普攻（受冷却限制） */
    if (game.mouse.down) basicAttack();
    /* 敌人 / 战斗 / 世界 */
    for (var i = 0; i < game.enemies.length; i++) updateEnemy(game.enemies[i], dt);
    separate();
    updateBolts(dt);
    updateDrops(dt);
    updateEffects(dt);
    updateParticles(dt);
    spawnTick(dt);
    /* 相机跟随并限制在场景内 */
    game.camera.x = clamp(p.x - game.view.w / 2, 0, Math.max(0, sc.width - game.view.w));
    game.camera.y = clamp(p.y - game.view.h / 2, 0, Math.max(0, sc.height - game.view.h));
    /* 相机移动后刷新鼠标世界坐标（此前只在 mousemove 时更新，相机漂移会造成落阵偏差） */
    game.mouse.wx = game.mouse.sx + game.camera.x;
    game.mouse.wy = game.mouse.sy + game.camera.y;
  };
})();
