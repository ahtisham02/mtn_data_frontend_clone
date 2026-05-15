import { useEffect } from 'react'

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5175',
  'https://salesdriver.io',
  'https://www.salesdriver.io',
  'https://mtndata.com',
]

export default function IframeMessageHandler() {
  useEffect(() => {
    const handleMessage = (event) => {
      if (!ALLOWED_ORIGINS.includes(event.origin)) return
      if (event.data?.type === 'PING') {
        event.source.postMessage({ type: 'PONG' }, event.origin)
        return
      }
      if (event.data?.type === 'LOGOUT') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('userToken')
        localStorage.removeItem('salesdriver_email')
        localStorage.removeItem('salesdriver_name')
        // Set sd_logout so both storage event (cross-tab) and polling (same-tab) pick it up
        localStorage.setItem('sd_logout', Date.now().toString())
        setTimeout(() => localStorage.removeItem('sd_logout'), 3000)
        event.source?.postMessage({ type: 'LOGOUT_CONFIRMED' }, event.origin)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])
  return null
}
