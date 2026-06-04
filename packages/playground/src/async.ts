import "./lib.css"

import { clsx, type ClassValue } from "clsx"
import {
  batch,
  component,
  createLoader,
  mount,
  signal,
  view,
} from "pruvejs"
import {
  button,
  div,
  h1,
  h2,
  main,
  p,
  section,
  span,
} from "pruvejs/builtin"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type RequestName = "featured" | "new-arrivals" | "error"

type Product = {
  id: number
  name: string
  description: string
  price: number
}

type ProductsProps = {
  request: RequestName
  loadId: number
}

const catalogs: Record<Exclude<RequestName, "error">, Product[]> = {
  featured: [
    {
      id: 1,
      name: "Arc Lamp",
      description: "Warm light for an unhurried desk.",
      price: 89,
    },
    {
      id: 2,
      name: "Canvas Tote",
      description: "A quiet everyday carry-all.",
      price: 42,
    },
    {
      id: 3,
      name: "Ceramic Cup",
      description: "Hand-finished stoneware.",
      price: 28,
    },
  ],
  "new-arrivals": [
    {
      id: 4,
      name: "Halo Headphones",
      description: "Comfortable listening with quiet mode.",
      price: 219,
    },
    {
      id: 5,
      name: "Travel Folio",
      description: "Organized storage for short trips.",
      price: 76,
    },
    {
      id: 6,
      name: "Glass Carafe",
      description: "Simple tableware for slow mornings.",
      price: 54,
    },
  ],
}

function wait(duration: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, duration)

    signal.addEventListener("abort", () => {
      clearTimeout(timeout)
      reject(signal.reason)
      console.log("[LOADER] aborted")
    }, { once: true })
  })
}

const ProductsLoader = createLoader<ProductsProps, Product[]>(async (props, signal) => {
  console.log("[LOADER] start", props.request, props.loadId)
  await wait(800, signal)

  if (props.request === "error") {
    throw new Error("The catalog endpoint rejected this request.")
  }

  console.log("[LOADER] resolved", props.request, props.loadId)
  return catalogs[props.request]
})

const ProductsPending = view<ProductsProps>((props) => (
  div()
    .className(cn("rounded-2xl border border-indigo-100 bg-indigo-50 p-6"))
    .children([
      p()
        .className(cn("text-sm font-medium text-indigo-700"))
        .children(`Loading "${props.request}" request #${props.loadId}...`),
      p()
        .className(cn("mt-2 text-sm text-slate-500"))
        .children("Pending UI is rendered by the loader boundary.")
    ])
))

const ProductsError = (error: unknown, loadId: number) => (
  div()
    .className(cn("rounded-2xl border border-rose-200 bg-rose-50 p-6"))
    .children([
      p()
        .className(cn("text-sm font-semibold text-rose-700"))
        .children(`Request #${loadId} failed`),
      p()
        .className(cn("mt-2 text-sm text-rose-600"))
        .children(error instanceof Error ? error.message : String(error))
    ])
)

const ProductCard = component<{ product: Product }>((props) => {
  return () => (
    div()
      .className(cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"))
      .children([
        h2()
          .className(cn("text-base font-semibold text-slate-900"))
          .children(props.product.name),
        p()
          .className(cn("mt-2 text-sm text-slate-500"))
          .children(props.product.description),
        span()
          .className(cn("mt-5 block text-sm font-semibold text-slate-800"))
          .children(`$${props.product.price}`)
      ])
  )
})

const Products = component<ProductsProps>((props) => {
  const products = ProductsLoader.inject()

  console.log("[SETUP] Products", props.request, props.loadId, products)

  return () => (
    div()
      .children([
        p()
          .className(cn("mb-4 text-sm font-medium text-emerald-700"))
          .children(`Resolved "${props.request}" request #${props.loadId}`),
        div()
          .className(cn("grid gap-4 sm:grid-cols-3"))
          .children(
            products.map((product) => (
              ProductCard()
                .key(product.id)
                .product(product)
            ))
          )
      ])
  )
})

const TestView = view(() => (
  h2()
    .className(cn("text-lg font-medium text-slate-900"))
    .children("This is a test view")
))

const App = component(() => {
  const request = signal<RequestName>("featured")
  const loadId = signal(1)

  const load = (nextRequest: RequestName) => {
    batch(() => {
      request.set(nextRequest)
      loadId.set(loadId.value + 1)
    })
  }

  return () => (
    main()
      .className(cn("min-h-screen bg-slate-50 p-8"))
      .children([
        TestView(),
        div()
          .className(cn("mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"))
          .children([
            h1()
              .className(cn("text-3xl font-semibold tracking-tight text-slate-950"))
              .children("Loader playground"),
            p()
              .className(cn("mt-3 max-w-2xl text-sm leading-6 text-slate-600"))
              .children("Each button mounts a fresh single-load boundary with request props. The loaded component reads its result with ProductsLoader.inject()."),
            div()
              .className(cn("mt-7 flex flex-wrap gap-3"))
              .children([
                button()
                  .className(cn("rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"))
                  .onClick(() => load("featured"))
                  .children("Load featured"),
                button()
                  .className(cn("rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"))
                  .onClick(() => load("new-arrivals"))
                  .children("Load new arrivals"),
                button()
                  .className(cn("rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700"))
                  .onClick(() => load("error"))
                  .children("Load error")
              ]),
            section()
              .className(cn("mt-8"))
              .children(
                ProductsLoader()
                  .key(loadId.value)
                  .request(request.value)
                  .loadId(loadId.value)
                  .pending(
                    ProductsPending()
                      .request(request.value)
                      .loadId(loadId.value)
                  )
                  .catch((error) => ProductsError(error, loadId.value))
                  .render(() => (
                    Products()
                      .request(request.value)
                      .loadId(loadId.value)
                  ))
              )
          ])
      ])
  )
})

const root = document.getElementById("app")

if (root != null) {
  mount(App, root)
}
