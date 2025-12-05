"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import type { Layout } from "react-grid-layout"
import { WidgetConfig } from "@/types"
import ClockWidget from "./widgets/ClockWidget"
import WeatherWidget from "./widgets/WeatherWidget"
import SystemMonitorWidget from "./widgets/SystemMonitorWidget"
import AppLauncherWidget from "./widgets/AppLauncherWidget"
import NotesWidget from "./widgets/NotesWidget"
import CalendarWidget from "./widgets/CalendarWidget"
import SettingsPanel from "./SettingsPanel"

const GridLayout = dynamic(() => import("./grid-layout"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background p-6 md:p-8 flex items-center justify-center">
      <div className="text-muted-foreground">Loading dashboard...</div>
    </div>
  ),
})

export const defaultLayouts = {
  lg: [
    { i: "clock", x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    { i: "weather", x: 4, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    { i: "system", x: 8, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    { i: "apps", x: 0, y: 2, w: 6, h: 3, minW: 4, minH: 3 },
    { i: "calendar", x: 6, y: 2, w: 6, h: 3, minW: 4, minH: 3 },
    { i: "notes", x: 0, y: 5, w: 12, h: 3, minW: 4, minH: 2 },
  ],
}

const defaultWidgets: WidgetConfig[] = [
  { id: "clock", name: "Clock", enabled: true },
  { id: "weather", name: "Weather", enabled: true },
  { id: "system", name: "System Monitor", enabled: true },
  { id: "apps", name: "App Launcher", enabled: true },
  { id: "calendar", name: "Calendar", enabled: true },
  { id: "notes", name: "Notes", enabled: true },
]

export default function Dashboard() {
  const [layouts, setLayouts] = useState(defaultLayouts)
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    // Load layout
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data/layout`)
      .then((res) => res.json())
      .then((data) => {
        if (data.layouts && Object.keys(data.layouts).length > 0) {
          setLayouts(data.layouts)
        }
      })
      .catch((err) => console.error("Failed to load layout:", err))

    // Load widget settings
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data/widgets`)
      .then((res) => res.json())
      .then((data) => {
        if (data.widgets && data.widgets.length > 0) {
          setWidgets(data.widgets)
        }
      })
      .catch((err) => console.error("Failed to load widgets:", err))
  }, [])

  const handleLayoutChange = (layout: Layout[], allLayouts: any) => {
    setLayouts(allLayouts)

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data/layout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layouts: allLayouts }),
    }).catch((err) => console.error("Failed to save layout:", err))
  }

  const handleToggleWidget = (widgetId: string) => {
    const updatedWidgets = widgets.map((w) =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    )
    setWidgets(updatedWidgets)

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data/widgets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widgets: updatedWidgets }),
    }).catch((err) => console.error("Failed to save widgets:", err))
  }

  const isWidgetEnabled = (widgetId: string) => {
    const widget = widgets.find((w) => w.id === widgetId)
    return widget ? widget.enabled : true
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      {/* Settings Button */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="fixed top-6 right-6 z-30 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Settings"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        widgets={widgets}
        onToggleWidget={handleToggleWidget}
      />

      <GridLayout layouts={layouts} onLayoutChange={handleLayoutChange}>
        {isWidgetEnabled("clock") && (
          <div key="clock" className="widget-container">
            <ClockWidget />
          </div>
        )}
        {isWidgetEnabled("weather") && (
          <div key="weather" className="widget-container">
            <WeatherWidget />
          </div>
        )}
        {isWidgetEnabled("system") && (
          <div key="system" className="widget-container">
            <SystemMonitorWidget />
          </div>
        )}
        {isWidgetEnabled("apps") && (
          <div key="apps" className="widget-container">
            <AppLauncherWidget />
          </div>
        )}
        {isWidgetEnabled("calendar") && (
          <div key="calendar" className="widget-container">
            <CalendarWidget />
          </div>
        )}
        {isWidgetEnabled("notes") && (
          <div key="notes" className="widget-container">
            <NotesWidget />
          </div>
        )}
      </GridLayout>
    </div>
  )
}
