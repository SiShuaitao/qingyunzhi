/* ============================================================
 * main.js —— 输入事件、startGame、主循环、存档读写
 * ============================================================ */
(function () {
  'use strict';
  var QY = window.QY = window.QY || {};
  var CFG = QY.CONFIG;
  var game = QY.game;
  function $(id) { return document.getElementById(id); }

  var canvas = $('gameCanvas');

  var Main = {};
  QY.Main = Main;

  /* ============================================================
   * 画布尺寸
   * ============================================================ */
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    game.view.w = canvas.width;
    game.view.h = canvas.height;
  }
  window.addEventListener('resize', resize);
  resize();

  /* ============================================================
   * 存档 / 读档：localStorage 键 qingyun_save
   * ============================================================ */
  Main.save = function () {
    var p = game.player;
    var data = {
      sceneEntry: game.sceneEntry,
      player: {
        hp: p.hp, mp: p.mp, maxHP: p.maxHP, maxMP: p.maxMP,
        atk: p.atk, def: p.def, level: p.level, exp: p.exp,
        expNext: p.expNext, gold: p.gold, skills: p.skills
      },
      quest: game.quest,
      sides: game.sides,
      flags: game.flags,
      inventory: game.inventory
    };
    try {
      localStorage.setItem(CFG.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) { return false; }
  };

  function hasSave() { return !!localStorage.getItem(CFG.STORAGE_KEY); }

  Main.load = function () {
    var raw = localStorage.getItem(CFG.STORAGE_KEY);
    if (!raw) return false;
    var data;
    try { data = JSON.parse(raw); } catch (e) { return false; }
    QY.newGame();
    var p = game.player;
    Object.keys(data.player).forEach(function (k) { p[k] = data.player[k]; });
    game.quest = data.quest;
    game.sides = data.sides;
    game.flags = data.flags;
    game.inventory = data.inventory || {};
    var en = data.sceneEntry;
    QY.SceneManager.enterScene(en.id, en.x, en.y);
    return true;
  };

  /* ============================================================
   * 开始游戏
   * ============================================================ */
  Main.startNew = function () {
    QY.newGame();
    var sc = QY.SCENES.shanmen;
    QY.SceneManager.enterScene('shanmen', sc.start.x, sc.start.y);
    game.state = 'playing';
    QY.UI.enterGameUI();
    document.getElementById('questTrack').classList.remove('hidden');
  };

  Main.continueGame = function () {
    if (!Main.load()) { QY.UI.toast('尚无存档，先踏入青云吧'); return; }
    game.state = 'playing';
    QY.UI.enterGameUI();
    document.getElementById('questTrack').classList.remove('hidden');
  };

  /* 通关：展开结局卷轴 */
  Main.onGameEnd = function () {
    Main.save();
    QY.UI.openEnding();
  };

  /* 通关后：再入红尘（继承存档自由探索） */
  Main.freeRoam = function () {
    $('ending').style.display = 'none';
    game.state = 'playing';
    QY.UI.enterGameUI();
    document.getElementById('questTrack').classList.remove('hidden');
    Main.save();
  };

  /* 通关后：回到山门 */
  Main.backHome = function () {
    $('ending').style.display = 'none';
    game.state = 'playing';
    QY.UI.enterGameUI();
    document.getElementById('questTrack').classList.remove('hidden');
    var sc = QY.SCENES.shanmen;
    QY.SceneManager.enterScene('shanmen', sc.start.x, sc.start.y);
    Main.save();
  };

  /* 死亡转世重生（保留等级背包，回最近入口） */
  Main.respawn = function () {
    QY.UI.hideDeath();
    QY.SceneManager.respawn();
  };

  /* 返回主菜单 */
  Main.quitToMenu = function () {
    Main.save();
    QY.UI.toggleMenu(false);
    ['hud', 'skillBar', 'minimap', 'hintBar', 'questTrack'].forEach(function (id) {
      document.getElementById(id).classList.add('hidden');
    });
    $('inventory').style.display = 'none';
    game.state = 'menu';
    $('menu').classList.remove('hidden');
    refreshContinue();
  };

  function refreshContinue() {
    $('btnContinue').style.opacity = hasSave() ? '1' : '.45';
  }

  /* ============================================================
   * 键盘输入
   * ============================================================ */
  window.addEventListener('keydown', function (ev) {
    var k = ev.key.toLowerCase();
    game.keys[k === ' ' ? 'space' : k] = true;

    /* 按住 E 时系统会连发自动重复键，会瞬间跳过台词 / 剧情字幕，
       导致“字幕显示不全”；E 的推进只响应真实点按 */
    if (k === 'e' && ev.repeat) return;

    if (k === 'e') {
      if (game.dialogue) QY.UI.advanceDialogue();
      else if (game.cutscene) QY.UI.advanceCutscene();
      else if (game.state === 'playing' && !game.transition) QY.SceneManager.interactE();
    }
    if (k === 'b' && game.state === 'playing' && !game.dialogue && !game.cutscene && !game.transition) {
      QY.UI.toggleInventory();
    }
    /* 技能仅在正常操作状态可释放：对话 / 字幕 / 死亡 / 结局 / 过渡中一律屏蔽 */
    if ((k === '1' || k === '2' || k === '3') && game.state === 'playing'
        && !game.dialogue && !game.cutscene && !game.transition && !game.menuOpen) {
      QY.castSkill(parseInt(k, 10));
    }
    if (k === 'escape') {
      if (game.dialogue) QY.UI.closeDialogue();
      else if (game.state === 'playing' && !game.cutscene && !game.transition) QY.UI.toggleMenu();
    }
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(k) >= 0) ev.preventDefault();
  });

  window.addEventListener('keyup', function (ev) {
    var k = ev.key.toLowerCase();
    game.keys[k === ' ' ? 'space' : k] = false;
  });

  /* ============================================================
   * 鼠标输入：朝光标左键剑气
   * ============================================================ */
  canvas.addEventListener('mousemove', function (ev) {
    game.mouse.sx = ev.clientX;
    game.mouse.sy = ev.clientY;
    game.mouse.wx = ev.clientX + game.camera.x;
    game.mouse.wy = ev.clientY + game.camera.y;
  });
  canvas.addEventListener('mousedown', function (ev) {
    if (ev.button === 0 && game.state === 'playing') game.mouse.down = true;
  });
  window.addEventListener('mouseup', function (ev) {
    if (ev.button === 0) game.mouse.down = false;
  });
  /* 点击对话框推进（点击分支按钮时不重复推进） */
  $('dialogue').addEventListener('click', function (ev) {
    if (ev.target.tagName === 'BUTTON') return;
    if (game.dialogue) QY.UI.advanceDialogue();
  });

  /* ============================================================
   * 按钮绑定
   * ============================================================ */
  $('btnNew').addEventListener('click', Main.startNew);
  $('btnContinue').addEventListener('click', Main.continueGame);
  $('btnHelp').addEventListener('click', function () {
    $('helpScreen').classList.remove('hidden');
  });
  $('btnHelpClose').addEventListener('click', function () {
    $('helpScreen').classList.add('hidden');
  });
  $('btnRespawn').addEventListener('click', Main.respawn);
  $('btnResume').addEventListener('click', function () { QY.UI.toggleMenu(false); });
  $('btnSave').addEventListener('click', function () {
    QY.UI.toast(Main.save() ? '存档已书入玉简' : '存档失败');
  });
  $('btnQuit').addEventListener('click', Main.quitToMenu);
  $('btnFreeRoam').addEventListener('click', Main.freeRoam);
  $('btnHome').addEventListener('click', Main.backHome);

  /* ============================================================
   * 主循环
   * ============================================================ */
  var lastT = performance.now();
  function loop(now) {
    /* 先注册下一帧：循环体内任何异常都不会让主循环永久停转 */
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    try {
      /* 世界模拟：仅游戏中且无对话框 / 字幕 / 菜单时推进 */
      if (game.state === 'playing' && !game.dialogue && !game.cutscene && !game.menuOpen) {
        QY.CoreUpdate(dt);
        QY.SceneManager.update(dt);
      } else if (game.state === 'playing' && game.transition) {
        QY.SceneManager.update(dt); // 墨晕过渡仍需推进
      }

      QY.UI.update(dt);

      if (game.sceneId) QY.Renderer.draw();
    } catch (err) {
      /* 只报一次，避免异常帧刷屏 */
      if (!loop._errLogged) { loop._errLogged = 1; console.error('[game loop]', err); }
    }
  }

  refreshContinue();
  requestAnimationFrame(loop);
})();
