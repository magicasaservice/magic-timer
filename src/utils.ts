const proto = Object.prototype
const NODE =
  typeof setImmediate === 'function' &&
  typeof process === 'object' &&
  typeof process.hrtime === 'function'
const BROWSER = !NODE

const utils = {
  NODE,
  BROWSER,
  type(o: unknown): string {
    return (
      proto.toString
        ?.call(o)
        .match(/\s(\w+)/i)?.[1]
        .toLowerCase() ?? ''
    )
  },
  getNumber(value: number, minimum: number, defaultValue: number): number {
    return typeof value === 'number'
      ? value < minimum
        ? minimum
        : value
      : defaultValue
  },
  getBool(value: boolean, defaultValue: boolean): boolean {
    return typeof value !== 'boolean' ? defaultValue : value
  },
  setImmediate(cb: (...args: unknown[]) => void, ...args: unknown[]) {
    if (utils.BROWSER) {
      return setTimeout(() => cb(...args), 0)
    }
    return setImmediate(cb, ...args)
  },
  clearImmediate(id: NodeJS.Immediate | number): void {
    if (!id) {
      return
    }

    switch (true) {
      case utils.BROWSER && typeof id === 'number':
        clearTimeout(id)
        break
      case typeof id === 'object':
        clearImmediate(id)
        break
    }
  },
}

export { utils }
