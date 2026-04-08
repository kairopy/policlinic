import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConsultations, saveConsultation, getTemplates } from '../../services/dataService';
import type { Consultation } from '../../services/dataService';

export const CONSULTATIONS_KEY = ['consultations'];

export const useConsultations = () => {
  return useQuery({
    queryKey: CONSULTATIONS_KEY,
    queryFn: getConsultations,
  });
};

export const useSaveConsultation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (consultation: Consultation) => saveConsultation(consultation),
    onMutate: async (newConsult) => {
      // Cancelar cualquier refetch saliente (para que no sobreescriban nuestro update optimista)
      await queryClient.cancelQueries({ queryKey: CONSULTATIONS_KEY });

      // Hacer snapshot de los datos actuales
      const previousConsultations = queryClient.getQueryData<Consultation[]>(CONSULTATIONS_KEY);

      // Actualizar la caché optimísticamente
      if (previousConsultations) {
        queryClient.setQueryData<Consultation[]>(CONSULTATIONS_KEY, [newConsult, ...previousConsultations]);
      }

      return { previousConsultations };
    },
    onError: (err, newConsult, context) => {
      // Revertir a la versión anterior si hubo error
      if (context?.previousConsultations) {
        queryClient.setQueryData(CONSULTATIONS_KEY, context.previousConsultations);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_KEY });
      // Crear una consulta usualmente afecta lastVisit del paciente, invalidamos pacientes también
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onSettled: () => {
      // Asegurar sincronización final
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_KEY });
    },
  });
};

export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });
};
