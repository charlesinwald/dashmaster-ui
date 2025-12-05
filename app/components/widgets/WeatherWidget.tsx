"use client"

import { useState, useEffect } from "react"
import type { WeatherData } from "@/types"
import { Cloud, Droplets, Wind } from "lucide-react"

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeather()
    const interval = setInterval(fetchWeather, 600000) // Update every 10 minutes
    return () => clearInterval(interval)
  }, [])

  const fetchWeather = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/weather/current`)
      if (!response.ok) throw new Error("Failed to fetch weather")
      const data = await response.json()
      setWeather(data)
      setError(null)
    } catch (err) {
      setError("Unable to load weather")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full bg-card border border-border rounded-xl shadow-lg p-6 text-card-foreground relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:border-secondary/50">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="drag-handle cursor-move absolute top-4 right-4 opacity-30 hover:opacity-100 transition-opacity z-10">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-full z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading weather...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-full z-10">
          <div className="text-center">
            <Cloud className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        </div>
      )}

      {weather && !loading && !error && (
        <div className="flex flex-col h-full justify-between z-10">
          <div className="flex items-center gap-2 mb-4">
            <Cloud className="w-5 h-5 text-secondary" />
            <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Weather</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-2">
              <h3 className="text-2xl font-bold mb-1">{weather.location}</h3>
              <p className="text-sm text-muted-foreground font-light capitalize">{weather.condition}</p>
            </div>

            <div className="flex items-center justify-between my-4">
              <div className="text-6xl font-bold tabular-nums">{Math.round(weather.temperature)}°</div>
              {weather.icon && (
                <img src={`https:${weather.icon}`} alt={weather.condition} className="w-20 h-20 drop-shadow-lg" />
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 flex-1">
              <Wind className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Feels like <span className="font-medium text-foreground">{Math.round(weather.feelsLike)}°</span>
              </span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Droplets className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Humidity <span className="font-medium text-foreground">{weather.humidity}%</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
