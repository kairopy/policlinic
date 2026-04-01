import { callGoogleApi, SHEETS_ID_KEY } from './authService';
import type { Patient, Consultation } from '../data/mockData';
import { mockPatients, mockConsultations } from '../data/mockData';

export const SPREADSHEET_NAME = 'Ariel Cespedes Pacientes';
export const PATIENTS_HEADERS = ['ID', 'Nombre', 'Edad', 'Email', 'Teléfono', 'Estado', 'Última Visita', 'Fecha Creación', 'Notas', 'Ubicación'];
export const CONSULTATIONS_HEADERS = [
  'ID', 'PatientID', 'PatientName', 'Date', 'Summary', 'Symptoms', 
  'Treatment', 'Recommendations', 'Cost', 'Doctor', 'PodogramaData',
  'Time', 'Plantilla', 'Status', 'RecoveryTime', 'Notes'
];

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
  'ubicación': 'location', 'ubicacion': 'location', 'location': 'location',
};

const CONSULT_HEADER_MAP: Record<string, keyof Consultation> = {
  'id': 'id',
  'patientid': 'patientId', 'id paciente': 'patientId', 'paciente id': 'patientId',
  'patientname': 'patientName', 'nombre': 'patientName', 'nombre paciente': 'patientName', 'paciente': 'patientName',
  'date': 'date', 'fecha': 'date', 'fecha de consulta': 'date',
  'time': 'time', 'hora': 'time',
  'summary': 'summary', 'resumen': 'summary', 'motivo': 'summary',
  'symptoms': 'symptoms', 'síntomas': 'symptoms', 'sintomas': 'symptoms',
  'treatment': 'treatment', 'tratamiento': 'treatment',
  'recommendations': 'recommendations', 'recomendaciones': 'recommendations',
  'cost': 'cost', 'costo': 'cost', 'precio': 'cost',
  'doctor': 'doctor', 'médico': 'doctor', 'medico': 'doctor', 'especialista': 'doctor',
  'podogramadata': 'podograma_data', 'podograma': 'podograma_data',
  'plantilla': 'type', 'type': 'type', 'tipo': 'type',
  'status': 'status', 'estado': 'status',
  'recoverytime': 'recoveryTime', 'tiempo de recuperación': 'recoveryTime', 'tiempo recuperacion': 'recoveryTime', 'recuperacion': 'recoveryTime',
  'notes': 'notes', 'notas': 'notes', 'notas privadas': 'notes'
};

let ensurePromise: Promise<string | null> | null = null;

export const ensureSpreadsheetExists = async (): Promise<string | null> => {
  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    try {
      const cached = localStorage.getItem(SHEETS_ID_KEY);
      const isEnsured = localStorage.getItem('policlinic_sheet_ensured');
      const cachedName = localStorage.getItem('policlinic_sheet_name');

      if (!cachedName || cachedName !== SPREADSHEET_NAME) {
        localStorage.removeItem(SHEETS_ID_KEY);
        localStorage.removeItem('policlinic_sheet_ensured');
        localStorage.setItem('policlinic_sheet_name', SPREADSHEET_NAME);
        return null;
      }

      if (cached && cached !== 'undefined' && cached !== 'null' && isEnsured === 'true') {
        return cached;
      }

      let sheetsId = cached;

      if (!sheetsId || sheetsId === 'undefined' || sheetsId === 'null') {
        const q = encodeURIComponent(`name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`);
        const searchResult = await callGoogleApi(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1`);
        
        if (searchResult && searchResult.files && searchResult.files.length > 0) {
          sheetsId = searchResult.files[0].id as string;
        } else {
          const newSheet = await callGoogleApi('https://sheets.googleapis.com/v4/spreadsheets', 'POST', {
            properties: { title: SPREADSHEET_NAME },
            sheets: [{ properties: { title: 'Sheet1' } }]
          });
          if (newSheet) sheetsId = newSheet.spreadsheetId;
        }
      }

      if (!sheetsId) return null;
      localStorage.setItem(SHEETS_ID_KEY, sheetsId);

      const meta = await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}?fields=sheets(properties(title))`);
      if (!meta) return sheetsId;

      const sheetTitles = (meta.sheets as Array<{ properties: { title: string } }>).map(s => s.properties.title);
      
      if (sheetTitles.includes('Sheet1')) {
        const data = await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Sheet1!A1:1`);
        if (!data || !data.values) {
          await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Sheet1!A1`, 'PUT', { values: [PATIENTS_HEADERS] });
        }
      }

      if (!sheetTitles.includes('Consultas')) {
        await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}:batchUpdate`, 'POST', {
          requests: [{ addSheet: { properties: { title: 'Consultas' } } }]
        });
      }
      
      await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Consultas!A1`, 'PUT', { values: [CONSULTATIONS_HEADERS] });

      localStorage.setItem('policlinic_sheet_ensured', 'true');
      localStorage.setItem('policlinic_sheet_name', SPREADSHEET_NAME);
      
      return sheetsId;
    } finally {
      ensurePromise = null;
    }
  })();

  return ensurePromise;
};

export const getPatientsFromSheets = async (): Promise<Patient[]> => {
  const sheetsId = await ensureSpreadsheetExists();
  if (!sheetsId) return [...(mockPatients as Patient[])];

  const meta = await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}?fields=sheets(properties(title))`);
  const mainSheet = meta?.sheets?.[0]?.properties?.title || 'Sheet1';

  const data = await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${mainSheet}`);
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
      .filter(row => row.some(cell => cell?.trim()))
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
          location: p.location || '',
        };
      });
  }
  return [];
};

export const savePatientToSheets = async (patient: Partial<Patient>) => {
  const sheetsId = await ensureSpreadsheetExists();
  if (!sheetsId) return;

  const meta = await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}?fields=sheets(properties(title))`);
  const mainSheet = meta?.sheets?.[0]?.properties?.title || 'Sheet1';

  const values = [[
    String(patient.id ?? ''),
    String(patient.name ?? ''),
    String(patient.age ?? ''),
    String(patient.email ?? ''),
    String(patient.phone ?? ''),
    String(patient.status ?? ''),
    String(patient.lastVisit ?? ''),
    String(patient.createdAt ?? ''),
    String(patient.notes ?? ''),
    String(patient.location ?? '')
  ]];
  await callGoogleApi(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${mainSheet}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    'POST',
    { values }
  );
};

export const updatePatientInSheets = async (patient: Patient) => {
  const sheetsId = await ensureSpreadsheetExists();
  if (!sheetsId) return;

  const meta = await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}?fields=sheets(properties(title))`);
  const mainSheet = meta?.sheets?.[0]?.properties?.title || 'Sheet1';

  const data = await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${mainSheet}`);
  if (!data || !data.values) return;

  const rows = data.values as string[][];
  const firstRow = rows[0];
  
  const colMap: Record<number, keyof Patient> = {};
  let idColIdx = 0;
  
  firstRow.forEach((h, i) => {
    const key = HEADER_MAP[h?.trim().toLowerCase() || ''];
    if (key) {
      colMap[i] = key;
      if (key === 'id') idColIdx = i;
    }
  });

  const targetId = String(patient.id).trim();
  const rowIndex = rows.findIndex((row, idx) => idx > 0 && String(row[idColIdx] ?? '').trim() === targetId);

  if (rowIndex >= 0) {
    const rowNum = rowIndex + 1;
    const newRow: string[] = [];
    let maxCol = Math.max(...Object.keys(colMap).map(Number), 9);

    for (let i = 0; i <= maxCol; i++) {
      const key = colMap[i];
      if (key) newRow[i] = String(patient[key] ?? '');
      else newRow[i] = rows[rowIndex][i] ?? '';
    }

    await callGoogleApi(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${mainSheet}!A${rowNum}?valueInputOption=USER_ENTERED`,
      'PUT',
      { values: [newRow] }
    );
  }
};

export const deletePatientFromSheets = async (patientId: string) => {
  const sheetsId = await ensureSpreadsheetExists();
  if (!sheetsId) return;

  const meta = await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}?fields=sheets(properties(sheetId,title))`);
  const mainSheetProps = meta?.sheets?.[0]?.properties;
  const sheetNumId = mainSheetProps?.sheetId ?? 0;
  const mainSheetTitle = mainSheetProps?.title || 'Sheet1';

  const data = await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${mainSheetTitle}`);
  if (!data || !data.values) return;

  const rows = data.values as string[][];
  const targetId = String(patientId).trim().toLowerCase();
  const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[0] && String(row[0]).trim().toLowerCase() === targetId);

  if (rowIndex > 0) {
    await callGoogleApi(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}:batchUpdate`,
      'POST',
      {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetNumId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            }
          }
        }]
      }
    );
  }
};

export const getConsultationsFromSheets = async (): Promise<Consultation[]> => {
  const sheetsId = await ensureSpreadsheetExists();
  if (!sheetsId) return [...(mockConsultations as Consultation[])];

  const data = await callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Consultas`);
  if (data && data.values && data.values.length > 0) {
    const firstRow = data.values[0] as string[];
    const colMap: Record<number, keyof Consultation> = {};
    
    firstRow.forEach((h, i) => {
      const key = CONSULT_HEADER_MAP[h?.trim().toLowerCase() || ''];
      if (key) colMap[i] = key;
    });

    return data.values.slice(1)
      .filter((row: string[]) => row.some(cell => cell?.trim()))
      .map((row: string[]): Consultation => {
        const c: Partial<Consultation> = {};
        Object.entries(colMap).forEach(([idxStr, key]) => {
          const val = row[Number(idxStr)] ?? '';
          if (key === 'cost') (c as Record<string, unknown>)[key] = Number(val) || 0;
          else if (key === 'date') {
            let parsedDate = String(val).trim();
            if (/^\d{5}$/.test(parsedDate)) {
              const jsDate = new Date(Math.round((Number(parsedDate) - 25569) * 86400 * 1000));
              parsedDate = jsDate.toISOString().split('T')[0];
            } else if (parsedDate.includes('/')) {
              const parts = parsedDate.split('/');
              if (parts.length === 3) {
                const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
                parsedDate = `${y}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            }
            (c as Record<string, unknown>)[key] = parsedDate;
          } else (c as Record<string, unknown>)[key] = val;
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
          recoveryTime: c.recoveryTime || 'Inmediata',
          podograma_data: c.podograma_data || ''
        };
      });
  }
  return [];
};

export const saveConsultationToSheets = async (consultation: Consultation) => {
  const sheetsId = await ensureSpreadsheetExists();
  if (!sheetsId) return;

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
    consultation.doctor,
    consultation.podograma_data || '',
    consultation.time || '',
    consultation.type || 'Personalizada',
    consultation.status || 'completed',
    consultation.recoveryTime || '',
    consultation.notes || ''
  ]];
  await callGoogleApi(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Consultas!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    'POST',
    { values }
  );
};
