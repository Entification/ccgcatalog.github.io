import React, { createContext, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Ctx = {
  open: (src: string, alt?: string) => void
  close: () => void
}
const ImageViewerContext = createContext<Ctx | null>(null)

export function useImageViewer() {
  const ctx = useContext(ImageViewerContext)
  if (!ctx) throw new Error('useImageViewer must be used within <ImageViewerProvider>')
  return ctx
}

export function ImageViewerProvider({ children }: { children: React.ReactNode }) {
  const [openState, setOpenState] = useState<{ src: string; alt?: string } | null>(null)

  const open = (src: string, alt?: string) => setOpenState({ src, alt })
  const close = () => setOpenState(null)

  // ESC to close
  useEffect(() => {
    if (!openState) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openState])

  return (
    <ImageViewerContext.Provider value={{ open, close }}>
      {children}
      {createPortal(
        openState ? (
          <div
            className="iv-backdrop"
            onClick={close}
            role="dialog"
            aria-modal="true"
          >
            <div className="iv-container" onClick={(e) => e.stopPropagation()}>
              <button className="iv-close" onClick={close} aria-label="Close">×</button>
              {/* Large image fits screen: max 90vw/90vh, keeps ratio */}
              <img
                src={openState.src}
                alt={openState.alt || ''}
                className="iv-image"
              />
            </div>
          </div>
        ) : null,
        document.body
      )}
    </ImageViewerContext.Provider>
  )
}
