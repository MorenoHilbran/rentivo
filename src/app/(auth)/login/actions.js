'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData) {
  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || !password) {
    redirect('/login?error=Email+dan+password+wajib+diisi')
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    redirect('/login?error=Email+atau+password+salah')
  }

  const role = data.user.user_metadata?.role

  if (role === 'superadmin') {
    redirect('/superadmin')
  }

  redirect('/dashboard')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
