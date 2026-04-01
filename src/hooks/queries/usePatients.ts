import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatients, savePatient, updatePatient, deletePatient, updatePatientStatus } from '../../services/dataService';
import type { Patient } from '../../services/dataService';

export const PATIENTS_KEY = ['patients'];

export const usePatients = () => {
  return useQuery({
    queryKey: PATIENTS_KEY,
    // Llamamos siempre pasandole forceRefresh=true temporalmente para bypassear la cache interna del legacy service
    queryFn: () => getPatients(true),
  });
};

export const useSavePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patient: Partial<Patient>) => savePatient(patient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patient: Patient) => updatePatient(patient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
    },
  });
};

export const useUpdatePatientStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string }) => updatePatientStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
    },
  });
};
