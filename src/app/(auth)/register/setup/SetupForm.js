'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    // Simulate saving webhook data
    await new Promise(resolve => setTimeout(resolve, 800))
    router.push('/dashboard')
  }

  function handleSkip() {
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
      {/* Provider Selection (Read Only) */}
      <div>
        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Provider Koneksi</label>
        <div className="flex items-center gap-sm p-sm border border-outline-variant rounded bg-surface">
          <svg className="w-5 h-5 text-primary ml-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          <span className="font-body-md text-body-md text-on-surface">Meta Cloud API (Resmi)</span>
        </div>
      </div>

      {/* Webhook URL Input */}
      <div>
        <label className="block font-label-caps text-label-caps text-on-surface mb-xs" htmlFor="webhook_url">
          Webhook Callback URL
        </label>
        <input 
          id="webhook_url" 
          type="url" 
          className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded p-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-code text-code placeholder:text-outline" 
          placeholder="https://api.rentivo.com/v1/webhooks/wa/..." 
        />
      </div>

      {/* Bearer Token Input */}
      <div>
        <label className="block font-label-caps text-label-caps text-on-surface mb-xs" htmlFor="bearer_token">
          Verify Token / Bearer Token
        </label>
        <div className="relative">
          <input 
            id="bearer_token" 
            type="password" 
            className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded p-sm pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-code text-code placeholder:text-outline" 
            placeholder="Masukkan token verifikasi..." 
          />
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Pastikan token ini sama dengan yang Anda atur di dashboard Meta App.</p>
      </div>

      {/* Connection Status Panel (Informational) */}
      <div className="bg-surface-bright border border-secondary-container rounded p-md flex gap-md items-start mt-sm">
        <svg className="w-5 h-5 text-primary-container mt-[2px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          <h4 className="font-title-sm text-title-sm text-on-surface mb-xs">Petunjuk Integrasi</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Setelah menyimpan, sistem akan mengirimkan payload percobaan (ping) ke URL yang Anda tentukan untuk memverifikasi handshake. Pastikan endpoint Anda merespons dengan HTTP 200.</p>
        </div>
      </div>

      <div className="pt-lg border-t border-outline-variant mt-lg flex justify-between items-center">
        <button 
          type="button" 
          onClick={handleSkip}
          className="px-md py-sm border border-outline-variant text-secondary rounded font-title-sm text-title-sm hover:bg-surface-container transition-colors flex items-center gap-xs"
        >
          Lewati
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="px-lg py-sm bg-primary text-on-primary rounded font-title-sm text-title-sm hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-xs shadow-sm disabled:opacity-70"
        >
          {loading ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
        </button>
      </div>
    </form>
  )
}
