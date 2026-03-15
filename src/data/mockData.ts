// Mock Data for UI presentation
export const mockPatients = [
  { id: 'PT-1001', name: 'John Doe', age: 45, phone: '+1 (555) 123-4567', email: 'john.doe@example.com', lastVisit: '2023-10-15', status: 'Active' },
  { id: 'PT-1002', name: 'Jane Smith', age: 32, phone: '+1 (555) 987-6543', email: 'j.smith@email.com', lastVisit: '2023-11-02', status: 'Inactive' },
  { id: 'PT-1003', name: 'Robert Johnson', age: 58, phone: '+1 (555) 456-7890', email: 'rob.j@web.com', lastVisit: '2023-10-28', status: 'Active' },
  { id: 'PT-1004', name: 'Emily Davis', age: 28, phone: '+1 (555) 234-5678', email: 'emilyd@example.net', lastVisit: '2023-11-10', status: 'Active' },
  { id: 'PT-1005', name: 'Michael Wilson', age: 62, phone: '+1 (555) 876-5432', email: 'mwilson62@mail.com', lastVisit: '2023-09-05', status: 'Inactive' },
];

export const mockConsultations = [
  { id: 'C-5001', patientId: 'PT-1001', date: '2023-10-15', doctor: 'Dr. House', summary: 'General checkup. Blood pressure normal.', type: 'Checkup', status: 'Completed', cost: 150 },
  { id: 'C-5002', patientId: 'PT-1003', date: '2023-10-28', doctor: 'Dr. House', summary: 'Follow-up on hypertension medication.', type: 'Follow-up', status: 'Completed', cost: 100 },
  { id: 'C-5003', patientId: 'PT-1004', date: new Date().toISOString().split('T')[0], doctor: 'Dr. House', summary: 'Patient admitted with acute pain.', type: 'Emergency', status: 'In Progress', cost: 350 },
];

export const mockAppointments = [
  { id: 1, title: 'John Doe - Checkup', date: new Date(new Date().setHours(10, 0, 0, 0)), duration: 60, type: 'Checkup', status: 'Pending', patientId: 'PT-1001' },
  { id: 2, title: 'Jane Smith - Follow-up', date: new Date(new Date().setHours(14, 30, 0, 0)), duration: 30, type: 'Follow-up', status: 'Pending', patientId: 'PT-1002' },
  { id: 3, title: 'Robert Johnson - Consultation', date: new Date(new Date().setDate(new Date().getDate() + 2)), duration: 45, type: 'Consultation', status: 'Pending', patientId: 'PT-1003' },
];

export const mockTemplates = [
  { id: 1, title: 'General Checkup Notes', content: 'Patient presents for routine checkup.\n\nVitals:\n- BP:\n- HR:\n- Temp:\n\nNotes:\n' },
  { id: 2, title: 'Prescription Refill', content: 'Patient requesting refill for [Medication].\n\nCurrent dosage: [Dosage]\nSymptoms stable.\n\nRecommendations:\n- Continue current dosage.\n- Follow up in 3 months.' },
  { id: 3, title: 'Post-Surgery Follow-up', content: 'Patient presents for post-op evaluation.\n\nSymptoms:\n- Mild pain at incision site.\n- No signs of infection.\n\nTreatment Applied:\n- Cleaned and redressed wound.\n\nRecovery Time:\n- 2 weeks for full recovery.' },
];
