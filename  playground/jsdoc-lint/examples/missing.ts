export type RequestSource = 'user' | 'retry'

export type BatchOptions = {
  limit: number | null
}

export const defaultBatch = {
  limit: 10
}

export interface Outbox {
  readonly pending: number
  enqueue(id: string): void
}

export enum DispatchState {
  Waiting = 0,
  Sent = 1
}

export function takeNext(queue: string[]): string | undefined {
  return queue.shift()
}

export const hasRoom = (pending: number, limit: number | null): boolean =>
  limit === null || pending < limit

export class DispatchQueue {
  readonly carrier: string
  #ids: string[] = []

  constructor(carrier: string) {
    this.carrier = carrier
  }

  enqueue(id: string): void {
    this.#ids.push(id)
  }
}
