import { EnrichmentData } from '@/types/lead'

/**
 * Lead Scoring System
 * 
 * Scoring Rules:
 * - Has website: +10 points
 * - Company size 11-50: +20 points (optimal size for B2B)
 * - Country in US/UK/CA: +10 points (high-value markets)
 * - Missing enrichment data: -5 points per missing field
 * 
 * Qualification Threshold:
 * - Leads with score >= 20 are considered qualified
 * 
 * Rationale:
 * - Website indicates business maturity and digital presence
 * - 11-50 employees is the sweet spot for B2B sales (not too small, not too large)
 * - US/UK/CA are high-value markets with strong purchasing power
 * - Missing data suggests lower data quality or incomplete profiles
 */
export function calculateLeadScore(
  hasWebsite: boolean,
  enrichmentData?: EnrichmentData
): number {
  let score = 0

  // Website presence bonus
  if (hasWebsite) {
    score += 10
  }

  // Enrichment data scoring
  if (enrichmentData) {
    // Company size bonus (11-50 is optimal)
    if (enrichmentData.companySize === '11-50') {
      score += 20
    }

    // Country bonus (high-value markets)
    const highValueCountries = ['US', 'UK', 'CA']
    if (enrichmentData.country && highValueCountries.includes(enrichmentData.country)) {
      score += 10
    }

    // Penalty for missing enrichment fields
    const enrichmentFields = [
      enrichmentData.companyName,
      enrichmentData.companySize,
      enrichmentData.industry,
      enrichmentData.country,
    ]
    
    const missingFields = enrichmentFields.filter(field => !field).length
    score -= missingFields * 5
  } else {
    // No enrichment data at all - significant penalty
    score -= 20
  }

  // Ensure score doesn't go below 0
  return Math.max(0, score)
}

/**
 * Determines if a lead is qualified based on score
 */
export function isQualified(score: number): boolean {
  return score >= 20
}
