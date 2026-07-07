export const required = (value) => !!value || 'Ce champ est obligatoire'

export const email = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Email invalide'

export const minLength = (min) => (value) =>
  (value && value.length >= min) || `Minimum ${min} caractères`

export const maxLength = (max) => (value) =>
  (!value || value.length <= max) || `Maximum ${max} caractères`

export const phone = (value) =>
  !value || /^[\d\s+\-()]{8,15}$/.test(value) || 'Numéro de téléphone invalide'

export const positiveNumber = (value) =>
  (value !== '' && value !== null && Number(value) > 0) || 'Doit être un nombre positif'

export const passwordMatch = (password) => (value) =>
  value === password || 'Les mots de passe ne correspondent pas'
