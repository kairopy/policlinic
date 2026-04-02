import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointments, saveAppointment, deleteAppointment } from '../../services/dataService';
import type { Appointment } from '../../services/dataService';

export const APPOINTMENTS_KEY = ['appointments'];

export const useAppointments = () => {
  return useQuery({
    queryKey: APPOINTMENTS_KEY,
    queryFn: getAppointments,
  });
};

export const useSaveAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointment: Appointment) => saveAppointment(appointment),
    onMutate: async (newApp) => {
      await queryClient.cancelQueries({ queryKey: APPOINTMENTS_KEY });
      const previous = queryClient.getQueryData<Appointment[]>(APPOINTMENTS_KEY);
      if (previous) {
        queryClient.setQueryData<Appointment[]>(APPOINTMENTS_KEY, [newApp, ...previous]);
      }
      return { previous };
    },
    onError: (err, newApp, context) => {
      if (context?.previous) {
        queryClient.setQueryData(APPOINTMENTS_KEY, context.previous);
      }
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: APPOINTMENTS_KEY, type: 'active' });
      }, 1000);
    },
    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
      }, 2000);
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointment: Appointment) => updateAppointment(appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
    },
  });
};
