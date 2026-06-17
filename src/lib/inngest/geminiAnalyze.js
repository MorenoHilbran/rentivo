import { db } from '../db/index.js'
import { aiDrafts, messages, products } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { analyzeText } from '../gemini/client.js'
import { createBookingFromDraft } from '../booking/createFromDraft.js'

/**
 * Analyze a single ai_draft record by id.
 * - Loads the related message content
 * - Fetches tenant's product names for AI context
 * - Calls `analyzeText` to produce extractedData + confidence
 * - Updates ai_drafts and messages.aiAnalysis
 */
export async function analyzeDraftById(draftId) {
  if (!draftId) throw new Error('draftId required')

  const draft = await db.query.aiDrafts.findFirst({
    where: (d, { eq }) => eq(d.id, draftId),
  })

  if (!draft) {
    throw new Error('ai_draft not found')
  }

  const msg = draft.messageId ? await db.query.messages.findFirst({
    where: (m, { eq }) => eq(m.id, draft.messageId),
  }) : null

  const textToAnalyze = msg?.content ?? (draft.extractedData?.notes ?? '')

  // Fetch tenant-specific product names for Gemini context
  let productNames = []
  try {
    const tenantProducts = await db.query.products.findMany({
      where: (p, { eq, and }) => and(eq(p.tenantId, draft.tenantId), eq(p.isActive, true)),
    })
    productNames = tenantProducts.map(p => p.name)
  } catch (err) {
    console.error('Failed to fetch tenant products for AI context:', err)
  }

  const { extractedData, confidence } = await analyzeText(textToAnalyze, productNames)

  // Update ai_drafts with extracted info
  await db.update(aiDrafts).set({
    extractedData,
    confidence: confidence ?? null,
  }).where(eq(aiDrafts.id, draftId))

  // Update message.aiAnalysis if message exists
  if (msg) {
    await db.update(messages).set({
      aiAnalysis: extractedData,
    }).where(eq(messages.id, msg.id))
  }

  // Auto-approve + create booking/invoice when configured and confidence threshold met
  const autoApprove = (process.env.AI_AUTO_APPROVE || 'false') === 'true'
  const threshold = Number(process.env.AI_AUTO_APPROVE_CONFIDENCE ?? 0.6)

  if (autoApprove && confidence !== null && Number(confidence) >= threshold) {
    try {
      const updatedDraft = await db.query.aiDrafts.findFirst({ where: (d, { eq }) => eq(d.id, draftId) })
      const result = await createBookingFromDraft(updatedDraft)
      return { ok: true, draftId, confidence, autoApproved: true, booking: result.booking, invoice: result.invoice }
    } catch (err) {
      console.error('auto-approve error:', err)
      // continue returning normal result
    }
  }

  return { ok: true, draftId, confidence }
}
