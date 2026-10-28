import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from './client'

type Query = Record<string, string | number | boolean | null | undefined>

interface QueryOpts {
  enabled?: boolean
  refetchInterval?: number | false
}

/** GET tipado: la clave de caché es [path, query]. */
export function useApiQuery<T>(path: string, query?: Query, opts: QueryOpts = {}) {
  return useQuery<T, ApiError>({
    queryKey: [path, query ?? {}],
    queryFn: () => api<T>(path, { query }),
    ...opts,
  })
}

/** Mutación que invalida las consultas cuyo path empiece por alguno de `invalidate`. */
export function useApiMutation<V, R = unknown>(
  fn: (vars: V) => Promise<R>,
  invalidate: string[] = [],
) {
  const qc = useQueryClient()
  return useMutation<R, ApiError, V>({
    mutationFn: fn,
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) =>
          invalidate.some((p) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith(p)),
      }),
  })
}
