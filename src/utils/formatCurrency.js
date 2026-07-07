export function formatCurrency(amount, currency = 'XOF') {
  if (typeof amount !== 'number') return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
