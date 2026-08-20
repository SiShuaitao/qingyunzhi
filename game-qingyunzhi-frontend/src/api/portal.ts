import { get } from './http'
import type { GameMeta, NewsItem, Banner, Character, Sect, Feature } from '@/types'

// 获取青云志元数据（单游戏官网）
export function fetchGameInfo(): Promise<GameMeta | null> {
  return get<GameMeta | null>('/api/game', null)
}

// 获取最新资讯
export function fetchLatestNews(limit = 6): Promise<NewsItem[]> {
  return get<NewsItem[]>(`/api/news?limit=${limit}`, [])
}

// 资讯详情
export function fetchNewsById(id: number | string): Promise<NewsItem | null> {
  return get<NewsItem | null>(`/api/news/${id}`, null)
}

// 获取首页 Banner
export function fetchBanners(): Promise<Banner[]> {
  return get<Banner[]>('/api/banners', [])
}

// 获取所有角色
export function fetchCharacters(): Promise<Character[]> {
  return get<Character[]>('/api/characters', [])
}

// 获取所有门派
export function fetchSects(): Promise<Sect[]> {
  return get<Sect[]>('/api/sects', [])
}

// 获取玩法 / 特色
export function fetchFeatures(): Promise<Feature[]> {
  return get<Feature[]>('/api/features', [])
}
