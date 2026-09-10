import {
  chooseCards, chooseOption, destroyCards, draw, grantAura, grantNextCostDiscount, modifyStats,
  moveCards, revealTop, selected, setOrientation, source, when,
} from '../../engine/actions'
import type { CardBehavior } from '../../engine/card-behavior'
import { createChargeZero } from '../shared/vanilla'

const cerberusField = { player: 'controller' as const, zone: 'battlefield' as const, feature: '三头犬小队' }

const ST03_001: CardBehavior = {
  cardNo: 'ST03-001', coverage: 'complete',
  onEnter(context) {
    const count = context.query.count(cerberusField)
    context.enqueue(chooseCards({ bind: 'signals', prompt: '消除2张同色信号球', min: 2, max: 2,
      selector: { player: 'controller', zone: 'signal' }, constraint: 'sameSignalColor', then: [
        moveCards(selected('signals'), 'graveyard'),
        chooseCards({ bind: 'ready', prompt: '选择1张〈三头犬小队〉角色竖直', min: 1, max: 1,
          selector: cerberusField, then: [setOrientation(selected('ready'), false)] }),
        chooseCards({ bind: 'team', prompt: '我方全部〈三头犬小队〉角色PP+2000', min: count, max: count,
          selector: cerberusField, then: [modifyStats(selected('team'), { pp: 2000 })] }),
      ] }))
  },
}

const ST03_002: CardBehavior = {
  cardNo: 'ST03-002', coverage: 'complete',
  auras: () => [{ selector: { ...cerberusField, tapped: true }, during: 'opponentTurn', pp: 1000 }],
  activated: [{ id: 'cerberus-discount', label: '横置：下一张〈三头犬小队〉角色费用-2', requiresReady: true,
    activate(context) { context.enqueue(setOrientation(source(), true), grantNextCostDiscount(-2, { feature: '三头犬小队' })) } }],
}

function veraSearchActions() {
  return [
    revealTop(5, 'controller', 'revealed'),
    chooseCards({ bind: 'xxi', prompt: '选择最多1张〈21号〉加入手牌', min: 0, max: 1,
      selector: { player: 'controller', zone: 'processing', feature: '21号' }, poolBinding: 'revealed',
      then: [moveCards(selected('xxi'), 'hand')] }),
    chooseCards({ bind: 'noctis', prompt: '选择最多1张〈诺克提〉加入手牌', min: 0, max: 1,
      selector: { player: 'controller', zone: 'processing', feature: '诺克提' }, poolBinding: 'revealed',
      then: [moveCards(selected('noctis'), 'hand')], remainder: 'graveyard' }),
  ]
}

const ST03_003: CardBehavior = {
  cardNo: 'ST03-003', coverage: 'complete',
  onEnter(context) {
    context.enqueue(chooseOption('选择支付【出】能力的代价', [
      { id: 'signal', label: '消除1张任意信号球', actions: [chooseCards({ bind: 'costSignal', prompt: '选择1张信号球消除', min: 1, max: 1, selector: { player: 'controller', zone: 'signal' }, then: [moveCards(selected('costSignal'), 'graveyard'), ...veraSearchActions()] })] },
      { id: 'discard', label: '丢弃1张手牌', actions: [chooseCards({ bind: 'discard', prompt: '选择1张手牌丢弃', min: 1, max: 1, selector: { player: 'controller', zone: 'hand' }, then: [moveCards(selected('discard'), 'graveyard'), ...veraSearchActions()] })] },
      { id: 'skip', label: '不支付，不发动', actions: [] },
    ]))
  },
}

const ST03_004: CardBehavior = { cardNo: 'ST03-004', coverage: 'complete', continuous: context => context.query.activePlayerId !== context.source.playerId && context.query.isTapped(context.source) ? { pp: 1000 } : {} }

const ST03_006: CardBehavior = {
  cardNo: 'ST03-006', coverage: 'complete',
  onEnter(context) { context.enqueue(chooseCards({ bind: 'discard', prompt: '选择1张手牌丢弃', min: 1, max: 1,
    selector: { player: 'controller', zone: 'hand' }, then: [moveCards(selected('discard'), 'graveyard'),
      when({ type: 'count', selector: cerberusField, min: 3 }, [chooseCards({ bind: 'signal', prompt: '选择墓地1张信号球放到信号球区最上方', min: 1, max: 1,
        selector: { player: 'controller', zone: 'graveyard', feature: '信号球' }, then: [moveCards(selected('signal'), 'signalTop')] })])], })) },
}

const ST03_008: CardBehavior = {
  cardNo: 'ST03-008', coverage: 'complete',
  activated: [{ id: 'vera-discount', label: '横置：下一张〈薇拉〉角色费用-1', requiresReady: true,
    activate(context) { context.enqueue(setOrientation(source(), true), grantNextCostDiscount(-1, { feature: '薇拉' })) } }],
}

const ST03_009: CardBehavior = {
  cardNo: 'ST03-009', coverage: 'complete',
  onOtherEnter(context) { if(!context.related||!context.query.matches(context.related,{name:'薇拉·瑰丽'}))return;context.enqueue(chooseOption('是否消除2张红色信号球强化该牌？',[
    {id:'pay',label:'消除2红色信号球',actions:[chooseCards({bind:'red',prompt:'选择2张红色信号球消除',min:2,max:2,selector:{player:'controller',zone:'signal',feature:'信号球·红'},then:[moveCards(selected('red'),'graveyard'),setOrientation(source(),false),modifyStats(source(),{pp:2000,dp:-1})]})]},
    {id:'skip',label:'不发动',actions:[]},
  ])) },
}

const ST03_010: CardBehavior = {
  cardNo: 'ST03-010', coverage: 'complete',
  onPlay(context) { context.enqueue(draw(2),grantAura({...cerberusField,tapped:true},{pp:1000},'nextTurn')) },
}

const ST03_011: CardBehavior = {
  cardNo: 'ST03-011', coverage: 'complete',
  continuous: context => ({ cost: -context.query.count(cerberusField) }),
  onPlay(context) { context.enqueue(chooseCards({ bind: 'enemy', prompt: '选择对方战场1张角色破坏', min: 1, max: 1,
    selector: { player: 'opponent', zone: 'battlefield' }, then: [destroyCards(selected('enemy'))] })) },
}

export const st03Behaviors: CardBehavior[] = [
  ST03_001, ST03_002, ST03_003, ST03_004, createChargeZero('ST03-005'), ST03_006,
  createChargeZero('ST03-007'), ST03_008, ST03_009, ST03_010, ST03_011,
]
