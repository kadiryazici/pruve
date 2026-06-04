import {
  component,
  mount,
  onEffectCleanup,
  signal,
  useEffect,
  useLayoutEffect,
  useLayoutUpdate,
  useMount,
  usePreUpdate,
  useUnmount,
  useUpdateEffect,
  useUpdateLayoutEffect
} from "pruvejs"
import {
  button,
  div,
  h1,
  p,
} from "pruvejs/builtin"

let logId = 0
let isRunning = false

function log(message: string): void {
  console.log(`[TEST ${++logId}] ${message}`)
}

function wait(ms = 160): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function readProbeDom(): string {
  return document.getElementById("probe-dom-value")?.textContent ?? "(probe is not mounted)"
}

async function click(id: string, label: string): Promise<void> {
  log(`[ACTION] ${label}`)
  document.getElementById(id)?.click()
  await wait()
  log(`[AFTER ACTION] ${label} | page DOM: ${readProbeDom()}`)
}

const LifecycleProbe = component(() => {
  const domValue = signal(0)
  const effectOnlyValue = signal(0)

  const hook = (name: string, values = ""): void => {
    log(`[HOOK] ${name}${values} | observed DOM: ${readProbeDom()}`)
  }

  useMount(() => {
    hook("useMount")
  })

  useUnmount(() => {
    hook("useUnmount")
  })

  usePreUpdate(() => {
    hook("usePreUpdate")
  })

  useLayoutUpdate(() => {
    hook("useLayoutUpdate")
  })

  useEffect(() => {
    const value = domValue.value
    log(`[EFFECT] useEffect | domValue=${value}`)

    onEffectCleanup(() => {
      log(`[CLEANUP] useEffect | prior domValue=${value}`)
    })
  })

  useUpdateEffect(() => {
    const value = effectOnlyValue.value
    log(`[EFFECT] useUpdateEffect | effectOnlyValue=${value}`)

    onEffectCleanup(() => {
      log(`[CLEANUP] useUpdateEffect | prior effectOnlyValue=${value}`)
    })
  }, effectOnlyValue)

  useLayoutEffect(() => {
    const value = domValue.value
    hook("useLayoutEffect", ` | domValue=${value}`)

    onEffectCleanup(() => {
      log(`[CLEANUP] useLayoutEffect | prior domValue=${value}`)
    })
  })

  useUpdateLayoutEffect(() => {
    const dom = domValue.value
    const effectOnly = effectOnlyValue.value
    hook("useUpdateLayoutEffect", ` | domValue=${dom}, effectOnlyValue=${effectOnly}`)

    onEffectCleanup(() => {
      log(`[CLEANUP] useUpdateLayoutEffect | prior domValue=${dom}, effectOnlyValue=${effectOnly}`)
    })
  }, () => {
    domValue.value
    effectOnlyValue.value
  })

  return () => {
    log(`[RENDER] LifecycleProbe | domValue=${domValue.value}`)

    return div()
      .style("padding:12px;border:1px dashed #64748b;display:flex;flex-direction:column;gap:10px")
      .children([
        div()
          .id("probe-dom-value")
          .style("font-weight:bold")
          .children(`DOM value: ${domValue.value}`),
        p().children("The effect-only value is tracked by the layout effect, but is not rendered into this component."),
        div()
          .style("display:flex;gap:8px;flex-wrap:wrap")
          .children([
            button()
              .id("probe-update-dom")
              .children("Manually update DOM dependency")
              .onClick(() => {
                domValue.set(domValue.value + 1)
              }),
            button()
              .id("probe-update-effect-only")
              .children("Manually update effect-only dependency")
              .onClick(() => {
                effectOnlyValue.set(effectOnlyValue.value + 1)
              })
          ])
      ])
  }
})

async function runSuite(): Promise<void> {
  if (isRunning) {
    return
  }

  isRunning = true
  logId = 0
  console.clear()

  log("BEGIN automated lifecycle suite")
  log("Each action waits briefly to simulate separate human clicks.")

  await click("toggle-probe", "unmount existing probe and collect useUnmount")
  await click("toggle-probe", "mount a fresh probe")
  await click("probe-update-dom", "update rendered dependency from 0 to 1")
  await click("probe-update-dom", "update rendered dependency from 1 to 2")
  await click("probe-update-effect-only", "update dependency without a DOM render")
  await click("toggle-probe", "unmount probe after updates")
  await click("toggle-probe", "remount probe with fresh local state")
  await click("probe-update-dom", "update freshly mounted probe from 0 to 1")

  log("END automated lifecycle suite - send this console output back for review.")
  isRunning = false
}

const App = component(() => {
  const showProbe = signal(true)

  return () => {
    return div()
      .style("font-family:system-ui;max-width:820px;margin:24px auto;display:flex;flex-direction:column;gap:14px")
      .children([
        h1()
          .children("Pruve lifecycle visual test suite"),
        p()
          .children("Open DevTools Console, click Run automated suite once, then send the resulting [TEST] lines."),
        div()
          .style("display:flex;gap:8px;flex-wrap:wrap")
          .children([
            button()
              .id("run-suite")
              .children("Run automated suite")
              .onClick(() => {
                void runSuite()
              }),
            button()
              .id("toggle-probe")
              .children(showProbe.value ? "Manually unmount probe" : "Manually mount probe")
              .onClick(() => {
                showProbe.set(!showProbe.value)
              })
          ]),
        showProbe.value
          ? LifecycleProbe()
          : div()
            .style("padding:12px;border:1px dashed #64748b")
            .children("Probe is currently unmounted.")
      ])
  }
})

mount(App, document.getElementById("app")!)
