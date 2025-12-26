import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-blue-600 text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all duration-200",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200",
        outline:
          "border border-slate-600 bg-slate-900/50 hover:bg-slate-800/50 hover:border-slate-500 text-slate-300 hover:text-white transition-all duration-200",
        secondary:
          "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all duration-200",
        ghost: "hover:bg-slate-800/50 hover:text-white text-slate-400 transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline hover:text-blue-400 transition-all duration-200",
        futuristic: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 font-semibold transition-all duration-200",
        glass: "bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200",
        cyber: "bg-slate-900 border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white font-mono transition-all duration-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
        xl: "h-12 rounded-lg px-10 text-lg font-semibold",
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
  glow?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, glow = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          glow && "glow",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }