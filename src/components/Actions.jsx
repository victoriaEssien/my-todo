import * as React from "react"

const Button = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={`
      inline-flex items-center justify-center rounded-md text-sm font-medium 
      transition-colors focus-visible:outline-none focus-visible:ring-2 
      focus-visible:ring-ring disabled:pointer-events-none
      bg-primary text-primary-foreground hover:bg-primary/90
      h-10 px-4 py-2 ${className}`}
    {...props}
  />
))
Button.displayName = "Button"

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={`
      flex h-10 w-full rounded-md border border-input bg-background 
      px-3 py-2 text-sm ring-offset-background 
      file:border-0 file:bg-transparent file:text-sm file:font-medium 
      placeholder:text-muted-foreground focus-visible:outline-none 
      focus-visible:ring-2 focus-visible:ring-ring 
      disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    ref={ref}
    {...props}
  />
))
Input.displayName = "Input"

export { Button, Input }