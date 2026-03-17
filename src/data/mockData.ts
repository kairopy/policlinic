// Mock Data for UI presentation - Tailored for Podiatry & Paraguayan Names

export const mockPatients = [
  { id: 'PT-1001', name: 'Juan Ramón Ayala', age: 45, phone: '+595 (981) 123-456', email: 'j.ayala@email.com', lastVisit: '2023-10-15', status: 'in_treatment', createdAt: '2023-01-10' },
  { id: 'PT-1002', name: 'Blanca Nieves Galeano', age: 32, phone: '+595 (971) 987-654', email: 'b.galeano@email.com', lastVisit: '2023-11-02', status: 'maintenance', createdAt: '2023-05-20' },
  { id: 'PT-1003', name: 'Silverio Martínez', age: 58, phone: '+595 (961) 456-789', email: 's.martinez@email.com', lastVisit: '2023-10-28', status: 'medical_discharge', createdAt: '2023-08-15' },
  { id: 'PT-1004', name: 'Nilsa Beatriz Morel', age: 28, phone: '+595 (982) 234-567', email: 'n.morel@email.com', lastVisit: '2026-03-16', status: 'in_treatment', createdAt: '2023-11-10' },
  { id: 'PT-1005', name: 'Gustavo Adolfo Benítez', age: 62, phone: '+595 (991) 876-543', email: 'g.benitez@email.com', lastVisit: '2026-02-15', status: 'pending_control', createdAt: '2023-09-05' },
  { id: 'PT-1006', name: 'Derlis Cardozo', age: 39, phone: '+595 (984) 111-222', email: 'd.cardozo@email.com', lastVisit: '2026-03-01', status: 'in_treatment', createdAt: '2026-03-01' },
];

export const mockConsultations = [
  // Consultas de Marzo (Mes Actual - Basado en la fecha del sistema 2026-03-16)
  { 
    id: 'C-6001', 
    patientId: 'PT-1004', 
    date: '2026-03-16', 
    doctor: 'Lic. Karina', 
    summary: 'Profilaxis podológica general.', 
    type: 'Mantenimiento', 
    status: 'In Progress', 
    cost: 150000,
    symptoms: 'Consulta de rutina para mantenimiento preventivo.',
    treatment: 'Limpieza profunda, corte de uñas y eliminación de durezas.',
    recommendations: 'Utilizar calzado cómodo y aplicar crema hidratante.',
    recoveryTime: 'Inmediato'
  },
  { 
    id: 'C-6002', 
    patientId: 'PT-1001', 
    date: '2026-03-10', 
    doctor: 'Lic. Karina', 
    summary: 'Control de espícula.', 
    type: 'Consulta', 
    status: 'Completed', 
    cost: 100000,
    symptoms: 'Molestia leve en el lateral del dedo gordo.',
    treatment: 'Revisión y limpieza del canal ungueal.',
    recommendations: 'No cortar las uñas demasiado cortas.',
    recoveryTime: '24-48 horas'
  },
  { 
    id: 'C-6003', 
    patientId: 'PT-1006', 
    date: '2026-03-01', 
    doctor: 'Lic. Karina', 
    summary: 'Primera consulta, evaluación general.', 
    type: 'Consulta', 
    status: 'Completed', 
    cost: 120000,
    symptoms: 'Durezas en los talones y resequedad.',
    treatment: 'Evaluación integral y tratamiento inicial de hiperqueratosis.',
    recommendations: 'Empezar tratamiento con urea al 20%.',
    recoveryTime: 'Inmediato'
  },
  
  // Consultas de Febrero (Mes Pasado - Comparativa)
  { id: 'C-5001', patientId: 'PT-1001', date: '2026-02-10', doctor: 'Lic. Karina', summary: 'Tratamiento onicocriptosis.', type: 'Urgencia', status: 'Completed', cost: 180000, symptoms: 'Dolor agudo e inflamación.', treatment: 'Extracción de espícula.', recommendations: 'Baños de sal y antiséptico.', recoveryTime: '3-5 días' },
  { id: 'C-5002', patientId: 'PT-1002', date: '2026-02-15', doctor: 'Lic. Karina', summary: 'Profilaxis.', type: 'Mantenimiento', status: 'Completed', cost: 150000, symptoms: 'Mantenimiento mensual.', treatment: 'Profilaxis podológica.', recommendations: 'Cuidado diario.', recoveryTime: 'Inmediato' },
  { id: 'C-5003', patientId: 'PT-1003', date: '2026-02-20', doctor: 'Lic. Karina', summary: 'Micosis control.', type: 'Consulta', status: 'Completed', cost: 120000, symptoms: 'Presencia de hongos en uñas.', treatment: 'Limpieza mecánica y laca.', recommendations: 'Mantener pies secos.', recoveryTime: 'Prolongado' },
  { id: 'C-5004', patientId: 'PT-1005', date: '2026-02-28', doctor: 'Lic. Karina', summary: 'Evaluación pie diabético.', type: 'Consulta', status: 'Completed', cost: 150000, symptoms: 'Pérdida de sensibilidad leve.', treatment: 'Evaluación neurológica y circulatoria.', recommendations: 'Revisión diaria de pies.', recoveryTime: 'Seguimiento continuo' },
];

export const mockAppointments = [
  // Hoy: 2026-03-16
  { id: 'APP-1', title: 'Juan Ramón Ayala - Retiro de Espícula', date: new Date('2026-03-16T10:00:00'), duration: 45, type: 'Urgencia', status: 'Pending', patientId: 'PT-1001' },
  { id: 'APP-2', title: 'Blanca Nieves Galeano - Profilaxis', date: new Date('2026-03-16T14:30:00'), duration: 45, type: 'Mantenimiento', status: 'Pending', patientId: 'PT-1002' },
  
  // Mismo día mes pasado: 2026-02-16
  { id: 'APP-101', title: 'Silverio Martínez - Control', date: new Date('2026-02-16T10:00:00'), duration: 30, type: 'Consulta', status: 'Completed', patientId: 'PT-1003' },
  
  // Próximas
  { id: 'APP-3', title: 'Silverio Martínez - Control Micosis', date: new Date('2026-03-18T09:00:00'), duration: 30, type: 'Consulta', status: 'Pending', patientId: 'PT-1003' },
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
    cost: '150000'
  },
  { 
    id: 'TMP-2', 
    title: 'Tratamiento de Uña Encarnada (Onicocriptosis)', 
    symptoms: 'Dolor, enrojecimiento e inflamación en canales ungueales. Molestia al tacto.', 
    treatment: 'Espiculotomía lateral con instrumental estéril, retiro de espícula y curación local con antiséptico.', 
    recommendations: 'Evitar calzado ajustado. Mantener vendaje seco por 24hs. Control de curación en 48hs.', 
    recoveryTime: '3-5 días', 
    notes: 'Evaluar si requiere derivación médica en caso de granuloma infectado.',
    cost: '180000'
  },
  { 
    id: 'TMP-3', 
    title: 'Tratamiento de Onicomicosis (Hongos)', 
    symptoms: 'Uñas engrosadas, hiperqueratósicas, amarillentas o quebradizas.', 
    treatment: 'Desbridamiento mecánico profundo de la lámina ungueal y aplicación de laca antimicótica.', 
    recommendations: 'Uso diario de antimicótico tópico. Desinfección de calzados y medias.', 
    recoveryTime: 'Evaluación mensual', 
    notes: 'Explicar al paciente que el crecimiento de uña sana demora meses.',
    cost: '120000'
  }
,
];
