import { adjustErosion, chooseCards, chooseOption, draw, modifyStats, moveCards, selected, source, when } from '../../engine/actions'
import type { CardBehavior } from '../../engine/card-behavior'

export type SignalColor = 'red' | 'blue' | 'yellow'

const ally = { player: 'controller' as const, zone: 'battlefield' as const, cardType: '角色' }

const boost = (stat: 'pp' | 'dp') => chooseCards({
  bind: 'signalTarget',
  prompt: `选择我方战场最多1张角色，${stat.toUpperCase()}获得提升`,
  min: 0,
  max: 1,
  selector: ally,
  then: [modifyStats(selected('signalTarget'), stat === 'pp' ? { pp: 2000 } : { dp: 1 })],
})

export function createSignalBall(cardNo: string, color: SignalColor): CardBehavior {
  return {
    cardNo,
    coverage: 'complete',
    onPlay(context) {
      context.enqueue(moveCards(source(), 'signalTop'), draw(1))
    },
    onCharge(context) {
      const common = { id: 'pp', label: '我方最多1张角色PP+2000', actions: [boost('pp')] }
      if (color === 'red') {
        context.enqueue(chooseOption('红色信号球充能效果', [
          { id: 'dp', label: '我方最多1张角色DP+1', actions: [boost('dp')] },
          common,
        ]))
      } else if (color === 'blue') {
        context.enqueue(chooseOption('蓝色信号球充能效果', [
          { id: 'draw', label: '抽1张牌', actions: [draw(1)] },
          common,
        ]))
      } else {
        context.enqueue(chooseOption('黄色信号球充能效果', [
          {
            id: 'erosion',
            label: '若我方侵蚀不小于对方，我方侵蚀-1',
            actions: [when({ type: 'erosionAtLeastOpponent', player: 'controller' }, [adjustErosion(-1)])],
          },
          common,
        ]))
      }
    },
  }
}
