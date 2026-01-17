import { useState, useRef } from "react"
import { Play, X } from "lucide-react"

const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)

  const handlePlay = () => {
    setIsPlaying(true)
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  const handleClose = () => {
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <section
      id="video"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-primary font-medium mb-4">
            See It In Action
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Watch how RestroFlow transforms restaurants
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            A quick 2-minute overview of how our platform works
          </p>
        </div>

        <div className="relative aspect-video bg-secondary rounded-2xl overflow-hidden border border-border">
          {!isPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/video-thumbnail.jpg"
                alt="Video thumbnail"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-background/40" />

              <button
                onClick={handlePlay}
                className="
                  relative z-10
                  w-20 h-20
                  rounded-full
                  bg-primary
                  hover:bg-primary/90
                  flex items-center justify-center
                  transition
                "
              >
                <Play className="w-8 h-8 ml-1 text-primary-foreground" />
              </button>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <button
                onClick={handleClose}
                className="
                  absolute top-4 right-4 z-10
                  w-10 h-10
                  bg-background/80
                  rounded-full
                  flex items-center justify-center
                  hover:bg-background
                  transition
                "
              >
                <X className="w-5 h-5 text-foreground" />
              </button>

              <video
                ref={videoRef}
                src="/video-demo.mp4"
                className="w-full h-full object-cover"
                controls
                autoPlay
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>

        <div className="mt-8 grid sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">
              2 min
            </div>
            <div className="text-muted-foreground text-sm">
              Quick overview
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold text-foreground">
              Live Demo
            </div>
            <div className="text-muted-foreground text-sm">
              Real restaurant footage
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold text-foreground">
              All Features
            </div>
            <div className="text-muted-foreground text-sm">
              Complete walkthrough
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default VideoSection;