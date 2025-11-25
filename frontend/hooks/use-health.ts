'use client';

import { useApiQuery } from './use-api';
import type { HealthResponse } from '@/lib/types';

export function useHealthStatus() {
  return useApiQuery<HealthResponse>(['health'], '/healthz');
}
