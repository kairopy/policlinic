import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { PatientsList } from './pages/Patients/PatientsList';
import { PatientDetail } from './pages/Patients/PatientDetail';
import { CreatePatient } from './pages/Patients/CreatePatient';
import { CalendarView } from './pages/Appointments/Calendar';
import { CreateAppointment } from './pages/Appointments/CreateAppointment';
import { ConsultationHistory } from './pages/Consultations/History';
import { Templates } from './pages/Templates/Templates';
import './App.css';

// Placeholder pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="animate-fade-in flex-center" style={{ height: '100%', flexDirection: 'column', gap: '1rem' }}>
    <h1 style={{ color: 'var(--color-text-muted)' }}>{title}</h1>
    <p>Under construction...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="patients">
            <Route index element={<PatientsList />} />
            <Route path="new" element={<CreatePatient />} />
            <Route path=":id" element={<PatientDetail />} />
          </Route>
          <Route path="appointments">
            <Route index element={<CalendarView />} />
            <Route path="new" element={<CreateAppointment />} />
          </Route>
          <Route path="consultations" element={<ConsultationHistory />} />
          <Route path="templates" element={<Templates />} />
          <Route path="settings" element={<Placeholder title="Settings" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
