import { 
  mockPatients, 
  mockAppointments, 
  mockConsultations, 
  mockTemplates,
} from '../data/mockData';
import type { Patient, Appointment, Consultation } from '../data/mockData';

export type { Patient, Appointment, Consultation };

const GOOGLE_CONNECTED_KEY = 'google_connected';
const SHEETS_ID_KEY = 'google_sheets_id';
const GOOGLE_ACCESS_TOKEN_KEY = 'google_access_token';

export const isGoogleLinked = () => 
  !!localStorage.getItem(GOOGLE_CONNECTED_KEY) || !!localStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);

export const syncLoginStatusWithBackend = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/token');
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, data.access_token);
      localStorage.setItem(GOOGLE_CONNECTED_KEY, 'true');
      return true;
    }
  } catch {
    // Ignore errors, backend might be down or no token present
  }
  return false;
};

const callGoogleApi = async (url: string, method: string = 'GET', body?: unknown) => {
  let token = localStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);

  // If we don't have a token, try to grab a fresh one from the backend
  if (!token) {
    try {
      const tokenRes = await fetch('http://localhost:3001/api/token');
      if (tokenRes.ok) {
        const data = await tokenRes.json();
        token = data.access_token as string;
        localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, token);
        localStorage.setItem(GOOGLE_CONNECTED_KEY, 'true');
      } else {
        localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
        localStorage.removeItem(GOOGLE_CONNECTED_KEY);
        return null;
      }
    } catch (e) {
      console.error('Backend token provider unreachable', e);
      return null;
    }
  }

  const makeRequest = async (currentToken: string) => {
    return fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  try {
    let response = await makeRequest(token as string);

    if (response.status === 401) {
      // Token expired, attempt refresh
      try {
        const tokenRes = await fetch('http://localhost:3001/api/token');
        if (tokenRes.ok) {
          const data = await tokenRes.json();
          token = data.access_token as string;
          localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, token);
          localStorage.setItem(GOOGLE_CONNECTED_KEY, 'true');
          
          // Retry the request ONCE with the new token
          response = await makeRequest(token);
          if (response.status === 401) {
            localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
            localStorage.removeItem(GOOGLE_CONNECTED_KEY);
            return null;
          }
        } else {
          localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
          localStorage.removeItem(GOOGLE_CONNECTED_KEY);
          return null;
        }
      } catch (e) {
        console.error('Failed to retry with fresh token', e);
        return null;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`Google API Error (${response.status}):`, errorData);
      throw new Error(`Google API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Google API Request Error:', error);
    return null;
  }
};

const SPREADSHEET_NAME = 'Lic Karina Pacientes';
const PATIENTS_HEADERS = ['ID', 'Nombre', 'Edad', 'Email', 'Teléfono', 'Estado', 'Última Visita', 'Fecha Creación', 'Notas'];
const CONSULTATIONS_HEADERS = ['ID', 'PatientID', 'PatientName', 'Date', 'Summary', 'Symptoms', 'Treatment', 'Recommendations', 'Cost', 'Doctor'];

/**
 * Returns a valid spreadsheet ID and ensures required tabs exist.
 */
const ensureSpreadsheetExists = async (): Promise<string | null> => {
  const cached = localStorage.getItem(SHEETS_ID_KEY);
  let sheetsId = cached;

  // 1. Validate or Find Spreadsheet
  if (!sheetsId || sheetsId === 'undefined' || sheetsId === 'null') {
    const q = encodeURIComponent(`name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`);
    const searchResult = await callGoogleApi(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1`);
    
    if (searchResult && searchResult.files && searchResult.files.length > 0) {
      sheetsId = searchResult.files[0].id as string;
    } else {
      // Create new
      const newSheet = await callGoogleApi('https://sheets.googleapis.com/v4/spreadsheets', 'POST', {
        properties: { title: SPREADSHEET_NAME },
        sheets: [{ properties: { title: 'Sheet1' } }]
      });
      if (newSheet) sheetsId = newSheet.spreadsheetId;
    }
  }

  if (!sheetsId) return null;
  localStorage.setItem(SHEETS_ID_KEY, sheetsId);

  // 2. Ensure Tabs and Headers exist
  const meta = await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}?fields=sheets(properties(title))`);
  if (!meta) return sheetsId;

  const sheetTitles = (meta.sheets as Array<{ properties: { title: string } }>).map(s => s.properties.title);
  
  // Ensure "Sheet1" (Patients) has headers
  if (sheetTitles.includes('Sheet1')) {
    const data = await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Sheet1!A1:1`);
    if (!data || !data.values) {
      await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Sheet1!A1`, 'PUT', { values: [PATIENTS_HEADERS] });
    }
  }

  // Ensure "Consultas" tab exists
  if (!sheetTitles.includes('Consultas')) {
    await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}:batchUpdate`, 'POST', {
      requests: [{ addSheet: { properties: { title: 'Consultas' } } }]
    });
    await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Consultas!A1`, 'PUT', { values: [CONSULTATIONS_HEADERS] });
  }

  return sheetsId;
};


// Maps from possible header names (n8n Spanish / app English) to Patient interface keys
const HEADER_MAP: Record<string, keyof Patient> = {
  'id': 'id',
  'nombre': 'name', 'name': 'name',
  'edad': 'age', 'age': 'age',
  'email': 'email', 'correo': 'email',
  'teléfono': 'phone', 'telefono': 'phone', 'phone': 'phone',
  'estado': 'status', 'status': 'status',
  'última visita': 'lastVisit', 'ultima visita': 'lastVisit', 'lastvisit': 'lastVisit',
  'fecha creación': 'createdAt', 'fecha creacion': 'createdAt', 'createdat': 'createdAt',
  'notas': 'notes', 'notes': 'notes',
};

const CONSULT_HEADER_MAP: Record<string, keyof Consultation> = {
  'id': 'id',
  'patientid': 'patientId', 'id paciente': 'patientId', 'paciente id': 'patientId',
  'patientname': 'patientName', 'nombre': 'patientName', 'nombre paciente': 'patientName', 'paciente': 'patientName',
  'date': 'date', 'fecha': 'date', 'fecha de consulta': 'date',
  'summary': 'summary', 'resumen': 'summary', 'motivo': 'summary',
  'symptoms': 'symptoms', 'síntomas': 'symptoms', 'sintomas': 'symptoms',
  'treatment': 'treatment', 'tratamiento': 'treatment',
  'recommendations': 'recommendations', 'recomendaciones': 'recommendations',
  'cost': 'cost', 'costo': 'cost', 'precio': 'cost',
  'doctor': 'doctor', 'médico': 'doctor', 'medico': 'doctor', 'especialista': 'doctor'
};

export const getPatients = async (): Promise<Patient[]> => {
  if (isGoogleLinked()) {
    const sheetsId = await ensureSpreadsheetExists();
    if (sheetsId) {
      const data = await callGoogleApi(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Sheet1`
      );
      if (data && data.values && data.values.length > 0) {
        const firstRow = data.values[0] as string[];
        const colMap: Record<number, keyof Patient> = {};
        let mappedCount = 0;
        
        firstRow.forEach((h, i) => {
          const key = HEADER_MAP[h?.trim().toLowerCase() || ''];
          if (key) {
            colMap[i] = key;
            mappedCount++;
          }
        });

        let dataRows = data.values.slice(1) as string[][];

        if (mappedCount === 0) {
          dataRows = data.values as string[][];
          PATIENTS_HEADERS.forEach((h, i) => {
            const key = HEADER_MAP[h.toLowerCase()] || HEADER_MAP[h.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()];
            if (key) colMap[i] = key;
          });
        }

        return dataRows
          .filter(row => row.some(cell => cell?.trim()))  // skip fully empty rows
          .map((row): Patient => {
            const p: Partial<Patient> = {};
            Object.entries(colMap).forEach(([idxStr, key]) => {
              const val = row[Number(idxStr)] ?? '';
              if (key === 'age') (p as Record<string, unknown>)[key] = Number(val) || 0;
              else (p as Record<string, unknown>)[key] = val;
            });
            return {
              id: p.id || '',
              name: p.name || '',
              age: p.age || 0,
              email: p.email || '',
              phone: p.phone || '',
              status: p.status || 'pending_control',
              lastVisit: p.lastVisit || '',
              createdAt: p.createdAt || '',
              notes: p.notes || '',
            };
          });
      }
    }
  }
  return mockPatients;
};

export const getAppointments = async (): Promise<Appointment[]> => {
  if (isGoogleLinked()) {
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
  }
  return mockAppointments;
};

export const getConsultations = async (): Promise<Consultation[]> => {
  if (isGoogleLinked()) {
    const sheetsId = await ensureSpreadsheetExists();
    if (sheetsId) {
      const data = await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Consultas`);
      if (data && data.values && data.values.length > 0) {
        const firstRow = data.values[0] as string[];
        const colMap: Record<number, keyof Consultation> = {};
        let mappedCount = 0;
        
        firstRow.forEach((h, i) => {
          const key = CONSULT_HEADER_MAP[h?.trim().toLowerCase() || ''];
          if (key) {
            colMap[i] = key;
            mappedCount++;
          }
        });

        let dataRows = data.values.slice(1) as string[][];

        if (mappedCount === 0) {
          dataRows = data.values as string[][];
          CONSULTATIONS_HEADERS.forEach((h, i) => {
            const key = CONSULT_HEADER_MAP[h.toLowerCase()];
            if (key) colMap[i] = key;
          });
        }

        return dataRows
          .filter(row => row.some(cell => cell?.trim())) // Skip empty rows
          .map((row): Consultation => {
          const c: Partial<Consultation> = {};
          Object.entries(colMap).forEach(([idxStr, key]) => {
            const val = row[Number(idxStr)] ?? '';
            if (key === 'cost') (c as Record<string, unknown>)[key] = Number(val) || 0;
            else (c as Record<string, unknown>)[key] = val;
          });
          return {
            id: c.id || '',
            patientId: c.patientId || '',
            patientName: c.patientName,
            date: c.date || '',
            doctor: c.doctor || '',
            summary: c.summary || '',
            type: c.type || 'Regular',
            status: c.status || 'completed',
            cost: c.cost || 0,
            symptoms: c.symptoms || '',
            treatment: c.treatment || '',
            recommendations: c.recommendations || '',
            recoveryTime: c.recoveryTime || 'Inmediata'
          };
        });
      }
    }
  }
  return mockConsultations as Consultation[];
};

export const savePatient = async (patient: Partial<Patient>) => {
  if (isGoogleLinked()) {
    const sheetsId = await ensureSpreadsheetExists();
    if (sheetsId) {
      const values = [[
        patient.id ?? '',
        patient.name ?? '',
        patient.age ?? '',
        patient.email ?? '',
        patient.phone ?? '',
        patient.status ?? '',
        patient.lastVisit ?? '',
        patient.createdAt ?? '',
        patient.notes ?? ''
      ]];
      // Correct append URL: range before :append, options as query params
      await callGoogleApi(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        'POST',
        { values }
      );
    }
  }
  (mockPatients as Patient[]).push(patient as Patient);
};

/**
 * Updates an existing patient row in-place inside the Google Sheet.
 * Finds the row by patient ID (column A = ID) and PUTs the updated data there.
 */
export const updatePatient = async (patient: Patient) => {
  if (isGoogleLinked()) {
    const sheetsId = await ensureSpreadsheetExists();
    if (sheetsId) {
      // Read all rows to find the row number of this patient
      const data = await callGoogleApi(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Sheet1!A:A`
      );
      if (data && data.values) {
        const rows = data.values as string[][];
        // rows[0] is the header; find the data row where A == patient.id
        const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[0] === patient.id);
        if (rowIndex > 0) {
          const rowNum = rowIndex + 1; // convert 0-index to 1-index in Sheets notation
          const values = [[
            patient.id,
            patient.name,
            patient.age,
            patient.email,
            patient.phone,
            patient.status,
            patient.lastVisit,
            patient.createdAt,
            patient.notes ?? ''
          ]];
          await callGoogleApi(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Sheet1!A${rowNum}:I${rowNum}?valueInputOption=USER_ENTERED`,
            'PUT',
            { values }
          );
          // Also update mock data
          const mockIdx = (mockPatients as Patient[]).findIndex(p => p.id === patient.id);
          if (mockIdx !== -1) (mockPatients as Patient[])[mockIdx] = patient;
          return;
        }
      }
    }
  }
  // Fallback: update mock data only
  const mockIdx = (mockPatients as Patient[]).findIndex(p => p.id === patient.id);
  if (mockIdx !== -1) (mockPatients as Patient[])[mockIdx] = patient;
};

/**
 * Deletes a patient row from the Google Sheet by matching patient ID in column A.
 */
export const deletePatient = async (patientId: string) => {
  if (isGoogleLinked()) {
    const sheetsId = await ensureSpreadsheetExists();
    if (sheetsId) {
      // Get sheet metadata to find the sheetId (numeric) of Sheet1
      const meta = await callGoogleApi(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}?fields=sheets(properties(sheetId,title))`
      );
      const sheetNumId: number = (meta?.sheets?.[0]?.properties?.sheetId as number) ?? 0;

      // Get column A to find the row index
      const col = await callGoogleApi(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Sheet1!A:A`
      );
      if (col?.values) {
        const rows = col.values as string[][];
        const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[0] === patientId);
        if (rowIndex > 0) {
          // batchUpdate: deleteDimension removes the row (0-indexed, endIndex exclusive)
          await callGoogleApi(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}:batchUpdate`,
            'POST',
            {
              requests: [{
                deleteDimension: {
                  range: {
                    sheetId: sheetNumId,
                    dimension: 'ROWS',
                    startIndex: rowIndex,      // 0-indexed (header is 0, first data row is 1)
                    endIndex: rowIndex + 1,
                  }
                }
              }]
            }
          );
        }
      }
    }
  }
  // Remove from mock data
  const mockIdx = (mockPatients as Patient[]).findIndex(p => p.id === patientId);
  if (mockIdx !== -1) (mockPatients as Patient[]).splice(mockIdx, 1);
};

export const saveAppointment = async (appointment: Appointment) => {
  if (isGoogleLinked()) {
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
  }
  (mockAppointments as Appointment[]).push(appointment);
};

export const updateAppointment = async (appointment: Appointment) => {
  if (isGoogleLinked()) {
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

    try {
      await callGoogleApi(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${appointment.id}`,
        'PUT',
        event
      );
    } catch (e) {
      console.error("Error updating event in Google Calendar: ", e);
    }
  }

  const mockIdx = (mockAppointments as Appointment[]).findIndex(a => String(a.id) === String(appointment.id));
  if (mockIdx !== -1) {
    (mockAppointments as Appointment[])[mockIdx] = appointment;
  }
};

export const deleteAppointment = async (appointmentId: string | number) => {
  if (isGoogleLinked()) {
    const calendarId = 'primary';
    try {
      await callGoogleApi(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${appointmentId}`,
        'DELETE'
      );
    } catch (e) {
      console.error("Error deleting event from Google Calendar: ", e);
    }
  }

  const mockIdx = (mockAppointments as Appointment[]).findIndex(a => String(a.id) === String(appointmentId));
  if (mockIdx !== -1) {
    (mockAppointments as Appointment[]).splice(mockIdx, 1);
  }
};

export const saveConsultation = async (consultation: Consultation) => {
  if (isGoogleLinked()) {
    const sheetsId = await ensureSpreadsheetExists();
    if (sheetsId) {
      const values = [[
        consultation.id,
        consultation.patientId,
        consultation.patientName || '',
        consultation.date,
        consultation.summary,
        consultation.symptoms,
        consultation.treatment,
        consultation.recommendations,
        consultation.cost,
        consultation.doctor
      ]];
      await callGoogleApi(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Consultas!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        'POST',
        { values }
      );
    }
  }
  mockConsultations.push(consultation);
};

export const getTemplates = async () => {
  return mockTemplates; // Templates are local for now
};

export const updatePatientStatus = async (patientId: string, status: string) => {
  const patient = mockPatients.find((p: Patient) => p.id === patientId);
  if (patient) patient.status = status;
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
    // 1. Search Patients
    const patients = await getPatients();
    const matchedPatients = patients.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.id.toLowerCase().includes(lowerQuery) ||
      (p.email && p.email.toLowerCase().includes(lowerQuery))
    );
    matchedPatients.forEach(p => results.push({
      id: p.id,
      title: p.name,
      subtitle: `Paciente • ID: ${p.id}`,
      type: 'patient',
      link: `/patients/${p.id}`
    }));

    // 2. Search Appointments
    const appointments = await getAppointments();
    const matchedAppointments = appointments.filter(a => 
      a.title.toLowerCase().includes(lowerQuery)
    );
    matchedAppointments.forEach(a => results.push({
      id: String(a.id),
      title: a.title,
      subtitle: `Cita • ${new Date(a.date).toLocaleDateString()}`,
      type: 'appointment',
      link: `/appointments`
    }));

    // 3. Search Consultations
    const consultations = await getConsultations();
    const matchedConsultations = consultations.filter(c => 
      (c.patientName && c.patientName.toLowerCase().includes(lowerQuery)) ||
      (c.summary && c.summary.toLowerCase().includes(lowerQuery))
    );
    matchedConsultations.forEach(c => results.push({
      id: c.id,
      title: c.patientName || 'Consulta de Paciente',
      subtitle: `Evaluación • ${c.summary}`,
      type: 'consultation',
      link: `/consultations/${c.id}`
    }));
  } catch (error) {
    console.error('Error in globalSearch:', error);
  }

  return results.slice(0, 10); // Return top 10 matches
};
