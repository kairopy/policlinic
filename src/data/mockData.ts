// Mock Data for UI presentation
export const mockPatients = [
  { id: 'PT-1001', name: 'John Doe', age: 45, phone: '+1 (555) 123-4567', email: 'john.doe@example.com', lastVisit: '2023-10-15', status: 'Active' },
  { id: 'PT-1002', name: 'Jane Smith', age: 32, phone: '+1 (555) 987-6543', email: 'j.smith@email.com', lastVisit: '2023-11-02', status: 'Inactive' },
  { id: 'PT-1003', name: 'Robert Johnson', age: 58, phone: '+1 (555) 456-7890', email: 'rob.j@web.com', lastVisit: '2023-10-28', status: 'Active' },
  { id: 'PT-1004', name: 'Emily Davis', age: 28, phone: '+1 (555) 234-5678', email: 'emilyd@example.net', lastVisit: '2023-11-10', status: 'Active' },
  { id: 'PT-1005', name: 'Michael Wilson', age: 62, phone: '+1 (555) 876-5432', email: 'mwilson62@mail.com', lastVisit: '2023-09-05', status: 'Inactive' },
];

export const mockConsultations = [
  { id: 'C-5001', patientId: 'PT-1001', date: '2023-10-15', doctor: 'Dr. House', summary: 'General checkup. Blood pressure normal.', type: 'Checkup' },
  { id: 'C-5002', patientId: 'PT-1003', date: '2023-10-28', doctor: 'Dr. House', summary: 'Follow-up on hypertension medication.', type: 'Follow-up' },
];
