import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import { BASE_API_URL } from '../constants'

export function apiFetch<T>(url: string, options?: NitroFetchOptions<NitroFetchRequest>): Promise<T> {
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`
  const fullUrl = `${BASE_API_URL}${normalizedUrl}`
  return $fetch(fullUrl, {
    ...options,
    async onRequest(ctx) {
      const token = useCookie('token').value

      if (ctx.options.headers === undefined)
        ctx.options.headers = new Headers()

      if (token) {
        if (ctx.options.headers instanceof Headers) {
          ctx.options.headers.set('Authorization', `Token ${token}`)
        }
        else {
          (ctx.options.headers as Record<string, string>).Authorization = `Token ${token}`
        }
      }

      if (Array.isArray(options?.onRequest)) {
        for (const handler of options.onRequest) {
          await handler(ctx)
        }
      }
      else if (options?.onRequest) {
        return options.onRequest(ctx)
      }
    },
    onResponse(ctx) {
      // @NOTE This is a workaround for the to catch data from `registerEndpoint` in mocks/.../endpoints.ts
      if (ctx.response._data?.data?.errors)
        ctx.response._data.errors = ctx.response._data.data.errors

      if (Array.isArray(options?.onResponse)) {
        for (const handler of options.onResponse) {
          handler(ctx)
        }
      }
      else if (options?.onResponse) {
        return options.onResponse(ctx)
      }
    },
  })
}
