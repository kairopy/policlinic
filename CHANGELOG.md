# Changelog

All notable changes to the `policlinic` project will be documented in this file.

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
