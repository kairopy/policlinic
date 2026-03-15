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
- **Vanilla CSS over Tailwind**: Decided per project directive to maximize stylistic control and achieve an immediate "wow factor". Custom variables allow effortless theming.
- **Mock Data Layer (`src/data/mockData.ts`)**: Built a structural mock schema to rapidly iterate on the frontend without a dedicated backend blocker. Can be easily swapped for an API service later.
- **Dynamic Dashboard Logic**: Replaced placeholders on the Dashboard with dynamic React calculation logic leveraging functions from `date-fns` to sort by `isSameDay` filtering and `reduce` accumulators for real numeric feedback on Revenue and Consultations.
