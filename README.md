# ⏱️ Magic Timer

Magic Timer is a simple event based timer that runs on the server as well as the browser.

## 📦 Install

```bash
# pnpm
pnpm install @maas/magic-timer

# npm
npm install @maas/magic-timer

# yarn
yarn add @maas/magic-timer
```

## 🪄 Use

```ts
import { MagicTimer } from '@maas/magic-timer'

const timer = new MagicTimer(1000)

timer.on('tick', (time) => {
  console.log(time)
})

timer.start()
```

## 🐛 Found a Bug?

If you see something that doesn't look right, [submit a bug report](https://github.com/magicasaservice/magic-timer/issues/new?assignees=&labels=bug%2Cpending+triage&template=bug_report.yml).

> See it. Say it. Sorted.
