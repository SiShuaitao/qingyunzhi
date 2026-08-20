// 封面渲染：http(s) 图片地址 → url() 居中覆盖；已是 CSS gradient 则直接返回；否则包成 linear-gradient
export function coverGradient(cover: string): string {
  if (!cover) return 'linear-gradient(135deg,#1a1a1a,#2c2c2c)'
  if (/^https?:\/\//i.test(cover)) return `url("${cover}") center/cover no-repeat`
  if (/gradient/i.test(cover)) return cover
  return `linear-gradient(135deg,#1a1a1a,${cover})`
}

// 资讯分类标签文案
export function newsCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    activity: '活动',
    notice: '公告',
    news: '资讯'
  }
  return map[category] || '资讯'
}

// 资讯分类颜色（水墨国风：朱砂 / 墨灰 / 青瓷）
export function newsCategoryColor(category: string): string {
  const map: Record<string, string> = {
    activity: '#b83b3b',
    notice: '#4a6b7d',
    news: '#6b8e7f'
  }
  return map[category] || '#6b8e7f'
}

// 角色定位颜色（水墨国风：朱砂 / 墨灰 / 青瓷 / 月白）
export function roleColor(role: string): string {
  const map: Record<string, string> = {
    剑客: '#b83b3b',
    法师: '#4a6b7d',
    刺客: '#2c2c2c',
    辅助: '#6b8e7f',
    射手: '#8a9a8e',
    坦克: '#5a4a3a'
  }
  return map[role] || '#2c2c2c'
}

// 角色难度颜色（水墨国风：青瓷 / 黛墨 / 朱砂）
export function difficultyColor(difficulty: string): string {
  const map: Record<string, string> = {
    低: '#6b8e7f',
    中: '#4a6b7d',
    高: '#b83b3b'
  }
  return map[difficulty] || '#4a6b7d'
}

// 时间格式化：'2026-08-05' 或 '2026年08月05日'
export function formatDate(input?: string, style: 'cn' | 'iso' = 'cn'): string {
  if (!input) return ''
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return style === 'cn' ? `${yyyy}年${mm}月${dd}日` : `${yyyy}-${mm}-${dd}`
}

// 时间格式化（带月日）
export function formatMonthDay(input?: string): { month: string; day: string; year: string } {
  if (!input) return { month: '--', day: '--', year: '----' }
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return { month: '--', day: '--', year: '----' }
  return {
    year: String(d.getFullYear()),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    day: String(d.getDate()).padStart(2, '0')
  }
}
