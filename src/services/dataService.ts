import { 
  mockPatients, 
  mockAppointments, 
  mockConsultations, 
  mockTemplates,
} from '../data/mockData';
import type { Patient, Appointment, Consultation } from '../data/mockData';

import { 
  isGoogleLinked,
  syncLoginStatusWithBackend,
  callGoogleApi 
} from './authService';

import {
  getPatientsFromSheets,
  savePatientToSheets,
  updatePatientInSheets,
  deletePatientFromSheets,
  getConsultationsFromSheets,
  saveConsultationToSheets,
  getAppointmentsFromSheets,
  saveAppointmentToSheets,
  updateAppointmentInSheets,
  deleteAppointmentFromSheets
} from './sheetsService';

import {
  getAppointmentsFromCalendar,
  saveAppointmentToCalendar,
  updateAppointmentInCalendar,
  deleteAppointmentFromCalendar
} from './calendarService';

export type { Patient, Appointment, Consultation };
export { isGoogleLinked, syncLoginStatusWithBackend, callGoogleApi };

// Función interna para migrar citas existentes de Calendar a Sheets
const syncCalendarToSheets = async (appointments: Appointment[]) => {
  const syncDone = localStorage.getItem('policlinic_calendar_to_sheets_sync_done');
  if (syncDone === 'true' || appointments.length === 0) return;

  console.log(`Iniciando migración de ${appointments.length} citas hacia Sheets...`);
  try {
    // Usamos un bucle secuencial para no saturar la API de Sheets
    for (const appt of appointments) {
      await saveAppointmentToSheets(appt);
      // Pequeña pausa para evitar límites de cuota
      await new Promise(r => setTimeout(r, 200));
    }
    localStorage.setItem('policlinic_calendar_to_sheets_sync_done', 'true');
    console.log('Migración de citas completada con éxito.');
  } catch (error) {
    console.error('Error durante la migración de citas:', error);
  }
};

export const getPatients = async (): Promise<Patient[]> => {
  if (isGoogleLinked()) {
    const parsed = await getPatientsFromSheets();
    if (parsed.length > 0) return parsed;
  }
  return [...(mockPatients as Patient[])];
};

export const getAppointments = async (): Promise<Appointment[]> => {
  if (isGoogleLinked()) {
    const fromSheets = await getAppointmentsFromSheets();
    const syncDone = localStorage.getItem('policlinic_calendar_to_sheets_sync_done') === 'true';

    // Si la sincronización no ha terminado, o si Sheets está vacío, traemos de Calendar también
    if (!syncDone || fromSheets.length === 0) {
      const fromCalendar = await getAppointmentsFromCalendar();
      
      // Si Sheets está totalmente vacío y hay datos en Calendar, disparamos migración
      if (fromSheets.length === 0 && fromCalendar.length > 0 && !syncDone) {
        syncCalendarToSheets(fromCalendar);
      }

      // Fusionar y eliminar duplicados (priorizando Sheets si ya existe el ID)
      const merged = [...fromSheets];
      const sheetIds = new Set(fromSheets.map(a => String(a.id)));
      
      fromCalendar.forEach(calAppt => {
        if (!sheetIds.has(String(calAppt.id))) {
          merged.push(calAppt);
        }
      });

      return merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    
    return fromSheets;
  }
  return [...(mockAppointments as Appointment[])];
};

export const getConsultations = async (): Promise<Consultation[]> => {
  if (isGoogleLinked()) {
    const parsed = await getConsultationsFromSheets();
    if (parsed.length > 0) return parsed;
    return [];
  }
  return [...(mockConsultations as Consultation[])];
};

export const savePatient = async (patient: Partial<Patient>) => {
  if (isGoogleLinked()) {
    await savePatientToSheets(patient);
  }
  (mockPatients as Patient[]).push(patient as Patient);
};

export const updatePatient = async (patient: Patient) => {
  if (isGoogleLinked()) {
    await updatePatientInSheets(patient);
  }
  const mockIdx = (mockPatients as Patient[]).findIndex(p => p.id === patient.id);
  if (mockIdx !== -1) (mockPatients as Patient[])[mockIdx] = patient;
};

export const deletePatient = async (patientId: string) => {
  if (isGoogleLinked()) {
    await deletePatientFromSheets(patientId);
  }
  const idx = (mockPatients as Patient[]).findIndex(p => String(p.id) === String(patientId));
  if (idx !== -1) (mockPatients as Patient[]).splice(idx, 1);
};

export const saveAppointment = async (appointment: Appointment) => {
  if (isGoogleLinked()) {
    // Escritura Dual: Calendar + Sheets
    await Promise.allSettled([
      saveAppointmentToCalendar(appointment),
      saveAppointmentToSheets(appointment)
    ]);
  }
  (mockAppointments as Appointment[]).push(appointment);
};

export const updateAppointment = async (appointment: Appointment) => {
  if (isGoogleLinked()) {
    // Actualización Dual
    await Promise.allSettled([
        updateAppointmentInCalendar(appointment),
        updateAppointmentInSheets(appointment)
    ]);
  }
  const mockIdx = (mockAppointments as Appointment[]).findIndex(a => String(a.id) === String(appointment.id));
  if (mockIdx !== -1) (mockAppointments as Appointment[])[mockIdx] = appointment;
};

export const deleteAppointment = async (appointmentId: string | number) => {
  if (isGoogleLinked()) {
    // Eliminación Dual
    await Promise.allSettled([
        deleteAppointmentFromCalendar(appointmentId),
        deleteAppointmentFromSheets(appointmentId)
    ]);
  }
  const mockIdx = (mockAppointments as Appointment[]).findIndex(a => String(a.id) === String(appointmentId));
  if (mockIdx !== -1) (mockAppointments as Appointment[]).splice(mockIdx, 1);
};

export const saveConsultation = async (consultation: Consultation) => {
  if (isGoogleLinked()) {
    await saveConsultationToSheets(consultation);
  }
  mockConsultations.push(consultation);
};

export const getTemplates = async () => {
  return mockTemplates;
};

export const updatePatientStatus = async (patientId: string | number, status: string) => {
  const patient = mockPatients.find((p: Patient) => String(p.id) === String(patientId));
  if (patient) {
    patient.status = status;
    if (isGoogleLinked()) {
       // Since the full patient update logic is in updatePatient, we can just fetch and update or leave as is if only mock is needed.
       // For better consistency, we should update the sheet too.
       await updatePatient(patient);
    }
  }
};

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'patient' | 'appointment' | 'consultation';
  link: string;
}

export const globalSearch = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];

  try {
    const [patients, appointments, consultations] = await Promise.all([
      getPatients(),
      getAppointments(),
      getConsultations()
    ]);

    // Patients
    patients.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      String(p.id).toLowerCase().includes(lowerQuery) ||
      (p.email && p.email.toLowerCase().includes(lowerQuery))
    ).forEach(p => results.push({
      id: String(p.id),
      title: p.name,
      subtitle: `Paciente • ID: ${p.id}`,
      type: 'patient',
      link: `/patients/${p.id}`
    }));

    // Appointments
    appointments.filter(a => 
      a.title.toLowerCase().includes(lowerQuery)
    ).forEach(a => results.push({
      id: String(a.id),
      title: a.title,
      subtitle: `Cita • ${new Date(a.date).toLocaleDateString()}`,
      type: 'appointment',
      link: `/appointments`
    }));

    // Consultations
    consultations.filter(c => 
      (c.patientName && c.patientName.toLowerCase().includes(lowerQuery)) ||
      (c.summary && c.summary.toLowerCase().includes(lowerQuery))
    ).forEach(c => results.push({
      id: String(c.id),
      title: c.patientName || 'Consulta de Paciente',
      subtitle: `Evaluación • ${c.summary}`,
      type: 'consultation',
      link: `/consultations/${c.id}`
    }));
  } catch (error) {
    console.error('Error in globalSearch:', error);
  }

  return results.slice(0, 10);
};
