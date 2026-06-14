import { useState, useEffect } from 'react'
import './styles/globals.css'
import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Certifications from './components/Certifications'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const handleSetTheme = (newTheme: string) => {
    const themeValue = newTheme as 'dark' | 'light'
    setTheme(themeValue)
    document.documentElement.setAttribute('data-theme', themeValue)
  }

  return (
    <>
      <Header theme={theme} setTheme={handleSetTheme} />
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Experience />
      <Certifications />
      <Contact />
      <Footer />
    </>
  )
}

export default App

