# Pruve (WIP)

Pruve is a TypeScript UI framework built on Preact rendering and
Vue-powered fine-grained reactivity. It combines:

- Fluent, SwiftUI-like element builders.
- Setup-once components with signal-driven rerenders.
- Typed required props checked through the builder API.
- Lifecycle hooks, provide/inject context, and async loader boundaries.

This repository is under active development. The public API is still evolving.

## Install

```sh
npm install pruvejs
```

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

## Effects

Use `useEffect()` when the effect should run immediately and automatically
track the reactive values it reads:

```ts
import { component, onEffectCleanup, signal, useEffect } from "pruvejs"

const SearchController = component(() => {
  const query = signal("")

  useEffect(() => {
    const controller = new AbortController()

    fetch(`/api/search?q=${query.value}`, {
      signal: controller.signal,
    })

    onEffectCleanup(() => {
      controller.abort()
    })
  })

  return () => null
})
```

`useEffect()` reruns whenever `query.value` changes. Its cleanup runs before
the next effect execution and when the component scope is disposed.

Use `useUpdateEffect()` when an effect should skip initial execution and run
only after selected dependencies update:

```ts
import { component, signal, useUpdateEffect } from "pruvejs"

const Pagination = component(() => {
  const page = signal(1)
  const sort = signal("popular")

  useUpdateEffect(
    () => {
      console.log("page changed:", page.value)
    },
    page,
  )

  useUpdateEffect(
    () => {
      console.log("page or sort changed:", page.value, sort.value)
    },
    [page, sort],
  )

  return () => null
})
```

The `deps` argument of `useUpdateEffect(fn, deps)` accepts:

- A signal: `useUpdateEffect(fn, count)`
- An array of signals: `useUpdateEffect(fn, [first, second])`
- A tracker function that reads reactive values: `useUpdateEffect(fn, () => state.value)`
- A tracker function that reads multiple values: `useUpdateEffect(fn, () => [state.value, other.value])`

Tracker functions are useful for reactive component props:

```ts
type ProductProps = {
  value: string
  otherValue: number
}

const Product = component((props: ProductProps) => {
  useUpdateEffect(
    () => {
      console.log("value changed:", props.value)
    },
    () => props.value,
  )

  useUpdateEffect(
    () => {
      console.log("product inputs changed:", props.value, props.otherValue)
    },
    () => [props.value, props.otherValue],
  )

  return () => null
})
```

The tracker function establishes dependencies by reading reactive values; its
returned value is only a convenient way to express those reads.

## Props And Defaults

Component props are shallow-reactive. Read the props that a component owns
instead of broadly forwarding every incoming value.

Use `pickProps()` during setup to explicitly select props as signals and provide defaults:

```ts
import { component, pickProps } from "pruvejs"
import { button } from "pruvejs/builtin"

type ActionButtonProps = {
  label?: string
  disabled?: boolean
}

const ActionButton = component((props: ActionButtonProps) => {
  const { label, disabled } = pickProps(props)
    .label("Continue")
    .disabled() // No default given, only picked
    .pick()

  return () => (
    button()
      .disabled(disabled.value)
      .children(label.value)
  )
})
```

### Accessing rest of props:

Use `.pickRest()` to access the rest of the props as a reactive object. This is useful for forwarding props to a child component or native element without
explicitly picking each one.

```ts
const MyButton = component((props: ComponentProps<"button">) => {
  const { className, rest } = pickProps(props)
    .className()
    .pickRest()

  useEffect(() => {
    console.log("Disabled:", rest.disabled)
  })

  return () => (
    button()
      .with(rest)
      .className(`${className.value} my-btn`)
  )
})
```

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


## Lifecycles And Layout Effects

Hooks are called during `component()` setup.

```ts
import {
  component,
  signal,
  useLayoutEffect,
  useLayoutUpdate,
  useMount,
  usePreUpdate,
  useUnmount,
  useUpdateLayoutEffect,
} from "pruvejs"
import { button } from "pruvejs/builtin"

const LifecycleProbe = component(() => {
  const count = signal(0)

  useMount(() => {
    console.log("mounted with committed DOM")
  })

  useUnmount(() => {
    console.log("component scope disposed")
  })

  usePreUpdate(() => {
    console.log("before DOM update")
  })

  useLayoutUpdate(() => {
    console.log("after an updated DOM commit")
  })

  useLayoutEffect(() => {
    console.log("layout effect count:", count.value)
  })

  useUpdateLayoutEffect(
    () => {
      console.log("count commit:", count.value)
    },
    count,
  )

  return () => (
    button()
      .onClick(() => count.set(count.value + 1))
      .children(`Count: ${count.value}`)
  )
})
```

| API | Purpose |
| --- | --- |
| `useMount(fn)` | Runs when the mounted DOM is committed |
| `useUnmount(fn)` | Runs when the component scope is disposed |
| `usePreUpdate(fn)` | Runs before a reactive component DOM update |
| `useLayoutUpdate(fn)` | Runs after DOM updates, excluding the first layout commit |
| `useLayoutEffect(fn)` | Tracks reactive reads and runs after layout is available |
| `useUpdateLayoutEffect(fn, deps)` | Runs after layout when selected dependencies update |

Use regular effects for reactive work that does not need committed DOM. Use
layout effects when a callback needs to observe or measure rendered DOM.

## Loaders

Loaders are explicit async boundaries. A loader renders pending or error
content until its request resolves, then renders the resolved view. Loader
callbacks receive an `AbortSignal` that is aborted when their boundary is
unmounted.

```ts
import { component, createLoader, view } from "pruvejs"
import { div, p } from "pruvejs/builtin"

type ProductsProps = {
  category: string
}

type Product = {
  id: number
  name: string
}

const ProductsLoader = createLoader(async (props: ProductsProps, signal) => {
  const response = await fetch(`/api/products?category=${props.category}`, {
    signal
  })

  return response.json() as Promise<Product[]>
})

const PendingProducts = view<ProductsProps>((props) => (
  p()
    .children(`Loading ${props.category}...`)
))

const ProductList = component(() => {
  const products = ProductsLoader.inject()

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

Use loaders like components. Provide request props, pending/error views, and
the resolved render callback through the builder:

```ts
ProductsLoader()
  .category(category.value)
  .pending(PendingProducts().category(category.value))
  .catch((error) => (
    p()
      .children(error instanceof Error ? error.message : "Failed to load")
  ))
  .render(() => ProductList())
```

The resolved data is passed to `.render(data => ...)` and is also available
to descendant component setup through `ProductsLoader.inject()`.

```ts
ProductsLoader()
  .category(category.value)
  .pending(PendingProducts().category(category.value))
  .catch((error) => (
    p()
      .children(error instanceof Error ? error.message : "Failed to load")
  ))
  .render((products) => (
    div()
      .children(products.map((product) => (
        p()
          .key(product.id)
          .children(product.name)
      )))
  ))
```

A loader loads once per mounted boundary. To request new data, render a new
keyed instance:

```ts
ProductsLoader()
  .key(category.value)
  .category(category.value)
  .pending(PendingProducts().category(category.value))
  .catch((error) => (
    p()
      .children(error instanceof Error ? error.message : "Failed to load")
  ))
  .render(() => ProductList())
```

If you prefer to provide props as a type argument, pass the loaded data type
as the second argument:

```ts
const ProductsLoader = createLoader<ProductsProps, Product[]>(
  async (props, signal) => {
    const response = await fetch(`/api/products?category=${props.category}`, {
      signal
    })

    return response.json()
  }
)
```


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
