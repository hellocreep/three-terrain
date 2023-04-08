'use client'

import { useRef, useState } from 'react'
import clsx from 'clsx'
import { Terrain, TerrainRef } from './components/Terrain'
import { Map, MapRef } from './components/Map'
import styles from './page.module.css'

export default function Home() {
  const [isStarted, setIsStarted] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const map = useRef<MapRef>()
  const terrain = useRef<TerrainRef>()

  async function onClick() {
    if (isStarted) return

    const center = map.current?.getCenter()
    const zoom = map.current?.getZoom()

    setIsStarted(true)

    await terrain.current?.createTerrain(center, zoom)

    setIsFinished(true)
  }

  return (
    <main className={clsx(styles.main)}>
      <Map ref={map} className={clsx(styles.map, { [styles.hide]: isFinished })}>
        <div className={styles.panel}>
          <button className={clsx(styles.btn, { [styles.btnLoading]: isStarted })} onClick={onClick}>
            Terrain Here
          </button>
        </div>
      </Map>
      <Terrain ref={terrain} />
    </main>
  )
}
