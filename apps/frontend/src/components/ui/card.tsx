import { cn } from "@/lib/utils"
import * as React from "react"
import { Button } from "./button"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col border shadow-sm overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-4 p-4 body-2",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("body-3 leading-tight !text-left", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("body-2 !text-left", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content !text-left"
      className={cn("p-4", className)}
      {...props}
    />
  )
}

function CardImage({ src, alt, className, ...props }: React.ComponentProps<"img"> & { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("p-4", className)}
      {...props}
    />
  )
}

function CardButton({ className, children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="default"
      size="lg"
      className={cn(
        "w-full mt-4 button-2 font-bold bg-primary-dark-grey text-neutral-white",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export {
  Card, CardButton, CardContent,
  CardDescription,
  CardHeader, CardImage, CardTitle
}

