import { MagicTimer } from './../src'

// Create a new timer that ticks every second
const timer = new MagicTimer(1000)

// Listen to events

// "start" event is emitted when timer is started
timer.on('start', () => {
  console.log(`Timer started at ${new Date(timer.time.started)}`)
})

// "stop" event is emitted when timer is stopped
timer.on('stop', () => {
  console.log(`Timer stopped at ${new Date(timer.time.stopped)}`)
})

// "tick" event is emitted when timer ticks
timer.on('tick', (event) => {
  console.log(`Timer ticked ${event.timer.tickCount} times`)
  if (timer.tickCount % 5 === 0) {
    timer.stop()
    timer.reset()
    timer.nextTick(() => {
      timer.start()
    })
  }
})

// start the timer
timer.start()
