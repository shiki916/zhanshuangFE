import { chooseCards, moveCards, revealTop, selected } from '../../engine/actions'
import type { CardBehavior } from '../../engine/card-behavior'

export const ST01_010: CardBehavior = {
  cardNo: 'ST01-010', coverage: 'complete',
  onPlay(context) {
    const revealed=Math.min(5,context.query.count({player:'controller',zone:'deck'}))
    context.enqueue(revealTop(5,'controller','revealed'),chooseCards({ bind: 'searched', prompt: '从公开牌中选择1张〈灰鸦小队〉角色加入手牌', min: 1, max: 1,
      selector: { player: 'controller', zone: 'processing', cardType: '角色牌', feature: '灰鸦小队' },poolBinding:'revealed',then: [moveCards(selected('searched'), 'hand')] }),
      chooseCards({bind:'ordered',prompt:'按放置到牌组底的先后顺序选择剩余卡牌',min:Math.max(0,revealed-1),max:Math.max(0,revealed-1),selector:{player:'controller',zone:'processing'},poolBinding:'revealed',preserveSelectionOrder:true,then:[moveCards(selected('ordered'),'deckBottom')]}))
  },
}
