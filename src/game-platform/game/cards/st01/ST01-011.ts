import { chooseCards, destroyCards, selected } from '../../engine/actions'
import type { CardBehavior } from '../../engine/card-behavior'

export const ST01_011: CardBehavior = {
  cardNo: 'ST01-011', coverage: 'complete',
  requirements: { onPlay: [{ type: 'battlefieldFeature', player: 'controller', feature: '露西亚' }] },
  onPlay(context) {
    context.enqueue(chooseCards({ bind: 'enemy', prompt: '选择对方1张PP为8000及以下的角色并将其破坏', min: 1, max: 1,
      selector: { player: 'opponent', zone: 'battlefield', maxPp: 8000 },
      then: [destroyCards(selected('enemy'))] }))
  },
}
