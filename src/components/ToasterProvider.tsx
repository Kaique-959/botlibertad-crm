'use client'

import { Toaster } from 'react-hot-toast'

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '10px',
          background: '#0f3b5e',
          color: '#fff',
          fontSize: '14px',
          fontFamily: "'DM Sans', sans-serif",
          padding: '12px 16px',
        },
        success: { iconTheme: { primary: '#2dd4bf', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  )
}
