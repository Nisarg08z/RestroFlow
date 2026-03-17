import { useState, useRef } from "react"
import { Play, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)
  const reduceMotion = useReducedMotion()

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
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-card overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="max-w-5xl mx-auto">

        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          <p className="text-primary font-medium mb-4">
            See It In Action
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Watch how RestroFlow transforms restaurants
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            A quick 2-minute overview of how our platform works
          </p>
        </motion.div>

        <div className="relative aspect-video bg-secondary rounded-2xl overflow-hidden border border-border/70 shadow-sm">
          <AnimatePresence initial={false} mode="wait">
            {!isPlaying ? (
              <motion.div
                key="thumbnail"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.35 } }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
              >
                <img
                  src="/video-thumbnail.jpg"
                  alt="Video thumbnail"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/30 to-background/10" />

                <motion.button
                  onClick={handlePlay}
                  whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  className="
                    relative z-10
                    w-20 h-20
                    rounded-full
                    bg-primary
                    hover:bg-primary/90
                    flex items-center justify-center
                    transition
                    shadow-md
                  "
                >
                  <Play className="w-8 h-8 ml-1 text-primary-foreground" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="video"
                className="relative w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.25 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <motion.button
                  onClick={handleClose}
                  whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  className="
                    absolute top-4 right-4 z-10
                    w-10 h-10
                    bg-background/80
                    backdrop-blur
                    rounded-full
                    flex items-center justify-center
                    hover:bg-background
                    transition
                    border border-border/60
                  "
                >
                  <X className="w-5 h-5 text-foreground" />
                </motion.button>

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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="mt-8 grid sm:grid-cols-3 gap-6 text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <div className="text-2xl font-bold text-foreground">
              2 min
            </div>
            <div className="text-muted-foreground text-sm">
              Quick overview
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <div className="text-2xl font-bold text-foreground">
              Live Demo
            </div>
            <div className="text-muted-foreground text-sm">
              Real restaurant footage
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <div className="text-2xl font-bold text-foreground">
              All Features
            </div>
            <div className="text-muted-foreground text-sm">
              Complete walkthrough
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}

export default VideoSection;