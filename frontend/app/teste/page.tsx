"use client"

import React, { useEffect, useState } from "react"

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function bearingToCompass(bearing: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
  const ix = Math.round(bearing / 45) % 8
  return dirs[ix]
}

export default function TesteAcessibilidade() {
  const [status, setStatus] = useState("Aguardando ação")
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null)
  const [dest, setDest] = useState<{ lat: number; lon: number }>({ lat: -23.55052, lon: -46.633308 })
  const [watchId, setWatchId] = useState<number | null>(null)

  useEffect(() => {
    return () => {
      if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId)
    }
  }, [watchId])

  const speak = (text: string) => {
    try {
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 0.95
      speechSynthesis.cancel()
      speechSynthesis.speak(u)
    } catch (e) {
      console.warn("Speech not available", e)
    }
  }

  const getPosition = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocalização não suportada no navegador")
      speak("Geolocalização não suportada no navegador")
      return
    }
    setStatus("Solicitando localização...")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        setPosition({ lat, lon })
        setStatus("Posição obtida")
        speak(`Localização obtida. Latitude ${lat.toFixed(5)}, longitude ${lon.toFixed(5)}.`)
      },
      (err) => {
        setStatus("Erro ao obter localização: " + err.message)
        speak("Erro ao obter localização")
      },
      { enableHighAccuracy: true }
    )
  }

  const startGuidance = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocalização não suportada")
      speak("Geolocalização não suportada")
      return
    }
    setStatus("Iniciando orientação — aguardando atualizações de posição")
    speak("Iniciando orientação para o ponto de ônibus")
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        setPosition({ lat, lon })
        const d = haversineDistance(lat, lon, dest.lat, dest.lon)
        const bearing = Math.atan2(
          Math.sin((dest.lon - lon) * (Math.PI / 180)) * Math.cos(dest.lat * (Math.PI / 180)),
          Math.cos(lat * (Math.PI / 180)) * Math.sin(dest.lat * (Math.PI / 180)) -
            Math.sin(lat * (Math.PI / 180)) * Math.cos(dest.lat * (Math.PI / 180)) * Math.cos((dest.lon - lon) * (Math.PI / 180))
        )
        const bearingDeg = ((bearing * 180) / Math.PI + 360) % 360
        const dir = bearingToCompass(bearingDeg)
        if (d < 15) {
          setStatus("Chegou ao ponto de ônibus")
          speak("Você chegou ao ponto de ônibus")
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
          navigator.geolocation.clearWatch(id)
          setWatchId(null)
        } else {
          setStatus(`Distância: ${Math.round(d)} m — direção ${dir}`)
          speak(`${Math.round(d)} metros, direção ${dir}`)
        }
      },
      (err) => {
        setStatus("Erro no watchPosition: " + err.message)
        speak("Erro ao atualizar posição")
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    )
    setWatchId(id)
  }

  const stopGuidance = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setStatus("Orientação parada")
      speak("Orientação parada")
    }
  }

  return (
    <main style={{ padding: 24, background: "#000", color: "#fff", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>App Teste Acessível — Ônibus</h1>
      <p style={{ fontSize: 18 }}>Interface de alto contraste, voz e orientação baseada em GPS.</p>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Destino (ponto) latitude:
          <input
            aria-label="latitude destino"
            type="number"
            value={dest.lat}
            onChange={(e) => setDest({ ...dest, lat: parseFloat(e.target.value || "0") })}
            style={{ marginLeft: 8, fontSize: 18 }}
          />
        </label>
        <label style={{ display: "block", marginBottom: 8 }}>
          Destino (ponto) longitude:
          <input
            aria-label="longitude destino"
            type="number"
            value={dest.lon}
            onChange={(e) => setDest({ ...dest, lon: parseFloat(e.target.value || "0") })}
            style={{ marginLeft: 8, fontSize: 18 }}
          />
        </label>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button onClick={getPosition} style={{ padding: 12, fontSize: 18 }}>
          Encontrar minha posição
        </button>
        <button onClick={startGuidance} style={{ padding: 12, fontSize: 18, background: "#0a84ff", color: "#000" }}>
          Iniciar orientação
        </button>
        <button onClick={stopGuidance} style={{ padding: 12, fontSize: 18, background: "#ff3b30" }}>
          Parar
        </button>
      </div>

      <section aria-live="polite" style={{ marginTop: 24 }}>
        <strong>Status:</strong>
        <div style={{ marginTop: 8, fontSize: 20 }}>{status}</div>
        <div style={{ marginTop: 8 }}>
          Posição atual:{" "}
          {position ? `${position.lat.toFixed(5)}, ${position.lon.toFixed(5)}` : "—"}
        </div>
      </section>

      <footer style={{ marginTop: 40, opacity: 0.8 }}>
        <small>Dica: permita microfone/posição e use fones com vibração se disponível.</small>
      </footer>
    </main>
  )
}
