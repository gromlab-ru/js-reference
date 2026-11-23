export type DeliveryCode = 'pickup' | 'courier'

export const catalog = new Map<DeliveryCode, string>()

export function registerPickup(target: Map<DeliveryCode, string>): void {
  target.set('pickup', 'Самовывоз')
}

export function labelFor(code: DeliveryCode, source = catalog): string {
  return source.get(code) ?? code
}

export default labelFor
