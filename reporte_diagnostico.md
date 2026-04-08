# Reporte Diagnóstico: Arquitectura y Deuda Técnica

**Fecha de Auditoría:** Abril 2026
**Proyecto:** Policlinic (Electron + Vite + React + Node.js)
**Objetivo:** Análisis profundo de estructura, áreas críticas y deuda técnica funcional.

---

## 1. Topología y Arquitectura del Sistema

El proyecto opera bajo un modelo **Híbrido de Escritorio (Electron) con Backend Integrado**:
*   **Capa de Presentación (Frontend):** React 19 + TypeScript compilado con Vite. Utiliza enrutamiento en hash (`HashRouter`) para compatibilidad estable con el protocolo `file://` de Electron. Diseño altamente responsivo (glassmorphism, CSS Modules/variables globales).
*   **Capa de Comunicación (Backend Core):** Servidor local Express en Node.js (Puerto `3001`). Su principal y casi única responsabilidad es manejar el farragoso flujo de **OAuth2 de Google**, resguardar el `refresh_token` nativamente en el OS (AppData/.config) y despachar `access_tokens` al cliente.
*   **Capa de Persistencia (BaaS):** Inexistencia de base de datos relacional tradicional. **Google Sheets y Google Calendar actúan como la base de datos principal** de la clínica, controlada bajo la API REST a través del `dataService.ts`.

> [!TIP]
> **Acierto Arquitectónico:** Delegar el refresh_token al entorno seguro de Node.js (Express) en lugar de exponerlo en el `localStorage` del frontend de Electron previene brechas críticas de seguridad y cierres de sesión abruptos.

---

## 2. Áreas Críticas (Cuellos de Botella Técnicos)

Tras analizar los componentes y los logs de compilación (`tsc` reportó 0 errores, un trabajo de tipado sólido), el sistema cuenta con fuertes puntos de presión técnica:

### A. El "God Object" (`src/services/dataService.ts`)
Con **casi 900 líneas y 32 KB**, este archivo es el riesgo de mantenibilidad número uno.
*   **Qué hace:** Maneja fetching HTTP (`callGoogleApi`), parsea IDs, formatea fechas Excel serializadas a un formato estándar, gestiona caché agresivo manual en memoria local, renderiza la estructura completa de encabezados para inicializar documentos nuevos de Sheets, administra el CRUD de pacientes, consultas y Google Calendar.
*   **Riesgo:** Alta fragilidad ante cambios. Un error de tipado o un cambio transaccional o de formato rompe todo el flujo de datos global de la aplicación.

### B. Gestión de Estado y Caché Fragilizada
Actualmente, la sincronización entre componentes y Google Workspace se basa en un caché forzado de TTL (Time to Live) configurado estáticamente.
*   **Problema:** Operaciones combinadas (Crear Paciente + Crear Cita) a menudo requieren llamadas imperativas anexas como `clearDataCache()` o parámetros booleanos `forceRefresh = true` esparcidos en la UI (`AnalyticsPage`, `History`), lo que indica fuerte acoplamiento entre la interfaz visual y la caducidad temporal local.

### C. Backend Monolítico Simple
*   El archivo `server/index.js` no cuenta con separación de rutas. Autenticación, validación de estado de archivos de sesión y logs conviven crudos en el bloque principal.

---

## 3. Matriz de Deuda Técnica y Funcional

| Nivel de Deuda | Componente o Flujo | Descripción y Razonamiento | Nivel de Riesgo | Recomendación |
| :--- | :--- | :--- | :--- | :--- |
| **Alta** | Arquitectura de Datos (`dataService.ts`) | Altísimo nivel de acoplamiento. La falta de separación dificulta introducir bases de datos. | 🔴 Crítico | Desacoplar urgentemente a clases/servicios como `SheetsService.ts`, `CalendarService.ts`. |
| **Alta** | Manejo de Estado Server-Client | Asincronía flotante que causa parpadeos visuales al renderizar nuevas vistas (stale cache). | 🔴 Crítico | Migrar imperiosamente la captura de datos a **TanStack Query (React Query)** garantizando re-fetching inteligente. |
| **Media** | Seguridad Local del Token | El token OAuth2 Refresh se guarda en texto plano via `fs.writeFileSync` (Tokens_path). | 🟡 Moderado | Utilizar APIs nativas criptográficas (como `keytar` o el keystore de Windows) para Electron. |
| **Media** | Code Splitting & Performance | `App.tsx` renderiza toda la estructura de forma asíncrona. A mediano plazo, aumentará el cold-start. | 🟡 Moderado | Implementar `React.lazy()` en módulos densos como reportes, Mapas y Analytics. |

---

## 4. Veredicto Final (@codebase-audit-pre-push)

El código ha sido fuertemente estandarizado y el cumplimiento de Typescript/ESlint está en `100% Passed`, demostrando que no existen fugas de memoria o errores de bloque sin atrapar. 
Se ha modelado perfectamente el MVP. El siguiente paso, si el proyecto debe escalar horizontalmente (más usuarios, más clínicas, analíticas masivas), consiste en **refactorizar `dataService.ts` a un cliente API moderno** interconectado con un control de estado reactivo global.
