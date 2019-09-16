export function assertUnreachable(_never: never) {
  throw new Error('Unreachable')
}

export function literal<T>(val: T): T {
  return val
}

export function iterateTimes<T>(count: number, cb: (i: number) => T): T[] {
  const res: T[] = []
  for (let i = 0; i < count; i++) {
    res.push(cb(i))
  }
  return res
}
