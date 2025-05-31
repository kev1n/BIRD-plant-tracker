import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary-light-grey text-primary-dark-grey hover:bg-secondary-light-grey/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-primary-green/20 text-primary-green hover:bg-primary-green/30",
        warning:
          "border-transparent bg-primary-yellow/20 text-primary-dark-grey hover:bg-primary-yellow/30",
        info:
          "border-transparent bg-primary-light-grey/20 text-primary-dark-grey hover:bg-primary-light-grey/30",
        native:
          "border-transparent bg-secondary-green/20 text-secondary-green hover:bg-secondary-green/30",
        nonnative:
          "border-transparent bg-primary-yellow/25 text-primary-dark-grey hover:bg-primary-yellow/35",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
