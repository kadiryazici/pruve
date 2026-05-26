import { button, component, div, Fragment, mount, signal, type PruveChildren } from "pruve"

type ButtonProps = {
  count: number
  onSetCount: (count: number) => void
}

type PanelProps = {
  children: PruveChildren
}

type BatchProbeProps = {
  first: number
  second: number
  note?: string
}

const Panel = component((props: PanelProps) => {
  console.log("[SETUP] Panel")

  return () => {
    console.log("[RENDER] Panel")

    return div()
      .style("border:1px solid #bbb;padding:12px;display:inline-flex;gap:8px")
      .children(props.children)
  }
})

const BatchProbe = component((props: BatchProbeProps) => {
  let renderCount = 0

  console.log("[SETUP] BatchProbe")

  return () => {
    renderCount++

    console.log("[RENDER] BatchProbe", {
      renderCount,
      first: props.first,
      second: props.second,
      note: props.note
    })

    return div().children(
      `BatchProbe render=${renderCount}, first=${props.first}, second=${props.second}, note=${props.note ?? "(removed)"}`
    )
  }
})

const MyButton = component((props: ButtonProps) => {
  const innerCount = signal(0)

  console.log("[SETUP] MyButton")

  return () => {
    console.log("[RENDER] MyButton", {
      innerCount: innerCount.value,
      outerCount: props.count
    })

    return div()
      .children([
        button()
          .children(`Inner Count: ${innerCount.value}`)
          .onClick(() => {
            innerCount.set(innerCount.value + 1)
          }),
        button()
          .children(`Outer Count: ${props.count}`)
          .onClick(() => {
            props.onSetCount(props.count + 1)
          })
      ])
  }
})

const App = component(() => {
  const count = signal(0)
  const probeStep = signal(0)

  console.log("[SETUP] App")

  return () => {
    console.log("[RENDER] App", {
      count: count.value,
      probeStep: probeStep.value
    })

    const probe = BatchProbe()
      .first(probeStep.value)
      .second(probeStep.value * 10)

    return Fragment().children(
      Panel().children([
        MyButton()
          .count(count.value)
          .onSetCount((newCount) => {
            count.set(newCount)
          }),
        div().children(`Current Count: ${count.value}`),
        button()
          .children("Update BatchProbe props")
          .onClick(() => {
            probeStep.set(probeStep.value + 1)
          }),
        probeStep.value % 2 === 0
          ? probe.note("present on even steps")
          : probe
      ])
    )
  }
})

mount(App, document.getElementById("app")!)
