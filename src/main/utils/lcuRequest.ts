// 🎯 文件：src/main/utils/netFetch.ts

// 允许 Node.js 忽略自签名不安全证书 (对 LCU 请求生效，对外部外部请求无影响)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

/**
 * 核心：纯粹的通用 Fetch 封装 (Zero Any)
 */
async function coreFetch<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      console.warn(`[网络请求异常] ${response.status}: ${url}`)
      throw new Error(`HTTP Error: ${response.status}`)
    }
    
    // 解析 JSON 响应并进行安全类型断言
    return (await response.json()) as T
  } catch (e) {
    console.error(`[Fetch 崩溃] URL: ${url}`, e)
    throw e
  }
}

// === 业务便捷导出 (纯粹且通用) ===
export const netFetch = {
  get: <T = unknown>(url: string, options?: RequestInit) =>
    coreFetch<T>(url, { ...options, method: 'GET' }),
    
  post: <T = unknown, B = unknown>(url: string, body: B, options?: RequestInit) => {
    const headers = new Headers(options?.headers)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    return coreFetch<T>(url, { ...options, method: 'POST', headers, body: JSON.stringify(body) })
  },
  
  delete: <T = unknown>(url: string, options?: RequestInit) =>
    coreFetch<T>(url, { ...options, method: 'DELETE' }),
    
  patch: <T = unknown, B = unknown>(url: string, body: B, options?: RequestInit) => {
    const headers = new Headers(options?.headers)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    return coreFetch<T>(url, { ...options, method: 'PATCH', headers, body: JSON.stringify(body) })
  }
}