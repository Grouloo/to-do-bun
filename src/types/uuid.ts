export type UUID = `${string}-${string}-${string}-${string}`

export function createUUID(): UUID {
  return Bun.randomUUIDv7() as UUID
}
