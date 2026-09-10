import { chooseCards, draw, moveCards, selected } from '../../engine/actions'
import type { CardBehavior } from '../../engine/card-behavior'

export const ST01_005: CardBehavior = {
  cardNo: 'ST01-005', coverage: 'complete',
  onEnter(context) {
    context.enqueue(draw(1), chooseCards({ bind: 'discard', prompt: '选择1张手牌丢弃', min: 1, max: 1,
      selector: { player: 'controller', zone: 'hand' },
      then: [moveCards(selected('discard'), 'graveyard')] }))
  },
}
