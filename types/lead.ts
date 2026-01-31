export interface LeadSubmission {
  name: string
  email: string
  website?: string
}

export interface EnrichmentData {
  companyName?: string
  companySize?: string
  industry?: string
  country?: string
}

export interface Lead extends LeadSubmission {
  id: string
  companyName?: string
  companySize?: string
  industry?: string
  country?: string
  score: number
  qualified: boolean
  createdAt: string
  updatedAt: string
}

export interface LeadEnrichmentResponse {
  success: boolean
  data?: EnrichmentData
  error?: string
}
