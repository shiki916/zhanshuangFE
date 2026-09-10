import type { CardBehavior } from '../../engine/card-behavior'

export const createVanilla = (cardNo: string): CardBehavior => ({ cardNo, coverage: 'complete' })
export const createChargeZero = (cardNo: string): CardBehavior => ({
  cardNo,
  coverage: 'complete',
    continuous: () => ({ chargeSet: 0 }),
})
