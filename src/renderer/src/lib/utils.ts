import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind className，并自动去重/覆盖冲突类。
 *
 * @param inputs - class 列表（例如：cn('px-2', condition && 'text-red-500', ['bg-zinc-900', 'px-4'] )）
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs))
}

