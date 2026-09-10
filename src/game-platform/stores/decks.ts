import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ArchetypeKey, CardRecord, DeckEntry, SavedDeck } from '../types'
import { addDeck, delDeck, getDeck, listDeck, updateDeck } from '@/api/game/deck'
import { useCardStore } from './cards'

interface DeckCardDto { cardId: number; cardCount: number }
interface DeckDto { deckId: number; deckName: string; updateTime?: string; gameDeckCardList?: DeckCardDto[] }

export const useDeckStore = defineStore('decks', () => {
  const saved = ref<SavedDeck[]>([])
  const name = ref('新牌组'), archetype = ref<ArchetypeKey>('pledge'), entries = ref<DeckEntry[]>([])
  const editingDeckId = ref<string | null>(null)
  const total = computed(() => entries.value.reduce((sum, item) => sum + item.count, 0))
  const countOf = (cardNo: string) => entries.value.find((item) => item.cardNo === cardNo)?.count || 0
  function add(cardNo: string) { const item = entries.value.find((e) => e.cardNo === cardNo); if (item) { if (item.count < 4) item.count++ } else entries.value.push({ cardNo, count: 1 }) }
  function remove(cardNo: string) { const item = entries.value.find((e) => e.cardNo === cardNo); if (!item) return; if (--item.count <= 0) entries.value = entries.value.filter((e) => e.cardNo !== cardNo) }
  async function fetchSaved() {
    const response = await listDeck({ pageNum: 1, pageSize: 100 }) as { rows: DeckDto[] }
    const details = await Promise.all((response.rows || []).map((item) => getDeck(item.deckId))) as Array<{ data: DeckDto }>
    const lookup = new Map(useCardStore().cards.map((card) => [Number(card.id), card.card_no]))
    saved.value = details.map(({ data }) => ({
      id: String(data.deckId), name: data.deckName, archetype: 'all',
      entries: (data.gameDeckCardList || []).map((item) => ({ cardNo: lookup.get(item.cardId) || '', count: item.cardCount })).filter((item) => item.cardNo),
      updatedAt: data.updateTime || '',
    }))
  }
  async function saveDeck() {
    const lookup = new Map(useCardStore().cards.map((card) => [card.card_no, Number(card.id)]))
    const payload = {
      deckId: editingDeckId.value ? Number(editingDeckId.value) : undefined,
      deckName: name.value.trim() || '未命名牌组',
      gameDeckCardList: entries.value.map((entry) => ({ cardId: lookup.get(entry.cardNo), cardCount: entry.count })),
    }
    if (payload.deckId) await updateDeck(payload)
    else await addDeck(payload)
    await fetchSaved()
    editingDeckId.value = null
  }
  function loadDeck(value: SavedDeck) { editingDeckId.value = value.id; name.value = value.name; archetype.value = value.archetype; entries.value = value.entries.map((e) => ({...e})) }
  async function removeSaved(id: string) { await delDeck(id); if (editingDeckId.value === id) editingDeckId.value = null; await fetchSaved() }
  const exportText = () => entries.value.map((item) => `${item.cardNo} x${item.count}`).join('\n')
  function importText(text: string, cards: CardRecord[]) { const known = new Set(cards.map((c) => c.card_no)), next: DeckEntry[] = []; for (const line of text.split(/\r?\n/)) { const match = line.trim().match(/^([A-Z0-9-]+)\s*(?:x|×|\*)\s*(\d+)$/i); if (!match) continue; const cardNo = match[1]!.toUpperCase(); if (known.has(cardNo)) next.push({ cardNo, count: Math.min(4, Math.max(1, Number(match[2]))) }) } entries.value = next }
  return { saved, name, archetype, entries, total, editingDeckId, countOf, add, remove, fetchSaved, saveDeck, loadDeck, removeSaved, exportText, importText }
})
