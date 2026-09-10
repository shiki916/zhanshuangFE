import { createSignalBall } from './shared/signal-ball'

const signalCardNos = {
  red: ['ST01-012', 'ST02-012', 'ST03-012', 'ST04-012', 'ST05-011', 'ST06-012', 'BP01-078', 'BP01-079', 'BP01-080'],
  blue: ['ST01-013', 'ST02-013', 'ST03-013', 'ST04-013', 'ST05-012', 'ST06-013', 'BP01-081', 'BP01-082', 'BP01-083'],
  yellow: ['ST01-014', 'ST02-014', 'ST03-014', 'ST04-014', 'ST05-013', 'ST06-014', 'BP01-084', 'BP01-085', 'BP01-086'],
} as const

export const prebuiltSignalBehaviors = Object.entries(signalCardNos)
  .flatMap(([color, cardNos]) => cardNos.map(cardNo => createSignalBall(cardNo, color as keyof typeof signalCardNos)))
