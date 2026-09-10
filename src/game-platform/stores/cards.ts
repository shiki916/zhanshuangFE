import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { belongsToArchetype, loadCards } from '../services/cards'
import type { ArchetypeKey, CardRecord } from '../types'
import type { CatalogCard } from '../catalog-types'

const IMAGE_VARIANT_KEY = 'zhanshuang-tcg-card-image-variants-v1'

export const useCardStore = defineStore('cards', () => {
  const cards = ref<CatalogCard[]>([]), loading = ref(false), error = ref(''), query = ref('')
  const imagePreferences = ref<Record<string, string>>(JSON.parse(localStorage.getItem(IMAGE_VARIANT_KEY) || '{}'))
  const archetype = ref<ArchetypeKey>('all')
  const filteredCards = computed(() => cards.value.filter((card) => {
    const keyword = query.value.trim().toLowerCase()
    return belongsToArchetype(card, archetype.value) && (!keyword || `${card.card_no} ${card.name} ${card.features} ${card.effect}`.toLowerCase().includes(keyword))
  }))
  async function initialise() { loading.value = true; error.value = ''; try { cards.value = await loadCards(); for (const card of cards.value) selectImageVariant(card.card_no, imagePreferences.value[card.card_no] || card.selected_variant_id, false) } catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason) } finally { loading.value = false } }
  function selectImageVariant(cardNo: string, variantId: string, persist = true) {
    const card = cards.value.find((item) => item.card_no === cardNo)
    const variant = card?.image_variants.find((item) => item.id === variantId)
    if (!card || !variant) return
    card.selected_variant_id = variant.id
    card.image_url = variant.local_image_url || variant.image_url || `/card-images/${card.card_no}.png`
    if (persist) { imagePreferences.value[cardNo] = variant.id; localStorage.setItem(IMAGE_VARIANT_KEY, JSON.stringify(imagePreferences.value)) }
  }
  function updateNumbers(cardNo: string, values: Pick<CardRecord, 'cost' | 'pp_value' | 'dp_value'>) { const card = cards.value.find((item) => item.card_no === cardNo); if (card) Object.assign(card, values) }
  return { cards, loading, error, query, archetype, filteredCards, initialise, updateNumbers, selectImageVariant }
})
