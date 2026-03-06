export const getIconUrl = (path: string): string => {
  if (path.startsWith('/')) {
    return `lcu-img:/${path}`
  }
  return `lcu-img://${path}`
}