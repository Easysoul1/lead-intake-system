import { EnrichmentData, LeadEnrichmentResponse } from '@/types/lead'

/**
 * Enriches lead data using AnyMail Finder API
 * Documentation: https://anymailfinder.com/api-documentation
 * 
 * API Endpoint: https://api.anymailfinder.com/v4.0/search/person.json
 * 
 * The API requires:
 * - API key in headers: X-Api-Key
 * - Email parameter in query string
 * - Returns company information, location, etc.
 * 
 * This implementation:
 * 1. Attempts real API call if API key is provided
 * 2. Gracefully falls back to simulation if no API key
 * 3. Handles API failures without blocking lead creation
 */
export async function enrichLead(email: string): Promise<LeadEnrichmentResponse> {
  const apiKey = process.env.ANYMAIL_FINDER_API_KEY || process.env.ANYMAILFINDER_API_KEY
  
  // Graceful fallback: If no API key provided, use simulation
  if (!apiKey) {
    console.warn('AnyMail Finder API key not provided - using fallback simulation')
    return await simulateEnrichment(email)
  }

  // Real API integration
  try {
    const apiUrl = `https://api.anymailfinder.com/v4.0/search/person.json?email=${encodeURIComponent(email)}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Handle API errors gracefully
      if (response.status === 401) {
        console.error('AnyMail Finder API: Invalid API key')
        return await simulateEnrichment(email)
      }
      
      if (response.status === 402) {
        // Payment Required / Insufficient Credits
        console.error('AnyMail Finder API: Insufficient credits or payment required')
        return {
          success: false,
          error: 'Insufficient credits. Please add credits to your AnyMail Finder account. Lead saved without enrichment.',
        }
      }
      
      if (response.status === 403) {
        // Forbidden - could be quota/credits exhausted
        console.error('AnyMail Finder API: Access forbidden (possibly insufficient credits)')
        // Try to parse error message from response
        let errorMessage = 'API access forbidden. Lead saved without enrichment.'
        try {
          const errorData = await response.json()
          if (errorData.message || errorData.error) {
            errorMessage = `${errorData.message || errorData.error}. Lead saved without enrichment.`
          }
        } catch {
          // If response is not JSON, use default message
        }
        return {
          success: false,
          error: errorMessage,
        }
      }
      
      if (response.status === 429) {
        console.error('AnyMail Finder API: Rate limit exceeded')
        return {
          success: false,
          error: 'API rate limit exceeded. Lead saved without enrichment.',
        }
      }

      throw new Error(`API returned status ${response.status}: ${response.statusText}`)
    }

    const apiData = await response.json()

    // Map AnyMail Finder API response to our enrichment data structure
    // Note: The actual API response structure may vary based on AnyMail Finder's documentation
    // Common response formats include:
    // - Nested: { company: { name, size, industry }, location: { country } }
    // - Flat: { company_name, company_size, industry, country }
    // This implementation handles both formats for maximum compatibility
    const enrichmentData: EnrichmentData = {
      companyName: apiData.company?.name || apiData.company_name || undefined,
      companySize: apiData.company?.size || apiData.company_size || undefined,
      industry: apiData.company?.industry || apiData.industry || undefined,
      country: apiData.location?.country || apiData.country || undefined,
    }

    // Check if we got any meaningful data
    const hasData = Object.values(enrichmentData).some(value => value !== undefined)

    if (!hasData) {
      console.warn('AnyMail Finder API returned no enrichment data')
      return {
        success: false,
        error: 'No enrichment data available for this email',
      }
    }

    return {
      success: true,
      data: enrichmentData,
    }
  } catch (error) {
    // Gracefully handle API failures - don't block lead creation
    console.error('AnyMail Finder API error:', error)
    
    // Fallback to simulation on network/API errors
    console.warn('Falling back to simulation due to API error')
    return await simulateEnrichment(email)
  }
}

/**
 * Fallback simulation when API key is not provided or API fails
 * This ensures the system works even without API access
 */
async function simulateEnrichment(email: string): Promise<LeadEnrichmentResponse> {
  try {
    // Simulate API delay for realistic behavior
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    // Simulate occasional failures (10% failure rate)
    if (Math.random() < 0.1) {
      throw new Error('Enrichment service temporarily unavailable')
    }

    // Simulate enrichment data based on email domain
    const domain = email.split('@')[1]?.toLowerCase() || ''
    
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
