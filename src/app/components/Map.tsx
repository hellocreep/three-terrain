'use client';

import mapboxgl from 'mapbox-gl';
import { PolygonLayer } from '@deck.gl/layers/typed'
import { MapboxLayer } from '@deck.gl/mapbox/typed'
import { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string

interface Props {
  className?: string
  children?: React.ReactNode
}

export interface MapRef {
  getCenter(): mapboxgl.LngLat | undefined
  getZoom(): number | undefined
}

export const Map = forwardRef((props: Props, ref) => {
  const [loaded, setLoaded] = useState(false)
  const mapRef = useRef<mapboxgl.Map>()
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [103.4908, 31.0655],
      zoom: 10,
      maxZoom: 10,
      minZoom: 8
    })

    map.on('load', () => {
      mapRef.current = map
      setLoaded(true)
    })

    return () => {
      map.remove()
    }
  }, [])

  useImperativeHandle(ref, () => ({
    getCenter() {
      return mapRef.current?.getCenter()
    },
    getZoom() {
      return Math.floor(mapRef.current?.getZoom() ?? 10)
    }
  }), [])

  return (
    <div className={props.className}>
      <div id="map" style={{ width: '100%', height: '100%' }}></div>
      {loaded && props.children}
    </div>
  )
})

Map.displayName = 'Map'