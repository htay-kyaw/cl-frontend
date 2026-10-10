'use client';

import { createContext, useCallback, useContext, useState } from 'react';

// Lets the option pickers ask the gallery to show a photo (e.g. the grey lens when Grey is picked)
const PhotoFocusContext = createContext({ focus: null, showPhoto: () => {} });

export function PhotoFocusProvider({ children }) {
  // a new object each time, so picking the same color again still slides back to its photo
  const [focus, setFocus] = useState(null);
  const showPhoto = useCallback((src) => setFocus({ src }), []);

  return <PhotoFocusContext.Provider value={{ focus, showPhoto }}>{children}</PhotoFocusContext.Provider>;
}

export const usePhotoFocus = () => useContext(PhotoFocusContext);
