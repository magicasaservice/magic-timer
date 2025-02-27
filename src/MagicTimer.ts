import { EventEmitter } from 'eventemitter3'
import { utils } from './utils'
import {
  type RequireAll,
  type MagicTimerEvent,
  type MagicTimerOptions,
  type TimeInfo,
  Event,
  State,
} from './types'

const DEFAULT_OPTIONS: RequireAll<MagicTimerOptions> = Object.freeze({
  interval: 1000,
  precision: true,
})

class MagicTimer extends EventEmitter {
  private _: {
    opts: MagicTimerOptions
    state: State
    tickCount: number
    startTime: number
    stopTime: number
    // Values below are needed for precise intervals.
    // We need to inspect ticks and elapsed time difference within the latest session.
    resumeTime: number
    hrResumeTime: [number, number] | null
  } = {
    opts: {},
    state: State.IDLE,
    tickCount: 0,
    startTime: 0,
    stopTime: 0,
    resumeTime: 0,
    hrResumeTime: null,
  }

  private _timeoutRef: unknown

  private _immediateRef: unknown

  // ---------------------------
  // CONSTRUCTOR
  // ---------------------------
  constructor(options?: MagicTimerOptions | number) {
    super()

    this._timeoutRef = null
    this._immediateRef = null
    this._reset()

    this._.opts = {}
    const opts =
      typeof options === 'number' ? { interval: options } : (options ?? {})

    this.interval = opts.interval ?? DEFAULT_OPTIONS.interval
    this.precision = opts.precision ?? DEFAULT_OPTIONS.precision
  }

  // ---------------------------
  // GETTERS & SETTERS
  // ---------------------------
  get interval(): number {
    return this._.opts.interval ?? DEFAULT_OPTIONS.interval
  }
  set interval(value: number) {
    this._.opts.interval = utils.getNumber(value, 1, DEFAULT_OPTIONS.interval)
  }

  get precision(): boolean {
    return this._.opts.precision ?? DEFAULT_OPTIONS.precision
  }
  set precision(value: boolean) {
    this._.opts.precision = utils.getBool(value, DEFAULT_OPTIONS.precision)
  }

  get state(): State {
    return this._.state
  }

  get time(): TimeInfo {
    const { startTime, stopTime } = this._
    const t: TimeInfo = {
      started: startTime,
      stopped: stopTime,
      elapsed: 0,
    }
    if (startTime) {
      const current = this.state !== State.STOPPED ? Date.now() : stopTime
      t.elapsed = current - startTime
    }
    return Object.freeze(t)
  }

  get tickCount(): number {
    return this._.tickCount
  }

  // ---------------------------
  // PUBLIC METHODS
  // ---------------------------
  start(): MagicTimer {
    this._stop()
    this._.state = State.RUNNING
    this._.stopTime = 0
    this._markTime()
    this._.startTime = Date.now()
    this._emit(Event.START)
    this._run()
    return this
  }

  stop(): MagicTimer {
    if (this.state !== State.RUNNING) {
      return this
    }

    this._stop()
    this._.stopTime = Date.now()
    this._.state = State.STOPPED
    this._emit(Event.STOP)

    return this
  }

  reset(): MagicTimer {
    this._reset()
    this._emit(Event.RESET)
    return this
  }

  async nextTick(fn: () => void): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        fn()
        resolve()
      }, this.interval)
    })
  }

  // Extend EventEmitter 'on' and 'once' methods to accept MagicTimerEvent
  on<T extends string | symbol>(
    event: T,
    fn: (event: MagicTimerEvent) => void,
    context?: unknown
  ): this {
    return super.on(event, fn, context)
  }

  once<T extends string | symbol>(
    event: T,
    fn: (event: MagicTimerEvent) => void,
    context?: unknown
  ): this {
    return super.once(event, fn, context)
  }

  // ---------------------------
  // PRIVATE  METHODS
  // ---------------------------
  private _emit(type: Event): boolean {
    const event: MagicTimerEvent = {
      name: type,
      timer: this,
    }
    return this.emit(type, event)
  }

  private _stop(): void {
    if (this._timeoutRef && typeof this._timeoutRef === 'number') {
      clearTimeout(this._timeoutRef)
      this._timeoutRef = null
    }
    if (this._immediateRef && typeof this._immediateRef === 'number') {
      utils.clearImmediate(this._immediateRef)
      this._immediateRef = null
    }
  }

  private _reset(): void {
    this._ = {
      opts: (this._ || {}).opts,
      state: State.IDLE,
      tickCount: 0,
      startTime: 0,
      stopTime: 0,
      resumeTime: 0,
      hrResumeTime: null,
    }
    this._stop()
  }

  private _tick(): void {
    this._.state = State.RUNNING
    this._.tickCount++
    this._emit(Event.TICK)
    this._run()
  }

  private _markTime(): void {
    if (utils.BROWSER) {
      this._.resumeTime = Date.now()
    } else {
      this._.hrResumeTime = process.hrtime()
    }
  }

  private _getTimeDiff(): number | undefined {
    if (utils.BROWSER) {
      return Date.now() - this._.resumeTime
    }

    if (this._.hrResumeTime) {
      const hrDiff = process.hrtime(this._.hrResumeTime)
      return Math.ceil(hrDiff[0] * 1000 + hrDiff[1] / 1e6)
    }
  }

  private _run(): void {
    if (this.state !== State.RUNNING) {
      return
    }

    let interval = this.interval

    if (this.precision) {
      const diff = this._getTimeDiff()
      if (!diff && diff !== 0) {
        console.warn('MagicTimer: Could not calculate time difference.')
        return
      }

      if (Math.floor(diff / interval) > this._.tickCount) {
        // If we’re really late, run immediately!
        this._immediateRef = utils.setImmediate(() => this._tick())
        return
      }
      // If we still have time but are a bit off, update next interval.
      interval = interval - (diff % interval)
    }

    this._timeoutRef = setTimeout(() => this._tick(), interval)
  }
}

export { MagicTimer }
