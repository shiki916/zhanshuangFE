import { chooseCards, chooseOption, destroyCards, moveCards, related, selected } from './actions'
import type { CardBehavior } from './card-behavior'

export const SHIELD_COUNTER = 'shieldCounter:2any'

export const shieldCounterBehavior: CardBehavior = {
  cardNo: '__granted_shield_counter__',
  coverage: 'complete',
  onBlock(context) {
    if (!context.related) return
    context.enqueue(chooseOption('是否消除2张任意信号球破坏攻击角色？', [
      { id: 'pay', label: '消除2张任意信号球', actions: [chooseCards({ bind: 'signals', prompt: '选择2张任意信号球消除', min: 2, max: 2, selector: { player: 'controller', zone: 'signal' }, then: [moveCards(selected('signals'), 'graveyard'), destroyCards(related())] })] },
      { id: 'skip', label: '不发动', actions: [] },
    ]))
  },
}
