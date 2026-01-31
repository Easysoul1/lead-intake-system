import { EnrichmentData, LeadEnrichmentResponse } from '@/types/lead'

/**
 * Enriches lead data using AnyMail Finder API
 * Documentation: https://anymailfinder.com/api-documentation
 * 
 * Note: This is a mock implementation that simulates the API behavior.
 * In production, you would need to:
 * 1. Sign up for an AnyMail Finder account
 * 2. Get an API key
 * 3. Use the actual API endpoint: https://api.anymailfinder.com/v4.0/search/person.json
 * 
 * The API typically requires:
 * - API key in headers: X-Api-Key
 * - Email parameter
 * - Returns company information, location, etc.
 */
export async function enrichLead(email: string): Promise<LeadEnrichmentResponse> {
  try {
    // In production, replace this with actual API call
    // const response = await fetch(`https://api.anymailfinder.com/v4.0/search/person.json?email=${encodeURIComponent(email)}`, {
    //   headers: {
    //     'X-Api-Key': process.env.ANYMAIL_FINDER_API_KEY || '',
    //   },
    // })

    // For this demo, we'll simulate API behavior with realistic delays and responses
    // This demonstrates proper error handling and async patterns
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    // Simulate occasional API failures (10% failure rate)
    if (Math.random() < 0.1) {
      throw new Error('API service temporarily unavailable')
    }

    // Simulate enrichment data based on email domain
    const domain = email.split('@')[1]?.toLowerCase() || ''
    
    // Mock enrichment data - in production this comes from the API
    const enrichmentData: EnrichmentData = {
      companyName: getCompanyNameFromDomain(domain),
      companySize: getRandomCompanySize(),
      industry: getIndustryFromDomain(domain),
      country: getCountryFromDomain(domain),
    }

    // Simulate partial data scenarios (30% chance of missing some fields)
    if (Math.random() < 0.3) {
      if (Math.random() < 0.5) delete enrichmentData.companySize
      if (Math.random() < 0.5) delete enrichmentData.industry
    }

    return {
      success: true,
      data: enrichmentData,
    }
  } catch (error) {
    // Gracefully handle API failures
    console.error('Enrichment API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Helper functions to simulate realistic enrichment data
function getCompanyNameFromDomain(domain: string): string {
  const domainMap: Record<string, string> = {
    'gmail.com': 'Personal Email',
    'yahoo.com': 'Personal Email',
    'outlook.com': 'Personal Email',
    'techcorp.com': 'TechCorp Inc.',
    'startup.io': 'Startup.io',
    'enterprise.com': 'Enterprise Solutions',
    'consulting.com': 'Consulting Group',
  }
  return domainMap[domain] || domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1) + ' Company'
}

function getRandomCompanySize(): string {
  const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  return sizes[Math.floor(Math.random() * sizes.length)]
}

function getIndustryFromDomain(domain: string): string {
  const industryMap: Record<string, string> = {
    'tech': 'Technology',
    'finance': 'Financial Services',
    'health': 'Healthcare',
    'edu': 'Education',
    'consulting': 'Consulting',
  }
  
  for (const [key, value] of Object.entries(industryMap)) {
    if (domain.includes(key)) return value
  }
  
  return 'General Business'
}

function getCountryFromDomain(domain: string): string {
  const countries = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'NL', 'SE']
  return countries[Math.floor(Math.random() * countries.length)]
}
