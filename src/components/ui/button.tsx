import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white font-semibold shadow-[0_4px_14px_0_rgba(147,51,234,0.5)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.7)] hover:scale-[1.05] hover:-translate-y-0.5 active:scale-[0.98] active:shadow-[0_2px_8px_rgba(147,51,234,0.4)] relative overflow-hidden group before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700 before:ease-in-out",
        destructive:
          "rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_4px_14px_0_rgba(220,38,38,0.5)] hover:shadow-[0_8px_25px_rgba(220,38,38,0.7)] hover:scale-[1.05] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "rounded-full border-2 border-purple-500/30 bg-background shadow-sm hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/30 dark:hover:to-blue-950/30 hover:border-purple-500 hover:text-purple-700 dark:hover:text-purple-300 hover:scale-105 dark:bg-input/30 dark:border-input",
        secondary:
          "rounded-full bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:scale-105",
        ghost:
          "rounded-full hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/30 dark:hover:to-blue-950/30 hover:text-purple-700 dark:hover:text-purple-300 hover:scale-105",
        link: "text-purple-600 dark:text-purple-400 underline-offset-4 hover:underline hover:text-purple-700 dark:hover:text-purple-300",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-11 px-6 has-[>svg]:px-4 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
