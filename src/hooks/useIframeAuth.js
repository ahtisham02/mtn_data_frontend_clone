import { useEffect, useState } from 'react'

export function useIframeAuth(enabled = true) {
  const [isTokenLoaded, setIsTokenLoaded] = useState(false)
  const [authData, setAuthData] = useState(null)

  useEffect(() => {
    if (!enabled) return

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

    const channel = new BroadcastChannel('sd_auth_channel')
    channel.addEventListener('message', (event) => {
      const { type, token, accessToken, email, name } = event.data || {}
      if (type === 'AUTH_TOKEN') processToken(accessToken || token, email, name)
    })
    setTimeout(() => channel.postMessage({ type: 'REQUEST_TOKEN' }), 300)

    const handleMessage = (event) => {
      const allowed = [
        'https://salesdriver.io',
        'http://localhost:5174',
        'https://mtndata.com',
        'https://salesdriver.io',
        'https://www.salesdriver.io',
        'https://mtndata.com',
      ]
      if (!allowed.includes(event.origin)) return
      const msg = event.data
      if ((msg?.type === 'AUTH_TOKEN' || msg?.type === 'sales-io:access-token') && msg?.token)
        processToken(msg.token, msg.email, msg.name)
    }
    window.addEventListener('message', handleMessage)

    return () => { channel.close(); window.removeEventListener('message', handleMessage) }
  }, [enabled])

  return { isTokenLoaded, authData }
}
