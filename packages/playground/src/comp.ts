import { button, component, div, Fragment, signal } from "pruve"

type ButtonProps = {
  count: number
  onSetCount: (count: number) => void
}

const MyButton = component((props: ButtonProps) => {
  const innerCount = signal(0)

  return () => (
    div()
      .children([
        button()
          .children(`Inner Count: ${innerCount.value}`),
        button()
          .children(`Outer Count: ${props.count}`)
          .onClick(() => {
            props.onSetCount(props.count + 1)
          })
      ])
  )
})

