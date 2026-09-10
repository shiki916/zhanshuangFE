import { chooseCards, moveCards, selected } from '../../engine/actions'
import type { CardBehavior } from '../../engine/card-behavior'

export const ST01_003: CardBehavior = {
  cardNo: 'ST01-003', coverage: 'complete',
  onEnter(context) {
    context.enqueue(chooseCards({ bind: 'signal', prompt: '选择墓地中的1张信号球放到信号球区最上方', min: 1, max: 1,
      selector: { player: 'controller', zone: 'graveyard', feature: '信号球' },
      then: [moveCards(selected('signal'), 'signalTop')] }))
  },
}
