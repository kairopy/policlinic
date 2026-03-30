// Mock Data for UI presentation - Tailored for Podiatry & Paraguayan Names

export const mockPatients = [
  { id: 'PT-1001', name: 'Juan Ramón Ayala', age: 45, phone: '+595 (981) 123-456', email: 'j.ayala@email.com', lastVisit: '2023-10-15', status: 'Active' },
  { id: 'PT-1002', name: 'Blanca Nieves Galeano', age: 32, phone: '+595 (971) 987-654', email: 'b.galeano@email.com', lastVisit: '2023-11-02', status: 'Inactive' },
  { id: 'PT-1003', name: 'Silverio Martínez', age: 58, phone: '+595 (961) 456-789', email: 's.martinez@email.com', lastVisit: '2023-10-28', status: 'Active' },
  { id: 'PT-1004', name: 'Nilsa Beatriz Morel', age: 28, phone: '+595 (982) 234-567', email: 'n.morel@email.com', lastVisit: '2023-11-10', status: 'Active' },
  { id: 'PT-1005', name: 'Gustavo Adolfo Benítez', age: 62, phone: '+595 (991) 876-543', email: 'g.benitez@email.com', lastVisit: '2023-09-05', status: 'Inactive' },
];

export const mockConsultations = [
  { 
    id: 'C-5001', 
    patientId: 'PT-1001', 
    date: '2023-10-15', 
    doctor: 'Lic. Karina', 
    summary: 'Retiro de espícula en dedo gordo derecho (Onicocriptosis).', 
    type: 'Urgencia', 
    status: 'Completed', 
    cost: 180000,
    symptoms: 'Dolor punzante e inflamación en el lateral del dedo gordo del pie derecho. Dificultad para calzarse.',
    treatment: 'Espiculotomía lateral con instrumental estéril, retiro de espícula y curación con antiséptico y vendaje.',
    recommendations: 'Mantener el pie seco por 24 horas. Usar calzado holgado. Volver para control en 3 días.',
    recoveryTime: '3-5 días',
    notes: 'No presenta signos de infección severa (pus o granuloma), solo inflamación local.'
  },
  { 
    id: 'C-5002', 
    patientId: 'PT-1003', 
    date: '2023-10-28', 
    doctor: 'Lic. Karina', 
    summary: 'Tratamiento y desbridamiento de onicomicosis.', 
    type: 'Consulta', 
    status: 'Completed', 
    cost: 120000,
    symptoms: 'Uñas de ambos pies engrosadas, quebradizas y con cambio de color amarillento.',
    treatment: 'Limpieza profunda del lecho ungueal, desbridamiento mecánico y aplicación de medicamentos antimicóticos.',
    recommendations: 'Aplicar laca antimicótica todas las noches. Desinfectar calzados.',
    recoveryTime: 'Evaluación mensual',
    notes: 'Se sugiere constancia en el tratamiento tópico diario para ver resultados.'
  },
  { 
    id: 'C-5003', 
    patientId: 'PT-1004', 
    date: new Date().toISOString().split('T')[0], 
    doctor: 'Lic. Karina', 
    summary: 'Profilaxis podológica general y retiro de helomas.', 
    type: 'Mantenimiento', 
    status: 'In Progress', 
    cost: 150000,
    symptoms: 'Dolor en la planta del pie al caminar por presencia de callosidades (helomas).',
    treatment: 'Corte correcto de uñas, desbridamiento de hiperqueratosis (callosidades) y masaje de descarga.',
    recommendations: 'Hidratar pies diariamente con crema a base de urea. Usar plantillas si el dolor persiste.',
    recoveryTime: 'Inmediato',
    notes: 'Paciente refiere alivio inmediato tras el desbridamiento de los helomas plantares.'
  },
];

export const mockAppointments = [
  { id: 1, title: 'Juan Ramón Ayala - Retiro de Espícula', date: new Date(new Date().setHours(10, 0, 0, 0)), duration: 45, type: 'Urgencia', status: 'Pending', patientId: 'PT-1001' },
  { id: 2, title: 'Blanca Nieves Galeano - Profilaxis', date: new Date(new Date().setHours(14, 30, 0, 0)), duration: 45, type: 'Mantenimiento', status: 'Pending', patientId: 'PT-1002' },
  { id: 3, title: 'Silverio Martínez - Control Micosis', date: new Date(new Date().setDate(new Date().getDate() + 2)), duration: 30, type: 'Consulta', status: 'Pending', patientId: 'PT-1003' },
];

export const mockTemplates = [
  { 
    id: 1, 
    title: 'Profilaxis Podológica General', 
    symptoms: 'Consulta de rutina o mantenimiento general. Presencia de hiperqueratosis leve.', 
    treatment: 'Corte correcto de uñas, desbridamiento de hiperqueratosis y masaje de descarga podológico.', 
    recommendations: 'Mantener hidratación diaria con cremas específicas. Control en 30 días.', 
    recoveryTime: 'Inmediato', 
    notes: 'Vitals: Presión ____ | Sensibilidad: ____ | Pulso pedal: ____',
    cost: '150000'
  },
  { 
    id: 2, 
    title: 'Tratamiento de Uña Encarnada (Onicocriptosis)', 
    symptoms: 'Dolor, enrojecimiento e inflamación en canales ungueales. Molestia al tacto.', 
    treatment: 'Espiculotomía lateral con instrumental estéril, retiro de espícula y curación local con antiséptico.', 
    recommendations: 'Evitar calzado ajustado. Mantener vendaje seco por 24hs. Control de curación en 48hs.', 
    recoveryTime: '3-5 días', 
    notes: 'Evaluar si requiere derivación médica en caso de granuloma infectado.',
    cost: '180000'
  },
  { 
    id: 3, 
    title: 'Tratamiento de Onicomicosis (Hongos)', 
    symptoms: 'Uñas engrosadas, hiperqueratósicas, amarillentas o quebradizas.', 
    treatment: 'Desbridamiento mecánico profundo de la lámina ungueal y aplicación de laca antimicótica.', 
    recommendations: 'Uso diario de antimicótico tópico. Desinfección de calzados y medias.', 
    recoveryTime: 'Evaluación mensual', 
    notes: 'Explicar al paciente que el crecimiento de uña sana demora meses.',
    cost: '120000'
  },
];
