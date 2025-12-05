"use client"

import type React from "react"

import { Responsive, WidthProvider } from "react-grid-layout"
import type { Layout, Layouts } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

const ResponsiveGridLayout = WidthProvider(Responsive)

interface GridLayoutProps {
  layouts: Layouts
  onLayoutChange: (layout: Layout[], allLayouts: Layouts) => void
  children: React.ReactNode
}

export default function GridLayout({ layouts, onLayoutChange, children }: GridLayoutProps) {
  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={80}
      onLayoutChange={onLayoutChange}
      draggableHandle=".drag-handle"
    >
      {children}
    </ResponsiveGridLayout>
  )
}
