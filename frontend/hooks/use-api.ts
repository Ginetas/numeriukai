'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';

export function useApiQuery<T>(key: unknown[], path: string, enabled = true) {
  return useQuery({
    queryKey: key,
    queryFn: () => api.get<T>(path),
    enabled,
  });
}

export function useApiMutation<T>(options: {
  path: string;
  method: 'post' | 'put' | 'delete';
  invalidateKeys?: unknown[][];
  successMessage?: string;
}) {
  const queryClient = useQueryClient();
  const { push } = useToast();
  return useMutation({
    mutationFn: (body?: unknown) => {
      if (options.method === 'post') return api.post<T>(options.path, body);
      if (options.method === 'put') return api.put<T>(options.path, body);
      return api.delete<T>(options.path);
    },
    onSuccess: () => {
      options.invalidateKeys?.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      if (options.successMessage) push({ title: options.successMessage });
    },
    onError: (error: Error) => push({ title: 'API error', description: error.message, variant: 'destructive' }),
  });
}
