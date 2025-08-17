import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge' // npm install tailwind-merge

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

export const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })