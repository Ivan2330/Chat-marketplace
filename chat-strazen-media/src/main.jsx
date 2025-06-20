import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <StrictMode>
      <BrowserRouter basename="/chat-strazen-media">
        <App />
      </BrowserRouter>
    </StrictMode>
  </GoogleOAuthProvider>
)
