import { chooseCards, chooseOption, destroyCards, draw, grantKeywords, modifyStats, moveCards, revealTop, selected, setOrientation, source } from '../../engine/actions'
import type { CardBehavior } from '../../engine/card-behavior'
import { SHIELD_COUNTER } from '../../engine/keyword-effects'
import { createChargeZero, createVanilla } from '../shared/vanilla'

const hawk = { player: 'controller' as const, zone: 'battlefield' as const, feature: '突击鹰小队' }

const ST04_001: CardBehavior = {
  cardNo: 'ST04-001', coverage: 'complete',
  requirements: { onPlay: [{ type: 'defendingPlayer' }] },
  onPlay(context) { context.enqueue(chooseCards({ bind: 'ally', prompt: '选择1张〈突击鹰小队〉角色竖直并强化', min: 1, max: 1,
    selector: hawk, then: [setOrientation(selected('ally'), false), modifyStats(selected('ally'), { pp: 1000 }), grantKeywords(selected('ally'), [SHIELD_COUNTER])] })) },
}

const ST04_002: CardBehavior = {
  cardNo: 'ST04-002', coverage: 'complete', oncePerTurnTriggers:['onBlock'],
  onEnter(context) { context.enqueue(chooseCards({ bind: 'shield', prompt: '选择墓地1张《荣光护盾》加入手牌', min: 1, max: 1,
    selector: { player: 'controller', zone: 'graveyard', cardNo: 'ST04-001' }, then: [moveCards(selected('shield'), 'hand')] })) },
  onBlock(context){if(!context.related)return;context.enqueue(chooseOption('是否消除2张同色信号球破坏攻击角色？',[{id:'pay',label:'消除2张同色信号球',actions:[chooseCards({bind:'signals',prompt:'选择2张同色信号球',min:2,max:2,selector:{player:'controller',zone:'signal'},constraint:'sameSignalColor',then:[moveCards(selected('signals'),'graveyard'),destroyCards({type:'related'})]})]},{id:'skip',label:'不发动',actions:[]}]))},
}

const ST04_003: CardBehavior = {
  cardNo: 'ST04-003', coverage: 'complete',
  onEnter(context) { context.enqueue(revealTop(7, 'controller', 'revealed'), chooseCards({ bind: 'shield', prompt: '选择最多1张《荣光护盾》加入手牌', min: 0, max: 1,
    selector: { player: 'controller', zone: 'processing', cardNo: 'ST04-001' }, poolBinding: 'revealed',
    then: [moveCards(selected('shield'), 'hand')], remainder: 'shuffle' })) },
  onTurnEnd(context){context.enqueue(moveCards(source(),'deckBottom'),chooseCards({bind:'revive',prompt:'选择墓地费用8及以下〈突击鹰小队〉角色出场',min:1,max:1,selector:{player:'controller',zone:'graveyard',cardType:'角色牌',feature:'突击鹰小队',maxCost:8},then:[moveCards(selected('revive'),'battlefieldReady')]}))},
}

const ST04_004: CardBehavior = {
  cardNo: 'ST04-004', coverage: 'complete',
  onEnter(context) { context.enqueue(chooseCards({ bind: 'other', prompt: '选择其他1张〈突击鹰小队〉角色PP+1000', min: 1, max: 1,
    selector: { ...hawk, excludeInstanceId: context.source.instanceId }, then: [modifyStats(selected('other'), { pp: 1000 }, 'nextTurn')] })) },
}

const ST04_007: CardBehavior = {
  cardNo: 'ST04-007', coverage: 'complete',
  activated: [{ id: 'hawk-search', label: '横置：牌组顶5张检索〈突击鹰小队〉，然后弃1张', requiresReady: true,
    activate(context) { context.enqueue(setOrientation(source(), true), revealTop(5, 'controller', 'revealed'),
      chooseCards({ bind: 'searched', prompt: '选择1张〈突击鹰小队〉加入手牌', min: 1, max: 1,
        selector: { player: 'controller', zone: 'processing', feature: '突击鹰小队' }, poolBinding: 'revealed',
        then: [moveCards(selected('searched'), 'hand')], remainder: 'deckBottom' }),
      chooseCards({ bind: 'discard', prompt: '选择1张手牌丢弃', min: 1, max: 1,
        selector: { player: 'controller', zone: 'hand' }, then: [moveCards(selected('discard'), 'graveyard')] })) } }],
}

const ST04_008: CardBehavior = {
  cardNo: 'ST04-008', coverage: 'complete',
  continuous: context => ({ ignoreAttribute: context.query.count(hawk) > 0 }),
}

const ST04_009: CardBehavior = { cardNo: 'ST04-009', coverage: 'complete',onTurnEnd(context){if(context.query.count({player:'controller',zone:'battlefield',name:'库洛姆'})>0)context.enqueue(chooseCards({bind:'costs',prompt:'选择费用区最多2张牌竖直',min:0,max:2,selector:{player:'controller',zone:'cost'},then:[setOrientation(selected('costs'),false)]}))} }
const ST04_010: CardBehavior = { cardNo: 'ST04-010', coverage: 'complete',oncePerTurnTriggers:['onBlock'],onBlock(context){if(context.related&&context.query.matches(context.related,{feature:'突击鹰小队'}))context.enqueue(draw(1))} }

const ST04_011: CardBehavior = {
  cardNo: 'ST04-011', coverage: 'complete', requirements: { onPlay: [{ type: 'battlefieldName', player: 'controller', name: '库洛姆' }] },
  onPlay(context) { context.enqueue(chooseCards({ bind: 'enemy', prompt: '选择对方费用4及以下角色横置', min: 1, max: 1,
    selector: { player: 'opponent', zone: 'battlefield', maxCost: 4 }, then: [setOrientation(selected('enemy'), true)] })) },
}

export const st04Behaviors: CardBehavior[] = [
  ST04_001, ST04_002, ST04_003, ST04_004, createChargeZero('ST04-005'), createVanilla('ST04-006'),
  ST04_007, ST04_008, ST04_009, ST04_010, ST04_011,
]
