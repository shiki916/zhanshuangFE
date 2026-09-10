export type PlayerId = 'player1' | 'player2'
export type ArchetypeKey = 'all' | 'pledge' | 'alpha' | 'selena' | 'lamia'

export interface CardRecord {
  id: string; card_no: string; name: string; package_name: string; rarity: string
  cost: number | null; attribute: string; pp_value: number | null; dp_value: number | null
  signal_color: string; card_types: string; features: string; effect: string; image_url: string
}
export interface DeckEntry { cardNo: string; count: number }
export interface SavedDeck { id: string; name: string; archetype: ArchetypeKey; entries: DeckEntry[]; updatedAt: string }
export type GamePhase = '竖直阶段' | '抽牌填充阶段' | '主要阶段' | '结束阶段'
export interface ScheduledMove { destination: import('./game/engine/actions').CardDestination; executeTurn: number }
export interface GameCard { instanceId: string; card: CardRecord; tapped: boolean; faceDown: boolean; enteredTurn: number; abilityUses: Record<string, number>; scheduledMoves: ScheduledMove[]; signalValue?: number; signalValueExpiresAtTurn?: number; signalAliases?: string[]; signalAliasesExpiresAtTurn?: number }
export interface StatModifier { id: string; pp: number; dp: number; keywords: string[]; expiresAtTurn: number | null; sourceCardNo: string }
export interface BattlefieldCard { unit: GameCard; underCards: GameCard[]; equipment: GameCard[]; partner: GameCard | null; partnerFromZone?: 'hand' | 'battlefield' | 'graveyard'; partnerOriginalSlot?: number; partnerFormedTurn?: number; modifiers: StatModifier[]; basePpOverride?: number; baseDpOverride?: number; basePpOverrideExpiresAtTurn?: number | null; baseDpOverrideExpiresAtTurn?: number | null }
export interface PlayerEffect { id: string; kind: 'nextCostDiscount' | 'aura' | 'signalAlias'; amount?: number; feature?: string; name?: string; selector?: import('./game/engine/model').CardSelector; pp?: number; dp?: number; chargeBonus?: number; keywords?: string[]; signalFrom?: string; signalTo?: string[]; expiresAtTurn: number }
export interface PlayerState {
  id: PlayerId; name: string; deck: GameCard[]; hand: GameCard[]; graveyard: GameCard[]
  costZone: GameCard[]; signalZone: GameCard[]; processingZone: GameCard[]; battlefield: Array<BattlefieldCard | null>; erosion: number; erosionChangedTurn: number; equipmentPlayedTurn: number; gloryShieldPlayedTurn: number; effects: PlayerEffect[]
}
export interface GameLog { id: number; text: string; timestamp: string }
