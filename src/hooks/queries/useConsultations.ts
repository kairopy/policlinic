import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConsultations, saveConsultation, getTemplates } from '../../services/dataService';
import type { Consultation } from '../../services/dataService';

export const CONSULTATIONS_KEY = ['consultations'];

export const useConsultations = () => {
  return useQuery({
    queryKey: CONSULTATIONS_KEY,
    queryFn: () => getConsultations(true),
  });
};

export const useSaveConsultation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (consultation: Consultation) => saveConsultation(consultation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_KEY });
      // Crear una consulta usualmente afecta lastVisit del paciente, invalidamos pacientes también
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });
};
