'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveSetupAction } from '../actions'
import { Phone, Check, Link } from 'lucide-react'

export default function SetupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleSkip() {
    router.push('/dashboard')
  }

  return (
    <form 
      action={async (formData) => {
        setLoading(true)
        await saveSetupAction(formData)
      }}
      className="flex flex-col gap-5"
    >
      {/* Phone Number Input */}
      <div className="flex flex-col gap-2">
        <label className="font-label-caps text-label-caps font-bold text-on-surface-variant tracking-wider uppercase" htmlFor="phone">
          Nomor WhatsApp Bisnis <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Phone className="h-4 w-4 text-on-surface-variant" />
          </span>
          <input 
            id="phone" 
            name="phone"
            type="tel" 
            required
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-4 py-2.5 font-body-md text-body-md text-on-surface outline-none transition duration-150 focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-outline" 
            placeholder="Cth: +6281234567890" 
          />
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">AI akan memproses pesan masuk dan mengintegrasikannya ke nomor WhatsApp yang didaftarkan di sini.</p>
      </div>

      {/* Provider Selection (Read Only) */}
      <div className="flex flex-col gap-2">
        <label className="font-label-caps text-label-caps font-bold text-on-surface-variant tracking-wider uppercase">Provider Koneksi</label>
        <div className="flex items-center gap-2.5 px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-low/40">
          <Link className="w-5 h-5 text-primary shrink-0" />
          <span className="font-body-md text-body-md text-on-surface font-medium">Meta Cloud API (Resmi) & Baileys Client</span>
        </div>
      </div>

      {/* Webhook Info Panel */}
      <div className="bg-sky-50/50 border border-sky-500/20 rounded-2xl p-4 flex gap-3 items-start mt-2">
        <Check className="w-5 h-5 text-sky-600 mt-[2px] shrink-0" />
        <div>
          <h4 className="font-title-sm text-body-sm font-semibold text-sky-900 leading-5">Integrasi Instan</h4>
          <p className="text-xs text-sky-850 mt-1 leading-relaxed">
            WhatsApp yang didaftarkan akan secara otomatis diarahkan ke webhook AI Rentivo. Saat penyewa menyapa pertama kali, AI akan membalas dengan template booking.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-5 border-t border-outline-variant mt-3 flex justify-between items-center">
        <button 
          type="button" 
          onClick={handleSkip}
          className="btn btn-secondary btn-sm"
        >
          Lewati
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
        </button>
      </div>
    </form>
  )
}
