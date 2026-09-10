import type { GameCard, PlayerId } from '../../types'

export type CardTrigger = 'onPlay' | 'onEnter' | 'onCharge' | 'onPartnered' | 'onAttack' | 'onAttackCharge' | 'afterAttack' | 'onBlock' | 'onOtherBlock' | 'onTurnEnd' | 'onOtherEnter' | 'onSignalConsumed' | 'activated'
export type CardZone = 'battlefield' | 'hand' | 'graveyard' | 'deck' | 'deckTop' | 'processing' | 'cost' | 'signal' | 'equipment' | 'partner' | 'under'
export type RelativePlayer = 'controller' | 'opponent'
export type SelectorPlayer = RelativePlayer | 'any'

export interface CardSelector {
  player: SelectorPlayer
  zone: CardZone
  extraZones?: CardZone[]
  top?: number
  cardType?: string
  feature?: string
  features?: string[]
  name?: string
  names?: string[]
  cardNo?: string
  attribute?: string
  minCost?: number
  maxCost?: number
  maxPp?: number
  tapped?: boolean
  excludeInstanceId?: string
  cooperating?: boolean
}

export type CardRequirement =
  | { type: 'battlefieldFeature'; player: RelativePlayer; feature: string }
  | { type: 'battlefieldName'; player: RelativePlayer; name: string }
  | { type: 'selectorCount'; selector: CardSelector; min: number }
  | { type: 'defendingPlayer' }

export interface CardReference {
  playerId: PlayerId
  zone: CardZone
  instanceId: string
  slot?: number
  attachmentIndex?: number
  underIndex?: number
}

export interface ChoiceOption {
  ref: CardReference
  card: GameCard
  label: string
}

export interface PendingCardChoice {
  kind: 'cards'
  id: number
  prompt: string
  min: number
  max: number
  options: ChoiceOption[]
}

export interface PendingOptionChoice {
  kind: 'options'
  id: number
  prompt: string
  min: number
  max: number
  options: Array<{ id: string; label: string }>
}

export type PendingChoice = PendingCardChoice | PendingOptionChoice
