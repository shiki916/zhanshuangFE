<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useCardStore } from '../stores/cards'
import { useDeckStore } from '../stores/decks'
import { useGameStore } from '../stores/game'
import type { CardRecord, GameCard, PlayerState } from '../types'

const cards = useCardStore(), decks = useDeckStore(), game = useGameStore()
const setup = ref(true), logVisible = ref(false), mode = ref<'standard' | 'ordered'>('standard'), deck1Id = ref(''), deck2Id = ref(''), background = ref('')
const selected = ref<GameCard | null>(null), selectedCosts = ref<string[]>([]), targetSlot = ref<number | null>(null)
const selectedField = ref<{ playerId: 'player1' | 'player2'; slot: number } | null>(null)
const mulliganSelected = ref<string[]>([])
const effectChoiceIds = ref<string[]>([])
const deck1 = computed(() => decks.saved.find(i => i.id === deck1Id.value)), deck2 = computed(() => decks.saved.find(i => i.id === deck2Id.value))
const selectedReasons = computed(() => selected.value ? game.legality(selected.value) : [])
const requiredCost = computed(() => selected.value ? game.cardCost(selected.value) : 0)
const nextLabel = computed(() => game.phase === '竖直阶段' ? '执行竖直' : game.phase === '抽牌填充阶段' ? '进入主要阶段' : game.phase === '主要阶段' ? '进入结束阶段' : '结束回合')
watch(() => game.pendingChoice?.id, () => { effectChoiceIds.value = [] })
function expanded(id: string): CardRecord[] { const value = decks.saved.find(i => i.id === id); if (!value) return []; const lookup = new Map(cards.cards.map(c => [c.card_no, c])); return value.entries.flatMap(e => Array.from({ length: e.count }, () => lookup.get(e.cardNo))).filter(Boolean) as CardRecord[] }
function start() { if (!deck1.value || !deck2.value) return ElMessage.warning('请选择双方牌组'); if (expanded(deck1Id.value).length !== 50 || expanded(deck2Id.value).length !== 50) return ElMessage.warning('双方牌组都必须正好50张'); game.start(expanded(deck1Id.value), expanded(deck2Id.value), mode.value); selected.value = null; mulliganSelected.value = []; setup.value = false }
function chooseBackground(event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; if (background.value) URL.revokeObjectURL(background.value); background.value = URL.createObjectURL(file) }
const handVisible = (player: PlayerState) => player.id === game.activePlayer || player.id === game.combat?.priorityPlayerId || game.revealOpponentHand
function clickHand(player: PlayerState, card: GameCard) { const canAct=player.id===game.activePlayer&&!game.combat||game.combat?.stage==='response'&&player.id===game.combat.priorityPlayerId;if(!canAct||!handVisible(player))return;if(player.id===game.activePlayer&&game.phase === '抽牌填充阶段' && game.fillAvailable) { if (game.fillCost(card.instanceId)) ElMessage.success('已放入明费'); return } if (player.id===game.activePlayer&&game.phase === '结束阶段' && game.pendingDiscard > 0) { game.discard(card.instanceId); return } selected.value = card; selectedField.value = null; selectedCosts.value = []; targetSlot.value = null }
function inspect(card: GameCard) { selected.value = card; selectedField.value = null; selectedCosts.value = []; targetSlot.value = null }
function inspectField(player: PlayerState, slot: number) { const field = player.battlefield[slot]; if (!field) return; selected.value = field.unit; selectedField.value = { playerId: player.id, slot }; selectedCosts.value = []; targetSlot.value = null }
function attack(targetSlot?: number) { if (!selectedField.value) return; const result = game.declareAttack(selectedField.value.slot, targetSlot); if (!result.ok) return ElMessage.error(result.message); selected.value = null; selectedField.value = null }
function block(slot?: number) { const result = game.chooseBlock(slot); if (!result.ok) ElMessage.error(result.message) }
function useCard() { if (!selected.value) return; const result = game.useFromHand(selected.value.instanceId, selectedCosts.value, targetSlot.value ?? undefined); if (!result.ok) return ElMessage.error(result.message); selected.value = null; selectedCosts.value = [] }
function toggleCost(id: string) { const at = selectedCosts.value.indexOf(id); if (at >= 0) selectedCosts.value.splice(at, 1); else if (selectedCosts.value.length < requiredCost.value) selectedCosts.value.push(id) }
function advance() { game.advancePhase(); selected.value = null; if (game.pendingDiscard > 0) ElMessage.warning(`请点击手牌丢弃${game.pendingDiscard}张至上限`) }
function toggleMulligan(id: string) { const index = mulliganSelected.value.indexOf(id); if (index >= 0) mulliganSelected.value.splice(index, 1); else mulliganSelected.value.push(id) }
function confirmMulligan() { game.confirmMulligan(mulliganSelected.value); mulliganSelected.value = [] }
function toggleEffectChoice(id: string) { const choice = game.pendingChoice; if (!choice) return; const at = effectChoiceIds.value.indexOf(id); if (at >= 0) effectChoiceIds.value.splice(at, 1); else if (effectChoiceIds.value.length < choice.max) effectChoiceIds.value.push(id) }
function confirmEffectChoice() { const result = game.confirmChoice(effectChoiceIds.value); if (!result.ok) ElMessage.error(result.message) }
function activate(abilityId: string) { if (!selected.value) return; const result = game.activateAbility(selected.value.instanceId, abilityId); if (!result.ok) ElMessage.error(result.message) }
</script>

<template>
  <section class="game-shell complete-table"
    :style="background ? { backgroundImage: `linear-gradient(#071322c8,#071322c8),url(${background})` } : undefined">
    <div class="game-toolbar"><el-tag type="danger">{{ game.gameStage === 'mulligan' ? '开局换牌' : `第${game.turnNumber}回合 ·
        ${game.phase}` }}</el-tag><strong>{{ game.active.name }}操作</strong><el-switch v-model="game.revealOpponentHand"
        active-text="公开另一方手牌" /><label class="file-button">更换背景<input type="file" accept="image/*"
          @change="chooseBackground" /></label><el-button @click="logVisible = true">操作记录</el-button><el-button
        @click="setup = true">重新开局</el-button></div>
    <el-alert v-if="game.halted" class="halt-alert" title="存在尚未自动编码的卡牌效果，对局现场已保留。" type="error" show-icon><el-button
        size="small" @click="game.resume">人工处理完成，继续</el-button></el-alert>
    <template v-if="game.started">
      <main class="table-main">
        <div class="boards">
          <div v-for="player in [...game.players].reverse()" :key="player.id" class="player-board full-board"
            :class="{ active: player.id === game.activePlayer }">
            <header class="player-summary"><b>{{ player.name }}</b><span>手牌 {{ player.hand.length }}</span><span>侵蚀
                {{ player.erosion }}/7</span></header>
            <div class="zone-layout">
              <div class="table-battlefield table-zone"><label>战场区</label>
                <div class="battle-slots">
                  <div v-for="(slot, index) in player.battlefield" :key="index" class="table-field-slot"
                    @click="slot && inspectField(player, index)"><span v-if="!slot">{{ index + 1 }}</span><template v-else><img
                        :class="{ tapped: slot.unit.tapped }" :src="slot.unit.card.image_url" /><small
                        v-if="slot.equipment.length">装备 {{ slot.equipment.length }}</small><small v-if="slot.partner">协战：{{ slot.partner.card.name }}</small><b class="live-stats">PP {{ game.fieldStats(player.id, index).pp }} · DP {{ game.fieldStats(player.id, index).dp }}</b></template>
                  </div>
                </div>
              </div>
              <div class="table-deck table-zone"><label>牌组</label>
                <div v-if="player.deck.length" class="deck-placeholder" aria-label="牌组卡背"></div>
                <b>{{ player.deck.length }}</b>
              </div>
              <div class="table-signal table-zone"><label>信号球区</label>
                <div class="table-zone-cards"><img v-for="card in player.signalZone" :key="card.instanceId"
                    :src="card.card.image_url" @click="inspect(card)" /></div>
              </div>
              <div class="table-processing table-zone"><label>处理区</label>
                <div class="table-zone-cards"><img v-for="card in player.processingZone" :key="card.instanceId"
                    :src="card.card.image_url" @click="inspect(card)" /></div>
              </div>
              <div class="table-erosion table-zone"><label>侵蚀计数区</label>
                <div class="erosion-track"><span v-for="number in 8" :key="number"
                    :class="{ current: player.erosion === number - 1 }">{{ number - 1 }}</span></div>
              </div>
              <div class="table-cost table-zone"><label>费用区</label>
                <div class="table-zone-cards"><img v-for="card in player.costZone" :key="card.instanceId"
                    :class="{ tapped: card.tapped, down: card.faceDown }"
                    :src="card.faceDown ? '/card-back.svg' : card.card.image_url" @click="inspect(card)" /></div>
              </div>
              <div class="table-grave table-zone"><label>墓地</label><img v-if="player.graveyard[0]"
                  :src="player.graveyard[0].card.image_url" @click="inspect(player.graveyard[0])" /><b>{{
                    player.graveyard.length
                  }}</b>
              </div>
            </div>
            <div class="large-hand" :class="{ concealed: !handVisible(player) }"><label>手牌</label>
              <div><img v-for="card in player.hand" :key="card.instanceId"
                  :class="{ selected: selected?.instanceId === card.instanceId }"
                  :src="handVisible(player) ? card.card.image_url : '/card-back.svg'"
                  :alt="handVisible(player) ? card.card.name : '隐藏手牌'" @click="clickHand(player, card)" /></div><small
                v-if="player.id === game.activePlayer && game.phase === '抽牌填充阶段' && game.fillAvailable">点击一张手牌设置明费，也可以直接进入主要阶段</small><small
                v-if="player.id === game.activePlayer && game.pendingDiscard > 0">点击手牌丢弃 {{ game.pendingDiscard }}
                张</small>
            </div>
          </div>
        </div>
        <aside class="card-inspector"><template v-if="selected"><img class="inspect-image"
              :src="selected.card.image_url" />
            <h3>{{ selected.card.name }}</h3>
            <p>{{ selected.card.card_no }} · 费用 {{ selected.card.cost ?? '-' }} · {{ selected.card.attribute }}</p>
            <div class="inspect-stats">PP {{ selected.card.pp_value ?? '-' }}　DP {{ selected.card.dp_value ?? '-' }}
            </div>
            <pre>{{ selected.card.effect || '此牌没有能力。' }}</pre><el-alert v-if="selectedReasons.length"
              :title="selectedReasons.join('；')" type="warning" :closable="false" />
            <div v-if="game.activatableAbilities(selected.instanceId).length" class="activated-abilities">
              <el-button v-for="ability in game.activatableAbilities(selected.instanceId)" :key="ability.id" type="warning"
                :disabled="ability.disabled" @click="activate(ability.id)">{{ ability.label }}</el-button>
            </div>
            <div v-if="selectedField?.playerId === game.activePlayer && game.canAttack(selectedField.slot)" class="activated-abilities">
              <el-button type="danger" @click="attack()">攻击对方玩家</el-button>
              <el-button v-for="(slot, index) in game.opponent.battlefield" v-show="slot?.unit.tapped" :key="index" type="danger" plain @click="attack(index)">攻击 {{ slot?.unit.card.name }}</el-button>
            </div>
            <div v-else-if="!selectedReasons.length" class="use-controls">
              <p>选择 {{ requiredCost }} 张竖直费用（{{ selectedCosts.length }}/{{ requiredCost }}）</p>
              <div class="payment-cards"><button v-for="fee in game.payableCosts" :key="fee.instanceId"
                  :class="{ chosen: selectedCosts.includes(fee.instanceId) }" @click="toggleCost(fee.instanceId)"><img
                    :src="fee.faceDown ? '/card-back.svg' : fee.card.image_url" /><span>{{ fee.faceDown ? '暗费' :
                      fee.card.attribute }}</span></button>
              </div><el-select v-if="selected.card.card_types.includes('装备牌') || selected.card.card_types.includes('升变角色牌')" v-model="targetSlot"
                :placeholder="selected.card.card_types.includes('升变角色牌') ? '选择升变对象' : '选择装备角色'"><el-option v-for="(slot, index) in game.active.battlefield" v-show="slot && (!selected.card.card_types.includes('升变角色牌') || game.upgradeTargets(selected).includes(index)) && (!selected.card.card_types.includes('装备牌') || !slot.equipment.length)"
                  :key="index" :label="slot?.unit.card.name" :value="index" /></el-select><el-button type="primary"
                :disabled="selectedCosts.length !== requiredCost || ((selected.card.card_types.includes('装备牌') || selected.card.card_types.includes('升变角色牌')) && targetSlot === null)"
                @click="useCard">确认使用</el-button>
            </div>
          </template><el-empty v-else description="点击手牌或场上卡牌查看详情" :image-size="70" /></aside>
      </main>
      <div v-if="game.combat?.stage === 'response'" class="turn-actions">
        <span>攻击自由时点：{{ game.players.find(player => player.id === game.combat?.priorityPlayerId)?.name }}优先</span>
        <el-button type="warning" @click="game.passCombatResponse()">放弃优先权</el-button>
      </div>
      <div v-else-if="game.combat?.stage === 'block'" class="turn-actions">
        <span>选择阻挡角色：</span>
        <el-button v-for="(slot, index) in game.players.find(player => player.id === game.combat?.targetPlayerId)?.battlefield" v-show="slot && !slot.unit.tapped" :key="index" @click="block(index)">{{ slot?.unit.card.name }}</el-button>
        <el-button type="danger" plain @click="block()">不阻挡</el-button>
      </div>
      <div v-if="game.gameStage === 'playing'" class="turn-actions"><el-button type="primary" :disabled="game.halted || Boolean(game.pendingChoice) || Boolean(game.combat)"
          @click="advance">{{ nextLabel }}</el-button></div>
      <div v-else class="mulligan-overlay">
        <section>
          <h2>{{ game.active.name }}进行起手换牌</h2>
          <p>{{ game.activePlayer === game.firstPlayer ? '先攻玩家先选择' : '后攻玩家选择' }}；点击任意数量的手牌，将其放到牌组底并抽取等量卡牌，之后洗切牌组。</p>
          <div class="mulligan-hand"><button v-for="card in game.active.hand" :key="card.instanceId"
              :class="{ chosen: mulliganSelected.includes(card.instanceId) }"
              @click="toggleMulligan(card.instanceId)"><img :src="card.card.image_url" /><span>{{
                mulliganSelected.includes(card.instanceId) ? '已选择' : '保留'
                }}</span></button>
          </div><el-button type="primary" size="large" @click="confirmMulligan">确认换牌（{{ mulliganSelected.length
            }}张）</el-button>
        </section>
      </div>
    </template>

    <el-dialog v-model="logVisible" title="操作记录" width="620px">
      <div class="dialog-log">
        <div v-for="item in game.logs" :key="item.id"><time>{{ item.timestamp }}</time>{{ item.text }}</div>
      </div>
    </el-dialog>
    <el-dialog :model-value="Boolean(game.pendingChoice)" :title="game.pendingChoice?.prompt" width="760px"
      :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
      <p class="choice-hint">请选择 {{ game.pendingChoice?.min }} 至 {{ game.pendingChoice?.max }} 张（已选择 {{ effectChoiceIds.length }} 张）</p>
      <div v-if="game.pendingChoice?.kind === 'cards'" class="effect-choice-grid">
        <button v-for="option in game.pendingChoice?.options || []" :key="option.ref.instanceId"
          :class="{ chosen: effectChoiceIds.includes(option.ref.instanceId) }" @click="toggleEffectChoice(option.ref.instanceId)">
          <img :src="option.card.card.image_url" /><span>{{ option.label }}</span>
        </button>
      </div>
      <div v-else class="effect-option-grid">
        <button v-for="option in game.pendingChoice?.options || []" :key="option.id"
          :class="{ chosen: effectChoiceIds.includes(option.id) }" @click="toggleEffectChoice(option.id)">{{ option.label }}</button>
      </div>
      <template #footer><el-button type="primary"
        :disabled="effectChoiceIds.length < (game.pendingChoice?.min || 0) || effectChoiceIds.length > (game.pendingChoice?.max || 0)"
        @click="confirmEffectChoice">确认选择并继续结算</el-button></template>
    </el-dialog>
    <el-dialog v-model="setup" title="开始对局" width="520px" :close-on-click-modal="false"><el-form
        label-width="100px"><el-form-item label="玩家一牌组"><el-select v-model="deck1Id"><el-option
              v-for="item in decks.saved" :key="item.id" :label="item.name"
              :value="item.id" /></el-select></el-form-item><el-form-item label="玩家二牌组"><el-select
            v-model="deck2Id"><el-option v-for="item in decks.saved" :key="item.id" :label="item.name"
              :value="item.id" /></el-select></el-form-item><el-form-item label="开局方式"><el-radio-group
            v-model="mode"><el-radio-button value="standard">标准随机洗牌</el-radio-button><el-radio-button
              value="ordered">按牌表顺序</el-radio-button></el-radio-group></el-form-item></el-form><template
        #footer><el-button type="primary" @click="start">开始</el-button></template></el-dialog>
  </section>
</template>
