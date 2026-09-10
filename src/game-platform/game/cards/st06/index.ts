import {
  chooseCards, chooseOption, formCooperation, grantKeywords, moveCards, payCards, revealTop,
  selected, setOrientation, source, when,
} from '../../engine/actions'
import type { CardBehavior } from '../../engine/card-behavior'

const allies = ['亚里莎', '塞西莉']
const cooperatingAlisa = { player: 'controller' as const, zone: 'battlefield' as const, feature: '亚里莎', cooperating: true }

function cooperationOptions(context: Parameters<NonNullable<CardBehavior['onEnter']>>[0], maxPartnerCost?: number, specialSignals = false) {
  const handSelector = { player: 'controller' as const, zone: 'hand' as const, feature: '塞西莉', ...(maxPartnerCost === undefined ? {} : { maxCost: maxPartnerCost }) }
  const fieldSelector = { player: 'controller' as const, zone: 'battlefield' as const, feature: '塞西莉', ...(maxPartnerCost === undefined ? {} : { maxCost: maxPartnerCost }), excludeInstanceId: context.source.instanceId }
  const options = [
    { id: 'field', label: '选择战场搭档（0费）', actions: [chooseCards({ bind: 'partner', prompt: '选择战场1张〈塞西莉〉作为协战搭档', min: 1, max: 1, selector: fieldSelector, then: [formCooperation(selected('partner'))] })] },
    { id: 'hand', label: '选择手牌搭档（支付2费）', actions: [chooseCards({ bind: 'partner', prompt: '选择手牌1张〈塞西莉〉作为协战搭档', min: 1, max: 1, selector: handSelector, then: [chooseCards({ bind: 'fees', prompt: '选择2张竖直费用支付协战代价', min: 2, max: 2, selector: { player: 'controller', zone: 'cost', tapped: false }, then: [payCards(selected('fees')), formCooperation(selected('partner'))] })] })] },
  ]
  if (specialSignals) options.push({ id: 'signals', label: '选择手牌《坠落与新生 塞西莉》（消除2任意信号球）', actions: [chooseCards({ bind: 'partner', prompt: '选择手牌《坠落与新生 塞西莉》', min: 1, max: 1, selector: { ...handSelector, name: '坠落与新生 塞西莉' }, then: [chooseCards({ bind: 'signals', prompt: '选择2张任意信号球消除', min: 2, max: 2, selector: { player: 'controller', zone: 'signal' }, then: [moveCards(selected('signals'), 'graveyard'), formCooperation(selected('partner'))] })] })] })
  if(context.query.hasEquipment(context.source,'ST06-010'))options.push({id:'grave',label:'从墓地选择搭档（支付2费）',actions:[chooseCards({bind:'partner',prompt:'选择墓地1张〈塞西莉〉作为协战搭档',min:1,max:1,selector:{player:'controller',zone:'graveyard',feature:'塞西莉',...(maxPartnerCost===undefined?{}:{maxCost:maxPartnerCost})},then:[chooseCards({bind:'fees',prompt:'选择2张竖直费用支付协战代价',min:2,max:2,selector:{player:'controller',zone:'cost',tapped:false},then:[payCards(selected('fees')),formCooperation(selected('partner'))]})]})]})
  return options
}

const ST06_001: CardBehavior = {
  cardNo: 'ST06-001', coverage: 'complete',
  onEnter(context) { if (context.query.count({ player: 'controller', zone: 'battlefield', cooperating: true }) > 0) context.enqueue(grantKeywords(source(), ['速攻'])) },
  activated: [{ id: 'cooperate', label: '选择〈塞西莉〉进行协战', oncePerTurn: true, activate(context) { context.enqueue(chooseOption('选择协战搭档来源与代价', cooperationOptions(context, undefined, context.query.activePlayerId === context.source.playerId))) } }],
}

const ST06_002: CardBehavior = {
  cardNo: 'ST06-002', coverage: 'complete',
  onPartnered(context) { context.enqueue(chooseCards({ bind: 'signal', prompt: '可以消除1张任意信号球发动协战能力', min: 0, max: 1, selector: { player: 'controller', zone: 'signal' }, then: [
    moveCards(selected('signal'), 'graveyard'),
    when({ type: 'bindingMatches', binding: 'signal', selector: { feature: '信号球·红' } }, [
      when({ type: 'count', selector: { player: 'opponent', zone: 'battlefield' }, min: 3 }, [chooseCards({ bind: 'enemy', prompt: '选择对方费用3及以下角色返回手牌', min: 1, max: 1, selector: { player: 'opponent', zone: 'battlefield', maxCost: 3 }, then: [moveCards(selected('enemy'), 'hand')] })]),
    ]),
    when({ type: 'bindingMatches', binding: 'signal', selector: { feature: '信号球·蓝' } }, [chooseCards({ bind: 'costs', prompt: '选择费用区最多2张〈亚里莎〉或〈塞西莉〉竖直', min: 0, max: 2, selector: { player: 'controller', zone: 'cost', features: allies }, then: [setOrientation(selected('costs'), false)] })]),
  ] })) },
}

const ST06_003: CardBehavior = {
  cardNo: 'ST06-003', coverage: 'complete',
  activated: [{ id: 'cooperate', label: '选择费用4及以下〈塞西莉〉进行协战', oncePerTurn: true, activate(context) { context.enqueue(chooseOption('选择协战搭档来源与代价', cooperationOptions(context, 4))) } }],
}

const ST06_004: CardBehavior = {
  cardNo: 'ST06-004', coverage: 'complete',
  continuous: context => ({ cost: -3 * context.query.count(cooperatingAlisa) }),
  onEnter(context) { context.enqueue(chooseCards({ bind: 'signal', prompt: '选择墓地1张信号球放到信号球区最上方', min: 1, max: 1, selector: { player: 'controller', zone: 'graveyard', feature: '信号球' }, then: [moveCards(selected('signal'), 'signalTop')] })) },
}

const ST06_005: CardBehavior = {
  cardNo: 'ST06-005', coverage: 'complete',
  onEnter(context) { context.enqueue(chooseCards({ bind: 'discard', prompt: '选择1张手牌丢弃', min: 1, max: 1, selector: { player: 'controller', zone: 'hand' }, then: [moveCards(selected('discard'), 'graveyard'), revealTop(5, 'controller', 'revealed'), chooseCards({ bind: 'character', prompt: '选择费用4及以下的〈亚里莎〉或〈塞西莉〉出场', min: 1, max: 1, selector: { player: 'controller', zone: 'processing', cardType: '角色牌', features: allies, maxCost: 4 }, poolBinding: 'revealed', then: [moveCards(selected('character'), 'battlefieldReady')], remainder: 'shuffle' })] })) },
}

const ST06_006: CardBehavior = {
  cardNo: 'ST06-006', coverage: 'complete',
  whilePartner: context => context.related && context.query.activePlayerId === context.source.playerId ? { pp: 1500, chargeBonus: 1 } : {},
}

const ST06_007: CardBehavior = {
  cardNo: 'ST06-007', coverage: 'complete',
  continuous: context => ({ chargeSet: 0, pp: context.query.count({ player: 'controller', zone: 'battlefield', cooperating: true }) > 0 ? 1500 : 0 }),
}

const ST06_008: CardBehavior = {
  cardNo: 'ST06-008', coverage: 'complete', continuous: () => ({ chargeSet: 0 }), oncePerTurnTriggers:['onPartnered'],
  onPartnered(context) { context.enqueue(chooseCards({ bind: 'ally', prompt: '选择最多1张〈亚里莎〉或〈塞西莉〉获得速攻', min: 0, max: 1, selector: { player: 'controller', zone: 'battlefield', features: allies }, then: [grantKeywords(selected('ally'), ['速攻'])] })) },
}

const ST06_009: CardBehavior = {
  cardNo: 'ST06-009', coverage: 'complete',
  onPartnered(context) { if (context.query.activePlayerId !== context.source.playerId && context.related) context.enqueue(chooseCards({ bind: 'signal', prompt: '可以消除1张任意信号球，将协战的〈亚里莎〉竖直', min: 0, max: 1, selector: { player: 'controller', zone: 'signal' }, then: [moveCards(selected('signal'), 'graveyard'), setOrientation({ type: 'related' }, false)] })) },
}

const ST06_010: CardBehavior = { cardNo: 'ST06-010', coverage: 'complete' }

const ST06_011: CardBehavior = {
  cardNo: 'ST06-011', coverage: 'complete', requirements: { onPlay: [{ type: 'selectorCount', selector: { player: 'controller', zone: 'battlefield', features: allies }, min: 1 }] },
  onPlay(context) { const destination = context.query.count({ player: 'controller', zone: 'battlefield', cooperating: true }) > 0 ? 'graveyard' : 'hand';context.enqueue(chooseCards({ bind: 'enemy', prompt: `选择对方费用7及以下角色放到${destination === 'graveyard' ? '墓地' : '手牌'}`, min: 1, max: 1, selector: { player: 'opponent', zone: 'battlefield', maxCost: 7 }, then: [moveCards(selected('enemy'), destination)] })) },
}

export const st06Behaviors: CardBehavior[] = [ST06_001, ST06_002, ST06_003, ST06_004, ST06_005, ST06_006, ST06_007, ST06_008, ST06_009, ST06_010, ST06_011]
