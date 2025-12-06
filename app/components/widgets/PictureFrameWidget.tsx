"use client"

import { useState, useEffect } from "react"
import { Image as ImageIcon, ChevronLeft, ChevronRight, Pause, Play, Folder } from "lucide-react"

interface Photo {
  filename: string
  path: string
}

interface PhotoListResponse {
  folder: string
  count: number
  images: Photo[]
}

export default function PictureFrameWidget() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [folderPath, setFolderPath] = useState<string>("")
  const [imageError, setImageError] = useState(false)

  // Slideshow interval (5 seconds)
  const slideshowInterval = 5000

  useEffect(() => {
    fetchPhotos()
  }, [])

  useEffect(() => {
    if (isPlaying && photos.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length)
        setImageError(false)
      }, slideshowInterval)

      return () => clearInterval(timer)
    }
  }, [isPlaying, photos.length, currentIndex])

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos/list')
      if (!response.ok) throw new Error("Failed to fetch photos")

      const data: PhotoListResponse = await response.json()
      setPhotos(data.images)
      setFolderPath(data.folder)
      setError(null)

      if (data.count === 0) {
        setError("No photos found in folder")
      }
    } catch (err) {
      console.error("Photo fetch error:", err)
      setError("Unable to load photos")
    } finally {
      setLoading(false)
    }
  }

  const goToNext = () => {
    if (photos.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % photos.length)
      setImageError(false)
    }
  }

  const goToPrevious = () => {
    if (photos.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
      setImageError(false)
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const currentPhoto = photos[currentIndex]

  return (
    <div className="h-full bg-card border border-border rounded-xl shadow-lg overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:border-secondary/50">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="drag-handle cursor-move absolute top-4 right-4 opacity-30 hover:opacity-100 transition-opacity z-10">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-white tracking-wide uppercase">Picture Frame</span>
          </div>
          {photos.length > 0 && (
            <span className="text-xs text-white/80">
              {currentIndex + 1} / {photos.length}
            </span>
          )}
        </div>
        {folderPath && (
          <div className="flex items-center gap-1 mt-1 text-xs text-white/60">
            <Folder className="w-3 h-3" />
            <span className="truncate">{folderPath}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative h-full flex items-center justify-center bg-black/5">
        {loading && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading photos...</span>
          </div>
        )}

        {error && !loading && (
          <div className="text-center p-6">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-destructive text-sm mb-2">{error}</p>
            <p className="text-xs text-muted-foreground">
              Configure PHOTO_FOLDER in .env
            </p>
          </div>
        )}

        {!loading && !error && photos.length > 0 && currentPhoto && (
          <>
            {imageError ? (
              <div className="text-center p-6">
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Failed to load image</p>
              </div>
            ) : (
              <img
                src={currentPhoto.path}
                alt={currentPhoto.filename}
                className="max-w-full max-h-full object-contain"
                onError={handleImageError}
              />
            )}
          </>
        )}
      </div>

      {/* Controls */}
      {!loading && !error && photos.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent z-10">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlayPause}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={goToNext}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
              title="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
