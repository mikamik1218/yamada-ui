import { forwardRef } from "@yamada-ui/core"
import { PointerOff as PointerOffIcon } from "lucide-react"
import { LucideIcon } from "../lucide-icon"
import type { LucideIconProps } from "../lucide-icon"

export type PointerOffProps = LucideIconProps

/**
 * `PointerOff` is [Lucide](https://lucide.dev) SVG icon component.
 *
 * @see Docs https://yamada-ui.com/components/media-and-icons/lucide
 */
export const PointerOff = forwardRef<PointerOffProps, "svg">((props, ref) => (
  <LucideIcon ref={ref} as={PointerOffIcon} {...props} />
))
