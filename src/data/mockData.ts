// Mock Data for UI presentation
export const mockPatients = [
  { id: 'PT-1001', name: 'John Doe', age: 45, phone: '+1 (555) 123-4567', email: 'john.doe@example.com', lastVisit: '2023-10-15', status: 'Active' },
  { id: 'PT-1002', name: 'Jane Smith', age: 32, phone: '+1 (555) 987-6543', email: 'j.smith@email.com', lastVisit: '2023-11-02', status: 'Inactive' },
  { id: 'PT-1003', name: 'Robert Johnson', age: 58, phone: '+1 (555) 456-7890', email: 'rob.j@web.com', lastVisit: '2023-10-28', status: 'Active' },
  { id: 'PT-1004', name: 'Emily Davis', age: 28, phone: '+1 (555) 234-5678', email: 'emilyd@example.net', lastVisit: '2023-11-10', status: 'Active' },
  { id: 'PT-1005', name: 'Michael Wilson', age: 62, phone: '+1 (555) 876-5432', email: 'mwilson62@mail.com', lastVisit: '2023-09-05', status: 'Inactive' },
];

export const mockConsultations = [
  { 
    id: 'C-5001', 
    patientId: 'PT-1001', 
    date: '2023-10-15', 
    doctor: 'Dr. House', 
    summary: 'General checkup. Blood pressure normal.', 
    type: 'Checkup', 
    status: 'Completed', 
    cost: 150000,
    symptoms: 'Dolor leve en tobillo derecho por las mañanas.',
    treatment: 'Manipulación de tobillo y compresa local.',
    recommendations: 'Evitar cargas pesadas durante 3 días.',
    recoveryTime: '3 días',
    notes: 'Signos vitales normales. PA 120/80.'
  },
  { 
    id: 'C-5002', 
    patientId: 'PT-1003', 
    date: '2023-10-28', 
    doctor: 'Dr. House', 
    summary: 'Follow-up on hypertension medication.', 
    type: 'Follow-up', 
    status: 'Completed', 
    cost: 120000,
    symptoms: 'Mareos ocasionales al levantarse.',
    treatment: 'Ajuste de dosis de medicamento matutino.',
    recommendations: 'Monitorear presión arterial 2 veces al día por una semana.',
    recoveryTime: 'N/A',
    notes: 'Ajustado de 10mg a 15mg.'
  },
  { 
    id: 'C-5003', 
    patientId: 'PT-1004', 
    date: new Date().toISOString().split('T')[0], 
    doctor: 'Dr. House', 
    summary: 'Patient admitted with acute pain.', 
    type: 'Emergency', 
    status: 'In Progress', 
    cost: 250000,
    symptoms: 'Dolor agudo lumbar que irradia a pierna derecha.',
    treatment: 'Inyección analgésica e hidratación con antiinflamatorio.',
    recommendations: 'Reposo absoluto por 24 horas. Consultar kinesiología.',
    recoveryTime: '7 días',
    notes: 'Pendiente resonancia si el dolor no cede.'
  },
];

export const mockAppointments = [
  { id: 1, title: 'John Doe - Checkup', date: new Date(new Date().setHours(10, 0, 0, 0)), duration: 60, type: 'Checkup', status: 'Pending', patientId: 'PT-1001' },
  { id: 2, title: 'Jane Smith - Follow-up', date: new Date(new Date().setHours(14, 30, 0, 0)), duration: 30, type: 'Follow-up', status: 'Pending', patientId: 'PT-1002' },
  { id: 3, title: 'Robert Johnson - Consultation', date: new Date(new Date().setDate(new Date().getDate() + 2)), duration: 45, type: 'Consultation', status: 'Pending', patientId: 'PT-1003' },
];

export const mockTemplates = [
  { 
    id: 1, 
    title: 'General Checkup Notes', 
    symptoms: 'General consultation for routine status checkup. No acute symptoms.', 
    treatment: 'Physical exam structure completed. Checked vital signs.', 
    recommendations: 'Maintain present healthy lifestyle and schedule annual tests.', 
    recoveryTime: 'N/A', 
    notes: 'Vitals: BP: ____ | HR: ____ | Temp: ____',
    cost: '150000'
  },
  { 
    id: 2, 
    title: 'Prescription Refill', 
    symptoms: 'Patient stable, requesting refill for current medication list.', 
    treatment: 'Verification of laboratory/test panels relating to dosage levels.', 
    recommendations: 'Book next appointment block when requesting future intervals.', 
    recoveryTime: 'N/A', 
    notes: 'Approved prescription renewal for [MedicationName].',
    cost: '100000'
  },
  { 
    id: 3, 
    title: 'Post-Surgery Evaluation', 
    symptoms: 'Standard mild local soreness near incision site. No fever spikes.', 
    treatment: 'Surgical wound cleansing overlayed with standard light gauze dressing.', 
    recommendations: 'Must keep area strictly dry for 48h. Avoid intensive weight lifting.', 
    recoveryTime: '10-14 days', 
    notes: 'Healing speed appears normal. Redressing is optimal.',
    cost: '200000'
  },
];
