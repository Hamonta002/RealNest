import { useEffect, useRef, useState } from 'react'
import { googleLogin } from '../lib/api'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function GoogleSignInButton({ onSuccess, onError, role = 'customer' }) {
  const buttonRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined
    let script = document.querySelector('script[data-google-identity]')
    const render = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            const data = await googleLogin({ credential, role })
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            window.dispatchEvent(new Event('auth-changed'))
            onSuccess?.(data)
          } catch (error) { onError?.(error) }
        },
      })
      buttonRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', width: 360, text: 'continue_with', shape: 'rectangular' })
      setReady(true)
    }
    if (!script) {
      script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.dataset.googleIdentity = 'true'
      script.onload = render
      document.head.appendChild(script)
    } else if (window.google?.accounts?.id) render()
    return () => { if (buttonRef.current) buttonRef.current.innerHTML = '' }
  }, [onError, onSuccess, role])

  if (!GOOGLE_CLIENT_ID) {
    return <button type="button" className="auth-google-fallback" disabled>Google login · add your Client ID to enable</button>
  }
  return <div className={`google-signin ${ready ? 'google-signin--ready' : ''}`} ref={buttonRef} aria-label="Continue with Google" />
}

export default GoogleSignInButton
