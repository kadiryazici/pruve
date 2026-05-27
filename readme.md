# Pruve (WIP)

Pruve is an TypeScript UI framework built on Preact rendering and
Vue-powered fine-grained reactivity. It combines:

- Fluent, SwiftUI-like element builders.
- Setup-once components with signal-driven rerenders.
- Typed required props checked through the builder API.
- Lifecycle hooks, provide/inject context, and async loader boundaries.

This repository is under active development. The public API is still evolving.

## Example

```ts
import { component, mount, signal } from "pruvejs"
import { button, div, h1 } from "pruvejs/builtin"

const Counter = component(() => {
  const count = signal(0)

  return () => (
    div()
      .className("space-y-3")
      .children([
        h1()
          .children(`Count: ${count.value}`),
        button()
          .onClick(() => count.set(count.value + 1))
          .children("Increment")
      ])
  )
})

mount(Counter, document.getElementById("app")!)
```

## Builder Syntax

Pruve templates are ordinary TypeScript expressions using chained setters:

```ts
div()
  .className("card")
  .children([
    h1()
      .children("Products"),
    button()
      .disabled(false)
      .children("Buy")
  ])
```

Components use the same pattern. Required component props must be provided
before the node can be rendered:

```ts
type ProductCardProps = {
  name: string
  price: number
}

const ProductCard = view<ProductCardProps>((props) => (
  div()
    .children(`${props.name}: $${props.price}`)
))

ProductCard()
  .name("Arc Lamp")
  .price(89)
```

Use `.key(value)` for keyed identity and `.with(props)` when passing a props
object.

## Component Styles

Pruve has three useful ways to reuse UI.

### `component()`

Use `component()` when the component owns state, effects, lifecycle hooks,
context, or setup work that should run once per mounted instance.

```ts
const Toggle = component(() => {
  const active = signal(false)

  return () => (
    button()
      .onClick(() => active.set(!active.value))
      .children(active.value ? "On" : "Off")
  )
})
```

### `view()`

Use `view()` for an encapsulated component that renders from props without a
user-authored setup function.

```ts
const Badge = view<{ label: string }>((props) => (
  span()
    .className("badge")
    .children(props.label)
))
```

A view owns its internal markup. Calling `Badge().label("New")` passes an
input to the view instead of exposing its internal `span()` for mutation.

### Builder Helpers

Use a plain function that returns a builder when callers should be allowed to
continue configuring that native element.

```ts
const Panel = () => (
  div()
    .className("panel")
)

Panel()
  .className("custom-panel")
  .children("Caller-controlled content")
```

In short: `component()` owns behavior, `view()` owns prop-driven markup, and
a builder helper provides a customizable starting element.

## Reactivity

Pruve tracks signal and reactive prop reads performed during component render.
An update rerenders only components that consumed the changed value.

```ts
import { batch, computed, signal } from "pruvejs"

const first = signal("Pruve")
const last = signal("Store")
const title = computed(() => `${first.value} ${last.value}`)

batch(() => {
  first.set("New")
  last.set("Catalog")
})
```

Available reactivity APIs include:

- `signal()`
- `computed()`
- `batch()`
- `useEffect()` and `useUpdateEffect()`
- `pickProps()` for reactive prop selection and defaults

## Context

`createContext()` creates a typed provide/inject handle. A provider applies to
descendant component setup; provide signals or other reactive objects for live
updates.

```ts
import { component, createContext, signal, type WritableSignal } from "pruvejs"
import { p } from "pruvejs/builtin"

const Theme = createContext<WritableSignal<string>>()

const ThemeText = component(() => {
  const theme = Theme.inject()!

  return () => (
    p()
      .children(`Theme: ${theme.value}`)
  )
})

const App = component(() => {
  const theme = signal("light")
  Theme.provide(theme)

  return () => ThemeText()
})
```

Nested providers override their ancestors for descendants. Separate mounted
Pruve applications keep separate provider trees.

## Loaders

Loaders are explicit async boundaries. A loader renders pending or error
content until its request resolves, then mounts a normal Pruve component.
Loader callbacks receive an `AbortSignal` that is aborted when their boundary
is unmounted.

```ts
import { createLoader, useLoaderData, view } from "pruvejs"
import { div, p } from "pruvejs/builtin"

type ProductsProps = {
  category: string
}

type Product = {
  id: number
  name: string
}

const ProductsLoader = createLoader<Product[], ProductsProps>({
  loader: async (props, signal) => {
    const response = await fetch(`/api/products?category=${props.category}`, {
      signal
    })

    return response.json()
  },

  pendingView: view<ProductsProps>((props) => (
    p()
      .children(`Loading ${props.category}...`)
  )),

  errorView: (error) => (
    p()
      .children(error instanceof Error ? error.message : "Failed to load")
  )
})

const Products = ProductsLoader.component(() => {
  const products = useLoaderData(ProductsLoader)

  return () => (
    div()
      .children(products.map((product) => (
        p()
          .key(product.id)
          .children(product.name)
      )))
  )
})
```

A loader loads once per mounted boundary. To request new data, render a new
keyed instance:

```ts
Products()
  .key(category.value)
  .category(category.value)
```

## Lifecycles And Effects

Hooks are called during `component()` setup.

| API | Purpose |
| --- | --- |
| `onMount(fn)` | Runs when the mounted DOM is committed |
| `onUnmount(fn)` | Runs when the component scope is disposed |
| `usePreUpdate(fn)` | Runs before a reactive component DOM update |
| `useLayoutUpdate(fn)` | Runs after DOM updates, excluding the first layout commit |
| `useLayoutEffect(fn)` | Tracks reactive reads and runs after layout is available |
| `useUpdateLayoutEffect(fn, deps)` | Runs after layout when selected dependencies update |

## Project Status

Implemented today:

- Fluent intrinsic element and component builders.
- Setup components and prop-only views.
- Fine-grained signal-based rerendering.
- Reactive shallow component props and batching.
- Lifecycle and layout-effect APIs.
- Typed provide/inject context.
- Single-load async boundaries with abort support.

Still expected to evolve:

- Error handling and developer diagnostics.
- Runtime test coverage.
- Additional application-level integrations.

## Workspace

The repository is a pnpm workspace:

| Package | Purpose |
| --- | --- |
| `pruvejs` | Public entry point for core and reactivity APIs |
| `pruvejs/builtin` | Native element builder exports such as `div()` and `button()` |
| `@pruve/core` | Private workspace component, renderer, context, and loader runtime |
| `@pruve/reactivity` | Private workspace signals, effects, and batching runtime |
| `@pruve/playground` | Interactive examples |

Run the playground:

```sh
pnpm install
pnpm --filter @pruve/playground dev
```

The currently mounted playground example is the loader demo in
`packages/playground/src/async.ts`.
