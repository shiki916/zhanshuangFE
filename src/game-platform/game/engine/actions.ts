import type { CardSelector, RelativePlayer } from './model'

export type ActionTarget = { type: 'source' } | { type: 'binding'; name: string } | { type: 'related' }
export const source = (): ActionTarget => ({ type: 'source' })
export const selected = (name: string): ActionTarget => ({ type: 'binding', name })
export const related = (): ActionTarget => ({ type: 'related' })

export type GameAction =
  | { type: 'draw'; player: RelativePlayer; amount: number }
  | { type: 'chooseCards'; bind: string; prompt: string; min: number; max: number; selector: CardSelector; then: GameAction[]; remainder?: 'deckBottom' | 'graveyard' | 'shuffle'; constraint?: 'sameSignalColor'; optionalExact?: boolean; allowedCounts?: number[]; physicalCards?: boolean; maxTotalCost?: number; poolBinding?: string; preserveSelectionOrder?: boolean }
  | { type: 'chooseOption'; prompt: string; min: number; max: number; countFromBinding?: { name: string; divisor?: number }; options: Array<{ id: string; label: string; actions: GameAction[] }> }
  | { type: 'moveCards'; target: ActionTarget; destination: CardDestination }
  | { type: 'modifyStats'; target: ActionTarget; pp?: number; dp?: number; perBinding?: string; duration: 'turn' | 'nextTurn' | 'permanent' }
  | { type: 'grantKeywords'; target: ActionTarget; keywords: string[]; duration: 'turn' | 'nextTurn' | 'permanent' }
  | { type: 'destroyCards'; target: ActionTarget }
  | { type: 'setOrientation'; target: ActionTarget; tapped: boolean }
  | { type: 'adjustErosion'; player: RelativePlayer; amount: number }
  | { type: 'mill'; player: RelativePlayer; amount: number; bind?: string }
  | { type: 'revealTop'; player: RelativePlayer; amount: number; bind?: string }
  | { type: 'scheduleMove'; target: ActionTarget; destination: CardDestination; at: 'turnEnd' | 'nextTurnEnd' }
  | { type: 'grantNextCostDiscount'; player: RelativePlayer; feature?: string; name?: string; amount: number }
  | { type: 'grantAura'; player: RelativePlayer; selector: CardSelector; pp?: number; dp?: number; chargeBonus?: number; keywords?: string[]; duration: 'turn' | 'nextTurn' }
  | { type: 'payCards'; target: ActionTarget }
  | { type: 'formCooperation'; partner: ActionTarget }
  | { type: 'attachCards'; cards: ActionTarget; host: ActionTarget; kind: 'under' | 'equipment' }
  | { type: 'setBaseStats'; target: ActionTarget; pp?: number; dp?: number; duration: 'turn' | 'permanent' }
  | { type: 'grantSignalAlias'; player: RelativePlayer; from: string; to: string[]; duration: 'turn' }
  | { type: 'setSignalValue'; target: ActionTarget; value: number; duration: 'turn' }
  | { type: 'setSignalAliases'; target: ActionTarget; colors: string[]; duration: 'turn' }
  | { type: 'reorderSignalZone'; player: RelativePlayer }
  | { type: 'performUpgrade'; upgrade: ActionTarget; host: ActionTarget; under?: ActionTarget }
  | { type: 'preventCombatDamage' }
  | { type: 'dealDamage'; player: RelativePlayer; amount: number }
  | { type: 'shuffle'; player: RelativePlayer }
  | { type: 'conditional'; condition: ActionCondition; then: GameAction[]; otherwise?: GameAction[] }

export type ActionCondition =
  | { type: 'bindingMatches'; binding: string; selector: Omit<CardSelector, 'player' | 'zone'> }
  | { type: 'count'; selector: CardSelector; min?: number; max?: number }
  | { type: 'erosion'; player: RelativePlayer; min?: number; max?: number }
  | { type: 'erosionAtLeastOpponent'; player: RelativePlayer }

export type CardDestination = 'hand' | 'graveyard' | 'signalTop' | 'signalBottom' | 'deckTop' | 'deckBottom' | 'costReady' | 'costTapped' | 'costFaceDown' | 'battlefieldReady' | 'battlefieldTapped'

export const draw = (amount: number, player: RelativePlayer = 'controller'): GameAction => ({ type: 'draw', player, amount })
export const moveCards = (target: ActionTarget, destination: CardDestination): GameAction => ({ type: 'moveCards', target, destination })
export const modifyStats = (target: ActionTarget, values: { pp?: number; dp?: number; perBinding?: string }, duration: 'turn' | 'nextTurn' | 'permanent' = 'turn'): GameAction => ({ type: 'modifyStats', target, ...values, duration })
export const grantKeywords = (target: ActionTarget, keywords: string[], duration: 'turn' | 'nextTurn' | 'permanent' = 'turn'): GameAction => ({ type: 'grantKeywords', target, keywords, duration })
export const destroyCards = (target: ActionTarget): GameAction => ({ type: 'destroyCards', target })
export const chooseCards = (options: Omit<Extract<GameAction, { type: 'chooseCards' }>, 'type'>): GameAction => ({ type: 'chooseCards', ...options })
export const chooseOption = (prompt: string, options: Array<{ id: string; label: string; actions: GameAction[] }>, min = 1, max = 1): GameAction => ({ type: 'chooseOption', prompt, options, min, max })
export const setOrientation = (target: ActionTarget, tapped: boolean): GameAction => ({ type: 'setOrientation', target, tapped })
export const adjustErosion = (amount: number, player: RelativePlayer = 'controller'): GameAction => ({ type: 'adjustErosion', player, amount })
export const mill = (amount: number, player: RelativePlayer = 'controller', bind?: string): GameAction => ({ type: 'mill', player, amount, bind })
export const revealTop = (amount: number, player: RelativePlayer = 'controller', bind?: string): GameAction => ({ type: 'revealTop', player, amount, bind })
export const scheduleMove = (target: ActionTarget, destination: CardDestination, at: 'turnEnd' | 'nextTurnEnd' = 'turnEnd'): GameAction => ({ type: 'scheduleMove', target, destination, at })
export const grantNextCostDiscount = (amount: number, match: { feature?: string; name?: string }, player: RelativePlayer = 'controller'): GameAction => ({ type: 'grantNextCostDiscount', player, amount, ...match })
export const grantAura = (selector: CardSelector, values: { pp?: number; dp?: number; chargeBonus?: number; keywords?: string[] }, duration: 'turn' | 'nextTurn' = 'turn', player: RelativePlayer = 'controller'): GameAction => ({ type: 'grantAura', player, selector, ...values, duration })
export const payCards = (target: ActionTarget): GameAction => ({ type: 'payCards', target })
export const formCooperation = (partner: ActionTarget): GameAction => ({ type: 'formCooperation', partner })
export const attachCards = (cards: ActionTarget, host: ActionTarget, kind: 'under' | 'equipment'): GameAction => ({ type: 'attachCards', cards, host, kind })
export const setBaseStats = (target: ActionTarget, values: { pp?: number; dp?: number }, duration: 'turn' | 'permanent' = 'permanent'): GameAction => ({ type: 'setBaseStats', target, ...values, duration })
export const grantSignalAlias = (from: string, to: string[], player: RelativePlayer = 'controller'): GameAction => ({ type: 'grantSignalAlias', player, from, to, duration: 'turn' })
export const setSignalValue = (target: ActionTarget, value: number): GameAction => ({ type: 'setSignalValue', target, value, duration: 'turn' })
export const setSignalAliases = (target: ActionTarget, colors: string[]): GameAction => ({ type: 'setSignalAliases', target, colors, duration: 'turn' })
export const reorderSignalZone = (player: RelativePlayer = 'controller'): GameAction => ({ type: 'reorderSignalZone', player })
export const performUpgrade = (upgrade: ActionTarget, host: ActionTarget, under?: ActionTarget): GameAction => ({ type: 'performUpgrade', upgrade, host, under })
export const preventCombatDamage = (): GameAction => ({ type: 'preventCombatDamage' })
export const dealDamage = (amount: number, player: RelativePlayer = 'opponent'): GameAction => ({ type: 'dealDamage', player, amount })
export const shuffleDeck = (player: RelativePlayer = 'controller'): GameAction => ({ type: 'shuffle', player })
export const when = (condition: ActionCondition, then: GameAction[], otherwise?: GameAction[]): GameAction => ({ type: 'conditional', condition, then, otherwise })
