// Firebase client placeholder
// Ce projet utilise Supabase comme backend principal.
// Ce fichier est reserve pour une eventuelle integration Firebase
// (notifications push, analytics, etc.)

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
}

export let firebaseApp = null

export async function initFirebase() {
  if (!firebaseConfig.apiKey) return null
  try {
    const { initializeApp } = await import('firebase/app')
    firebaseApp = initializeApp(firebaseConfig)
    return firebaseApp
  } catch {
    console.warn('Firebase non configure')
    return null
  }
}
