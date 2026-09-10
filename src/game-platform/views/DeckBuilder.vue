<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import CardTile from '../components/CardTile.vue'
import { useCardStore } from '../stores/cards'
import { useDeckStore } from '../stores/decks'
import type { ArchetypeKey } from '../types'
import type { CatalogCard } from '../catalog-types'
const cards = useCardStore(), deck = useDeckStore(), importDialog = ref(false), importValue = ref(''), detail = ref<CatalogCard | null>(null)
const currentPage = ref(1)
const pageSize = 24
const archetypes: Array<{ label: string; value: ArchetypeKey }> = [{label:'全部卡牌',value:'all'},{label:'露西亚·誓焰',value:'pledge'},{label:'深红囚影',value:'alpha'},{label:'赛琳娜',value:'selena'},{label:'拉米亚',value:'lamia'}]
watch(() => deck.archetype, (value) => { cards.archetype = value }, { immediate: true })
watch([() => cards.archetype, () => cards.query], () => { currentPage.value = 1 })
const validation = computed(() => deck.total === 50 ? '牌组数量正确' : `还需要 ${50 - deck.total} 张（当前 ${deck.total}/50）`)
const pagedCards = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return cards.filteredCards.slice(start, start + pageSize)
})
function copyExport() { navigator.clipboard.writeText(deck.exportText()); ElMessage.success('牌表已复制') }
function applyImport() { deck.importText(importValue.value, cards.cards); importDialog.value = false; ElMessage.success('牌表已导入') }
function selectDetailVariant(variantId: string) { if (detail.value) cards.selectImageVariant(detail.value.card_no, variantId) }
function fallbackDetailImage(event: Event) { if (!detail.value) return; const image = event.currentTarget as HTMLImageElement; const fallback = `/card-images/${detail.value.card_no}.png`; if (!image.src.endsWith(fallback)) image.src = fallback }
async function saveCurrentDeck() { await deck.saveDeck(); ElMessage.success('牌组已保存到服务器') }
async function removeSavedDeck(id: string) { await deck.removeSaved(id); ElMessage.success('牌组已删除') }
</script>
<template>
  <div class="builder-layout">
    <section class="catalog panel"><div class="toolbar"><el-select v-model="deck.archetype" style="width:180px"><el-option v-for="item in archetypes" :key="item.value" :label="item.label" :value="item.value" /></el-select><el-input v-model="cards.query" clearable placeholder="搜索卡号、卡名、特征或效果" /><el-tag>{{ cards.filteredCards.length }} 张候选</el-tag></div>
      <div class="card-grid"><CardTile v-for="card in pagedCards" :key="card.card_no" :card="card" :count="deck.countOf(card.card_no)" @add="deck.add(card.card_no)" @remove="deck.remove(card.card_no)" @inspect="detail = card" /></div>
      <div class="catalog-pagination"><el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="cards.filteredCards.length" layout="total, prev, pager, next, jumper" background /></div>
    </section>
    <aside class="deck-panel panel"><el-input v-model="deck.name" placeholder="牌组名称" /><div class="deck-status" :class="{valid:deck.total===50}">{{ validation }}</div><div class="deck-list"><div v-for="entry in deck.entries" :key="entry.cardNo" class="deck-row"><span>{{ entry.cardNo }}</span><b>× {{ entry.count }}</b><el-button link type="danger" @click="deck.remove(entry.cardNo)">移除</el-button></div></div>
      <el-button type="primary" :disabled="deck.total!==50" @click="saveCurrentDeck">{{ deck.editingDeckId ? '更新牌组' : '保存牌组' }}</el-button><el-button @click="copyExport">复制导出文本</el-button><el-button @click="importDialog=true">导入牌表</el-button><el-divider>已保存</el-divider>
      <div v-for="item in deck.saved" :key="item.id" class="saved-deck"><span>{{ item.name }}（{{ item.entries.reduce((n,e)=>n+e.count,0) }}）</span><div><el-button link @click="deck.loadDeck(item)">载入</el-button><el-button link type="danger" @click="removeSavedDeck(item.id)">删除</el-button></div></div></aside>
  </div>
  <el-dialog v-model="importDialog" title="导入牌表" width="520px"><el-input v-model="importValue" type="textarea" :rows="14" placeholder="BP03-001 x4" /><template #footer><el-button @click="importDialog=false">取消</el-button><el-button type="primary" @click="applyImport">导入</el-button></template></el-dialog>
  <el-dialog v-model="detail" :title="detail?.name" width="760px"><div v-if="detail" class="card-detail"><img :src="detail.image_url" :alt="detail.name" @error="fallbackDetailImage" /><div><p>{{ detail.card_no }} · {{ detail.card_types }} · {{ detail.attribute }}</p><el-select v-if="detail.image_variants.length > 1" :model-value="detail.selected_variant_id" style="width:220px" @change="selectDetailVariant"><el-option v-for="variant in detail.image_variants" :key="variant.id" :value="variant.id" :label="`${variant.rarity}${variant.package_name ? ` · ${variant.package_name}` : ''}`" /></el-select><p>{{ detail.features }}</p><pre>{{ detail.effect || '此牌没有能力。' }}</pre></div></div></el-dialog>
</template>
