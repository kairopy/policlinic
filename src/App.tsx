import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { PatientsList } from './pages/Patients/PatientsList';
import { PatientDetail } from './pages/Patients/PatientDetail';
import { PatientForm } from './pages/Patients/PatientForm';
import { CalendarView } from './pages/Appointments/Calendar';
import { CreateAppointment } from './pages/Appointments/CreateAppointment';
import { ConsultationHistory } from './pages/Consultations/History';
import { CreateConsultation } from './pages/Consultations/CreateConsultation';
import { PrintConsultation } from './pages/Consultations/PrintConsultation';
import { Templates } from './pages/Templates/Templates';
import { Settings } from './pages/Settings';
import { RoutesPage } from './pages/Routes/RoutesPage';
import { AnalyticsPage } from './pages/Analytics/AnalyticsPage';
import TitleBar from './components/layout/TitleBar';
import './App.css';

// Configuración persistente de React Query - FUERA del ciclo de renderizado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Siempre validar contra el service
      retry: 1, // Reducir reintentos para fallos rápidos
      refetchOnWindowFocus: true, 
    },
  },
});

function App() {
  const win = window as unknown as { process?: { type?: string } };
  const isElectron = win.process && win.process.type === 'renderer';

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
      <div className="min-h-screen flex flex-col relative w-full h-[100vh] overflow-hidden bg-[var(--color-background)]">
        {isElectron && <TitleBar />}
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="patients">
              <Route index element={<PatientsList />} />
              <Route path="new" element={<PatientForm />} />
              <Route path=":id" element={<PatientDetail />} />
              <Route path=":id/edit" element={<PatientForm />} />
            </Route>
            <Route path="appointments">
              <Route index element={<CalendarView />} />
              <Route path="new" element={<CreateAppointment />} />
            </Route>
            <Route path="routes" element={<RoutesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="consultations">
              <Route index element={<ConsultationHistory />} />
              <Route path="new" element={<CreateConsultation />} />
            </Route>
            <Route path="templates" element={<Templates />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="print/consultation/:id" element={<PrintConsultation />} />
        </Routes>
      </div>
    </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
