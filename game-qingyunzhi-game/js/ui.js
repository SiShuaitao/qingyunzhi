/* ============================================================
 * ui.js —— HUD、任务追踪、对话面板、背包、菜单、
 *          过场字幕、BOSS 血条、死亡界面、结局卷轴、toast
 * ============================================================ */
(function () {
  'use strict';
  var QY = window.QY = window.QY || {};
  var CFG = QY.CONFIG;
  var game = QY.game;

  function $(id) { return document.getElementById(id); }
  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  var UI = {};
  QY.UI = UI;

  /* ---------- DOM 写入优化：仅在值变化时写文本 / 宽度，避免每帧强制布局 ---------- */
  function setTextEl(el, val) {
    val = String(val);
    if (el._qv !== val) { el._qv = val; el.textContent = val; }
  }
  function setWidth(el, pct) {
    pct = Math.max(0, Math.min(100, pct));
    /* 变化小于 0.3% 跳过，减少 style 重算 */
    if (el._qpct == null || Math.abs(el._qpct - pct) > 0.3) {
      el._qpct = pct;
      el.style.width = pct + '%';
    }
  }

  /* ---------- 任务追踪脏标记：仅任务状态 / 进度变化时重建 innerHTML ---------- */
  var questDirty = true;
  UI.questDirty = function () { questDirty = true; };

  /* ============================================================
   * Toast：顶部居中短暂提示
   * ============================================================ */
  var toastEl = $('toast'), toastTimer = null;
  UI.toast = function (msg, dur) {
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.style.opacity = '0'; }, dur || 1900);
  };

  /* ============================================================
   * 进入游戏：隐藏主菜单，显示 HUD 套件
   * ============================================================ */
  UI.enterGameUI = function () {
    hide($('menu'));
    show($('hud')); show($('skillBar')); show($('minimap')); show($('hintBar'));
    hide($('deathScreen'));
  };

  /* ============================================================
   * 死亡界面
   * ============================================================ */
  UI.showDeath = function () {
    var d = $('deathScreen');
    d.style.display = 'flex';
  };
  UI.hideDeath = function () {
    $('deathScreen').style.display = 'none';
  };

  /* ============================================================
   * BOSS 血条（顶部专属，含阶段名）
   * ============================================================ */
  UI.showBossBar = function (e) {
    $('bossBar').style.display = 'block';
    $('bossName').textContent = e.def.name;
    $('bossPhase').textContent = '阶段一 · 寒霜巨躯';
  };
  UI.hideBossBar = function () {
    $('bossBar').style.display = 'none';
  };
  function updateBossBar() {
    var e = game.boss;
    if (!e) return;
    setWidth($('bossFill'), Math.max(0, e.hp / e.maxHP * 100));
    var phaseText = e.phase === 1 ? '阶段一 · 寒霜巨躯' : '阶段二 · 风雪葬';
    setTextEl($('bossPhase'), phaseText);
  }

  /* ============================================================
   * HUD：场景名、血灵经验条、属性
   * ============================================================ */
  function updateHUD() {
    var sc = QY.SceneManager.scene(), p = game.player;
    setTextEl($('sceneName'), sc.name);
    setTextEl($('sceneSub'), sc.subtitle);
    setWidth($('hpFill'), p.hp / p.maxHP * 100);
    setWidth($('mpFill'), p.mp / p.maxMP * 100);
    setWidth($('expFill'), p.exp / p.expNext * 100);
    setTextEl($('hpText'), Math.round(p.hp) + ' / ' + p.maxHP);
    setTextEl($('mpText'), Math.round(p.mp) + ' / ' + p.maxMP);
    setTextEl($('expText'), p.exp + ' / ' + p.expNext);
    setTextEl($('statLv'), p.level);
    setTextEl($('statAtk'), p.atk);
    setTextEl($('statDef'), p.def);
    setTextEl($('statGold'), p.gold);
    updateSkillBar();
    /* 任务面板：仅脏时重建 innerHTML */
    if (questDirty) { updateQuestTrack(); questDirty = false; }
    updateBossBar();
  }

  /* 技能栏：解锁状态 + 冷却遮罩 */
  function updateSkillBar() {
    var p = game.player;
    [1, 2, 3].forEach(function (i) {
      var slot = $('skill' + i), mask = slot.querySelector('.cd-mask');
      var sk = CFG.SKILLS[i];
      if (p.skills[i]) {
        slot.classList.remove('locked'); slot.classList.add('ready');
        var ratio = Math.max(0, p.skillCD[i] / sk.cd);
        if (ratio > 0) {
          if (mask._shown !== true) { mask._shown = true; mask.style.display = 'block'; }
          var h = ratio * 100;
          if (mask._h == null || Math.abs(mask._h - h) > 0.6) { mask._h = h; mask.style.height = h + '%'; }
        } else if (mask._shown !== false) {
          mask._shown = false; mask._h = null; mask.style.display = 'none';
        }
      } else {
        slot.classList.add('locked'); slot.classList.remove('ready');
        if (mask._shown !== false) { mask._shown = false; mask.style.display = 'none'; }
      }
    });
  }

  /* ============================================================
   * 任务追踪：主线多步骤 + 支线，仅当前步骤高亮
   * ============================================================ */
  function progressText(step, qid) {
    if (!step.count) return '';
    var n = game.quest.progress[qid] || 0;
    return '（' + Math.min(n, step.count) + '/' + step.count + '）';
  }

  function updateQuestTrack() {
    var el = $('questTrack'), html = '';
    var q = QY.activeMain();
    if (q) {
      var idx = QY.stepIdxOf(q.id);
      html += '<div class="qt-title">◆ ' + q.name + '</div>';
      q.steps.forEach(function (s, i) {
        var cls = i < idx ? 'done' : (i === idx ? 'cur' : '');
        var extra = i === idx ? progressText(s, q.id) : '';
        html += '<div class="qt-step ' + cls + '">' + s.desc + extra + '</div>';
      });
    }
    /* 支线状态 */
    for (var sid in game.sides) {
      var st = game.sides[sid];
      if (st === 'none') continue;
      var sq = QY.QUESTS[sid], sidx = QY.stepIdxOf(sid);
      html += '<div class="qt-side">支线 · ' + sq.name + '<br>';
      if (st === 'done') html += '已完成';
      else {
        var step0 = sq.steps[sidx];
        html += step0.desc + progressText(step0, sid);
      }
      html += '</div>';
    }
    el.innerHTML = html;
  }

  /* ============================================================
   * 对话系统：数据化对话树，色块头像 + 逐行文本
   * ============================================================ */
  function questDone(id) { return game.quest.completed.indexOf(id) >= 0; }

  /* 对话块条件判定 */
  function condOk(cf) {
    if (!cf) return true;
    if (cf.step) {
      if (questDone(cf.step[0])) return false;
      if (QY.stepIdxOf(cf.step[0]) !== cf.step[1]) return false;
    }
    if (cf.side) {
      if (game.sides[cf.side[0]] !== 'active') return false;
      if (QY.stepIdxOf(cf.side[0]) !== cf.side[1]) return false;
    }
    if (cf.sideNone && game.sides[cf.sideNone] !== 'none') return false;
    if (cf.sideDone && game.sides[cf.sideDone] !== 'done') return false;
    if (cf.flag && !game.flags[cf.flag]) return false;
    if (cf.flagNot && game.flags[cf.flagNot]) return false;
    if (cf.questDone && !questDone(cf.questDone)) return false;
    return true;
  }

  function pickBlock(npc) {
    var blocks = QY.DIALOGUES[npc.id];
    for (var i = 0; i < blocks.length; i++) if (condOk(blocks[i].if)) return blocks[i];
    return blocks[blocks.length - 1];
  }

  UI.openDialogue = function (npc) {
    var block = pickBlock(npc);
    game.dialogue = { npc: npc, block: block, li: 0, chars: 0 };
    $('dlgPortrait').textContent = npc.name.charAt(0);
    $('dlgPortrait').style.background = npc.color;
    $('dlgSpeaker').textContent = npc.name;
    $('dlgBranches').innerHTML = '';
    $('dialogue').style.display = 'block';
  };

  function curLineText() {
    var d = game.dialogue, line = d.block.lines[d.li];
    return typeof line === 'string' ? line : line.text;
  }

  /* E / 点击推进对话 */
  UI.advanceDialogue = function () {
    var d = game.dialogue;
    var text = curLineText();
    if (d.chars < text.length) { d.chars = text.length; renderDialogueLine(); return; }
    d.li++;
    d.chars = 0;
    if (d.li >= d.block.lines.length) UI.closeDialogue();
    else renderDialogueLine();
  };

  UI.closeDialogue = function () {
    var d = game.dialogue;
    if (!d) return;
    var npc = d.npc, block = d.block;
    /* 村民首次交谈置旗（影响后续对话块） */
    if (npc.id.indexOf('villager') === 0) QY.setFlag('talked_' + npc.id);
    /* 块动作：接受支线 */
    if (block.action && block.action.indexOf('accept:') === 0) {
      QY.acceptSide(block.action.slice(7));
    }
    $('dialogue').style.display = 'none';
    game.dialogue = null;
    /* 交谈进度（唯一上报点） */
    QY.progressEvent('talk', { npc: npc });
  };

  function renderDialogueLine() {
    var d = game.dialogue, text = curLineText();
    $('dlgText').textContent = text.slice(0, d.chars);
    var line = d.block.lines[d.li], bc = $('dlgBranches');
    bc.innerHTML = '';
    if (typeof line === 'object' && line.branches && d.chars >= text.length) {
      line.branches.forEach(function (b) {
        var btn = document.createElement('button');
        btn.textContent = b.text;
        btn.onclick = function () {
          d.li = b.jump; d.chars = 0; renderDialogueLine();
        };
        bc.appendChild(btn);
      });
    }
  }

  /* ============================================================
   * 背包（B）
   * ============================================================ */
  UI.toggleInventory = function () {
    var el = $('inventory');
    var open = el.style.display === 'block';
    el.style.display = open ? 'none' : 'block';
    if (!open) UI.renderInventory();
  };
  UI.renderInventory = function () {
    var grid = $('invGrid'), html = '';
    var any = false;
    Object.keys(game.inventory).forEach(function (id) {
      var n = game.inventory[id]; if (!n) return;
      var def = CFG.ITEMS[id]; any = true;
      html += '<div class="inv-item"><span>' + def.name + ' ×' + n +
        '<br><small style="color:#8a8a82">' + def.desc + '</small></span>';
      if (def.kind === 'consume') html += '<button class="inv-use" data-item="' + id + '">服用</button>';
      html += '</div>';
    });
    if (!any) html = '<div id="invEmpty">行囊空空，多去斩妖吧</div>';
    grid.innerHTML = html;
    grid.querySelectorAll('.inv-use').forEach(function (b) {
      b.onclick = function () { QY.useItem(b.getAttribute('data-item')); };
    });
  };

  /* ============================================================
   * 暂停菜单（Esc）
   * ============================================================ */
  UI.toggleMenu = function (force) {
    var el = $('pauseMenu');
    var open = force != null ? force : el.style.display !== 'block';
    el.style.display = open ? 'block' : 'none';
    game.menuOpen = open;
  };

  /* ============================================================
   * 过场字幕
   * ============================================================ */
  UI.showCutscene = function (data) {
    game.cutscene = { data: data, li: 0, chars: 0 };
    $('cutscene').style.display = 'block';
  };
  UI.advanceCutscene = function () {
    var c = game.cutscene, text = c.data.lines[c.li];
    if (c.chars < text.length) { c.chars = text.length; renderCutLine(); return; }
    c.li++; c.chars = 0;
    if (c.li >= c.data.lines.length) {
      $('cutscene').style.display = 'none';
      game.cutscene = null;
    } else renderCutLine();
  };
  function renderCutLine() {
    var c = game.cutscene;
    $('cutText').textContent = c.data.lines[c.li].slice(0, c.chars);
  }

  /* ============================================================
   * 结局：水墨卷轴 —— 段落逐段显影，随后现出两个按钮
   * ============================================================ */
  UI.openEnding = function () {
    game.state = 'ending';
    UI.hideBossBar();
    hide($('hud')); hide($('skillBar')); hide($('minimap')); hide($('hintBar')); hide($('questTrack'));
    var end = $('ending');
    end.style.display = 'flex';
    var box = $('endText'); box.innerHTML = '';
    var ps = QY.STORY.ending.paragraphs;
    ps.forEach(function (p) {
      var pe = document.createElement('p'); pe.textContent = p; box.appendChild(pe);
    });
    $('endingButtons').style.display = 'none';
    game.endingSeq = { i: 0, t: 100 };
  };

  function updateEnding(dt) {
    var s = game.endingSeq;
    if (!s) return;
    s.t -= dt * 1000;
    var ps = $('endText').querySelectorAll('p');
    if (s.t <= 0) {
      if (s.i < ps.length) {
        ps[s.i].classList.add('show');
        s.i++; s.t = 1300;
      } else {
        $('endingButtons').style.display = 'flex';
        game.endingSeq = null;
      }
    }
  }

  /* ============================================================
   * 每帧更新：打字机 / HUD / 结局
   * ============================================================ */
  UI.update = function (dt) {
    /* 对话逐字 */
    if (game.dialogue) {
      var d = game.dialogue, text = curLineText();
      if (d.chars < text.length) {
        d.chars = Math.min(text.length, d.chars + Math.ceil(42 * dt));
        $('dlgText').textContent = text.slice(0, d.chars);
      }
    }
    /* 字幕逐字 */
    if (game.cutscene) {
      var c = game.cutscene, ct = c.data.lines[c.li];
      if (c.chars < ct.length) {
        c.chars = Math.min(ct.length, c.chars + Math.ceil(30 * dt));
        $('cutText').textContent = ct.slice(0, c.chars);
      }
    }
    if (game.state === 'playing') updateHUD();
    if (game.state === 'ending') updateEnding(dt);
  };
})();
