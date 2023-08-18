import { EventEmitter } from 'eventemitter3'
import {
  type MagicTimerEvent,
  type MagicTimerOptions,
  type TimeInfo,
  Event,
  State,
} from './types'
import { utils } from './utils'

const DEFAULT_OPTIONS: MagicTimerOptions = Object.freeze({
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
    // below are needed for precise interval. we need to inspect ticks and
    // elapsed time difference within the latest "continuous" session. in
    // other words, paused time should be ignored in these calculations. so
    // we need variables saved after timer is resumed.
    resumeTime: number
    hrResumeTime: [number, number]
    tickCountAfterResume: number
  }

  private _timeoutRef: any

  private _immediateRef: any

  private _runCount: number

  // ---------------------------
  // CONSTRUCTOR
  // ---------------------------

  constructor(options?: MagicTimerOptions | number) {
    super()

    this._timeoutRef = null
    this._immediateRef = null
    this._runCount = 0
    this._reset()

    this._.opts = {}
    const opts =
      typeof options === 'number'
        ? { interval: options }
        : options || ({} as any)
    this.interval = opts.interval
    this.precision = opts.precision
  }

  // ---------------------------
  // GETTERS & SETTERS
  // ---------------------------

  get interval(): number {
    return this._.opts.interval
  }
  set interval(value: number) {
    this._.opts.interval = utils.getNumber(value, 20, DEFAULT_OPTIONS.interval)
  }

  get precision(): boolean {
    return this._.opts.precision
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

  get runCount(): number {
    return this._runCount
  }

  // ---------------------------
  // PUBLIC METHODS
  // ---------------------------

  start(): MagicTimer {
    this._stop()
    this._.state = State.RUNNING
    this._runCount++
    this._.tickCount = 0
    this._.stopTime = 0
    this._markTime()
    this._.startTime = Date.now()
    this._emit(Event.START)
    this._run()
    return this
  }

  pause(): MagicTimer {
    if (this.state !== State.RUNNING) return this
    this._stop()
    this._.state = State.PAUSED
    this._emit(Event.PAUSE)
    return this
  }

  resume(): MagicTimer {
    if (this.state === State.IDLE) {
      this.start()
      return this
    }
    if (this.state !== State.PAUSED) return this
    this._runCount++
    this._markTime()
    this._.state = State.RUNNING
    this._emit(Event.RESUME)
    this._run()
    return this
  }

  stop(): MagicTimer {
    if (this.state !== State.RUNNING) return this
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

  // Extend EventEmitter 'on' and 'once' methods to accept MagicTimerEvent

  on<T extends string | symbol>(
    event: T,
    fn: (event: MagicTimerEvent) => void,
    context?: any
  ): this {
    return super.on(event, fn, context)
  }

  once<T extends string | symbol>(
    event: T,
    fn: (event: MagicTimerEvent) => void,
    context?: any
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
    this._.tickCountAfterResume = 0
    if (this._timeoutRef) {
      clearTimeout(this._timeoutRef)
      this._timeoutRef = null
    }
    if (this._immediateRef) {
      utils.clearImmediate(this._immediateRef)
      this._immediateRef = null
    }
  }

  private _reset(): void {
    this._ = {
      opts: (this._ || ({} as any)).opts,
      state: State.IDLE,
      tickCount: 0,
      startTime: 0,
      stopTime: 0,
      resumeTime: 0,
      hrResumeTime: null,
      tickCountAfterResume: 0,
    }
    this._stop()
  }

  private _tick(): void {
    this._.state = State.RUNNING
    this._.tickCount++
    this._.tickCountAfterResume++
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

  private _getTimeDiff(): number {
    if (utils.BROWSER) return Date.now() - this._.resumeTime

    const hrDiff = process.hrtime(this._.hrResumeTime)
    return Math.ceil(hrDiff[0] * 1000 + hrDiff[1] / 1e6)
  }

  private _run(): void {
    if (this.state !== State.RUNNING) return

    let interval = this.interval
    // we'll get a precise interval by checking if our clock is already
    // drifted.
    if (this.precision) {
      const diff = this._getTimeDiff()
      // did we reach this expected tick count for the given time period?
      // calculated count should not be greater than tickCountAfterResume
      if (Math.floor(diff / interval) > this._.tickCountAfterResume) {
        // if we're really late, run immediately!
        this._immediateRef = utils.setImmediate(() => this._tick())
        return
      }
      // if we still have time but a bit off, update next interval.
      interval = interval - (diff % interval)
    }

    this._timeoutRef = setTimeout(() => this._tick(), interval)
  }
}

export { MagicTimer }
