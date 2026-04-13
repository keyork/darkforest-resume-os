import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-primary/10 bg-primary text-primary-foreground shadow-[0_16px_40px_hsl(var(--primary)/0.24)] hover:-translate-y-0.5 hover:bg-primary/95",
        destructive:
          "border border-destructive/10 bg-destructive text-destructive-foreground shadow-[0_16px_36px_hsl(var(--destructive)/0.22)] hover:-translate-y-0.5 hover:bg-destructive/90",
        outline:
          "border border-transparent bg-[linear-gradient(180deg,hsl(var(--background)/0.78),hsl(var(--background-alt)/0.5))] text-foreground shadow-[0_12px_28px_hsl(var(--shadow-color)/0.08)] backdrop-blur-xl hover:bg-accent/72 hover:text-accent-foreground",
        secondary:
          "border border-transparent bg-secondary/16 text-secondary shadow-[0_12px_28px_hsl(var(--shadow-color)/0.08)] hover:bg-secondary/26",
        ghost: "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-11 px-6 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
