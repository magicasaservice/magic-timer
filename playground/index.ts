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

// "pause" event is emitted when timer is paused
timer.on('pause', () => {
  console.log(`Timer paused`)
})

// "resume" event is emitted when timer is resumed
timer.on('resume', () => {
  console.log(`Timer resumed`)
})

// "tick" event is emitted when timer ticks
timer.on('tick', (event) => {
  console.log(`Tick count: ${timer.tickCount}`)
  if (timer.tickCount === 5) {
    timer.pause()
    console.log('…waiting for 3 seconds before resuming')
    setTimeout(() => {
      console.log('…changing timer interval to 60 seconds and resuming')
      timer.interval = 60
      timer.resume()
    }, 3000)
  }
})

// start the timer
timer.start()
