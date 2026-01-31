import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        configured: !!process.env.DATABASE_URL,
        connected: false,
        error: null as string | null,
      },
      prisma: {
        available: false,
        error: null as string | null,
      },
    },
  }

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    health.status = 'error'
    health.checks.database.error = 'DATABASE_URL environment variable is not set'
    return res.status(500).json(health)
  }

  // Check Prisma client
  try {
    health.checks.prisma.available = true
  } catch (error) {
    health.status = 'error'
    health.checks.prisma.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    health.checks.database.connected = true
  } catch (error) {
    health.status = 'error'
    health.checks.database.connected = false
    health.checks.database.error = error instanceof Error ? error.message : 'Unknown error'
  }

  const statusCode = health.status === 'ok' ? 200 : 500
  return res.status(statusCode).json(health)
}
