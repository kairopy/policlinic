# Changelog - Policlinic

## [2026-04-02] - Estabilización Crítica y Sincronización Automática

### 🚀 Mejoras
- **Sincronización de Consultas**: Implementada la invalidación de caché automática (`queryClient.invalidateQueries`) al crear una nueva consulta. Ya no es necesario pulsar el botón de sincronización manualmente para ver los datos en el historial.

### 🛠️ Correcciones de Errores (Bug Fixes)
- **Error de Pantalla Blanca (Fatal)**: Se identificó y resolvió un error de nivel de carga de módulo. `CreateAppointment.tsx` intentaba importar el hook `useUpdateAppointment` que no estaba presente en `useAppointments.ts`. 
- **Estabilidad del Dashboard**: Corregida la lógica de iniciales de avatar en `Dashboard.tsx` (`split(' ')[1][0]`). Ahora usa encadenamiento opcional y valores por defecto para evitar colapsos de ejecución cuando los datos de Google Sheets son incompletos.
- **Persistencia de Estado**: Optimizado el uso de `useMemo` para el `QueryClient` en `App.tsx` para mantener el estado estable durante recargas en caliente (HMR).

### 🏗️ Cambios de Arquitectura
- **Restauración de Infraestructura**: Reconstrucción limpia de `main.tsx` y `App.tsx`, eliminando dependencias circulares potenciales y asegurando el orden correcto de los Providers (`Theme`, `Language`, `Notification`).
- **HashRouter**: Confirmada la estabilidad de la navegación mediante HashRouter para compatibilidad total con el sistema de archivos de Electron.

---
*Documentado por Antigravity - Defensive Architect Mode*
