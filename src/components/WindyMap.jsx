import { useEffect, useRef } from 'react'

const LEAFLET_SRC = 'https://unpkg.com/leaflet@1.4.0/dist/leaflet.js'
const WINDY_SRC = 'https://api.windy.com/assets/map-forecast/libBoot.js'

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      if (existing.dataset.loaded) {
        resolve()
      } else {
        existing.addEventListener('load', resolve)
        existing.addEventListener('error', reject)
      }
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = reject
    document.body.appendChild(script)
  })
}

export default function WindyMap({ onZoomChange }) {
  const initialized = useRef(false)
  const onZoomChangeRef = useRef(onZoomChange)
  onZoomChangeRef.current = onZoomChange

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const options = {
      key: import.meta.env.VITE_WINDY_API_KEY,
      lat: 23.5,
      lon: 121,
      zoom: 5,
    }

    loadScript(LEAFLET_SRC)
      .then(() => loadScript(WINDY_SRC))
      .then(() => {
        window.windyInit(options, (windyAPI) => {
          const { store, map } = windyAPI
          store.set('overlay', 'wind')

          map.on('zoomend', () => {
            onZoomChangeRef.current(map.getZoom())
          })
        })
      })
  }, [])

  return <div id="windy" className="windy-map" />
}
