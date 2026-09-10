import type { CardRecord } from './types'

export interface CardImageVariant {
  id: string
  rarity: string
  package_name: string
  image_url: string
  local_image_url: string
  is_primary: boolean
}

export interface CatalogCard extends CardRecord {
  image_variants: CardImageVariant[]
  selected_variant_id: string
}
