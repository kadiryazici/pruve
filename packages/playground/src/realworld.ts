import "./lib.css"

import { clsx, type ClassValue } from "clsx"
import {
  component,
  computed,
  createContext,
  mount,
  useMount,
  pickProps,
  signal,
  type WritableSignal,
} from "pruvejs"
import {
  a,
  button,
  div,
  footer,
  Fragment,
  h1,
  h2,
  h3,
  header,
  input,
  li,
  main,
  nav,
  p,
  section,
  span,
  ul,
} from "pruvejs/builtin"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Route = "discover" | "saved" | "cart"
type Category = "All" | "Workspace" | "Travel" | "Audio" | "Home"

type Product = {
  id: number
  name: string
  category: Exclude<Category, "All">
  price: number
  formerPrice?: number
  description: string
  accent: string
  badge: string
}

const products: Product[] = [
  {
    id: 1,
    name: "Arc Desk Lamp",
    category: "Workspace",
    price: 89,
    formerPrice: 120,
    description: "Warm dimmable light with a clean aluminum finish.",
    accent: "from-amber-100 to-orange-200",
    badge: "Popular",
  },
  {
    id: 2,
    name: "Transit Weekender",
    category: "Travel",
    price: 146,
    description: "Carry-on sized bag with modular inner pockets.",
    accent: "from-emerald-100 to-teal-200",
    badge: "New",
  },
  {
    id: 3,
    name: "Halo Headphones",
    category: "Audio",
    price: 219,
    formerPrice: 265,
    description: "Wireless sound with all-day comfort and quiet mode.",
    accent: "from-indigo-100 to-violet-200",
    badge: "Sale",
  },
  {
    id: 4,
    name: "Stoneware Set",
    category: "Home",
    price: 64,
    description: "Hand-finished plates for unhurried dinners.",
    accent: "from-rose-100 to-pink-200",
    badge: "Limited",
  },
  {
    id: 5,
    name: "Focus Keyboard",
    category: "Workspace",
    price: 132,
    description: "Low-profile mechanical keys with tactile switches.",
    accent: "from-sky-100 to-cyan-200",
    badge: "Editor pick",
  },
  {
    id: 6,
    name: "Pocket Speaker",
    category: "Audio",
    price: 74,
    description: "Small waterproof speaker made for weekend trips.",
    accent: "from-lime-100 to-green-200",
    badge: "New",
  },
]

const categories: Category[] = ["All", "Workspace", "Travel", "Audio", "Home"]

type NavbarProps = {
  onNavigate: (route: Route) => void
}

const AppContext = createContext<{
  route: WritableSignal<Route>
  cart: WritableSignal<Map<number, number>>
  saved: WritableSignal<Set<number>>
}>()

const Navbar = component<NavbarProps>((props) => {
  const { route, cart, saved } = AppContext.inject()!

  const routes = computed(() => ([
    { name: "Discover", route: "discover" },
    { name: `Saved (${saved.value.size})`, route: "saved" },
    { name: `Cart (${cart.value.size})`, route: "cart" },
  ]) satisfies { name: string, route: Route }[])

  return () => (
    header()
      .className("sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur")
      .children(
        nav()
          .className("mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4")
          .children([
            div()
              .className("flex items-center gap-3")
              .children([
                div()
                  .className("flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white")
                  .children("P"),
                div()
                  .children([
                    p()
                      .className("text-base font-semibold text-slate-950")
                      .children("Pruve Store"),
                    p()
                      .className("text-xs text-slate-500")
                      .children("Thoughtful essentials"),
                  ]),
              ]),
            div()
              .className("hidden items-center gap-2 md:flex")
              .children([
                routes.value.map((item) => (
                  button()
                    .className(cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      route.value === item.route
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                    ))
                    .onClick(() => props.onNavigate(item.route))
                    .children(item.name)
                )),
              ]),
            button()
              .className("rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white md:hidden")
              .onClick(() => props.onNavigate("cart"))
              .children(`Cart (${cart.value.size})`),
          ]),
      )
  )
})

type MetricProps = {
  value: string
  label: string
}

const Metric = component<MetricProps>((props) => {
  const el = signal<HTMLDivElement | null>(null)

  useMount(() => {
    console.log("Metric mounted with el:", el.value)
  })

  return () => (
    div()
      .ref(el)
      .className("rounded-2xl border border-white/10 bg-white/10 p-4")
      .children([
        p()
          .className("text-2xl font-semibold text-white")
          .children(props.value),
        p()
          .className("mt-1 text-sm text-slate-300")
          .children(props.label),
      ])
  )
})

const Hero = component(() => {
  const metrics = [
    { value: "48h", label: "Fast delivery" },
    { value: "4.9", label: "Customer score" },
    { value: "120+", label: "New pieces" },
    { value: "Free", label: "Returns" },
  ]

  return () => (
    section()
      .className("overflow-hidden rounded-[2rem] bg-slate-950 px-7 py-9 text-white shadow-xl shadow-slate-200 md:px-12")
      .children(
        div()
          .className("grid gap-8 lg:grid-cols-[1.2fr_0.8fr]")
          .children([
            div()
              .children([
                p()
                  .className("mb-4 text-sm font-medium uppercase tracking-[0.3em] text-emerald-300")
                  .children("Spring collection"),
                h1()
                  .className("max-w-2xl text-4xl font-semibold tracking-tight md:text-6xl")
                  .children("Make everyday spaces feel intentional."),
                p()
                  .className("mt-5 max-w-xl text-base leading-7 text-slate-300")
                  .children("Curated design pieces for work, weekends and quiet evenings at home."),
                div()
                  .className("mt-8 flex gap-3")
                  .children([
                    button()
                      .className("rounded-full bg-white px-6 py-3 font-medium text-slate-950")
                      .children("Shop arrivals"),
                    button()
                      .className("rounded-full border border-white/20 px-6 py-3 font-medium text-white")
                      .children("View journal"),
                  ]),
              ]),
            div()
              .className("grid grid-cols-2 gap-3 self-end")
              .children([
                metrics.map((metric) => (
                  Metric()
                    .value(metric.value)
                    .label(metric.label)
                )),
              ]),
          ]),
      )
  )
})

type ProductCardProps = {
  product: Product
  saved: boolean
  quantity: number
}

const ProductCard = component<ProductCardProps>((props) => {
  const { saved, cart } = AppContext.inject()!

  const onToggleSaved = (id: number) => {
    const next = new Set(saved.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    saved.set(next)
  }

  const onAdd = (id: number) => {
    const next = new Map(cart.value)
    next.set(id, (next.get(id) ?? 0) + 1)
    cart.set(next)
  }

  return () => (
    articleCard()
      .children([
        div()
          .className(cn(
            "relative flex h-52 items-end rounded-2xl bg-gradient-to-br p-4",
            props.product.accent
          ))
          .children([
            span()
              .className("absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700")
              .children(props.product.badge),
            button()
              .className(cn(
                "absolute right-4 top-4 rounded-full p-2 text-lg shadow-sm transition",
                props.saved ? "bg-slate-900 text-white" : "bg-white/80 text-slate-600",
              ))
              .onClick(() => onToggleSaved(props.product.id))
              .children(props.saved ? "Saved" : "Save"),
            span()
              .className("text-5xl text-slate-900/20")
              .children(props.product.name.slice(0, 1)),
          ]),
        div()
          .className("pt-5")
          .children([
            div()
              .className("flex items-start justify-between gap-4")
              .children([
                div()
                  .children([
                    p()
                      .className("text-xs font-medium uppercase tracking-wider text-slate-400")
                      .children(props.product.category),
                    h3()
                      .className("mt-1 text-lg font-semibold text-slate-950")
                      .children(props.product.name),
                  ]),
                div()
                  .className("text-right")
                  .children([
                    p()
                      .className("font-semibold text-slate-950")
                      .children(`$${props.product.price}`),
                    props.product.formerPrice == null
                      ? null
                      : p()
                        .className("text-xs text-slate-400 line-through")
                        .children(`$${props.product.formerPrice}`),
                  ]),
              ]),
            p()
              .className("mt-3 min-h-12 text-sm leading-6 text-slate-500")
              .children(props.product.description),
            button()
              .className("mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700")
              .onClick(() => onAdd(props.product.id))
              .children(props.quantity === 0 ? "Add to cart" : `Add another - in cart: ${props.quantity}`),
          ]),
      ])
  )
})

function articleCard() {
  return div()
    .className("rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg")
}

type CartRowProps = {
  product: Product
  quantity: number
  onRemove: (id: number) => void
}

const CartRow = component<CartRowProps>((props) => {
  return () => (
    li()
      .className("flex items-center justify-between gap-4 border-b border-slate-100 py-4")
      .children([
        div()
          .children([
            p()
              .className("font-medium text-slate-950")
              .children(props.product.name),
            p()
              .className("text-sm text-slate-500")
              .children(`${props.quantity} x $${props.product.price}`),
          ]),
        div()
          .className("flex items-center gap-4")
          .children([
            p()
              .className("font-semibold text-slate-950")
              .children(`$${props.product.price * props.quantity}`),
            button()
              .className("text-sm font-medium text-rose-500 hover:text-rose-700")
              .onClick(() => props.onRemove(props.product.id))
              .children("Remove"),
          ]),
      ])
  )
})

const CartRoute = component(() => {
  const { route, cart } = AppContext.inject()!

  const subtotal = computed(() => (
    products.reduce((total, product) => (
      total + product.price * (cart.value.get(product.id) ?? 0)
    ), 0)
  ))

  const cartRows = computed(() => (
    products
      .filter((product) => cart.value.has(product.id))
      .map((product) => ({
        product,
        quantity: cart.value.get(product.id) ?? 0,
      }))
  ))

  const removeFromCart = (id: number) => {
    const next = new Map(cart.value)
    next.delete(id)
    cart.set(next)
  }

  return () => (
    section()
      .className("mx-auto max-w-3xl py-8")
      .children([
        div()
          .className("mb-8 flex items-center justify-between")
          .children([
            h2()
              .className("text-3xl font-semibold tracking-tight")
              .children("Your cart"),
            button()
              .className("text-sm font-medium text-slate-500")
              .onClick(() => route.set("discover"))
              .children("Continue shopping"),
          ]),
        cartRows.value.length === 0
          ? p()
            .className("rounded-3xl bg-white p-10 text-center text-slate-500")
            .children("Your cart is empty. Find something beautiful.")
          : div()
            .className("rounded-3xl bg-white p-6 shadow-sm")
            .children([
              ul()
                .children(cartRows.value.map((row) =>
                  CartRow()
                    .key(row.product.id)
                    .product(row.product)
                    .quantity(row.quantity)
                    .onRemove(removeFromCart),
                )),
              div()
                .className("mt-6 flex items-center justify-between border-t border-slate-200 pt-6")
                .children([
                  div()
                    .children([
                      p()
                        .className("text-sm text-slate-500")
                        .children("Subtotal"),
                      p()
                        .className("text-2xl font-semibold")
                        .children(`$${subtotal.value}`),
                    ]),
                  button()
                    .className("rounded-xl bg-emerald-500 px-7 py-3 font-medium text-white")
                    .children("Checkout"),
                ]),
            ]),
      ])
  )
})

type DiscoverRouteProps = {
  inputPlaceholder?: string
}

const DiscoverRoute = component((props: DiscoverRouteProps) => {
  const { inputPlaceholder } = pickProps(props)
    .inputPlaceholder("Search products [DEFAULT]")
    .pick()

  const { saved, cart } = AppContext.inject()!

  const category = signal<Category>("All")
  const query = signal("")

  const collectionLabel = "Store"
  const collectionTitle = "Explore products"

  const categoryTabs = computed(() => (
    categories.map((entry) => ({
      entry,
      selected: category.value === entry,
    }))
  ))

  const visibleProducts = computed(() => {
    const search = query.value.trim().toLowerCase()

    return products
      .filter((product) => {
        const categoryMatch = category.value === "All" || product.category === category.value
        const searchMatch = search === "" || `${product.name} ${product.description}`.toLowerCase().includes(search)

        return categoryMatch && searchMatch
      })
      .map((product) => ({
        product,
        saved: saved.value.has(product.id),
        quantity: cart.value.get(product.id) ?? 0,
      }))
  })

  return () => (
    Fragment()
      .children([
        Hero(),
        section()
          .className("py-10")
          .children([
            div()
              .className("mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end")
              .children([
                div()
                  .children([
                    p()
                      .className("text-sm font-medium uppercase tracking-wider text-emerald-600")
                      .children(collectionLabel),
                    h2()
                      .className("mt-2 text-3xl font-semibold tracking-tight")
                      .children(collectionTitle),
                  ]),
                input()
                  .className("w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-400 focus:ring-2 md:w-72")
                  .placeholder(inputPlaceholder.value)
                  .value(query.value)
                  .onInput((event) => query.set((event.currentTarget as HTMLInputElement).value)),
              ]),
            div()
              .className("mb-7 flex flex-wrap gap-2")
              .children(
                categoryTabs.value.map((tab) => (
                  button()
                    .key(tab.entry)
                    .className(cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      tab.selected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600",
                    ))
                    .onClick(() => category.set(tab.entry))
                    .children(tab.entry)
                )),
              ),
            visibleProducts.value.length === 0
              ? p()
                .className("rounded-3xl bg-white p-12 text-center text-slate-500")
                .children("No matching products found.")
              : div()
                .className("grid gap-6 md:grid-cols-2 lg:grid-cols-3")
                .children(
                  visibleProducts.value.map((entry) => (
                    ProductCard()
                      .key(entry.product.id)
                      .product(entry.product)
                      .saved(entry.saved)
                      .quantity(entry.quantity)
                  )),
                ),
          ])
      ])
  )
})

const SavedRoute = component(() => {
  const { saved, cart } = AppContext.inject()!
  



  const category = signal<Category>("All")
  const query = signal("")

  const categoryTabs = computed(() => (
    categories.map((entry) => ({
      entry,
      selected: category.value === entry,
    }))
  ))

  const visibleProducts = computed(() => {
    const search = query.value.trim().toLowerCase()

    return products
      .filter((product) => {
        const categoryMatch = category.value === "All" || product.category === category.value
        const searchMatch = search === "" || `${product.name} ${product.description}`.toLowerCase().includes(search)
        const savedMatch = saved.value.has(product.id)

        return categoryMatch && searchMatch && savedMatch
      })
      .map((product) => ({
        product,
        saved: true,
        quantity: cart.value.get(product.id) ?? 0,
      }))
  })

  return () => (
    section()
      .className("py-10")
      .children([
        div()
          .className("mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end")
          .children([
            div()
              .children([
                p()
                  .className("text-sm font-medium uppercase tracking-wider text-emerald-600")
                  .children("Your collection"),
                h2()
                  .className("mt-2 text-3xl font-semibold tracking-tight")
                  .children("Saved items"),
              ]),
            input()
              .className("w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-400 focus:ring-2 md:w-72")
              .placeholder("Search saved products")
              .value(query.value)
              .onInput((event) => query.set((event.currentTarget as HTMLInputElement).value)),
          ]),
        div()
          .className("mb-7 flex flex-wrap gap-2")
          .children(
            categoryTabs.value.map((tab) => (
              button()
                .key(tab.entry)
                .className(cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  tab.selected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600",
                ))
                .onClick(() => category.set(tab.entry))
                .children(tab.entry)
            )),
          ),
        visibleProducts.value.length === 0
          ? p()
            .className("rounded-3xl bg-white p-12 text-center text-slate-500")
            .children("No saved products found.")
          : div()
            .className("grid gap-6 md:grid-cols-2 lg:grid-cols-3")
            .children(
              visibleProducts.value.map((entry) => (
                ProductCard()
                  .key(entry.product.id)
                  .product(entry.product)
                  .saved(entry.saved)
                  .quantity(entry.quantity)
              )),
            ),
      ])
  )
})

const App = component(() => {
  const route = signal<Route>("discover")
  const saved = signal(new Set<number>())
  const cart = signal(new Map<number, number>())

  AppContext.provide({ route, cart, saved })

  const routeMap = {
    discover: DiscoverRoute,
    saved: SavedRoute,
    cart: CartRoute,
  }



  return () => (
    div()
      .className("min-h-screen bg-slate-50 text-slate-900")
      .children([
        Navbar()
          .onNavigate((nextRoute) => route.set(nextRoute)),
        main()
          .className("mx-auto max-w-7xl px-6 py-8")
          .children(
            routeMap[route.value](),
          ),
        footer()
          .className("border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500")
          .children([
            a()
              .className("font-semibold text-slate-900")
              .children("Pruve Store"),
            span()
              .children(" - Real-world component and reactivity playground"),
          ]),
      ])
  )
})

const root = document.getElementById("app")
if (root) {
  mount(App, root)
}
