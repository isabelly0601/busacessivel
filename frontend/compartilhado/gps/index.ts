// compartilhado/gps/index.ts
// Wrapper reutilizável para Geolocation API

export type Coordenadas = { lat: number; lng: number };

export function obterGps(
  onSucesso: (c: Coordenadas) => void,
  onErro?: (err: GeolocationPositionError) => void
): () => void {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (pos) => onSucesso({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    onErro,
    { enableHighAccuracy: true, maximumAge: 5000 }
  );
  return () => navigator.geolocation.clearWatch(id);
}

export function lerGpsUmaVez(
  onSucesso: (c: Coordenadas) => void,
  onErro?: () => void
): void {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => onSucesso({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    () => onErro?.(),
    { enableHighAccuracy: true, timeout: 8000 }
  );
}
