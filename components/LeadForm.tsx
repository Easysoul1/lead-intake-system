import { useState, FormEvent } from 'react'
import { LeadSubmission } from '@/types/lead'

interface LeadFormProps {
  onSubmit: (data: LeadSubmission) => Promise<void>
}

export default function LeadForm({ onSubmit }: LeadFormProps) {
  const [formData, setFormData] = useState<LeadSubmission>({
    name: '',
    email: '',
    website: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LeadSubmission, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validateField = (name: keyof LeadSubmission, value: string): string | null => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.length > 100) return 'Name must be less than 100 characters'
        return null
      case 'email':
        if (!value.trim()) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Invalid email format'
        return null
      case 'website':
        if (value && value.trim()) {
          try {
            new URL(value)
          } catch {
            return 'Invalid website URL format'
          }
        }
        return null
      default:
        return null
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof LeadSubmission]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    setSubmitError(null)
    setSubmitSuccess(false)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const error = validateField(name as keyof LeadSubmission, value)
    setErrors(prev => ({ ...prev, [name]: error || undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(false)

    // Validate all fields
    const newErrors: Partial<Record<keyof LeadSubmission, string>> = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key as keyof LeadSubmission, formData[key as keyof LeadSubmission] || '')
      if (error) {
        newErrors[key as keyof LeadSubmission] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        ...formData,
        website: formData.website?.trim() || undefined,
      })
      setSubmitSuccess(true)
      setFormData({ name: '', email: '', website: '' })
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit lead')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Submit New Lead</h2>
      
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            ✓ Lead submitted successfully! Check the dashboard to see the enriched data.
          </p>
        </div>
      )}

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
            placeholder="John Doe"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
            placeholder="john.doe@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
            Website <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input-field ${errors.website ? 'border-red-500' : ''}`}
            placeholder="https://example.com"
            disabled={isSubmitting}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Lead'
          )}
        </button>
      </form>
    </div>
  )
}
