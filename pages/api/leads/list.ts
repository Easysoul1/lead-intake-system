import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { qualified, sortBy } = req.query

    // Build where clause
    const where: { qualified?: boolean } = {}
    if (qualified === 'true') {
      where.qualified = true
    }

    // Build orderBy clause
    const orderBy: { [key: string]: 'asc' | 'desc' } = {}
    if (sortBy === 'score') {
      orderBy.score = 'desc'
    } else {
      orderBy.createdAt = 'desc' // Default: newest first
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy,
    })

    return res.status(200).json({
      success: true,
      leads: leads.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        website: lead.website,
        companyName: lead.companyName,
        companySize: lead.companySize,
        industry: lead.industry,
        country: lead.country,
        score: lead.score,
        qualified: lead.qualified,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
