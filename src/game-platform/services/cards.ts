import Papa from 'papaparse'
import request from '@/utils/request'
import type { ArchetypeKey } from '../types'
import type { CardImageVariant, CatalogCard } from '../catalog-types'

interface PublicCardDto {
  id: number
  cardNo: string
  name: string
  packageName: string
  rarity: string
  cost: number | null
  cardAttribute: string
  ppValue: number | null
  dpValue: number | null
  signalColor: string
  cardTypes: string
  features: string
  effect: string
  imageUrl: string
}

const TERMS: Record<Exclude<ArchetypeKey, 'all'>, string[]> = {
  pledge: ['露西亚·誓焰', '浮空'],
  alpha: ['露西亚·深红囚影', '阿尔法', '封刃太刀', '大太刀'],
  selena: ['赛琳娜', '艺术协会'],
  lamia: ['拉弥亚', '拉米亚'],
}
async function readCsv(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`读取数据失败：${url}（${response.status}）`)
  const result = Papa.parse<Record<string, string>>(await response.text(), { header: true, skipEmptyLines: true })
  if (result.errors.length) throw new Error(result.errors[0]?.message || `${url} 解析失败`)
  return result.data
}

async function readPublicCards() {
  const result = await request({
    url: '/game/card/public/list',
    method: 'get',
    headers: { isToken: false },
  }) as { data: PublicCardDto[] }
  if (!Array.isArray(result.data)) throw new Error('后端卡池响应格式错误')
  return result.data
}

export async function loadCards(): Promise<CatalogCard[]> {
  const [cardRows, variantRows] = await Promise.all([readPublicCards(), readCsv('/data/card-variants.csv')])
  const variants = new Map<string, CardImageVariant[]>()
  for (const row of variantRows) {
    if (!row.card_no) continue
    const item: CardImageVariant = {
      id: row.variant_id || row.id || `${row.card_no}-${row.rarity}`,
      rarity: row.rarity || '',
      package_name: row.package_name || '',
      image_url: row.image_url || '',
      local_image_url: row.local_image_url || '',
      is_primary: row.is_primary === 'true',
    }
    variants.set(row.card_no, [...(variants.get(row.card_no) || []), item])
  }
  const unique = new Map<string, CatalogCard>()
  for (const row of cardRows) {
    if (!row.cardNo || unique.has(row.cardNo)) continue
    const imageVariants = variants.get(row.cardNo) || []
    const primary = imageVariants.find((item) => item.is_primary) || imageVariants[0]
    unique.set(row.cardNo, { id: String(row.id), card_no: row.cardNo, name: row.name || '', package_name: row.packageName || '', rarity: row.rarity || '', cost: row.cost, attribute: row.cardAttribute || '', pp_value: row.ppValue, dp_value: row.dpValue, signal_color: row.signalColor || '', card_types: row.cardTypes || '', features: row.features || '', effect: row.effect || '', image_url: primary?.local_image_url || row.imageUrl || `/card-images/${row.cardNo}.png`, image_variants: imageVariants, selected_variant_id: primary?.id || '' })
  }
  return [...unique.values()].sort((a, b) => a.card_no.localeCompare(b.card_no))
}
export function belongsToArchetype(card: CatalogCard, archetype: ArchetypeKey) {
  if (archetype === 'all') return true
  const text = `${card.name}\n${card.features}\n${card.effect}`
  return TERMS[archetype].some((term) => text.includes(term))
}
