import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RentivoBrand from '@/components/RentivoBrand'
import SetupForm from './SetupForm'

export const metadata = {
  title: 'Koneksi Webhook — Rentivo',
  description: 'Setup koneksi webhook WhatsApp untuk workspace Rentivo Anda.',
}

export default async function RegisterSetupPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Ensure they are owner
  if (session.user.user_metadata?.role !== 'owner') {
    redirect('/dashboard')
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center p-md md:p-xl antialiased">
      <div className="mb-xl flex justify-center">
        <RentivoBrand eyebrow="Operations Suite" />
      </div>

      {/* Wizard Container */}
      <main className="w-full max-w-[800px] bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col shadow-sm">
        {/* Progress Header */}
        <div className="px-lg md:px-xl py-xl border-b border-outline-variant bg-surface-bright rounded-t-xl">
          <div className="flex items-center justify-between relative">
            {/* Connecting Lines */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] -z-10 flex transform -translate-y-1/2 px-12">
              <div className="w-1/2 h-full bg-primary transition-all duration-500"></div>
              <div className="w-1/2 h-full bg-surface-variant transition-all duration-500"></div>
            </div>

            {/* Step 1: Completed */}
            <div className="flex flex-col items-center gap-sm bg-surface-bright px-sm">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface">Profil Bisnis</span>
            </div>

            {/* Step 2: Active */}
            <div className="flex flex-col items-center gap-sm bg-surface-bright px-sm">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container border-2 border-primary flex items-center justify-center font-title-sm text-title-sm">
                2
              </div>
              <span className="font-label-caps text-label-caps text-primary">Koneksi Webhook</span>
            </div>

            {/* Step 3: Pending */}
            <div className="flex flex-col items-center gap-sm bg-surface-bright px-sm">
              <div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-title-sm text-title-sm">
                3
              </div>
              <span className="font-label-caps text-label-caps text-on-surface-variant">Selesai</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-lg md:p-xl flex-grow">
          <div className="max-w-[540px] mx-auto">
            <div className="mb-xl text-center">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">Koneksi Webhook WhatsApp</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                (Opsional) Hubungkan instans WhatsApp Business API Anda untuk mengaktifkan AI Copilot. Masukkan kredensial dari provider Meta atau BSP Anda di bawah ini, atau lewati langkah ini.
              </p>
            </div>

            <SetupForm />
          </div>
        </div>
      </main>
    </div>
  )
}
