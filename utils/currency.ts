export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function parseCurrency(value: string): number {
  // Remove currency symbol and any non-digit characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`
  }
  return formatCurrency(amount)
}
