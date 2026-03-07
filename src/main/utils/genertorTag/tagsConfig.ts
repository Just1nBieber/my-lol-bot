// utils/tagsConfig.ts
import { TagRule } from './type';

export const TagRules: TagRule[] = [
  // ================= 第一梯队：绝对高光 (Priority 100) =================
  {
    id: 'penta',
    getText: (p) => p.stats.pentaKills > 1 ? `五杀 x${p.stats.pentaKills}` : '五杀',
    style: 'bg-yellow-100 text-yellow-600 border-yellow-300 font-bold',
    priority: 100,
    check: (p) => p.stats.pentaKills > 0
  },

  // ================= 第二梯队：视野控制 (Priority 90) =================
  {
    id: 'vision_king',
    getText: () => '视野点亮者',
    style: 'bg-purple-100 text-purple-600 border-purple-200',
    priority: 90,
    // 判定：视野得分全队最高，且视野分不低于 30
    check: (p, teamMax) => p.stats.visionScore === teamMax.vision && p.stats.visionScore >= 30
  },

  // ================= 第三梯队：参团机器 (Priority 80) =================
  {
    id: 'kp_king',
    getText: () => '完美参团',
    style: 'bg-blue-100 text-blue-600 border-blue-200',
    priority: 80,
    // 判定：参团率 >= 65%
    check: (p, teamMax) => {
      if (teamMax.totalKills === 0) return false;
      const kp = (p.stats.kills + p.stats.assists) / teamMax.totalKills;
      return kp >= 0.65;
    }
  },

  // ================= 第四梯队：各职能并列表现 (Priority 70) =================
  {
    id: 'damage_king',
    getText: () => '输出机器',
    style: 'bg-red-100 text-red-600 border-red-200',
    priority: 70,
    check: (p, teamMax) => p.stats.totalDamageDealtToChampions === teamMax.damage && p.stats.totalDamageDealtToChampions > 10000
  },
  {
    id: 'tank_king',
    getText: () => '承伤巨兽',
    style: 'bg-stone-200 text-stone-700 border-stone-300',
    priority: 70,
    check: (p, teamMax) => p.stats.damageSelfMitigated === teamMax.mitigated && p.stats.damageSelfMitigated > 30000
  },
  {
    id: 'cc_king',
    getText: () => '控制大师',
    style: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    priority: 70,
    check: (p, teamMax) => p.stats.totalTimeCrowdControlDealt === teamMax.cc && p.stats.totalTimeCrowdControlDealt >= 30
  },
  {
    id: 'assist_king',
    getText: () => '金牌绿叶',
    style: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    priority: 70,
    check: (p, teamMax) => p.stats.assists >= 20 && p.stats.assists === teamMax.assists
  },
  {
    id: 'tower_destroyer',
    getText: () => '无情拆迁',
    style: 'bg-orange-100 text-orange-600 border-orange-200',
    priority: 70,
    check: (p) => p.stats.turretKills >= 3 || p.stats.damageDealtToTurrets > 6000
  },
  {
    id: 'healer',
    getText: () => '移动血泉',
    style: 'bg-teal-100 text-teal-600 border-teal-200',
    priority: 70,
    check: (p) => p.stats.totalHeal > 15000
  },
  {
    id: 'rich_guy',
    getText: () => '富可敌国', 
    style: 'bg-amber-100 text-amber-600 border-amber-200',
    priority: 70,
    check: (p, teamMax, match) => {
      const minutes = match.gameDuration / 60;
      return p.stats.goldEarned === teamMax.gold && (p.stats.goldEarned / minutes) >= 420;
    }
  },
  {
    id: 'cs_machine',
    getText: () => '补刀机器',
    style: 'bg-cyan-100 text-cyan-600 border-cyan-200',
    priority: 70,
    check: (p, _teamMax, match) => {
      if (match.gameMode !== 'CLASSIC') return false; // 只有经典模式发补刀标签
      const minutes = match.gameDuration / 60;
      const totalCs = p.stats.totalMinionsKilled + p.stats.neutralMinionsKilled;
      return (totalCs / minutes) >= 8.0; 
    }
  },

  // ================= 第五梯队：普通多杀 (Priority 60) =================
  {
    id: 'quadra',
    getText: (p) => p.stats.quadraKills > 1 ? `四杀 x${p.stats.quadraKills}` : '四杀',
    style: 'bg-gray-100 text-gray-700 border-gray-300',
    priority: 60,
    // 严格互斥：有五杀就不显示四杀
    check: (p) => p.stats.quadraKills > 0 && p.stats.pentaKills === 0
  },
  {
    id: 'triple',
    getText: (p) => p.stats.tripleKills > 1 ? `三杀 x${p.stats.tripleKills}` : '三杀',
    style: 'bg-gray-100 text-gray-700 border-gray-300',
    priority: 60,
    // 严格互斥：有五杀或四杀就不显示三杀
    check: (p) => p.stats.tripleKills > 0 && p.stats.quadraKills === 0 && p.stats.pentaKills === 0
  }
];
