#!/usr/bin/env node
/**
 * Simple Polling Worker for Inngest-like processing
 * - Polls `ai_drafts` with status='pending' and null confidence
 * - Calls analyzeDraftById for each draft
 * - Intended for local dev or as a fallback worker process
 */
import 'dotenv/config'
import { db } from '../db/index.js'
import { analyzeDraftById } from './geminiAnalyze.js'

const POLL_INTERVAL_MS = Number(process.env.INNGEST_POLL_INTERVAL_MS ?? 3000)
const BATCH_SIZE = Number(process.env.INNGEST_POLL_BATCH ?? 5)

async function fetchPendingDrafts(limit = BATCH_SIZE) {
  return db.query.aiDrafts.findMany({
    where: (d, { eq }) => eq(d.status, 'pending'),
    limit,
  })
}

async function processBatch() {
  try {
    const drafts = await fetchPendingDrafts()
    if (!drafts || drafts.length === 0) {
      // nothing to do
      return
    }

    for (const d of drafts) {
      try {
        console.log('Processing ai_draft', d.id)
        await analyzeDraftById(d.id)
        console.log('Processed', d.id)
      } catch (err) {
        console.error('Error processing draft', d.id, err)
      }
    }
  } catch (err) {
    console.error('pollWorker error', err)
  }
}

async function main() {
  console.log('Starting poll worker — polling every', POLL_INTERVAL_MS, 'ms')
  while (true) {
    await processBatch()
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
}

main().catch((err) => {
  console.error('Worker crashed', err)
  process.exit(1)
})
