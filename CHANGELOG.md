# Changelog

All notable changes to the `policlinic` project will be documented in this file.

## [Phase 16] - 2026-04-01 - Proyecto Titán: Modernización de Arquitectura con React Query

### Added
- **TanStack Query Integración**: Implementación de `@tanstack/react-query` como motor de sincronización de estado y caché.
- **Custom Hooks (`src/hooks/queries/`)**: 
  - `usePatients`: CRUD reactivo para pacientes.
  - `useConsultations`: Historización y plantillas.
  - `useAppointments`: Gestión de agenda con invalidación automática.
- **Servicios Especializados**: Desacoplamiento de `dataService.ts` en `authService.ts`, `sheetsService.ts` y `calendarService.ts`.

### Modified
- **Refactorización de Vistas Core**: Migración total de `Dashboard`, `History`, `Calendar`, `PatientsList`, `PatientDetail`, `PatientForm`, `CreateAppointment` y `CreateConsultation` para eliminar `useEffect` imperativos y estados locales duplicados.
- **Sincronización Automática**: El sistema ahora invalida la caché automáticamente tras mutaciones, eliminando la necesidad de recargas manuales (F5).
- **Consolidación de Brand**: Reemplazo global de "Lic. Karina" por "Ariel Cespedes Fisioterapeuta" en reportes e interfaces.

### Security
- **Data Integrity**: Se eliminaron los "Silent Failures" en la capa de datos; los hooks ahora manejan estados de error nativos de React Query.

## [Phase 15] - 2026-04-01 - Auditoría de Seguridad y Refactorización de Deuda Técnica

### Security
- **Express Server Bind Port**: Se securizó `server/index.js` restringiendo el bind del servidor Node.js al loopback local (`127.0.0.1`) previniendo ataques externos e intercepción de tokens OAuth en la misma red local.
- **Limpieza de Cajas Negras**: Eliminatoria absoluta de `console.error` y `console.log` sin control en producción.

### Modified
- **dataService.ts**: Reemplazados múltiples `console.error` anidados que devoraban excepciones. Ahora lanzan `throw new Error()` permitiendo que la capa de UI intercepte fallos de Google APIs y geolocalización.
- **Frontend UI**: `CreateAppointment.tsx`, `CreateConsultation.tsx`, `PatientDetail.tsx`, `PatientForm.tsx`, `MainLayout.tsx` y `RoutesPage.tsx` fueron refactorizados para atrapar errores de red silenciosos y desplegarlos visualmente vía `NotificationContext` usando esquemas de `try/catch` limpios, eliminando variables inutilizadas. Linting pasivo de todo el proyecto resuelto.

## [Phase 14] - 2026-03-28 - Fisioterapia a Domicilio (Ariel Cespedes)

### Added
- geocoding.ts (NEW): Extrae coords de URLs de Google Maps (regex), fallback Nominatim, cache sessionStorage, sanitizacion XSS.
- RoutesPage.tsx (NEW): Mapa Leaflet + OSRM, origen Club Olimpia, marcadores numerados, itinerario lateral, navegacion de fechas.

### Modified
- mockData.ts: Campo location en Patient.
- dataService.ts: Hoja renombrada, columna Ubicacion J con CRUD completo.
- PatientForm.tsx: Campo location con previsualizacion link.
- PatientDetail.tsx: Ubicacion como link seguro a Google Maps o texto plano.
- Sidebar.tsx: Item Rutas (Navigation icon), rebrand a Ariel Cespedes.
- App.tsx: Ruta /routes registrada.

### Security
- sanitizeGoogleMapsUrl() previene XSS.
- Links externos con rel=noopener noreferrer.

## [Unreleased] - Initial MVP Scaffold

### Added
- **Core Design System**: Implemented a bespoke Vanilla CSS system (`src/index.css`) establishing a modern, premium aesthetic (Deep blue, Teal, White, and a robust Dark Mode foundation). Completely bypassed CSS frameworks to ensure maximum flexibility and dynamic UI elements.
- **Routing & Layout Architecture**: Established a central `MainLayout` wrapping `react-router-dom` views. Composed of an interactive `Sidebar` and `Header` ensuring frictionless navigation.
- **Dashboard View (`src/pages/Dashboard.tsx`)**: Created the command center displaying aggregate stats (Total Patients, Appointments Today) and a quick overview of upcoming schedules.
- **Patients CRM (`src/pages/Patients/`)**: 
  - `PatientsList.tsx`: Developed a filterable list table with aesthetic highlighting and layout.
  - `PatientDetail.tsx`: Implemented a deep-dive view rendering medical summaries, contact info, and embedded consultation history logs.
- **Appointments Calendar (`src/pages/Appointments/`)**:
  - `Calendar.tsx`: Assembled an interactive monthly visualizer utilizing `date-fns` for robust date math, skipping heavy calendar libraries.
  - `CreateAppointment.tsx`: Built an intuitive scheduling form with aesthetic HTML5 native inputs.
- **Consultation History (`src/pages/Consultations/History.tsx`)**: Created an aggregated view of past clinical encounters.
- **Templates Editor (`src/pages/Templates/Templates.tsx`)**: Implemented a responsive multi-panel layout acting as an MVP for standard medical document authoring.

### Security & Static Analysis
# Changelog

All notable changes to the `policlinic` project will be documented in this file.

## [Phase 14] - 2026-03-28 - Fisioterapia a Domicilio (Ariel Cespedes)

### Added
- geocoding.ts (NEW): Extrae coords de URLs de Google Maps (regex), fallback Nominatim, cache sessionStorage, sanitizacion XSS.
- RoutesPage.tsx (NEW): Mapa Leaflet + OSRM, origen Club Olimpia, marcadores numerados, itinerario lateral, navegacion de fechas.

### Modified
- mockData.ts: Campo location en Patient.
- dataService.ts: Hoja renombrada, columna Ubicacion J con CRUD completo.
- PatientForm.tsx: Campo location con previsualizacion link.
- PatientDetail.tsx: Ubicacion como link seguro a Google Maps o texto plano.
- Sidebar.tsx: Item Rutas (Navigation icon), rebrand a Ariel Cespedes.
- App.tsx: Ruta /routes registrada.

### Security
- sanitizeGoogleMapsUrl() previene XSS.
- Links externos con rel=noopener noreferrer.

## [Unreleased] - Initial MVP Scaffold

### Added
- **Core Design System**: Implemented a bespoke Vanilla CSS system (`src/index.css`) establishing a modern, premium aesthetic (Deep blue, Teal, White, and a robust Dark Mode foundation). Completely bypassed CSS frameworks to ensure maximum flexibility and dynamic UI elements.
- **Routing & Layout Architecture**: Established a central `MainLayout` wrapping `react-router-dom` views. Composed of an interactive `Sidebar` and `Header` ensuring frictionless navigation.
- **Dashboard View (`src/pages/Dashboard.tsx`)**: Created the command center displaying aggregate stats (Total Patients, Appointments Today) and a quick overview of upcoming schedules.
- **Patients CRM (`src/pages/Patients/`)**: 
  - `PatientsList.tsx`: Developed a filterable list table with aesthetic highlighting and layout.
  - `PatientDetail.tsx`: Implemented a deep-dive view rendering medical summaries, contact info, and embedded consultation history logs.
- **Appointments Calendar (`src/pages/Appointments/`)**:
  - `Calendar.tsx`: Assembled an interactive monthly visualizer utilizing `date-fns` for robust date math, skipping heavy calendar libraries.
  - `CreateAppointment.tsx`: Built an intuitive scheduling form with aesthetic HTML5 native inputs.
- **Consultation History (`src/pages/Consultations/History.tsx`)**: Created an aggregated view of past clinical encounters.
- **Templates Editor (`src/pages/Templates/Templates.tsx`)**: Implemented a responsive multi-panel layout acting as an MVP for standard medical document authoring.

### Security & Static Analysis
- Configured local environment for strict typings (`tsc --noEmit`).
- Set up strict linting rules and rectified initial 'any' typings in components.
- Performed initial `npm audit` confirming 0 vulnerabilities across all installed packages.

### Architectural Decisions
- **Vanilla CSS Exclusivity**: Bypassed Tailwind dependency in favor of robust, hand-written CSS Variables and generic `.glass-panel` utility classes. Follows the "premium dynamic minimal interface" directive. 
- **Mock Data Layer**: Built `mockPatients`, `mockConsultations` and `mockAppointments` globally inside `/data/mockData.ts` to simulate a live database backend.
### Phase 3: Configuration & Theming (Hotfixes)
- **Dark Mode Support**: Deployed a `ThemeProvider` context to inject the `.dark` utility scope globally to `<html/>`, seamlessly switching root variables to dark tones. Added `color-scheme: dark` to ensure native browser date/time pickers adopt the dark mode.
- **Complete Translations**: Refactored `CreatePatient.tsx`, `CreateAppointment.tsx`, and `Templates.tsx` to pull strings exclusively from the custom `i18n` dictionary mappings. Eliminated hardcoded background `white` values causing styling conflicts in the document template editor.
- **Dynamic Dashboard Logic**: Replaced all hardcoded integers in the Dashboard with dynamic `.filter` and `.reduce` computations mapping over the global mock database to simulate real-time metrics reading.
- **Global i18n Context**: Implemented a dependency-free custom React Context (`LanguageProvider`) to manage bilingual states (EN/ES) and nested dictionary mapping (`t(key)`) natively without relying on heavy external libraries like `react-i18next`.

### Phase 4: Frontend Overhaul 
- **Premium Typography**: Upgraded system fonts to Google's variable `Plus Jakarta Sans` for geometric, high-craft legibility across all views.
- **UI/UX Refinement (Templates)**: Executed a massive redesign on the template editor (`Templates.tsx`). Escaped the generic 2-column grid in favor of an elevated, glassmorphic "Floating Document A4" look.
- **Rich User Illusion**: Added a stylized mock WYSIWYG toolbar over the editing area and implemented elegant state micro-animations for navigating the notes repository.t by `isSameDay` filtering and `reduce` accumulators for real numeric feedback on Revenue and Consultations.

### Phase 5: Clinical Workflow Expansion
- **New Consultation UI (`CreateConsultation.tsx`)**: Developed a deeply intentional, premium aesthetic view for registering daily consultations. Included structural spacing, subtle glassmorphism textures on the background panels, and visual hierarchy using `lucide-react` icons.
- **Dynamic Pre-Filtering**: The "Select Patient" dropdown is now contextually aware. It filters the global database and exclusively shows patients who have an active appointment *scheduled for the current day*.
- **Template Auto-Fill Integration**: Centralized the `mockTemplates` dictionary to the global data store. When a doctor selects a template (e.g., "General Checkup Notes") from the dropdown, the form instantly maps and auto-fills the large clinical notes `textarea`.
- **Drag-and-Drop Image Proxies**: Designed premium placeholder "Dropzones" for attaching "Before & After" photographic clinical evidence.
- **Consultation Form UX Revision**: Removed rich-text bloat in favor of native, auto-expanding plain `textarea` elements for a distraction-free typing experience.
- **Customizable Datetime Context**: Added `Date` and `Time` inputs to the Consultation form that auto-initialize to the current timestamp but remain freely editable.
- **Dashboard Action Addition**: Added a highly visible, primary-tinted `Nueva Consulta` Quick Action button on the Dashboard.
- **Bilingual Architecture Expansion**: Expanded both the `en.ts` and `es.ts` dictionaries introducing an entire `consultation` mapping tree. Fully functional immediate locale swapping across the new interface.
- **Multi-Field Standardized Templates**: Overhauled mockup templates representation branching into 5 contextual nodes (Symptoms, Treatment, Recommendations, Recovery Time, Notes). Clicking a template triggers direct full mapping inside the consultations flow form inputs rather than just general appends.
- **Template Manager Panel Expansion**: The static reader is now a modular grid supporting individual layout nodes. Clicking 'Editar' allows mutating mock nodes across individual scoped bounds or declaring entire `Nueva Plantilla` empty scopes without losing view context frames.

### Phase 6: Patient Status System Redefinition
- **Podiatry-Specific Statuses**: Replaced generic statuses with "En Tratamiento", "Alta Médica", "Mantenimiento", and "Control Pendiente".
- **Visual Status Badges**: Implemented unique color-coded badges in `PatientsList.tsx` for immediate visual triaging of patient states.
- **Consultation Status Integration**: Added a premium status selector to `CreateConsultation.tsx`, allowing doctors to update the patient's global clinical status directly from the new encounter form.
- **Dashboard Improvements**: Fixed empty space, implemented real trend calculations comparing with the previous month, and added a "Recent Patients" section.
- **Comprehensive Localization**: Fully translated `PatientDetail.tsx` to Spanish and updated its status badge logic to match the new podiatry system.

### Phase 7: Dashboard Analytics & Layout Optimization
- **Dynamic Trend Engine**: Implemented real-time percentage calculations for all StatCards (Patients, Appointments, Consultations, Revenue) by comparing current month performance against the full previous month.
- **Same-Day Historical Comparison**: The "Appointments Today" trend specifically compares current daily volume against the same calendar day of the previous month.
- **Layout Expansion**: Resolved the "empty space" issue by introducing a **"Pacientes Recientes"** grid and a **"Consejo del Día"** informational panel.
- **Visual Polish**: Upgraded StatCards with trend icons (ArrowUp/Down) and background-tinted badges for better data readability.
- **Profile History Actions**: Fixed "Ver Detalles" and "Imprimir Reporte" buttons in the patient's consultation history by introducing a shared `ConsultationDetailModal` and connecting the reporting engine.
- **Data Enrichment**: Expanded `mockData.ts` with detailed clinical records including symptoms and treatments for better UI testing.
- **Patient Profile Editing**: Fixed the non-functional "Editar Perfil" button by refactoring the registration flow into a unified `PatientForm.tsx` that supports both creation and localized profile updates.
- **Route Modernization**: Added `:id/edit` deep-linking for patients and updated `App.tsx` routing architecture.
- **Full Profile Localization**: Refactored `PatientDetail.tsx` to support the new translation dictionary and podiatry-specific statuses.
- **Refactor de Historial**: Se implementó el ordenamiento de tablas, filas clickables y se integró la acción de impresión en el modal de detalles.
- **Corrección de Citas**: Se activó el botón de "Confirmar Cita" con lógica de persistencia y redirección.
- **Traducción de Consultas**: Se corrigieron los tipos de consulta hardcodeados y se localizaron los estados del paciente.
- **Consultation Details**: Integrated print action directly into the reusable `ConsultationDetailModal` and removed redundant action columns.
### Phase 8: Google Workspace Integration & Production Hardening
- **Dynamic Google Sheets/Calendar Sync**: Integrated n8n webhooks in `dataService.ts` for real-time patient and appointment synchronization with Google Workspace.
- **Settings Dashboard**: Developed a premium configuration UI for linking Google accounts via Webhook URLs and Sheet/Calendar IDs.
- **Strict Type Architecture**: Eliminated `any` types across `CreateAppointment`, `PatientForm`, and `Dashboard`. Standardized string-based IDs for project-wide consistency.
- **Defensive Data Layer**: Implemented asynchronous loading states and robust error handling for external integration fallbacks.
- **Auto-Read Logic**: Implemented intelligent state management to mark all as read or clear the history directly from the dropdown UI.
- **Production-Grade Refinement**: Resolved all Fast Refresh and strict type warnings in the notification logic to maintain a 100% clean lint status.

### Phase 10: Mandatory Google Connection Gate
- **Authentication Gateway Modal**: Implemented `GoogleLinkPortal.tsx` to ensure core data integrity. If a new session detects an unlinked state, an un-dismissable React Portal modal is injected at the root layer.
- **Premium Onboarding UX**: Styled with deep glassmorphism aesthetics, utilizing the application's signature gradients and iconography to provide a frictionless onboarding flow.
- **Embedded OAuth2 Authorization**: Integrated the Google Identity Services SDK directly into the modal action button, allowing users to authenticate without leaving the application context.
- **State Aware**: Utilizes the `isGoogleLinked` utility injected automatically in `MainLayout.tsx` and constantly polls for link state to support multi-tab concurrent authentications.

### Phase 11: Backend OAuth Provider (Bypass 1-hour limits)
- **Node.js Gateway**: Created an independent Node.js / Express backend using `googleapis` to manage authentication robustly.
- **Offline Refresh Flow**: Migrated OAuth consent process to `access_type=offline` to obtain a permanent `refresh_token`.
- **Frontend Proxying**: Frontend `dataService.ts` now securely proxies through the local backend port 3001 to fetch renewed access tokens automatically without user intervention.
- **Zero-downtime Token Renewals**: The system checks for 401 Unauthorized API responses from Google and silently replaces the token on-the-fly, creating a seamless eternal session.

### Phase 12: Interactive Podogram Module (Phase 4 of MVP)
- **Interactive Foot Mapping Canvas (`Podograma.tsx`)**: Created a dedicated, encapsulated React component to host an interactive visual map for clinical pathology plotting.
- **Architectural Flexibility**: The component defaults to a generalized plantar SVG topology but accepts custom real-foot photography uploads via an embedded file reader, satisfying real clinical variance.
- **Draggable Coordinate Markers**: Built a positional coordinate system (`x%`, `y%`) leveraging `lucide-react` iconography for distinct pathology types (Warts, Calluses, Ulcers, Fungal Infections).
- **Relational Persistence (`dataService.ts`)**: Expanded the Google Sheets consultation matrix schema, adding the `PodogramaData` tail column to absorb the JSON-stringified visual payload (imageUrl, distinct point clouds, clinical notes).
- **Omnipresent Readability (`ConsultationDetailModal.tsx`)**: Rendered the same visualizer module in a `readOnly={true}` configuration mapped atop historical consultations for zero-friction medical reviews.

### Phase 13: Electron Production Hotfixes (GUI Validation)
- **Resolved Invisible DOM**: Tracked down a white-screen rendering issue within the native Windows Electron build. Discovered an overflow constraint caused by `electron-app` wrapper interacting unpredictably with `100vh` boundaries.
- **Refactored Root Scope**: Eliminated `.electron-app` dependency in favor of robust, pre-calculated Tailwind CSS primitives (`min-h-screen`, `w-full`, `h-[100vh]`) guaranteeing global viewport occupation.
- **Podogram Static Background**: Upgraded the `Podograma.tsx` architecture to point to an external `plantilla-pies.png` image base natively instead of an inline SVG, enabling immediate customization for clinical templates.
- **Consultation UX Validation**: Removed the hard lock on the consultation "Save" button when no patient is selected. The application now displays a graceful warning notification instead, improving user feedback and reducing friction.
- **Global Toast Engine**: Refactored the `NotificationContext` to spawn premium, glassmorphic Toast alerts using React Portals. Toasts now dynamically render at `z-index: 9999999` to ensure visibility over absolute scope components like sliding panels and backdrop modals.
- **Audio Feedback Engine**: Engineered a dependency-free, ambient Web Audio API synthesizer that plays a modern dual-tone gentle notification sound (`A5-A6`) whenever a Toast is triggered.
- **Empty State Data Hydration**: Resolved a fallback anomaly in `dataService.ts` where clearing the Google Sheets database incorrectly triggered the hydration of local mock variables. The system now accurately calculates and yields zero-length arrays (`[]`) when a connected API response registers as strictly null or detached.
- **Consultation Print Decoupling**: Conducted a final global search for static data traces and discovered `PrintConsultation.tsx` was directly hardcoded to the local mock database. Refactored the print view to consume the unified `dataService.ts` asynchronously, guaranteeing printable records match live Google Sheet elements flawlessly.
- **Native OS Print Proxy**: Configured the internal Node backend to serve Vite static bundles, and deployed an Electron IPC interceptor for all `/print/` endpoints. All print requests are now safely proxy-routed out of the Chromium Electron constraints directly into the user's native system browser (e.g. Chrome/Edge), allowing for full, uninhibited PDF generation and preview capabilities.
- **Production Asset Encapsulation**: Updated the `electron-builder` NSIS configuration within `package.json` to explicitly whitelist strict inclusion of the `server/.env` file. This guarantees that Google OAuth credentials survive the application bundling process and execute flawlessly on local clients.

