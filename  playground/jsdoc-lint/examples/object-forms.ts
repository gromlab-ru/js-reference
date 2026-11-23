/** Настройки, с которыми начинает работу диспетчер. */
export const initialBatch = {
  limit: 10
} as const

/** Настройки, предложенные перевозчиком. */
export const carrierBatch = {
  limit: 20
} satisfies { limit: number }

/** Настройки, зафиксированные при подтверждении отправки. */
export const confirmedBatch = Object.freeze({
  limit: 30
})
