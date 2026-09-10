import type { GameAction } from './actions'
import type { CardReference, CardRequirement, CardSelector, CardTrigger, RelativePlayer } from './model'

export interface GameQuery {
  readonly activePlayerId: 'player1' | 'player2'
  readonly turnNumber: number
  erosion(player: RelativePlayer): number
  costLimit(player: RelativePlayer): number
  signalBottomCost(player: RelativePlayer): number | null
  count(selector: CardSelector): number
  isTapped(reference: CardReference): boolean
  matches(reference: CardReference, selector: Omit<CardSelector, 'player' | 'zone'>): boolean
  hasEquipment(reference: CardReference, cardNo: string): boolean
  underCount(reference: CardReference, selector?: Omit<CardSelector, 'player' | 'zone'>): number
  erosionChangedThisTurn(player: RelativePlayer): boolean
  playedThisTurn(player: RelativePlayer, kind: 'equipment' | 'gloryShield'): boolean
  hasKeyword(reference: CardReference, keyword: string): boolean
  baseDp(reference: CardReference): number
}

export interface CardContext {
  readonly source: CardReference
  readonly related?: CardReference
  readonly query: GameQuery
  enqueue(...actions: GameAction[]): void
}

export interface ContinuousContribution {
  pp?: number
  dp?: number
  chargeSet?: number
  chargeBonus?: number
  cost?: number
  keywords?: string[]
  cannotAttack?: boolean
  cannotBlock?: boolean
  maxBlockerPp?: number
  ignoreAttribute?: boolean
  equipmentLimit?: number
}

export interface ContinuousAura extends ContinuousContribution {
  selector: CardSelector
  during?: 'always' | 'controllerTurn' | 'opponentTurn'
}

export interface CardBehavior {
  readonly cardNo: string
  readonly coverage: 'partial' | 'complete'
  readonly requirements?: Partial<Record<CardTrigger, CardRequirement[]>>
  readonly oncePerTurnTriggers?: CardTrigger[]
  readonly triggerLimitPerTurn?: Partial<Record<CardTrigger, number>>
  readonly triggerUsageGroup?: Partial<Record<CardTrigger, string>>
  readonly leaveReplacementEquipmentFeatures?: string[]
  readonly finalizeOnPlay?: import('./actions').CardDestination
  readonly processingReplacementFeature?: string
  onPlay?(context: CardContext): void
  onEnter?(context: CardContext): void
  onCharge?(context: CardContext): void
  onPartnered?(context: CardContext): void
  onAttack?(context: CardContext): void
  onAttackCharge?(context: CardContext): void
  afterAttack?(context: CardContext): void
  onBlock?(context: CardContext): void
  onOtherBlock?(context: CardContext): void
  onTurnEnd?(context: CardContext): void
  onOtherEnter?(context: CardContext): void
  onSignalConsumed?(context: CardContext): void
  whilePartner?(context: CardContext): ContinuousContribution
  whileUnder?(context: CardContext): ContinuousContribution
  continuous?(context: CardContext): ContinuousContribution
  auras?(context: CardContext): ContinuousAura[]
  activated?: ActivatedAbility[]
}

export interface ActivatedAbility {
  readonly id: string
  readonly label: string
  readonly oncePerTurn?: boolean
  readonly oncePerGame?: boolean
  readonly requiresReady?: boolean
  readonly requirements?: CardRequirement[]
  activate(context: CardContext): void
}

export interface ResolutionState {
  source: CardReference
  controllerId: 'player1' | 'player2'
  sourceName: string
  sourceCardNo: string
  trigger?: CardTrigger
  actions: GameAction[]
  cursor: number
  bindings: Record<string, CardReference[]>
  related?: CardReference
  finalize: import('./actions').CardDestination | 'none'
}
