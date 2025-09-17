import React, { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Ctx = { open: (src: string, alt?: string) => void; close: () => void };
const ImageViewerContext = createContext<Ctx | null>(null);

export function useImageViewer() {
  const ctx = useContext(ImageViewerContext);
  if (!ctx) throw new Error("useImageViewer must be used within <ImageViewerProvider>");
  return ctx;
}

export function ImageViewerProvider({ children }: { children: React.ReactNode }) {
  const [openState, setOpenState] = useState<{ src: string; alt?: string } | null>(null);

  const open = (src: string, alt?: string) => setOpenState({ src, alt });
  const close = () => setOpenState(null);

  // ESC to close
  useEffect(() => {
    if (!openState) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openState]);

  return (
    <ImageViewerContext.Provider value={{ open, close }}>
      {children}
      {createPortal(
        openState ? (
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={close}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute -top-3 -right-3 rounded-full w-9 h-9 bg-neutral-900 text-white text-xl leading-none grid place-items-center border border-white/20"
                onClick={close}
                aria-label="Close"
                title="Close"
              >
                ×
              </button>
              <img
                src={openState.src}
                alt={openState.alt || ""}
                className="max-w-[90vw] max-h-[90vh] object-contain"
              />
            </div>
          </div>
        ) : null,
        document.body
      )}
    </ImageViewerContext.Provider>
  );
}
