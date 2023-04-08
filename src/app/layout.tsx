import Head from 'next/head'
import './globals.css'

export const metadata = {
  title: 'Interactive terrain with Three.js'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v1.13.0/mapbox-gl.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
