import { useState } from 'react'
import { format } from 'date-fns'

export function useMonthState(initial?: string) {
  return useState(initial || format(new Date(), 'yyyy-MM'))
}
