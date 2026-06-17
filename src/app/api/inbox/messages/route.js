import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { messages, aiDrafts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireTenantAuth } from '@/lib/session'

/**
 * GET /api/inbox/messages?conversationId=xxx
 * Fetch messages and pending AI draft for a specific conversation.
 * Used by InboxClient for instant conversation switching.
 */
export async function GET(request) {
  try {
    const { tenantId } = await requireTenantAuth(['owner', 'admin'])
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ ok: false, error: 'conversationId required' }, { status: 400 })
    }

    // Fetch messages for this conversation
    const convMessages = await db
      .select()
      .from(messages)
      .where(and(eq(messages.tenantId, tenantId), eq(messages.conversationId, conversationId)))
      .orderBy(messages.sentAt)

    // Fetch pending AI draft
    const pendingDraft = await db.query.aiDrafts.findFirst({
      where: and(
        eq(aiDrafts.tenantId, tenantId),
        eq(aiDrafts.conversationId, conversationId),
        eq(aiDrafts.status, 'pending')
      ),
    })

    return NextResponse.json({
      ok: true,
      messages: convMessages,
      pendingDraft: pendingDraft || null,
    })
  } catch (err) {
    console.error('GET /api/inbox/messages error:', err)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}
