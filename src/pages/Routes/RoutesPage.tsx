/**
 * RoutesPage — Daily route planner for Ariel Céspedes (home physiotherapy).
 *
 * Renders an interactive Leaflet/OpenStreetMap map showing:
 *  - Club Olimpia as the fixed origin (starting point each day)
 *  - Patient appointments sorted chronologically
 *  - Numbered markers for each stop
 *  - A route polyline fetched from the OSRM public routing API
 *  - An itinerary sidebar listing each stop with patient name & time
 */

import React, { useState, useEffect, useRef } from 'react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Navigation, Clock, User, MapPin, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAppointments, getPatients, updatePatient } from '../../services/dataService';
import type { Appointment, Patient } from '../../services/dataService';
import { geocodeLocation } from '../../services/geocoding';

// ─── Fix Leaflet's default marker icon paths broken by Vite's asset hashing ───
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// ─── Club Olimpia (Estadio Manuel Ferreira) — fixed origin ────────────────────
const ORIGIN: [number, number] = [-25.2877, -57.6330];
const ORIGIN_NAME = 'Club Olimpia (Base)';

interface RouteStop {
  index: number;
  patientName: string;
  time: string;
  location: string;
  coords: [number, number] | null;
  appointment: Appointment;
}

/** Creates a coloured numbered SVG marker for Leaflet */
const createNumberedIcon = (n: number, color: string) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width:34px;height:34px;border-radius:50% 50% 50% 0;
        background:${color};border:3px solid white;
        box-shadow:0 3px 10px rgba(0,0,0,.35);
        transform:rotate(-45deg);display:flex;
        align-items:center;justify-content:center;
      ">
        <span style="transform:rotate(45deg);color:white;font-weight:800;font-size:13px;line-height:1">${n}</span>
      </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -36],
  });

/** Creates the origin (home-base) marker icon */
const createOriginIcon = () =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width:38px;height:38px;border-radius:50%;
        background:linear-gradient(135deg,#10b981,#059669);
        border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,.4);
        display:flex;align-items:center;justify-content:center;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -40],
  });

const STOP_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

export const RoutesPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // ── Inline location editor state ─────────────────────────────────────────────
  type EditingStop = { stopIndex: number; patientId: string; patientName: string; currentValue: string };
  const [editingStop, setEditingStop] = useState<EditingStop | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);

  // ── Initialize Leaflet map once ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: ORIGIN,
      zoom: 13,
      zoomControl: true,
      preferCanvas: true, // drastically improves SVG rendering performance for many layers
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Add fixed origin marker
    L.marker(ORIGIN, { icon: createOriginIcon() })
      .addTo(map)
      .bindPopup(`<b>🏠 ${ORIGIN_NAME}</b><br>Punto de partida del día`)
      .openPopup();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Fetch appointments and geocode stops whenever the date changes ───────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setStops([]);
      setGeocodingProgress(0);

      try {
        const [appointments, patients] = await Promise.all([getAppointments(), getPatients()]);

        // Build look-up maps: by ID and by normalized name
        const patientMap = new Map<string, Patient>(patients.map(p => [p.id, p]));
        // Normalize names for fuzzy matching (lowercase, no accents, no extra spaces)
        const normalize = (s: string) =>
          s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        const patientByName = new Map<string, Patient>(
          patients.map(p => [normalize(p.name), p])
        );

        // Filter appointments for the selected date, sorted by time
        const dayAppts = appointments
          .filter((a: Appointment) => {
            try { return isSameDay(new Date(a.date), selectedDate); }
            catch { return false; }
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (dayAppts.length === 0) {
          setLoading(false);
          return;
        }

        // Geocode all appointments in parallel (massive speedup for un-cached locations)
        const geocodePromises = dayAppts.map(async (appt, i) => {
          const titleName = appt.title.split(' - ')[0].trim();
          const patient =
            patientMap.get(appt.patientId) ||
            patientByName.get(normalize(titleName)) ||
            patients.find(p =>
              normalize(p.name).includes(normalize(titleName)) ||
              normalize(titleName).includes(normalize(p.name))
            );

          const location = patient?.location || '';
          
          let coords: [number, number] | null = null;
          if (location) {
            coords = await geocodeLocation(location);
          }

          setGeocodingProgress(prev => Math.min(100, prev + Math.round(100 / dayAppts.length)));

          return {
            index: i + 1, // original sorted order
            patientName: appt.title.split(' - ')[0],
            time: format(new Date(appt.date), 'HH:mm'),
            location: location || 'Sin ubicación registrada',
            coords,
            appointment: appt,
          };
        });

        const resolvedStops = await Promise.all(geocodePromises);

        // Sort just in case parallel resolution finishes out of order (though Promise.all preserves mapped index order)
        // Since mapped array gives elements in the exact original array order, we're good.
        setStops(resolvedStops);
        drawMapRoute(resolvedStops);
      } catch {
        setError('Error al cargar las rutas. Por favor intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedDate]);

  // ── Draw markers and OSRM route polyline on the Leaflet map ─────────────────
  const drawMapRoute = async (routeStops: RouteStop[]) => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers and polyline
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (polylineRef.current) { polylineRef.current.remove(); polylineRef.current = null; }

    const geocodedStops = routeStops.filter(s => s.coords !== null);
    if (geocodedStops.length === 0) return;

    // Add numbered markers for each stop
    geocodedStops.forEach((stop, i) => {
      const color = STOP_COLORS[i % STOP_COLORS.length];
      const marker = L.marker(stop.coords as [number, number], {
        icon: createNumberedIcon(stop.index, color),
        title: stop.patientName,
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:180px">
            <div style="font-weight:700;font-size:1rem;margin-bottom:4px">${stop.patientName}</div>
            <div style="color:#6b7280;font-size:0.85rem;display:flex;align-items:center;gap:4px">
              🕐 ${stop.time}
            </div>
            ${stop.location !== 'Sin ubicación registrada' ? `<div style="color:#6b7280;font-size:0.8rem;margin-top:4px">📍 ${stop.location.length > 50 ? stop.location.slice(0, 50) + '…' : stop.location}</div>` : ''}
          </div>
        `);
      markersRef.current.push(marker);
    });

    // Fit map to show all points (origin + stops)
    const allPoints: [number, number][] = [ORIGIN, ...geocodedStops.map(s => s.coords as [number, number])];
    map.fitBounds(L.latLngBounds(allPoints), { padding: [50, 50] });

    // Build OSRM waypoints: origin → stop1 → stop2 → ...
    const waypoints = [ORIGIN, ...geocodedStops.map(s => s.coords as [number, number])];
    const coordsStr = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');

    try {
      // Use overview=simplified instead of overview=full.
      // This reduces point density by ~90% without visually impacting the route, completely eliminating SVG/Canvas render lag.
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=simplified&geometries=geojson`
      );
      if (res.ok) {
        const data = await res.json() as {
          routes: Array<{ geometry: { coordinates: Array<[number, number]> } }>;
        };
        if (data.routes?.length > 0) {
          // OSRM returns [lng, lat]; Leaflet needs [lat, lng]
          const latlngs = data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng] as [number, number]
          );
          polylineRef.current = L.polyline(latlngs, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8,
            smoothFactor: 2.5, // Simplifies the polyline further when zoomed out
            noClip: false,
          }).addTo(map);
        }
      }
    } catch {
      // OSRM unreachable — draw a straight dashed fallback line
      polylineRef.current = L.polyline(waypoints, {
        color: '#94a3b8',
        weight: 3,
        opacity: 0.6,
        dashArray: '8, 6',
      }).addTo(map);
    }
  };

  const prevDay = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const nextDay = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });
  const isToday = isSameDay(selectedDate, new Date());

  /**
   * Persists a new location string to the patient record and immediately
   * re-geocodes the stop on the map without reloading the whole route.
   *
   * Falls back to name-matching when patientId is empty (Google Calendar events
   * don't carry a patientId, so we normalise + fuzzy-match like the route loader does).
   */
  const handleSaveLocation = async () => {
    if (!editingStop || !locationInput.trim()) return;
    setSavingLocation(true);
    try {
      const patients = await getPatients();
      const normalize = (s: string) =>
        s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const normName = normalize(editingStop.patientName);

      // 1st: exact ID match; 2nd: exact name match; 3rd: partial name match
      const patient =
        (editingStop.patientId ? patients.find(p => p.id === editingStop.patientId) : undefined) ??
        patients.find(p => normalize(p.name) === normName) ??
        patients.find(p =>
          normalize(p.name).includes(normName) || normName.includes(normalize(p.name))
        );

      if (!patient) {
        return;
      }

      const newLocation = locationInput.trim();
      await updatePatient({ ...patient, location: newLocation });

      // Re-geocode the updated location
      const newCoords = await geocodeLocation(newLocation);

      // Update stop list and redraw map avoiding the stale-closure bug
      let updatedStops: RouteStop[] = [];
      setStops(prev => {
        updatedStops = prev.map((s, idx) =>
          idx === editingStop.stopIndex
            ? { ...s, location: newLocation, coords: newCoords }
            : s
        );
        return updatedStops;
      });

      // drawMapRoute must run after setStops, so defer one tick
      setTimeout(() => drawMapRoute(updatedStops), 0);
    } catch {
      // Failed to save location
    } finally {
      setSavingLocation(false);
      setEditingStop(null);
      setLocationInput('');
    }
  };

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Navigation size={28} color="var(--color-primary)" /> Rutas del Día
          </h1>
          <p className="page-description">Planificación de visitas a domicilio ordenadas por horario.</p>
        </div>

        {/* Date picker */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'var(--color-surface)', borderRadius: '16px',
          padding: '0.5rem 1rem', border: '1px solid var(--color-border)'
        }}>
          <button className="icon-btn" onClick={prevDay} title="Día anterior"><ChevronLeft size={18} /></button>
          <div style={{ textAlign: 'center', minWidth: '170px' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize' }}>
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
            </div>
            {isToday && <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>HOY</div>}
          </div>
          <button className="icon-btn" onClick={nextDay} title="Día siguiente"><ChevronRight size={18} /></button>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={e => { if (e.target.value) setSelectedDate(new Date(e.target.value + 'T12:00:00')); }}
            style={{
              background: 'transparent', border: 'none', color: 'var(--color-text-muted)',
              cursor: 'pointer', fontSize: '0.8rem',
            }}
            title="Seleccionar fecha"
          />
        </div>
      </header>

      {/* ── Main layout: itinerary sidebar + map ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>

        {/* Itinerary sidebar */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', color: 'var(--color-primary)' }}>
            <Calendar size={18} /> Itinerario
          </h3>

          {/* Origin stop */}
          <div style={{
            display: 'flex', gap: '1rem', alignItems: 'flex-start',
            padding: '1rem', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))',
            border: '1px solid rgba(16,185,129,0.3)'
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#10b981,#059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(16,185,129,0.3)'
            }}>
              <span style={{ fontSize: 16 }}>🏠</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{ORIGIN_NAME}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Punto de partida</div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem', color: 'var(--color-text-muted)' }}>
              <Loader2 size={28} className="animate-spin" color="var(--color-primary)" />
              <div style={{ fontSize: '0.85rem', textAlign: 'center' }}>
                Geocodificando ubicaciones…
                {geocodingProgress > 0 && <div style={{ marginTop: '0.3rem', fontWeight: 600, color: 'var(--color-primary)' }}>{geocodingProgress}%</div>}
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.85rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && stops.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-muted)', background: 'var(--color-background)', borderRadius: '14px', border: '1px dashed var(--color-border)' }}>
              <Calendar size={32} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Sin citas este día</div>
              <div style={{ fontSize: '0.8rem' }}>Seleccioná otra fecha o registrá citas en el calendario.</div>
            </div>
          )}

          {/* Stop list */}
          {!loading && stops.map((stop, i) => (
            <React.Fragment key={stop.appointment.id}>
              {/* Connector line between stops */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '1.1rem' }}>
                <div style={{ width: 2, height: 20, background: 'var(--color-border)', borderRadius: 2 }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  Desplazamiento
                </span>
              </div>

              <div style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                padding: '1rem', borderRadius: '14px',
                background: stop.coords ? 'var(--color-surface)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${stop.coords ? 'var(--color-border)' : 'rgba(245,158,11,0.4)'}`,
                transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50% 50% 50% 0', flexShrink: 0,
                  background: STOP_COLORS[i % STOP_COLORS.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: 'rotate(-45deg)', boxShadow: `0 4px 10px ${STOP_COLORS[i % STOP_COLORS.length]}55`
                }}>
                  <span style={{ transform: 'rotate(45deg)', color: 'white', fontWeight: 800, fontSize: 13 }}>{stop.index}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <User size={12} style={{ marginRight: 4 }} />{stop.patientName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>
                    <Clock size={12} /> {stop.time}
                    <span style={{ marginLeft: 4, fontSize: '0.72rem', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                      {stop.appointment.type}
                    </span>
                  </div>

                  {/* Location row */}
                  {stop.coords ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      <MapPin size={11} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ wordBreak: 'break-word' }}>
                        {stop.location.startsWith('http') ? '📍 Coords extraídas del link' : stop.location}
                      </span>
                    </div>
                  ) : editingStop?.stopIndex === i ? (
                    /* ── Inline editor ── */
                    <div style={{ marginTop: '0.5rem' }}>
                      <input
                        id={`location-input-${i}`}
                        autoFocus
                        value={locationInput}
                        onChange={e => setLocationInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveLocation(); if (e.key === 'Escape') { setEditingStop(null); setLocationInput(''); } }}
                        placeholder="Dirección o link de Google Maps…"
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: 'var(--color-background)',
                          border: '1.5px solid var(--color-primary)',
                          borderRadius: '8px', padding: '5px 10px',
                          fontSize: '0.78rem', color: 'var(--color-text-main)',
                          outline: 'none',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                        <button
                          id={`save-location-${i}`}
                          onClick={handleSaveLocation}
                          disabled={savingLocation || !locationInput.trim()}
                          style={{
                            flex: 1, padding: '4px 0', borderRadius: '7px',
                            background: 'var(--color-primary)', color: 'white',
                            border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                            opacity: savingLocation || !locationInput.trim() ? 0.6 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                          }}
                        >
                          {savingLocation ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                          {savingLocation ? 'Guardando…' : 'Guardar'}
                        </button>
                        <button
                          onClick={() => { setEditingStop(null); setLocationInput(''); }}
                          style={{
                            padding: '4px 10px', borderRadius: '7px',
                            background: 'var(--color-surface)', color: 'var(--color-text-muted)',
                            border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '0.75rem',
                          }}
                        >✕</button>
                      </div>
                    </div>
                  ) : (
                    /* ── Warning + trigger button ── */
                    <button
                      id={`add-location-${i}`}
                      onClick={() => {
                        setEditingStop({ stopIndex: i, patientId: stop.appointment.patientId, patientName: stop.patientName, currentValue: stop.location });
                        setLocationInput(stop.location === 'Sin ubicación registrada' ? '' : stop.location);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        marginTop: '0.25rem',
                        background: 'rgba(245,158,11,0.12)',
                        border: '1px dashed rgba(245,158,11,0.6)',
                        borderRadius: '7px', padding: '4px 8px',
                        cursor: 'pointer', color: '#f59e0b',
                        fontSize: '0.73rem', fontWeight: 600,
                        width: '100%', textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.22)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.12)')}
                    >
                      <MapPin size={11} /> ⚠ Sin coordenadas — clic para agregar ubicación
                    </button>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}

          {/* Summary badge */}
          {stops.length > 0 && !loading && (
            <div style={{
              marginTop: 'auto', padding: '0.75rem 1rem', borderRadius: '12px',
              background: 'var(--color-primary-light)', color: 'var(--color-primary)',
              fontSize: '0.85rem', fontWeight: 600, textAlign: 'center',
              border: '1px solid rgba(59,130,246,0.2)'
            }}>
              {stops.length} visita{stops.length !== 1 ? 's' : ''} programada{stops.length !== 1 ? 's' : ''} •{' '}
              {stops.filter(s => s.coords).length} con ubicación
            </div>
          )}
        </div>

        {/* Leaflet map container */}
        <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative', minHeight: '500px' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '500px' }} />

          {/* Map legend overlay */}
          <div style={{
            position: 'absolute', bottom: '2rem', right: '1rem', zIndex: 1000,
            background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)',
            borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.78rem',
            border: '1px solid rgba(255,255,255,0.12)', color: 'var(--color-text-muted)',
            minWidth: '160px'
          }}>
            <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Leyenda</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
              Base (Club Olimpia)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }} />
              Paradas del día
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 20, height: 3, background: '#3b82f6', borderRadius: 2 }} />
              Ruta sugerida
            </div>
          </div>

          {/* Attribution */}
          {loading && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              zIndex: 1000, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)',
              borderRadius: '16px', padding: '1.5rem 2rem', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Loader2 size={28} className="animate-spin" color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
              <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>Calculando ruta…</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
