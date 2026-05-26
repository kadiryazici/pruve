import { button, component, div, Fragment, mount, signal, type PruveChildren } from "pruve"

type ButtonProps = {
  count: number
  onSetCount: (count: number) => void
}

type PanelProps = {
  children: PruveChildren
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

  console.log("[SETUP] App")

  return () => {
    console.log("[RENDER] App", {
      count: count.value
    })

    return Fragment().children(
      Panel().children([
        MyButton()
          .count(count.value)
          .onSetCount((newCount) => {
            count.set(newCount)
          }),
        div().children(`Current Count: ${count.value}`)
      ])
    )
  }
})

mount(App, document.getElementById("app")!)
