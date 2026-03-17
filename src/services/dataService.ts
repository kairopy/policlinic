import { mockPatients, mockAppointments, mockConsultations, mockTemplates } from '../data/mockData';

const GOOGLE_CONNECTED_KEY = 'google_connected';
const SHEETS_ID_KEY = 'google_sheets_id';
const CALENDAR_ID_KEY = 'google_calendar_id';
const WEBHOOK_URL_KEY = 'n8n_webhook_url';

export interface Patient {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'in_treatment' | 'pending_control' | 'completed' | string;
  lastVisit: string;
  createdAt: string;
  notes?: string;
  appointments?: Appointment[];
}

export interface Appointment {
  id: string | number;
  patientId: string;
  title: string;
  date: Date | string;
  duration: number;
  time?: string;
  type: string;
  status: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName?: string;
  date: string;
  time?: string;
  doctor: string;
  summary: string;
  type: string;
  status: string;
  cost: number;
  symptoms: string;
  treatment: string;
  recommendations: string;
  recoveryTime: string;
  notes?: string;
}

export const isGoogleLinked = () => localStorage.getItem(GOOGLE_CONNECTED_KEY) === 'true';

// Helper to fetch from n8n or Google directly
const fetchFromIntegration = async (endpoint: string): Promise<unknown[] | null> => {
  try {
    const webhookUrl = localStorage.getItem(WEBHOOK_URL_KEY);
    const sheetsId = localStorage.getItem(SHEETS_ID_KEY);
    const calendarId = localStorage.getItem(CALENDAR_ID_KEY);
    
    if (!webhookUrl) {
      console.warn('n8n Webhook URL not set. Falling back to mock data for', endpoint);
      return null;
    }

    const url = new URL(webhookUrl);
    if (sheetsId) url.searchParams.append('sheetsId', sheetsId);
    if (calendarId) url.searchParams.append('calendarId', calendarId);
    url.searchParams.append('endpoint', endpoint);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json() as unknown[];
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    return null;
  }
};

export const getPatients = async (): Promise<Patient[]> => {
  if (isGoogleLinked()) {
    const data = await fetchFromIntegration('patients');
    if (data) return data as Patient[];
  }
  return mockPatients;
};

export const getAppointments = async (): Promise<Appointment[]> => {
  if (isGoogleLinked()) {
    const data = await fetchFromIntegration('appointments');
    if (data) {
      // Ensure dates are actual Date objects
      return (data as Appointment[]).map((a: Appointment) => ({ ...a, date: new Date(a.date) }));
    }
  }
  return mockAppointments;
};

export const getConsultations = async (): Promise<Consultation[]> => {
  if (isGoogleLinked()) {
    const data = await fetchFromIntegration('consultations');
    if (data) return data as Consultation[];
  }
  return mockConsultations as Consultation[];
};

export const savePatient = async (patient: Partial<Patient>) => {
  if (isGoogleLinked()) {
    const webhookUrl = localStorage.getItem(WEBHOOK_URL_KEY);
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_patient', data: patient })
      });
    }
  }
  (mockPatients as Patient[]).push(patient as Patient);
};

export const saveAppointment = async (appointment: Appointment) => {
  if (isGoogleLinked()) {
    const webhookUrl = localStorage.getItem(WEBHOOK_URL_KEY);
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationType: 'appointment', ...appointment })
      });
    }
  }
  (mockAppointments as Appointment[]).push(appointment);
};

export const saveConsultation = async (consultation: Consultation) => {
  if (isGoogleLinked()) {
    const webhookUrl = localStorage.getItem(WEBHOOK_URL_KEY);
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationType: 'consultation', ...consultation })
      });
    }
  }
  mockConsultations.push(consultation);
};

export const getTemplates = async () => {
  return mockTemplates; // Templates are local for now
};

export const updatePatientStatus = async (patientId: string, status: string) => {
  if (isGoogleLinked()) {
    const webhookUrl = localStorage.getItem(WEBHOOK_URL_KEY);
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_patient_status', data: { patientId, status } })
      });
    }
  }
  const patient = mockPatients.find((p: Patient) => p.id === patientId);
  if (patient) patient.status = status;
};
