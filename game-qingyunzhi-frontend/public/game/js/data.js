/* ============================================================
 * data.js —— 全部内容数据（纯数据，无逻辑）
 * SCENES 场景 / QUESTS 任务链 / DIALOGUES 对话树 / STORY 过场字幕
 * ============================================================ */
(function () {
  'use strict';
  var QY = window.QY = window.QY || {};

  /* ============================================================
   * 六幕场景：严格线性，传送门 requireQuest 门控
   * ============================================================ */
  QY.SCENES = {
    /* ---------- 序章 · 青云山门（教学） ---------- */
    shanmen: {
      id: 'shanmen', name: '青云山门', subtitle: '云雾深处，剑道初鸣',
      width: 1600, height: 1200, bgTheme: 'mountain_gate',
      palette: { sky: '#e3e9e7', mountain: '#5a6668', fog: 'rgba(245,240,230,.55)', ground: '#6f6d65' },
      start: { x: 250, y: 860 },
      spawn: { interval: 2400, pool: ['moyao'], max: 8, hpMul: 1, atkMul: 1 },
      npcs: [{ id: 'zhanglao', name: '青云长老', x: 320, y: 540, color: '#b83b3b' }],
      portals: [
        { x: 1480, y: 600, r: 42, target: 'village', tx: 220, ty: 720, requireQuest: 'q1' }
      ],
      hazards: [],
      story: 's_intro'
    },

    /* ---------- 第一章 · 青云村 ---------- */
    village: {
      id: 'village', name: '青云村', subtitle: '炊烟零落，墨染井泉',
      width: 1600, height: 1200, bgTheme: 'village',
      palette: { sky: '#e8e2d2', mountain: '#6a7068', fog: 'rgba(240,232,210,.45)', ground: '#8a7f66' },
      start: { x: 220, y: 720 },
      spawn: { interval: 2200, pool: ['moyao'], max: 9, hpMul: 1.1, atkMul: 1.1 },
      npcs: [
        { id: 'cunzhang', name: '村长', x: 480, y: 560, color: '#b83b3b' },
        { id: 'villager1', name: '村民·阿桂', x: 720, y: 770, group: 'villager', color: '#6b8e7f' },
        { id: 'villager2', name: '村民·秀娘', x: 980, y: 480, group: 'villager', color: '#6b8e7f' },
        { id: 'villager3', name: '村民·老栓', x: 1120, y: 790, group: 'villager', color: '#6b8e7f' },
        { id: 'yaotong', name: '药童', x: 600, y: 910, color: '#4a6b7d' }
      ],
      portals: [
        { x: 110, y: 720, r: 40, target: 'shanmen', tx: 1370, ty: 600 },
        { x: 1480, y: 600, r: 42, target: 'mozhu', tx: 210, ty: 620, requireQuest: 'q2' }
      ],
      decor: [{ type: 'well', x: 880, y: 650 }],
      hazards: [],
      story: 's_village'
    },

    /* ---------- 第二章 · 墨竹林 ---------- */
    mozhu: {
      id: 'mozhu', name: '墨竹林', subtitle: '竹影成阵，妖气溯源',
      width: 1600, height: 1200, bgTheme: 'bamboo',
      palette: { sky: '#dfe5dd', mountain: '#4f5d52', fog: 'rgba(225,232,220,.4)', ground: '#68725e' },
      start: { x: 210, y: 620 },
      spawn: { interval: 2000, pool: ['moyao'], max: 10, hpMul: 1.25, atkMul: 1.2 },
      npcs: [{ id: 'disciple', name: '受伤弟子', x: 1020, y: 720, color: '#4a6b7d' }],
      portals: [
        { x: 110, y: 620, r: 40, target: 'village', tx: 1370, ty: 600 },
        { x: 1480, y: 600, r: 42, target: 'yingwu', tx: 210, ty: 600, requireQuest: 'q3' }
      ],
      special: { elite: { type: 'moyao_king', x: 780, y: 430 } },
      hazards: [],
      story: 's_bamboo'
    },

    /* ---------- 第三章 · 影雾林 ---------- */
    yingwu: {
      id: 'yingwu', name: '影雾林', subtitle: '浓雾锁道，荆棘藏锋',
      width: 1600, height: 1200, bgTheme: 'mist_forest',
      palette: { sky: '#c9d2cf', mountain: '#44504e', fog: 'rgba(210,222,220,.85)', ground: '#5c6660' },
      start: { x: 210, y: 600 },
      spawn: { interval: 1900, pool: ['yingsha'], max: 10, hpMul: 1.15, atkMul: 1.15 },
      npcs: [],
      portals: [
        { x: 110, y: 600, r: 40, target: 'mozhu', tx: 1370, ty: 600 },
        { x: 1480, y: 600, r: 42, target: 'waste', tx: 210, ty: 640, requireQuest: 'q4' }
      ],
      hazards: [
        { type: 'thorn', x: 560, y: 560, w: 200, h: 70 },
        { type: 'thorn', x: 900, y: 770, w: 230, h: 70 },
        { type: 'thorn', x: 380, y: 300, w: 180, h: 60 }
      ],
      special: {
        clues: [{ x: 520, y: 350 }, { x: 1150, y: 520 }, { x: 700, y: 920 }],
        leader: { type: 'yingsha_leader', x: 1260, y: 820 },
        vision: 260
      },
      story: 's_mist'
    },

    /* ---------- 第四章 · 霜骨荒原 ---------- */
    waste: {
      id: 'waste', name: '霜骨荒原', subtitle: '白雪埋骨，寒鸦盘空',
      width: 1600, height: 1200, bgTheme: 'snow_waste',
      palette: { sky: '#dde3e6', mountain: '#7d8d99', fog: 'rgba(235,240,242,.5)', ground: '#c8d2d8' },
      start: { x: 210, y: 640 },
      spawn: { interval: 0, pool: [], max: 0, hpMul: 1.2, atkMul: 1.15 },
      npcs: [{ id: 'xianfeng', name: '先锋将', x: 320, y: 820, color: '#b83b3b' }],
      portals: [
        { x: 110, y: 640, r: 40, target: 'yingwu', tx: 1370, ty: 600 },
        { x: 1480, y: 600, r: 42, target: 'altar', tx: 200, ty: 640, requireQuest: 'q5' }
      ],
      hazards: [
        { type: 'ice', x: 600, y: 500, r: 70 },
        { type: 'ice', x: 900, y: 770, r: 80 },
        { type: 'ice', x: 1180, y: 420, r: 60 }
      ],
      special: {
        waves: [
          { groups: [{ type: 'hanya', count: 4 }, { type: 'shiling', count: 2 }] },
          { groups: [{ type: 'shuanggu', count: 3 }, { type: 'hanya', count: 4 }] },
          { groups: [{ type: 'shiling', count: 4 }, { type: 'shuanggu', count: 2 }] }
        ]
      },
      story: 's_waste'
    },

    /* ---------- 终章 · 霜骨祭坛 ---------- */
    altar: {
      id: 'altar', name: '霜骨祭坛', subtitle: '朱砂泣血，巨灵将醒',
      width: 1600, height: 1200, bgTheme: 'altar',
      palette: { sky: '#d2dbe0', mountain: '#5d7180', fog: 'rgba(220,230,236,.4)', ground: '#aeb9c0' },
      start: { x: 200, y: 640 },
      spawn: { interval: 0, pool: [], max: 0, hpMul: 1, atkMul: 1 },
      npcs: [],
      portals: [
        { x: 110, y: 640, r: 40, target: 'waste', tx: 1370, ty: 600 }
      ],
      special: {
        trigger: { id: 'altar_center', x: 800, y: 600, r: 100 },
        boss: { type: 'shuanggu_boss', x: 800, y: 420 }
      },
      hazards: [],
      story: 's_altar'
    }
  };

  /* ============================================================
   * 任务链：QUEST_ORDER 主线顺序；side:true 为支线
   * step 类型：kill / talk / collect / reach / survive_wave
   * ============================================================ */
  QY.QUEST_ORDER = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

  QY.QUESTS = {
    q1: {
      id: 'q1', name: '剑道初鸣', scene: 'shanmen',
      steps: [
        { type: 'talk', target: 'zhanglao', desc: '与青云长老叙话，初闻剑道' },
        { type: 'kill', target: 'moyao', count: 3, desc: '诛杀作乱的墨妖' },
        { type: 'talk', target: 'zhanglao', desc: '回禀长老，领取青锋与心法' }
      ],
      rewards: { exp: 80, gold: 20, skill: 1, items: { hp_yao: 2 } }
    },
    q2: {
      id: 'q2', name: '青云村之变', scene: 'village',
      steps: [
        { type: 'talk', target: 'cunzhang', desc: '听村长诉说村中异变' },
        { type: 'talk', target: 'villager', count: 3, desc: '向三位村民打听异变' },
        { type: 'kill', target: 'moyao', count: 8, desc: '诛杀袭村的墨妖' },
        { type: 'talk', target: 'cunzhang', desc: '回禀村长，领取剑阵图谱' }
      ],
      rewards: { exp: 240, gold: 60, skill: 2, items: { mp_yao: 2 } }
    },
    q2s: {
      id: 'q2s', name: '采集霜华露', scene: 'village', side: true, giver: 'yaotong',
      steps: [
        { type: 'collect', target: 'shuanghualu', count: 3, desc: '采集霜华露' },
        { type: 'talk', target: 'yaotong', desc: '将霜华露交给药童' }
      ],
      rewards: { exp: 160, gold: 80, items: { hp_yao: 3 } }
    },
    q3: {
      id: 'q3', name: '墨竹溯源', scene: 'mozhu',
      steps: [
        { type: 'kill', target: 'moyao', count: 10, desc: '扫荡竹林墨妖' },
        { type: 'kill', target: 'moyao_king', count: 1, desc: '击败精英·墨妖王' },
        { type: 'talk', target: 'disciple', desc: '救下受伤弟子' }
      ],
      rewards: { exp: 340, gold: 90, items: { mp_yao: 3, hp_yao: 2 } }
    },
    q4: {
      id: 'q4', name: '影雾密谋', scene: 'yingwu',
      steps: [
        { type: 'kill', target: 'yingsha', count: 10, desc: '诛杀巡林影煞' },
        { type: 'reach', target: 'clue', count: 3, desc: '寻得三处阴谋线索' },
        { type: 'kill', target: 'yingsha_leader', count: 1, desc: '击败影煞头领' }
      ],
      rewards: { exp: 440, gold: 120, items: { hp_yao: 3 } }
    },
    q5: {
      id: 'q5', name: '荒原守御', scene: 'waste',
      steps: [
        { type: 'survive_wave', count: 3, desc: '抵御妖物三波攻势' },
        { type: 'talk', target: 'xianfeng', desc: '与先锋将叙话领赏' }
      ],
      rewards: { exp: 560, gold: 150, skill: 3, items: { mp_yao: 4 } }
    },
    q6: {
      id: 'q6', name: '终战巨灵', scene: 'altar',
      steps: [
        { type: 'reach', target: 'altar_center', count: 1, desc: '登上霜骨祭坛' },
        { type: 'kill', target: 'shuanggu_boss', count: 1, desc: '诛灭霜骨巨灵' }
      ],
      rewards: { exp: 999, gold: 500, items: {} }
    }
  };

  /* ============================================================
   * 对话树：按 NPC id 索引，blocks 自上而下单向匹配
   * 条件：step [任务id,步骤] / side [支线id,步骤] / sideNone / sideDone
   *       flag / flagNot / questDone
   * block.action：'accept:q2s' 对话结束时接受支线
   * ============================================================ */
  QY.DIALOGUES = {
    zhanglao: [
      { if: { step: ['q1', 0] }, lines: [
        '少年人，你终于上山了。近几日山间墨气躁动，墨妖已生。',
        '且记：WASD 御气行走，鼠标左键放出剑气伤敌。',
        '去，诛杀三只墨妖，再来寻我。' ] },
      { if: { step: ['q1', 2] }, lines: [
        '好，剑气已有章法。老夫赐你青锋剑一柄，并授心法「霜刃斩」。',
        '按 1 施展，凝霜于刃，一击破敌。山门之外，珍重。' ] },
      { if: { questDone: 'q1' }, lines: [
        '墨气之源尚未断绝，一路向东，好自为之。' ] }
    ],
    cunzhang: [
      { if: { step: ['q2', 0] }, lines: [
        '剑仙救命！近日墨气冲天，村民个个惶恐不安。',
        '求您先与三位乡亲叙话，问清这异变的由来。' ] },
      { if: { step: ['q2', 3] }, lines: [
        '妖患已除，大恩不言谢！此卷「寒霜剑阵」图谱赠予剑仙。',
        '按 2 布阵，可令群妖冰冻、连绵受创。' ] },
      { if: { questDone: 'q2' }, lines: [
        '村东墨竹林墨气更浓，剑仙多加小心。' ] }
    ],
    villager1: [
      { if: { step: ['q2', 1], flagNot: 'talked_villager1' }, lines: [
        '三日前夜里，我瞧见墨竹林里有黑影议事，那轮廓……竟像是人影！' ] },
      { if: { flag: 'talked_villager1' }, lines: [
        '那些黑影，往墨竹林深处去了……' ] }
    ],
    villager2: [
      { if: { step: ['q2', 1], flagNot: 'talked_villager2' }, lines: [
        '井水忽然泛出墨色，鸡鸭也疯癫了，定是妖物作祟！' ] },
      { if: { flag: 'talked_villager2' }, lines: [
        '井水至今还是黑的，唉，这日子可怎么过。' ] }
    ],
    villager3: [
      { if: { step: ['q2', 1], flagNot: 'talked_villager3' }, lines: [
        '我家孙娃说大雾里有眼睛，我起初不信，如今四邻都遭了殃。' ] },
      { if: { flag: 'talked_villager3' }, lines: [
        '雾里的眼睛……愿青云祖师保佑我们。' ] }
    ],
    yaotong: [
      { if: { sideNone: 'q2s' }, action: 'accept:q2s', lines: [
        '剑仙留步！家师急需「霜华露」入药。',
        '村中的墨妖身上偶有凝露，若能取来三滴，定有重谢！' ] },
      { if: { side: ['q2s', 0] }, lines: [
        '霜华露可曾取齐？尚需三滴方可入药。' ] },
      { if: { side: ['q2s', 1] }, lines: [
        '多谢剑仙搭救，此恩没齿难忘！' ] },
      { if: { sideDone: 'q2s' }, lines: [
        '家师服药后已无大碍，全赖剑仙所赐。' ] }
    ],
    disciple: [
      { if: { flagNot: 'moyao_king_dead' }, lines: [
        '呃……莫管我……墨妖王……它就在林中……' ] },
      { if: { flag: 'moyao_king_dead', step: ['q3', 2] }, lines: [
        '多谢师兄相救！我被擒时听见——影煞在影雾林密谋，',
        '它们要唤醒沉睡荒原的霜骨巨灵！师兄万不可迟！' ] },
      { if: { questDone: 'q3' }, lines: [
        '影煞……巨灵……师兄，拜托了！' ] }
    ],
    xianfeng: [
      { if: { flagNot: 'waves_cleared' }, lines: [
        '荒原妖气冲天，三波恶潮转瞬即至！随我守住此地！' ] },
      { if: { flag: 'waves_cleared', step: ['q5', 1] }, lines: [
        '好本事！这卷「万剑归宗」剑诀乃门中至宝，今日传你。',
        '按 3 可召满天剑雨，群邪辟易！祭坛在东边，拜托了！' ] },
      { if: { questDone: 'q5' }, lines: [
        '霜骨巨灵……老夫带伤之身，只能在此为你压阵。' ] }
    ]
  };

  /* ============================================================
   * STORY：进入场景的过场字幕 / 关键剧情 / 结局段落
   * ============================================================ */
  QY.STORY = {
    s_intro: { lines: [
      '云雾深锁，青云山亘古不语。',
      '一缕墨气自山泽裂隙渗出，所过之处，草木皆妖。',
      '山门钟声三响——新弟子，提剑上山。' ] },
    s_village: { lines: [
      '青云山下，村落炊烟零落。',
      '墨气所染，井水生墨，六畜不安，村民惶惶不可终日。' ] },
    s_bamboo: { lines: [
      '墨竹万竿，风过如诉。',
      '竹影深处，墨妖成群结队，似受某种东西驱使。' ] },
    s_mist: { lines: [
      '影雾林终年大雾，三步之外不见人影。',
      '荆棘遍地，暗影绰绰，有暗哨穿行其间。' ] },
    s_waste: { lines: [
      '霜骨荒原白雪皑皑，呵气成冰。',
      '寒鸦盘空，骨傀游弋，先锋营已苦守数日。' ] },
    s_altar: { lines: [
      '荒原尽头，巨大祭坛拔地而起。',
      '朱砂阵纹幽光闪烁，骨柱参天，霜骨巨灵沉睡于此。' ] },
    boss_awaken: { lines: [
      '阵纹骤亮，骨柱嗡鸣。',
      '霜骨巨灵缓缓睁眼——天地间，风雪骤停。' ] },
    leader_last: { lines: [
      '影煞头领崩散成一蓬黑雾。',
      '「巨灵……已醒……你救不了……七界……」' ] },
    ending: { paragraphs: [
      '霜骨巨灵轰然倒地，化作漫天墨雪，纷纷扬扬洒落在祭坛之上。',
      '朱砂阵纹一寸寸熄灭，骨柱崩解，漫漫长夜终于透出天光。',
      '影雾散了，墨竹青了，青云村的井水重又甘洌，山门上的钟声悠悠扬扬，传过七界。',
      '青云七界，重归安宁。',
      '而那提剑上山的少年，只是轻轻还剑入鞘，转身走入了红尘万丈。',
      '——剑在人在，青云之志，永世不坠。' ] }
  };
})();
