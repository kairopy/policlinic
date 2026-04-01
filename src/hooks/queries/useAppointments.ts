import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointments, saveAppointment, deleteAppointment } from '../../services/dataService';
import type { Appointment } from '../../services/dataService';

export const APPOINTMENTS_KEY = ['appointments'];

export const useAppointments = () => {
  return useQuery({
    queryKey: APPOINTMENTS_KEY,
    queryFn: () => getAppointments(true),
  });
};

export const useSaveAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointment: Appointment) => saveAppointment(appointment),
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
