export function assertUnreachable(_never: never) {
  // throw new Error('Unreachable')
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

export function calculateTransitionSelection(keyCount: number, options: { [key: string]: string | number }) {
  let selection = 0
  if (options.background) {
    selection |= 1 << 0
  }

  for (let i = 0; i < keyCount; i++) {
    if (options[`key${i}`]) {
      selection |= 1 << (i + 1)
    }
  }

  return selection
}
