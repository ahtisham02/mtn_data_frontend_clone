import { useEffect, useState } from 'react'

export function useIframeAuth(enabled = true) {
  const [isTokenLoaded, setIsTokenLoaded] = useState(false)
  const [authData, setAuthData]           = useState(null)
  const [loggedOut, setLoggedOut]         = useState(false)

  useEffect(() => {
    const processToken = (token, email, name) => {
      try {
        localStorage.setItem('access_token', token)
        localStorage.setItem('userToken', token)
        if (email) localStorage.setItem('salesdriver_email', email)
        if (name)  localStorage.setItem('salesdriver_name', name)
        setAuthData({ token, email, name })
        setIsTokenLoaded(true)
        console.log('✅ SalesDriver auth token received in MTN Data')
      } catch (err) {
        console.error(err)
      }
    }

    const handleLogout = () => {
      console.log('🔴 SalesDriver LOGOUT received — logging out MTN Data')
      localStorage.removeItem('access_token')
      localStorage.removeItem('userToken')
      localStorage.removeItem('salesdriver_email')
      localStorage.removeItem('salesdriver_name')
      setLoggedOut(true)
    }

    // storage event — cross-origin logout signal from SalesDriver iframe
    const handleStorageLogout = (event) => {
      if (event.key === 'sd_logout' && event.newValue) handleLogout()
    }
    window.addEventListener('storage', handleStorageLogout)

    const ALLOWED = [
      'https://salesdriver.io',
      'https://www.salesdriver.io',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://mtndata.com',
    ]

    const handleMessage = (event) => {
      if (!ALLOWED.includes(event.origin)) return
      const msg = event.data
      if (msg?.type === 'LOGOUT') { handleLogout(); return }
      if (msg?.type === 'NO_TOKEN') {
        console.log('ℹ️ SalesDriver: user not logged in, SSO not available')
        return
      }
      if (!enabled) return
      if ((msg?.type === 'AUTH_TOKEN' || msg?.type === 'sales-io:access-token') && msg?.token)
        processToken(msg.token, msg.email, msg.name)
    }
    window.addEventListener('message', handleMessage)

    // BroadcastChannel — same-origin cross-tab
    const channel = new BroadcastChannel('sd_auth_channel')
    channel.addEventListener('message', (event) => {
      const { type, token, accessToken, email, name } = event.data || {}
      if (type === 'LOGOUT') { handleLogout(); return }
      if (type === 'AUTH_TOKEN' && enabled) processToken(accessToken || token, email, name)
    })

    // REQUEST_TOKEN with retries
    let timers = []
    if (enabled) {
      const delays = [300, 1000, 2000, 4000]
      timers = delays.map((delay) =>
        setTimeout(() => channel.postMessage({ type: 'REQUEST_TOKEN' }), delay)
      )
    }

    return () => {
      timers.forEach(clearTimeout)
      channel.close()
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('storage', handleStorageLogout)
    }
  }, [enabled])

  return { isTokenLoaded, authData, loggedOut }
}
