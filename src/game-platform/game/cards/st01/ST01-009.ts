import { chooseCards, draw, modifyStats, selected } from '../../engine/actions'
import type { CardBehavior } from '../../engine/card-behavior'

export const ST01_009: CardBehavior = {
  cardNo: 'ST01-009', coverage: 'complete',
  onPlay(context) {
    context.enqueue(draw(1), chooseCards({ bind: 'ally', prompt: '选择我方1张〈灰鸦小队〉角色，本回合PP+2000', min: 1, max: 1,
      selector: { player: 'controller', zone: 'battlefield', feature: '灰鸦小队' },
      then: [modifyStats(selected('ally'), { pp: 2000 })] }))
  },
}
