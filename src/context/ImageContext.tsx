import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ImageContextValue {
  openViewer: (src: string, onReplace: (newSrc: string) => void) => void;
  closeViewer: () => void;
  viewer: { src: string; onReplace: (s: string) => void } | null;
}

const ImageContext = createContext<ImageContextValue>({
  openViewer: () => {},
  closeViewer: () => {},
  viewer: null,
});

export function ImageProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<{ src: string; onReplace: (s: string) => void } | null>(null);

  const openViewer = useCallback((src: string, onReplace: (newSrc: string) => void) => {
    setViewer({ src, onReplace });
  }, []);

  const closeViewer = useCallback(() => setViewer(null), []);

  return (
    <ImageContext.Provider value={{ openViewer, closeViewer, viewer }}>
      {children}
    </ImageContext.Provider>
  );
}

export const useImageViewer = () => useContext(ImageContext);
