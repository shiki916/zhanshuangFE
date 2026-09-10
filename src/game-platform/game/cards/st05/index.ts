import { chooseCards, chooseOption, draw, grantKeywords, modifyStats, moveCards, revealTop, scheduleMove, selected, setOrientation, source } from '../../engine/actions'
import type { CardBehavior } from '../../engine/card-behavior'
import { createChargeZero } from '../shared/vanilla'

const isOdd = (value: number | null) => value !== null && Math.abs(value % 2) === 1
const biancaField = { player: 'controller' as const, zone: 'battlefield' as const, name: '比安卡·晖暮' }

const ST05_001: CardBehavior = {
  cardNo: 'ST05-001', coverage: 'complete',
  onEnter(context) { if(!isOdd(context.query.signalBottomCost('controller')))context.enqueue(grantKeywords(source(), ['本回合可以攻击对方玩家'])) },
  onAttack(context){if(!isOdd(context.query.signalBottomCost('controller')))return;context.enqueue(chooseOption('是否消除2张任意信号球使对方角色PP-4000？',[{id:'pay',label:'消除2张任意信号球',actions:[chooseCards({bind:'signals',prompt:'选择2张信号球消除',min:2,max:2,selector:{player:'controller',zone:'signal'},then:[moveCards(selected('signals'),'graveyard'),chooseCards({bind:'enemy',prompt:'选择对方1张角色PP-4000',min:1,max:1,selector:{player:'opponent',zone:'battlefield'},then:[modifyStats(selected('enemy'),{pp:-4000})]})]})]},{id:'skip',label:'不发动',actions:[]}]))},
}

const ST05_002: CardBehavior = {
  cardNo: 'ST05-002', coverage: 'complete',
  onEnter(context) { if(isOdd(context.query.signalBottomCost('controller')))context.enqueue(chooseCards({bind:'revive',prompt:'选择墓地费用4及以下的《比安卡·晖暮》横置出场',min:1,max:1,selector:{player:'controller',zone:'graveyard',name:'比安卡·晖暮',maxCost:4},then:[moveCards(selected('revive'),'battlefieldTapped')]}));else context.enqueue(draw(1)) },
}

const ST05_003: CardBehavior = {
  cardNo: 'ST05-003', coverage: 'complete',
  continuous: context => isOdd(context.query.signalBottomCost('controller')) ? { keywords: ['速攻'] } : { pp: 500 },
}

const ST05_004: CardBehavior = { cardNo: 'ST05-004', coverage: 'complete',onAttack(context){context.enqueue(chooseOption('是否公开牌组顶4张牌？',[{id:'yes',label:'公开并处理',actions:[revealTop(4,'controller','revealed'),chooseCards({bind:'bianca',prompt:'选择最多1张《比安卡·晖暮》放到信号球区最下方',min:0,max:1,selector:{player:'controller',zone:'processing',name:'比安卡·晖暮'},poolBinding:'revealed',then:[scheduleMove(selected('bianca'),'graveyard'),moveCards(selected('bianca'),'signalBottom')],remainder:'deckBottom'})]},{id:'skip',label:'不发动',actions:[]}]))} }

const ST05_005: CardBehavior = {
  cardNo: 'ST05-005', coverage: 'complete',
  onEnter(context) { context.enqueue(chooseCards({bind:'dark',prompt:'可以将1张暗属性手牌放到信号球区最下方',min:0,max:1,selector:{player:'controller',zone:'hand',attribute:'暗'},then:[scheduleMove(selected('dark'),'graveyard'),moveCards(selected('dark'),'signalBottom'),draw(1)]})) },
}

const ST05_007: CardBehavior = {
  cardNo: 'ST05-007', coverage: 'complete',
  activated: [{id:'bianca-to-signal',label:'横置并弃1张：墓地1张《比安卡·晖暮》放到信号球区最下方',requiresReady:true,
    activate(context){context.enqueue(setOrientation(source(),true),chooseCards({bind:'discard',prompt:'选择1张手牌丢弃',min:1,max:1,selector:{player:'controller',zone:'hand'},then:[moveCards(selected('discard'),'graveyard'),chooseCards({bind:'bianca',prompt:'选择墓地1张《比安卡·晖暮》',min:1,max:1,selector:{player:'controller',zone:'graveyard',name:'比安卡·晖暮'},then:[scheduleMove(selected('bianca'),'graveyard'),moveCards(selected('bianca'),'signalBottom')]})]}))}}],
}

const ST05_008: CardBehavior = { cardNo: 'ST05-008', coverage: 'complete',oncePerTurnTriggers:['onAttack'],onAttack(context){if(!context.related||!context.query.matches(context.related,{name:'比安卡·晖暮'}))return;context.enqueue(chooseCards({bind:'dark',prompt:'可以将1张暗属性手牌放到信号球区最下方并抽1张',min:0,max:1,selector:{player:'controller',zone:'hand',attribute:'暗'},then:[scheduleMove(selected('dark'),'graveyard'),moveCards(selected('dark'),'signalBottom'),draw(1)]}))} }

const ST05_009: CardBehavior = {
  cardNo: 'ST05-009', coverage: 'complete',
  requirements:{onPlay:[{type:'selectorCount',selector:{player:'controller',zone:'cost',name:'比安卡·晖暮'},min:3}]},
  continuous: context => ({cost:isOdd(context.query.signalBottomCost('controller'))?-3:0}),
  onPlay(context){context.enqueue(chooseCards({bind:'enemy',prompt:'选择对方1张角色PP-6000',min:1,max:1,selector:{player:'opponent',zone:'battlefield'},then:[modifyStats(selected('enemy'),{pp:-6000})]}));if(!isOdd(context.query.signalBottomCost('controller')))context.enqueue(chooseCards({bind:'extra',prompt:'追加选择对方1张角色PP-3000',min:1,max:1,selector:{player:'opponent',zone:'battlefield'},then:[modifyStats(selected('extra'),{pp:-3000})]}))},
}

const ST05_010: CardBehavior = {
  cardNo:'ST05-010',coverage:'complete',
  onPlay(context){context.enqueue(chooseOption('选择晦明戒律的效果',[{id:'draw',label:'抽1张牌',actions:[draw(1)]},{id:'boost',label:'我方1张《比安卡·晖暮》PP+1000',actions:[chooseCards({bind:'bianca',prompt:'选择1张《比安卡·晖暮》',min:1,max:1,selector:biancaField,then:[modifyStats(selected('bianca'),{pp:1000})]})]}],1,isOdd(context.query.signalBottomCost('controller'))?2:1))},
}

export const st05Behaviors:CardBehavior[]=[ST05_001,ST05_002,ST05_003,ST05_004,ST05_005,createChargeZero('ST05-006'),ST05_007,ST05_008,ST05_009,ST05_010]
