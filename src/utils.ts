const proto = Object.prototype
const NODE =
  typeof setImmediate === 'function' &&
  typeof process === 'object' &&
  typeof process.hrtime === 'function'
const BROWSER = !NODE

const utils = {
  NODE,
  BROWSER,
  type(o: any): string {
    return proto.toString
      .call(o)
      .match(/\s(\w+)/i)[1]
      .toLowerCase()
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
  setImmediate(cb: (...args: any[]) => void, ...args: any[]): any {
    if (utils.BROWSER) {
      return setTimeout(cb.apply(null, args), 0)
    }
    return setImmediate(cb, ...args)
  },
  clearImmediate(id: any): void {
    if (!id) return
    if (utils.BROWSER) return clearTimeout(id)
    clearImmediate(id)
  },
}

export { utils }
