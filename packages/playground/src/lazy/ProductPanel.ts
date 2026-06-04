import { component } from "pruvejs"
import {
  div,
  h2,
  p,
  span,
} from "pruvejs/builtin"

export type ProductPanelProps = {
  productId: number
  variant: "compact" | "expanded"
}

export const ProductPanel = component<ProductPanelProps>((props) => {
  const loadedAt = new Date().toLocaleTimeString()

  return () => (
    div()
      .className("rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm")
      .children([
        span()
          .className("text-xs font-semibold uppercase tracking-wide text-emerald-700")
          .children("Lazy module loaded"),
        h2()
          .className("mt-2 text-xl font-semibold text-emerald-950")
          .children(`Product #${props.productId}`),
        p()
          .className("mt-3 text-sm leading-6 text-emerald-800")
          .children(`Rendered with the "${props.variant}" variant at ${loadedAt}.`),
        props.variant === "expanded"
          ? p()
            .className("mt-3 text-sm leading-6 text-emerald-700")
            .children("This component lives in src/lazy/ProductPanel.ts and was loaded through lazy().")
          : null
      ])
  )
})
