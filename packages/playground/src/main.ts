import { button, component, div, signal } from "pruve"

type ButtonProps = {
  variant: "primary" | "secondary"
}

const MyButton = component<ButtonProps>((props) => {
  const count = signal(0)

  return () => (
    button()
      .className(`btn-${props.variant}`)
      .onClick(() => {
        count.set(count.value + 1)
      })
      .children(`Clicked ${count.value} times!`)
  )
})

export const App = component(() => {
  return () => (
    div()
      .id("app")
      .children([
        div()
          .children("Hello, Pruve!"),

        MyButton()
          .variant("primary")
      ])
  )
})