// Mock Data for UI presentation - Tailored for Podiatry & Paraguayan Names

export interface Patient {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  status: string;
  lastVisit: string;
  createdAt: string;
  notes?: string;
}

export interface Appointment {
  id: string;
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
  podograma_data?: string;
}

export const mockPatients: Patient[] = [
  {
    id: 'PAC-001',
    name: 'Juan Pérez',
    age: 45,
    email: 'juan.perez@email.com',
    phone: '0981 123 456',
    status: 'active',
    lastVisit: '2024-03-10',
    createdAt: '2024-01-15',
    notes: 'Paciente diabético, requiere control preventivo mensual.'
  },
  {
    id: 'PAC-002',
    name: 'María García',
    age: 32,
    email: 'm.garcia@email.com',
    phone: '0972 987 654',
    status: 'pending_control',
    lastVisit: '2024-02-28',
    createdAt: '2024-02-01',
    notes: 'Tratamiento de onicocriptosis en proceso.'
  },
  {
    id: 'PAC-003',
    name: 'Carlos Rodríguez',
    age: 60,
    email: 'carlos.rod@email.com',
    phone: '0983 456 789',
    status: 'active',
    lastVisit: '2024-03-15',
    createdAt: '2023-11-20',
    notes: 'Uso de plantillas ortopédicas.'
  }
];

export const mockConsultations: Consultation[] = [
  {
    id: 'CON-001',
    patientId: 'PAC-001',
    patientName: 'Juan Pérez',
    date: '2024-03-10',
    doctor: 'Lic. Karina',
    summary: 'Profilaxis general y corte de uñas.',
    type: 'Regular',
    status: 'completed',
    cost: 150000,
    symptoms: 'Molestia leve en zona plantar.',
    treatment: 'Limpieza profunda y masaje.',
    recommendations: 'Caminar 30 min diarios.',
    recoveryTime: 'Inmediata'
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 'APP-001',
    patientId: 'PAC-002',
    title: 'María García - Curación',
    date: new Date().toISOString(),
    duration: 30,
    time: '09:00',
    type: 'Onicocriptosis',
    status: 'confirmed'
  }
];

export const mockTemplates = [
  { 
    id: 'TMP-1', 
    title: 'Profilaxis Podológica General', 
    symptoms: 'Consulta de rutina o mantenimiento general. Presencia de hiperqueratosis leve.', 
    treatment: 'Corte correcto de uñas, desbridamiento de hiperqueratosis y masaje de descarga podológico.', 
    recommendations: 'Mantener hidratación diaria con cremas específicas. Control en 30 días.', 
    recoveryTime: 'Inmediato', 
    notes: 'Vitals: Presión ____ | Sensibilidad: ____ | Pulso pedal: ____',
    cost: 150000
  },
  { 
    id: 'TMP-2', 
    title: 'Tratamiento de Uña Encarnada (Onicocriptosis)', 
    symptoms: 'Dolor, enrojecimiento e inflamación en canales ungueales. Molestia al tacto.', 
    treatment: 'Espiculotomía lateral con instrumental estéril, retiro de espícula y curación local con antiséptico.', 
    recommendations: 'Evitar calzado ajustado. Mantener vendaje seco por 24hs. Control de curación en 48hs.', 
    recoveryTime: '3-5 días', 
    notes: 'Evaluar si requiere derivación médica en caso de granuloma infectado.',
    cost: 180000
  },
  { 
    id: 'TMP-3', 
    title: 'Tratamiento de Onicomicosis (Hongos)', 
    symptoms: 'Uñas engrosadas, hiperqueratósicas, amarillentas o quebradizas.', 
    treatment: 'Desbridamiento mecánico profundo de la lámina ungueal y aplicación de laca antimicótica.', 
    recommendations: 'Uso diario de antimicótico tópico. Desinfección de calzados y medias.', 
    recoveryTime: 'Evaluación mensual', 
    notes: 'Explicar al paciente que el crecimiento de uña sana demora meses.',
    cost: 120000
  }
];
