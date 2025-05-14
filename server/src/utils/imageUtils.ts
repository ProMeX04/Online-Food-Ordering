import { BACKEND_URL } from '../config'


export const getFullImageUrl = (relativePath: string): string => {
  const path = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath
  const backendBaseUrl = BACKEND_URL.replace(/\/api$/, '')

  return `${backendBaseUrl}/${path}`
}


export const processImagesInArray = <T>(items: T[], imageField: keyof T): T[] => {
  return items.map((item) => {
    const processed = { ...item } as any
    if (processed[imageField]) {
      processed[imageField] = getFullImageUrl(processed[imageField] as string)
    }
    return processed as T
  })
}
