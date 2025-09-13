import { useEffect, useState } from 'react'
import { FiMoon, FiSun } from 'react-icons/fi'

const ThemeToggle = () => {
  const getInitial = () => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') return true
    if (stored === 'light') return false
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const [dark, setDark] = useState(getInitial)

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <button
      type="button"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setDark((v) => !v)}
      className="group relative mr-3 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 p-3 rounded-full shadow-md hover:shadow-lg hover:scale-110 active:scale-95 border border-gray-200/60 dark:border-gray-700 focus-ring"
    >
      {dark ? (
        <FiSun size={20} className="transition-transform duration-200 group-hover:rotate-12" />
      ) : (
        <FiMoon size={20} className="transition-transform duration-200 group-hover:-rotate-12" />
      )}
    </button>
  )
}

export default ThemeToggle
