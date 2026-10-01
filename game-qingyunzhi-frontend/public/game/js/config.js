/* ============================================================
 * config.js —— 全局配置常量
 * 数值平衡、敌人 / 物品 / 技能定义、主题色
 * 通过 window.QY.CONFIG 暴露给其他脚本
 * ============================================================ */
(function () {
  'use strict';
  var QY = window.QY = window.QY || {};

  QY.CONFIG = {
    /* ---------- 存档与过渡 ---------- */
    STORAGE_KEY: 'qingyun_save',
    TRANSITION_MS: 800,     // 场景切换墨晕动画时长

    /* ---------- 水墨国风色板 ---------- */
    COLOR: {
      ink: '#1a1a1a',       // 墨黑
      inkSoft: '#2c2c2c',   // 淡墨
      cinnabar: '#b83b3b',  // 朱砂红
      celadon: '#6b8e7f',   // 青瓷绿
      daiqing: '#4a6b7d',   // 黛墨青
      moonwhite: '#f5f0e6', // 月白
      gold: '#f5d76e'       // 金（升级 / 提示）
    },
    FONT: '"KaiTi","STKaiti","楷体","SimSun","宋体",serif',

    /* ---------- 玩家初始属性与成长 ---------- */
    PLAYER: {
      radius: 16,
      speed: 178,           // 基础移速（像素 / 秒）
      baseHP: 220,
      baseMP: 110,
      baseAtk: 20,
      baseDef: 6,
      hpGrow: 46,           // 每级气血增量
      mpGrow: 16,           // 每级灵力增量
      atkGrow: 5,           // 每级攻击增量
      defGrow: 2,           // 每级防御增量
      mpRegen: 9,           // 灵力每秒恢复
      hpRegen: 2,           // 气血每秒恢复
      expBase: 120,         // 1 级升 2 级所需修为
      expGrow: 1.32,        // 修为需求递增系数
      pickRadius: 34,       // 自动拾取半径
      hurtInvuln: 500,      // 受击无敌帧（毫秒）
      touchCD: 800          // 与敌人接触受伤间隔
    },

    /* ---------- 性能上限 ---------- */
    MAX_PARTICLES: 320,     // 同屏粒子总数上限（超出丢弃最老）
    MAX_FLOATERS: 40,       // 同屏飘字上限

    /* ---------- 普攻：鼠标朝向左键剑气 ---------- */
    BASIC_ATTACK: {
      cd: 340,              // 冷却毫秒
      damage: 1.0,          // 相对攻击力倍率
      speed: 520,           // 剑气飞行速度
      range: 230,           // 剑气存在距离
      radius: 13
    },

    /* ---------- 技能定义 ----------
     * 1 霜刃斩：扇形单体，前方扇形剑气
     * 2 寒霜剑阵：指定区域剑阵，冰冻 + 持续伤害
     * 3 万剑归宗：全屏剑雨
     */
    SKILLS: {
      1: { name: '霜刃斩', cost: 8, cd: 1500, damage: 1.6, fix: 14,
           type: 'fan', range: 250, arc: 0.95, unlockQuest: 'q1' },
      2: { name: '寒霜剑阵', cost: 25, cd: 6500, damage: 0.55, fix: 6,
           type: 'frost', radius: 115, duration: 3200, tick: 500,
           slow: 0.45, unlockQuest: 'q2' },
      3: { name: '万剑归宗', cost: 50, cd: 14000, damage: 2.6, fix: 30,
           type: 'rain', swords: 26, unlockQuest: 'q5' }
    },

    /* ---------- 敌人定义（基础值，场景再乘 hpMul/atkMul） ---------- */
    ENEMIES: {
      /* 墨妖：圆身触角，最基础的小怪 */
      moyao: { name: '墨妖', hp: 42, atk: 8, speed: 102, radius: 14,
               exp: 26, gold: 4, color: '#3a3a3a', ai: 'chase' },
      /* 墨妖王：精英，体型大，近身震荡波 */
      moyao_king: { name: '墨妖王', hp: 360, atk: 18, speed: 84, radius: 26,
               exp: 200, gold: 40, color: '#2e2a33', ai: 'elite',
               shockCD: 3600, shockR: 150, shockDmg: 0.8, elite: true },
      /* 影煞：菱形暗影，中高速 */
      yingsha: { name: '影煞', hp: 62, atk: 12, speed: 156, radius: 13,
               exp: 46, gold: 7, color: '#4a6b7d', ai: 'chase' },
      /* 影煞头领：小 BOSS，高速 + 周期冲刺 */
      yingsha_leader: { name: '影煞头领', hp: 480, atk: 20, speed: 170, radius: 24,
               exp: 260, gold: 55, color: '#33505f', ai: 'charger',
               chargeCD: 4200, chargeSpeed: 460, elite: true },
      /* 霜骨：缓慢骨傀，高血 */
      shuanggu: { name: '霜骨', hp: 170, atk: 22, speed: 62, radius: 20,
               exp: 120, gold: 20, color: '#6b8e7f', ai: 'chase' },
      /* 寒鸦：低血高速，远程冰锥 */
      hanya: { name: '寒鸦', hp: 32, atk: 10, speed: 205, radius: 11,
               exp: 36, gold: 5, color: '#8a99a6', ai: 'ranged',
               shootCD: 2200, boltSpeed: 230 },
      /* 噬灵：中速，死亡分裂 */
      shiling: { name: '噬灵', hp: 95, atk: 14, speed: 118, radius: 16,
               exp: 62, gold: 9, color: '#8a5a7d', ai: 'chase', split: 2 },
      /* 霜骨巨灵：终章 BOSS，两阶段 */
      shuanggu_boss: { name: '霜骨巨灵', hp: 1200, atk: 30, speed: 58, radius: 40,
               exp: 600, gold: 300, color: '#7fa3b8', ai: 'boss',
               shockCD: 4200, shockR: 230, shockDmg: 0.9,
               summonCD: 7000, shootCD: 1600, boltSpeed: 250,
               chargeCD: 5200, chargeSpeed: 400, boss: true }
    },

    /* ---------- 掉落物 / 物品 ---------- */
    ITEMS: {
      hp_yao: { name: '回春丹', desc: '恢复 120 点气血', color: '#b83b3b',
                heal: 120, kind: 'consume' },
      mp_yao: { name: '凝神露', desc: '恢复 70 点灵力', color: '#4a6b7d',
                mana: 70, kind: 'consume' },
      shuanghualu: { name: '霜华露', desc: '村民所求之物', color: '#9fc7d6',
                kind: 'quest' }
    },
    /* 普通敌人死亡掉落概率（千分比） */
    DROP_RATE: { gold: [3, 14], hp_yao: 120, mp_yao: 100 }
  };
})();
