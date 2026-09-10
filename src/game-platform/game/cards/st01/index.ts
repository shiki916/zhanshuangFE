import type { CardBehavior } from '../../engine/card-behavior'
import { createChargeZero, createVanilla } from '../shared/vanilla'
import { ST01_002 } from './ST01-002'
import { ST01_001 } from './ST01-001'
import { ST01_003 } from './ST01-003'
import { ST01_005 } from './ST01-005'
import { ST01_009 } from './ST01-009'
import { ST01_010 } from './ST01-010'
import { ST01_011 } from './ST01-011'

export const st01Behaviors: CardBehavior[] = [
  ST01_001,
  ST01_002,
  ST01_003,
  createChargeZero('ST01-004'),
  ST01_005,
  createVanilla('ST01-006'),
  createChargeZero('ST01-007'),
  createVanilla('ST01-008'),
  ST01_009,
  ST01_010,
  ST01_011,
]
