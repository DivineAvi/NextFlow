"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@nextflow/utils"

export type ButtonProps = React.ComponentProps<"button"> & {
  asChild?: boolean
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          variant === "default" && "bg-foreground text-background hover:bg-foreground/90",
          variant === "ghost" && "hover:bg-foreground/5",
          variant === "outline" && "border border-foreground/15 bg-background hover:bg-foreground/5",
          size === "default" && "h-9 px-4 py-2",
          size === "sm" && "h-8 rounded-md px-3 text-xs",
          size === "icon" && "size-9",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
