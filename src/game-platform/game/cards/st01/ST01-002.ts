import { chooseCards, chooseOption, grantKeywords, mill, selected, when } from '../../engine/actions'
import type { CardBehavior } from '../../engine/card-behavior'

export const ST01_002: CardBehavior = {
  cardNo: 'ST01-002',
  coverage: 'complete',
  onEnter(context) {
    context.enqueue(chooseOption('是否将牌组顶3张牌放置到墓地？', [
      { id: 'yes', label: '放置到墓地', actions: [
        mill(3, 'controller', 'milled'),
        when(
          { type: 'bindingMatches', binding: 'milled', selector: { feature: '信号球' } },
          [chooseCards({
            bind: 'ally', prompt: '选择我方1张〈灰鸦小队〉角色，本回合获得【充能+1】', min: 1, max: 1,
            selector: { player: 'controller', zone: 'battlefield', feature: '灰鸦小队' },
            then: [grantKeywords(selected('ally'), ['充能+1'])],
          })],
        ),
      ] },
      { id: 'no', label: '不执行', actions: [] },
    ]))
  },
}
