import type { CardBehavior } from '../../engine/card-behavior'
import { bp01_001_020 } from './001-020'
import { bp01_021_040 } from './021-040'
import { bp01_041_060 } from './041-060'
import { bp01_061_077 } from './061-077'

export const bp01Behaviors: CardBehavior[] = [
  ...bp01_001_020,
  ...bp01_021_040,
  ...bp01_041_060,
  ...bp01_061_077,
]
