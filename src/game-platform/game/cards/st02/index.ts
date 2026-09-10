import { adjustErosion, chooseCards, chooseOption, modifyStats, moveCards, scheduleMove, selected, source, when } from '../../engine/actions'
import type { CardBehavior } from '../../engine/card-behavior'
import { createVanilla } from '../shared/vanilla'

const ST02_001: CardBehavior = {
  cardNo: 'ST02-001', coverage: 'complete',
  auras: context => context.query.erosion('controller') >= 5 ? [{ selector: { player: 'controller', zone: 'battlefield', feature: '升格者' }, pp: 1000 }] : [],
  activated: [{ id: 'revive-ascendant', label: '消除2蓝色信号球：墓地费用4以下〈升格者〉出场', oncePerTurn: true,
    activate(context) { context.enqueue(chooseCards({ bind: 'blue', prompt: '选择2张蓝色信号球消除', min: 2, max: 2,
      selector: { player: 'controller', zone: 'signal', feature: '信号球·蓝' }, then: [moveCards(selected('blue'), 'graveyard'), chooseCards({ bind: 'revive', prompt: '选择墓地费用4及以下〈升格者〉角色出场', min: 1, max: 1,
        selector: { player: 'controller', zone: 'graveyard', cardType: '角色牌', feature: '升格者', maxCost: 4 }, then: [moveCards(selected('revive'), 'battlefieldReady')] })] })) } }],
}

const ST02_003: CardBehavior = {
  cardNo: 'ST02-003', coverage: 'complete',
  onEnter(context) {
    context.enqueue(chooseCards({ bind: 'discard', prompt: '选择1张手牌丢弃', min: 1, max: 1,
      selector: { player: 'controller', zone: 'hand' }, then: [
        moveCards(selected('discard'), 'graveyard'),
        chooseCards({ bind: 'searched', prompt: '公开牌组顶3张，选择1张〈升格者〉角色加入手牌', min: 1, max: 1,
          selector: { player: 'controller', zone: 'deckTop', top: 3, cardType: '角色牌', feature: '升格者' },
          then: [moveCards(selected('searched'), 'hand')], remainder: 'graveyard' }),
      ] }))
  },
}

const ST02_004: CardBehavior = {
  cardNo: 'ST02-004', coverage: 'complete',
  continuous: context => ({ chargeSet: 0, pp: context.query.count({ player: 'controller', zone: 'graveyard' }) >= 10 ? 1500 : 0 }),
}

const ST02_006: CardBehavior = {
  cardNo: 'ST02-006', coverage: 'complete',
  continuous: context => ({ pp: context.query.erosion('controller') >= 4 ? 1000 : 0 }),
  onEnter(context){const count=context.query.count({player:'controller',zone:'signal'});context.enqueue(chooseCards({bind:'signals',prompt:'按从上到下的顺序选择全部信号球',min:count,max:count,selector:{player:'controller',zone:'signal'},preserveSelectionOrder:true,then:[moveCards(selected('signals'),'signalBottom')]}))},
}

const ST02_007: CardBehavior = {
  cardNo: 'ST02-007', coverage: 'complete',
  onEnter(context) {
    context.enqueue(chooseCards({ bind: 'discard', prompt: '选择1张手牌丢弃', min: 1, max: 1,
      selector: { player: 'controller', zone: 'hand' }, then: [
        moveCards(selected('discard'), 'graveyard'),
        chooseCards({ bind: 'recover', prompt: '选择墓地1张〈升格者〉角色加入手牌', min: 1, max: 1,
          selector: { player: 'controller', zone: 'graveyard', cardType: '角色牌', feature: '升格者' },
          then: [moveCards(selected('recover'), 'hand')] }),
      ] }))
  },
}

const ST02_008: CardBehavior = {
  cardNo: 'ST02-008', coverage: 'complete',
  continuous: context => ({ pp: context.query.count({ player: 'controller', zone: 'battlefield', feature: '升格者' }) > 0 ? 1000 : 0 }),
  activated: [{ id: 'erosion-power', label: '消除1张信号球：侵蚀+1，本回合DP+1', oncePerTurn: true,
    activate(context) { context.enqueue(chooseCards({ bind: 'signal', prompt: '选择1张任意信号球消除', min: 1, max: 1,
      selector: { player: 'controller', zone: 'signal' }, then: [moveCards(selected('signal'), 'graveyard'), adjustErosion(1), modifyStats(source(), { dp: 1 })] })) } }],
}

const ST02_009: CardBehavior = {
  cardNo:'ST02-009',coverage:'complete',
  onAttack(context){if(!context.related||!context.query.matches(context.related,{name:'露娜·银冕'}))return;context.enqueue(chooseOption('是否消除2张同色信号球使对方角色PP-4000？',[{id:'pay',label:'消除2张同色信号球',actions:[chooseCards({bind:'signals',prompt:'选择2张同色信号球',min:2,max:2,selector:{player:'controller',zone:'signal'},constraint:'sameSignalColor',then:[moveCards(selected('signals'),'graveyard'),chooseCards({bind:'enemy',prompt:'选择对方1张角色PP-4000',min:1,max:1,selector:{player:'opponent',zone:'battlefield'},then:[modifyStats(selected('enemy'),{pp:-4000})]})]})]},{id:'skip',label:'不发动',actions:[]}]))},
}

const ST02_010: CardBehavior = {
  cardNo: 'ST02-010', coverage: 'complete',
  requirements: { onPlay: [{ type: 'battlefieldName', player: 'controller', name: '露娜·银冕' }] },
  onPlay(context) {
    context.enqueue(chooseCards({ bind: 'enemy', prompt: '选择对方1张角色降低PP', min: 1, max: 1,
      selector: { player: 'opponent', zone: 'battlefield' },
      then: [modifyStats(selected('enemy'), { pp: context.query.erosion('controller') * -2000 })] }))
  },
}

const ST02_011: CardBehavior = {
  cardNo: 'ST02-011', coverage: 'complete',
  requirements: { onPlay: [{ type: 'battlefieldName', player: 'controller', name: '露娜·银冕' }, { type: 'defendingPlayer' }] },
  onPlay(context) {
    context.enqueue(chooseCards({ bind: 'revive', prompt: '选择墓地1张费用3及以下的〈升格者〉角色出场', min: 1, max: 1,
      selector: { player: 'controller', zone: 'graveyard', cardType: '角色牌', feature: '升格者', maxCost: 3 },
      then: [when({ type: 'erosion', player: 'controller', max: 4 }, [scheduleMove(selected('revive'), 'graveyard')]), moveCards(selected('revive'), 'battlefieldReady')] }))
  },
}

export const st02Behaviors: CardBehavior[] = [
  ST02_001, createVanilla('ST02-002'), ST02_003, ST02_004, createVanilla('ST02-005'), ST02_006,
  ST02_007, ST02_008, ST02_009, ST02_010, ST02_011,
]
