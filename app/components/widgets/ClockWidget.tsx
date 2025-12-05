"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Clock } from "lucide-react"

export default function ClockWidget() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="h-full bg-card border border-border rounded-xl shadow-lg p-6 flex flex-col justify-between text-card-foreground relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:border-primary/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="drag-handle cursor-move absolute top-4 right-4 opacity-30 hover:opacity-100 transition-opacity z-10">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>

      <div className="flex items-center gap-2 mb-4 z-10">
        <Clock className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Time</span>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 z-10">
        <div className="text-5xl md:text-6xl font-bold mb-3 tabular-nums tracking-tight">
          {format(time, "h:mm")}
        </div>
        <div className="text-lg md:text-xl text-muted-foreground font-light tracking-wide">
          {format(time, "EEEE, MMMM d, yyyy")}
        </div>
      </div>
    </div>
  )
}
