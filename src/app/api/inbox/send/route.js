import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { messages, conversations } from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { eq } from 'drizzle-orm'

export async function POST(request) {
  try {
    const { tenantId } = await requireTenantAuth()
    
    // Parse form data
    const formData = await request.formData()
    const conversationId = formData.get('conversationId')
    const content = formData.get('content')

    if (!conversationId || !content) {
      return NextResponse.redirect(new URL('/inbox?error=Pesan+tidak+boleh+kosong', request.url), 303)
    }

    // Insert outbound message
    await db.insert(messages).values({
      tenantId,
      conversationId,
      direction: 'outbound',
      content,
      sentAt: new Date(),
    })

    // Update conversation meta preview
    await db.update(conversations).set({
      lastMessageAt: new Date(),
      lastMessagePreview: content.substring(0, 200),
    }).where(eq(conversations.id, conversationId))

    // Redirect back to the conversation thread (303 See Other is standard for POST redirect)
    return NextResponse.redirect(new URL(`/inbox?conversationId=${conversationId}`, request.url), 303)
  } catch (err) {
    console.error('Send chat error:', err)
    return NextResponse.redirect(new URL('/inbox?error=Gagal+mengirim+pesan', request.url), 303)
  }
}
