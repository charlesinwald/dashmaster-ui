"use client"

import { CalendarIcon, ChevronLeft, ChevronRight, Cloud, CloudOff } from "lucide-react"
import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from "date-fns"

interface GoogleEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  location?: string
}

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<GoogleEvent[]>([])
  const [showEvents, setShowEvents] = useState(false)
  const [loading, setLoading] = useState(false)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Google Calendar integration disabled for now
  // useEffect(() => {
  //   checkConnectionStatus()
  // }, [])

  // useEffect(() => {
  //   if (isConnected) {
  //     fetchEvents()
  //   }
  // }, [isConnected])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  return (
    <div className="h-full bg-card border border-border rounded-xl shadow-lg p-6 text-card-foreground relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:border-secondary/50">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="drag-handle cursor-move absolute top-4 right-4 opacity-30 hover:opacity-100 transition-opacity z-10">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>

      <div className="flex items-center gap-2 mb-4 z-10">
        <CalendarIcon className="w-5 h-5 text-secondary" />
        <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Calendar</span>
      </div>

      <div className="flex items-center justify-between mb-4 z-10">
        <button onClick={goToPreviousMonth} className="p-1 hover:bg-muted rounded transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold">{format(currentDate, "MMMM yyyy")}</h3>
        <button onClick={goToNextMonth} className="p-1 hover:bg-muted rounded transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center z-10">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        {daysInMonth.map((day, idx) => (
          <div
            key={idx}
            className={`
              aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-200
              ${isToday(day) ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted"}
              ${!isSameMonth(day, currentDate) ? "text-muted-foreground/50" : ""}
            `}
          >
            {format(day, "d")}
          </div>
        ))}
      </div>
    </div>
  )
}
