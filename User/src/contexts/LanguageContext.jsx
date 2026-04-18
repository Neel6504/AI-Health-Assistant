import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext(null)
const SUPPORTED_LANGUAGES = ['en', 'hi', 'gu']

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en')

  const toggleLanguage = () => {
    setLanguage(prev => {
      const currentIndex = SUPPORTED_LANGUAGES.indexOf(prev)
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % SUPPORTED_LANGUAGES.length
      return SUPPORTED_LANGUAGES[nextIndex]
    })
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
