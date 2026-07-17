import React from "react"
import { cn } from "@/lib/utils"

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  className?: string
  gradient?: "blue-purple" | "purple-blue" | "blue-cyan"
}

export default function GradientText({
  children,
  className,
  gradient = "blue-purple",
  ...props
}: GradientTextProps) {
  const gradientClass = {
    "blue-purple": "from-blue-400 via-indigo-400 to-purple-500",
    "purple-blue": "from-purple-400 via-indigo-400 to-blue-500",
    "blue-cyan": "from-blue-400 via-sky-400 to-emerald-400",
  }[gradient]

  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent font-semibold animate-pulse",
        gradientClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
