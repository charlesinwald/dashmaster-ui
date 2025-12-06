"use client"

import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, Activity } from 'lucide-react'

interface MotionDetectorProps {
  enabled: boolean
  sensitivity?: number // 0-100, default 20
  onMotionDetected?: () => void
}

export default function MotionDetector({
  enabled,
  sensitivity = 20,
  onMotionDetected
}: MotionDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [motionLevel, setMotionLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const previousFrameRef = useRef<ImageData | null>(null)

  useEffect(() => {
    // Only stop camera when disabled, don't auto-start
    if (!enabled) {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [enabled])

  const startCamera = async () => {
    try {
      console.log('=== Camera Debug Info ===')
      console.log('Protocol:', window.location.protocol)
      console.log('Hostname:', window.location.hostname)
      console.log('navigator.mediaDevices exists:', !!navigator.mediaDevices)
      console.log('getUserMedia exists:', !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia))

      // Check if we're on HTTPS or localhost
      const isSecureContext = window.isSecureContext
      const protocol = window.location.protocol
      const hostname = window.location.hostname

      console.log('Is secure context:', isSecureContext)
      console.log('======================')

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (!isSecureContext && hostname !== 'localhost' && hostname !== '127.0.0.1') {
          throw new Error('Camera requires HTTPS connection. Use ngrok with HTTPS or access via localhost.')
        }
        throw new Error('Camera API not supported by this browser')
      }

      console.log('Requesting camera access...')

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user'
        }
      })

      console.log('Camera access granted')
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsActive(true)
        setError(null)
        startMotionDetection()
      }
    } catch (err: any) {
      console.error('Camera access error:', err)

      let errorMessage = 'Unable to access camera'
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Check browser settings.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found on this device'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera is already in use'
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setIsActive(false)
    }
  }

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsActive(false)
    previousFrameRef.current = null
  }

  const startMotionDetection = () => {
    const detectMotion = () => {
      if (!videoRef.current || !canvasRef.current || !enabled) {
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(detectMotion)
        return
      }

      // Set canvas size to match video
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      // Draw current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height)

      if (previousFrameRef.current) {
        // Calculate motion between frames
        const motion = calculateMotion(previousFrameRef.current, currentFrame)
        setMotionLevel(motion)

        // Trigger motion callback if motion exceeds sensitivity threshold
        if (motion > sensitivity && onMotionDetected) {
          onMotionDetected()
        }
      }

      previousFrameRef.current = currentFrame
      animationFrameRef.current = requestAnimationFrame(detectMotion)
    }

    detectMotion()
  }

  const calculateMotion = (previous: ImageData, current: ImageData): number => {
    let totalDiff = 0
    const pixels = previous.data.length / 4
    const threshold = 20 // Noise threshold

    for (let i = 0; i < previous.data.length; i += 4) {
      // Calculate grayscale difference
      const prevGray = (previous.data[i] + previous.data[i + 1] + previous.data[i + 2]) / 3
      const currGray = (current.data[i] + current.data[i + 1] + current.data[i + 2]) / 3
      const diff = Math.abs(prevGray - currGray)

      if (diff > threshold) {
        totalDiff += diff
      }
    }

    // Return motion as percentage (0-100)
    return Math.min(100, (totalDiff / pixels) * 2)
  }

  // Don't render anything if motion detection is disabled
  if (!enabled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isActive ? (
              <Camera className="w-4 h-4 text-green-500" />
            ) : (
              <CameraOff className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-xs font-medium">Motion Sensor</span>
          </div>
          {isActive && (
            <Activity className={`w-4 h-4 ${motionLevel > sensitivity ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
          )}
        </div>

        {error && (
          <div className="space-y-2">
            <p className="text-xs text-destructive">{error}</p>
            <button
              onClick={startCamera}
              className="w-full px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Grant Camera Access
            </button>
          </div>
        )}

        {!isActive && !error && enabled && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Waiting for camera...</p>
            <button
              onClick={startCamera}
              className="w-full px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Start Camera
            </button>
          </div>
        )}

        {isActive && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Motion Level</span>
              <span className={`font-medium ${motionLevel > sensitivity ? 'text-green-500' : 'text-foreground'}`}>
                {Math.round(motionLevel)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  motionLevel > sensitivity ? 'bg-green-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(100, motionLevel)}%` }}
              />
            </div>
          </div>
        )}

        {/* Hidden video and canvas for motion detection */}
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
