import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { enrichLead } from '@/lib/enrichment'
import { calculateLeadScore, isQualified } from '@/lib/scoring'
import { leadSubmissionSchema } from '@/lib/validation'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set')
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'DATABASE_URL environment variable is not configured. Please set it in Vercel environment variables.',
    })
  }

  try {
    // Validate request body
    const validationResult = leadSubmissionSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      })
    }

    const { name, email, website } = validationResult.data

    // Check for duplicate email
    const existingLead = await prisma.lead.findUnique({
      where: { email },
    })

    if (existingLead) {
      return res.status(409).json({
        error: 'Duplicate email',
        message: 'A lead with this email already exists',
      })
    }

    // Attempt enrichment (non-blocking - lead will be saved even if enrichment fails)
    // Wrap in try-catch to ensure it never crashes the route
    let enrichmentResult
    let enrichmentData
    try {
      enrichmentResult = await enrichLead(email)
      enrichmentData = enrichmentResult.data
    } catch (enrichmentError) {
      // Log but don't fail - enrichment is optional
      console.error('Enrichment failed (non-blocking):', enrichmentError)
      enrichmentResult = {
        success: false,
        error: enrichmentError instanceof Error ? enrichmentError.message : 'Enrichment failed',
      }
      enrichmentData = undefined
    }

    // Calculate lead score
    const score = calculateLeadScore(!!website, enrichmentData)
    const qualified = isQualified(score)

    // Create lead record
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        website: website || null,
        companyName: enrichmentData?.companyName || null,
        companySize: enrichmentData?.companySize || null,
        industry: enrichmentData?.industry || null,
        country: enrichmentData?.country || null,
        score,
        qualified,
      },
    })

    return res.status(201).json({
      success: true,
      lead: {
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
      },
      enrichment: {
        success: enrichmentResult.success,
        attempted: true,
      },
    })
  } catch (error) {
    console.error('Error creating lead:', error)
    
    // Check if it's a database connection error
    if (error instanceof Error) {
      // Prisma error codes
      if (error.message.includes('Can\'t reach database server') || 
          error.message.includes('P1001') ||
          error.message.includes('P1000') ||
          error.message.includes('connection') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('ENOTFOUND')) {
        return res.status(500).json({
          error: 'Database connection error',
          message: 'Unable to connect to the database. Please check your DATABASE_URL environment variable in Vercel settings.',
        })
      }
      
      // Prisma schema/migration errors
      if (error.message.includes('P2021') || error.message.includes('does not exist')) {
        return res.status(500).json({
          error: 'Database schema error',
          message: 'Database tables do not exist. Please run migrations: npx prisma migrate deploy',
        })
      }
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
