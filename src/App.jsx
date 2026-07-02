import { useCallback, useState } from 'react'
import WindyMap from './components/WindyMap'
import ForecastPanel from './components/ForecastPanel'

const FORECAST_ZOOM_THRESHOLD = 6

export default function App() {
  const [zoom, setZoom] = useState(5)

  const handleZoomChange = useCallback((newZoom) => {
    setZoom(newZoom)
  }, [])

  return (
    <div className="app">
      <WindyMap onZoomChange={handleZoomChange} />
      {zoom >= FORECAST_ZOOM_THRESHOLD && <ForecastPanel />}
    </div>
  )
}
