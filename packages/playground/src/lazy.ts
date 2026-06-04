import "./lib.css"

import { batch, component, lazy, mount, signal, type PruveChildren } from "pruvejs"
import {
  button,
  div,
  h1,
  p,
  section,
} from "pruvejs/builtin"

function wait(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

const LazyProductPanel = lazy(async () => {
  console.log("[LAZY] importing ProductPanel module")
  await wait(900)
  return import("./lazy/ProductPanel.ts").then(m => m.ProductPanel)
})

const App = component(() => {
  const productId = signal(42)
  const loadKey = signal(1)
  const variant = signal<"compact" | "expanded">("expanded")
  const mounted = signal(true)

  const loadNext = () => {
    batch(() => {
      productId.set(productId.value + 1)
      loadKey.set(loadKey.value + 1)
      mounted.set(true)
    })
  }

  return () => (
    div()
      .className("min-h-screen bg-slate-50 p-8 text-slate-950")
      .children([
        mainPanel([
          h1()
            .className("text-3xl font-semibold tracking-tight")
            .children("Lazy component playground"),
          p()
            .className("mt-3 max-w-2xl text-sm leading-6 text-slate-600")
            .children("The panel below is imported through lazy(), but it is used with the same fluent builder API as any other component."),
          div()
            .className("mt-7 flex flex-wrap gap-3")
            .children([
              button()
                .className("rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white")
                .onClick(loadNext)
                .children("Load next product"),
              button()
                .className("rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700")
                .onClick(() => mounted.set(!mounted.value))
                .children(mounted.value ? "Unmount panel" : "Mount panel"),
              button()
                .className("rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700")
                .onClick(() => {
                  variant.set(variant.value === "expanded" ? "compact" : "expanded")
                })
                .children(`Variant: ${variant.value}`)
            ]),
          section()
            .className("mt-8 min-h-44")
            .children(
              mounted.value
                ? LazyProductPanel()
                  .key(loadKey.value)
                  .productId(productId.value)
                  .variant(variant.value)
                : div()
                  .className("rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500")
                  .children("Lazy panel is unmounted.")
            )
        ])
      ])
  )
})

function mainPanel(children: PruveChildren[]) {
  return div()
    .className("mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm")
    .children(children)
}

const root = document.getElementById("app")

if (root != null) {
  mount(App, root)
}
