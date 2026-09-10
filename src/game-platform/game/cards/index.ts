import type { CardBehavior } from '../engine/card-behavior'
import { prebuiltSignalBehaviors } from './prebuilt-signals'
import { st01Behaviors } from './st01'
import { st02Behaviors } from './st02'
import { st03Behaviors } from './st03'
import { st04Behaviors } from './st04'
import { st05Behaviors } from './st05'
import { st06Behaviors } from './st06'
import { bp01Behaviors } from './bp01'

const behaviors: CardBehavior[] = [...st01Behaviors, ...st02Behaviors, ...st03Behaviors, ...st04Behaviors, ...st05Behaviors, ...st06Behaviors, ...bp01Behaviors, ...prebuiltSignalBehaviors]
const behaviorRegistry = new Map(behaviors.map(behavior => [behavior.cardNo, behavior]))

export function getCardBehavior(cardNo: string) {
  const normalized = cardNo.replace(/(\d)[ab]$/i, '$1')
  return behaviorRegistry.get(cardNo) || behaviorRegistry.get(normalized)
}
