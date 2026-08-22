import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as tripsApi from '../api/trips';

export function useTrips(params) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: () => tripsApi.listTrips(params),
  });
}

export function useTrip(id) {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: () => tripsApi.getTrip(id),
    enabled: Boolean(id),
  });
}

export function useSharedTrip(slug) {
  return useQuery({
    queryKey: ['sharedTrip', slug],
    queryFn: () => tripsApi.getSharedTrip(slug),
    enabled: Boolean(slug),
  });
}

export function useTripBudget(id) {
  return useQuery({
    queryKey: ['trip', id, 'budget'],
    queryFn: () => tripsApi.getTripBudget(id),
    enabled: Boolean(id),
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tripsApi.createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tripsApi.deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useDuplicateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tripsApi.duplicateTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
