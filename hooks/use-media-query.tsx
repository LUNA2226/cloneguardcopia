"use client"
import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const mediaQueryList = window.matchMedia(query)
    const listener = () => setMatches(mediaQueryList.matches)
    listener()
    try {
      mediaQueryList.addEventListener("change", listener)
    } catch (e) {
      mediaQueryList.addListener(listener)
    }
    return () => {
      try {
        mediaQueryList.removeEventListener("change", listener)
      } catch (e) {
        mediaQueryList.removeListener(listener)
      }
    }
  }, [query])

  return matches
}
