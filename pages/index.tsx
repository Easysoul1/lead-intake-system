import { useState } from 'react'
import Layout from '@/components/Layout'
import LeadForm from '@/components/LeadForm'
import { LeadSubmission } from '@/types/lead'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: LeadSubmission) => {
    setError(null)
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('A lead with this email already exists')
        }
        throw new Error(result.error || 'Failed to submit lead')
      }

      // Success - form component will handle the success state
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit lead'
      setError(errorMessage)
      throw err
    }
  }

  return (
    <Layout>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Lead Intake & Qualification System
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Submit new leads to automatically enrich them with company data and calculate qualification scores.
        </p>
      </div>

      <LeadForm onSubmit={handleSubmit} />
    </Layout>
  )
}
