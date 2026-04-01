import { callGoogleApi } from './authService';
import type { Appointment } from '../data/mockData';
import { mockAppointments } from '../data/mockData';

export const getAppointmentsFromCalendar = async (): Promise<Appointment[]> => {
  const calendarId = 'primary';
  const data = await callGoogleApi(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`);
  if (data && data.items) {
    return (data.items as { id: string, summary: string, description?: string, start: { dateTime?: string, date?: string } }[]).map((item) => {
      let parsedType = 'Consulta';
      if (item.description && item.description.includes('Cita de tipo:')) {
        parsedType = item.description.replace('Cita de tipo:', '').trim();
      }

      return {
        id: item.id,
        patientId: '', 
        title: item.summary,
        date: new Date(item.start.dateTime || item.start.date || ''),
        duration: 30, 
        type: parsedType,
        status: 'confirmed'
      };
    });
  }
  return [];
};

export const saveAppointmentToCalendar = async (appointment: Appointment) => {
  const calendarId = 'primary';
  let startDateTime: Date;
  
  if (appointment.date instanceof Date) {
    startDateTime = appointment.date;
  } else {
    startDateTime = new Date(`${appointment.date}T${appointment.time || '09:00'}:00`);
  }
  
  const endDateTime = new Date(startDateTime.getTime() + (appointment.duration || 30) * 60000);

  const getFriendlyType = (raw: string) => {
    const lower = raw.toLowerCase();
    if (lower.includes('checkup')) return 'Chequeo General';
    if (lower.includes('followup')) return 'Seguimiento';
    if (lower.includes('specialist')) return 'Consulta Especialista';
    if (lower.includes('emergency')) return 'Emergencia';
    return raw.replace('appointments.', '');
  };

  const event = {
    summary: appointment.title,
    description: `Cita de tipo: ${getFriendlyType(appointment.type)}`,
    start: { dateTime: startDateTime.toISOString() },
    end: { dateTime: endDateTime.toISOString() },
  };

  await callGoogleApi(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    'POST',
    event
  );
};

export const updateAppointmentInCalendar = async (appointment: Appointment) => {
  const calendarId = 'primary';
  let startDateTime: Date;
  
  if (appointment.date instanceof Date) {
    startDateTime = appointment.date;
  } else {
    startDateTime = new Date(`${appointment.date}T${appointment.time || '09:00'}:00`);
  }
  
  const endDateTime = new Date(startDateTime.getTime() + (appointment.duration || 30) * 60000);

  const getFriendlyType = (raw: string) => {
    const lower = raw.toLowerCase();
    if (lower.includes('checkup')) return 'Chequeo General';
    if (lower.includes('followup')) return 'Seguimiento';
    if (lower.includes('specialist')) return 'Consulta Especialista';
    if (lower.includes('emergency')) return 'Emergencia';
    return raw.replace('appointments.', '');
  };

  const event = {
    summary: appointment.title,
    description: `Cita de tipo: ${getFriendlyType(appointment.type)}`,
    start: { dateTime: startDateTime.toISOString() },
    end: { dateTime: endDateTime.toISOString() },
  };

  await callGoogleApi(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${appointment.id}`,
    'PUT',
    event
  );
};

export const deleteAppointmentFromCalendar = async (appointmentId: string | number) => {
  const calendarId = 'primary';
  await callGoogleApi(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${appointmentId}`,
    'DELETE'
  );
};
