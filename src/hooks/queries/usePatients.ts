import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatients, savePatient, updatePatient, deletePatient, updatePatientStatus } from '../../services/dataService';
import type { Patient } from '../../services/dataService';

export const PATIENTS_KEY = ['patients'];

export const usePatients = () => {
  return useQuery({
    queryKey: PATIENTS_KEY,
    queryFn: getPatients,
  });
};

export const useSavePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patient: Partial<Patient>) => savePatient(patient),
    onMutate: async (newP) => {
      await queryClient.cancelQueries({ queryKey: PATIENTS_KEY });
      const previous = queryClient.getQueryData<Patient[]>(PATIENTS_KEY);
      if (previous) {
        queryClient.setQueryData<Patient[]>(PATIENTS_KEY, [{ ...newP, id: newP.id || Date.now() } as Patient, ...previous]);
      }
      return { previous };
    },
    onError: (err, newP, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PATIENTS_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patient: Patient) => updatePatient(patient),
    onMutate: async (updatedP) => {
      await queryClient.cancelQueries({ queryKey: PATIENTS_KEY });
      const previous = queryClient.getQueryData<Patient[]>(PATIENTS_KEY);
      if (previous) {
        queryClient.setQueryData<Patient[]>(
          PATIENTS_KEY,
          previous.map(p => p.id === updatedP.id ? updatedP : p)
        );
      }
      return { previous };
    },
    onError: (err, updatedP, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PATIENTS_KEY, context.previous);
      }
    },
    onSettled: () => {
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
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: PATIENTS_KEY });
      const previous = queryClient.getQueryData<Patient[]>(PATIENTS_KEY);
      if (previous) {
        queryClient.setQueryData<Patient[]>(
          PATIENTS_KEY,
          previous.filter(p => p.id !== idToDelete)
        );
      }
      return { previous };
    },
    onError: (err, idToDelete, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PATIENTS_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
    },
  });
};
