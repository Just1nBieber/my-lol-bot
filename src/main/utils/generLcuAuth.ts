export const buildLcuUrl = (port: number | string, endpoint: string): string => {
  const safeEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  console.log(safeEndpoint)
  return `https://127.0.0.1:${port}${safeEndpoint}`
}

export const generateLcuAuth = (password: string): string => {
  return `Basic ${Buffer.from(`riot:${password}`, 'utf-8').toString('base64')}`
}