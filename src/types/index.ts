import { MagicTimer } from '../MagicTimer'

/**
 *  Utility type to require all keys of a given object.
 */
export type RequireAll<T> = {
  [P in keyof T]-?: T[P]
}

export enum State {
  /**
   *  Indicates that the timer is in `idle` state.
   *  This is the initial state when the `MagicTimer` instance is first created.
   *  Also when an existing timer is reset, it will be `idle`.
   *  @type {String}
   */
  IDLE = 'idle',
  /**
   *  Indicates that the timer is in `running` state.
   *  @type {String}
   */
  RUNNING = 'running',
  /**
   *  Indicates that the timer is in `stopped` state.
   *  @type {String}
   */
  STOPPED = 'stopped',
}

export enum Event {
  /**
   *  Emitted on each tick (interval) of `MagicTimer`.
   *  @type {String}
   */
  TICK = 'tick',
  /**
   *  Emitted when the timer is put in `RUNNING` state; such as when the timer is
   *  started.
   *  @type {String}
   */
  START = 'start',
  /**
   *  Emitted when the timer is put in `PAUSED` state.
   *  @type {String}
   */
  STOP = 'stop',
  /**
   *  Emitted when the timer is reset.
   *  @type {String}
   */
  RESET = 'reset',
}

/**
 *  Interface for `MagicTimer` options.
 */
export interface MagicTimerOptions {
  /**
   *  Timer interval in milliseconds. Since the tasks run on ticks instead of
   *  millisecond intervals; this value operates as the base resolution for
   *  all tasks. If you are running heavy tasks, lower interval requires
   *  higher CPU power. This value can be updated any time by setting the
   *  `interval` property on the `MagicTimer` instance. Default: `1000`
   *  (milliseconds)
   *  @type {number}
   */
  interval?: number
  /**
   *  Specifies whether the timer should auto-adjust the delay between ticks
   *  if it's off due to task/CPU loads or clock-drifts. Note that precision
   *  will be as high as possible but it still can be off by a few
   *  milliseconds; depending on the CPU. Default: `true`
   *  @type {Boolean}
   */
  precision?: boolean
}

/**
 *  Interface for time information for the latest run of the timer.
 */
export interface MagicTimerEvent {
  /**
   *  Indicates the name of the event.
   *  @type {Event}
   */
  name: Event
  /**
   *  Instance of the `MagicTimer` that emitted the event.
   *  @type {MagicTimer}
   */
  timer: MagicTimer
}

/**
 *  Stores time information for a timer.
 */
export interface TimeInfo {
  /**
   *  Indicates the start time of a timer.
   *  @type {number}
   */
  started: number
  /**
   *  Indicates the stop time of a timer. (`0` if still running.)
   *  @type {number}
   */
  stopped: number
  /**
   *  Indicates the the elapsed time of a timer, in milliseconds.
   *  @type {number}
   */
  elapsed: number
}
