import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import TitleBar from './components/layout/TitleBar';
import './App.css';

function App() {
  const win = window as unknown as { process?: { type?: string } };
  const isElectron = win.process && win.process.type === 'renderer';

  return (
    <BrowserRouter>
      <div className={isElectron ? 'electron-app' : 'min-h-screen flex flex-col'}>
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
    </BrowserRouter>
  );
}

export default App;
