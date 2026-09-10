import { chooseCards, moveCards, revealTop, selected } from '../../engine/actions'
import type { CardBehavior } from '../../engine/card-behavior'

export const ST01_001: CardBehavior = {
  cardNo: 'ST01-001', coverage: 'complete',
  onEnter(context) { const revealed=Math.min(5,context.query.count({player:'controller',zone:'deck'}));context.enqueue(chooseCards({ bind: 'discard', prompt: '选择1张手牌丢弃', min: 1, max: 1,
    selector: { player: 'controller', zone: 'hand' }, then: [moveCards(selected('discard'), 'graveyard'), revealTop(5, 'controller', 'revealed'),
      chooseCards({ bind: 'character', prompt: '选择费用3及以下的〈灰鸦小队〉角色出场', min: 1, max: 1,
        selector: { player: 'controller', zone: 'processing', cardType: '角色牌', feature: '灰鸦小队', maxCost: 3 }, poolBinding: 'revealed',
        then: [moveCards(selected('character'), 'battlefieldReady')] }),chooseCards({bind:'ordered',prompt:'按放置到牌组底的先后顺序选择剩余卡牌',min:Math.max(0,revealed-1),max:Math.max(0,revealed-1),selector:{player:'controller',zone:'processing'},poolBinding:'revealed',preserveSelectionOrder:true,then:[moveCards(selected('ordered'),'deckBottom')]})] })) },
  activated: [{ id: 'raven-switch', label: '消除2蓝色信号球：返回1张角色并使费用4以下灰鸦出场', oncePerTurn: true,
    activate(context) { context.enqueue(chooseCards({ bind: 'blue', prompt: '选择2张蓝色信号球消除', min: 2, max: 2,
      selector: { player: 'controller', zone: 'signal', feature: '信号球·蓝' }, then: [moveCards(selected('blue'), 'graveyard'),
        chooseCards({ bind: 'returned', prompt: '选择我方战场1张角色返回手牌', min: 1, max: 1,
          selector: { player: 'controller', zone: 'battlefield' }, then: [moveCards(selected('returned'), 'hand'),
            chooseCards({ bind: 'deploy', prompt: '选择手牌费用4及以下的〈灰鸦小队〉角色出场', min: 1, max: 1,
              selector: { player: 'controller', zone: 'hand', cardType: '角色牌', feature: '灰鸦小队', maxCost: 4 }, then: [moveCards(selected('deploy'), 'battlefieldReady')] })] })] })) } }],
}
